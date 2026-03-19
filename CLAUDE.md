# TGC Portal — Project Memory
*Claude Code reads this file automatically at the start of every session.*
*Keep it current. Update it when significant changes are made.*

---

## What This Project Is

The Gatekeepers Club (TGC) Itinerary Portal — a Next.js 14 web application deployed at `portal.thegatekeepers.club`. Built for Christian de Jabrun, founder of TGC, a quiet luxury concierge service based in the South of France.

**Two surfaces:**
1. **Admin** (`/admin`) — password-protected, for Christian only. Manage fiches, build itineraries, generate quotes, manage clients, send supplier outreach.
2. **Public** — fiche pages (`/fiche/[slug]`), itinerary pages (`/itinerary/[shareToken]`), quote pages (`/quote/[quoteToken]`), client portal (`/client`).

---

## Tech Stack

```
Next.js 14 (App Router, TypeScript)
Tailwind CSS (TGC brand tokens configured)
Supabase (Postgres + Storage)
Airtable API (read-only source of truth, ~1,200+ org records)
Resend (transactional email)
Leaflet + OpenStreetMap (maps, no API key needed)
@react-pdf/renderer (PDF generation)
Railway (deployment, auto-deploys from GitHub on push)
```

**Deployed at:** `portal.thegatekeepers.club`
**GitHub:** `github.com/cgk-club/tgc-portal`
**Supabase project:** `vxmrvnmtauqqqjikhjbh.supabase.co`

---

## Brand Constants

```
Primary green:  #0e4f51
Gold:           #c8aa4a
Background:     #F9F8F5 (pearl white)
Headings:       Poppins
Body:           Lato
Border radius:  8px cards, 4px inputs
NEVER:          Black backgrounds, em dashes, "exceptional/outstanding/world-class"
Contact:        hello@thegatekeepers.club
```

---

## Environment Variables

All set in Railway and in `~/.tgc-portal/.env.local`:
```
AIRTABLE_API_KEY
AIRTABLE_BASE_ID=app23Nd0wKEbMGW7p
NEXT_PUBLIC_SUPABASE_URL=https://vxmrvnmtauqqqjikhjbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
NEXT_PUBLIC_APP_URL=https://portal.thegatekeepers.club
RESEND_API_KEY
FROM_EMAIL=jeeves@thegatekeepers.club
AIRTABLE_WEBHOOK_SECRET  (set after running setup-airtable-webhook.mjs)
```

---

## Airtable Schema (Organizations table)

Key field names — use exactly these strings:
```
"Organization Name"   → name
"Organization Type"   → category (generic: "Supplier")
"Category Parent"     → categoryParent
"Category Sub"        → categorySub (specific: "Boutique Hotels", "Restaurants" etc.)
"Country"             → country
"City"                → city
"Website"             → website
"Email General"       → email
"Phone General"       → phone
```

**Critical:** Airtable field names have changed from assumed defaults.
Never use "Name", "Category", "Email", "Phone" — always use the full field names above.

---

## Supabase Tables

```
fiches                  — enriched supplier presentation layer
itineraries             — client itinerary records
itinerary_days          — day structure within itinerary
itinerary_items         — fiche or note items within a day
client_accounts         — client portal accounts
magic_tokens            — magic link auth tokens
outreach_log            — supplier outreach email log
webhook_log             — Airtable webhook audit log
```

**Key columns added across phases (always use IF NOT EXISTS):**
- `fiches`: hero_image_url, headline, description, highlights, gallery_urls, tags, status, slug, template_type, template_fields, show_price, price_display, latitude, longitude, geocoded_at
- `itinerary_items`: item_type, exact_time, unit_price, quantity, is_zero_margin, is_included
- `itineraries`: start_date, cover_image_url, is_member, quote_status, quote_token, client_email, client_account_id

**Storage bucket:** `fiche-images` (public read)

---

## File Structure

