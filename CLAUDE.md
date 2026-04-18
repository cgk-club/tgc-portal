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
Contact:        christian@thegatekeepers.club
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
  fiche/templates/            # 11 templates: Hospitality, RealEstate, Dining, Maker, Experience, Transport, WineEstate, Wellness, EventsSport, ArtsCulture, Default
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
Mapping lives in `lib/ficheTemplates.ts`. Updated 19 March 2026 after taxonomy cleanup.

| Template | Category Sub values |
|---|---|
| `hospitality` | Boutique Hotels, Luxury Hotels, Palace Hotels, Safari Lodges & Camps, Resort Hotels, Boutique Guesthouses, Bed & Breakfast, Vineyards Distilleries & Breweries |
| `real_estate` | Villas & Private Estates, Châteaux & Manor Houses, Apartments & City Residences, Land & Development, Property Management, Estate Agents |
| `dining` | Independent Restaurants, Fine Dining, Casual Dining, Private Chefs, Cafés & Patisseries, Beach Clubs & Pool Bars, Private Dining Experiences |
| `maker` | Traditional Crafts, Contemporary Design, Jewellery & Accessories, Fashion & Tailoring, Ceramics & Pottery, Glasswork, Textile & Weaving, Furniture & Cabinetry, Perfumery & Beauty, Food & Artisan Produce |
| `experience` | Cultural Tours & Guided Experiences, Adventure & Outdoor, Culinary Experiences & Classes, Photography Experiences, Music & Arts Experiences, Private Access & VIP Experiences, Safari & Wildlife |
| `transport` | Private Aviation, Commercial Aviation, Helicopter Services, Yacht Charters, Boat & River Cruises, Luxury Transfers, Car Rental, Luxury Car Rental, Rail & Train Travel, Chauffeur Services |
| `wine_estate` | Wine Estates & Domaines |
| `wellness` | Wellness & Spa Retreats, Wellness & Spa |
| `events_sport` | Event Venues, Event Production, Wedding Services, Golf, Equestrian, Water Sports, Skiing, Tennis |
| `arts_culture` | Galleries & Art Dealers, Museums & Cultural Institutions, Performing Arts, Auction Houses |
| `default` | Everything else (professional services, provisioning, etc.) |

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
- **Client auth:** Magic link via Resend, 7-day token expiry, 30-day session cookie
- **RLS:** Enabled on ALL 44 tables (security audit 28 Mar 2026). Admin tables use service-role-only access. Public read policies scoped to shared/live/published status. Client/partner INSERT policies enforce user_id = auth.uid().

---

## What Each Phase Built

- **Phase 1:** Fiche system + admin + Airtable connection + Railway deploy
- **Phase 2:** Itinerary builder + client view + PDF export
- **Phase 3A:** Maps + quote builder + mobile optimisation + cover images + quick wins
- **Phase 3B:** Client portal (magic link) + supplier outreach emails
- **Phase 4:** Typed fiche templates (hospitality/villa/dining/maker/default)
- **Phase 5:** Airtable webhook automation — auto-creates draft fiches from new orgs
- **Phase 6:** Six new fiche templates (experience, transport, wine estate, wellness, events/sport, arts/culture)
- **Phase 12 — Intelligence Suite (18 Apr 2026):** Three public intelligence tools at `/intelligence/[transport|realestate|wellness]`, plus landing page at `/intelligence`. Submit API at `/api/intelligence/submit` (Resend email to jeeves@ + client confirmation). lucide-react added.

---

## Intelligence Suite

Routes: `/intelligence`, `/intelligence/transport`, `/intelligence/realestate`, `/intelligence/wellness`

- **Transport:** 60 corridors (9 added 18 Apr: Monaco-Courchevel, Monaco-Sardinia, Paris-Bordeaux, London-Edinburgh, Barcelona-Ibiza, Palma-Ibiza, Athens-Santorini, Miami-Palm Beach, LA-Santa Barbara), asset economics calculator, localStorage journey saving
- **Real estate:** 31 markets, 3 mandate flows (acquire/dispose/retain), structuring screen (FR: ≥€1.3M, UK: ≥£2M, other: ≥€5M), mandate letter generator. Jez Moore (Tier 1 high-end), Keith Kirwen (Andalusia), Amélie Rigo exclusives (Occitanie). Off-market framing throughout.
- **Wellness:** 12 clinics, 6-question matching engine, annual programme economics calculator. Lanserhof marked TGC Active.
- **Submit API:** POST `/api/intelligence/submit` — accepts `{type, brief, client, corridor?, market?}`, sends formatted Resend email to jeeves@, sends confirmation to client.
- **Events + Art:** Coming soon (no pages yet)

Public lead magnet: `intelligence.thegatekeepers.club` should CNAME to `portal.thegatekeepers.club` (DNS not yet configured).

---

## Current State (update this section after each session)

*Last updated: 18 April 2026*

- Portal live at portal.thegatekeepers.club
- 11 fiche templates, transport + events sub-layouts
- Phase 5 webhook endpoint live
- Airtable Organizations table ID: `tblRiQuIfeQ34aN5L`
- Magic link auth: 7-day token expiry, 30-day session cookie
- Human-like typing effect on all chat modules (variable speed, typos, cursor)
- One-question-at-a-time chat flow across all prompts
- Client chat skips known details (email, name) for logged-in users
- Project dashboards: per-project (event hero, countdown, revenue, tasks) + list page (summary cards, deadlines)
- Per-partner visibility controls: 7 granular toggles (financials, tasks, docs, activity, guests, sponsors, budget)
- Task system: multi-partner assignment, priority, status tracking
- View separation enforced at API level (admin/partner/client)
- Event packages table (event_packages) + event guests table (event_guests)
- Project tasks table (project_tasks)
- Partner visibility settings column on project_partners
- Approvals + requests badges refresh instantly (custom event dispatch)
- Requests page has status workflow (new → contacted → quoted → confirmed → closed)
- Resend domain verified for thegatekeepers.club
- **Known Railway quirk:** Next.js server can cache a 404 for a fiche route even with `force-dynamic`. If a fiche 404s after publishing, redeploy to clear. `?preview=true` is the quick diagnostic (200 = DB fine, server cache issue).
- `.claude/` added to .gitignore — worktree files must never be committed

---

## Things That Must Not Change

- Airtable field name mappings (breaking change if modified)
- Supabase table names
- The `share_token` and `quote_token` URL patterns (clients may have saved links)
- `/fiche/[slug]` URL structure (may be shared with external parties)
- TGC brand colours and font choices
