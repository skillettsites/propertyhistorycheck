import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { PaidReport } from "../types";
import { staticMapDataUri } from "./static-map";
import { buildSellerEmail } from "../seller-email";

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 56, paddingHorizontal: 44, fontFamily: "Helvetica", fontSize: 10, color: "#1f2937" },
  cover: { padding: 48, fontFamily: "Helvetica" },
  brand: { fontSize: 24, fontWeight: 700, color: "#0f172a" },
  brandSub: { fontSize: 12, color: "#2563eb", fontWeight: 700, marginTop: 2 },
  divider: { borderTopWidth: 1, borderTopColor: "#e5e7eb", marginVertical: 16 },
  coverAddr: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  h2: { fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 20, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: "#3b82f6" },
  h3: { fontSize: 11, fontWeight: 700, color: "#0f172a", marginTop: 10, marginBottom: 4 },
  body: { fontSize: 10, color: "#1f2937", lineHeight: 1.5 },
  small: { fontSize: 8.5, color: "#6b7280", lineHeight: 1.45 },
  chip: { fontSize: 8, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 },
  card: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 5, padding: 11, marginBottom: 9, backgroundColor: "#ffffff" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  rowLabel: { fontSize: 10, color: "#475569" },
  rowVal: { fontSize: 10, color: "#0f172a", fontWeight: 700 },
  item: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, padding: 9, marginBottom: 7, backgroundColor: "#ffffff" },
  itemHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  itemTitle: { fontSize: 9.5, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.4, flex: 1, paddingRight: 6 },
  badge: { fontSize: 7.5, fontWeight: 700, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 3, textTransform: "uppercase" },
  bCrit: { backgroundColor: "#fee2e2", color: "#991b1b" },
  bHigh: { backgroundColor: "#fef3c7", color: "#92400e" },
  bMed: { backgroundColor: "#e2e8f0", color: "#334155" },
  bLow: { backgroundColor: "#f1f5f9", color: "#64748b" },
  verdict: { marginTop: 22, padding: 14, borderRadius: 6, backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe" },
  footer: { position: "absolute", left: 44, right: 44, bottom: 28, fontSize: 7.5, color: "#94a3b8", textAlign: "center" },
  pageNum: { position: "absolute", right: 44, bottom: 28, fontSize: 7.5, color: "#cbd5e1" },
  mapImg: { width: 507, height: 267, borderRadius: 5, marginBottom: 3, objectFit: "cover" },
  mapCap: { fontSize: 8.5, color: "#475569", marginBottom: 10 },
  emailBox: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 5, padding: 12, backgroundColor: "#f8fafc", marginBottom: 8 },
  emailText: { fontSize: 9.5, color: "#1f2937", lineHeight: 1.55 },
});

const TIER_TITLE: Record<string, string> = {
  standard: "Risk & Title Synthesis Report",
  standard_plus: "Pre-Exchange Brief",
  bundle: "Pre-Exchange Bundle Report",
};

function badgeStyle(p: string) {
  return p === "critical" ? styles.bCrit : p === "high" ? styles.bHigh : p === "medium" ? styles.bMed : styles.bLow;
}

// Section header that won't orphan at the bottom of a page.
function H2({ children }: { children: string }) {
  return <Text style={styles.h2} minPresenceAhead={70}>{children}</Text>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowVal}>{value}</Text>
    </View>
  );
}

function Brief({ brief, accent }: { brief: NonNullable<PaidReport["solicitorBrief"]>; accent: string }) {
  const audience = brief.audience === "solicitor" ? "For your conveyancer"
    : brief.audience === "surveyor" ? "For your RICS surveyor" : "For your mortgage broker";
  return (
    <View>
      <View wrap={false}>
        <Text style={[styles.chip, { color: accent }]}>{audience}</Text>
        <Text style={styles.h3}>{brief.summary}</Text>
      </View>
      {brief.items.map((it, i) => (
        <View key={i} style={styles.item} wrap={false}>
          <View style={styles.itemHead}>
            <Text style={styles.itemTitle}>{it.heading}</Text>
            <Text style={[styles.badge, badgeStyle(it.priority)]}>{it.priority}</Text>
          </View>
          <Text style={styles.body}><Text style={{ fontWeight: 700 }}>Finding. </Text>{it.finding}</Text>
          <Text style={[styles.body, { marginTop: 2 }]}><Text style={{ fontWeight: 700 }}>Action. </Text>{it.ask}</Text>
        </View>
      ))}
      <Text style={[styles.small, { fontStyle: "italic", marginBottom: 4 }]}>{brief.caveat}</Text>
    </View>
  );
}

