# TGC Itinerary Portal

The Gatekeepers Club Itinerary Portal is a branded web application for managing and presenting supplier fiches and client itineraries. It combines Airtable (source of truth for organizations) with Supabase (enrichment layer for presentation data) in a single Next.js application.

## Local Setup

```bash
git clone <repo-url>
cd tgc-portal
cp .env.example .env.local
# Fill in the values in .env.local (see below)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the portal. The root URL redirects to the admin login.

## Environment Variables

| Variable | Description |
|---|---|
| `AIRTABLE_API_KEY` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Airtable base ID for "Gatekeepers Central" |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ADMIN_PASSWORD` | Password for the admin portal |
| `ADMIN_SESSION_SECRET` | Secret used to sign session JWTs |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (for link copying) |

## Supabase Setup

1. Create a new Supabase project
2. Run the schema SQL in `schema.sql` via the Supabase SQL Editor
3. Create a Storage bucket called `fiche-images` with public read access

## Airtable Field Mapping

The portal reads from an "Organizations" table in Airtable. Expected fields:

- **Name** (single line text)
- **Category** (single select or text, e.g. "Hotel", "Restaurant", "Artisan")
- **Country** (single line text)
- **Region** (single line text)
- **City** (single line text)
- **Website** (URL)
- **Phone** (phone)
- **Email** (email)
- **Tags** (multi-select, optional)

To adjust field names, edit the `mapRecord` function in `lib/airtable.ts`.

## Railway Deployment

1. Connect your repository to Railway
2. Set all environment variables from `.env.example`
3. Railway will auto-detect the Dockerfile and deploy

## Admin Access

Navigate to `/admin` and enter the password set in `ADMIN_PASSWORD`. Sessions last 7 days.
