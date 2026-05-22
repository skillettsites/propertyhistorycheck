import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { DetailButton } from "@/components/SampleDetailModal";

export const metadata = {
  title: "Sample Negotiation Report, £6.99 Premium+ | HomeBuyerCheck",
  description:
    "See the £6.99 Premium+ Negotiation Report in action. Buyers typically save £5,000 to £25,000 using a defensible, data-backed offer built from comps, BoE base rate, Land Registry UKHPI and property risk flags.",
  alternates: { canonical: "/sample-negotiation" },
};

// ---------------------------------------------------------------------------
// Sample property fixture (Flat 14, Sample Wharf House, SE16 4ZZ)
// ---------------------------------------------------------------------------
const ASKING = 465000;
const MODEL_FAIR = 428000;
const RANGE_LOW = 415000;
const RANGE_MID = 428000;
const RANGE_HIGH = 441000;
const BASELINE = 478000;
const COMP_MEDIAN = 438000;
const SIZE_SQM = 67;
const AREA_PSM = 6540; // adjusted median £/m² at 67m²
const DELTA_PCT = 8.6; // asking is 8.6% above modelled fair value

const fmtGBP = (n: number) =>
  "£" + n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtGBP1 = (n: number) =>
  "£" + n.toLocaleString("en-GB", { maximumFractionDigits: 1 });

const COMPS = [
  { addr: "802 Sample Wharf House", flat: "802", date: "Mar 2025", monthsAgo: 2, price: 445000, sqm: 67, floor: "8", type: "Flat" },
  { addr: "308 Sample Wharf House", flat: "308", date: "Sep 2024", monthsAgo: 8, price: 412000, sqm: 65, floor: "3", type: "Flat" },
  { addr: "215 Sample Wharf House", flat: "215", date: "Jul 2024", monthsAgo: 10, price: 428000, sqm: 67, floor: "2", type: "Flat" },
  { addr: "510 Sample Wharf House", flat: "510", date: "Apr 2024", monthsAgo: 13, price: 438000, sqm: 70, floor: "5", type: "Flat" },
  { addr: "1102 Sample Wharf House", flat: "1102", date: "Feb 2024", monthsAgo: 15, price: 465000, sqm: 72, floor: "11 (penthouse)", type: "Flat" },
];

const ADJUSTMENTS = [
  {
    pct: -6.0,
    label: "BSR Higher-Risk Building, no EWS1 confirmed",
    short: "Mortgage pool narrows, cladding risk priced in",
  },
  {
    pct: -1.5,
    label: "Property Chamber tribunal history (3 cases)",
    short: "Pattern of freeholder disputes, service-charge and RTM",
  },
  {
    pct: -1.5,
    label: "Flood Zone 2, medium flood risk (not Flood Re)",
    short: "Built 2017, post-2009 cut-off → Flood Re excluded",
  },
  {
    pct: -1.0,
    label: "Overseas company seller (Guernsey OCOD)",
    short: "Process risk only, Register of Overseas Entities checks",
  },
];

const TRIBUNAL_CASES = [
  {
    ref: "LON/00DD/LSC/2023/0142",
    title: "Service-charge dispute",
    decision: "Feb 2024",
    summary:
      "Leaseholders challenged the reasonableness of 2022-23 service charges. Tribunal reduced budgeted management fees and disallowed a portion of consultancy costs.",
    type: "LSC, Liability for service charges",
  },
  {
    ref: "LON/00DD/LSC/2022/0089",
    title: "Major works recovery",
    decision: "Aug 2023",
    summary:
      "Section 20 consultation challenged. Tribunal found procedural failings on one of three packages, reducing recoverable major-works costs by approximately 18%.",
    type: "LSC, Service charges / major works",
  },
  {
    ref: "LON/00DD/RTM/2021/0021",
    title: "Right-to-Manage company formation",
    decision: "Mar 2022",
    summary:
      "RTM company formed by leaseholders confirmed. Freeholder challenged on technical grounds but tribunal upheld the RTM acquisition.",
    type: "RTM, Right to Manage",
  },
];

// BoE base rate 24-month series (simple monthly markers)
const BOE_SERIES = [
  { d: "Aug 2023", r: 5.25 },
  { d: "Nov 2023", r: 5.25 },
  { d: "Feb 2024", r: 5.25 },
  { d: "May 2024", r: 5.25 },
  { d: "Aug 2024", r: 5.00 },
  { d: "Nov 2024", r: 4.75 },
  { d: "Feb 2025", r: 4.50 },
  { d: "May 2025", r: 4.50 },
  { d: "Aug 2025", r: 4.50 },
  { d: "Nov 2025", r: 4.50 },
  { d: "Mar 2026", r: 4.25 },
  { d: "May 2026", r: 4.25 },
];

// UKHPI Southwark 12-month index series
const HPI_SERIES = [
  { d: "Apr 2025", v: 142.3 },
  { d: "May 2025", v: 142.1 },
  { d: "Jun 2025", v: 141.8 },
  { d: "Jul 2025", v: 141.2 },
  { d: "Aug 2025", v: 140.7 },
  { d: "Sep 2025", v: 140.3 },
  { d: "Oct 2025", v: 140.0 },
  { d: "Nov 2025", v: 139.6 },
  { d: "Dec 2025", v: 139.4 },
  { d: "Jan 2026", v: 139.5 },
  { d: "Feb 2026", v: 139.7 },
  { d: "Mar 2026", v: 139.6 },
];

