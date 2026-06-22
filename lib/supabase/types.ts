/**
 * Placeholder tipe database Supabase.
 *
 * Akan di-generate otomatis setelah skema DB (E2) diterapkan, via:
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 *
 * Untuk sekarang `Database` sengaja longgar agar build E1 lulus.
 */
export type Database = Record<string, unknown>
