import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { DetailButton } from "@/components/SampleDetailModal";

export const metadata: Metadata = {
  title: "Sample Solicitor Brief",
  description:
    "See a real worked example of the AI Solicitor Brief included with the £6.99 Premium+ report. Critical flags, ranked actions, formatted for your conveyancer.",
  alternates: { canonical: "https://www.homebuyercheck.co.uk/sample-solicitor" },
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
    heading: "Overseas-entity seller (Register of Overseas Entities)",
    finding:
      "HM Land Registry OCOD record shows registered proprietor Demo Properties Ltd, incorporated in Guernsey. The Economic Crime (Transparency and Enforcement) Act 2022 prohibits the Registrar from registering a transfer unless the entity holds a valid Overseas Entity ID at completion.",
    action:
      "Confirm the seller's Overseas Entity ID is live on the Companies House register, request the latest annual update statement, and add a special condition requiring updated proof of registration on the day of completion. Allow extra time in the chain: ROE checks routinely add 2-4 weeks where the entity has not filed.",
  },
  {
    priority: "critical",
    heading: "BSR Higher-Risk Building without confirmed EWS1",
    finding:
      "The block (Sample Wharf House, 12 storeys, 48 flats, 32m) is on the Building Safety Regulator's Higher-Risk Building register; Principal Accountable Person is Demo Building Owner Ltd. No EWS1 form has been disclosed in the seller's pack.",
    action:
      "Raise a TA6 supplementary enquiry for: (i) current EWS1 rating, (ii) latest fire risk appraisal of external wall (FRAEW), (iii) status of any remediation contract under the Building Safety Act 2022 cost-recovery regime, (iv) the Accountable Person's most recent Safety Case Report. Without EWS1 A or B1 the property is effectively unmortgageable.",
  },
  {
    priority: "high",
    heading: "First-tier Tribunal history at the building (three cases)",
    finding:
      "Property Chamber records show three tribunal cases at Sample Wharf House: LON/00DD/LSC/2023/0142 (service-charge dispute), LON/00DD/LSC/2022/0089 (major-works recovery under s.20 LTA 1985), LON/00DD/RTM/2021/0021 (Right to Manage company formation). The RTM case suggests historic leaseholder dissatisfaction with the freeholder.",
    action:
      "Request the last three years of service-charge accounts and budgets, the s.20 consultation notices for the 2022 major works, and confirmation of whether an RTM company is in place. Ask seller for any open or threatened tribunal proceedings affecting the lessee.",
  },
  {
    priority: "high",
    heading: "Two outstanding charges registered against the seller",
    finding:
      "Companies House records two undischarged charges against Demo Properties Ltd: a 2018 legal mortgage in favour of Capital Sample Bank plc, and a 2021 fixed and floating debenture in favour of Demo Finance plc. Neither charge has a discharge (MR04) filed.",
    action:
      "Obtain executed forms DS1 / E-DS1 from each chargee on or before completion. The debenture is a fixed and floating charge so confirm with the chargee whether release of the specific title (or a deed of release) is required. Do not allow funds to flow until both releases are in undertaking.",
  },
  {
    priority: "medium",
    heading: "Price escalation anomaly vs local HPI",
    finding:
      "Land Registry shows last sale August 2019 at £312,500. Current asking price is £465,000, a +48.8% increase in 6.5 years. Southwark HPI over the same period is broadly flat (within +/- 3%). The delta is therefore not market-driven.",
    action:
      "Ask seller to evidence any structural works, refurbishment, lease extension, or change of use that justifies the uplift. If none, advise client to recalibrate offer and instruct surveyor to comment specifically on market value (RICS Red Book) rather than rely on asking price.",
  },
  {
    priority: "low",
    heading: "Flood Zone 2 (medium fluvial risk)",
    finding:
      "Environment Agency mapping places the site in Flood Zone 2 (annual probability 0.1%-1%). Build year 2017 means the property post-dates the Flood Re scheme cut-off (1 January 2009), so Flood Re does not apply to its buildings insurance.",
    action:
      "Order a full environmental search (Landmark Homecheck or Groundsure Homebuyer). Advise client to obtain a specialist buildings insurance quote in writing before exchange; lender will require buildings insurance cover from exchange.",
  },
];