```
app/
  admin/(dashboard)/          # Admin shell with sidebar
    fiches/                   # Fiche list + editor
    itineraries/              # Itinerary list + builder
    clients/                  # Client account management
  fiche/[slug]/               # Public fiche page (template-aware)
  itinerary/[shareToken]/     # Public client itinerary view
  quote/[quoteToken]/         # Public quote view
  client/                     # Client portal (magic link auth)
  api/admin/                  # Admin API routes
  api/itinerary/              # Public itinerary API
  api/geocode/                # Nominatim geocoding proxy

components/
  fiche/templates/            # HospitalityFiche, VillaFiche, DiningFiche, MakerFiche, DefaultFiche
  admin/template-fields/      # Per-template admin field components
  itinerary/                  # Builder components
  client/                     # Client-facing itinerary components
  client-portal/              # Client portal components
  maps/                       # FicheMap, ItineraryMap (Leaflet, SSR disabled)
  quote/                      # QuotePanel, QuotePDF

lib/
  airtable.ts                 # Airtable API client (read-only)
  supabase.ts                 # Supabase client (server + browser)
  itineraries.ts              # Itinerary CRUD functions
  ficheTemplates.ts           # Category → template mapping
  auth.ts                     # Admin cookie session
  utils.ts                    # slugify, formatDate etc.
```

---

## Fiche Template System

Templates are auto-detected from Airtable `Category Sub` on fiche creation.
Mapping lives in `lib/ficheTemplates.ts`.

| Template | Maps to |
|---|---|
| `hospitality` | Boutique Hotels, Luxury Hotels, Lodges, Palaces |
| `villa` | Villas, Estates, Chateaux, Private Residences |
| `dining` | Restaurants, Chefs, Private Dining |
| `maker` | Artisans, Designers, Craftspeople |
| `default` | Everything else |

Template-specific data stored in `template_fields` JSONB column.
Manual override available in admin fiche editor.

---

## TGC Pricing Logic (Quote Builder)

```
Planning fee tiers (on commissionable total):
  < €50k:        5%
  €50–100k:      4%
  €100–250k:     3%
  €250–500k:     2%
  €500k–€1M:     1.5%
  > €1M:         negotiate

Minimum fee: €500
Members: zero fee
Flights + restaurant reservations: zero margin (pass-through only)
Points: 0.5pt/€1 (non-member), 1pt/€1 (member). 100pts = €1.
Fee is DEDUCTED from budget, never added on top.
Never show planning fee as a line item on client-facing documents.
```

---

## Deployment

Every `git push` to `main` auto-deploys to Railway.
Build uses Docker with `--legacy-peer-deps` flag (required for react-leaflet).
Server binds to `0.0.0.0` and `process.env.PORT` (Railway requirement — set in Dockerfile).

```bash
# Standard deploy
cd ~/tgc-portal
git add .
git commit -m "Description"
git push
```

---

## Known Issues & Decisions

- **react-leaflet peer dependency:** Dockerfile uses `npm ci --legacy-peer-deps` — do not remove this flag
- **Leaflet + SSR:** All map components use `dynamic(() => import(...), { ssr: false })` — never import Leaflet directly in server components
- **Airtable write-back:** Generally read-only. Exception: outreach emails write a record to the Interactions table
- **Admin auth:** Simple HTTP-only cookie session, no OAuth. Single operator tool.
- **Client auth:** Magic link via Resend, 24h token expiry, 30-day session cookie
- **RLS:** Disabled on most tables (single operator). Public read policies exist on `itineraries`, `itinerary_days`, `itinerary_items` for shared itinerary access

---

## What Each Phase Built

- **Phase 1:** Fiche system + admin + Airtable connection + Railway deploy
- **Phase 2:** Itinerary builder + client view + PDF export
- **Phase 3A:** Maps + quote builder + mobile optimisation + cover images + quick wins
- **Phase 3B:** Client portal (magic link) + supplier outreach emails
- **Phase 4:** Typed fiche templates (hospitality/villa/dining/maker/default)
- **Phase 5:** Airtable webhook automation — auto-creates draft fiches from new orgs

---

## Current State (update this section after each session)

*Last updated: 19 March 2026*

- Portal live at portal.thegatekeepers.club
- 1 live fiche: Airelles Versailles Le Grand Controle (hospitality template)
- Phase 4 templates deployed — fiche editor shows template-specific fields
- Phase 5 webhook endpoint built — needs webhook_log table + Airtable webhook registration
- Airtable Organizations table ID: `tblRiQuIfeQ34aN5L`
- Admin dashboard: Fiche Inbox card + enrichment scores on fiche list
- Client portal operational — magic link auth via jeeves@thegatekeepers.club
- Resend domain verified for thegatekeepers.club

---

## Things That Must Not Change

- Airtable field name mappings (breaking change if modified)
- Supabase table names
- The `share_token` and `quote_token` URL patterns (clients may have saved links)
- `/fiche/[slug]` URL structure (may be shared with external parties)
- TGC brand colours and font choices
