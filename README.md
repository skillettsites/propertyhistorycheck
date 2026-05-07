# PropertyHistoryCheck.co.uk

UK property due-diligence website. Free postcode-level report acts as the SEO funnel; paid Standard (£4.99) and Premium (£14.99) reports add full HM Land Registry title register, planning history, and environmental detail.

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
- Paid tier: same data plus a live HM Land Registry title register pull (PropertyData reseller initially).
- Stripe Checkout → webhook → fulfilment → Resend email + PDF + persistent `/r/{token}` URL.
- Pattern mirrors `carcostcheck.co.uk`.
