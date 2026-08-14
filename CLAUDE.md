@AGENTS.md

# HomeBuyerCheck (homebuyercheck.co.uk)

## Env Vars Needed

Names only — do not commit values, `.env`, `.env.local`, or API keys.

- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_TEST
- STRIPE_PRICE_ID_STANDARD, STRIPE_PRICE_ID_STANDARD_PLUS, STRIPE_PRICE_ID_STANDARD_PLUS_UPGRADE, STRIPE_PRICE_ID_BUNDLE — if a price ID env is unset, checkout (`src/app/api/checkout/route.ts`) falls back to inline `price_data` (gbp, `unit_amount` from `src/lib/products.ts`). Actual `price_xxx` IDs are not in git.
