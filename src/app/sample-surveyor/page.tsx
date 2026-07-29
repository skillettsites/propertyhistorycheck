import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { DetailButton } from "@/components/SampleDetailModal";

export const metadata: Metadata = {
  title: "Sample Surveyor Brief",
  description:
    "See a real worked example of the AI Surveyor Brief included with the £6.99 Premium+ report. Property-specific inspection priorities for your RICS surveyor.",
  alternates: { canonical: "https://www.homebuyercheck.co.uk/sample-surveyor" },
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
    priority: "high",
    heading: "Shrink-swell clay band 3 substrate",
    finding:
      "British Geological Survey GeoSure shrink-swell hazard band 3 (moderate to significant) across the building footprint. London clay subsoil with documented heave/shrinkage activity in the Example Quay area following the 2018 and 2022 hot summers.",
    action:
      "On internal inspection, sight along brick courses and window/door reveals on all external elevations. Photograph any stepped cracking wider than 3mm or any displacement at door/window heads. Externally, check for evidence of past underpinning at DPC level, resin injection ports, or replacement bricks. Cross-check against any subsidence claims disclosed in the seller's pack.",
  },
  {
    priority: "high",
    heading: "BSR Higher-Risk Building, top floor (4 of 4)",
    finding:
      "Building is on the Building Safety Regulator's Higher-Risk Building register (12 storeys, 48 flats, 32m). The subject flat is on the top floor with direct exposure to the roof, parapet upstand and any roof terrace plant.",
    action:
      "Inspect the roof void access hatch if available, internal cold spots on the top ceiling, evidence of historic water ingress at the ceiling-wall junction, and the condition of any internal soil/vent stacks. Note the external roof drainage path from any visible position. Comment specifically on the interface between the flat's ceiling and the roof structure.",
  },
  {
    priority: "medium",
    heading: "Build year 2017, cavity walls noted as uninsulated on EPC",
    finding:
      "EPC dated 2018 records wall construction as 'Cavity wall, as built, no insulation'. This is unusual for a 2017 build and may be a pre-completion EPC error, an as-built deviation, or accurate. Either way it is material to thermal performance and to wall-tie condition.",
    action:
      "If accessible, borescope or visually inspect the cavity at a discreet location (vent or junction box). Confirm presence/absence of cavity batts and wall-tie spacing. If empty, comment on retrofit feasibility: pumped EPS bead is typically £1,000-£2,000 for a flat of this size but requires structural and acoustic review in a BSR building.",
  },
  {
    priority: "medium",
    heading: "Flat top floor, single-aspect roof drainage",
    finding:
      "Top-floor flat in a 4-storey block. Roof drainage, parapet gutters and downpipes serve this dwelling directly. EPC airtightness for 2017 cohort buildings frequently fails the design target, leading to condensation at ceiling perimeters.",
    action:
      "Inspect ceiling-wall junctions for staining or salt crystallisation. Use moisture meter at internal corners adjacent to external walls. Photograph any visible downpipes and outlets externally. Comment on ventilation strategy (MVHR present? Extract fans operating?) in kitchen and bathroom.",
  },
  {
    priority: "medium",
    heading: "EPC D currently, potential B",
    finding:
      "Current SAP rating 64 (D); potential 84 (B). The largest recommended uplifts on the EPC are low-energy lighting (already common), better insulation and renewables. In a flat, retrofit options are narrower than in a house.",
    action:
      "Comment on which EPC recommendations are realistic given the leasehold and BSR status. Air-source heat pump and solar PV typically require freeholder consent and roof access; cavity insulation may require Building Safety Regulator engagement. Frame upgrades that fall within the leaseholder's gift versus those that require communal action.",
  },
  {
    priority: "low",
    heading: "Building in Flood Zone 2",
    finding:
      "Environment Agency mapping places the building in Flood Zone 2 (medium fluvial risk, 0.1%-1% annual probability). The subject flat is on the top floor so direct flood damage to the dwelling is unlikely, but communal areas and parking are exposed.",
    action:
      "Externally, assess perimeter for evidence of any past water ingress at low level: tide marks on brickwork, salt staining, replaced render. Inspect basement, plant rooms and bin stores if accessible. Comment on lift pit condition, which is a frequent first casualty in lower-ground-floor flooding.",
  },
  {
    priority: "low",
    heading: "Crime above national average (physical security)",
    finding:
      "1,127 recorded incidents within 1 mile in the last 12 months, above the national average for the area type. The building is a managed block with intercom access; the subject flat sits at the top of a single core.",
    action:
      "Inspect front door specification (PAS24, multi-point locking, fire-rated FD30S or FD60S?), letterbox restrictor, intercom panel condition, and any visible damage to the communal entry. Confirm window restrictors on any opening lights and the condition of any roof-terrace door if present.",
  },
];

