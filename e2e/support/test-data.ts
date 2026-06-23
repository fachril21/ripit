/**
 * Generates a unique throwaway test email so each run is isolated and
 * avoids colliding with real accounts in the connected Supabase project.
 */
export function uniqueTestEmail(prefix = 'e2e'): string {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 100000)}`
  return `${prefix}+${stamp}@example.com`
}

export function uniqueUsername(prefix = 'e2euser'): string {
  const stamp = Date.now().toString(36)
  return `${prefix}${stamp}`.slice(0, 20)
}

export const VALID_PASSWORD = 'Passw0rd123'
