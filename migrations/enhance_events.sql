-- Enhanced event presentation: brochure PDF, gallery images, stats bar
-- Applied to Supabase project vxmrvnmtauqqqjikhjbh on 2026-04-01

-- Events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS brochure_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_images text[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS stats jsonb;

-- Partner events table
ALTER TABLE partner_events ADD COLUMN IF NOT EXISTS brochure_url text;
ALTER TABLE partner_events ADD COLUMN IF NOT EXISTS gallery_images text[];
ALTER TABLE partner_events ADD COLUMN IF NOT EXISTS stats jsonb;