const FRAMEWORKS = [
  "RICS Home Survey Standard Level 2 (HomeBuyer) inspection checklist",
  "RICS Home Survey Standard Level 3 (Building Survey) inspection checklist",
  "British Geological Survey GeoSure shrink-swell, landslide, compressible ground",
  "Building Safety Act 2022 (Higher-Risk Building inspection)",
  "EPC SAP recommendations and retrofit feasibility (PAS 2035 considerations)",
  "Environment Agency Flood Zone 2/3 inspection points",
];

const TIMELINE = [
  {
    when: "Offer accepted",
    what:
      "Forward the brief to your RICS surveyor before they quote. Property-specific scope makes their fee more accurate, and the surveyor knows what to prioritise.",
  },
  {
    when: "Survey commissioned",
    what:
      "Surveyors charge for a generic visit. The brief converts that visit into a targeted inspection: clay heave, roof junction, cavity, ventilation, perimeter water.",
  },
  {
    when: "Report received",
    what:
      "Cross-check the surveyor's report against the brief. Every item must be addressed in writing; anything silent is a missed inspection request you can challenge.",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-emerald-700">
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
    <div className="rounded-md border-l-4 border-emerald-300 bg-emerald-50/60 px-4 py-3 text-[13px] leading-relaxed text-slate-800 whitespace-pre-line">
      {children}
    </div>
  );
}

function SourceLine({ children }: { children: React.ReactNode }) {
  return <p className="text-xs italic text-slate-500 break-words">{children}</p>;
}

