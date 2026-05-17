import { Buffer } from "node:buffer";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { PaidReport } from "../types";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 11, color: "#000000", lineHeight: 1.35 },
  header: { borderBottomWidth: 1, borderBottomColor: "#000000", paddingBottom: 6, marginBottom: 10 },
  brand: { fontSize: 13, fontWeight: 700, color: "#000000" },
  brandSub: { fontSize: 10, color: "#000000", marginTop: 1 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  metaCell: { fontSize: 9, color: "#000000", marginRight: 14, marginTop: 2 },
  metaLabel: { fontWeight: 700 },
  h2: { fontSize: 14, fontWeight: 700, color: "#000000", marginTop: 12, marginBottom: 4 },
  body: { fontSize: 11, color: "#000000" },
  bulletRow: { flexDirection: "row", marginBottom: 2 },
  bullet: { width: 10, fontSize: 11 },
  bulletText: { flex: 1, fontSize: 11, color: "#000000" },
  table: { borderWidth: 1, borderColor: "#000000", marginTop: 4 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000000" },
  trLast: { flexDirection: "row" },
  th: { fontSize: 10, fontWeight: 700, padding: 4, borderRightWidth: 1, borderRightColor: "#000000" },
  td: { fontSize: 10, padding: 4, borderRightWidth: 1, borderRightColor: "#000000", color: "#000000" },
  tdLast: { fontSize: 10, padding: 4, color: "#000000" },
  thLast: { fontSize: 10, fontWeight: 700, padding: 4 },
  colNum: { width: "6%" },
  colSearch: { width: "32%" },
  colReason: { width: "47%" },
  colCost: { width: "15%" },
  facts: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  factCell: { width: "50%", flexDirection: "row", paddingVertical: 1, paddingRight: 6 },
  factLabel: { fontSize: 10, fontWeight: 700, width: "55%", color: "#000000" },
  factValue: { fontSize: 10, width: "45%", color: "#000000" },
  footer: { position: "absolute", left: 36, right: 36, bottom: 20, fontSize: 8, color: "#000000", borderTopWidth: 0.5, borderTopColor: "#000000", paddingTop: 4 },
  small: { fontSize: 9, color: "#000000" },
  noteLine: { fontSize: 10, marginTop: 4, color: "#000000" },
});

interface RecommendedSearch {
  search: string;
  reason: string;
  cost: string;
}

