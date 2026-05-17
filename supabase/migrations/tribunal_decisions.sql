-- Property Chamber (First-tier Tribunal) decisions mirror.
-- Source: gov.uk search API (filter_format=residential_property_tribunal_decision).
-- Refreshed daily via GitHub Action.
-- Open Government Licence v3.0 — free commercial re-use with attribution.

create table if not exists tribunal_decisions (
  slug text primary key,
  -- The pretty gov.uk URL slug, e.g. "landau-house-67-croydon-road-keston-kent-br2-6eh-lon-slash-00af-slash-ldc-slash-2026-slash-0029"
  case_reference text,
  -- Often parsed from slug or hidden_indexable_content text. e.g. "LON/00AF/LDC/2026/0029"
  category text,
  -- e.g. "Building Safety Act", "Leasehold disputes (management)", "Leasehold enfranchisement"
  property_address text,
  -- raw "Property" line from hidden_indexable_content
  postcode_normalised text,
  -- extracted from address, no spaces, uppercase
  building_name text,
  -- best-effort parsed building name (e.g. "Landau House")
  applicant_name text,
  -- omit individual leaseholder names when we can; sometimes RTM/RMC names are useful
  respondent_name text,
  -- typically freeholder / managing agent / RTM
  decision_date date,
  decision_summary text,
  -- 1-2 sentence outcome summary, ideally AI-generated; falls back to raw description
  full_text text,
  -- the hidden_indexable_content blob, for grep/full-text search
  pdf_url text,
  -- direct link to the gov.uk-hosted PDF
  published_at timestamptz,
  fetched_at timestamptz default now()
);
create index if not exists idx_tribunal_postcode on tribunal_decisions(postcode_normalised);
create index if not exists idx_tribunal_date on tribunal_decisions(decision_date desc);
-- Trigram index for fuzzy building-name matching (requires pg_trgm extension)
create extension if not exists pg_trgm;
create index if not exists idx_tribunal_building_trgm on tribunal_decisions using gin (building_name gin_trgm_ops);
create index if not exists idx_tribunal_address_trgm on tribunal_decisions using gin (property_address gin_trgm_ops);

create table if not exists tribunal_ingest_log (
  id bigserial primary key,
  mode text not null,
  -- "backfill" | "incremental"
  decisions_fetched integer,
  decisions_upserted integer,
  started_at timestamptz default now(),
  completed_at timestamptz,
  error text
);
create index if not exists idx_tribunal_log_started on tribunal_ingest_log(started_at desc);
