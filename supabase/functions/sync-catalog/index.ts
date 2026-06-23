// RipIt — Edge Function: sync-catalog (ZUL-146).
// Pulls series/sets/cards from TCGdex and upserts them via the import_* RPCs
// (service_role only, see migration_002_import.sql). Triggered by pg_cron
// (see migration_005_catalog_sync_schedule.sql) or manually for backfill.
//
// Ethics constraint (architecture-and-security.md §Sinkronisasi Katalog):
// this is the ONLY place that talks to TCGdex — open_pack must never fetch
// live data, it only reads the local catalog tables.
//
// TCGdex v2 API shape notes (verified against the live API, not just docs):
// - GET /series, /sets (list endpoints) are brief — /sets has no `serie` field.
// - GET /sets/{id} (detail) has `serie: {id, name}` but its `cards` array is
//   ALSO brief (id, localId, name, image only) — no rarity/variants/illustrator.
// - Those only exist on GET /cards/{id} — one request per card, no bulk form.

import { createClient } from "npm:@supabase/supabase-js@2";

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en";
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 250;
const CARD_FETCH_CONCURRENCY = 4;
// Card detail is one HTTP request each, with no bulk endpoint. An Edge
// Function has a wall-clock execution limit, so a full first-time backfill
// must span many invocations. Cap total card-detail fetches per call; check
// `sets_remaining` in the response and keep calling until it's 0.
const DEFAULT_CARD_BUDGET = 200;

interface TcgdexSeries {
  id: string;
  name: string;
  logo?: string;
}

interface TcgdexSetListItem {
  id: string;
  name: string;
  logo?: string;
  cardCount?: { total?: number; official?: number };
}

interface TcgdexSetDetail {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  serie?: { id: string; name?: string };
  cardCount?: {
    total?: number;
    official?: number;
    holo?: number;
    reverse?: number;
    normal?: number;
  };
  releaseDate?: string;
  cards?: { id: string; localId: string; name: string; image?: string }[];
}

