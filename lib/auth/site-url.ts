import 'server-only'
import { headers } from 'next/headers'

/**
 * Base URL tepercaya untuk redirect OAuth & email confirm.
 * Prioritaskan NEXT_PUBLIC_SITE_URL (env server-controlled) — JANGAN andalkan
 * header `Origin`/`Host` dari request karena bisa dipalsukan klien (open redirect).
 * Fallback ke header `origin` hanya kalau env belum diisi (dev lokal).
 */
export async function getTrustedSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  return (await headers()).get('origin') ?? 'http://localhost:3000'
}
