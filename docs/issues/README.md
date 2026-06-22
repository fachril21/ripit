# RipIt — Epics / Issues Index

Sumber: Linear team **Zulfidar (ZUL)**, project *RipIt — Pokémon TCG Pack Opening Simulator*.

## Fase 1 — MVP

| Epic | Issue | File | Priority | Depends on |
| -- | -- | -- | -- | -- |
| E1 | ZUL-143 | [Foundation & Infrastructure](./E1-ZUL-143-foundation-infrastructure.md) | High | — |
| E2 | ZUL-144 | [Database Schema & Migrations](./E2-ZUL-144-database-schema-migrations.md) | High | E1 |
| E3 | ZUL-145 | [Authentication & Onboarding](./E3-ZUL-145-authentication-onboarding.md) | High | E2 |
| E4 | ZUL-146 | [TCGdex Catalog Sync](./E4-ZUL-146-tcgdex-catalog-sync.md) | High | E2 |
| E5 | ZUL-147 | [Economy & Daily Loop](./E5-ZUL-147-economy-daily-loop.md) | High | E3 |
| E6 | ZUL-148 | [Pack Opening](./E6-ZUL-148-pack-opening.md) | High | E4, E5 |
| E7 | ZUL-149 | [Reveal Experience](./E7-ZUL-149-reveal-experience.md) | High | E6 |
| E8 | ZUL-150 | [Collection & Binder](./E8-ZUL-150-collection-binder.md) | High | E6 |
| E9 | ZUL-151 | [Duplicates, Dust & Crafting](./E9-ZUL-151-duplicates-dust-crafting.md) | Medium | E8 |
| E10 | ZUL-152 | [Missions](./E10-ZUL-152-missions.md) | Medium | E6 |
| E11 | ZUL-153 | [Leaderboard](./E11-ZUL-153-leaderboard.md) | Medium | E8 |
| E12 | ZUL-154 | [Share Pull](./E12-ZUL-154-share-pull.md) | Medium | E7 |
| E13 | ZUL-155 | [Cosmetics & Rewards](./E13-ZUL-155-cosmetics-rewards.md) | Low | E8 |
| E14 | ZUL-156 | [Hardening, QA & Launch](./E14-ZUL-156-hardening-qa-launch.md) | Medium | E6–E13 |

## Fase 2 — Trading & Sosial

| Epic | Issue | File | Priority | Depends on |
| -- | -- | -- | -- | -- |
| E15 | ZUL-157 | [Trading / Auction House](./E15-ZUL-157-trading-auction-house.md) | Medium | E14, E9 |

## Build order (dependency-respecting)

```
E1 → E2 → ┬→ E3 → E5 ─┐
          └→ E4 ───────┴→ E6 → ┬→ E7 → E12
                               ├→ E8 → ┬→ E9
                               │       ├→ E11
                               │       └→ E13
                               └→ E10
E6–E13 → E14 → E15 (Fase 2)
```
