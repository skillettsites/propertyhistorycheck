-- 2026-09-11: checkout-start log + traffic_source on reports.
-- Applied to the shared Pro project via the management API on 11 Sep 2026.
-- Additive only: no drops, no truncates, no changes to existing columns.

alter table public.reports add column if not exists traffic_source text;

create table if not exists public.hbc_checkouts (
  id bigserial primary key,
  session_id text unique not null,
  tier text not null,
  postcode text,
  landing_page text,
  referrer text,
  referrer_source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  traffic_source text,
  device text,
  user_agent text,
  country text,
  attempt integer,
  is_upgrade boolean default false,
  amount_pence integer,
  paid_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_hbc_checkouts_created on public.hbc_checkouts(created_at desc);
create index if not exists idx_hbc_checkouts_postcode on public.hbc_checkouts(postcode, created_at desc);

alter table public.hbc_checkouts enable row level security;

-- Insert-only for anon; the service role (server routes) reads and updates.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'hbc_checkouts' and policyname = 'hbc_checkouts_service_role_all') then
    create policy hbc_checkouts_service_role_all on public.hbc_checkouts for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'hbc_checkouts' and policyname = 'hbc_checkouts_anon_insert') then
    create policy hbc_checkouts_anon_insert on public.hbc_checkouts for insert to anon with check (true);
  end if;
end $$;