export async function generateSolicitorHandoverPdf(
  report: PaidReport,
  liveUrl: string | null
): Promise<Buffer> {
  const property = report.free.property;
  const title = report.title;
  const flags = report.flags;
  const free = report.free;

  const generatedDate = new Date(report.generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ---------- Section 1: Critical findings ----------
  const findings: string[] = [];

  if (title) {
    if (typeof title.charges === "number") {
      findings.push(
        `Charges register: ${title.charges} ${title.charges === 1 ? "entry" : "entries"} recorded. Confirm redemption statements and discharge of any outstanding charges before completion.`
      );
    }
    if (title.hasRestrictiveCovenants) {
      findings.push(
        "Restrictive covenants present on the title — review wording, identify enforceability, and consider indemnity insurance if breach risk."
      );
    }
    if (typeof title.restrictions === "number" && title.restrictions > 0) {
      findings.push(
        `Restrictions: ${title.restrictions} on the proprietorship register. Identify whose consent is required for any disposition.`
      );
    }
    if (typeof title.cautions === "number" && title.cautions > 0) {
      findings.push(
        `Cautions: ${title.cautions} entered against the title. Establish basis and seek removal or undertaking before exchange.`
      );
    }
    if (title.tenure === "leasehold") {
      const term = title.leaseTermYears ? `${title.leaseTermYears}-year term` : "term unknown";
      const remaining =
        typeof title.leaseRemainingYears === "number"
          ? `${title.leaseRemainingYears} yrs remaining`
          : "remaining unknown";
      const leaseLine = `Leasehold: ${term}, ${remaining}. Request LPE1 + LPE2, ground rent schedule, service-charge accounts (3 yrs), buildings insurance, and Section 20 notices.`;
      findings.push(leaseLine);
      if (typeof title.leaseRemainingYears === "number" && title.leaseRemainingYears < 80) {
        findings.push(
          `Lease unmortgageable risk: ${title.leaseRemainingYears} yrs is below the 80-yr marriage-value threshold. Consider statutory extension under LRHUDA 1993 before completion.`
        );
      }
    }
  }

  if (flags.listedBuilding?.listed) {
    findings.push(
      `Listed building (Grade ${flags.listedBuilding.grade ?? "unknown"}). Listed Building Consent required for alterations; confirm prior works were consented.`
    );
  }
  if (flags.conservationArea?.inArea) {
    findings.push(
      `Conservation area${flags.conservationArea.name ? ` (${flags.conservationArea.name})` : ""}. Article 4 directions and tighter PD rights may apply.`
    );
  }
  if (flags.treePreservationOrder?.affected) {
    findings.push("Tree Preservation Order in force. Works to protected trees require LPA consent.");
  }
  if (flags.coalReportingArea) {
    findings.push("Postcode within Coal Authority reporting area — CON29M (£60) recommended.");
  }
  if (flags.miningArea) {
    findings.push("Non-coal mining area — consider specialist mining search alongside CON29M.");
  }
  if (flags.contaminatedLand) {
    findings.push(
      "Possible contaminated land flag — instruct Environmental search (Groundsure / Landmark) and review Part 2A EPA 1990 register entries with the LA."
    );
  }
  if (flags.radonRiskBand && flags.radonRiskBand >= 3) {
    findings.push(
      `Radon affected area (Band ${flags.radonRiskBand}). Recommend BR211 radon assessment and Property Information Form Q on protective measures.`
    );
  }
  if (free.flood?.inFloodZone3) {
    findings.push("Flood Zone 3 (high probability). Order full Environmental + Flood search; review insurability and Flood Re eligibility.");
  } else if (free.flood?.inFloodZone2) {
    findings.push("Flood Zone 2 (medium probability). Order Environmental + Flood search; check insurance loadings.");
  }
  if (free.groundRisk && (free.groundRisk.shrinkSwell === "high" || free.groundRisk.shrinkSwell === "very-high")) {
    findings.push(
      `Ground risk: ${free.groundRisk.shrinkSwell} shrink-swell potential. Review structural survey for subsidence indicators; verify insurance position.`
    );
  }
  if (flags.knotweedRisk === "high" || flags.knotweedRisk === "medium") {
    findings.push(
      `Japanese knotweed risk reported as ${flags.knotweedRisk}. Raise PIF q.7.8 enquiry; obtain management plan and insurance-backed guarantee if treated.`
    );
  }
  if (flags.aonb) {
    findings.push("Within AONB designation — heightened planning constraints on alterations and extensions.");
  }
  if (flags.greenBelt) {
    findings.push("Green Belt — very restrictive PD rights; verify any extensions/outbuildings have consent.");
  }
  if (flags.article4) {
    findings.push("Article 4 direction in force — permitted development rights restricted; verify recent works.");
  }

  if (findings.length === 0) {
    findings.push("No automated red flags identified from public datasets. Standard pre-contract enquiries still required.");
  }

  // ---------- Section 2: Recommended searches ----------
  const searches: RecommendedSearch[] = [];

  searches.push({
    search: "Local authority search (CON29 + LLC1)",
    reason: "Standard — planning, highways, building regs, enforcement.",
    cost: "£100-200",
  });
  searches.push({
    search: "Drainage & water search (CON29DW)",
    reason: "Standard — confirm mains connection and public sewer routing.",
    cost: "£40-60",
  });

  if (title?.tenure === "leasehold") {
    searches.push({
      search: "LPE1 + LPE2 (leasehold management pack)",
      reason: "Leasehold property — service charge, ground rent, building insurance, S20.",
      cost: "Std (landlord fee)",
    });
  }
  if (flags.coalReportingArea) {
    searches.push({
      search: "CON29M (coal mining)",
      reason: "Within Coal Authority reporting area.",
      cost: "£60",
    });
  }
  if (flags.miningArea && !flags.coalReportingArea) {
    searches.push({
      search: "Non-coal mining search",
      reason: "Historical non-coal mining workings indicated.",
      cost: "£40-90",
    });
  }
  const envTriggered =
    free.flood?.inFloodZone2 ||
    free.flood?.inFloodZone3 ||
    flags.contaminatedLand ||
    (free.groundRisk &&
      (free.groundRisk.shrinkSwell === "high" ||
        free.groundRisk.shrinkSwell === "very-high" ||
        free.groundRisk.shrinkSwell === "significant"));
  if (envTriggered) {
    const reasons: string[] = [];
    if (free.flood?.inFloodZone3) reasons.push("Flood Zone 3");
    else if (free.flood?.inFloodZone2) reasons.push("Flood Zone 2");
    if (flags.contaminatedLand) reasons.push("contaminated-land flag");
    if (free.groundRisk?.shrinkSwell === "high" || free.groundRisk?.shrinkSwell === "very-high")
      reasons.push(`${free.groundRisk.shrinkSwell} shrink-swell`);
    else if (free.groundRisk?.shrinkSwell === "significant") reasons.push("significant shrink-swell");
    searches.push({
      search: "Environmental search (Groundsure / Landmark)",
      reason: reasons.join(", ") + ".",
      cost: "£40-90",
    });
  }
  if (flags.radonRiskBand && flags.radonRiskBand >= 3) {
    searches.push({
      search: "Radon BR211 assessment",
      reason: `UKHSA radon Band ${flags.radonRiskBand} (3+ requires basic protective measures).`,
      cost: "£50",
    });
  }
  if (flags.listedBuilding?.listed || flags.conservationArea?.inArea || flags.article4) {
    const reasons: string[] = [];
    if (flags.listedBuilding?.listed) reasons.push(`Grade ${flags.listedBuilding.grade ?? "?"} listed`);
    if (flags.conservationArea?.inArea) reasons.push("conservation area");
    if (flags.article4) reasons.push("Article 4");
    searches.push({
      search: "Planning history & LBC verification",
      reason: `Heritage constraints (${reasons.join(", ")}) — confirm consents for alterations.`,
      cost: "LA fee",
    });
  }
  if (flags.treePreservationOrder?.affected) {
    searches.push({
      search: "TPO confirmation with LPA",
      reason: "TPO indicated — confirm trees affected and any consents granted.",
      cost: "Std",
    });
  }
  if (flags.knotweedRisk === "high" || flags.knotweedRisk === "medium") {
    searches.push({
      search: "Knotweed PIF enquiry + management plan",
      reason: `Knotweed risk ${flags.knotweedRisk}.`,
      cost: "Std",
    });
  }
  if (typeof title?.charges === "number" && title.charges > 0) {
    searches.push({
      search: "Charges redemption statement",
      reason: `${title.charges} charge(s) on title — require DS1/E-DS1 on completion.`,
      cost: "Std",
    });
  }
  if (typeof title?.restrictions === "number" && title.restrictions > 0) {
    searches.push({
      search: "Restriction compliance evidence",
      reason: "Proprietorship register restrictions — obtain certificates of compliance.",
      cost: "Std",
    });
  }
  searches.push({
    search: "Bankruptcy + priority searches (K15/OS1)",
    reason: "Pre-completion — buyer & seller insolvency / OS1 priority period.",
    cost: "£2-7",
  });

  // ---------- Section 3: Property facts ----------
  const lastSale = free.priceHistory?.sales?.[0];
  const facts: { label: string; value: string }[] = [
    {
      label: "EPC rating",
      value: free.epc?.rating
        ? `${free.epc.rating}${free.epc.potentialRating ? ` (potential ${free.epc.potentialRating})` : ""}`
        : "Unknown",
    },
    { label: "Build year", value: free.epc?.buildYear ? String(free.epc.buildYear) : "Unknown" },
    {
      label: "Floor area",
      value: free.epc?.totalFloorArea ? `${Math.round(free.epc.totalFloorArea)} m²` : "Unknown",
    },
    {
      label: "Property type",
      value: [free.epc?.propertyType, free.epc?.builtForm].filter(Boolean).join(", ") || "Unknown",
    },
    {
      label: "Last sold",
      value: lastSale
        ? `£${lastSale.price.toLocaleString("en-GB")} on ${new Date(lastSale.date).toLocaleDateString("en-GB")}`
        : "No record since 1995",
    },
    {
      label: "Postcode median",
      value: free.priceHistory?.postcodeMedian
        ? `£${free.priceHistory.postcodeMedian.toLocaleString("en-GB")}`
        : "Unknown",
    },
    {
      label: "Council tax",
      value: free.councilTax?.band
        ? `Band ${free.councilTax.band}${free.councilTax.estimatedAnnualCost ? ` — £${free.councilTax.estimatedAnnualCost.toLocaleString("en-GB")}/yr` : ""}`
        : "Unknown",
    },
    {
      label: "Flood zone",
      value: free.flood
        ? free.flood.inFloodZone3
          ? "Zone 3 (high)"
          : free.flood.inFloodZone2
            ? "Zone 2 (medium)"
            : "Outside Zones 2/3"
        : "Unknown",
    },
    {
      label: "Crime (12m, ~1mi)",
      value: free.crime
        ? `${free.crime.totalIncidents.toLocaleString("en-GB")} incidents${typeof free.crime.nationalAverage === "number" ? ` (nat. avg ${free.crime.nationalAverage.toLocaleString("en-GB")})` : ""}`
        : "Unknown",
    },
    {
      label: "Schools (Outstanding/Good)",
      value: schoolsSummary(free.schools),
    },
    {
      label: "Broadband (max)",
      value: free.broadband?.providers?.length
        ? `${Math.max(...free.broadband.providers.map((p) => p.maxDownload))} Mbps`
        : "Unknown",
    },
    {
      label: "Ground risk (shrink-swell)",
      value: free.groundRisk?.shrinkSwell ? capitalise(free.groundRisk.shrinkSwell) : "Unknown",
    },
  ];

  // ---------- Render ----------
  const Doc = (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.brand}>HomeBuyerCheck — Solicitor Handover</Text>
          <Text style={styles.brandSub}>{property.fullAddress || property.postcode}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaCell}>
              <Text style={styles.metaLabel}>Title no: </Text>
              {title?.titleNumber ?? "—"}
            </Text>
            <Text style={styles.metaCell}>
              <Text style={styles.metaLabel}>Tenure: </Text>
              {tenureLabel(title)}
            </Text>
            <Text style={styles.metaCell}>
              <Text style={styles.metaLabel}>UPRN: </Text>
              {property.uprn ?? "—"}
            </Text>
            <Text style={styles.metaCell}>
              <Text style={styles.metaLabel}>Postcode: </Text>
              {property.postcode}
            </Text>
            <Text style={styles.metaCell}>
              <Text style={styles.metaLabel}>Generated: </Text>
              {generatedDate}
            </Text>
            {liveUrl ? (
              <Text style={styles.metaCell}>
                <Text style={styles.metaLabel}>Report URL: </Text>
                {liveUrl}
              </Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.h2}>1. Critical findings</Text>
        {findings.map((f, i) => (
          <View key={`f${i}`} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{f}</Text>
          </View>
        ))}

        <Text style={styles.h2}>2. Recommended searches & enquiries</Text>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, styles.colNum]}>#</Text>
            <Text style={[styles.th, styles.colSearch]}>Search / enquiry</Text>
            <Text style={[styles.th, styles.colReason]}>Reason</Text>
            <Text style={[styles.thLast, styles.colCost]}>Cost</Text>
          </View>
          {searches.map((s, i) => {
            const last = i === searches.length - 1;
            return (
              <View key={`s${i}`} style={last ? styles.trLast : styles.tr}>
                <Text style={[styles.td, styles.colNum]}>{i + 1}</Text>
                <Text style={[styles.td, styles.colSearch]}>{s.search}</Text>
                <Text style={[styles.td, styles.colReason]}>{s.reason}</Text>
                <Text style={[styles.tdLast, styles.colCost]}>{s.cost}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.h2}>3. Property facts</Text>
        <View style={styles.facts}>
          {facts.map((f, i) => (
            <View key={`fact${i}`} style={styles.factCell}>
              <Text style={styles.factLabel}>{f.label}</Text>
              <Text style={styles.factValue}>{f.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          Data sources: Title — HM Land Registry (Crown copyright). Environmental — Defra / Environment Agency. Crime — data.police.uk.
          EPC — MHCLG / EPC Register. Planning — planning.data.gov.uk. Generated by HomeBuyerCheck.co.uk for buyer&apos;s solicitor reference.
          Informational only; not a substitute for formal conveyancing searches.
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(Doc).toBuffer();
  return blob as unknown as Buffer;
}

function tenureLabel(title?: PaidReport["title"]): string {
  if (!title?.tenure) return "—";
  if (title.tenure === "freehold") return "Freehold";
  const remaining =
    typeof title.leaseRemainingYears === "number" ? ` (${title.leaseRemainingYears} yrs remaining)` : "";
  return `Leasehold${remaining}`;
}

function schoolsSummary(schools?: PaidReport["free"]["schools"]): string {
  if (!schools || schools.length === 0) return "Unknown";
  const within = schools.filter((s) => s.distance <= 1.6);
  const goodOrBetter = within.filter(
    (s) => s.rating && /outstanding|good/i.test(s.rating)
  );
  return `${goodOrBetter.length} within ~1 mi (of ${within.length})`;
}

function capitalise(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