interface TcgdexCardDetail {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  illustrator?: string;
  variants?: {
    normal?: boolean;
    holo?: boolean;
    reverse?: boolean;
    firstEdition?: boolean;
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TCGdex asset URLs are directories — they need a quality + extension suffix.
function withImageQuality(url: string | undefined, ext: "png" | "webp" = "png") {
  if (!url) return null;
  if (/\.(png|webp|jpg|jpeg)$/i.test(url)) return url;
  return `${url}/high.${ext}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`TCGdex ${res.status} for ${url}`);
      }
      if (!res.ok) {
        throw new Error(`TCGdex error ${res.status} for ${url}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`failed to fetch ${url}`);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function mapSeriesPayload(series: TcgdexSeries[]) {
  return series.map((s) => ({
    id: s.id,
    name: s.name,
    logo_url: withImageQuality(s.logo),
  }));
}

function mapSetPayload(set: TcgdexSetDetail) {
  return [
    {
      id: set.id,
      series_id: set.serie?.id ?? null,
      name: set.name,
      logo_url: withImageQuality(set.logo),
      symbol_url: withImageQuality(set.symbol),
      count_official: set.cardCount?.official ?? 0,
      count_total: set.cardCount?.total ?? 0,
      count_holo: set.cardCount?.holo ?? 0,
      count_reverse: set.cardCount?.reverse ?? 0,
      count_normal: set.cardCount?.normal ?? 0,
      release_date: set.releaseDate ?? null,
    },
  ];
}

function mapCardPayload(setId: string, cards: TcgdexCardDetail[]) {
  return cards.map((c) => ({
    id: c.id,
    set_id: setId,
    local_id: c.localId,
    name: c.name,
    image_url: withImageQuality(c.image, "webp"),
    rarity_raw_en: c.rarity ?? null,
    has_normal: c.variants?.normal ?? false,
    has_holo: c.variants?.holo ?? false,
    has_reverse: c.variants?.reverse ?? false,
    illustrator: c.illustrator ?? null,
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const expectedSecret = Deno.env.get("SYNC_CATALOG_SECRET");
  const authHeader = req.headers.get("authorization") ?? "";
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { force?: boolean; setIds?: string[]; cardBudget?: number } = {};
  try {
    const raw = await req.text();
    if (raw) body = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ error: "invalid json body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const errors: { set_id?: string; message: string }[] = [];

  // ── Series ────────────────────────────────────────────────────────────
  const series = await fetchJson<TcgdexSeries[]>(`${TCGDEX_BASE}/series`);
  const { error: seriesErr } = await supabase.rpc("import_series", {
    p_payload: mapSeriesPayload(series),
  });
  if (seriesErr) errors.push({ message: `import_series: ${seriesErr.message}` });

  // ── Sets list (brief — only used to pick which sets need work) ───────
  const setList = await fetchJson<TcgdexSetListItem[]>(`${TCGDEX_BASE}/sets`);

  const { data: existingSets } = await supabase
    .from("sets")
    .select("id, count_total");
  const existingCountBySetId = new Map<string, number>(
    (existingSets ?? []).map((row: { id: string; count_total: number }) => [
      row.id,
      row.count_total,
    ]),
  );

  const candidateSets = body.setIds?.length
    ? setList.filter((s) => body.setIds!.includes(s.id))
    : setList;

  const pendingSets = candidateSets.filter((s) => {
    const unchanged =
      !body.force && existingCountBySetId.get(s.id) === (s.cardCount?.total ?? 0);
    return !unchanged;
  });
  const setsSkipped = candidateSets.length - pendingSets.length;

  // ── Process sets until the card-fetch budget for this invocation runs out ─
  const cardBudget = body.cardBudget ?? DEFAULT_CARD_BUDGET;
  let cardBudgetLeft = cardBudget;
  let setsProcessed = 0;
  let cardsImported = 0;
  let setsRemaining = 0;

  for (let i = 0; i < pendingSets.length; i++) {
    const setBrief = pendingSets[i];

    let detail: TcgdexSetDetail;
    try {
      detail = await fetchJson<TcgdexSetDetail>(`${TCGDEX_BASE}/sets/${setBrief.id}`);
    } catch (err) {
      errors.push({
        set_id: setBrief.id,
        message: err instanceof Error ? err.message : "unknown fetch error",
      });
      continue;
    }

    const cardBriefs = detail.cards ?? [];

    // Don't start a set we can't finish this invocation — leave it (and
    // everything after it) for the next call so a set never imports partially.
    if (setsProcessed > 0 && cardBriefs.length > cardBudgetLeft) {
      setsRemaining = pendingSets.length - i;
      break;
    }

    const { error: setErr } = await supabase.rpc("import_sets", {
      p_payload: mapSetPayload(detail),
    });
    if (setErr) {
      errors.push({ set_id: setBrief.id, message: `import_sets: ${setErr.message}` });
      continue;
    }

    if (cardBriefs.length > 0) {
      const cardDetails = await mapWithConcurrency(
        cardBriefs,
        CARD_FETCH_CONCURRENCY,
        async (c) => {
          try {
            return await fetchJson<TcgdexCardDetail>(`${TCGDEX_BASE}/cards/${c.id}`);
          } catch (err) {
            errors.push({
              set_id: setBrief.id,
              message: `card ${c.id}: ${err instanceof Error ? err.message : "fetch failed"}`,
            });
            return null;
          }
        },
      );
      const fetchedCards = cardDetails.filter((c): c is TcgdexCardDetail => c !== null);
      cardBudgetLeft -= cardBriefs.length;

      if (fetchedCards.length > 0) {
        const { error: cardsErr } = await supabase.rpc("import_cards", {
          p_payload: mapCardPayload(setBrief.id, fetchedCards),
        });
        if (cardsErr) {
          errors.push({ set_id: setBrief.id, message: `import_cards: ${cardsErr.message}` });
        } else {
          cardsImported += fetchedCards.length;
        }
      }
    }

    setsProcessed++;

    if (cardBudgetLeft <= 0 && i + 1 < pendingSets.length) {
      setsRemaining = pendingSets.length - i - 1;
      break;
    }
  }

  // ── Visibility into rarity mapping gaps (read-only, service_role) ────
  const { data: unmapped } = await supabase.rpc("unmapped_rarities");

  return new Response(
    JSON.stringify({
      series_count: series.length,
      sets_count: setList.length,
      sets_processed: setsProcessed,
      sets_skipped: setsSkipped,
      sets_remaining: setsRemaining,
      cards_imported: cardsImported,
      unmapped_rarities: unmapped ?? [],
      errors,
    }),
    { headers: { "content-type": "application/json" }, status: errors.length ? 207 : 200 },
  );
});
