-- HMLR bulk dataset mirrors. Refreshed monthly via GitHub Action.
-- All datasets are Open Government Licence v3.0, England + Wales.
--
-- NOTE: the Registered Leases dataset is NOT included here. Using it in a
-- paid product requires the Commercial licence (£5,000+VAT/yr). Phase 1
-- relies on truly-free sources only.

-- UK companies owning property (~3.3M rows)
create table if not exists hmlr_ccod (
  title_number text primary key,
  postcode_normalised text not null,
  property_address text,
  tenure text,
  proprietor_name text,
  company_registration_no text,
  last_refreshed timestamptz default now()
);
create index if not exists idx_hmlr_ccod_postcode on hmlr_ccod(postcode_normalised);

-- Overseas companies owning property (~100k rows)
create table if not exists hmlr_ocod (
  title_number text primary key,
  postcode_normalised text not null,
  property_address text,
  tenure text,
  proprietor_name text,
  country_incorporated text,
  company_registration_no text,
  last_refreshed timestamptz default now()
);
create index if not exists idx_hmlr_ocod_postcode on hmlr_ocod(postcode_normalised);

-- Track ingest runs for monitoring
create table if not exists hmlr_ingest_log (
  id bigserial primary key,
  dataset text not null,
  file_name text not null,
  rows_processed integer,
  rows_upserted integer,
  rows_deleted integer,
  started_at timestamptz default now(),
  completed_at timestamptz,
  error text
);
create index if not exists idx_hmlr_ingest_dataset_started on hmlr_ingest_log(dataset, started_at desc);
