-- HomeBuyerCheck.co.uk Supabase schema.
-- Run via Supabase SQL editor or `supabase db push`.

-- Profiles (Supabase auth handles auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  email text not null,
  created_at timestamptz default now()
);

-- Properties (canonical record per UPRN/address)
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  uprn bigint unique,
  postcode text not null,
  paon text,
  saon text,
  address_line_1 text not null,
  town text,
  lat numeric(10,7),
  lng numeric(10,7),
  created_at timestamptz default now()
);
create index if not exists idx_properties_postcode on properties(postcode);
create index if not exists idx_properties_uprn on properties(uprn);

-- Reports (every paid purchase is a report)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  property_id uuid references properties(id),
  tier text check (tier in ('standard', 'premium')),
  status text check (status in ('pending', 'processing', 'ready', 'failed')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  customer_email text,
  amount_paid integer,            -- pence
  data jsonb,
  pdf_url text,
  email_sent boolean default false,
  created_at timestamptz default now(),
  ready_at timestamptz
);
create index if not exists idx_reports_user on reports(user_id);
create index if not exists idx_reports_session on reports(stripe_session_id);
create index if not exists idx_reports_property on reports(property_id);

-- HM Land Registry Price Paid (loaded from monthly CSV)
create table if not exists price_paid (
  transaction_id text primary key,
  price integer not null,
  transfer_date date not null,
  postcode text not null,
  property_type char(1),          -- D/S/T/F/O
  new_build boolean,
  tenure char(1),                 -- F/L
  paon text,
  saon text,
  street text,
  locality text,
  town text,
  district text,
  county text
);
create index if not exists idx_price_paid_postcode on price_paid(postcode);
create index if not exists idx_price_paid_paon on price_paid(postcode, paon);
create index if not exists idx_price_paid_date on price_paid(transfer_date desc);

-- Council tax (pre-cached batch, refreshed quarterly)
create table if not exists council_tax_bands (
  id bigserial primary key,
  postcode text not null,
  paon text,
  authority text,
  band text check (band in ('A','B','C','D','E','F','G','H')),
  band_d_amount integer,          -- pence/year? store £ as integer
  refreshed_at timestamptz default now()
);
create index if not exists idx_ct_postcode on council_tax_bands(postcode);

-- Schools (GIAS bulk, refreshed nightly)
create table if not exists schools (
  urn integer primary key,
  name text not null,
  type_of_establishment text,
  ofsted_rating text,
  age_low integer,
  age_high integer,
  postcode text,
  lat numeric(10,7),
  lng numeric(10,7),
  refreshed_at timestamptz default now()
);
create index if not exists idx_schools_geo on schools(lat, lng);

-- Ofcom broadband + mobile
create table if not exists ofcom_broadband (
  postcode text primary key,
  max_download_mbps integer,
  max_upload_mbps integer,
  fttp_available boolean,
  average_download_mbps integer,
  refreshed_at timestamptz default now()
);
create table if not exists ofcom_mobile (
  id bigserial primary key,
  postcode text not null,
  network text check (network in ('EE','O2','Vodafone','Three')),
  voice_4g text,
  data_4g text,
  data_5g text,
  refreshed_at timestamptz default now()
);
create index if not exists idx_mobile_postcode on ofcom_mobile(postcode);

-- Premium flags (cached spatial layers)
create table if not exists listed_buildings (
  id bigserial primary key,
  list_entry text,
  name text,
  grade text,
  lat numeric(10,7),
  lng numeric(10,7),
  entry_url text
);
create index if not exists idx_listed_geo on listed_buildings(lat, lng);

create table if not exists conservation_areas (
  id bigserial primary key,
  name text,
  authority text,
  postcodes text[]
);
create index if not exists idx_ca_postcodes on conservation_areas using gin(postcodes);

create table if not exists tree_preservation_orders (
  id bigserial primary key,
  reference text,
  authority text,
  lat numeric(10,7),
  lng numeric(10,7)
);
create index if not exists idx_tpo_geo on tree_preservation_orders(lat, lng);

create table if not exists radon_bands (
  postcode text primary key,
  band integer check (band between 1 and 5)
);

create table if not exists coal_reporting_areas (
  id bigserial primary key,
  area_name text,
  lat numeric(10,7),
  lng numeric(10,7)
);
create index if not exists idx_coal_geo on coal_reporting_areas(lat, lng);

-- Cross-site analytics tables (shared with CommandCenter — same schema as CCC)
create table if not exists searches (
  id bigserial primary key,
  site_id text not null,
  search_query text,
  result_found boolean,
  geo_city text,
  geo_region text,
  geo_country text,
  created_at timestamptz default now()
);
create index if not exists idx_searches_site_created on searches(site_id, created_at desc);

create table if not exists conversion_events (
  id bigserial primary key,
  site_id text not null,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_conversions_site_created on conversion_events(site_id, created_at desc);

create table if not exists pageviews (
  id bigserial primary key,
  site_id text not null,
  path text not null,
  referrer text,
  geo_city text,
  geo_region text,
  geo_country text,
  device_type text,
  created_at timestamptz default now()
);
create index if not exists idx_pageviews_site_created on pageviews(site_id, created_at desc);

-- Stripe webhook log
create table if not exists stripe_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz default now()
);

-- API response cache (used by adapters that lack server-side caching)
create table if not exists api_cache (
  cache_key text primary key,
  data jsonb not null,
  expires_at timestamptz not null
);
create index if not exists idx_api_cache_expires on api_cache(expires_at);

-- Lease (OC2) order queue — manually fulfilled by operator from HMLR portal
create table if not exists lease_orders (
  id bigserial primary key,
  report_id uuid references reports(id) on delete cascade,
  stripe_session_id text not null,
  status text not null default 'pending', -- pending | ready | failed
  customer_email text not null,
  full_address text,
  postcode text not null,
  title_number text,
  document_url text,
  fulfilled_by text,
  ordered_at timestamptz default now(),
  fulfilled_at timestamptz,
  note text
);
create index if not exists idx_lease_orders_status on lease_orders(status, ordered_at);
create index if not exists idx_lease_orders_session on lease_orders(stripe_session_id);

-- Storage bucket for lease PDFs (run once manually in Supabase SQL editor):
-- insert into storage.buckets (id, name, public) values ('lease-pdfs', 'lease-pdfs', false);

-- EWS1 cladding-check order queue (manually fulfilled by operator from BSR HRB + FIA + BSP portals)
create table if not exists ews1_orders (
  id bigserial primary key,
  report_id uuid references reports(id) on delete cascade,
  stripe_session_id text not null,
  status text not null default 'pending', -- pending | ready | failed
  customer_email text not null,
  full_address text,
  postcode text not null,
  building_name text,
  hrb_registered boolean,
  rating text,
  assessed_on date,
  assessor text,
  document_url text,
  notes text,
  fulfilled_by text,
  ordered_at timestamptz default now(),
  fulfilled_at timestamptz
);
create index if not exists idx_ews1_orders_status on ews1_orders(status, ordered_at);
create index if not exists idx_ews1_orders_session on ews1_orders(stripe_session_id);
