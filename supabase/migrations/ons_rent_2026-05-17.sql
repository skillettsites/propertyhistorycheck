-- ONS Price Index of Private Rents (PIPR) — monthly £/month rent statistics
-- Source: ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics
-- Crown copyright — free for re-use under Open Government Licence v3.0.
--
-- Coverage: Jan 2015 → present, monthly, by area (UK / countries / regions /
-- English local authorities / Welsh local authorities / Scottish BRMAs) and
-- by bedroom count (1 / 2 / 3 / 4+) and property type (detached / semi /
-- terraced / flat). ~48k rows total, refreshed monthly.

create table if not exists ons_rent_by_area (
  period date not null,
  area_code text not null,
  area_name text,
  region text,
  rent_all_numeric integer,            -- median £/month, all properties
  rent_1bed integer,
  rent_2bed integer,
  rent_3bed integer,
  rent_4plus_bed integer,
  rent_detached integer,
  rent_semi integer,
  rent_terraced integer,
  rent_flat integer,
  primary key (period, area_code)
);
create index if not exists idx_ons_rent_area_period on ons_rent_by_area(area_code, period desc);

create table if not exists ons_rent_ingest_log (
  id bigserial primary key,
  source_url text not null,
  rows_processed integer,
  rows_upserted integer,
  latest_period date,
  started_at timestamptz default now(),
  completed_at timestamptz,
  error text
);
