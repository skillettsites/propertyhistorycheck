# HomeBuyerCheck — Comprehensive Growth Plan (reach · clicks · revenue)

_Created 2026-06-30. Living document — update as phases ship._

## ✅ Shipped 2026-06-30 (live, verified 200, IndexNow-submitted)
- **4 interactive calculators + hub**: /conveyancing-cost-calculator, /property-survey-cost-calculator, /stamp-duty-calculator, /cost-of-buying-a-house-calculator, /calculators. Wired into sitemap, footer, llms.txt, homepage resource grid, and contextual TOOL_HOOKS from the best-ranking cost posts.
- **3 brand-jack cost posts**: homecheck-professional-flood-report-cost, groundsure-report-cost, landmark-report-cost.
- **Conversion/plumbing**: .com→.co.uk redirect; tailored funnel CTAs on 9 page-1 posts; GA4 `purchase` event now firing (was 0 conversions tracked).
- **Owner TODO**: mark GA4 `purchase` as Key Event (property 538329524); send PR/outreach pack.
- **Audited & left alone (already mature)**: cost-post titles, /title-register-check, homepage, and the free→paid upgrade UI (risk-count urgency + one-tap checkout).


## 0. Baseline (fresh data, pulled 2026-06-30)

| Metric | HBC | CCC (benchmark) |
|---|---|---|
| GSC impressions (28d) | 3,971 | 76,505 |
| GSC clicks (28d) | 2 (GA4 organic: 97) | 499 |
| Avg position | 53.6 (page 5-6) | 29.9 |
| GA4 sessions (28d) | 229 | — |
| GA4 channels (28d) | Organic 97 · Direct 87 · **AI Assistant 30** | — |
| Purchases (all-time) | 7 · £50.93 | hundreds |

**Diagnosis:** Not a product or indexing problem (259/300 pages indexed, 0 sitemap errors, funnel reaches /check). It's **top-of-funnel volume + intent + ranking authority**. HBC ranks for cost-*research* queries at page 5-6; the high-intent product queries (freehold checker pos 24, title register pos 25) sit on page 3. AI/ChatGPT already sends ~13% of traffic on a tiny base — the GEO channel is proven and under-exploited.

**Strategy in one line:** Convert the traffic we already have, then pour CCC's proven reach engine (standalone tools + brand-jack + high-intent pages + citable data) into a funnel that already works.

---

## Workstream 1 — Convert existing traffic (CRO + funnel + CTR)
_Fastest path to £. Low risk. I execute now._

| # | Action | Why | Effort |
|---|---|---|---|
| 1.1 | Rewrite titles/meta + add FAQ schema on the page-1 cost posts (con29 pos 6.6, sewer 8.7, local-authority 8.3, searches-when-buying 9.8, title-register-download 8.2) | They rank page 1 but get ~0 clicks — title/snippet problem. Could 3-5× clicks with no new content | S |
| 1.2 | Sitewide sticky "Check this property free →" bar + standardised in-content CTA block on every blog/guide via `ctaHooks.ts` | 46 blog clicks/90d barely reach /check; tighten blog→/check→paid | S |
| 1.3 | Re-frame `/title-register-check` (17 GA4 landings) — title-register searchers want the £7 gov doc; pivot copy to "the register shows X; our £4.99 report adds the 15 things it doesn't" | Converts mismatched intent instead of losing it | S |
| 1.4 | Add email capture on the **free** report ("email me this report + 3 things to check") → nurture sequence to paid | Instant free report currently captures nothing; build a remarketing list | M |
| 1.5 | Exit-intent / scroll CTA on `/check` free results pushing the £4.99 upgrade with the strongest single hook (ownership + tribunal + ground risk) | Lift free→paid conversion on the 229 sessions we already get | M |

## Workstream 2 — Standalone calculator tools (CCC's biggest lever)
_Reach engine. Components already exist — promote them to indexable, keyword-targeted pages._

CCC's `/insurance-group-calculator` alone = 12,810 impressions/28d. HBC has the components but no standalone pages. Build these as `/[tool]` routes with full schema, FAQ, internal links, and a funnel to /check:

| Route | Targets (HBC already ranks informationally) | Reuses |
|---|---|---|
| `/conveyancing-cost-calculator` | "conveyancing fees calculator", "how much is conveyancing", searches-cost cluster (pos 8-10 already) | new + stampDuty/financial libs |
| `/stamp-duty-calculator` | "stamp duty calculator" (huge volume) | `StampDutyCalculator.tsx` + `lib/stampDuty.ts` |
| `/property-survey-cost-calculator` | the buried survey-cost cluster (2,014 impr at pos 69 — biggest wasted pool) | new |
| `/cost-of-buying-a-house-calculator` | "cost of buying a house", total-cost intent | compose existing calcs |
| `/mortgage-affordability-calculator` | "mortgage affordability calculator" | `MortgageCalculator.tsx`, `AffordabilityCheck.tsx` |