const FRAMEWORKS = [
  "TA6 (Property Information Form) 6th edition supplemental enquiries",
  "Building Safety Act 2022 (Accountable Person, EWS1, FRAEW)",
  "Economic Crime (Transparency and Enforcement) Act 2022 (Register of Overseas Entities)",
  "Landlord and Tenant Act 1985 s.20 (major works consultation)",
  "Land Registry OCOD / OCDA records and Companies House charges register",
  "Flood Re scheme eligibility (pre-2009 build cut-off)",
];

const TIMELINE = [
  {
    when: "Offer accepted",
    what:
      "Send the brief to your conveyancer the same day you instruct. It seeds their TA6 enquiries from day one rather than after the seller's pack arrives.",
  },
  {
    when: "Pre-exchange",
    what:
      "Cross-reference the brief against the seller's responses. Every unanswered item is a follow-up enquiry; every cleared item is logged in the report on title.",
  },
  {
    when: "Day of exchange",
    what:
      "Use the brief as a final checklist. Outstanding criticals (EWS1, ROE ID, charge discharges) must be resolved by undertaking or special condition.",
  },
];

// Reusable presentation primitives for the modal popups.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-indigo-700">
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
    <div className="rounded-md border-l-4 border-indigo-300 bg-indigo-50/60 px-4 py-3 text-[13px] leading-relaxed text-slate-800 whitespace-pre-line">
      {children}
    </div>
  );
}

function SourceLine({ children }: { children: React.ReactNode }) {
  return <p className="text-xs italic text-slate-500 break-words">{children}</p>;
}

