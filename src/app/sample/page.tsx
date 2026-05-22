import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { DetailButton } from "@/components/SampleDetailModal";

export const metadata = {
  title: "Sample Premium Report, What you get for £4.99 | HomeBuyerCheck",
  description:
    "A full worked example of the £4.99 Premium report on a real-looking London flat, radon, ground, coal, listed/conservation/TPO/Article 4, BSR HRB, ownership (HMLR CCOD/OCOD), Companies House, Property Chamber tribunal history, buyer's verdict and seller questions.",
  alternates: { canonical: "/sample" },
};

const ADDRESS = "Flat 14, Sample Wharf House, 25 Example Quay, London SE16 4ZZ";

function Card({
  title,
  source,
  accent,
  children,
}: {
  title: string;
  source?: string;
  accent?: "amber" | "red" | "blue";
  children: React.ReactNode;
}) {
  const accentClass =
    accent === "red"
      ? "border-red-200 bg-red-50/60"
      : accent === "amber"
      ? "border-amber-200 bg-amber-50/60"
      : accent === "blue"
      ? "border-blue-200 bg-blue-50/60"
      : "border-slate-200 bg-white";
  return (
    <section className={`rounded-2xl border ${accentClass} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        {source ? (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 whitespace-nowrap mt-1">
            {source}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-slate-100 last:border-b-0">
      <div className="text-sm text-slate-700">
        {label}
        {hint ? <span className="block text-[11px] text-slate-500">{hint}</span> : null}
      </div>
      <div className="text-sm font-semibold text-slate-900 tabular-nums text-right">{value}</div>
    </div>
  );
}

function GroundBand({
  label,
  band,
  max = 5,
  note,
}: {
  label: string;
  band: number;
  max?: number;
  note: string;
}) {
  const tone =
    band >= 4 ? "red" : band === 3 ? "amber" : band <= 1 ? "emerald" : "slate";
  const colorRing =
    tone === "red"
      ? "bg-red-100 text-red-800 ring-red-200"
      : tone === "amber"
      ? "bg-amber-100 text-amber-800 ring-amber-200"
      : tone === "emerald"
      ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider font-bold text-slate-600">{label}</p>
        <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ring-1 ${colorRing}`}>
          {band}/{max}
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-slate-600">{note}</p>
    </div>
  );
}

/* ---------- Shared modal section primitives ---------- */

function ModalH({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mt-4 first:mt-0">
      {children}
    </h4>
  );
}

function SourceLine({ name, url }: { name: string; url?: string }) {
  return (
    <p className="text-sm text-slate-700">
      <span className="font-semibold text-slate-900">{name}</span>
      {url ? (
        <>
          {": "}
          <a href={url} target="_blank" rel="noopener" className="italic underline text-blue-700 break-all">
            {url}
          </a>
        </>
      ) : null}
    </p>
  );
}

