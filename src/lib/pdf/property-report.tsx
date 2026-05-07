import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { PaidReport } from "../types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#111827" },
  cover: { padding: 40, fontFamily: "Helvetica" },
  brand: { fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  brandSub: { fontSize: 11, color: "#475569" },
  divider: { borderTopWidth: 1, borderTopColor: "#e5e7eb", marginVertical: 14 },
  h1: { fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 6 },
  h2: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 18, marginBottom: 6 },
  body: { fontSize: 10, color: "#1f2937", lineHeight: 1.5 },
  small: { fontSize: 9, color: "#6b7280", lineHeight: 1.4 },
  card: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, padding: 12, marginBottom: 10 },
  cardLabel: { fontSize: 9, color: "#64748b", textTransform: "uppercase", marginBottom: 4 },
  cardValue: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  badge: { fontSize: 9, fontWeight: 700, padding: "3 8", borderRadius: 4 },
  green: { backgroundColor: "#ecfdf5", color: "#065f46" },
  amber: { backgroundColor: "#fffbeb", color: "#92400e" },
  red: { backgroundColor: "#fef2f2", color: "#991b1b" },
  footer: { position: "absolute", left: 40, right: 40, bottom: 24, fontSize: 8, color: "#94a3b8", textAlign: "center" },
});