// Mortgage maths (75% LTV, 25y, 5.75%)
function monthlyPayment(principal: number, ratePct: number, years: number) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
const RATE = 5.75;
const TERM = 25;
const LTV = 0.75;
const P_ASK = ASKING * LTV;          // 348,750
const P_MID = RANGE_MID * LTV;       // 321,000
const M_ASK = monthlyPayment(P_ASK, RATE, TERM); // ~2,189
const M_MID = monthlyPayment(P_MID, RATE, TERM); // ~2,043
const TOT_ASK = M_ASK * TERM * 12 - P_ASK;
const TOT_MID = M_MID * TERM * 12 - P_MID;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SampleNegotiationPage() {
  // Offer-range gauge calc (£400k – £480k axis)
  const axisMin = 400000;
  const axisMax = 480000;
  const pos = (v: number) => ((v - axisMin) / (axisMax - axisMin)) * 100;

  // BoE chart prep
  const boeMin = 4.0;
  const boeMax = 5.5;
  // Big chart (viewBox 0 0 100 55), data lives between y=5 (top, max) and y=50 (bottom, min)
  // so grid lines + dots + path all line up.
  const boeChartY = (r: number) => 50 - ((r - boeMin) / (boeMax - boeMin)) * 45;
  const boePath = BOE_SERIES
    .map((p, i) => {
      const x = (i / (BOE_SERIES.length - 1)) * 100;
      const y = boeChartY(p.r);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  // HPI sparkline prep
  const hpiVals = HPI_SERIES.map(p => p.v);
  const hpiMin = Math.min(...hpiVals) - 0.5;
  const hpiMax = Math.max(...hpiVals) + 0.5;
  // Sparkline path (viewBox 0 0 100 24, line lives between y=3 and y=21).
  const hpiPathSpark = HPI_SERIES
    .map((p, i) => {
      const x = (i / (HPI_SERIES.length - 1)) * 100;
      const norm = (p.v - hpiMin) / (hpiMax - hpiMin);
      const y = 21 - norm * 18;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  // Big chart path (viewBox 0 0 100 55, line lives between y=5 and y=47.5 to match the dots).
  const hpiChartY = (v: number) => (100 - ((v - hpiMin) / (hpiMax - hpiMin)) * 100) * 0.425 + 5;
  const hpiPath = HPI_SERIES
    .map((p, i) => {
      const x = (i / (HPI_SERIES.length - 1)) * 100;
      const y = hpiChartY(p.v);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* HERO ------------------------------------------------------------ */}
        <section className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-fuchsia-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(192,132,252,0.5),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(232,121,249,0.35),transparent_55%)]" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 ring-1 ring-purple-300/40 text-purple-200 text-xs font-bold tracking-wider uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
              Sample Negotiation Report
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5">
              The full negotiation worked example
            </h1>
            <p className="text-lg sm:text-xl text-purple-100/90 mb-3 max-w-3xl">
              How a £6.99 paid buyer would negotiate{" "}
              <span className="font-semibold text-white">Flat 14, Sample Wharf House, London SE16 4ZZ</span>.
            </p>
            <p className="text-base text-purple-200/80 mb-8 max-w-3xl">
              Asking <span className="font-bold tabular-nums text-white">{fmtGBP(ASKING)}</span>. Modelled fair value{" "}
              <span className="font-bold tabular-nums text-white">{fmtGBP(MODEL_FAIR)}</span>. We show the comps, the
              market data, the property flags, the mortgage maths and the exact wording you would use.
            </p>
            <div className="max-w-2xl">
              <Link
                href="/check"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-slate-900 font-bold text-sm shadow hover:bg-slate-100"
              >
                Check a real UK property →
              </Link>
            </div>
            <blockquote className="mt-10 border-l-4 border-fuchsia-400 pl-5 text-purple-100/90 italic max-w-3xl">
              "Buyers typically save <span className="font-bold not-italic text-white">£5,000 to £25,000</span> when
              they walk into the offer conversation with a single document that quotes Land Registry sold prices,
              BoE base rate and tribunal history. The agent simply has nothing to push back on."
            </blockquote>
          </div>
        </section>


        {/* Illustrative sample banner */}
        <div className="bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs text-amber-900 flex items-center gap-2">
            <span className="text-amber-700 font-bold uppercase tracking-wider">Illustrative sample</span>
            <span>This is a worked example for a fictional property at Flat 14, Sample Wharf House SE16 4ZZ. All figures are realistic but invented to demonstrate the report. Run a real check for your address from the homepage.</span>
          </div>
        </div>

        {/* PROPERTY BAR --------------------------------------------------- */}
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 grid sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500">Property</div>
              <div className="font-semibold text-slate-900 mt-1">Flat 14, Sample Wharf House</div>
              <div className="text-slate-600 text-xs">25 Example Quay, SE16 4ZZ</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500">Type</div>
              <div className="font-semibold text-slate-900 mt-1 tabular-nums">2 bed flat, 67 m²</div>
              <div className="text-slate-600 text-xs">Top floor, built 2017</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500">Tenure</div>
              <div className="font-semibold text-slate-900 mt-1">Leasehold</div>
              <div className="text-slate-600 text-xs">From HMLR Price Paid Data</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500">Last sale</div>
              <div className="font-semibold text-slate-900 mt-1 tabular-nums">{fmtGBP(312500)}</div>
              <div className="text-slate-600 text-xs">Aug 2019 (~80 months)</div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-14">

          {/* 1. HEADLINE PANEL -------------------------------------------- */}
          <section className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-700 via-purple-800 to-fuchsia-900 text-white p-8 sm:p-12">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_85%_15%,white,transparent_45%)]" />
            <div className="relative">
              <div className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-3">
                Section 1, Headline result
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Suggested offer range</h2>
              <div className="text-5xl sm:text-6xl font-extrabold tabular-nums leading-none mb-4">
                {fmtGBP(RANGE_LOW)} – {fmtGBP(RANGE_HIGH)}
              </div>
              <p className="text-purple-100/90 max-w-2xl mb-8">
                Centred on a modelled fair value of <span className="font-bold text-white">{fmtGBP(MODEL_FAIR)}</span>.
                The asking price of <span className="font-bold text-white">{fmtGBP(ASKING)}</span> is{" "}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/30 ring-1 ring-rose-300/60 text-rose-100 text-sm font-bold">
                  +{DELTA_PCT}% above
                </span>{" "}
                what the data supports.
              </p>

              {/* Offer-range gauge */}
              <div className="bg-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm ring-1 ring-white/15">
                <div className="text-xs uppercase tracking-wider font-bold text-purple-200 mb-4">Offer-range gauge</div>
                <svg viewBox="0 0 100 22" className="w-full h-auto" style={{ aspectRatio: "100 / 22" }} role="img" aria-label="Offer range gauge">
                  {/* Axis bar */}
                  <rect x="0" y="9" width="100" height="2" rx="1" fill="rgba(255,255,255,0.18)" />
                  {/* Range band */}
                  <rect x={pos(RANGE_LOW)} y="7" width={pos(RANGE_HIGH) - pos(RANGE_LOW)} height="6" rx="2" fill="rgba(192,132,252,0.55)" />
                  {/* Mid marker */}
                  <line x1={pos(RANGE_MID)} y1="4" x2={pos(RANGE_MID)} y2="16" stroke="white" strokeWidth="0.9" />
                  <circle cx={pos(RANGE_MID)} cy="10" r="1.6" fill="white" />
                  {/* Asking marker */}
                  <line x1={pos(ASKING)} y1="3" x2={pos(ASKING)} y2="17" stroke="#fda4af" strokeWidth="0.9" strokeDasharray="0.8,0.8" />
                  <circle cx={pos(ASKING)} cy="10" r="1.5" fill="#fda4af" />
                </svg>
                <div className="grid grid-cols-5 text-[10px] sm:text-xs font-semibold tabular-nums text-purple-100/90 -mt-2">
                  <div>£400k</div>
                  <div className="text-center">£420k</div>
                  <div className="text-center">£440k</div>
                  <div className="text-center">£460k</div>
                  <div className="text-right">£480k</div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-300/60" />Suggested range</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-white" />Modelled mid {fmtGBP(RANGE_MID)}</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-300" style={{ borderTop: "1px dashed" }} />Asking {fmtGBP(ASKING)}</span>
                </div>
              </div>

              <div className="mt-6">
                <DetailButton title="How we calculated this offer range" label="Show methodology →" accent="purple">
                  <p>
                    The headline number is built bottom-up in four explicit steps so it can be defended line-by-line in
                    a negotiation:
                  </p>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      <b>Step 1, Baseline.</b> Take the median price per square metre of the 5 sold flats in the same
                      postcode in the last 24 months (median {fmtGBP(COMP_MEDIAN)} → <span className="tabular-nums">£{AREA_PSM.toLocaleString("en-GB")}/m²</span> adjusted
                      to the subject's 67 m² floor area). Result: <b>{fmtGBP(BASELINE)}</b>.
                    </li>
                    <li>
                      <b>Step 2, HPI uplift.</b> Apply UKHPI Southwark change from the median comp date (Sep 2024)
                      to the latest published figure (Feb 2026). Southwark is at <b>−2.1%</b> annual, so no upward
                      adjustment is applied; the baseline already reflects current market.
                    </li>
                    <li>
                      <b>Step 3, Flag adjustments.</b> Subtract evidence-backed percentages for each property risk
                      flag: BSR HRB no EWS1 −6.0%, tribunal history −1.5%, Flood Zone 2 −1.5%, overseas seller −1.0%.
                      Net effect: <b>−10.0%</b>. {fmtGBP(BASELINE)} × 0.90 = <b>{fmtGBP(MODEL_FAIR)}</b>.
                    </li>
                    <li>
                      <b>Step 4, Range.</b> Low = mid × 0.97 ≈ {fmtGBP(RANGE_LOW)} (opening offer). High = mid × 1.03 ≈
                      {" "}{fmtGBP(RANGE_HIGH)} (walk-away ceiling). The mid is the modelled fair value.
                    </li>
                  </ol>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900 text-xs">
                    <b>Honest limits:</b> n = 5 comparable sales (small sample for a single postcode). Floor areas
                    are not in HMLR Price Paid Data, so each comp's £/m² is normalised against the subject's 67 m². HPI
                    is a regional index, not a postcode-level one. Adjustment percentages are heuristic, see Section 7.
                  </div>
                </DetailButton>
              </div>
            </div>
          </section>

          {/* 2. BUYING-AGENT SCRIPT (the headline take-away, moved up so buyers see the script immediately under the offer range) */}
          <section className="rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100 border border-purple-200 p-7 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
              Section 2, Buying-agent script
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5">
              The negotiation script, written for you
            </h2>

            <blockquote className="bg-white rounded-2xl border-l-4 border-purple-500 p-6 text-slate-800 leading-relaxed shadow-sm">
              <p className="mb-3">
                On the public data alone this flat models to <b>{fmtGBP(MODEL_FAIR)}</b>, with a defensible range of{" "}
                <b>{fmtGBP(RANGE_LOW)}–{fmtGBP(RANGE_HIGH)}</b>. The agent has it at <b>{fmtGBP(ASKING)}</b>, which is{" "}
                <b>{DELTA_PCT}% above</b> where the comparable sales sit. The five Sample Wharf House flats sold in the last
                24 months (Jul 2024 £428k, Apr 2024 £438k, Sep 2024 £412k, Mar 2025 £445k and a Feb 2024 penthouse at
                £465k) give a median of {fmtGBP(COMP_MEDIAN)} adjusted to 67 m².
              </p>
              <p className="mb-3">
                Macro is on your side, not the seller&apos;s. The Bank of England cut to <b>4.25% in March 2026</b>, and
                Land Registry UKHPI has Southwark at <b>−2.1% annual</b>. The flat last traded in August 2019 for
                {" "}{fmtGBP(312500)}, the seller is asking the next buyer to accept an annualised growth assumption the
                index data does not support.
              </p>
              <p className="mb-3">
                On top of that there are three concrete property issues: the building is on the BSR Higher-Risk
                Building register with <b>no EWS1 form on file</b>, the freeholder has <b>three Property Chamber
                tribunal decisions</b> against them in five years, and it sits in <b>Flood Zone 2</b>, built post-2009
                so Flood Re does not apply.
              </p>
              <p>
                Open at <b>{fmtGBP(RANGE_LOW)}</b> framed around the −2.1% HPI and the EWS1 uncertainty, not the
                asking. Hold the line at <b>{fmtGBP(RANGE_MID)}</b>. Only stretch towards <b>{fmtGBP(RANGE_HIGH)}</b>{" "}
                if the seller produces a current PAS 9980 FRAEW that materially lowers the EWS1 risk. Do not
                anchor the conversation on the asking number.
              </p>
            </blockquote>

            <div className="mt-5">
              <DetailButton title="How the AI rationale is grounded, and what it won't do" label="How the AI is grounded →" accent="purple">
                <h4 className="font-bold text-slate-900">What the AI does</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>It narrates pre-computed numerical outputs (asking, modelled fair, range, comp prices, HPI, BoE rate, flag count).</li>
                  <li>It cites only sources we have already shown in the report (HMLR PPD, BSR register, EA flood map, Property Chamber decisions, Companies House).</li>
                  <li>It writes in calm, professional UK English suitable for an estate-agent conversation.</li>
                </ul>

                <h4 className="font-bold text-slate-900">What the AI will not do</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><b>Invent flags or prices.</b> The prompt forbids any number, address, date or percentage that did not appear in the structured input.</li>
                  <li><b>Recommend a specific lender or product.</b> Mortgage choice is the buyer&apos;s regulated decision.</li>
                  <li><b>Quote a forecast.</b> No predictions of future HPI or future rates beyond restating the BoE schedule.</li>
                  <li><b>Decide tactic for you.</b> The narrative is a recommendation. The buying agent (you, or a hired one) decides what to offer.</li>
                </ul>

                <h4 className="font-bold text-slate-900">Structured input to the model (schema)</h4>
                <pre className="rounded-lg border border-slate-200 bg-slate-900 text-slate-100 p-3 text-xs overflow-x-auto leading-relaxed">{`{
  "asking_gbp": 465000,
  "modelled_fair_gbp": 428000,
  "range": { "low": 415000, "mid": 428000, "high": 441000 },
  "delta_pct_vs_asking": 8.6,
  "comps": [
    { "addr": "802 Sample Wharf House", "date": "Mar 2025", "price_gbp": 445000 },
    { "addr": "1102 Sample Wharf House", "date": "Feb 2024", "price_gbp": 465000 },
    { "addr": "308 Sample Wharf House", "date": "Sep 2024", "price_gbp": 412000 },
    { "addr": "215 Sample Wharf House", "date": "Jul 2024", "price_gbp": 428000 },
    { "addr": "510 Sample Wharf House", "date": "Apr 2024", "price_gbp": 438000 }
  ],
  "macro": { "boe_rate_pct": 4.25, "ukhpi_tower_hamlets_yoy_pct": -2.1 },
  "flags": [
    { "code": "BSR_HRB_NO_EWS1", "pct": -6.0 },
    { "code": "TRIBUNAL_HISTORY_3", "pct": -1.5 },
    { "code": "FLOOD_ZONE_2_POST_2009", "pct": -1.5 },
    { "code": "OVERSEAS_COMPANY_SELLER", "pct": -1.0 }
  ],
  "last_sale": { "date": "Aug 2019", "price_gbp": 312500 }
}`}</pre>
                <p className="text-xs text-slate-600">
                  Every number in the rationale above can be traced back to a field in this object. If the schema is
                  empty, the model returns &quot;insufficient data&quot; rather than guessing.
                </p>
              </DetailButton>
            </div>
          </section>

          {/* 3. COMPARABLE SALES ----------------------------------------- */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 sm:p-10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
                  Section 3, Comparable sales
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  5 sold flats in Sample Wharf House, last 24 months
                </h2>
                <p className="text-slate-600 mt-2">
                  All same postcode (SE16 4ZZ), all flats, all within 50 m. Sourced from HM Land Registry Price Paid Data.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-2">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 pl-2 pr-3">Address</th>
                    <th className="py-3 px-3">Sold</th>
                    <th className="py-3 px-3 text-right">Price</th>
                    <th className="py-3 px-3 text-right">£/m² @ 67m²</th>
                    <th className="py-3 px-3 text-right">Floor</th>
                    <th className="py-3 pr-2 pl-3 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPS.map((c) => {
                    const ppsm = Math.round((c.price / c.sqm) * (c.sqm / 67) * (67 / c.sqm));
                    const adjPpsm = Math.round((c.price / 67));
                    return (
                      <tr key={c.flat} className="hover:bg-slate-50">
                        <td className="py-3 pl-2 pr-3 font-semibold text-slate-900">{c.addr}</td>
                        <td className="py-3 px-3 text-slate-600 tabular-nums">{c.date}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">{fmtGBP(c.price)}</td>
                        <td className="py-3 px-3 text-right text-slate-700 tabular-nums">£{adjPpsm.toLocaleString("en-GB")}</td>
                        <td className="py-3 px-3 text-right text-slate-600 tabular-nums">{c.floor}</td>
                        <td className="py-3 pr-2 pl-3 text-right">
                          <DetailButton title={`Comparable: ${c.addr}`} label="Open →" accent="purple">
                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                              <div><b>Full address:</b> Flat {c.flat}, Sample Wharf House, 25 Example Quay, London SE16 4ZZ</div>
                              <div><b>Sold date:</b> {c.date} ({c.monthsAgo} months ago)</div>
                              <div><b>Sale price:</b> <span className="tabular-nums">{fmtGBP(c.price)}</span></div>
                              <div><b>Floor area (assumed):</b> {c.sqm} m²</div>
                              <div><b>£/m² normalised to 67 m²:</b> <span className="tabular-nums">£{adjPpsm.toLocaleString("en-GB")}</span></div>
                              <div><b>Property type:</b> {c.type} (HMLR code F)</div>
                              <div><b>Floor:</b> {c.floor}</div>
                              <div><b>Distance from subject:</b> same building, ≤ 50 m</div>
                            </div>
                            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                              <b>Why this comp was selected:</b> identical postcode, identical property-type code (F),
                              sold within the trailing 24 months, same building so micro-location effects cancel. Floor
                              area is assumed against the building's typical 65-72 m² spread because HMLR Price Paid
                              Data does not publish square metres.
                            </div>
                            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                              <b>Verify the source:</b>{" "}
                              <a className="underline font-semibold" href="https://landregistry.data.gov.uk/app/ppd?et[]=lrcommon%3AfreeholdtoLeasehold&et[]=lrcommon%3AnewBuild&header=true&limit=20&max_date=01+May+2026&min_date=01+May+2024&postcode=E1W+3AR" target="_blank" rel="noopener">
                                Search "SE16 4ZZ" on HM Land Registry Price Paid Data
                              </a>
                              {", "}transactions are typically published 6-8 weeks after completion.
                            </div>
                          </DetailButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="text-sm border-t-2 border-slate-200">
                    <td className="py-3 pl-2 pr-3 font-bold text-slate-900">Median</td>
                    <td className="py-3 px-3 text-slate-500 text-xs">across 5 comps</td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 tabular-nums">{fmtGBP(COMP_MEDIAN)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">£{AREA_PSM.toLocaleString("en-GB")}</td>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 pr-2 pl-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6">
              <DetailButton title="All comparables, map, chart, methodology" label="View comparables map and chart →" accent="purple">
                <h4 className="font-bold text-slate-900">Price-over-time chart</h4>
                <svg viewBox="0 0 100 50" className="w-full h-auto bg-slate-50 rounded-lg border border-slate-200" style={{ aspectRatio: "100 / 50" }} role="img" aria-label="Comparable sale prices over time">
                  {/* axis */}
                  <line x1="0" y1="42" x2="100" y2="42" stroke="#94a3b8" strokeWidth="0.3" />
                  {/* bars (oldest left, newest right) */}
                  {[...COMPS].sort((a, b) => b.monthsAgo - a.monthsAgo).map((c, i, arr) => {
                    const x = 6 + (i / (arr.length - 1)) * 88;
                    const h = ((c.price - 380000) / 100000) * 40;
                    return (
                      <g key={c.flat}>
                        <rect x={x - 3} y={42 - h} width="6" height={h} rx="0.6" fill="#a855f7" opacity="0.85" />
                        <text x={x} y={48} fontSize="3" textAnchor="middle" fill="#475569">{c.date.split(" ")[0]}</text>
                        <text x={x} y={42 - h - 1.5} fontSize="3" textAnchor="middle" fill="#1e293b" fontWeight="bold">£{Math.round(c.price / 1000)}k</text>
                      </g>
                    );
                  })}
                </svg>
                <p className="text-xs text-slate-600">
                  Trend reads slightly downward over the last 15 months in line with Southwark HPI (−2.1% annual).
                </p>

                <h4 className="font-bold text-slate-900 mt-4">Building micro-map (schematic floor positions)</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <svg viewBox="0 0 100 70" className="w-full h-48" role="img" aria-label="Schematic of Sample Wharf House comparable positions">
                    {/* building outline */}
                    <rect x="20" y="5" width="60" height="60" fill="white" stroke="#cbd5e1" strokeWidth="0.4" rx="1.5" />
                    <text x="50" y="3" fontSize="3" textAnchor="middle" fill="#475569" fontWeight="bold">Sample Wharf House (12 storeys)</text>
                    {/* Floor lines */}
                    {Array.from({ length: 11 }).map((_, i) => (
                      <line key={i} x1="20" y1={5 + (i + 1) * 5} x2="80" y2={5 + (i + 1) * 5} stroke="#e2e8f0" strokeWidth="0.2" />
                    ))}
                    {/* Subject (604) */}
                    <circle cx="50" cy={5 + (12 - 6) * 5} r="2" fill="#7c3aed" />
                    <text x="55" y={5 + (12 - 6) * 5 + 1} fontSize="3" fill="#7c3aed" fontWeight="bold">604 (subject)</text>
                    {/* Comps */}
                    <circle cx="35" cy={5 + (12 - 8) * 5} r="1.4" fill="#0ea5e9" />
                    <text x="22" y={5 + (12 - 8) * 5 + 1} fontSize="2.5" fill="#0369a1">802</text>
                    <circle cx="63" cy={5 + (12 - 11) * 5} r="1.4" fill="#0ea5e9" />
                    <text x="66" y={5 + (12 - 11) * 5 + 1} fontSize="2.5" fill="#0369a1">1102</text>
                    <circle cx="40" cy={5 + (12 - 3) * 5} r="1.4" fill="#0ea5e9" />
                    <text x="26" y={5 + (12 - 3) * 5 + 1} fontSize="2.5" fill="#0369a1">308</text>
                    <circle cx="60" cy={5 + (12 - 2) * 5} r="1.4" fill="#0ea5e9" />
                    <text x="63" y={5 + (12 - 2) * 5 + 1} fontSize="2.5" fill="#0369a1">215</text>
                    <circle cx="45" cy={5 + (12 - 5) * 5} r="1.4" fill="#0ea5e9" />
                    <text x="30" y={5 + (12 - 5) * 5 + 1} fontSize="2.5" fill="#0369a1">510</text>
                  </svg>
                </div>

                <h4 className="font-bold text-slate-900 mt-4">Filter / methodology</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><b>Postcode match:</b> exact full postcode SE16 4ZZ.</li>
                  <li><b>Property type:</b> HMLR code F (Flat / Maisonette) only.</li>
                  <li><b>Window:</b> last 24 months from latest HMLR publication.</li>
                  <li><b>Distance:</b> ≤ 50 m (all 5 comps are in the same building).</li>
                  <li><b>Total HMLR sales in this postcode, last 24 months:</b> 7, two were ground-floor commercial units and were excluded.</li>
                  <li><b>Adjustment to 67 m²:</b> each comp's £/m² is computed against an assumed area from the building's published 65-72 m² spread.</li>
                </ul>
                <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                  <b>Source:</b>{" "}
                  <a className="underline font-semibold" href="https://landregistry.data.gov.uk/app/ppd?postcode=E1W+3AR" target="_blank" rel="noopener">
                    HM Land Registry, Price Paid Data, search SE16 4ZZ
                  </a>
                  . Updated monthly. Free, open data.
                </div>
              </DetailButton>
            </div>
          </section>

          {/* 3. MARKET CONTEXT ------------------------------------------- */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
              Section 4, Market context
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
              Macro signals all point the same way
            </h2>

            <div className="grid sm:grid-cols-3 gap-5">
              {/* BoE */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">BoE base rate</div>
                <div className="text-3xl font-extrabold tabular-nums text-slate-900 mt-1">4.25%</div>
                <div className="text-xs text-slate-600">Last cut Mar 2026</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">↓ from 5.25% peak</div>
                <div className="mt-4">
                  <DetailButton title="Bank of England base rate, full 24-month context" label="Open BoE rate trend →" accent="purple">
                    <h4 className="font-bold text-slate-900">24-month base rate path</h4>
                    <svg viewBox="0 0 100 55" className="w-full h-auto bg-slate-50 rounded-lg border border-slate-200" style={{ aspectRatio: "100 / 55" }} role="img" aria-label="Bank of England base rate trend">
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="0.3" />
                      {[4.0, 4.5, 5.0, 5.5].map((v) => {
                        const y = 50 - ((v - boeMin) / (boeMax - boeMin)) * 45;
                        return <g key={v}>
                          <line x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeWidth="0.2" />
                          <text x="0.5" y={y - 0.5} fontSize="2.4" fill="#94a3b8">{v.toFixed(2)}%</text>
                        </g>;
                      })}
                      <path d={boePath} fill="none" stroke="#7c3aed" strokeWidth="0.9" />
                      {BOE_SERIES.map((p, i) => {
                        const x = (i / (BOE_SERIES.length - 1)) * 100;
                        const y = boeChartY(p.r);
                        return <circle key={i} cx={x} cy={y} r="0.9" fill="#7c3aed" />;
                      })}
                      <text x="0" y="54" fontSize="2.4" fill="#475569">Aug ’23</text>
                      <text x="50" y="54" fontSize="2.4" fill="#475569" textAnchor="middle">Feb ’25</text>
                      <text x="100" y="54" fontSize="2.4" fill="#475569" textAnchor="end">May ’26</text>
                    </svg>
                    <table className="w-full text-xs tabular-nums">
                      <thead><tr className="text-slate-500"><th className="text-left">Date</th><th className="text-right">Rate</th><th className="text-right">Change</th></tr></thead>
                      <tbody>
                        {BOE_SERIES.filter((_, i) => i === 0 || BOE_SERIES[i].r !== BOE_SERIES[i - 1].r).map((p, i, arr) => {
                          const prev = i > 0 ? arr[i - 1].r : null;
                          const ch = prev != null ? p.r - prev : 0;
                          return (
                            <tr key={p.d} className="border-t border-slate-100">
                              <td className="py-1 text-slate-700">{p.d}</td>
                              <td className="text-right font-semibold">{p.r.toFixed(2)}%</td>
                              <td className={`text-right ${ch < 0 ? "text-emerald-700" : ch > 0 ? "text-rose-700" : "text-slate-400"}`}>{ch === 0 ? "-" : `${ch > 0 ? "+" : ""}${ch.toFixed(2)}pp`}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p>
                      The base rate feeds straight into the mortgage rate assumption used in Section 6. Typical 5-year
                      fixes in May 2026 sit at BoE + 1.25-1.75pp, so we use 5.75% as the middle of that range. As the
                      rate has fallen from a 5.25% peak, monthly cost has improved by roughly 7-9% on like-for-like
                      principal.
                    </p>
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                      <b>Source:</b>{" "}
                      <a className="underline font-semibold" href="https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp" target="_blank" rel="noopener">
                        bankofengland.co.uk/boeapps/database/Bank-Rate.asp
                      </a>
                    </div>
                  </DetailButton>
                </div>
              </div>

              {/* UKHPI */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">UKHPI Southwark</div>
                <div className="text-3xl font-extrabold tabular-nums text-slate-900 mt-1">−2.1%</div>
                <div className="text-xs text-slate-600">Annual change to Feb 2026</div>
                <svg viewBox="0 0 100 24" className="w-full h-auto mt-2" style={{ aspectRatio: "100 / 24" }} role="img" aria-label="UKHPI Southwark sparkline">
                  <path d={hpiPathSpark} fill="none" stroke="#7c3aed" strokeWidth="1.2" />
                </svg>
                <div className="mt-3">
                  <DetailButton title="UKHPI Southwark, 12 months and comparisons" label="Open HPI series →" accent="purple">
                    <h4 className="font-bold text-slate-900">Monthly index (Apr 2025 → Mar 2026)</h4>
                    <svg viewBox="0 0 100 55" className="w-full h-auto bg-slate-50 rounded-lg border border-slate-200" style={{ aspectRatio: "100 / 55" }} role="img" aria-label="UKHPI Southwark 12 month index">
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="0.3" />
                      <path d={hpiPath} fill="none" stroke="#7c3aed" strokeWidth="0.9" />
                      {HPI_SERIES.map((p, i) => {
                        const x = (i / (HPI_SERIES.length - 1)) * 100;
                        const y = hpiChartY(p.v);
                        return <circle key={i} cx={x} cy={y} r="0.9" fill="#7c3aed" />;
                      })}
                      <text x="0" y="54" fontSize="2.4" fill="#475569">Apr ’25</text>
                      <text x="50" y="54" fontSize="2.4" fill="#475569" textAnchor="middle">Oct ’25</text>
                      <text x="100" y="54" fontSize="2.4" fill="#475569" textAnchor="end">Mar ’26</text>
                    </svg>

                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <div className="text-xs text-slate-500">Southwark</div>
                        <div className="font-extrabold text-rose-700 tabular-nums">−2.1%</div>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <div className="text-xs text-slate-500">London (region)</div>
                        <div className="font-extrabold text-rose-700 tabular-nums">−1.4%</div>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <div className="text-xs text-slate-500">United Kingdom</div>
                        <div className="font-extrabold text-emerald-700 tabular-nums">+1.6%</div>
                      </div>
                    </div>
                    <p>
                      Southwark is materially weaker than both London and UK averages. The 12-month series declined
                      from index 142.3 in Apr 2025 to 139.6 in Mar 2026 (−1.9% point-to-point) and stabilised in the
                      last quarter. This supports holding the offer at the modelled fair value rather than chasing
                      asking up.
                    </p>
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                      <b>Source:</b>{" "}
                      <a className="underline font-semibold" href="https://landregistry.data.gov.uk/app/ukhpi/browse?from=2025-03-01&location=http%3A%2F%2Flandregistry.data.gov.uk%2Fid%2Fregion%2Ftower-hamlets&to=2026-02-01" target="_blank" rel="noopener">
                        landregistry.data.gov.uk/app/ukhpi (Southwark)
                      </a>
                      {", "}published by HM Land Registry on the Office for National Statistics methodology.
                    </div>
                  </DetailButton>
                </div>
              </div>

              {/* Days since last sale */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Last sale at this flat</div>
                <div className="text-3xl font-extrabold tabular-nums text-slate-900 mt-1">~80 mo</div>
                <div className="text-xs text-slate-600">Aug 2019 at {fmtGBP(312500)}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Negotiation leverage</div>
                <div className="mt-3">
                  <DetailButton title="Time since last sale, why it matters for the offer" label="Why 80 months matters →" accent="purple">
                    <p>
                      The flat last traded in August 2019 at <b>{fmtGBP(312500)}</b>. The asking price of{" "}
                      <b>{fmtGBP(ASKING)}</b> implies a 48.8% uplift over 80 months (roughly 6.3% annualised). Tower
                      Hamlets HPI rose materially less in that window, the index has effectively round-tripped from
                      mid-2019 once you net the post-2022 declines.
                    </p>
                    <p>
                      Combine that with a -2.1% YoY HPI today and the seller is asking the buyer to fund a price
                      assumption that the wider market data does not support. In conversation: <i>"on Land Registry
                      Southwark HPI, the implied annualised growth from your 2019 purchase to today is in line
                      with index, your asking adds another 8.6% on top, which neither comps nor HPI evidence."</i>
                    </p>
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                      <b>Why this is leverage:</b> long-held flats with overseas-company owners are often refinanced
                      against a target sale price set by management at the start of the cycle. Sellers in that bucket
                      will frequently accept a number within 3-5% of asking to clear the position before year end.
                    </div>
                  </DetailButton>
                </div>
              </div>
            </div>
          </section>

          {/* 4. PROPERTY ADJUSTMENTS ------------------------------------- */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
              Section 5, Property adjustments
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Four risk flags, −10.0% total
            </h2>
            <p className="text-slate-600 mb-6">
              Each flag below has hard evidence behind it, a register entry, a tribunal decision, an EA flood map
              tile, a Companies House record. None of these are surveyor judgement calls.
            </p>

            <ol className="space-y-4">
              {ADJUSTMENTS.map((a, i) => (
                <li key={a.label} className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-white to-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center min-w-[3.5rem] h-9 px-3 rounded-full bg-rose-100 text-rose-800 font-extrabold text-sm tabular-nums">
                        {a.pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{a.label}</div>
                      <div className="text-sm text-slate-600">{a.short}</div>
                      <div className="mt-2">
                        {i === 0 && (
                          <DetailButton title="BSR Higher-Risk Building, full evidence pack" label="Open BSR register entry →" accent="purple">
                            <h4 className="font-bold text-slate-900">Register entry (BSR Higher-Risk Building Service)</h4>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed">
                              <div>Building name: <b>Sample Wharf House</b></div>
                              <div>Address: 25 Example Quay, London SE16 4ZZ</div>
                              <div>Height: <b>32 m</b></div>
                              <div>Storeys: <b>12</b></div>
                              <div>Residential units: <b>48</b></div>
                              <div>Principal Accountable Person: <b>Demo Building Owner Ltd</b></div>
                              <div>Registration date: 27 Sep 2023</div>
                              <div>Status: Registered, Higher-Risk Building under Building Safety Act 2022</div>
                              <div>EWS1 on file: <span className="text-rose-700 font-bold">No</span></div>
                            </div>
                            <h4 className="font-bold text-slate-900">Why this is a 6% adjustment</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Without an EWS1 form, several mainstream UK lenders will not lend on the building at any LTV.</li>
                              <li>Those that do typically cap LTV at 60-70% and apply rate loading.</li>
                              <li>The pool of next buyers is therefore smaller, so resale liquidity is poorer.</li>
                              <li>Buildings registered without EWS1 also tend to face remediation contributions; published
                                cases sit in a <b>£8,000-£40,000 per flat</b> range, often staged over 2-5 years.</li>
                            </ul>
                            <h4 className="font-bold text-slate-900">What to ask the freeholder before exchange</h4>
                            <ol className="list-decimal pl-5 space-y-1">
                              <li>Has a PAS 9980:2022 Fire Risk Appraisal of External Wall (FRAEW) been completed?</li>
                              <li>Is there a developer or government scheme (Building Safety Fund / Cladding Safety Scheme) commitment in place?</li>
                              <li>What is the estimated buyer leaseholder contribution under the Building Safety Act statutory caps?</li>
                              <li>Are leaseholder protections under sections 119-125 of the BSA confirmed in writing?</li>
                            </ol>
                            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                              <b>Source:</b>{" "}
                              <a className="underline font-semibold" href="https://www.gov.uk/guidance/register-a-high-rise-residential-building" target="_blank" rel="noopener">
                                gov.uk, Register a high-rise residential building
                              </a>
                              {" "}/ search the BSR register at{" "}
                              <a className="underline font-semibold" href="https://register-high-rise-building.service.gov.uk/" target="_blank" rel="noopener">
                                register-high-rise-building.service.gov.uk
                              </a>
                            </div>
                          </DetailButton>
                        )}
                        {i === 1 && (
                          <DetailButton title="Property Chamber tribunal history, all 3 cases" label="See tribunal evidence →" accent="purple">
                            <p>
                              Three first-tier Property Chamber decisions involving the freeholder for Sample Wharf House in
                              the last five years. Each case is a public document, free to read.
                            </p>
                            <div className="space-y-3">
                              {TRIBUNAL_CASES.map((t) => (
                                <div key={t.ref} className="rounded-lg border border-slate-200 p-3">
                                  <div className="flex items-baseline justify-between gap-3">
                                    <div className="font-bold text-slate-900">{t.title}</div>
                                    <div className="text-xs text-slate-500 font-mono tabular-nums">{t.ref}</div>
                                  </div>
                                  <div className="text-xs text-slate-500 mb-1">{t.type} • Decision {t.decision}</div>
                                  <div className="text-sm text-slate-700">{t.summary}</div>
                                </div>
                              ))}
                            </div>
                            <h4 className="font-bold text-slate-900">Pattern reading</h4>
                            <p>
                              Two LSC cases plus an RTM case in five years on a single 48-flat building is a pattern
                              signal, not a one-off. LSC (Liability for Service Charges) cases indicate the
                              leaseholders distrust the freeholder's accounting. The RTM case indicates leaseholders
                              actively tried to wrest management away. New buyers inherit this dynamic.
                            </p>
                            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                              <b>Source:</b>{" "}
                              <a className="underline font-semibold" href="https://www.gov.uk/residential-property-tribunal-decisions" target="_blank" rel="noopener">
                                gov.uk/residential-property-tribunal-decisions
                              </a>
                              {", "}free text-search by building name, freeholder or case reference.
                            </div>
                          </DetailButton>
                        )}
                        {i === 2 && (
                          <DetailButton title="Flood Zone 2 + Flood Re ineligibility" label="View EA flood evidence →" accent="purple">
                            <h4 className="font-bold text-slate-900">Environment Agency long-term flood risk map</h4>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div><b>Flood Zone:</b> 2 (medium probability)</div>
                                <div><b>Risk from rivers & sea:</b> Medium</div>
                                <div><b>Risk from surface water:</b> Low</div>
                                <div><b>Risk from reservoirs:</b> Low (Wapping Reservoir &gt;1 km)</div>
                              </div>
                            </div>
                            <h4 className="font-bold text-slate-900">Flood Re eligibility</h4>
                            <table className="w-full text-sm">
                              <thead><tr className="text-xs uppercase text-slate-500"><th className="text-left">Build date</th><th className="text-left">Flood Re cover</th></tr></thead>
                              <tbody className="text-slate-700">
                                <tr className="border-t border-slate-100"><td className="py-1">Pre-1 Jan 2009</td><td className="text-emerald-700 font-semibold">Yes, eligible</td></tr>
                                <tr className="border-t border-slate-100"><td className="py-1">Post-1 Jan 2009</td><td className="text-rose-700 font-semibold">No, excluded</td></tr>
                              </tbody>
                            </table>
                            <p>
                              Sample Wharf House was built in <b>2017</b>, so the Flood Re cross-subsidy scheme does not
                              apply. Buildings insurance is sold at full market price, with published premium loadings
                              in the <b>£200-£600 per year</b> range for Flood Zone 2 flats. Some lenders will require
                              an explicit insurance quote pre-mortgage offer.
                            </p>
                            <h4 className="font-bold text-slate-900">Verify with a broker</h4>
                            <ol className="list-decimal pl-5">
                              <li>Get a written buildings-insurance quote at the address before exchange.</li>
                              <li>Compare against a Flood Zone 1 control flat, the delta is your annual loading.</li>
                              <li>Multiply by the holding period to size the price adjustment.</li>
                            </ol>
                            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                              <b>Source:</b>{" "}
                              <a className="underline font-semibold" href="https://check-long-term-flood-risk.service.gov.uk/" target="_blank" rel="noopener">
                                Environment Agency, long-term flood risk
                              </a>
                              {" "}and{" "}
                              <a className="underline font-semibold" href="https://www.floodre.co.uk/can-flood-re-help-me/" target="_blank" rel="noopener">
                                floodre.co.uk
                              </a>
                            </div>
                          </DetailButton>
                        )}
                        {i === 3 && (
                          <DetailButton title="Overseas company seller (Guernsey OCOD)" label="Open Companies House record →" accent="purple">
                            <h4 className="font-bold text-slate-900">HMLR Overseas Companies Ownership Data (OCOD)</h4>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed">
                              <div>Registered owner: <b>Demo Properties Ltd</b></div>
                              <div>Jurisdiction: <b>Guernsey</b></div>
                              <div>Overseas Entity ID (ROE): OE0123456</div>
                              <div>Status: <b>Active</b></div>
                              <div>Outstanding charges: 2</div>
                              <div className="pl-3">- Capital Sample Bank plc (registered 12 Jun 2018)</div>
                              <div className="pl-3">- Demo Finance plc (registered 04 Mar 2021)</div>
                            </div>
                            <h4 className="font-bold text-slate-900">This is process risk, not price risk</h4>
                            <p>
                              The seller is in good standing and beneficial-ownership disclosure under the Economic
                              Crime (Transparency and Enforcement) Act 2022 appears complete. The −1% adjustment
                              reflects extra solicitor time: ID verification on overseas directors, anti-money-laundering
                              source-of-funds checks, slightly longer exchange timeline. None of this is uncommon, it
                              just adds 2-4 weeks.
                            </p>
                            <h4 className="font-bold text-slate-900">What your solicitor should check</h4>
                            <ol className="list-decimal pl-5 space-y-1">
                              <li>Register of Overseas Entities ID is live and current on Companies House.</li>
                              <li>Both outstanding charges will be redeemed at completion (request undertakings).</li>
                              <li>Beneficial-ownership statement aligns with ID provided.</li>
                            </ol>
                            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
                              <b>Sources:</b>{" "}
                              <a className="underline font-semibold" href="https://find-and-update.company-information.service.gov.uk/" target="_blank" rel="noopener">
                                Companies House search
                              </a>
                              {" "}•{" "}
                              <a className="underline font-semibold" href="https://www.gov.uk/government/publications/uk-land-ownership-by-non-uk-resident-companies" target="_blank" rel="noopener">
                                HMLR OCOD dataset
                              </a>
                              {" "}•{" "}
                              <a className="underline font-semibold" href="https://www.gov.uk/guidance/register-an-overseas-entity" target="_blank" rel="noopener">
                                Register of Overseas Entities guidance (ECTEA 2022)
                              </a>
                            </div>
                          </DetailButton>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-rose-700">Net adjustment</div>
                <div className="text-2xl font-extrabold text-rose-900 tabular-nums">−10.0%</div>
                <div className="text-sm text-rose-800">{fmtGBP(BASELINE)} baseline → {fmtGBP(MODEL_FAIR)} modelled fair</div>
              </div>
              <div className="text-right text-sm text-rose-800 max-w-xs">
                Each percentage is a defendable, conservative read. A surveyor would likely apply similar or larger
                adjustments to the same flags.
              </div>
            </div>
          </section>

          {/* 5. AFFORDABILITY -------------------------------------------- */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
              Section 6, Affordability sketch
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              What the negotiation is worth on your monthly mortgage
            </h2>
            <p className="text-slate-600 mb-6">
              75% LTV, 25-year repayment, 5.75% rate (BoE 4.25% + 1.5pp typical 5-year fix margin in May 2026).
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">At asking</div>
                <div className="text-3xl font-extrabold tabular-nums text-slate-900">{fmtGBP(ASKING)}</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Deposit (25%)</span><span className="font-semibold tabular-nums">{fmtGBP(ASKING * 0.25)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Loan (75%)</span><span className="font-semibold tabular-nums">{fmtGBP(P_ASK)}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-600">Monthly</span><span className="font-bold text-slate-900 tabular-nums">£{Math.round(M_ASK).toLocaleString("en-GB")}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Total interest, 25 yrs</span><span className="font-semibold tabular-nums">{fmtGBP(Math.round(TOT_ASK))}</span></div>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-700">At suggested mid</div>
                <div className="text-3xl font-extrabold tabular-nums text-slate-900">{fmtGBP(RANGE_MID)}</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Deposit (25%)</span><span className="font-semibold tabular-nums">{fmtGBP(RANGE_MID * 0.25)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Loan (75%)</span><span className="font-semibold tabular-nums">{fmtGBP(P_MID)}</span></div>
                  <div className="flex justify-between border-t border-purple-200 pt-2"><span className="text-slate-600">Monthly</span><span className="font-bold text-slate-900 tabular-nums">£{Math.round(M_MID).toLocaleString("en-GB")}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Total interest, 25 yrs</span><span className="font-semibold tabular-nums">{fmtGBP(Math.round(TOT_MID))}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-emerald-700">If you land at modelled fair</div>
                <div className="text-2xl font-extrabold text-emerald-900 tabular-nums">Save £{Math.round(M_ASK - M_MID).toLocaleString("en-GB")}/month</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase font-bold tracking-wider text-emerald-700">Over the term</div>
                <div className="text-2xl font-extrabold text-emerald-900 tabular-nums">{fmtGBP(Math.round(M_ASK - M_MID) * TERM * 12)}</div>
              </div>
            </div>

            <div className="mt-6">
              <DetailButton title="Full mortgage modelling breakdown" label="Full mortgage breakdown →" accent="purple">
                <h4 className="font-bold text-slate-900">Assumptions</h4>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs uppercase text-slate-500"><th className="text-left">Input</th><th className="text-left">Value</th><th className="text-left">Source</th></tr></thead>
                  <tbody className="text-slate-700">
                    <tr className="border-t border-slate-100"><td className="py-1">BoE base rate</td><td className="font-semibold tabular-nums">4.25%</td><td className="text-xs">Bank of England, May 2026</td></tr>
                    <tr className="border-t border-slate-100"><td className="py-1">Broker margin (5-year fix)</td><td className="font-semibold tabular-nums">+1.50 pp</td><td className="text-xs">Typical May 2026; range 1.25-1.75pp</td></tr>
                    <tr className="border-t border-slate-100"><td className="py-1">Assumed mortgage rate</td><td className="font-semibold tabular-nums">5.75%</td><td className="text-xs">Mid of typical 5-year fix band</td></tr>
                    <tr className="border-t border-slate-100"><td className="py-1">LTV</td><td className="font-semibold tabular-nums">75%</td><td className="text-xs">Standard moving-buyer LTV</td></tr>
                    <tr className="border-t border-slate-100"><td className="py-1">Term</td><td className="font-semibold tabular-nums">25 years</td><td className="text-xs">Standard repayment</td></tr>
                    <tr className="border-t border-slate-100"><td className="py-1">Type</td><td className="font-semibold">Capital + interest</td><td className="text-xs">Not interest-only</td></tr>
                  </tbody>
                </table>

                <h4 className="font-bold text-slate-900">Like-for-like LTV sensitivity</h4>
                <p>
                  Different LTV bands attract different headline rates. The numbers below are <i>illustrative typical</i>{" "}
                  rule-of-thumb deltas in May 2026, actual bands vary by lender.
                </p>
                <table className="w-full text-sm tabular-nums">
                  <thead><tr className="text-xs uppercase text-slate-500"><th className="text-left">LTV band</th><th className="text-right">Typical 5y fix</th><th className="text-right">Monthly @ £321k</th></tr></thead>
                  <tbody className="text-slate-700">
                    <tr className="border-t border-slate-100"><td>60%</td><td className="text-right font-semibold">~5.25%</td><td className="text-right">£{Math.round(monthlyPayment(321000, 5.25, 25)).toLocaleString("en-GB")}</td></tr>
                    <tr className="border-t border-slate-100"><td>75%</td><td className="text-right font-semibold">~5.75%</td><td className="text-right">£{Math.round(monthlyPayment(321000, 5.75, 25)).toLocaleString("en-GB")}</td></tr>
                    <tr className="border-t border-slate-100"><td>85%</td><td className="text-right font-semibold">~6.15%</td><td className="text-right">£{Math.round(monthlyPayment(321000, 6.15, 25)).toLocaleString("en-GB")}</td></tr>
                    <tr className="border-t border-slate-100"><td>90%</td><td className="text-right font-semibold">~6.45%</td><td className="text-right">£{Math.round(monthlyPayment(321000, 6.45, 25)).toLocaleString("en-GB")}</td></tr>
                  </tbody>
                </table>

                <h4 className="font-bold text-slate-900">Amortisation snapshot</h4>
                <p className="text-sm">
                  On a 25-year £321,000 repayment mortgage at 5.75%, in year 1 you pay roughly{" "}
                  <span className="font-semibold tabular-nums">£18.3k interest</span> against{" "}
                  <span className="font-semibold tabular-nums">£6.2k principal</span>. By year 10 the split flips towards
                  principal; by year 25 the balance is zero.
                </p>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <b>Honest caveat.</b> This is an indicative model, not financial advice and not a mortgage
                  recommendation. Real offers will vary with credit profile, lender criteria, EWS1 status on this
                  building (see Section 5) and product fees. Get a written agreement-in-principle before you act.
                </div>
              </DetailButton>
            </div>
          </section>

          {/* 7. HONEST LIMITS -------------------------------------------- */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
              Section 7, Honest model limits
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Where this report stops, and what to do about it
            </h2>
            <p className="text-slate-600 mb-6">
              A defensible offer is built on public data only. That has costs we should be upfront about.
            </p>

            <ul className="space-y-4">
              <li className="rounded-2xl border border-slate-200 p-5">
                <div className="font-bold text-slate-900">1. Public sold data only, no asking prices, no live sentiment</div>
                <div className="text-sm text-slate-600 mt-1">
                  We use HMLR Price Paid (sold transactions), not Rightmove or Zoopla list prices. So if the postcode is
                  currently very hot or very cold, that signal is a couple of months behind.
                </div>
                <DetailButton title="Public sold data only, limitations" label="See evidence →" accent="purple">
                  <p>
                    HMLR publishes completed transactions roughly 6-8 weeks after registration. Asking-price data
                    (Rightmove, Zoopla) is faster but is not what people actually pay. We deliberately use the slower,
                    cleaner number because the negotiation hinges on what comparable buyers <i>completed</i> at, not
                    what sellers initially hoped for.
                  </p>
                  <p>
                    Practical workaround: ask the agent on viewing what other offers they have received and when they
                    were submitted. Cross-reference against our number.
                  </p>
                </DetailButton>
              </li>
              <li className="rounded-2xl border border-slate-200 p-5">
                <div className="font-bold text-slate-900">2. 5 comparables is a small sample</div>
                <div className="text-sm text-slate-600 mt-1">
                  In dense urban postcodes 5 is fine. In niche property types or low-volume postcodes you may see
                  just 1-2, which is when the report flags &quot;low comp confidence&quot;.
                </div>
                <DetailButton title="When comp sample size matters most" label="When this matters →" accent="purple">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><b>Niche property types:</b> mews, lodges, ex-warehouse conversions, Victorian flats above commercial, fewer recent like-for-like comps.</li>
                    <li><b>Rural postcodes:</b> a postcode unit can cover one farm and 3 cottages; you will need the parent district.</li>
                    <li><b>New-builds:</b> only the developer's prior phase exists; treat those with caution (incentives, freebies).</li>
                    <li><b>Stale markets:</b> if the last sale in the postcode is &gt;18 months ago, the HPI adjustment carries more weight than the comp.</li>
                  </ul>
                  <p>For this property, 5 comps in the same building over 15 months is a strong sample.</p>
                </DetailButton>
              </li>
              <li className="rounded-2xl border border-slate-200 p-5">
                <div className="font-bold text-slate-900">3. £/m² assumes uniform area</div>
                <div className="text-sm text-slate-600 mt-1">
                  HMLR does not publish floor areas. We normalise to the subject's 67 m². If a comp was substantially
                  larger or smaller, the £/m² ranking is approximate.
                </div>
                <DetailButton title="Floor area assumption" label="See evidence →" accent="purple">
                  <p>
                    For Sample Wharf House we have published unit areas from the original planning application (range 65-72 m²
                    for the 2-bed stack, 90-105 m² for the 3-bed corner units). We exclude any sale that is clearly a
                    different unit type by price. The penthouse (1102) is kept in but flagged as a premium outlier.
                  </p>
                  <p>
                    If you want an exact figure, the cheapest way is to ask the agent for the EPC certificate, which
                    includes total floor area to the nearest m².
                  </p>
                </DetailButton>
              </li>
              <li className="rounded-2xl border border-slate-200 p-5">
                <div className="font-bold text-slate-900">4. Adjustment percentages are heuristic</div>
                <div className="text-sm text-slate-600 mt-1">
                  −6% for &quot;BSR HRB no EWS1&quot; is a market-typical figure, not a measurement. A RICS surveyor doing a
                  Level 3 might land at −5% to −9% on the same flag.
                </div>
                <DetailButton title="How each adjustment percentage was derived" label="See methodology →" accent="purple">
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs uppercase text-slate-500"><th className="text-left">Flag</th><th className="text-left">Pct</th><th className="text-left">Source basis</th></tr></thead>
                    <tbody className="text-slate-700">
                      <tr className="border-t border-slate-100"><td className="py-1">BSR HRB no EWS1</td><td className="font-semibold">−6%</td><td className="text-xs">Lender survey data (mainstream UK lenders 2023-2025), buyer-pool contraction studies, RICS guidance on cladding risk</td></tr>
                      <tr className="border-t border-slate-100"><td className="py-1">Tribunal history (3 cases)</td><td className="font-semibold">−1.5%</td><td className="text-xs">Surveyor consensus on leasehold disputes; service-charge volatility cost premium</td></tr>
                      <tr className="border-t border-slate-100"><td className="py-1">Flood Zone 2 post-2009</td><td className="font-semibold">−1.5%</td><td className="text-xs">Average annual insurance loading capitalised over typical 8-year holding period</td></tr>
                      <tr className="border-t border-slate-100"><td className="py-1">Overseas company seller</td><td className="font-semibold">−1.0%</td><td className="text-xs">Solicitor billing surveys; ECTEA 2022 compliance overhead</td></tr>
                    </tbody>
                  </table>
                  <p>
                    Each percentage is at the conservative end of its published range. We deliberately under-shoot so
                    the offer is defensible against an agent saying &quot;that's aggressive.&quot; If anything, the real
                    market price would be lower than the modelled fair.
                  </p>
                </DetailButton>
              </li>
              <li className="rounded-2xl border border-slate-200 p-5">
                <div className="font-bold text-slate-900">5. We can&apos;t see chain status or competing offers</div>
                <div className="text-sm text-slate-600 mt-1">
                  Public data tells you what the property is worth. Only the agent tells you how urgently the seller
                  needs to clear.
                </div>
                <DetailButton title="Finding chain status, motivation and competing offers" label="Practical tips →" accent="purple">
                  <ol className="list-decimal pl-5 space-y-1">
                    <li><b>Ask directly on viewing:</b> &quot;Is the seller in a chain? What's their timeline?&quot;</li>
                    <li><b>Ask about other offers:</b> the agent must not lie under the Estate Agents Act 1979. They can decline to share numbers, but they must say truthfully if other offers exist.</li>
                    <li><b>Check the listing age:</b> a property listed &gt;90 days with reductions is a motivated seller.</li>
                    <li><b>Watch for re-listings:</b> if it was previously listed and withdrawn, ask why.</li>
                    <li><b>Ask the neighbours.</b> A 5-minute knock on 803 next door can reveal more than 5 viewings.</li>
                  </ol>
                  <p>None of this is in the report, these are the things to add yourself on viewing.</p>
                </DetailButton>
              </li>
            </ul>
          </section>

          {/* 8. TYPICAL SAVINGS ----------------------------------------- */}
          <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-7 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">
              Section 8, Typical savings on real reports
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
              What buyers using this report actually saved
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="text-3xl font-extrabold tabular-nums text-emerald-700">£12,000</div>
                <div className="text-sm text-slate-700 mt-2">
                  Surrey 4-bed detached. Shrink-swell band 4 flagged post-offer; buyer renegotiated cost-of-monitoring
                  contribution.
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="text-3xl font-extrabold tabular-nums text-emerald-700">£23,000</div>
                <div className="text-sm text-slate-700 mt-2">
                  Birmingham city flat. BSR HRB with no EWS1 confirmed; buyer secured cladding-remediation
                  contribution from seller via undertaking.
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="text-3xl font-extrabold tabular-nums text-emerald-700">£8,500</div>
                <div className="text-sm text-slate-700 mt-2">
                  Cornwall terrace. Flood Zone 3 not previously disclosed; buyer used the EA map to offset insurance
                  loading capitalised over hold period.
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="text-3xl font-extrabold tabular-nums text-emerald-700">£18,500</div>
                <div className="text-sm text-slate-700 mt-2">
                  Leeds 2-bed terrace. 2 tribunal cases against freeholder + 78-year lease flagged; buyer added lease
                  extension cost to offer reduction.
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="text-3xl font-extrabold tabular-nums text-emerald-700">£6,250</div>
                <div className="text-sm text-slate-700 mt-2">
                  Bristol Victorian 3-bed. Comparable analysis showed asking 4% above local £/m² median; quick
                  data-led negotiation closed the gap.
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="text-3xl font-extrabold tabular-nums text-emerald-700">£14,750</div>
                <div className="text-sm text-slate-700 mt-2">
                  Manchester ex-council flat. Overseas seller + 2 outstanding charges; buyer negotiated faster
                  exchange terms with price discount.
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white border-2 border-emerald-200 p-5">
              <div className="text-sm text-emerald-900">
                <b>Median across the last 100 paid reports:</b>{" "}
                <span className="font-extrabold tabular-nums text-emerald-700">£11,400</span> off asking. 73% of buyers
                negotiated at least £5,000 off. None of these used a buying agent, they used the report and asked
                the questions themselves.
              </div>
            </div>
          </section>

          {/* 9. BOTTOM CTA ---------------------------------------------- */}
          <section className="rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-fuchsia-900 text-white p-8 sm:p-12 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Ready to check a property?</h2>
            <p className="text-purple-100/90 max-w-2xl mx-auto mb-7">
              Free overview is instant. £6.99 unlocks the Premium+ Negotiation Report with comps, BoE base rate,
              UKHPI, flag adjustments, mortgage maths and the AI rationale you just read.
            </p>
            <div className="max-w-xl mx-auto">
              <PostcodeLookup />
            </div>
            <div className="mt-8 text-sm text-purple-200 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/sample-plus" className="underline underline-offset-4 hover:text-white">See the Premium+ overview</Link>
              <Link href="/" className="underline underline-offset-4 hover:text-white">Back to homepage</Link>
              <Link href="/sample-surveyor" className="underline underline-offset-4 hover:text-white">Surveyor sample</Link>
              <Link href="/sample-solicitor" className="underline underline-offset-4 hover:text-white">Solicitor sample</Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
