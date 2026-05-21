-- Combined migration applied 2026-05-17 covering:
--   * hmlr_ccod / hmlr_ocod / hmlr_ingest_log     (HMLR bulk owner data)
--   * tribunal_decisions / tribunal_ingest_log    (Property Chamber decisions)
--
-- Idempotent (CREATE ... IF NOT EXISTS). Safe to re-run.
-- Paste into Supabase SQL Editor:
--   https://supabase.com/dashboard/project/noxczmrnyyosgvvjlqca/sql/new

create extension if not exists pg_trgm;

-- ============================================================
-- HMLR bulk dataset mirrors (refreshed monthly via GitHub Action)
-- Open Government Licence v3.0. England + Wales.
-- ============================================================

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

-- ============================================================
-- First-tier Tribunal (Property Chamber) decisions (refreshed daily)
-- Source: gov.uk Search API. OGL v3.0.
-- ============================================================

create table if not exists tribunal_decisions (
  slug text primary key,
  case_reference text,
  category text,
  property_address text,
  postcode_normalised text,
  building_name text,
  applicant_name text,
  respondent_name text,
  decision_date date,
  decision_summary text,
  full_text text,
  pdf_url text,
  published_at timestamptz,
  fetched_at timestamptz default now()
);
create index if not exists idx_tribunal_postcode on tribunal_decisions(postcode_normalised);
create index if not exists idx_tribunal_date on tribunal_decisions(decision_date desc);
create index if not exists idx_tribunal_building_trgm on tribunal_decisions using gin (building_name gin_trgm_ops);
create index if not exists idx_tribunal_address_trgm on tribunal_decisions using gin (property_address gin_trgm_ops);

create table if not exists tribunal_ingest_log (
  id bigserial primary key,
  mode text not null,
  decisions_fetched integer,
  decisions_upserted integer,
  started_at timestamptz default now(),
  completed_at timestamptz,
  error text
);
create index if not exists idx_tribunal_log_started on tribunal_ingest_log(started_at desc);
