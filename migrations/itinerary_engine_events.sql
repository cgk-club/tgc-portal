-- Itinerary Engine v2, phase 1: events run from phones (Paris Fashion Week SS27).
-- Applied 14/September/2026 as migration `itinerary_engine_events`.
--
-- itinerary_items is readable with the public key for a shared itinerary, so it
-- only gains what a client may see. Driver, phone numbers, passengers, guests,
-- the team and the change log live in new tables with RLS on, NO policies and
-- no anon/authenticated grants: only the service role (the server) reads them.

-- Itineraries: what shape this is, and the per-event switches.
alter table public.itineraries
  add column if not exists kind text not null default 'trip' check (kind in ('trip', 'event', 'programme')),
  add column if not exists event_settings jsonb not null default '{"guest_call_sheets": false, "client_view": "summary"}'::jsonb;

-- Items: a status and a visibility on every line, plus place and end time.
alter table public.itinerary_items
  add column if not exists status text not null default 'planned'
    check (status in ('planned', 'requested', 'confirmed', 'paid', 'changed', 'done', 'cancelled')),
  add column if not exists visibility text not null default 'client' check (visibility in ('team', 'client', 'guests')),
  add column if not exists end_time time,
  add column if not exists location text,
  add column if not exists location_confirmed boolean not null default false,
  add column if not exists changed_at timestamptz;

-- Team-only lines never leave through the public key. Same rule as before, plus the visibility filter.
drop policy if exists "Public can read shared itinerary items" on public.itinerary_items;
create policy "Public can read shared itinerary items" on public.itinerary_items
  for select using (
    visibility <> 'team'
    and day_id in (
      select itinerary_days.id from public.itinerary_days
      where itinerary_days.itinerary_id in (select itineraries.id from public.itineraries where itineraries.status = 'shared')
    )
  );

-- Staff are partner accounts with a staff role (ruled 14/September/2026).
alter table public.partner_accounts
  add column if not exists account_type text not null default 'partner' check (account_type in ('partner', 'staff'));

create table if not exists public.itinerary_item_logistics (
  item_id uuid primary key references public.itinerary_items(id) on delete cascade,
  pickup_place text,
  dropoff_place text,
  vehicle text,
  driver_name text,
  driver_phone text,
  venue_contact text,
  covers integer check (covers is null or covers >= 0),
  internal_note text,
  owner_partner_id uuid references public.partner_accounts(id) on delete set null,
  audience_mode text not null default 'all' check (audience_mode in ('all', 'selected')),
  audience_groups text[] not null default '{}',
  audience_guest_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.itinerary_guests (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  email text,
  phone text,
  group_label text,
  dietary text,
  arrival text,
  departure text,
  hotel text,
  room text,
  notes text,
  call_sheet_token text unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists itinerary_guests_itinerary_idx on public.itinerary_guests (itinerary_id);

create table if not exists public.itinerary_team (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  partner_id uuid not null references public.partner_accounts(id) on delete cascade,
  can_see_guest_contacts boolean not null default false,
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now(),
  unique (itinerary_id, partner_id)
);
create index if not exists itinerary_team_partner_idx on public.itinerary_team (partner_id);

create table if not exists public.itinerary_changes (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  item_id uuid references public.itinerary_items(id) on delete set null,
  created_at timestamptz not null default now(),
  actor_type text not null check (actor_type in ('admin', 'partner')),
  actor_name text,
  summary text not null,
  team_message text,
  guest_message text,
  affected_guest_ids uuid[] not null default '{}',
  seen_by uuid[] not null default '{}',
  admin_seen boolean not null default false
);
create index if not exists itinerary_changes_itinerary_idx on public.itinerary_changes (itinerary_id, created_at desc);

alter table public.itinerary_item_logistics enable row level security;
alter table public.itinerary_guests enable row level security;
alter table public.itinerary_team enable row level security;
alter table public.itinerary_changes enable row level security;

revoke all on table public.itinerary_item_logistics from anon, authenticated;
revoke all on table public.itinerary_guests from anon, authenticated;
revoke all on table public.itinerary_team from anon, authenticated;
revoke all on table public.itinerary_changes from anon, authenticated;
