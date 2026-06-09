import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { DetailButton } from "@/components/SampleDetailModal";

export const metadata: Metadata = {
  title: "Sample Mortgage Broker Brief",
  description:
    "See a real worked example of the AI Mortgage Broker Brief included with the £6.99 Premium+ report. Lender-risk flags spotted before you apply.",
  alternates: { canonical: "https://homebuyercheck.co.uk/sample-mortgage" },
};

type Priority = "critical" | "high" | "medium" | "low";

const PRIORITY_STYLES: Record<Priority, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-amber-100 text-amber-800",
  medium: "bg-slate-100 text-slate-800",
  low: "bg-slate-50 text-slate-600",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

type Item = {
  priority: Priority;
  heading: string;
  finding: string;
  action: string;
};

const ITEMS: Item[] = [
  {
    priority: "critical",
    heading: "BSR Higher-Risk Building with no confirmed EWS1",
    finding:
      "The building (Sample Wharf House, 32m / 12 storeys / 48 flats) is on the Building Safety Regulator's Higher-Risk Building register. No EWS1 form has been disclosed by the seller. Across all mainstream lenders, an HRB without an EWS1 rating of A or B1 is not lendable.",
    action:
      "Do not submit a mortgage application until you have a copy of the EWS1 form (or written confirmation that one is in progress) from the Principal Accountable Person. Verify the rating with a qualified, FCA-regulated broker before paying any application fee. Lender policy on EWS1 changes frequently and varies by valuation panel: always verify with a qualified broker against current published criteria.",
  },
  {
    priority: "high",
    heading: "Flood Zone 2, post-2009 build (Flood Re may not apply)",
    finding:
      "Environment Agency mapping shows Flood Zone 2 (0.1%-1% annual probability). Property was built in 2017, after the Flood Re scheme cut-off date of 1 January 2009. Flood Re therefore does not apply to its buildings insurance.",
    action:
      "Obtain a specialist buildings insurance quote in writing before submitting the mortgage application. Lenders require buildings insurance from exchange; without a quote in hand the application can stall. Verify with a qualified broker whether your shortlisted lenders will accept non-Flood Re cover at standard rates.",
  },
  {
    priority: "medium",
    heading: "Overseas-entity seller (process timing risk)",
    finding:
      "Registered proprietor is Demo Properties Ltd (Guernsey). The Register of Overseas Entities checks under the Economic Crime (Transparency and Enforcement) Act 2022 must be live at completion. This is primarily a solicitor concern, but mortgage offers have a finite validity and can lapse if ROE delays push completion out.",
    action:
      "Speak to a qualified broker about realistic timelines and whether the lender will extend the offer (typically 3 or 6 months from offer date) if completion slips. Ask the broker which lenders on your shortlist are most flexible on offer extensions for overseas-entity transactions.",
  },
  {
    priority: "medium",
    heading: "Top-floor flat in a block facing potential remediation cost",
    finding:
      "BSR HRB blocks face possible external-wall remediation under the Building Safety Act 2022. Even where the freeholder or developer bears the work, lenders ask about the service charge reserve fund, current and forecast service charges, and any pending major-works (s.20 LTA 1985) consultations.",
    action:
      "Provide your broker with the LPE1, the last three years of service-charge accounts, and the reserve fund balance. Some lenders cap service charges as a percentage of income. Verify with a qualified broker whether the disclosed numbers fit each lender's affordability model.",
  },
  {
    priority: "low",
    heading: "EPC D (Green Mortgage exclusion)",
    finding:
      "Current EPC rating D (SAP 64); potential B (SAP 84). Most mainstream lenders no longer penalise sub-C ratings, but the discounted Green Mortgage range (cashback or rate uplift) is reserved for properties with an EPC rating of A, B or C at completion.",
    action:
      "If the seller is willing to fund or split low-cost EPC uplifts pre-completion (typically lighting, low-flow regulators, smart controls) the property may reach C. The cashback or rate margin can repay that investment within the first fix. Verify with a qualified broker whether the specific Green Mortgage product gain on your case justifies it.",
  },
];

const FRAMEWORKS = [
  "CCJ, default and IVA flags on the registered proprietor",
  "EWS1 form requirements under the Building Safety Act 2022",
  "Flood Re scheme eligibility (pre-2009 build cut-off)",
  "Non-standard construction flags (concrete, timber, steel-frame, cavity status)",
  "Listed-building grade lending policy (Grade I / II* / II)",
  "Ground stability flags (BGS shrink-swell, mining, soluble rocks)",
];