function DL({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm">
      {rows.map((r, i) => (
        <div key={i} className="contents">
          <dt className="text-slate-600">{r.k}</dt>
          <dd className="font-semibold text-slate-900 tabular-nums">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function SampleStandard() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              Sample Premium Report
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              What&apos;s in the £4.99 Premium report, a worked example
            </h1>
            <p className="mt-4 max-w-2xl text-base text-gray-300">
              Sample address: <span className="text-white font-semibold">{ADDRESS}</span>. Every section below is identical in layout to the real report; the values are realistic mock data drawn from a typical London leasehold flat.
            </p>
            <div className="mt-6">
              <Link
                href="/check"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-slate-900 font-bold text-sm shadow hover:bg-slate-100"
              >
                Check a real UK property →
              </Link>
            </div>
          </div>
        </section>
        {/* Illustrative sample banner */}
        <div className="bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs text-amber-900 flex items-center gap-2">
            <span className="text-amber-700 font-bold uppercase tracking-wider">Illustrative sample</span>
            <span>This is a worked example for a fictional property at Flat 14, Sample Wharf House SE16 4ZZ. All figures are realistic but invented to demonstrate the report. Run a real check for your address from the homepage.</span>
          </div>
        </div>

        {/* Intro */}
        <section className="mx-auto max-w-4xl px-4 pt-10">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-700 leading-relaxed">
              This is what you receive five seconds after paying £4.99, a single permanent URL plus a branded PDF. The headline verdict sits at the top, then every flag is evidenced with the exact data source and a one-line explanation. You can scan it in 90 seconds or read every word; either way, you walk into the offer conversation with public data on your side. Every card has a <span className="font-semibold">View full evidence</span> button that pops the raw data, source URL, methodology and how to verify.
            </p>
          </div>
        </section>

        {/* Sample body */}
        <section className="mx-auto max-w-4xl px-4 py-10 space-y-5">
          {/* 1. Buyer's verdict */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-6">
            <p className="text-[10px] uppercase tracking-wider font-bold text-blue-800">Buyer&apos;s verdict</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Proceed with caution, four material flags to resolve before exchange.</h2>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              This 2017-built 2-bed leasehold flat looks well-located, but four issues need addressing before you commit. The registered owner is an overseas company (Guernsey, OCOD record) with two outstanding charges on the title. The building is on the BSR Higher-Risk Building register, which means lenders will ask for an EWS1 form before offering a mortgage. There are three Property Chamber tribunal cases against the building over service charges and major works since 2022. The address is in Flood Zone 2 (medium risk) and is post-2009 build, so it&apos;s not Flood Re-eligible, your insurance broker should price two or three quotes. None of this kills the deal, but it&apos;s 6-10% of negotiation room and around four questions for the conveyancer.
            </p>
            <DetailButton title="How this verdict is composed" label="How this verdict is composed →" accent="blue">
              <ModalH>Underlying data, every flag that fed in</ModalH>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><span className="font-semibold">Critical:</span> BSR Higher-Risk Building register entry (32m, 12 storeys, 48 units) + no published EWS1 form.</li>
                <li><span className="font-semibold">High:</span> overseas registered owner (Demo Properties Ltd, Guernsey OCOD record) with 2 outstanding charges on title.</li>
                <li><span className="font-semibold">High:</span> 3 First-tier Tribunal (Property Chamber) decisions against this building 2022-2024, pattern of leaseholder/freeholder disputes.</li>
                <li><span className="font-semibold">Medium:</span> Flood Zone 2 (1 in 1,000 annual probability) + post-2009 build so Flood Re NOT eligible.</li>
                <li><span className="font-semibold">Medium:</span> shrink-swell band 3/5 at this exact coordinate (moderate clay subsidence risk).</li>
                <li><span className="font-semibold">Low:</span> recorded crime 1,127 incidents in 12 months within 1 mile (~57% above the urban-1-mile national sample).</li>
                <li><span className="font-semibold">Low:</span> current EPC D (potential B), typical for 2017 flat, below proposed 2030 rental minimum.</li>
                <li><span className="font-semibold">Low:</span> asking 48.8% above 2019 first-sale vs Southwark HPI of +18.4%, premium baked into the price.</li>
              </ul>
              <ModalH>Data sources</ModalH>
              <p className="text-sm">Composed from every dataset in the cards below, BSR register, HMLR OCOD, Companies House, gov.uk Property Chamber decisions, Environment Agency NaFRA2, BGS GeoSure, MHCLG EPC, data.police.uk and HMLR Price Paid Data.</p>
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Rule-based scoring. Each flag has a fixed weight by category (critical = lender/legal blockers, high = material price/risk impact, medium = negotiable, low = informational). Flags are deduplicated, then ordered by severity. The headline (proceed with caution / proceed / step back) is set by the highest-weight unresolved flag. We never use a black-box model for the verdict; the inputs are transparent and reproducible.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Use this verdict as your conveyancer&apos;s starting checklist. Four flags to clear before exchange = roughly 6-10% of price renegotiation room and a 1-2 week extension to the legal phase. None of these flags individually kills the deal; the cluster is what matters.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Open each card below, every flag links to the underlying public dataset, an external URL to inspect the source yourself, and concrete next steps (which document to request, which register to search, which professional to instruct).</p>
            </DetailButton>
          </div>

          {/* 2. Sales history */}
          <Card title="Sales history" source="HM Land Registry, Price Paid Data">
            <div className="space-y-1">
              <Row label="Last sale (Aug 2019)" value="£312,500" hint="New build first sale" />
              <Row label="Asking now" value="£465,000" hint="48.8% above 2019 sale" />
              <Row label="Local UKHPI change since Aug 2019" value="+18.4%" hint="Southwark, all property" />
              <Row label="Implied above-market premium" value={<span className="text-amber-700">+25.7%</span>} hint="Compared with local HPI-adjusted sale" />
            </div>
            <div className="mt-4">
              <svg viewBox="0 0 400 90" className="w-full h-auto" role="img" aria-label="Sale price compared with local comparable">
                <text x="0" y="14" className="fill-slate-700" fontSize="11" fontWeight="600">Aug 2019 sale</text>
                <rect x="120" y="2" width="180" height="16" fill="#cbd5e1" rx="3" />
                <text x="305" y="14" className="fill-slate-800" fontSize="11" fontWeight="700">£312,500</text>
                <text x="0" y="46" className="fill-slate-700" fontSize="11" fontWeight="600">Nearby comp (2024)</text>
                <rect x="120" y="34" width="246" height="16" fill="#94a3b8" rx="3" />
                <text x="370" y="46" className="fill-slate-800" fontSize="11" fontWeight="700">£428,000</text>
                <text x="0" y="78" className="fill-slate-700" fontSize="11" fontWeight="600">Asking now</text>
                <rect x="120" y="66" width="268" height="16" fill="#f59e0b" rx="3" />
                <text x="392" y="78" className="fill-slate-800" fontSize="11" fontWeight="700">£465,000</text>
              </svg>
            </div>
            <DetailButton title="View full Land Registry record" label="View full Land Registry record →" accent="blue">
              <ModalH>Underlying data</ModalH>
              <DL rows={[
                { k: "Last recorded sale", v: "£312,500" },
                { k: "Date", v: "16 Aug 2019" },
                { k: "Sale type", v: "New build, first transfer from developer" },
                { k: "Tenure recorded", v: "Leasehold (250-year lease from 2018)" },
                { k: "Property type", v: "Flat / maisonette" },
                { k: "Estate type", v: "L (leasehold)" },
                { k: "PPD record category", v: "A (standard price paid)" },
                { k: "Earlier sales at address", v: "None" },
                { k: "Title number (sample)", v: "AGL512934" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="HM Land Registry, Price Paid Data (open data, SPARQL)" url="https://landregistry.data.gov.uk/app/ppd" />
              <p className="text-sm text-slate-600">Free, public, updated monthly. We query by postcode + PAON + SAON.</p>
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">For every address with at least one recorded sale, we calculate the implied current value by applying the Southwark UKHPI all-property index from the sale month to the latest available month (Apr 2026 in this sample). Asking price is compared with the HPI-adjusted value to derive the &quot;premium&quot;. We do NOT use AVM, the figure is a deterministic index adjustment.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">The asking price sits ~26% above where HPI would put the 2019 sale today. Some of that is genuine post-build optimisation but it&apos;s a useful anchor for the offer conversation: &quot;the index says ~£370k; what justifies +£95k?&quot;.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Order the £3 title register from gov.uk for the full proprietorship + price history, including pre-Aug 2019 plot title transactions if any.</p>
              <p className="text-sm"><a href="https://landregistry.data.gov.uk/app/ppd" target="_blank" rel="noopener" className="italic underline text-blue-700">landregistry.data.gov.uk/app/ppd</a></p>
            </DetailButton>
          </Card>

          {/* 3. EPC */}
          <Card title="EPC, energy performance" source="MHCLG EPC Register">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Current</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">D <span className="text-base font-semibold text-slate-500">(63)</span></p>
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: "63%" }} />
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 p-3 bg-emerald-50/40">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Potential</p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-900">B <span className="text-base font-semibold text-emerald-700">(84)</span></p>
                <div className="mt-2 h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "84%" }} />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <Row label="Floor area" value="67 m²" />
              <Row label="Habitable rooms" value="3" hint="2 bedrooms" />
              <Row label="Heating cost (current)" value="£1,840 / yr" hint="EPC modelled, gas + electric combined" />
              <Row label="Heating cost (potential)" value="£960 / yr" hint="If recommendations implemented" />
              <Row label="EPC valid until" value="Sep 2027" />
            </div>
            <DetailButton title="Full EPC certificate breakdown" label="Full EPC certificate breakdown →" accent="blue">
              <ModalH>Underlying data</ModalH>
              <DL rows={[
                { k: "Current rating", v: "D (62 SAP points)" },
                { k: "Potential rating", v: "B (84 SAP points)" },
                { k: "Inspection date", v: "12 Mar 2017" },
                { k: "Lodgement date", v: "14 Mar 2017" },
                { k: "Inspector / accreditation", v: "DEA cert. EPC-INS-484992 (Elmhurst)" },
                { k: "Property type", v: "Flat, top floor, 67 m²" },
                { k: "Construction age band", v: "England and Wales: 2012 onwards" },
                { k: "Main fuel", v: "Mains gas (community CHP not used)" },
                { k: "Main heating", v: "Boiler and radiators, mains gas" },
                { k: "Main heating controls", v: "Programmer, room thermostat + TRVs" },
                { k: "Hot water", v: "From main system" },
                { k: "Walls", v: "Cavity wall, as built, no insulation (assumed)" },
                { k: "Roof", v: "Another dwelling above" },
                { k: "Floor", v: "Another dwelling below" },
                { k: "Windows", v: "Fully double glazed" },
                { k: "Mains gas", v: "Yes" },
                { k: "Energy cost / year", v: "£1,840 (current) → £960 (potential)" },
              ]} />
              <ModalH>Recommended improvements (from certificate)</ModalH>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Cavity wall insulation, typical install £500-£1,500, saves £85/yr.</li>
                <li>High-performance external doors, saves £18/yr.</li>
                <li>Replace gas boiler with air source heat pump (post-2025 readiness), saves £210/yr.</li>
                <li>Solar PV 2.5 kWp (roof access via freeholder consent), saves £190/yr.</li>
              </ul>
              <ModalH>Data source</ModalH>
              <SourceLine name="MHCLG Get Energy Performance Data API (new endpoint)" url="https://api.get-energy-performance-data.communities.gov.uk" />
              <SourceLine name="Legacy fallback, Open Data Communities EPC register" url="https://epc.opendatacommunities.org" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">We fetch every EPC for this UPRN, sort by lodgement date and use the most recent valid certificate. EPCs are valid for 10 years from lodgement.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">D is below the government&apos;s proposed 2030 minimum rating for new tenancies (C). If you ever intend to let, factor in £4-8k of upgrades. For owner-occupiers, the realistic path to B requires freeholder consent for cavity-wall insulation and a heat pump.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Search the public register by postcode, the certificate, recommendations and SAP inputs are free.</p>
              <p className="text-sm"><a href="https://find-energy-certificate.service.gov.uk" target="_blank" rel="noopener" className="italic underline text-blue-700">find-energy-certificate.service.gov.uk</a></p>
            </DetailButton>
          </Card>

          {/* 4. Flood risk */}
          <Card title="Flood risk" source="Environment Agency NaFRA + Flood Zones" accent="amber">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Rivers &amp; sea</p>
                <p className="mt-1 text-xl font-bold text-slate-900">Medium</p>
                <p className="text-[11px] text-slate-600">Flood Zone 2, 1 in 1,000 annual probability</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Surface water</p>
                <p className="mt-1 text-xl font-bold text-slate-900">Low</p>
                <p className="text-[11px] text-slate-600">Outside 1 in 100 surface water extent</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3">
              <p className="text-[11px] uppercase tracking-wider font-bold text-amber-700">Flood Re eligibility</p>
              <p className="mt-1 text-sm text-slate-800">
                <span className="font-bold">Not eligible.</span> Flood Re only covers homes built before 1 January 2009. This property was built in 2017, so any flood-related insurance excess will be priced by the open market.
              </p>
            </div>
            <DetailButton title="Environment Agency NaFRA2 detail" label="Environment Agency NaFRA2 detail →" accent="blue">
              <ModalH>Underlying data</ModalH>
              <DL rows={[
                { k: "Flood Zone (planning)", v: "Zone 2, confirmed" },
                { k: "Rivers & sea, annual chance", v: "1 in 100 to 1 in 1,000 (medium)" },
                { k: "Surface water, annual chance", v: "Lower than 1 in 1,000 (very low)" },
                { k: "Reservoir flooding", v: "Not at risk" },
                { k: "Coastal flooding", v: "Not in coastal zone" },
                { k: "Flood warnings issued (12 months)", v: "0" },
                { k: "Recent flood incidents within 1 km", v: "0 since 2019" },
                { k: "Climate-change uplift (2080s)", v: "Modelled +25% peak rainfall" },
                { k: "Build year", v: "2017" },
                { k: "Flood Re eligible?", v: "No (built after 1 Jan 2009)" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="Environment Agency, Risk of Flooding from Rivers and Sea (NaFRA2)" url="https://environment.data.gov.uk/dataset/risk-of-flooding-from-rivers-and-sea" />
              <SourceLine name="Long Term Flood Risk service" url="https://check-long-term-flood-risk.service.gov.uk" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">We perform a spatial join from the property&apos;s OS coordinates to the EA risk grid (50 m cell). The four published bands are very low / low / medium / high. Surface water and reservoir layers are queried independently. Flood Re eligibility is set by build year &lt; 2009.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Medium river/sea risk on a 4th-floor flat means physical water ingress at your unit is very unlikely, but communal areas, basement plant rooms and the building&apos;s insurance premium are all affected. Expect a £200-£600/yr loading on buildings insurance; Flood Re is unavailable.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Run the postcode through the gov.uk service yourself, it&apos;s free.</p>
              <p className="text-sm"><a href="https://check-long-term-flood-risk.service.gov.uk" target="_blank" rel="noopener" className="italic underline text-blue-700">check-long-term-flood-risk.service.gov.uk</a></p>
              <p className="text-sm">If you intend to insure, get two or three indicative buildings + contents quotes BEFORE exchange.</p>
            </DetailButton>
          </Card>

          {/* 5. Ground risk panel */}
          <Card title="Ground risk, BGS GeoSure bands" source="British Geological Survey">
            <p className="text-xs text-slate-600 mb-3">The six geological hazard scores BGS rates for this exact location. Bands are 1 (very low) to 5 (very high).</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <GroundBand label="Shrink-swell clay" band={3} note="Moderate clay influence. Worth flagging to the surveyor, inspect window/door alignment + any past underpinning." />
              <GroundBand label="Landslide" band={1} note="No material landslide hazard at this address." />
              <GroundBand label="Coal mining" band={0} max={5} note="Not in a Coal Authority defined area." />
              <GroundBand label="Soluble rocks" band={0} max={5} note="No karstic or soluble bedrock present." />
              <GroundBand label="Collapsible deposits" band={0} max={5} note="No collapsible loess-type deposits present." />
              <GroundBand label="Running sand" band={0} max={5} note="No running-sand geology recorded." />
            </div>
            <DetailButton title="View all BGS GeoSure bands + methodology" label="View all BGS GeoSure bands + methodology →" accent="emerald">
              <ModalH>Underlying data, all 7 layers</ModalH>
              <DL rows={[
                { k: "Shrink-swell clay", v: "Band 3/5 (moderate, Lambeth Group clay)" },
                { k: "Landslide", v: "Band 1/5 (very low, no slope > 5°)" },
                { k: "Coal mining", v: "Band 0/5 (outside Coal Authority area)" },
                { k: "Soluble rocks", v: "Band 0/5 (no karst, no gypsum)" },
                { k: "Collapsible deposits", v: "Band 0/5 (no loess)" },
                { k: "Running sand", v: "Band 0/5 (no running-sand bedrock)" },
                { k: "Compressible ground", v: "Band 2/5 (alluvium near Thames, modest)" },
                { k: "Bedrock", v: "London Clay Formation (Eocene)" },
                { k: "Superficial deposits", v: "Made ground over river terrace deposits" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="BGS GeoSure Open Data" url="https://www.bgs.ac.uk/geology-projects/geosure/" />
              <p className="text-sm text-slate-600">Queried via the BGS ArcGIS REST endpoint at the property&apos;s lat/lng.</p>
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Each of the 7 layers is a point-in-polygon query against BGS&apos;s national grid. The band is the value of the polygon at the property coordinates (not interpolated). Shrink-swell band 3 is the trigger for surveyor attention, most subsidence claims in London originate here.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Band 3 shrink-swell + a 2017 build sitting on London Clay means the structure is in its first major thermal cycle. Heave/subsidence is more likely in dry summers (2018, 2022). Look at the building survey for crack patterns and ask the seller TA6 question 5 (subsidence history).</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Get a RICS Level 3 (Building Survey) if you&apos;re buying, Level 2 won&apos;t open up the cavity wall or do structural movement analysis.</p>
              <p className="text-sm"><a href="https://mapapps.bgs.ac.uk/geoindex/" target="_blank" rel="noopener" className="italic underline text-blue-700">mapapps.bgs.ac.uk/geoindex/</a> (free map viewer)</p>
            </DetailButton>
          </Card>

          {/* 6. Radon */}
          <Card title="Radon Affected Area" source="UKHSA / British Geological Survey">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200 px-3 py-1 text-sm font-bold tabular-nums">Band 1 / 6</div>
              <p className="text-sm text-slate-700">Very low radon potential. Less than 1% of homes here exceed the Action Level. No protective measures required by Building Regulations.</p>
            </div>
            <DetailButton title="UKHSA radon band detail" label="UKHSA radon band detail →" accent="emerald">
              <ModalH>Underlying data</ModalH>
              <DL rows={[
                { k: "Radon band", v: "1 of 6 (lowest)" },
                { k: "% of homes exceeding Action Level (200 Bq/m³)", v: "< 1%" },
                { k: "Building Regulations Part C requirement", v: "None for radon" },
                { k: "Lookup grid resolution", v: "1 km × 1 km" },
                { k: "Last dataset refresh", v: "Dec 2025" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="UKHSA UK Radon Map (operated with BGS)" url="https://www.ukradon.org" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">UKHSA publishes the national radon-affected-area dataset at 1 km grid resolution. We look up the grid cell containing the property and return the band (1 = lowest, 6 = highest).</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">No radon mitigation required. No need to commission radon-resistant construction details or post-occupation testing.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Order a free indicative radon report at ukradon.org with the full postcode. If you want absolute peace of mind, UKHSA sells a 3-month integrating test kit for about £50.</p>
            </DetailButton>
          </Card>

          {/* 7. Listed / Conservation / Article 4 */}
          <Card title="Designations, listed, conservation, TPO, Article 4" source="Historic England + Southwark Council">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Listed</p>
                <p className="mt-1 text-base font-bold text-emerald-900">Not listed</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Conservation Area</p>
                <p className="mt-1 text-base font-bold text-emerald-900">No</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">TPO</p>
                <p className="mt-1 text-base font-bold text-emerald-900">None</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Article 4</p>
                <p className="mt-1 text-base font-bold text-emerald-900">No restrictions</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-600">No planning constraints affect typical works. Standard permitted development applies, subject to leasehold consent.</p>
            <DetailButton title="Planning constraints data sources" label="Planning constraints data sources →" accent="emerald">
              <ModalH>Underlying data</ModalH>
              <DL rows={[
                { k: "Listed building (NHLE)", v: "Not listed (nearest grade II 320 m east)" },
                { k: "Conservation area", v: "None at coordinate (Wapping CA boundary 180 m south)" },
                { k: "Article 4 direction", v: "No Article 4 affects this address" },
                { k: "Tree Preservation Orders", v: "0 TPOs intersect title boundary" },
                { k: "Locally listed assets", v: "None" },
                { k: "Scheduled monument", v: "No" },
                { k: "World Heritage Site buffer", v: "Tower of London WHS buffer ends 480 m west" },
              ]} />
              <ModalH>Data sources</ModalH>
              <SourceLine name="Historic England, National Heritage List for England (NHLE)" url="https://historicengland.org.uk/listing/the-list/" />
              <SourceLine name="planning.data.gov.uk, conservation-area, article-4-direction, tree-preservation-order datasets" url="https://www.planning.data.gov.uk" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Each dataset is a published polygon set. We do a point-in-polygon test against the property coordinate. NHLE listings within 500 m are also reported for context.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">No planning constraints currently restrict typical permitted-development works. As a flat you&apos;ll still need leasehold consent and the freeholder&apos;s sign-off for any internal alteration affecting common parts. Tower of London buffer is informational only.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Use the public map viewer at planning.data.gov.uk, zoom to SE16 4ZZ and toggle the conservation / Article 4 / TPO layers.</p>
              <p className="text-sm"><a href="https://www.planning.data.gov.uk/map/" target="_blank" rel="noopener" className="italic underline text-blue-700">planning.data.gov.uk/map/</a></p>
            </DetailButton>
          </Card>

          {/* 8. BSR HRB */}
          <Card title="BSR Higher-Risk Building register" source="Building Safety Regulator" accent="red">
            <p className="text-sm text-slate-700">
              This building <span className="font-bold text-red-700">is registered</span> on the Building Safety Regulator&apos;s Higher-Risk Building register. Lenders will require an EWS1 form (rating A or B1) before issuing a mortgage offer.
            </p>
            <div className="mt-3 space-y-1">
              <Row label="Height" value="32 m" />
              <Row label="Storeys" value="12" hint="Flat is on storey 4 of 4 within podium block" />
              <Row label="Residential units" value="48" />
              <Row label="Principal Accountable Person" value="Demo Building Owner Ltd" />
              <Row label="Registration status" value="Active" />
            </div>
            <p className="mt-3 text-[11px] text-slate-600">
              Action: ask the freeholder for the current EWS1 form and any cladding remediation status before exchange.
            </p>
            <DetailButton title="Full BSR HRB entry + EWS1 implications" label="Full BSR HRB entry + EWS1 implications →" accent="amber">
              <ModalH>Underlying data, full register entry</ModalH>
              <DL rows={[
                { k: "HRB registration status", v: "Active" },
                { k: "Registration date", v: "1 Apr 2024" },
                { k: "BSR registration ref", v: "HRB-2024-13948" },
                { k: "Height above ground", v: "32 m" },
                { k: "Storeys (residential)", v: "12" },
                { k: "Residential units", v: "48" },
                { k: "Principal Accountable Person", v: "PAP Demo Building Owner Ltd (Co. # 11234567)" },
                { k: "Accountable persons", v: "1 (PAP only, no AP-only parts)" },
                { k: "Section 87 review submitted", v: "Yes, 14 Mar 2025" },
                { k: "Mandatory occurrence reports (rolling 12m)", v: "0" },
                { k: "Building Safety Case Report", v: "Filed 28 Aug 2024" },
                { k: "EWS1 form on file", v: "No (none published, none requested by freeholder)" },
                { k: "Cladding remediation", v: "Not on Building Safety Fund list as of Apr 2026" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="Building Safety Regulator, register of high-rise residential buildings" url="https://register-high-rise-building.service.gov.uk" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Per-postcode and per-building-name lookup against the BSR register, one HTTP request, anti-bulk-scraping rules respected. A property is flagged HRB if the building is ≥18 m or ≥7 storeys AND contains ≥2 residential units. EWS1 status is reported when present on the public file.</p>
              <ModalH>What this means for you, lender implications</ModalH>
              <p className="text-sm">Since the post-Grenfell consolidation, ALL mainstream UK lenders (Nationwide, Halifax, Santander, Barclays, HSBC, NatWest, etc.) require an EWS1 grade A1, A2, A3 or B1 before issuing a mortgage offer on flats in a building of this height. B2 is not mortgageable without remediation works funded.</p>
              <p className="text-sm">Without an EWS1 you cannot complete a purchase using a mortgage. Cash buyers are unaffected legally but face the same problem at exit.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Before anything else, instruct your conveyancer to request from the freeholder, in writing:</p>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>The current EWS1 form (and date of survey).</li>
                <li>The FRAEW (Fire Risk Appraisal of External Walls) if EWS1 is &gt; 5 years old.</li>
                <li>A Section 87 Annual Statement / safety case summary.</li>
                <li>Status on any Building Safety Fund / Cladding Safety Scheme application.</li>
              </ol>
              <p className="text-sm"><a href="https://www.gov.uk/guidance/find-a-high-rise-residential-building" target="_blank" rel="noopener" className="italic underline text-blue-700">gov.uk/guidance/find-a-high-rise-residential-building</a></p>
            </DetailButton>
          </Card>

          {/* 9. Owner check */}
          <Card title="Registered owner, overseas company" source="HMLR OCOD + Companies House" accent="amber">
            <div className="space-y-1">
              <Row label="Owner" value="Demo Properties Ltd" />
              <Row label="Jurisdiction" value="Guernsey (overseas)" />
              <Row label="Company number" value="12345 (Guernsey Registry)" />
              <Row label="Status" value="Active" />
              <Row label="Incorporated" value="14 Mar 2018" />
              <Row label="Registered address" value="PO Box 119, St Peter Port, Guernsey GY1 4ND" />
              <Row label="Outstanding charges on title" value={<span className="text-amber-700">2</span>} />
              <Row label="Insolvency / disqualified directors" value="0" />
              <Row label="Register of Overseas Entities" value={<span className="text-amber-700">Verify</span>} hint="Required for ALL overseas owners since 2023" />
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3">
              <p className="text-[11px] uppercase tracking-wider font-bold text-amber-800">Outstanding charges</p>
              <ol className="mt-2 space-y-2 text-xs text-slate-700">
                <li><span className="font-semibold text-slate-900">Charge 1, 14 Mar 2018.</span> Lender: Capital Sample Bank plc. Classification: legal mortgage over property. Status: outstanding.</li>
                <li><span className="font-semibold text-slate-900">Charge 2, 08 Sep 2021.</span> Lender: Demo Finance plc. Classification: debenture (floating + fixed). Status: outstanding.</li>
              </ol>
            </div>
            <p className="mt-3 text-[11px] text-slate-600">
              See on <Link href="https://find-and-update.company-information.service.gov.uk/" className="underline text-blue-700">Companies House</Link>.
            </p>
            <DetailButton title="Companies House full record" label="Companies House full record →" accent="purple">
              <ModalH>Underlying data, company</ModalH>
              <DL rows={[
                { k: "Company name", v: "Demo Properties Ltd" },
                { k: "Jurisdiction", v: "Guernsey" },
                { k: "Companies House overseas number", v: "FC012345" },
                { k: "Incorporated", v: "12 Feb 2017" },
                { k: "Status", v: "Active" },
                { k: "Registered office", v: "PO Box 119, St Peter Port, Guernsey GY1 4ND" },
                { k: "Service address", v: "c/o Sample Trust Services, GY1 4ND" },
                { k: "Nature of business (SIC)", v: "68209 Other letting and operating of own or leased real estate" },
                { k: "Officers (current)", v: "3 directors, 1 secretary" },
                { k: "PSC (UK Register of People with Significant Control)", v: "1 named individual, 75%+ ownership" },
                { k: "Last accounts filed", v: "31 Dec 2024 (small company exemption)" },
                { k: "Last confirmation statement", v: "12 Feb 2026" },
                { k: "Insolvency cases", v: "0" },
              ]} />
              <ModalH>Underlying data, charges</ModalH>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><span className="font-semibold">Charge 12345</span>, Mortgage to Capital Sample Bank plc. Created 14 Mar 2018, registered 21 Mar 2018. Status: outstanding. Particulars: a legal mortgage on the freehold/leasehold property at Flat 14, Sample Wharf House.</li>
                <li><span className="font-semibold">Charge 67890</span>, Debenture (floating and fixed) to Demo Finance plc. Created 1 Sep 2021, registered 8 Sep 2021. Status: outstanding. Particulars: a fixed charge over book debts and a floating charge over the undertaking and all assets of the company.</li>
              </ul>
              <ModalH>Data sources</ModalH>
              <SourceLine name="HMLR, Overseas Companies that own land (OCOD)" url="https://use-land-property-data.service.gov.uk" />
              <SourceLine name="Companies House, /company, /charges, /insolvency, /officers" url="https://api.company-information.service.gov.uk" />
              <SourceLine name="HMRC / BEIS Register of Overseas Entities (ECTEA 2022)" url="https://www.gov.uk/guidance/register-an-overseas-entity" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Address → HMLR CCOD/OCOD lookup. If the registered proprietor is corporate, we then run /company/{`{number}`}/charges, /insolvency, /officers and /persons-with-significant-control. Overseas companies are flagged automatically because they trigger the ECTEA 2022 Register of Overseas Entities requirement.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Overseas company seller adds a 2-4 week complexity layer:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Verify Register of Overseas Entities (ROE) compliance, without a valid ID, HMLR may refuse to register the TR1 transfer.</li>
                <li>Confirm DS1 discharge for BOTH charges will be filed on completion (your conveyancer drafts undertakings).</li>
                <li>Check that the Guernsey directors have authority to execute the transfer under local law (often a board resolution + bring-down certificate).</li>
                <li>SDLT non-resident 2% surcharge does NOT apply to you as buyer, but the seller&apos;s offshore status can complicate the CGT side and slow the chain.</li>
              </ul>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Three free searches before exchange:</p>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Companies House, <a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noopener" className="italic underline text-blue-700">find-and-update.company-information.service.gov.uk</a></li>
                <li>Register of Overseas Entities, <a href="https://find-and-update.company-information.service.gov.uk/register-of-overseas-entities" target="_blank" rel="noopener" className="italic underline text-blue-700">find-and-update.company-information.service.gov.uk/register-of-overseas-entities</a></li>
                <li>HMLR title register (£3) for proprietorship and charge confirmation.</li>
              </ol>
            </DetailButton>
          </Card>

          {/* 10. Tribunal */}
          <Card title="Property Chamber tribunal history" source="First-tier Tribunal (Property Chamber)" accent="amber">
            <p className="text-sm text-slate-700">
              Three published tribunal decisions involve this building since 2022. None individually disqualifies the purchase, but the pattern suggests an active freeholder dispute, request the last 3 years of service-charge accounts before exchange.
            </p>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-amber-800">LON/00DD/LSC/2024/0142 · Feb 2024</p>
                <p className="mt-1 font-semibold text-slate-900">Service-charge dispute, s.27A LTA 1985</p>
                <p className="text-[12px] text-slate-700">Leaseholders challenged the reasonableness of communal cleaning + concierge costs. Tribunal reduced the 2023 charge by £14,200 across the block.</p>
              </li>
              <li className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-amber-800">LON/00DD/HMK/2023/0089 · Aug 2023</p>
                <p className="mt-1 font-semibold text-slate-900">Major works recovery, s.20 LTA 1985 consultation</p>
                <p className="text-[12px] text-slate-700">Freeholder sought £6,400 per flat for external repairs. Tribunal found the s.20 consultation was procedurally defective; recovery capped at £250 per flat.</p>
              </li>
              <li className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-amber-800">LON/00DD/RTM/2022/0031 · Mar 2022</p>
                <p className="mt-1 font-semibold text-slate-900">Right to Manage application</p>
                <p className="text-[12px] text-slate-700">RTM Company application denied on procedural grounds (defective claim notice). Building remains under freeholder management; suggests appetite for further RTM attempts.</p>
              </li>
            </ol>
            <DetailButton title="View all 3 tribunal decisions" label="View all 3 tribunal decisions →" accent="amber">
              <ModalH>Case 1, LON/00DD/LSC/2023/0142</ModalH>
              <DL rows={[
                { k: "Case reference", v: "LON/00DD/LSC/2023/0142" },
                { k: "Category", v: "Service charges, s.27A Landlord and Tenant Act 1985" },
                { k: "Hearing date", v: "12 Feb 2024" },
                { k: "Applicants", v: "8 leaseholders, Sample Wharf House" },
                { k: "Respondent", v: "PAP Demo Building Owner Ltd" },
                { k: "Sum in dispute", v: "£18,400 (concierge + cleaning, 2023 charge year)" },
                { k: "Decision", v: "In favour of leaseholders" },
                { k: "Disallowed", v: "£18,400, found non-compliant with s.20 consultation requirements" },
                { k: "Order on costs", v: "s.20C order made (landlord cannot recover its costs via service charge)" },
              ]} />
              <ModalH>Case 2, LON/00DD/LSC/2022/0089</ModalH>
              <DL rows={[
                { k: "Case reference", v: "LON/00DD/LSC/2022/0089" },
                { k: "Category", v: "Reasonableness of major works recovery, s.27A LTA 1985" },
                { k: "Hearing date", v: "22 Aug 2023" },
                { k: "Applicants", v: "Freeholder (PAP Demo Building Owner Ltd)" },
                { k: "Respondents", v: "Lessees of Sample Wharf House" },
                { k: "Sum in dispute", v: "£127,000 (external repairs)" },
                { k: "Decision", v: "In favour of freeholder" },
                { k: "Outcome", v: "Tribunal confirmed major works costs of £127,000 reasonable; fully recoverable from leaseholders" },
              ]} />
              <ModalH>Case 3, LON/00DD/RTM/2021/0021</ModalH>
              <DL rows={[
                { k: "Case reference", v: "LON/00DD/RTM/2021/0021" },
                { k: "Category", v: "Right to Manage, formation of RTM company" },
                { k: "Hearing date", v: "4 Mar 2022" },
                { k: "Applicant", v: "Sample Wharf House RTM Company Ltd" },
                { k: "Respondent", v: "PAP Demo Building Owner Ltd" },
                { k: "Decision", v: "RTM granted" },
                { k: "Update (informational)", v: "RTM later relinquished by leaseholders in 2024 (no formal tribunal record; reported in 2024 LSC decision narrative)" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="gov.uk, Property Chamber (First-tier Tribunal) decisions" url="https://www.gov.uk/residential-property-tribunal-decisions" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">We ingest the gov.uk decision feed daily, parse the structured metadata (case ref, category, date, parties), and run a fuzzy match by postcode + building name. We surface every published decision for the building, in date order, with the disposition (in favour of leaseholder / freeholder / neutral) where parsable.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">A pattern of three tribunal cases since 2021 is unusual. Two went against the freeholder (s.20 consultation + concierge cost reasonableness), one against the leaseholders (the £127k major works recovery). RTM was attempted and then relinquished. Combined picture: contested service-charge environment, freeholder still in control.</p>
              <p className="text-sm">Ask your conveyancer for: the last 3 years&apos; service-charge accounts, the s.20 notice for the £127k works, and any pending or contemplated tribunal applications.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Search the decisions database by case reference or postcode.</p>
              <p className="text-sm"><a href="https://www.gov.uk/residential-property-tribunal-decisions" target="_blank" rel="noopener" className="italic underline text-blue-700">gov.uk/residential-property-tribunal-decisions</a></p>
            </DetailButton>
          </Card>

          {/* 11. AI seller-question pack */}
          <Card title="AI seller-question pack" source="Generated from the flags above">
            <p className="text-xs text-slate-600 mb-4">Eight specific questions to ask the seller (or their agent) before you submit an offer. Each is grounded in a flag above so the seller can&apos;t deflect with &quot;that doesn&apos;t apply&quot;.</p>
            <ol className="space-y-3 text-sm text-slate-700">
              <li>
                <p className="font-semibold text-slate-900">1. Is there a current EWS1 form for this building, and what is the rating?</p>
                <p className="text-[12px] text-slate-600">The building is on the BSR HRB register, all mainstream lenders will ask. Without an A or B1 rating you may struggle to mortgage.</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">2. Is Demo Properties Ltd registered on the UK Register of Overseas Entities (ID number)?</p>
                <p className="text-[12px] text-slate-600">Overseas owners have been required to register since 2023; without an ID, HMLR may refuse to register the transfer.</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">3. Will both outstanding charges (Capital Mortgages, Sample Finance) be discharged on completion?</p>
                <p className="text-[12px] text-slate-600">Standard but worth confirming in writing given there are two charges, not one.</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">4. Please provide the service-charge accounts for years ending 2022, 2023 and 2024.</p>
                <p className="text-[12px] text-slate-600">Three tribunal cases since 2022, you need to see the underlying numbers, not just the seller&apos;s summary.</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">5. Has a further major-works s.20 consultation been issued since the 2023 tribunal capped recovery at £250?</p>
                <p className="text-[12px] text-slate-600">The freeholder may re-attempt with proper procedure, find out before exchange.</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">6. What are the current service charge and reserve fund balances?</p>
                <p className="text-[12px] text-slate-600">Reserve fund matters when there&apos;s a recent s.20 dispute and a BSR HRB on the building.</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">7. Has there been any subsidence claim or movement noted in the building survey since handover in 2018?</p>
                <p className="text-[12px] text-slate-600">Shrink-swell band 3 plus a 2017-build means the structure is in its first major thermal cycle, worth asking.</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">8. Why is the asking price 49% above the 2019 first-sale, when local HPI is up only 18%?</p>
                <p className="text-[12px] text-slate-600">Anchors the price conversation in public data rather than the seller&apos;s aspirations.</p>
              </li>
            </ol>
            <DetailButton title="How these questions are generated" label="How these questions are generated →" accent="indigo">
              <ModalH>Underlying data, what the model receives</ModalH>
              <p className="text-sm">The seller-question pack is generated from a structured JSON object containing every flag detected on this page, BSR HRB status, EWS1 absence, OCOD overseas owner, charge particulars, tribunal case refs and outcomes, flood zone, BGS bands, EPC, sales history and crime delta. No free-text scrape; only the parsed structured records.</p>
              <ModalH>Methodology</ModalH>
              <p className="text-sm">Claude Sonnet 4.6 is given a system prompt that:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Forbids generic questions (&quot;is there anything I should know&quot;).</li>
                <li>Requires each question to cite a specific data point on this page.</li>
                <li>Demands lawyer/conveyancer phrasing the seller can&apos;t deflect.</li>
                <li>Targets 8-12 questions, ranked by priority and tagged to an audience (seller / agent / conveyancer / freeholder).</li>
              </ul>
              <p className="text-sm">Output is a JSON array of {`{question, rationale, audience, priority}`} which is then rendered as the numbered list above.</p>
              <ModalH>Data source</ModalH>
              <SourceLine name="Anthropic Claude API, Sonnet 4.6, structured JSON output, temperature 0.2" />
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Forward the list verbatim to your conveyancer or agent. The phrasing is deliberately direct, designed to flush out compliance gaps without sounding accusatory. Skip any question that doesn&apos;t apply once an earlier answer rules it out.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Every numbered question is anchored to a specific card above. Click back through to the underlying evidence if the seller pushes back.</p>
            </DetailButton>
          </Card>

          {/* 12. Crime */}
          <Card title="Crime, 12 months within 1 mile" source="data.police.uk">
            <Row label="Total recorded incidents" value="1,127" hint="ASB, violence, theft and burglary combined" />
            <Row label="National average (urban 1-mile sample)" value="842" />
            <Row label="vs national" value={<span className="text-amber-700">+34%</span>} />
            <div className="mt-4">
              <svg viewBox="0 0 400 60" className="w-full h-auto" role="img" aria-label="Crime vs national average">
                <text x="0" y="14" className="fill-slate-700" fontSize="11" fontWeight="600">National avg</text>
                <rect x="120" y="2" width="180" height="16" fill="#94a3b8" rx="3" />
                <text x="305" y="14" className="fill-slate-800" fontSize="11" fontWeight="700">842</text>
                <text x="0" y="46" className="fill-slate-700" fontSize="11" fontWeight="600">This address</text>
                <rect x="120" y="34" width="241" height="16" fill="#f59e0b" rx="3" />
                <text x="365" y="46" className="fill-slate-800" fontSize="11" fontWeight="700">1,127</text>
              </svg>
            </div>
            <p className="mt-3 text-[11px] text-slate-600">Typical Zone 1/2 inner London profile, driven by daytime ASB and theft in nearby retail areas, not residential burglary at the building itself.</p>
            <DetailButton title="Full crime breakdown by category" label="Full crime breakdown by category →" accent="blue">
              <ModalH>Underlying data, 12 months, 1-mile radius</ModalH>
              <DL rows={[
                { k: "Total incidents", v: "1,127" },
                { k: "Anti-social behaviour", v: "312" },
                { k: "Violence and sexual offences", v: "218" },
                { k: "Theft from the person + bicycle + other theft", v: "154" },
                { k: "Burglary (residential + commercial)", v: "89" },
                { k: "Vehicle crime", v: "67" },
                { k: "Criminal damage and arson", v: "54" },
                { k: "Drugs", v: "47" },
                { k: "Public order, weapons, shoplifting, other", v: "186" },
                { k: "Period covered", v: "Apr 2025 - Mar 2026 (rolling 12 months)" },
                { k: "National urban-1-mile average", v: "842 / yr (~720 base)" },
                { k: "This address vs national", v: "+34% (driven by ASB + theft, not burglary)" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="data.police.uk, Open Data API (Home Office)" url="https://data.police.uk" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Lat/lng query with a 1-mile (1.609 km) radius, rolling 12-month window. Categories follow the Home Office Crime Outcomes classification. We strip duplicates and aggregate by category. The national baseline is built from a stratified sample of urban 1-mile cells.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Above national average is expected for inner London Zone 1/2. The pattern matters more than the headline: most of the +34% is daytime ASB and theft around nearby retail strips. Residential burglary (89) is actually average. Personal-safety walking home at night is the more relevant question, use Police.uk&apos;s street-level map to compare your specific route.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Open the data.police.uk interactive map and drag the marker to SE16 4ZZ. Toggle individual categories.</p>
              <p className="text-sm"><a href="https://www.police.uk" target="_blank" rel="noopener" className="italic underline text-blue-700">police.uk</a></p>
            </DetailButton>
          </Card>

          {/* 13. Schools */}
          <Card title="Schools, five nearest" source="DfE Edubase + Ofsted">
            <ul className="divide-y divide-slate-100">
              <li className="py-2 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">St Paul&apos;s Whitechapel C of E Primary</p>
                  <p className="text-[11px] text-slate-500">Primary · ages 3-11</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200">Outstanding</span>
                  <p className="text-[11px] text-slate-500 mt-1 tabular-nums">0.3 mi</p>
                </div>
              </li>
              <li className="py-2 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Wapping Wharf Primary</p>
                  <p className="text-[11px] text-slate-500">Primary · ages 4-11</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200">Good</span>
                  <p className="text-[11px] text-slate-500 mt-1 tabular-nums">0.5 mi</p>
                </div>
              </li>
              <li className="py-2 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Example Quay Academy</p>
                  <p className="text-[11px] text-slate-500">Secondary · ages 11-16</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200">Outstanding</span>
                  <p className="text-[11px] text-slate-500 mt-1 tabular-nums">0.6 mi</p>
                </div>
              </li>
              <li className="py-2 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Limehouse Cut School</p>
                  <p className="text-[11px] text-slate-500">All-through · ages 4-18</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200">Good</span>
                  <p className="text-[11px] text-slate-500 mt-1 tabular-nums">0.8 mi</p>
                </div>
              </li>
              <li className="py-2 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Shadwell Free School</p>
                  <p className="text-[11px] text-slate-500">Primary · ages 4-11</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200">Good</span>
                  <p className="text-[11px] text-slate-500 mt-1 tabular-nums">0.9 mi</p>
                </div>
              </li>
            </ul>
            <DetailButton title="GIAS school-by-school data" label="GIAS school-by-school data →" accent="blue">
              <ModalH>Underlying data</ModalH>
              <DL rows={[
                { k: "St Paul's Whitechapel C of E Primary", v: "Outstanding · last inspection 14 Nov 2023 · 215 pupils · capacity 240 · ages 3-11" },
                { k: "South Sample Secondary Federation", v: "Outstanding · last inspection 8 Feb 2024 · 1,420 pupils · ages 4-18" },
                { k: "Wapping Wharf Primary", v: "Good · last inspection 22 May 2023 · 308 pupils · capacity 420 · ages 4-11" },
                { k: "Example Quay Academy", v: "Good · last inspection 9 Oct 2024 · 712 pupils · ages 11-16" },
                { k: "Shadwell Free School", v: "Good · last inspection 17 Jan 2024 · 196 pupils · ages 4-11" },
                { k: "Schools within 1.5 km (all phases)", v: "12 (5 nearest shown above)" },
                { k: "Ofsted outcomes within 1.5 km", v: "2 Outstanding, 8 Good, 2 Requires Improvement" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="GIAS, Get Information About Schools (DfE)" url="https://get-information-schools.service.gov.uk" />
              <SourceLine name="Ofsted school inspection reports" url="https://reports.ofsted.gov.uk" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Haversine distance from the property to the 8 nearest registered schools, filtered to state-funded and registered independent (no nurseries-only). Each school is joined to its latest published Ofsted inspection grade. Catchment data is not used in this £4.99 tier (it varies year-on-year and is set by the LA).</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Strong primary options on the doorstep, an Outstanding secondary federation within a mile. If you intend to send children to a specific school, contact the LA admissions team for the actual previous-year cut-off distance, Ofsted rating is not a substitute for catchment.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Full inspection PDFs are free. Performance tables (KS2/KS4 results) are at gov.uk/school-performance-tables.</p>
              <p className="text-sm"><a href="https://www.gov.uk/school-performance-tables" target="_blank" rel="noopener" className="italic underline text-blue-700">gov.uk/school-performance-tables</a></p>
            </DetailButton>
          </Card>

          {/* 14. Council tax */}
          <Card title="Council tax" source="Valuation Office Agency + Southwark Council">
            <Row label="Band" value="E" />
            <Row label="Annual charge (2025-26)" value="£2,341" hint="Southwark, single dwelling" />
            <Row label="Parish precept" value="£0" />
            <Row label="GLA precept" value="£471 (included)" />
            <DetailButton title="Council tax breakdown" label="Council tax breakdown →" accent="blue">
              <ModalH>Underlying data, Band E, Southwark, 2025/26</ModalH>
              <DL rows={[
                { k: "Council tax band", v: "E" },
                { k: "Annual charge", v: "£2,341" },
                { k: "Monthly charge (10 instalments)", v: "£234.10" },
                { k: "Monthly charge (12 instalments)", v: "£195.08" },
                { k: "Southwark element", v: "£1,624" },
                { k: "GLA precept (Mayor of London)", v: "£471" },
                { k: "Adult social care precept", v: "£246" },
                { k: "Parish precept", v: "£0 (no parish)" },
                { k: "Empty home premium (after 1 year)", v: "100% surcharge" },
                { k: "Single-person discount", v: "25%" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="Valuation Office Agency, Council tax bands" url="https://www.gov.uk/council-tax-bands" />
              <SourceLine name="Southwark Council, 2025/26 council tax tables" url="https://www.towerhamlets.gov.uk/council-tax" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Postcode → local authority. VOA returns the band. The LA&apos;s published annual schedule provides the band-specific charge including precepts.</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Band E is typical for a 2-bed central-London flat. Budget ~£195/month. Parking permits, communal-bin charges and any waste-collection charges are separate from council tax, confirm with Southwark resident parking zone if you drive.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Enter the postcode at gov.uk/council-tax-bands for the official VOA confirmation.</p>
              <p className="text-sm"><a href="https://www.gov.uk/council-tax-bands" target="_blank" rel="noopener" className="italic underline text-blue-700">gov.uk/council-tax-bands</a></p>
            </DetailButton>
          </Card>

          {/* 15. Broadband + mobile */}
          <Card title="Broadband and mobile coverage" source="Ofcom Connected Nations">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Broadband</p>
                <p className="mt-1 text-base font-bold text-slate-900">Full fibre to the premises</p>
                <p className="text-[11px] text-slate-600">Up to 1 Gbps available, Hyperoptic and BT Openreach FTTC / FTTP.</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Mobile (indoor)</p>
                <p className="mt-1 text-base font-bold text-slate-900">4G + 5G, all four carriers</p>
                <p className="text-[11px] text-slate-600">EE, Vodafone, O2, Three all rated &quot;good&quot; for indoor voice + data.</p>
              </div>
            </div>
            <DetailButton title="Ofcom Connected Nations detail" label="Ofcom Connected Nations detail →" accent="blue">
              <ModalH>Underlying data, broadband</ModalH>
              <DL rows={[
                { k: "Full-fibre (FTTP) available", v: "Yes, BT Openreach + Hyperoptic" },
                { k: "Max download (any tech)", v: "1,000 Mbps (1 Gbps)" },
                { k: "Max upload (any tech)", v: "1,000 Mbps symmetric" },
                { k: "Superfast (≥30 Mbps) available", v: "Yes" },
                { k: "Ultrafast (≥300 Mbps) available", v: "Yes" },
                { k: "Gigabit-capable", v: "Yes" },
                { k: "Universal Service Obligation eligible", v: "Yes (USO ≥10 Mbps)" },
                { k: "Provider count at premises", v: "5 (BT, Sky, Virgin Media, Hyperoptic, TalkTalk)" },
              ]} />
              <ModalH>Underlying data, mobile (indoor)</ModalH>
              <DL rows={[
                { k: "EE, voice", v: "Good" },
                { k: "EE, data 4G", v: "Good" },
                { k: "EE, 5G outdoor", v: "Available" },
                { k: "Vodafone, voice/data 4G", v: "Good / Good" },
                { k: "Vodafone, 5G outdoor", v: "Available" },
                { k: "O2, voice/data 4G", v: "Good / Good" },
                { k: "O2, 5G outdoor", v: "Available" },
                { k: "Three, voice/data 4G", v: "Good / Good" },
                { k: "Three, 5G outdoor", v: "Available" },
              ]} />
              <ModalH>Data source</ModalH>
              <SourceLine name="Ofcom Connected Nations dataset (annual + bi-annual updates)" url="https://www.ofcom.org.uk/research-and-data/multi-sector-research/infrastructure-research" />
              <SourceLine name="Ofcom Broadband and Mobile Coverage Checker (per-postcode lookup)" url="https://checker.ofcom.org.uk" />
              <ModalH>How we compute the verdict</ModalH>
              <p className="text-sm">Per-premises lookup against Ofcom&apos;s FixedBroadbandChecker dataset (FTTP/FTTC/cable availability + max headline speed) and MobileCoverageChecker (4G/5G indoor and outdoor by carrier).</p>
              <ModalH>What this means for you</ModalH>
              <p className="text-sm">Future-proof connectivity. Gigabit fibre + 5G on every major network means working from home, streaming and multi-device households are all comfortable. No need to engineer signal boosters or external aerials.</p>
              <ModalH>How to verify / next step</ModalH>
              <p className="text-sm">Run the postcode through Ofcom&apos;s public checker for an authoritative confirmation.</p>
              <p className="text-sm"><a href="https://checker.ofcom.org.uk" target="_blank" rel="noopener" className="italic underline text-blue-700">checker.ofcom.org.uk</a></p>
            </DetailButton>
          </Card>
        </section>

        {/* CTA */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Want the same for any UK property?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Enter a postcode below, pick your address, and you&apos;ll be on this page in under five seconds for £4.99. Branded PDF + permanent URL included.
            </p>
            <div className="mt-6 flex justify-center"><PostcodeLookup /></div>
            <p className="mt-6 text-xs text-slate-500">
              Or see the upgrade: <Link href="/sample-plus" className="text-blue-700 underline">Premium+ sample (£6.99)</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
