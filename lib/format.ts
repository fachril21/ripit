const numberFormatter = new Intl.NumberFormat('id-ID')

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}
