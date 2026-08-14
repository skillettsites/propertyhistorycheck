# HomeBuyerCheck.co.uk

UK property due-diligence website. Free postcode-level report acts as the SEO funnel. Paid reports (England & Wales only):

- Premium / "Risk & Title Synthesis" — £4.99 (internal SKU `standard`)
- Premium+ / "Pre-Exchange Brief" — £6.99 (internal SKU `standard_plus`)
- Premium+ Upgrade — £2.00 (internal SKU `standard_plus_upgrade`; needs `existing_token`)
- Pre-Exchange Bundle — £14.99 (internal SKU `bundle`)

Paid reports add title & tenure synthesis from public Land Registry data, planning overlays, and environmental detail. They do not pull a live official HM Land Registry title copy (`getPaidReport` uses free / OGL sources; the official copy is a separate £7 gov.uk download).

See [CLAUDE.md](./CLAUDE.md) for operational notes.

## Quick start

```bash
cp .env.example .env.local
# fill in Supabase, Stripe, Resend, EPC, OS, PropertyData keys
npm install
npm run dev
```

In Supabase, run `supabase/schema.sql` once.

## Architecture

- Free tier: parallel fan-out across HM Land Registry Price Paid, EPC, Environment Agency, Police.uk, GIAS, VOA, Ofcom.
- Paid reports: same data plus title & tenure synthesis, ownership flags, environmental/planning overlays, and an AI buyer's verdict. Premium+ and Bundle also add AI Solicitor / Surveyor / Mortgage briefs. Official HM Land Registry title copies are not fetched automatically.
- Stripe Checkout → webhook → fulfilment → Resend email + PDF + persistent `/r/{token}` URL.
- Pattern mirrors `carcostcheck.co.uk`.