export async function generatePropertyReportPdf(
  report: PaidReport,
  tier: "standard" | "premium",
  liveUrl: string | null
): Promise<Buffer> {
  const Doc = (
    <Document>
      <Page size="A4" style={styles.cover}>
        <Text style={styles.brand}>PropertyHistoryCheck</Text>
        <Text style={styles.brandSub}>{tier === "premium" ? "Premium" : "Standard"} Property Report</Text>
        <View style={styles.divider} />
        <Text style={styles.h1}>{report.free.property.fullAddress || report.free.property.postcode}</Text>
        <Text style={styles.small}>Report generated {new Date(report.generatedAt).toLocaleDateString("en-GB")}</Text>
        {liveUrl ? <Text style={[styles.small, { marginTop: 8 }]}>{liveUrl}</Text> : null}
        {report.buyersVerdict ? (
          <View style={[styles.card, { marginTop: 24, backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }]}>
            <Text style={[styles.cardLabel, { color: "#0c4a6e" }]}>Buyer&apos;s verdict</Text>
            <Text style={[styles.body, { marginTop: 4 }]}>{report.buyersVerdict}</Text>
          </View>
        ) : null}
        <Text style={styles.footer} fixed>
          Contains HM Land Registry data &copy; Crown copyright and database right. Informational use only &mdash; not a substitute for formal conveyancing searches.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Sales history</Text>
        {report.free.priceHistory?.sales?.length ? (
          report.free.priceHistory.sales.slice(0, 12).map((s, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.body}>{new Date(s.date).toLocaleDateString("en-GB")}</Text>
              <Text style={styles.body}>£{s.price.toLocaleString("en-GB")}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.small}>No sales recorded for this address since 1995.</Text>
        )}

        <Text style={styles.h2}>Energy performance</Text>
        {report.free.epc ? (
          <View style={styles.row}>
            <Text style={styles.body}>Current rating: {report.free.epc.rating ?? "Unknown"}</Text>
            <Text style={styles.body}>Build year: {report.free.epc.buildYear ?? "Unknown"}</Text>
          </View>
        ) : <Text style={styles.small}>No EPC certificate found for this address.</Text>}

        <Text style={styles.h2}>Council tax</Text>
        {report.free.councilTax?.band ? (
          <View style={styles.row}>
            <Text style={styles.body}>Band {report.free.councilTax.band}</Text>
            <Text style={styles.body}>{report.free.councilTax.estimatedAnnualCost ? `£${report.free.councilTax.estimatedAnnualCost.toLocaleString()} / yr` : ""}</Text>
          </View>
        ) : <Text style={styles.small}>Council tax band unknown.</Text>}

        <Text style={styles.h2}>Crime</Text>
        {report.free.crime ? (
          <Text style={styles.body}>{report.free.crime.totalIncidents} incidents reported within ~1 mile in the last {report.free.crime.monthsCovered} months.</Text>
        ) : <Text style={styles.small}>Crime data unavailable.</Text>}

        <Text style={styles.h2}>Schools (closest)</Text>
        {(report.free.schools ?? []).slice(0, 5).map((s, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.body}>{s.name} ({s.rating ?? "—"})</Text>
            <Text style={styles.body}>{s.distance.toFixed(1)} km</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          PropertyHistoryCheck.co.uk &mdash; informational use only.
        </Text>
      </Page>

      {tier === "premium" && report.title ? (
        <Page size="A4" style={styles.page}>
          <Text style={styles.h1}>Title register summary</Text>
          <View style={styles.row}><Text style={styles.body}>Title number</Text><Text style={styles.body}>{report.title.titleNumber ?? "—"}</Text></View>
          <View style={styles.row}><Text style={styles.body}>Tenure</Text><Text style={styles.body}>{report.title.tenure ?? "—"}</Text></View>
          {report.title.tenure === "leasehold" ? (
            <>
              <View style={styles.row}><Text style={styles.body}>Lease term</Text><Text style={styles.body}>{report.title.leaseTermYears ?? "—"} yrs</Text></View>
              <View style={styles.row}><Text style={styles.body}>Years remaining</Text><Text style={styles.body}>{report.title.leaseRemainingYears ?? "—"}</Text></View>
            </>
          ) : null}
          <View style={styles.row}><Text style={styles.body}>Charges registered</Text><Text style={styles.body}>{report.title.charges ?? 0}</Text></View>
          <View style={styles.row}><Text style={styles.body}>Restrictions</Text><Text style={styles.body}>{report.title.restrictions ?? 0}</Text></View>
          <View style={styles.row}><Text style={styles.body}>Restrictive covenants</Text><Text style={styles.body}>{report.title.hasRestrictiveCovenants ? "Yes" : "No"}</Text></View>
          <Text style={styles.small}>Title data sourced from HM Land Registry. Crown copyright and database right.</Text>
          <Text style={styles.footer} fixed>PropertyHistoryCheck.co.uk &mdash; informational use only.</Text>
        </Page>
      ) : null}

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Premium flags</Text>
        {flagRow("Listed building", report.flags.listedBuilding?.listed ? `Listed (${report.flags.listedBuilding.grade ?? "grade unknown"})` : "Not listed")}
        {flagRow("Conservation area", report.flags.conservationArea?.inArea ? (report.flags.conservationArea.name ?? "Yes") : "No")}
        {flagRow("Tree preservation order", report.flags.treePreservationOrder?.affected ? "Affected" : "Not affected")}
        {flagRow("Coal mining reporting area", report.flags.coalReportingArea ? "Yes — CON29M (£60) recommended" : "No")}
        {flagRow("Radon risk band", report.flags.radonRiskBand ? `Band ${report.flags.radonRiskBand}` : "Unknown")}
        <Text style={[styles.small, { marginTop: 16 }]}>This page surfaces premium flags from public OGL datasets. Where a value is &quot;Unknown&quot; the source dataset has no entry for the property &mdash; that&rsquo;s usually neutral, not negative.</Text>
        <Text style={styles.footer} fixed>PropertyHistoryCheck.co.uk &mdash; informational use only.</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Important disclaimers</Text>
        <Text style={[styles.body, { marginBottom: 8 }]}>
          This report is for informational purposes only and is not a substitute for formal conveyancing searches conducted by a qualified solicitor.
          PropertyHistoryCheck.co.uk is not a regulated legal service.
        </Text>
        <Text style={[styles.body, { marginBottom: 8 }]}>
          Title information is sourced directly from HM Land Registry (Crown copyright and database right).
          Environmental, flood, and crime data is sourced from public government APIs and is current as of the date shown on the cover page.
        </Text>
        <Text style={[styles.body, { marginBottom: 8 }]}>
          Where this report flags a risk (mining, flood, contaminated land, listed status), we strongly recommend instructing the relevant specialist search before exchange.
          Our flags are based on cached datasets and may not reflect very recent changes.
        </Text>
        <Text style={styles.footer} fixed>PropertyHistoryCheck.co.uk &mdash; informational use only.</Text>
      </Page>
    </Document>
  );

  const blob = await pdf(Doc).toBuffer();
  return blob as unknown as Buffer;
}

function flagRow(label: string, value: string) {
  return (
    <View style={styles.row}>
      <Text style={styles.body}>{label}</Text>
      <Text style={styles.body}>{value}</Text>
    </View>
  );
}