Each tool: interactive, instant answer, then "Now check THIS property's hidden risks free →". Link magnets that outrank blog posts.

## Workstream 3 — High-intent + competitor brand-jack content
_Qualified reach that converts. HBC already has the pattern live (`/blog/best-checkmyfile-alternative-uk`)._

- Expand brand-jack: **Groundsure report cost**, **Landmark report cost**, **homecheck professional flood report** (already 67 impr at pos 45 — own it), **Compare My Move alternative**, **reallymoving alternative**, **propertychecker.co.uk vs HomeBuyerCheck**, **checkmyfile vs** (extend existing).
- Push transactional pages to page 1: **freehold checker** (pos 24), **property check before buying** (page exists — strengthen), **who owns this property** (blog pos 11.8 — strengthen + link to /check).
- Each targets buy/compare intent, not just research.

## Workstream 4 — Consolidate buried content + kill dead weight
- **Survey-cost cluster** (2,014 impr, pos 69): unwinnable as a blog vs high-DA incumbents — convert demand into the `/property-survey-cost-calculator` tool (WS2) and 301 the weakest duplicates into it.
- **Area/town/school pages** (168 pages → ~1,200 impr / 13 clicks in 90d): freeze expansion. Don't add more. Improve internal linking from them into tools/products only.
- **`.com` domain** (4 impressions, dead): 301 redirect to `.co.uk` to stop duplicate dilution.

## Workstream 5 — GEO / LLM citation ("rank everywhere")
_Already 13% of traffic from ChatGPT — proven, scale it._

- llms.txt is already excellent — keep it current as tools/pages ship.
- Build a **citable data/research hub**: stat-dense, un-paywalled pages from HBC's *unique* datasets nobody else has (per-postcode tribunal history, BSR Higher-Risk Buildings, overseas/corporate ownership %, ground-risk by area). LLMs quote primary-source stats.
- Ensure max Bing indexing (ChatGPT's index leans on Bing) — keep IndexNow + Bing batch current.
- Get HBC into third-party "best property check tools" roundups (LLMs read comparison listicles).

## Workstream 6 — Authority / backlinks / digital PR
- Send the already-drafted HBC PR/outreach pack (`hbc_pr_outreach_pack_2026-05-29` in memory) — **owner action** (login-gated).
- sameAs / brand profiles, Wikidata, GBP — owner action.
- Data-led press angles off the unique datasets (overseas-owned property %, tribunal hotspots).

## Workstream 7 — Revenue / offer experiments
- AOV is healthy (£4.99/£6.99/£14.99 + £2 upgrade). Lever is conversion, not price.
- Test order-bump framing on checkout; strengthen the £2 Premium→Premium+ upgrade prompt (already built).
- Post-free-report email nurture (WS1.4) → the cheapest incremental revenue.

## Workstream 8 — Measurement & cadence
- Configure GA4 **purchase key event** (currently 0 conversions tracked in GA4) so funnel + channel ROI is visible.
- Weekly: GSC clicks/impressions/position trend (HBC vs CCC), GA4 sessions + AI-channel share, Stripe purchases. Re-pull striking-distance queries fortnightly.

---

## 90-day roadmap

**Phase 1 (week 1-2) — convert + quick reach:** WS1 (all), WS4 `.com` redirect, WS8 GA4 key event. _Ship via git push._
**Phase 2 (week 2-5) — reach engine:** WS2 calculators (2 per week), WS3 brand-jack batch 1, WS5 data hub v1.
**Phase 3 (week 5-9) — scale + authority:** remaining calculators, WS3 batch 2, WS4 survey-cluster consolidation, WS6 PR (owner).
**Phase 4 (week 9-13) — compound:** double down on whatever moved position/clicks; expand the winning tool/brand-jack patterns.

## Targets (90 days)
- Impressions: 3,971 → **20,000+/28d** (CCC hit this in its first growth quarter).
- Clicks (GA4 organic): 97 → **600+/28d**.
- AI-channel sessions: 30 → **120+/28d**.
- Purchases: ~1/week → **5+/week** (£100-150/wk).

## Owner-only actions (everything else I execute)
- PR/outreach pack send · sameAs/Wikidata/GBP profiles · any paid spend · account signups.