// One DetailContent component per item index, keyed by ITEMS order.
const DETAIL_CONTENT: React.ReactNode[] = [
  // 0 - Overseas-entity seller
  <div key="d0" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "HMLR title number", v: "NGL123456 (leasehold, registered 2018)" },
          { k: "OCOD register entry", v: "Demo Properties Ltd, country of incorporation: Guernsey, date added to OCOD: 14 Jul 2017" },
          { k: "Companies House (overseas)", v: "OE0125478, status Active, jurisdiction: Guernsey" },
          { k: "Register of Overseas Entities ID", v: "OE0125478, annual update statement: due, last filed 12 May 2024" },
          { k: "Beneficial owners disclosed", v: "1 (registrable beneficial owner: Trustee Holdings Ltd, Guernsey)" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Since 5 September 2022 the Land Registry must refuse to register any disposition by an
        overseas entity that does not hold a valid Overseas Entity ID at the moment of completion.
        An expired annual statement renders the ID non-compliant. A 2-4 week delay is the typical
        outcome where the ID has lapsed, and the seller often cannot exchange until the update is
        filed and processed. This is the single most common cause of completion slipping by a
        month for chains involving offshore corporate sellers.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Current OE annual update statement filed within the last 12 months.</li>
        <li>Overseas Entity ID confirmed live on Companies House on the day of exchange and again on the day of completion.</li>
        <li>Beneficial ownership disclosure unchanged since search, or any change re-verified.</li>
        <li>Special condition in the contract that the seller will procure an up-to-date OE annual update statement no later than 5 working days before completion.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample drafted enquiry letter</SectionHeading>
      <Quote>
        {`Dear Sirs,

Re: Flat 14, Sample Wharf House, 25 Example Quay, London SE16 4ZZ, your client Demo Properties Ltd

Our preliminary searches at HM Land Registry and Companies House identify your client as an overseas entity incorporated in Guernsey with Overseas Entity ID OE0125478.

Please provide as a matter of priority:

1. An office copy of the most recent annual update statement filed with Companies House under section 7 of the Economic Crime (Transparency and Enforcement) Act 2022, together with the date of next filing.

2. Confirmation that the registrable beneficial owners disclosed on the Register of Overseas Entities as at the date of your reply are unchanged since the last filing, or full particulars of any change.

3. An undertaking that your client will procure and provide a fresh OE annual update statement, dated no earlier than 14 days prior to completion, in order to ensure the registrar will accept the disposition under section 15 of the 2022 Act.

We propose a special condition to the contract reflecting (3) above. Please confirm in principle by return.

Yours faithfully,
[Conveyancer]`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>
        Land Registry OCOD search: https://www.gov.uk/government/publications/hm-land-registry-overseas-companies-that-own-property-in-england-and-wales
      </SourceLine>
      <SourceLine>
        Companies House overseas entity record: https://find-and-update.company-information.service.gov.uk/
      </SourceLine>
      <SourceLine>
        Government guidance, Register of Overseas Entities: https://www.gov.uk/guidance/register-an-overseas-entity
      </SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Solicitor: typically £40-£90 to draft and send this enquiry as part of the standard pre-contract
        bundle (no additional disbursement). Land Registry OCOD search: free. Companies House search:
        free.
      </p>
    </div>
  </div>,

  // 1 - BSR HRB no EWS1
  <div key="d1" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Building", v: "Sample Wharf House, 25 Example Quay, London SE16 4ZZ" },
          { k: "BSR HRB register entry", v: "HRB-2024-04-0017842, registered 1 April 2024" },
          { k: "Height", v: "32 metres / 12 storeys / 48 residential units" },
          { k: "Principal Accountable Person", v: "PAP Demo Building Owner Ltd (Companies House 10987654)" },
          { k: "Safety Case Report status", v: "Not disclosed to BSR portal as of public extract date" },
          { k: "EWS1 disclosure", v: "None in seller's marketing pack; no public Building Safety Information Portal entry" },
          { k: "Cladding system", v: "ACM-free per developer statement 2017; substrate insulation type not confirmed" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        BSR HRBs without a current EWS1 of A1, A2 or B1 are routinely treated as unmortgageable by
        mainstream lenders and rejected by RICS Red Book valuers for residential mortgage purposes.
        Where remediation is required, the cost to leaseholders historically ranged from £8,000 to
        £40,000 per flat before the Building Safety Act 2022 leaseholder protections, and reserve-fund
        depletion is common. Service charges have risen by an average of 35-50% across the BSR HRB
        estate since 2022.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>EWS1 rating A1, A2 or B1 dated within the last 5 years, signed by a chartered fire engineer or appropriately-qualified RICS member.</li>
        <li>Latest FRAEW (Fire Risk Appraisal of External Wall) report.</li>
        <li>Most recent Safety Case Report submitted to the BSR.</li>
        <li>Any active remediation contract: scope, named contractor, projected completion date, and confirmation that the leaseholder is protected under the Building Safety Act 2022 schedule 8 leaseholder protections.</li>
        <li>Reserve fund balance and last 3 years of service-charge accounts.</li>
        <li>Confirmation that no Remediation Order or Remediation Contribution Order under sections 123 / 124 of the Act has been applied for or granted.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample drafted enquiry letter</SectionHeading>
      <Quote>
        {`Re: TA6 supplementary enquiries, Flat 14, Sample Wharf House, 25 Example Quay, London SE16 4ZZ

Our searches confirm the building is registered with the Building Safety Regulator as Higher-Risk Building HRB-2024-04-0017842, with PAP Demo Building Owner Ltd as Principal Accountable Person. The seller's pack does not contain an EWS1 form.

Please obtain and provide:

1. The current EWS1 form for the building, including the assessor's name, RICS / chartered fire engineer registration number, and the date of assessment.

2. The latest Fire Risk Appraisal of External Wall (FRAEW) carried out under PAS 9980:2022.

3. The most recent Building Safety Case Report submitted to the Building Safety Regulator.

4. Particulars of any current or proposed remediation works to the external wall system, including scope, named contractor, expected start and completion dates, and confirmation that costs will not be passed to qualifying leaseholders under the Building Safety Act 2022 schedule 8 protections.

5. Confirmation that no Remediation Order or Remediation Contribution Order has been applied for or made against the building under sections 123 / 124 of the Building Safety Act 2022.

6. The current reserve fund balance and forecast service charges for the next three accounting years.

We will not advise our client to exchange unless and until items 1 to 4 are provided in writing and reviewed by a qualified fire safety professional engaged by our client.

Yours faithfully,
[Conveyancer]`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>BSR HRB register: https://www.gov.uk/guidance/find-a-high-rise-residential-building</SourceLine>
      <SourceLine>Building Safety Act 2022: https://www.legislation.gov.uk/ukpga/2022/30/contents</SourceLine>
      <SourceLine>RICS EWS1 guidance: https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/building-surveying-standards/valuation-of-properties-in-multi-storey-multi-occupancy-residential-buildings-with-cladding</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Solicitor: typically £75-£150 for the EWS1 enquiry letter bundle. Independent EWS1 review by a
        chartered fire engineer if buyer wants a second opinion: £400-£900. Without these items
        confirmed, the property is not lendable to any mainstream UK lender.
      </p>
    </div>
  </div>,

  // 2 - Tribunal history
  <div key="d2" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data, three Property Chamber cases</SectionHeading>
      <div className="space-y-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[13px]">
          <div className="font-semibold text-slate-900">LON/00DD/LSC/2023/0142</div>
          <div className="text-slate-700">Application under s.27A LTA 1985, reasonableness of service charges (year ending 2022).</div>
          <div className="text-slate-700">Applicant: 18 leaseholders. Respondent: Demo Freeholds Ltd.</div>
          <div className="text-slate-700">Decided 12 February 2024. Held: cleaning contract overcharges of £14,200 not reasonably incurred. Ordered re-credit to all 48 leaseholders.</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[13px]">
          <div className="font-semibold text-slate-900">LON/00DD/LSC/2022/0089</div>
          <div className="text-slate-700">Application under s.20 LTA 1985, major works recovery (lift refurbishment).</div>
          <div className="text-slate-700">Applicant: Demo Freeholds Ltd. Respondents: all leaseholders.</div>
          <div className="text-slate-700">Decided 22 August 2023. Held: s.20 consultation valid; full recovery permitted at £3,200/flat.</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[13px]">
          <div className="font-semibold text-slate-900">LON/00DD/RTM/2021/0021</div>
          <div className="text-slate-700">Application under the Commonhold and Leasehold Reform Act 2002, RTM company formation.</div>
          <div className="text-slate-700">Applicant: Sample Wharf House RTM Co Ltd. Respondent: Demo Freeholds Ltd.</div>
          <div className="text-slate-700">Decided 4 March 2022. Held: RTM granted. Management transferred 4 May 2022.</div>
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Three cases in three years is a significant indicator of leaseholder/freeholder friction. The
        2024 decision quantifies historical over-recovery and triggers reserve-fund adjustments.
        The RTM transfer in 2022 means the management company (not the freeholder) now controls
        budgets and contracts: your client&apos;s contractual counterparty for service-charge purposes
        is the RTM, and any LPE1 must come from the RTM company secretary, not the freeholder.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Three years of audited service-charge accounts, post-RTM, with reserve fund movements.</li>
        <li>Copy of the s.20 consultation notices from the 2022 lift works.</li>
        <li>Current minutes from the RTM company AGM and any extraordinary meeting in the last 12 months.</li>
        <li>Confirmation that no further applications are pending or threatened.</li>
        <li>RTM company filing history at Companies House confirmed up to date.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample drafted enquiry letter</SectionHeading>
      <Quote>
        {`Re: Flat 14, Sample Wharf House, service charge and management history

Our tribunal searches identify three First-tier Tribunal (Property Chamber) cases at the building between 2021 and 2024 (refs LON/00DD/LSC/2023/0142, LON/00DD/LSC/2022/0089, LON/00DD/RTM/2021/0021). Please provide:

1. Audited service-charge accounts for the years ending 2021, 2022, 2023.
2. The current reserve fund balance and the forecast budget for the year ending 2026.
3. Copies of the s.20 consultation notices issued in relation to the 2022 lift refurbishment.
4. The current LPE1 issued by Sample Wharf House RTM Co Ltd (the management company since May 2022).
5. Confirmation in writing from the RTM company that no further tribunal proceedings are pending or threatened against any leaseholder or against the RTM itself.
6. Particulars of any insurance claim made on the building's policy in the last 6 years.

Yours faithfully,
[Conveyancer]`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>Property Chamber decisions search: https://www.gov.uk/residential-property-tribunal-decisions</SourceLine>
      <SourceLine>Commonhold and Leasehold Reform Act 2002, Part 2: https://www.legislation.gov.uk/ukpga/2002/15/part/2</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Solicitor: typically £60-£120 to draft and send this enquiry. LPE1 from the RTM: £250-£400
        (paid by seller in most cases). Property Chamber decisions are free to download.
      </p>
    </div>
  </div>,

  // 3 - Two outstanding charges
  <div key="d3" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data, Companies House charges (active)</SectionHeading>
      <div className="space-y-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[13px]">
          <DataList
            rows={[
              { k: "Charge ID", v: "OE0125478-0001" },
              { k: "Created", v: "14 March 2018" },
              { k: "Registered", v: "20 March 2018" },
              { k: "Classification", v: "Legal mortgage" },
              { k: "In favour of", v: "Capital Sample Bank plc (Companies House 09876543)" },
              { k: "Status", v: "Outstanding, no MR04 filed" },
            ]}
          />
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[13px]">
          <DataList
            rows={[
              { k: "Charge ID", v: "OE0125478-0002" },
              { k: "Created", v: "8 September 2021" },
              { k: "Registered", v: "15 September 2021" },
              { k: "Classification", v: "Fixed and floating debenture" },
              { k: "In favour of", v: "Demo Finance plc (Companies House 11223344)" },
              { k: "Crystallisation triggers", v: "Standard insolvency events; cessation of trade" },
              { k: "Status", v: "Outstanding, no MR04 filed" },
            ]}
          />
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Either charge, if not released by completion, attaches to the property and can prevent the
        buyer from obtaining clean title. A debenture in particular is wider in scope than a single
        mortgage and may require a deed of release rather than a simple DS1. The seller&apos;s solicitor
        must obtain executed releases (or undertakings to release) from both chargees, and the
        buyer&apos;s solicitor must verify those undertakings before authorising the transfer of funds.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Executed DS1 (or E-DS1) from Capital Sample Bank plc dated within 10 working days of completion.</li>
        <li>Deed of release (or DS3, where the title is being released from a wider charge) from Demo Finance plc.</li>
        <li>Solicitor-to-solicitor undertaking that the redemption monies will be paid on completion and the releases lodged immediately.</li>
        <li>Confirmation from Companies House that MR04 forms will be filed within the statutory 21-day window.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample drafted pre-completion requirement</SectionHeading>
      <Quote>
        {`Re: Flat 14, Sample Wharf House, pre-completion undertakings (registered charges)

The Companies House charges register shows two outstanding charges against your client (IDs OE0125478-0001 and OE0125478-0002). Completion will not be authorised unless and until we hold:

1. An executed DS1 (or E-DS1) in respect of the 2018 legal mortgage in favour of Capital Sample Bank plc, OR a Law Society-form solicitor-to-solicitor undertaking that the redemption monies will be paid and the DS1 lodged within 7 working days.

2. An executed deed of release (or DS3 as appropriate) from Demo Finance plc in respect of the 2021 fixed and floating debenture, OR an equivalent solicitor-to-solicitor undertaking.

3. Confirmation that the MR04 forms will be filed within 21 days of completion.

Please confirm by return whether you can give the undertakings in (1) and (2) or whether executed forms will be physically lodged at completion.

Yours faithfully,
[Conveyancer]`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>Companies House charges register: https://find-and-update.company-information.service.gov.uk/company/[id]/charges</SourceLine>
      <SourceLine>HMLR Practice Guide 31, Discharges of charges: https://www.gov.uk/government/publications/discharges-of-charges-pg31</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Solicitor: typically £40-£80 to draft and serve the undertaking requirements. Companies
        House searches: free. Land Registry priority search at completion: £7. The cost of failing
        to verify here is the loss of clean title, which is unrecoverable without litigation.
      </p>
    </div>
  </div>,

  // 4 - Price escalation
  <div key="d4" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Last sale (Land Registry PPD)", v: "August 2019, £312,500" },
          { k: "Original off-plan sale", v: "August 2019 (new build sale; first registration)" },
          { k: "Current asking price", v: "£465,000" },
          { k: "Implied change", v: "+£152,500 / +48.8% over 6.5 years" },
          { k: "Southwark HPI (Aug 2019 → Feb 2026)", v: "+/- 3% (broadly flat)" },
          { k: "London HPI (same period)", v: "+5% to +7%" },
          { k: "Implied gap to local HPI", v: "+40-46 percentage points unexplained" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        An asking-price uplift that materially exceeds local HPI must be justified by either an
        objective market change (which the HPI rules out) or by works to the property (extensions,
        refurbishment, lease extension, change of use). Each of those triggers planning, building
        regulations and freeholder-consent enquiries. If the seller cannot evidence any of them,
        the buyer is paying a premium that is unlikely to survive the lender&apos;s Red Book valuation,
        increasing the risk of a down-valuation and an aborted application.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Building Regulations completion certificates for any works post-2019.</li>
        <li>Planning permissions or lawful development certificates for any change of layout or use.</li>
        <li>Freeholder consent (Licence to Alter) for any internal works.</li>
        <li>FENSA / Gas Safe certificates for any window or boiler replacements.</li>
        <li>Confirmation that no unauthorised alterations have been made that would breach the lease.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample drafted enquiry</SectionHeading>
      <Quote>
        {`Re: Flat 14, works carried out since first sale (August 2019)

The Land Registry Price Paid Data shows the property was first sold in August 2019 at £312,500. The current asking price (£465,000) represents an increase of 48.8% in a sub-market where the HPI has been broadly flat over the same period.

Please provide:

1. Particulars of all alterations, improvements, refurbishments or works of any kind carried out at the property since 1 January 2019, with approximate dates.

2. For each item in (1): the relevant Building Regulations completion certificate, planning permission or Lawful Development Certificate, FENSA/Gas Safe certificate, and the freeholder's Licence to Alter where required by the lease.

3. Confirmation in writing that no works have been carried out which require but have not received the consent of the freeholder under the lease.

Yours faithfully,
[Conveyancer]`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>HMLR Price Paid Data: https://landregistry.data.gov.uk/app/ppd</SourceLine>
      <SourceLine>UK House Price Index: https://landregistry.data.gov.uk/app/ukhpi</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Solicitor: typically £30-£60 to draft and send this enquiry. Local authority building
        regs records search via the local authority: £40-£80. The risk of skipping this is that
        the lender&apos;s valuation comes back at £400-£420k and the application falls over.
      </p>
    </div>
  </div>,

  // 5 - Flood Zone 2
  <div key="d5" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Environment Agency Flood Zone", v: "Zone 2 (medium probability, 0.1%-1% annual)" },
          { k: "Source of risk", v: "Tidal Thames + surface water in the Example Quay depression" },
          { k: "Flood Re eligibility", v: "Not eligible (property built 2017, scheme cut-off 1 January 2009)" },
          { k: "Insurance market", v: "Specialist market only (Flood Re-equivalent products at premium loading)" },
          { k: "Local LFRMS classification", v: "Southwark surface water hot-spot mapped 2023" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Post-2009 builds were excluded from Flood Re to deter development in flood-prone areas. The
        practical effect is that buildings insurance is materially more expensive and certain
        lenders will require evidence of cover in writing before issuing a mortgage offer. The flat
        is on the top floor so direct ingress is unlikely, but communal areas, lift pits and parking
        carry the loss exposure that the policy must cover.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Full environmental search (Landmark Homecheck or Groundsure Homebuyer) ordered and reviewed.</li>
        <li>Specialist buildings insurance quote obtained in writing before exchange.</li>
        <li>Confirmation from the management company that the block&apos;s communal policy covers flood at full reinstatement cost.</li>
        <li>Awareness of any historic claim on the building&apos;s communal policy.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample drafted enquiry</SectionHeading>
      <Quote>
        {`Re: Flat 14, flood risk and buildings insurance

Environment Agency mapping places the building in Flood Zone 2. The property was completed in 2017 and is therefore not eligible for Flood Re. Please provide:

1. A copy of the current block buildings insurance policy schedule, confirming flood cover and the reinstatement value.

2. Particulars of any flood-related claim made on the block policy in the last 6 years.

3. Particulars of any flood incident at the building (regardless of insurance claim) since completion.

4. Confirmation from the managing agent of the renewal terms and any insurer-imposed conditions relating to flood.

Yours faithfully,
[Conveyancer]`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>EA Flood Map for Planning: https://check-long-term-flood-risk.service.gov.uk/postcode</SourceLine>
      <SourceLine>Flood Re scheme rules and eligibility: https://www.floodre.co.uk/</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Environmental search (Landmark Homecheck): £50-£70. Specialist buildings insurance quote:
        free. Solicitor enquiry time: £20-£40. Failure to verify here can result in the lender
        delaying or refusing to release funds at completion.
      </p>
    </div>
  </div>,
];

export default function SampleSolicitorPage() {
  return (
    <>
      <Header />

      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-xs font-semibold tracking-wider text-indigo-200 uppercase">
            Sample Solicitor Brief
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
            What your conveyancer would have to find on their own,
            <span className="text-indigo-300"> handed to them on day one</span>.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-300 max-w-3xl">
            Every Premium+ report (£6.99) includes a Solicitor Brief: a ranked, plain-English email
            you forward to your conveyancer the moment your offer is accepted. Below is exactly what one
            looks like, based on a real London leasehold flat in a high-rise.
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
          It is a short, professional-tone summary written for one specific reader: your conveyancing
          solicitor. It surfaces the title, leasehold, ownership, building safety and tribunal flags that
          your report has already found, and tells the solicitor which TA6 supplemental enquiries to raise.
        </p>
        <p className="mt-3 text-slate-700 leading-relaxed">
          It does not replace legal advice. It does save you roughly £30-£60 of solicitor time drafting
          enquiry letters from scratch, and one to two rounds of email tag where you have to find the same
          information again. Most importantly, it catches obscure flags (Register of Overseas Entities ID
          status, undischarged debentures, tribunal history) that a generic conveyance check will miss.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-4">
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-semibold tracking-wider text-indigo-700 uppercase">
                Solicitor Brief
              </div>
              <div className="text-sm text-indigo-900 mt-1">
                Flat 14, Sample Wharf House, 25 Example Quay, London SE16 4ZZ
              </div>
            </div>
            <div className="text-xs text-indigo-900/70">
              Generated 17 May 2026 from HomeBuyerCheck Premium+ report
            </div>
          </div>

          <div className="rounded-xl bg-white border border-indigo-200 p-5 md:p-6 mb-6">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Summary</div>
            <p className="mt-2 text-slate-900 leading-relaxed">
              Leasehold flat in a BSR Higher-Risk Building with no disclosed EWS1, sold by an overseas
              company with two undischarged charges, three tribunal cases at the building, and a +49%
              sale-to-asking price uplift vs flat local HPI. Six action items below, two critical.
            </p>
          </div>

          <ol className="space-y-4">
            {ITEMS.map((item, i) => (
              <li
                key={i}
                className="rounded-xl bg-white border border-indigo-200/80 p-5 md:p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900 text-base md:text-lg leading-snug">
                    <span className="text-indigo-700 mr-2">{i + 1}.</span>
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
                  <span className="font-semibold text-indigo-700">Action. </span>
                  {item.action}
                </p>
                <DetailButton
                  title={`${i + 1}. ${item.heading}`}
                  label="View full evidence →"
                  accent="indigo"
                >
                  {DETAIL_CONTENT[i]}
                </DetailButton>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-xs italic text-indigo-900/70 leading-relaxed">
            This brief is generated from public data sources and the seller's marketing pack. It is a
            prompt list for your solicitor, not legal advice. Final responsibility for due diligence
            remains with your appointed conveyancer.
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
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
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
            <Link href="/sample-surveyor" className="text-indigo-700 font-semibold hover:underline">
              Surveyor sample
            </Link>{" "}
            ·{" "}
            <Link href="/sample-mortgage" className="text-indigo-700 font-semibold hover:underline">
              Mortgage broker sample
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