const TIMELINE = [
  {
    when: "Offer accepted",
    what:
      "Send the brief to your mortgage broker before you submit any application. Lender choice changes dramatically once cladding, flood or overseas-entity flags are surfaced.",
  },
  {
    when: "Before application",
    what:
      "Use the brief to triage the broker's lender shortlist. Critical flags eliminate panels of lenders entirely; high flags narrow the rate selection. Better to know now than at decline.",
  },
  {
    when: "After offer",
    what:
      "Track open items against the offer validity period. ROE delays and EWS1 chase can push completion past offer expiry and force a re-application.",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-amber-700">
      {children}
    </h4>
  );
}

function DataList({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-4 gap-y-1.5 text-[13px]">
      {rows.map((r, i) => (
        <div key={i} className="contents">
          <dt className="font-semibold text-slate-900">{r.k}</dt>
          <dd className="text-slate-700 tabular-nums">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border-l-4 border-amber-300 bg-amber-50/60 px-4 py-3 text-[13px] leading-relaxed text-slate-800 whitespace-pre-line">
      {children}
    </div>
  );
}

function SourceLine({ children }: { children: React.ReactNode }) {
  return <p className="text-xs italic text-slate-500 break-words">{children}</p>;
}

const DETAIL_CONTENT: React.ReactNode[] = [
  // 0 - BSR HRB no EWS1
  <div key="d0" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Building", v: "Sample Wharf House, 25 Example Quay, London SE16 4ZZ" },
          { k: "BSR HRB register ref", v: "HRB-2024-04-0017842 (registered 1 April 2024)" },
          { k: "Height / storeys / units", v: "32 m / 12 / 48" },
          { k: "Principal Accountable Person", v: "PAP Demo Building Owner Ltd" },
          { k: "EWS1 disclosure status", v: "Not disclosed in seller's pack" },
          { k: "RICS EWS1 grades", v: "A1 (no combustible) · A2 (limited combustible, no remediation) · A3 (combustible, no remediation needed) · B1 (combustible, low risk) · B2 (combustible, remediation needed)" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Without an EWS1 of A or B1 the property is generally considered unmortgageable by mainstream
        lenders, irrespective of LTV or buyer profile. This is the single biggest binary risk in the
        application: the brief is built specifically so a qualified broker can verify the property&apos;s
        lendability before any application fee is paid.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Current EWS1 form rated A1, A2, A3, or B1, signed by an appropriately-qualified assessor within the last 5 years.</li>
        <li>Confirmation from the Principal Accountable Person of any active remediation contract under the Building Safety Act 2022.</li>
        <li>Confirmation that the buyer (and any subsequent buyer) qualifies as a protected leaseholder under schedule 8 of the Act.</li>
        <li>The most recent Safety Case Report submitted to the BSR.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the broker</SectionHeading>
      <Quote>
        {`Hi [broker],

The property I'm offering on is in a BSR Higher-Risk Building (32m / 12 storeys / 48 flats). The seller has not yet provided an EWS1 form.

Before I pay any application fee, please confirm:

1. Which of your current lender panel will accept this property type subject to an EWS1 rating of A1, A2, A3 or B1.

2. Whether any lender on your panel will hold an application open while the EWS1 is being obtained, or whether the EWS1 must be in hand before submission.

3. Whether any lender on your panel requires the latest Safety Case Report and FRAEW in addition to the EWS1.

4. Realistic timing implications if remediation is currently being scheduled at the building under the Building Safety Act 2022.

I'd like to understand the type of issue mortgage underwriters typically examine here before I commit to anything. Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>RICS EWS1 guidance: https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/building-surveying-standards/valuation-of-properties-in-multi-storey-multi-occupancy-residential-buildings-with-cladding</SourceLine>
      <SourceLine>Building Safety Act 2022 (schedule 8 leaseholder protections): https://www.legislation.gov.uk/ukpga/2022/30/schedule/8</SourceLine>
      <SourceLine>BSR HRB register: https://www.gov.uk/guidance/find-a-high-rise-residential-building</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Broker: free during an initial conversation. Lender application fee (avoid before EWS1 is in
        hand): £999-£1,995 typical. Independent EWS1 review (if buyer wants comfort): £400-£900.
      </p>
    </div>
  </div>,

  // 1 - Flood Zone 2 post-2009
  <div key="d1" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "EA Flood Zone", v: "Zone 2 (0.1%-1% annual probability)" },
          { k: "Property completion", v: "2017" },
          { k: "Flood Re cut-off date", v: "1 January 2009 (Flood Re Scheme Funding Regulations 2015)" },
          { k: "Flood Re applicability", v: "Not applicable, property is post-cut-off" },
          { k: "Insurance market type", v: "Specialist (non-Flood Re), premium and excess loading typical" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Flood Re eligibility decision tree</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Is the property a residential dwelling? Yes.</li>
        <li>Was it built on or after 1 January 2009? Yes (built 2017) → <strong>Flood Re does not apply.</strong></li>
        <li>Is the property in Council Tax Band H (or equivalent in Wales/Scotland)? Not relevant once cut-off failed.</li>
        <li>Result: insurance must be obtained from the non-Flood Re market, typically with premium loading and higher flood excess.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Lenders require buildings insurance to be in place from exchange. Where Flood Re does not
        apply, the buyer needs a specialist quote in writing before the offer letter can be relied on.
        The type of issue underwriters typically examine here is whether the buyer&apos;s evidence of
        cover names the lender as interested party and meets the lender&apos;s reinstatement cost
        requirement.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the broker</SectionHeading>
      <Quote>
        {`Hi [broker],

The property is in EA Flood Zone 2 and was built in 2017, after the Flood Re cut-off. Please:

1. Confirm whether any lender on your panel applies a particular flood-insurance condition to a post-2009 build in Zone 2.

2. Recommend a specialist insurer (or two) that quotes for non-Flood Re properties so I can obtain a quote in writing before I submit my application.

3. Confirm the typical reinstatement cost / sum insured requirement for a 67 m² leasehold flat in this kind of block.

4. Flag whether any communal block policy already in place covers the buyer's interest, and whether the lender will accept that policy as evidence at exchange.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>Flood Re scheme rules: https://www.floodre.co.uk/about-flood-re/</SourceLine>
      <SourceLine>Flood Re Scheme Funding Regulations 2015: https://www.legislation.gov.uk/uksi/2015/1875/contents/made</SourceLine>
      <SourceLine>EA Flood Map: https://check-long-term-flood-risk.service.gov.uk/postcode</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Broker: free during initial conversation. Specialist buildings insurance quote: free.
        Difference vs Flood Re-eligible cohort typically £150-£500 per annum on premium for this
        kind of property.
      </p>
    </div>
  </div>,

  // 2 - Overseas-entity seller
  <div key="d2" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Registered proprietor", v: "Demo Properties Ltd (Guernsey)" },
          { k: "Overseas Entity ID", v: "OE0125478 (Active)" },
          { k: "ECTEA 2022 requirement", v: "Valid OE ID must be live at completion; annual update statement must be current" },
          { k: "Typical ROE delay impact", v: "+2-4 weeks where annual update statement has lapsed" },
          { k: "Mortgage offer validity (typical)", v: "3 or 6 months from offer date" },
          { k: "Offer extension policy", v: "Some lenders permit one extension of 1-3 months; broker to confirm" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        The Economic Crime (Transparency and Enforcement) Act 2022 is solicitor work, not lender
        work, but a slipping completion date can cause the mortgage offer to lapse before completion
        and trigger a re-application (with re-valuation, re-pull of credit file, re-underwriting on
        any criteria that has tightened since first offer). The type of issue underwriters typically
        examine here is offer-validity policy and the speed of re-application if the offer expires.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the broker</SectionHeading>
      <Quote>
        {`Hi [broker],

The seller is an overseas entity registered in Guernsey (OE ID OE0125478). My solicitor is satisfied the OE ID is currently live but flagged that completion can slip by 2-4 weeks where the annual update statement needs to be refiled.

Please:

1. Confirm the offer validity period for each lender on my shortlist (3 or 6 months from offer date).

2. Confirm whether each lender permits a single extension if completion slips, and the typical extension length.

3. Identify which lender on the shortlist is most flexible on offer extensions for overseas-entity transactions.

4. Confirm the lender's policy on re-pull of credit file or re-valuation if the offer lapses and a fresh application is needed.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>Economic Crime (Transparency and Enforcement) Act 2022: https://www.legislation.gov.uk/ukpga/2022/10/contents/enacted</SourceLine>
      <SourceLine>Companies House guidance, Register of Overseas Entities: https://www.gov.uk/guidance/register-an-overseas-entity</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Broker: free during initial conversation. Re-application after offer lapse (if it happens):
        repeat of application fee, valuation fee, and any non-refundable legal fees.
      </p>
    </div>
  </div>,

  // 3 - Remediation cost / service charges
  <div key="d3" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Building type", v: "BSR HRB, potential external-wall remediation exposure" },
          { k: "Building Safety Act 2022", v: "Schedule 8 limits qualifying leaseholder liability for cladding remediation" },
          { k: "Reserve fund balance", v: "To confirm via LPE1, material to lender affordability model" },
          { k: "Last 3 years service-charge accounts", v: "To confirm; cohort trend has been +35-50% across BSR HRBs since 2022" },
          { k: "Pending s.20 LTA 1985 notices", v: "Tribunal case LON/00DD/LSC/2022/0089 already decided on lift refurbishment; no further notices currently disclosed" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Affordability is the second underwriting test after EWS1 lendability. Some lenders include
        service charges in monthly outgoings on a like-for-like basis with the mortgage payment;
        others apply a percentage-of-income cap on combined housing cost. The type of issue
        underwriters typically examine here is whether the disclosed and forecast service charge
        comfortably fits the affordability formula at the proposed loan amount.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the broker</SectionHeading>
      <Quote>
        {`Hi [broker],

The flat is in a BSR HRB with possible external-wall remediation exposure. Once my solicitor obtains the LPE1, last 3 years of service-charge accounts, and reserve-fund balance, please:

1. Identify which lender on the shortlist treats service charges as a like-for-like outgoing in the affordability calculation.

2. Identify which lender applies a percentage-of-income cap on combined housing cost (mortgage + service charge + buildings insurance).

3. Confirm whether any pending s.20 LTA 1985 major-works consultation at the building would be treated as a forecast cost in the affordability model.

4. Provide an indicative affordability range for my income at the asking price, assuming current and stress-rate.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>Building Safety Act 2022 schedule 8: https://www.legislation.gov.uk/ukpga/2022/30/schedule/8</SourceLine>
      <SourceLine>LTA 1985 s.20 consultation guidance: https://www.lease-advice.org/</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Broker: free during initial conversation. LPE1 from the management company: £250-£400 (paid
        by seller). Reserve fund balance and service-charge accounts: free as part of LPE1 pack.
      </p>
    </div>
  </div>,

  // 4 - EPC D Green Mortgage
  <div key="d4" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Current EPC", v: "D, SAP 64" },
          { k: "Potential EPC", v: "B, SAP 84" },
          { k: "Green Mortgage criteria (typical)", v: "Property EPC A, B or C at completion" },
          { k: "Largest leaseholder-only uplift", v: "Lighting, smart controls, low-flow regulators (≈5-8 SAP points)" },
          { k: "Realistic outcome leaseholder-only", v: "D → C" },
          { k: "Renters' Rights Bill / Future Homes Standard direction", v: "Direction of travel is EPC C as minimum for rental from 2030 (PRS only; not yet OO)" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Most mainstream lenders no longer penalise sub-C EPCs on standard products, but the discounted
        Green Mortgage range (cashback, modest rate reduction) is typically reserved for EPC A-C. The
        type of issue underwriters typically examine here is whether the EPC at completion qualifies
        for any specific Green Mortgage product the broker is recommending.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the broker</SectionHeading>
      <Quote>
        {`Hi [broker],

The property's current EPC is D (SAP 64), potential B (SAP 84). I am open to funding low-cost EPC uplifts (smart controls, low-flow regulators) pre-completion if it brings the property to C.

Please:

1. Confirm which lenders on the shortlist offer a Green Mortgage product and the precise EPC threshold (typically A, B or C at completion).

2. Quantify the cashback or rate-margin gain on a Green Mortgage product vs the equivalent standard product.

3. Confirm whether the EPC must be re-issued at completion to qualify, and the typical cost (£55-£120).

4. Comment on the direction of travel: is the Renters' Rights Bill EPC C from 2030 in PRS likely to affect the long-term resale value of a sub-C owner-occupier property?

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>EPC register: https://www.gov.uk/find-energy-certificate</SourceLine>
      <SourceLine>Future Homes Standard consultation: https://www.gov.uk/government/consultations/the-future-homes-and-buildings-standards-2023-consultation</SourceLine>
      <SourceLine>Renters' Rights Bill (formerly Renters Reform Bill): https://bills.parliament.uk/</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Broker: free during initial conversation. New EPC assessment to confirm a C: £55-£120. Smart
        controls and low-flow regulators if needed: £150-£400 typically. Cashback or rate-margin gain
        on Green Mortgage: typically £250-£750 of value over a 2-year fix.
      </p>
    </div>
  </div>,
];

export default function SampleMortgagePage() {
  return (
    <>
      <Header />

      <section className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-semibold tracking-wider text-amber-200 uppercase">
            Sample Mortgage Broker Brief
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
            40% of UK property chains collapse on mortgage refusal.
            <span className="text-amber-300"> Spot the reasons before you apply</span>.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-300 max-w-3xl">
            The Mortgage Broker Brief in your Premium+ report (£6.99) surfaces the cladding,
            flood, ownership and ground-stability flags that any FCA-regulated broker will need to
            answer for the lender, formatted to take to that conversation on day one.
          </p>
          <div className="mt-8 max-w-xl">
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

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">What this brief actually is</h2>
        <p className="mt-4 text-slate-700 leading-relaxed">
          It is a short, plain-English summary you forward to your mortgage broker as soon as your offer
          is accepted. It flags the building-safety, flood, leasehold and ownership issues that influence
          which lenders will lend on this specific property, before you pay an application fee.
        </p>
        <p className="mt-3 text-slate-700 leading-relaxed">
          It does not name specific lenders, recommend rates, or constitute regulated mortgage advice.
          Lender criteria change weekly. The brief is structured for one purpose: to give a qualified,
          FCA-regulated broker the property-side facts up front so their lender shortlist is accurate the
          first time. Verify every flag with a qualified broker before acting.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-4">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-semibold tracking-wider text-amber-700 uppercase">
                Mortgage Broker Brief
              </div>
              <div className="text-sm text-amber-900 mt-1">
                Flat 14, Sample Wharf House, 25 Example Quay, London SE16 4ZZ
              </div>
            </div>
            <div className="text-xs text-amber-900/70">
              Generated 17 May 2026 from HomeBuyerCheck Premium+ report
            </div>
          </div>

          <div className="rounded-xl bg-white border border-amber-200 p-5 md:p-6 mb-6">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Summary</div>
            <p className="mt-2 text-slate-900 leading-relaxed">
              Top-floor 2-bed leasehold flat in a BSR Higher-Risk Building with no disclosed EWS1, in
              Flood Zone 2 with post-2009 build (so Flood Re does not apply), and an overseas-entity
              seller. One critical flag (EWS1), one high flag (Flood Re). Verify every flag with a
              qualified broker before submitting any application.
            </p>
          </div>

          <ol className="space-y-4">
            {ITEMS.map((item, i) => (
              <li
                key={i}
                className="rounded-xl bg-white border border-amber-200/80 p-5 md:p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900 text-base md:text-lg leading-snug">
                    <span className="text-amber-700 mr-2">{i + 1}.</span>
                    {item.heading}
                  </h3>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${PRIORITY_STYLES[item.priority]}`}
                  >
                    {PRIORITY_LABEL[item.priority]}
                  </span>
                </div>
                <p className="mt-3 text-sm md:text-[15px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Finding. </span>
                  {item.finding}
                </p>
                <p className="mt-2 text-sm md:text-[15px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-amber-700">Action. </span>
                  {item.action}
                </p>
                <DetailButton
                  title={`${i + 1}. ${item.heading}`}
                  label="View full evidence →"
                  accent="amber"
                >
                  {DETAIL_CONTENT[i]}
                </DetailButton>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-xs italic text-amber-900/70 leading-relaxed">
            This brief is not regulated mortgage advice. It does not name specific lenders, recommend
            rates, or guarantee any lending decision. Lender criteria for EWS1, flood, leasehold and
            overseas-entity sellers change frequently. Always verify every flag with a qualified,
            FCA-regulated mortgage broker before submitting an application or paying any fees.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          Where this fits in the buyer journey
        </h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {TIMELINE.map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Step {i + 1}
              </div>
              <div className="mt-1 font-semibold text-slate-900">{t.when}</div>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{t.what}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          Includes coverage of these UK frameworks
        </h2>
        <ul className="mt-5 grid sm:grid-cols-2 gap-3">
          {FRAMEWORKS.map((f, i) => (
            <li
              key={i}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Ready to check a property?</h2>
          <p className="mt-3 text-slate-700">
            Start with a free check. Premium+ (£6.99) unlocks the Solicitor, Surveyor and Mortgage
            briefs together.
          </p>
          <div className="mt-6 max-w-xl mx-auto">
            <PostcodeLookup />
          </div>
          <p className="mt-6 text-sm text-slate-500">
            See the other two briefs:{" "}
            <Link href="/sample-solicitor" className="text-amber-700 font-semibold hover:underline">
              Solicitor sample
            </Link>{" "}
            ·{" "}
            <Link href="/sample-surveyor" className="text-amber-700 font-semibold hover:underline">
              Surveyor sample
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