const DETAIL_CONTENT: React.ReactNode[] = [
  // 0 - Shrink-swell clay band 3
  <div key="d0" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "BGS GeoSure shrink-swell band", v: "Band 3 of 5 (moderate)" },
          { k: "Landslide band", v: "Band 1 of 5 (very low)" },
          { k: "Compressible ground", v: "Band 1 of 5 (very low)" },
          { k: "Soluble rocks", v: "Band 1 of 5 (very low)" },
          { k: "Subsoil type", v: "London Clay Formation (sequence LC; engineering category over-consolidated)" },
          { k: "Plasticity index", v: "Typically 40-65% in this part of Southwark" },
          { k: "Local heave events", v: "2018 & 2022 hot summers, documented increase in subsidence claims across E1/E14" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        London clay is the most actively shrink-swelling subsoil in the UK. Even in a 2017 build with
        modern foundations, the surrounding ground can pull on services, paving and boundary walls.
        Top-floor flats are not typically affected by subsidence in the same way as ground-floor
        dwellings, but cracking elsewhere in the building structure can indicate foundation
        movement that may eventually compromise the whole frame, and surveyor commentary on the
        building footprint as a whole is essential.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like (RICS L2 / L3 scope)</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li><strong>L2 scope:</strong> Sighting along visible elevations from ground level; reporting any external cracking ≥3 mm; condition rating 1-3 on all visible building elements.</li>
        <li><strong>L3 scope (add):</strong> Closer external inspection where access allows; commentary on likely foundation type and depth in relation to BGS data; recommendations for monitoring or further investigation; opinion on cause and likely future behaviour.</li>
        <li>Photographs of every length of cracking longer than 200 mm or wider than 3 mm.</li>
        <li>Specific commentary on the southwest elevation, which faces the dominant tree line and is most exposed to seasonal moisture cycling.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the RICS surveyor</SectionHeading>
      <Quote>
        {`Re: Flat 14, Sample Wharf House, pre-survey scope note

The BGS GeoSure data places the building footprint in shrink-swell band 3 (moderate) on London Clay. The 2018 and 2022 hot summers triggered a documented uptick in subsidence claims across the E1 postcode. Please:

1. Sight along every visible external elevation and report any stepped, diagonal, or hairline cracking ≥1 mm with photograph, length and width measurement.

2. Comment specifically on the southwest elevation (which faces mature trees) and any displacement at window/door reveals on that elevation.

3. Inspect externally for evidence of past underpinning, resin injection, or replacement bricks at DPC level.

4. Where any cracking ≥3 mm is observed, provide an opinion on whether it is consistent with normal settlement of a 2017 build or whether further investigation by a structural engineer is warranted.

5. Confirm whether the BGS shrink-swell band 3 classification is reflected in any seller-disclosed subsidence claim or insurance loading.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>BGS GeoSure: https://www.bgs.ac.uk/geology-projects/geosure/</SourceLine>
      <SourceLine>BGS Geology Viewer: https://www.bgs.ac.uk/map-viewers/geology-of-britain-viewer/</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Surveyor: RICS Level 2 (HomeBuyer) typically £600-£900 for a London flat; Level 3 typically
        £950-£1,500. The extra scope above adds no cost when communicated before the visit; if
        requested after the visit, expect a £200-£300 supplementary inspection fee.
      </p>
    </div>
  </div>,

  // 1 - BSR HRB top floor
  <div key="d1" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "BSR HRB register ref", v: "HRB-2024-04-0017842" },
          { k: "Height", v: "32 m / 12 storeys / 48 units" },
          { k: "Subject flat floor", v: "4 of 4 within its core (top floor of its stair)" },
          { k: "Roof construction", v: "Flat warm-deck (TBC from drawings; visual inspection required)" },
          { k: "Parapet upstand", v: "Visible from street; condition unknown" },
          { k: "Lift overrun position", v: "Adjacent to subject flat, to confirm internally" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        The top-floor flat in a BSR HRB carries concentrated exposure to roof defects: parapet flashing
        failures, downpipe blockages, lift overrun condensation. Water ingress at the ceiling-wall
        junction is the most common defect found in 2015-2020 cohort flat roofs once warranties expire.
        The surveyor must verify the interface between the flat ceiling and the roof structure
        directly: a Level 2 inspection that simply ticks &quot;ceilings appear sound&quot; misses this.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like (physical inspection scope)</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Internal inspection of all ceiling-wall junctions in every habitable room, with moisture meter readings.</li>
        <li>Photograph of any roof terrace, parapet, balustrade and rooflight.</li>
        <li>Internal visual inspection of any soil/vent stack passing through the flat.</li>
        <li>External view of the roof drainage path from the nearest accessible vantage point.</li>
        <li>Comment on lift overrun room (if accessible) and any plant noise/vibration audible in the flat.</li>
        <li>Note any historic decoration that has been spot-patched at the ceiling perimeter (a classic concealment of past ingress).</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the RICS surveyor</SectionHeading>
      <Quote>
        {`Re: Flat 14, top-floor / roof junction inspection

The flat is on the top floor of its core, in a building registered with the BSR as a Higher-Risk Building. The roof, parapet, downpipes and any lift overrun are directly adjacent to the subject flat. Please:

1. Take moisture meter readings at every ceiling-wall junction in every habitable room. Report any readings above ambient.

2. Photograph any visible staining, salt crystallisation, blown plaster, or decorative spot-patching at the ceiling perimeter.

3. From the nearest accessible vantage point externally, photograph the roof drainage path and parapet upstand.

4. Comment on the condition of any roof terrace door, threshold, and the interface with the roof finish.

5. If access can be arranged, view the lift overrun and roof void hatch internally and report on condensation, insulation and any visible water staining.

6. Provide an explicit opinion on the risk of future water ingress from the roof junction within the next 5 years.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>BSR HRB register: https://www.gov.uk/guidance/find-a-high-rise-residential-building</SourceLine>
      <SourceLine>RICS Home Survey Standard: https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/building-surveying-standards/home-survey-standard</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Surveyor: this scope is within standard Level 2 / 3 inspection time and adds no fee when
        communicated before the visit. Drone survey of the parapet (if requested): £250-£450 extra.
      </p>
    </div>
  </div>,

  // 2 - 2017 cavity + EPC no insulation
  <div key="d2" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "EPC certificate date", v: "April 2018 (first issue, post-completion)" },
          { k: "Walls description (verbatim)", v: '"Cavity wall, as built, no insulation"' },
          { k: "EPC wall efficiency rating", v: "Average (3/5)" },
          { k: "U-value implied", v: "1.5-1.8 W/m²K (uninsulated 100 mm cavity)" },
          { k: "Build year", v: "2017 (post-Approved Document L1A 2013)" },
          { k: "Expected design U-value", v: "0.18-0.30 W/m²K under 2013 Part L" },
          { k: "Wall-tie type", v: "Stainless steel (post-1981 standard); spacing to confirm visually" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        A 2017 cavity wall declared as uninsulated on the EPC is anomalous: it should either be a
        full-fill mineral wool or partial-fill phenolic/PIR. Three explanations are possible: (i) the
        EPC assessor used a default because they could not inspect, (ii) the as-built deviated from the
        design and the cavity is genuinely empty, (iii) the cavity is insulated but the EPC is wrong.
        Each carries different consequences for thermal performance, condensation risk, and (if
        empty) the feasibility of retrofit in a BSR HRB.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like (physical inspection scope)</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Borescope inspection at a discreet location (behind a removed vent grille or junction box), with photograph.</li>
        <li>Confirmation of presence/absence of cavity batts, partial-fill boards, or bead fill.</li>
        <li>Visual check of wall-tie spacing and corrosion status.</li>
        <li>Thermographic image (optional) of an external elevation in winter conditions, if available.</li>
        <li>Comment on retrofit feasibility (pumped EPS bead: £1,500-£3,000 per flat; technical and freeholder consent both required).</li>
        <li>Note that any cavity injection in a BSR HRB will require Building Safety Regulator engagement under the Gateway 2 / 3 regime.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the RICS surveyor</SectionHeading>
      <Quote>
        {`Re: Flat 14, cavity wall verification

The EPC dated April 2018 records the wall construction as "Cavity wall, as built, no insulation". This is unusual for a 2017 build under Approved Document L1A 2013, which required design U-values in the order of 0.18-0.30 W/m²K. Please:

1. Borescope or otherwise visually inspect the cavity at one discreet location (e.g. behind a removed vent grille). Photograph and report.

2. Confirm in writing whether the cavity is empty, partially filled, or fully filled, and the apparent material.

3. Report on wall-tie type and spacing where visible, and any sign of corrosion or displacement.

4. If empty, comment on retrofit feasibility for a top-floor flat in a BSR HRB, including likely cost and consent regime.

5. Comment on any internal evidence of cold bridging (mould bloom, condensation marks at corners) consistent with an uninsulated cavity.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>EPC register: https://www.gov.uk/find-energy-certificate</SourceLine>
      <SourceLine>Approved Document L (Conservation of fuel and power): https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Surveyor: borescope inspection adds £75-£150 to the standard fee. Thermographic imaging (where
        offered) £200-£400. Independent EPC re-assessment: £55-£120. Without this verification the
        buyer cannot price retrofit cost or thermal performance.
      </p>
    </div>
  </div>,

  // 3 - Top-floor roof drainage / ventilation
  <div key="d3" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Flat position", v: "Top floor (4 of 4 in core); aspect dual east/south" },
          { k: "Roof type", v: "Flat warm-deck (likely); single-ply membrane or built-up felt, to confirm" },
          { k: "Roof drainage", v: "Parapet gutters with internal downpipes serving this flat directly" },
          { k: "Ventilation strategy", v: "MVHR not specified on EPC; trickle vents to bedrooms" },
          { k: "Bathroom/kitchen extract", v: "Mechanical extract fans, to confirm working" },
          { k: "Airtightness as-designed", v: "Typical 2017 cohort target 5-7 m³/h/m² at 50 Pa" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Top-floor flats in 2015-2020 cohort blocks frequently develop condensation problems at
        ceiling perimeters during winter, particularly where airtightness exceeds the design target
        but ventilation does not. Mould bloom and salt crystallisation at internal corners are the
        first visible symptoms. The drainage path from parapet to street level is also commonly
        compromised by debris, particularly where there is no roof terrace and the gutters are not
        regularly maintained.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like (physical inspection scope)</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Moisture meter readings at all internal corners adjacent to external walls.</li>
        <li>Inspection of kitchen and bathroom extract fans, power on, airflow observable.</li>
        <li>Confirmation of trickle vent presence and operability on every external window.</li>
        <li>Comment on any visible water staining, salt staining or mould bloom at ceiling perimeter.</li>
        <li>External view of every visible downpipe and parapet outlet from accessible viewpoints.</li>
        <li>Note any obvious sign of past gutter blockage (water staining on facade below outlet level).</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the RICS surveyor</SectionHeading>
      <Quote>
        {`Re: Flat 14, drainage and ventilation inspection

The flat is the top dwelling in its core. Roof drainage, parapet gutters and downpipes serve this dwelling directly, and EPC records indicate no MVHR system, only trickle vents. Please:

1. Take moisture meter readings at every internal corner adjacent to an external wall and report any reading above ambient.

2. Confirm that kitchen and bathroom extract fans are present, powered, and visually observable airflow can be detected.

3. Confirm that trickle vents are present and operable on every external window.

4. Externally, photograph every visible downpipe and parapet outlet and comment on staining below outlet level (a marker of past blockage).

5. Comment on the visible ceiling perimeter in every habitable room: any mould bloom, salt crystallisation, or spot-patched paint.

6. Provide an opinion on whether the ventilation strategy in the flat is adequate for the airtightness expected of a 2017 build.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>Approved Document F (Ventilation): https://www.gov.uk/government/publications/ventilation-approved-document-f</SourceLine>
      <SourceLine>BRE Digest 245 (Rising damp / condensation diagnostics): available from BRE</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Surveyor: standard Level 2/3 scope, no additional fee. Subsequent ventilation airflow
        testing by an MVHR specialist (if needed): £150-£300.
      </p>
    </div>
  </div>,

  // 4 - EPC D / potential B
  <div key="d4" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Current EPC", v: "D, SAP 64" },
          { k: "Potential EPC", v: "B, SAP 84" },
          { k: "Largest recommended uplift", v: "Cavity wall insulation (if cavity confirmed empty)" },
          { k: "Other listed recommendations", v: "Low-energy lighting, smart heating controls, solar PV" },
          { k: "Heating system", v: "Communal heat network (district heating); secondary electric panel heaters, to verify" },
          { k: "Hot water", v: "Communal via heat interface unit" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        The flat&apos;s headline efficiency rating is a function of communal systems the leaseholder
        cannot directly modify. The reported potential EPC of B (SAP 84) is largely theoretical
        without freeholder buy-in for cavity insulation, roof-mounted solar PV, and any heat network
        efficiency uplift. Realistic leaseholder-only uplifts get the flat to a C, not a B.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like (surveyor commentary scope)</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>List of EPC recommendations that fall within the leaseholder&apos;s gift (lighting, controls, low-flow regulators).</li>
        <li>List of EPC recommendations requiring freeholder consent (cavity insulation, solar PV, communal heat metering).</li>
        <li>Realistic SAP uplift achievable by leaseholder alone (typically 5-8 points = D to C).</li>
        <li>Realistic SAP uplift requiring freeholder coordination (further 8-14 points = C to B).</li>
        <li>Comment on the communal heat network and any indicative running cost figure for the last 12 months.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the RICS surveyor</SectionHeading>
      <Quote>
        {`Re: Flat 14, EPC and retrofit feasibility

Current EPC is D (SAP 64) with a stated potential of B (SAP 84). The flat is on a communal heat network and is in a BSR HRB. Please:

1. List the EPC recommendations that the leaseholder can implement without freeholder consent.

2. List the EPC recommendations that require freeholder consent (cavity insulation, solar PV, communal heat metering, ASHP).

3. Estimate the realistic SAP uplift achievable by leaseholder action alone, and separately the further uplift requiring freeholder coordination.

4. Comment on the heat interface unit (HIU) condition and any visible secondary electric heating.

5. Where the seller can provide 12 months of communal heat charges, comment on whether they are within the typical range for a 67 m² flat on this kind of network.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>EPC register: https://www.gov.uk/find-energy-certificate</SourceLine>
      <SourceLine>SAP methodology (BRE): https://www.bregroup.com/sap/</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Surveyor: standard scope, no extra fee. Independent EPC re-assessment: £55-£120. Heat network
        running cost commentary requires the seller to provide 12 months of statements (no cost to
        the buyer).
      </p>
    </div>
  </div>,

  // 5 - Flood Zone 2 perimeter
  <div key="d5" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "EA Flood Zone", v: "Zone 2 (medium fluvial / tidal probability, 0.1%-1% annual)" },
          { k: "Surface water risk", v: "Medium (1-in-100-year)" },
          { k: "Direct flat exposure", v: "Low, top floor" },
          { k: "Communal area exposure", v: "Medium, ground-floor entrance, bin store, plant rooms, lift pit" },
          { k: "Local LFRMS notes", v: "Southwark surface water hot-spot mapping 2023 identifies this junction" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Top-floor flats are protected from direct flood damage, but the resale value, communal-area
        condition, and insurance loading on the block all depend on the broader building&apos;s flood
        resilience. Lift pits and plant rooms are the most common first-loss areas. Surveyor
        commentary on perimeter evidence helps quantify historic events not necessarily disclosed in
        the seller&apos;s pack.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like (physical inspection scope)</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>External perimeter walk and photographs of tide marks, salt staining, or replaced render at low level.</li>
        <li>Inspection of bin store, plant room, lift pit and any basement area (where access allows).</li>
        <li>Comment on door thresholds and any visible flood-resistance measures (barriers, brick vents).</li>
        <li>Note any external drainage gully condition.</li>
        <li>Cross-reference any seller-disclosed historic insurance claim relating to water damage.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the RICS surveyor</SectionHeading>
      <Quote>
        {`Re: Flat 14, flood resilience inspection (communal areas)

The building is in Environment Agency Flood Zone 2. The subject flat is on the top floor so direct exposure is low, but communal areas at ground and lower-ground level carry the loss exposure. Please:

1. Walk the external perimeter of the building and photograph any evidence of past water ingress at low level (tide marks, salt staining, replaced render).

2. Where access permits, inspect the lift pit, plant room, bin store and any basement area, and photograph any sign of past flooding (water staining, replaced plaster, marker tape).

3. Comment on door thresholds, brick vents and any visible flood-resistance measures.

4. Comment on the external drainage gully condition.

5. Provide an opinion on the resilience of communal areas to a 1-in-100-year fluvial or surface water event.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>EA Flood Map: https://check-long-term-flood-risk.service.gov.uk/postcode</SourceLine>
      <SourceLine>Southwark Local Flood Risk Management Strategy: https://www.towerhamlets.gov.uk/</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Surveyor: standard external inspection, no extra fee. Specialist environmental search to
        accompany: £50-£70 (Landmark Homecheck).
      </p>
    </div>
  </div>,

  // 6 - Crime / physical security
  <div key="d6" className="space-y-5">
    <div className="space-y-2">
      <SectionHeading>Underlying data</SectionHeading>
      <DataList
        rows={[
          { k: "Recorded incidents (12 months, 1 mile radius)", v: "1,127" },
          { k: "National average comparable", v: "~720 (post-COVID baseline)" },
          { k: "Most common offence types", v: "Theft from person, anti-social behaviour, bicycle theft" },
          { k: "Building access", v: "Audio/video intercom, single core, fob-controlled lift" },
          { k: "Front door spec required (BSR HRB)", v: "Fire-rated FD30S minimum, PAS24 security where lender insists" },
        ]}
      />
    </div>

    <div className="space-y-2">
      <SectionHeading>Why it matters</SectionHeading>
      <p>
        Above-average crime density does not translate directly into burglary risk for a top-floor flat
        behind two layers of access control, but the physical security of the flat door, intercom
        system, and communal entrance directly affects insurance loading and resale appeal.
        Combination of fire-rated and security-rated door requirements (FD30S + PAS24) is becoming the
        norm in BSR HRBs and lenders increasingly ask about it.
      </p>
    </div>

    <div className="space-y-2">
      <SectionHeading>What &quot;good&quot; looks like (physical inspection scope)</SectionHeading>
      <ul className="list-disc list-outside pl-5 space-y-1">
        <li>Front door inspection: fire rating (FD30S / FD60S certification mark), PAS24 plate, multi-point locking, intumescent strips and smoke seals.</li>
        <li>Letterbox restrictor present.</li>
        <li>Intercom panel condition; video display operable.</li>
        <li>Communal entrance: any visible damage, force marks, repaired glazing.</li>
        <li>Window restrictors on all opening lights, especially top floor.</li>
        <li>Roof terrace door (if any): condition, lock specification.</li>
      </ul>
    </div>

    <div className="space-y-2">
      <SectionHeading>Sample question to put to the RICS surveyor</SectionHeading>
      <Quote>
        {`Re: Flat 14, physical security inspection

Recorded incidents within a 1-mile radius are 1,127 over the last 12 months (above national baseline). Please:

1. Inspect the flat's front door and photograph the fire rating certification mark (FD30S / FD60S), the PAS24 plate if present, multi-point locking, intumescent strips and smoke seals.

2. Confirm whether a letterbox restrictor is fitted.

3. Inspect the intercom panel and confirm video display is operable.

4. Inspect the communal entrance externally and report on any visible damage, force marks, or repaired glazing.

5. Confirm presence of window restrictors on all opening lights, with specific attention to the top-floor exposure.

6. Where a roof terrace exists, inspect the terrace door, lock specification, and any external access points.

Thank you.`}
      </Quote>
    </div>

    <div className="space-y-2">
      <SectionHeading>Source</SectionHeading>
      <SourceLine>Police.uk crime statistics: https://www.police.uk/</SourceLine>
      <SourceLine>PAS24 standard: BSI publication, summary: https://www.bsigroup.com/</SourceLine>
    </div>

    <div className="space-y-2">
      <SectionHeading>Cost to verify</SectionHeading>
      <p>
        Surveyor: standard scope, no extra fee. Replacement of a non-FD30S/PAS24 door (if required):
        £1,200-£2,400 inclusive of installation.
      </p>
    </div>
  </div>,
];

export default function SampleSurveyorPage() {
  return (
    <>
      <Header />

      <section className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold tracking-wider text-emerald-200 uppercase">
            Sample Surveyor Brief
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
            Stop paying £750 for a generic RICS visit that
            <span className="text-emerald-300"> misses what is actually wrong</span>.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-300 max-w-3xl">
            The Surveyor Brief in your Premium+ report (£6.99) tells your RICS surveyor exactly which
            cracks, junctions, materials and risks to look at, based on the geology, build year, building
            type and EPC of the specific property you are buying.
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
          It is a short, prioritised inspection list for one specific reader: the RICS-registered surveyor
          you are about to instruct. It pulls in the geology, build year, flood, EPC and building-safety
          flags your report has already found, and tells the surveyor where to look first.
        </p>
        <p className="mt-3 text-slate-700 leading-relaxed">
          It does not replace the survey. It stops a generic £750 Level 2 visit from glossing over the
          one issue that actually matters (clay heave on band 3 substrate, untraced wall-tie corrosion in a
          mis-EPC'd 2017 cavity, top-floor roof junction water ingress). Surveyors welcome these briefs:
          they make scope quoting more accurate and reduce post-report disputes.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-4">
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                Surveyor Brief
              </div>
              <div className="text-sm text-emerald-900 mt-1">
                Flat 14, Sample Wharf House, 25 Example Quay, London SE16 4ZZ
              </div>
            </div>
            <div className="text-xs text-emerald-900/70">
              Generated 17 May 2026 from HomeBuyerCheck Premium+ report
            </div>
          </div>

          <div className="rounded-xl bg-white border border-emerald-200 p-5 md:p-6 mb-6">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Summary</div>
            <p className="mt-2 text-slate-900 leading-relaxed">
              Top-floor 2-bed flat (4 of 4) in a 2017 BSR Higher-Risk Building, on shrink-swell clay band 3
              with an EPC describing the cavity as uninsulated. Seven inspection priorities below; clay
              evidence and the roof junction are the two items most likely to be missed by a Level 2 visit.
            </p>
          </div>

          <ol className="space-y-4">
            {ITEMS.map((item, i) => (
              <li
                key={i}
                className="rounded-xl bg-white border border-emerald-200/80 p-5 md:p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900 text-base md:text-lg leading-snug">
                    <span className="text-emerald-700 mr-2">{i + 1}.</span>
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
                  <span className="font-semibold text-emerald-700">Action. </span>
                  {item.action}
                </p>
                <DetailButton
                  title={`${i + 1}. ${item.heading}`}
                  label="View full evidence →"
                  accent="emerald"
                >
                  {DETAIL_CONTENT[i]}
                </DetailButton>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-xs italic text-emerald-900/70 leading-relaxed">
            This brief is generated from public data and is intended as scope input for a RICS-registered
            surveyor. It is not a survey, does not replace one, and creates no contractual obligation on
            the surveyor to find or not find any specific defect.
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
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
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
            <Link href="/sample-solicitor" className="text-emerald-700 font-semibold hover:underline">
              Solicitor sample
            </Link>{" "}
            ·{" "}
            <Link href="/sample-mortgage" className="text-emerald-700 font-semibold hover:underline">
              Mortgage broker sample
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
