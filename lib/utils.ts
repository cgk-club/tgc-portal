export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Strip PostgREST filter metacharacters from user search input before interpolation
// into .or() strings. Commas split conditions; parens/backslash enable injection.
// Dots and @ are preserved so email searches work.
export function sanitizeSearch(input: string): string {
  return input.replace(/[,()\\]/g, '').trim().slice(0, 100)
}

// Strip em dashes from all client-facing text. TGC brand rule: never use em dashes.
// " — " (space em dash space) → ", " for inline prose and titles
// "—" (bare) → "-" as a safe fallback
// Apply to every text field before writing to the DB.
export function sanitizeText<T extends string | null | undefined>(input: T): T {
  if (!input) return input
  return input.replace(/ — /g, ', ').replace(/—/g, '-') as T
}

export function relativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}