export async function generatePropertyReportPdf(
  report: PaidReport,
  tier: "standard" | "standard_plus" | "bundle",
  liveUrl: string | null
): Promise<Buffer> {
  const f = report.free;
  const addr = f.property.fullAddress || f.property.postcode;
  const reportTitle = TIER_TITLE[tier] ?? "Property Report";
  const isPlus = tier === "standard_plus" || tier === "bundle";

  // Render the same OpenStreetMap basemap the online report uses, as static
  // images so the maps actually appear in the downloaded PDF. Best-effort: if a
  // tile fetch fails the helper returns null and we fall back to a text note.
  const lat = f.property.lat;
  const lng = f.property.lng;
  let locationMap: string | null = null;
  let areaMap: string | null = null;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const schoolMarkers = (f.schools ?? [])
      .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .slice(0, 8)
      .map((s) => ({ lat: s.latitude as number, lng: s.longitude as number, color: "#7c3aed", r: 4 }));
    [locationMap, areaMap] = await Promise.all([
      staticMapDataUri({ lat: lat as number, lng: lng as number, zoom: 16, width: 720, height: 380, markers: schoolMarkers }),
      staticMapDataUri({ lat: lat as number, lng: lng as number, zoom: 14, width: 720, height: 380, circleRadiusMeters: 1609, circleColor: "#2563eb" }),
    ]);
  }

  const Doc = (
    <Document title={`${reportTitle} — ${addr}`} author="HomeBuyerCheck">
      {/* Cover */}
      <Page size="A4" style={styles.cover}>
        <Text style={styles.brand}>HomeBuyerCheck</Text>
        <Text style={styles.brandSub}>{reportTitle}</Text>
        <View style={styles.divider} />
        <Text style={styles.coverAddr}>{addr}</Text>
        <Text style={styles.small}>{f.property.adminDistrictName ?? ""}{f.property.country ? ` · ${f.property.country}` : ""}</Text>
        <Text style={[styles.small, { marginTop: 6 }]}>Report generated {new Date(report.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</Text>
        {liveUrl ? <Text style={[styles.small, { marginTop: 2 }]}>Online version: {liveUrl}</Text> : null}
        {report.buyersVerdict ? (
          <View style={styles.verdict} wrap={false}>
            <Text style={[styles.chip, { color: "#0c4a6e", marginBottom: 4 }]}>Buyer&apos;s verdict</Text>
            <Text style={styles.body}>{report.buyersVerdict}</Text>
          </View>
        ) : null}
        <Text style={styles.footer} fixed>
          Contains HM Land Registry data &copy; Crown copyright and database right. Informational use only, not a substitute for formal conveyancing searches or a survey.
        </Text>
      </Page>

      {/* Flowing content */}
      <Page size="A4" style={styles.page} wrap>
        {/* Property essentials */}
        <H2>Property essentials</H2>
        <View style={styles.card} wrap={false}>
          <Text style={styles.h3}>Sales history</Text>
          {f.priceHistory?.sales?.length
            ? f.priceHistory.sales.slice(0, 10).map((s, i) => (
                <Row key={i} label={new Date(s.date).toLocaleDateString("en-GB")} value={`£${s.price.toLocaleString("en-GB")}`} />
              ))
            : <Text style={styles.small}>No sales recorded for this address since 1995.</Text>}
        </View>
        <View style={styles.card} wrap={false}>
          {f.epc ? <Row label="EPC rating" value={`${f.epc.rating ?? "Unknown"}${f.epc.buildYear ? ` · built ${f.epc.buildYear}` : ""}`} /> : <Text style={styles.small}>No EPC certificate found.</Text>}
          {f.councilTax?.band ? <Row label="Council tax" value={`Band ${f.councilTax.band}${f.councilTax.estimatedAnnualCost ? ` · £${f.councilTax.estimatedAnnualCost.toLocaleString()}/yr` : ""}`} /> : null}
          {f.flood?.riskLevel ? <Row label="Flood risk" value={f.flood.riskLevel} /> : null}
          {f.crime ? <Row label="Crime (12m, ~1 mile)" value={`${f.crime.totalIncidents.toLocaleString()} incidents`} /> : null}
        </View>
        {(f.schools ?? []).length ? (
          <View style={styles.card} wrap={false}>
            <Text style={styles.h3}>Closest schools</Text>
            {(f.schools ?? []).slice(0, 5).map((s, i) => (
              <Row key={i} label={`${s.name} (${s.rating ?? "-"})`} value={`${s.distance.toFixed(1)} km`} />
            ))}
          </View>
        ) : null}

        {/* Connectivity */}
        {(f.broadband || f.mobile || f.transport || f.walkScore || f.evCharging) ? (
          <>
            <H2>Connectivity &amp; commute</H2>
            <View style={styles.card} wrap={false}>
              {f.broadband ? <Row label="Broadband (avg download)" value={`${Math.round(f.broadband.averageDownload)} Mbps${f.broadband.fullFibre ? " · full fibre available" : f.broadband.ultrafast ? " · ultrafast" : f.broadband.superfast ? " · superfast" : ""}`} /> : null}
              {f.mobile ? <Row label="Mobile signal" value={`${f.mobile.operators.filter((o) => o.outdoor4g).length}/${f.mobile.operators.length} operators with 4G${f.mobile.operators.some((o) => o.data5g) ? ", 5G available" : ""}`} /> : null}
              {f.transport ? <Row label="Transport connectivity" value={`${Math.round(f.transport.connectivityScore)} / 100`} /> : null}
              {f.walkScore ? <Row label="Walkability" value={`${f.walkScore.score} / 100 (${f.walkScore.band})`} /> : null}
              {f.evCharging ? <Row label="EV charging within 2 miles" value={`${f.evCharging.count}`} /> : null}
            </View>
          </>
        ) : null}

        {/* Environment */}
        {(f.flood || f.airQuality || f.noise || f.groundRisk || f.imd) ? (
          <>
            <H2>Environment &amp; deprivation</H2>
            <View style={styles.card} wrap={false}>
              {f.flood ? <Row label="Flood risk" value={`${f.flood.riskLevel}${f.flood.inFloodZone3 ? " · in Zone 3" : f.flood.inFloodZone2 ? " · in Zone 2" : ""}`} /> : null}
              {f.airQuality ? <Row label="Air quality (DAQI)" value={`${f.airQuality.daqiCategory ?? "-"}${f.airQuality.no2 != null ? ` · NO2 ${f.airQuality.no2.toFixed(0)}` : ""}${f.airQuality.pm25 != null ? ` · PM2.5 ${f.airQuality.pm25.toFixed(0)} ug/m3` : ""}`} /> : null}
              {f.noise ? <Row label="Noise" value={`${f.noise.overallLevel}`} /> : null}
              {f.groundRisk && f.groundRisk.shrinkSwell !== "unknown" ? <Row label="Ground stability (shrink-swell)" value={f.groundRisk.shrinkSwell} /> : null}
              {f.imd ? <Row label="Deprivation (IMD)" value={`Decile ${f.imd.decile} of 10 (1 = most deprived)`} /> : null}
            </View>
          </>
        ) : null}

        {/* Crime breakdown */}
        {f.crime?.byCategory?.length ? (
          <>
            <H2>Crime breakdown (12 months)</H2>
            <View style={styles.card} wrap={false}>
              {f.crime.trendPct != null ? <Row label="Year-on-year trend" value={`${f.crime.trendPct > 0 ? "+" : ""}${f.crime.trendPct.toFixed(1)}%`} /> : null}
              {f.crime.byCategory.slice(0, 8).map((c, i) => (
                <Row key={i} label={c.category} value={c.count.toLocaleString()} />
              ))}
              {f.crime.limitedData ? <Text style={[styles.small, { marginTop: 4 }]}>This force supplies limited data to data.police.uk, treat totals as incomplete.</Text> : null}
            </View>
          </>
        ) : null}

        {/* Area profile */}
        {(f.demographics || f.areaTrend || f.lifestyleScores) ? (
          <>
            <H2>Area profile</H2>
            <View style={styles.card} wrap={false}>
              {f.areaTrend ? <Row label="Area trajectory" value={`${f.areaTrend.direction} (${f.areaTrend.score}/100)`} /> : null}
              {f.demographics?.population ? <Row label="Population (area)" value={f.demographics.population.toLocaleString()} /> : null}
              {f.demographics?.tenure?.ownerOccupiedPct != null ? <Row label="Owner-occupied" value={`${f.demographics.tenure.ownerOccupiedPct}%`} /> : null}
              {f.demographics?.medianAge ? <Row label="Median age" value={String(f.demographics.medianAge)} /> : null}
              {f.lifestyleScores ? <Row label="Best fit" value={`${f.lifestyleScores.topPick ?? "-"}${f.lifestyleScores.topPickReason ? ` — ${f.lifestyleScores.topPickReason}` : ""}`} /> : null}
              {f.lifestyleScores ? <Row label="Scores (family/FTB/retiree/commuter/investor)" value={`${f.lifestyleScores.family.toFixed(1)} / ${f.lifestyleScores.firstTimeBuyer.toFixed(1)} / ${f.lifestyleScores.retiree.toFixed(1)} / ${f.lifestyleScores.commuter.toFixed(1)} / ${f.lifestyleScores.investor.toFixed(1)}`} /> : null}
            </View>
          </>
        ) : null}

        {/* Local amenities */}
        {(f.healthcare || f.amenities || f.solar) ? (
          <>
            <H2>Local amenities</H2>
            <View style={styles.card} wrap={false}>
              {f.amenities?.nearestSupermarket ? <Row label="Nearest supermarket" value={`${f.amenities.nearestSupermarket.name} (${f.amenities.nearestSupermarket.distance.toFixed(1)} km) · ${f.amenities.amenityScore}`} /> : null}
              {f.healthcare?.nearestGp?.name ? <Row label="Nearest GP" value={f.healthcare.nearestGp.name} /> : null}
              {f.healthcare?.nearestPharmacy?.name ? <Row label="Nearest pharmacy" value={f.healthcare.nearestPharmacy.name} /> : null}
              {f.healthcare?.nearestHospital?.name ? <Row label="Nearest hospital" value={f.healthcare.nearestHospital.name} /> : null}
              {f.solar ? <Row label="Solar potential (est. annual saving)" value={`£${f.solar.estimatedAnnualSavings.toLocaleString()}`} /> : null}
            </View>
          </>
        ) : null}

        {/* Maps: static OpenStreetMap renders of the same basemap as the online report */}
        {locationMap || areaMap ? (
          <>
            <H2>Location &amp; area maps</H2>
            {locationMap ? (
              <View wrap={false}>
                <Image style={styles.mapImg} src={locationMap} />
                <Text style={styles.mapCap}>Street-level location. The red pin marks the property; purple dots are the nearest schools. Basemap &copy; OpenStreetMap contributors.</Text>
              </View>
            ) : null}
            {areaMap ? (
              <View wrap={false}>
                <Image style={styles.mapImg} src={areaMap} />
                <Text style={styles.mapCap}>Area view with the ~1 mile crime catchment (dashed circle) used for the crime figures above. Basemap &copy; OpenStreetMap contributors.</Text>
              </View>
            ) : null}
            <Text style={[styles.small, { marginBottom: 4 }]}>Fully interactive maps (flood zones, individual crime locations, schools, planning applications and amenities) are on the online version of this report{liveUrl ? ` at ${liveUrl}` : ""}.</Text>
          </>
        ) : (
          <Text style={[styles.small, { marginBottom: 4 }]}>Interactive maps (flood zones, crime locations, schools and amenities) are on the online version of this report{liveUrl ? ` at ${liveUrl}` : ""}.</Text>
        )}

        {/* Title & tenure */}
        {report.title ? (
          <>
            <H2>Title &amp; tenure synthesis</H2>
            <View style={styles.card} wrap={false}>
              <Row label="Tenure" value={report.title.tenure ? (report.title.tenure.charAt(0).toUpperCase() + report.title.tenure.slice(1)) : "Not confirmed"} />
              {report.title.pricePaid ? <Row label="Last sold" value={`£${report.title.pricePaid.amount.toLocaleString()} (${new Date(report.title.pricePaid.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })})`} /> : null}
              {report.title.registeredOwners?.length ? <Row label="Registered owner" value={report.title.registeredOwners.join(", ")} /> : null}
              <Text style={[styles.small, { marginTop: 4 }]}>Tenure and ownership synthesised from the public register. Full covenants, easements and charges are in the official HM Land Registry copy.</Text>
            </View>
          </>
        ) : null}

        {/* Risk flags */}
        <H2>Risks &amp; constraints</H2>
        <View style={styles.card} wrap={false}>
          <Row label="Listed building" value={report.flags.listedBuilding?.listed ? `Listed (${report.flags.listedBuilding.grade ?? "grade unknown"})` : "Not listed"} />
          <Row label="Conservation area" value={report.flags.conservationArea?.inArea ? (report.flags.conservationArea.name ?? "Yes") : "No"} />
          <Row label="Article 4 direction" value={report.flags.article4?.affected ? "In force" : "No"} />
          <Row label="Tree preservation order" value={report.flags.treePreservationOrder?.affected ? "Affected" : "Not affected"} />
          <Row label="Coal mining reporting area" value={report.flags.coalReportingArea ? "Yes, CON29M recommended" : "No"} />
          <Row label="Radon risk band" value={report.flags.radonRiskBand ? `Band ${report.flags.radonRiskBand} of 6` : "Unknown"} />
          {report.flags.shrinkSwellBand ? <Row label="Shrink-swell (clay)" value={`Band ${report.flags.shrinkSwellBand} of 5`} /> : null}
        </View>

        {/* Ownership & registered-owner checks */}
        {(report.ownership?.ukCompanyOwned || report.ownership?.overseasOwned || report.companyOwner || report.bsrHrb?.registered || (report.tribunalHistory?.count ?? 0) > 0) ? (
          <>
            <H2>Ownership &amp; building checks</H2>
            <View style={styles.card} wrap={false}>
              {report.ownership?.overseasOwned ? <Row label="Registered owner" value={`Overseas company${report.ownership.countryIncorporated ? ` (${report.ownership.countryIncorporated})` : ""}`} />
                : report.ownership?.ukCompanyOwned ? <Row label="Registered owner" value="UK company" /> : null}
              {report.ownership?.proprietors?.length ? <Row label="Proprietor(s)" value={report.ownership.proprietors.join(", ")} /> : null}
              {report.companyOwner ? <Row label="Companies House" value={`${report.companyOwner.companyName} · ${report.companyOwner.status}`} /> : null}
              {report.companyOwner?.outstandingCharges != null ? <Row label="Outstanding charges" value={String(report.companyOwner.outstandingCharges)} /> : null}
              {report.bsrHrb?.registered ? <Row label="BSR Higher-Risk Building" value="On the register, request EWS1" /> : null}
              {(report.tribunalHistory?.count ?? 0) > 0 ? <Row label="FTT Property Chamber cases" value={`${report.tribunalHistory!.count}${report.tribunalHistory!.topCategory ? ` (${report.tribunalHistory!.topCategory})` : ""}`} /> : null}
            </View>
          </>
        ) : null}

        {/* AI briefs (Plus + Bundle) */}
        {isPlus && (report.solicitorBrief || report.surveyorBrief || report.mortgageBrief) ? (
          <>
            <H2>Pre-exchange professional briefs</H2>
            {report.solicitorBrief ? <Brief brief={report.solicitorBrief} accent="#4338ca" /> : null}
            {report.surveyorBrief ? <Brief brief={report.surveyorBrief} accent="#047857" /> : null}
            {report.mortgageBrief ? <Brief brief={report.mortgageBrief} accent="#b45309" /> : null}
          </>
        ) : null}

        {/* Draft email to the seller / agent */}
        {report.sellerQuestions?.length ? (
          <>
            <H2>Draft email to the seller or agent</H2>
            <Text style={[styles.small, { marginBottom: 6 }]}>Copy the email below, add your name, and send it to the seller or estate agent before you make an offer. Every question is grounded in a flag found on this property.</Text>
            <View style={styles.emailBox}>
              <Text style={styles.emailText}>{buildSellerEmail(f.property.fullAddress, report.sellerQuestions)}</Text>
            </View>
          </>
        ) : null}

        {/* Leasehold note */}
        {report.title?.tenure === "leasehold" ? (
          <View style={styles.card} wrap={false}>
            <Text style={styles.h3}>Leasehold</Text>
            <Text style={styles.body}>This is a leasehold property. Confirm the remaining lease length, ground rent and service charges with your solicitor. The interactive leasehold-extension cost calculator is on the online version of this report.</Text>
          </View>
        ) : null}

        {/* Disclaimers */}
        <H2>Important disclaimers</H2>
        <Text style={[styles.small, { marginBottom: 6 }]}>This report is for information only and is not a substitute for formal conveyancing searches by a qualified solicitor or a RICS survey. HomeBuyerCheck.co.uk is not a regulated legal or surveying service.</Text>
        <Text style={[styles.small, { marginBottom: 6 }]}>Title, ownership, environmental, flood and crime data is sourced from public government datasets and HM Land Registry (Crown copyright and database right), current as of the cover date. Cached datasets may not reflect very recent changes. Where a value is &quot;Unknown&quot;, the source has no entry, usually neutral, not negative.</Text>
        <Text style={[styles.small]}>The professional briefs are AI-generated from the structured data in this report and are grounded to it; forward them to your conveyancer, surveyor or broker as a starting point, not as advice.</Text>

        <Text style={styles.footer} fixed>HomeBuyerCheck.co.uk, informational use only, not a substitute for conveyancing or survey.</Text>
        <Text style={styles.pageNum} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );

  return await renderToBuffer(Doc);
}
