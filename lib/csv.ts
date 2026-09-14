// A small CSV reader for pasting a guest list from a spreadsheet. Handles quoted
// fields, doubled quotes, commas or semicolons (French Excel exports use ";"),
// tabs (a straight copy from Google Sheets), and header names in plain words.
import type { GuestInput } from '@/lib/events'

function detectDelimiter(firstLine: string): string {
  const counts: [string, number][] = [
    ['\t', (firstLine.match(/\t/g) || []).length],
    [';', (firstLine.match(/;/g) || []).length],
    [',', (firstLine.match(/,/g) || []).length],
  ]
  counts.sort((a, b) => b[1] - a[1])
  return counts[0][1] > 0 ? counts[0][0] : ','
}

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const delimiter = detectDelimiter(src.split('\n', 1)[0] || '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"' && field === '') quoted = true
    else if (c === delimiter) { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.map((r) => r.map((f) => f.trim())).filter((r) => r.some(Boolean))
}

const HEADERS: Record<string, keyof GuestInput> = {
  name: 'name', 'full name': 'name', guest: 'name', 'guest name': 'name', nom: 'name',
  email: 'email', 'e-mail': 'email', mail: 'email',
  phone: 'phone', mobile: 'phone', whatsapp: 'phone', telephone: 'phone', 'téléphone': 'phone', tel: 'phone',
  group: 'group_label', 'group label': 'group_label', groupe: 'group_label',
  dietary: 'dietary', diet: 'dietary', allergies: 'dietary', 'dietary requirements': 'dietary',
  arrival: 'arrival', arrives: 'arrival', departure: 'departure', departs: 'departure',
  hotel: 'hotel', room: 'room', notes: 'notes', note: 'notes',
}

// First row is a header if any cell names a known column; otherwise columns are
// read as name, email, phone, group.
export function guestsFromCsv(text: string): { rows: GuestInput[]; unknownColumns: string[] } {
  const table = parseCsv(text)
  if (!table.length) return { rows: [], unknownColumns: [] }
  const first = table[0].map((h) => h.toLowerCase())
  const hasHeader = first.some((h) => h in HEADERS)
  const columns: (keyof GuestInput | null)[] = hasHeader
    ? first.map((h) => HEADERS[h] || null)
    : ['name', 'email', 'phone', 'group_label']
  const unknownColumns = hasHeader ? table[0].filter((_, i) => !columns[i]) : []
  const body = hasHeader ? table.slice(1) : table
  const rows = body.map((cells) => {
    const g: GuestInput = {}
    columns.forEach((col, i) => { if (col && cells[i]) g[col] = cells[i] })
    return g
  })
  return { rows: rows.filter((g) => g.name), unknownColumns }
}
