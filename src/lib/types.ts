// Core property data shapes for HomeBuyerCheck.

export interface PostcodeAddress {
  uprn?: string;
  fullAddress: string;
  paon?: string;
  saon?: string;
  street?: string;
  town?: string;
  postcode: string;
  lat?: number;
  lng?: number;
  region?: string;
  adminDistrictCode?: string;
  adminDistrictName?: string;
  country?: string;
  lsoa?: string;
  msoa?: string;
}

export interface PriceSale {
  price: number;
  date: string;
  propertyType?: "D" | "S" | "T" | "F" | "O";
  newBuild?: boolean;
  tenure?: "F" | "L";
  paon?: string;
  saon?: string;
  street?: string;
  /** Habitable rooms from EPC (bedrooms + living rooms). Closest public proxy for bedroom count. */
  habitableRooms?: number;
  /** EPC total floor area in m². */
  floorAreaM2?: number;
}

export interface PriceHistory {
  /** Sales of THIS exact property (matched by saon + paon). */
  sales: PriceSale[];
  /** Sales of similar properties in the same postcode (same property type, excludes this property). */
  similarSales?: PriceSale[];
  postcodeAverage?: number;
  postcodeMedian?: number;
  postcodeSampleSize?: number;
}

export interface EpcData {
  rating?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  potentialRating?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  buildYear?: number;
  builtForm?: string;
  propertyType?: string;
  totalFloorArea?: number;
  mainHeating?: string;
  inspectionDate?: string;
  certificateUrl?: string;
  /** Habitable rooms (bedrooms + living rooms). Closest public proxy for bedroom count. */
  habitableRooms?: number;
}

export interface FloodRisk {
  riskLevel: "very-low" | "low" | "medium" | "high";
  inFloodZone2: boolean;
  inFloodZone3: boolean;
  nearbyWarnings: {
    id: string;
    description: string;
    severity: string;
    severityLevel: number;
    message: string;
  }[];
}

export interface CrimeStat {
  category: string;
  count: number;
}

export interface CrimeIncident {
  category: string;
  categorySlug: string;
  lat: number;
  lng: number;
  street?: string;
  month: string;
}

export interface CrimeData {
  monthsCovered: number;
  totalIncidents: number;
  /** Incidents in the prior 12-month window (months 14-25). For YoY trend. */
  priorTotalIncidents?: number;
  /** Percentage change vs prior 12 months. Negative = falling. */
  trendPct?: number;
  /** 24-month time series, oldest → newest, for sparkline display. */
  monthlyCounts?: { month: string; count: number }[];
  byCategory: CrimeStat[];
  nationalAverage?: number;
  recentIncidents?: CrimeIncident[];
}

export interface BroadbandProvider {
  name: string;
  maxDownload: number;
  fibre: boolean;
  cable?: boolean;
}

export interface BroadbandData {
  postcode: string;
  averageDownload: number;
  averageUpload: number;
  superfast: boolean;
  ultrafast: boolean;
  fullFibre: boolean;
  providers: BroadbandProvider[];
}

export interface MobileOperator {
  name: string;
  indoor4g: boolean;
  outdoor4g: boolean;
  data5g: boolean;
}

export interface MobileSignalData {
  operators: MobileOperator[];
  overallScore: number;
}

export interface CouncilTax {
  band?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  estimatedAnnualCost?: number;
  monthlyAmount?: number;
  authority?: string;
  source?: string;
  isEstimate?: boolean;
}

export interface School {
  urn?: number;
  name: string;
  phase?: string;
  rating?: string;
  postcode?: string;
  distance: number;
  latitude?: number;
  longitude?: number;
}

export interface AmenityItem {
  name: string;
  distance: number; // km
}

export interface AmenitiesData {
  supermarkets: AmenityItem[];
  convenienceStores: number;
  nearestSupermarket: AmenityItem | null;
  amenityScore: "Excellent" | "Good" | "Average" | "Poor";
}

export interface PlanningConstraint {
  type: string;
  name: string;
  reference?: string;
  dataset: string;
}

export interface PlanningAppDetail {
  reference: string;
  address: string;
  description: string;
  status: string;
  dateReceived: string;
  dateDecided?: string;
  authority: string;
  distance: number;
  lat?: number;
  lng?: number;
  url?: string;
}

export interface PipelineApproval {
  reference: string;
  address: string;
  description: string;
  /** Number of dwellings/units extracted from the description, if present. */
  units?: number;
  decisionDate?: string;
  authority?: string;
  /** Distance in metres from the subject property. */
  distance?: number;
  lat?: number;
  lng?: number;
  url?: string;
}

export interface PlanningData {
  constraints: PlanningConstraint[];
  inConservationArea: boolean;
  nearListedBuildings: number;
  inGreenBelt: boolean;
  hasTPO: boolean;
  hasArticle4: boolean;
  applications: PlanningAppDetail[];
  totalApps12m: number;
  pendingApps: number;
  approvedApps: number;
  rejectedApps: number;
  /** Major approved schemes within ~1km from the last 5 years (forward look). */
  pipeline?: PipelineApproval[];
}

export interface TransportScore {
  connectivityScore: number;
  lsoa: string;
}

export interface IMDScore {
  score: number;
  rank: number;
  decile: number;
  domains: {
    income: number;
    employment: number;
    education: number;
    health: number;
    crime: number;
    barriers: number;
    livingEnvironment: number;
  };
}

export interface PlaceHit {
  category: string;
  name?: string;
  brand?: string;
  lat: number;
  lng: number;
  distanceM: number;
}

export interface HealthcareData {
  gps: PlaceHit[];
  pharmacies: PlaceHit[];
  dentists: PlaceHit[];
  hospitals: PlaceHit[];
  nearestGp?: PlaceHit;
  nearestPharmacy?: PlaceHit;
  nearestHospital?: PlaceHit;
}

export interface TransportNearby {
  nearestStation?: PlaceHit;
  nearestTube?: PlaceHit;
  nearestBus?: PlaceHit;
  stations: PlaceHit[];
}

export interface GreenspaceData {
  parks: PlaceHit[];
  woodland: PlaceHit[];
  nearestPark?: PlaceHit;
}

export interface SolarData {
  annualKwhPerKwp: number;
  estimatedSystemKwp: number;
  estimatedAnnualKwh: number;
  estimatedAnnualSavings: number;
  monthlyAverage: number[];
}

export interface Demographics {
  population: number;
  source: string;
  tenure?: {
    ownerOccupiedPct?: number;
    socialRentPct?: number;
    privateRentPct?: number;
  };
  medianHouseholdIncome?: number;
  medianAge?: number;
}

export interface EvChargingData {
  count: number;
  nearest?: { name: string; distanceM: number; powerKw?: number; operator?: string };
  fastChargers: number;   // 7-22 kW
  rapidChargers: number;  // 50+ kW
}

export interface GroundRisk {
  shrinkSwell: "very-low" | "low" | "moderate" | "significant" | "high" | "very-high" | "unknown";
  shrinkSwellNote?: string;
}

export interface NoiseData {
  /** Day-evening-night weighted average road noise in dB. Null if not in a noise-mapped corridor. */
  roadNoiseLden: number | null;
  /** Night-only road noise in dB. Null if not in a noise-mapped corridor. */
  roadNoiseLnight: number | null;
  /** Day-evening-night weighted average rail noise in dB. Null if not in a noise-mapped corridor. */
  railNoiseLden: number | null;
  /** Night-only rail noise in dB. Null if not in a noise-mapped corridor. */
  railNoiseLnight: number | null;
  roadNoiseLevel: "quiet" | "moderate" | "noisy" | "very-noisy";
  railNoiseLevel: "quiet" | "moderate" | "noisy" | "very-noisy";
  overallLevel: "quiet" | "moderate" | "noisy" | "very-noisy";
  verdict: string;
}

export interface WalkScore {
  score: number; // 0-100
  band: "Car-dependent" | "Some amenities" | "Very walkable" | "Walker's paradise";
  amenities: { type: string; count: number; nearestM?: number }[];
}

export interface AirQualityData {
  no2?: number;            // ug/m3 most recent observation if available
  pm25?: number;           // ug/m3 most recent observation if available
  daqiBand?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  daqiCategory?: "Low" | "Moderate" | "High" | "Very High";
  source: string;          // e.g. "Defra UK-AIR"
  nearestStation?: { name: string; distanceKm: number };
}

export interface ListedBuildingDetail {
  listed: boolean;
  grade?: "I" | "II" | "II*";
  name?: string;
  listDate?: string;
  summary?: string;
  entryUrl?: string;       // historicengland.org.uk listing URL
  distance?: number;       // metres if not exact match
}

export interface LifestyleScores {
  /** All scores 0-10, higher = better fit for that audience. */
  family: number;
  firstTimeBuyer: number;
  retiree: number;
  commuter: number;
  investor: number;
  /** One-line synthesised summary, e.g. "Strong family area: outstanding schools, low crime, plenty of greenspace". */
  topPick?: "family" | "firstTimeBuyer" | "retiree" | "commuter" | "investor";
  topPickReason?: string;
}

export interface AreaTrend {
  direction: "improving" | "stable" | "declining";
  /** 0-100, 50 is neutral. */
  score: number;
  /** Up to 4 short bullet points justifying the direction. */
  drivers: string[];
}

export interface CompositeRiskScore {
  /** 0-100, higher = more risk. */
  score: number;
  band: "very-low" | "low" | "moderate" | "high" | "very-high";
  /** Contributing flags shown to the user. */
  contributors: Array<{ label: string; weight: number; note?: string }>;
}

export interface CommuteResult {
  destinationPostcode: string;
  destinationLabel?: string;
  destinationLat: number;
  destinationLng: number;
  drivingMinutes?: number;
  drivingMiles?: number;
  drivingFuelCost?: number;
  walkingMinutes?: number;
  walkingMiles?: number;
  cyclingMinutes?: number;
  publicTransportMinutes?: number;
  publicTransportNote?: string;
  publicTransportProvider?: "TfL" | "estimate";
}

export interface FreeReport {
  property: PostcodeAddress;
  priceHistory?: PriceHistory;
  epc?: EpcData;
  flood?: FloodRisk;
  crime?: CrimeData;
  broadband?: BroadbandData;
  mobile?: MobileSignalData;
  councilTax?: CouncilTax;
  schools?: School[];
  amenities?: AmenitiesData;
  planning?: PlanningData;
  transport?: TransportScore;
  imd?: IMDScore;
  healthcare?: HealthcareData;
  transportNearby?: TransportNearby;
  greenspace?: GreenspaceData;
  solar?: SolarData;
  demographics?: Demographics;
  evCharging?: EvChargingData;
  groundRisk?: GroundRisk;
  noise?: NoiseData;
  walkScore?: WalkScore;
  airQuality?: AirQualityData;
  listedBuilding?: ListedBuildingDetail;
  rentalEstimate?: RentalEstimate;
  lifestyleScores?: LifestyleScores;
  areaTrend?: AreaTrend;
  compositeRisk?: CompositeRiskScore;
  generatedAt: string;
}

export interface RentalEstimate {
  monthlyRent: number;
  low?: number;
  high?: number;
  sampleSize?: number;
  granularity?: "postcode" | "sector" | "district" | "area";
  /** Annual rent ÷ purchase-price estimate as a percentage. */
  grossYieldPct?: number;
  source: string;
}

export interface TitleRegisterSummary {
  titleNumber?: string;
  tenure?: "freehold" | "leasehold";
  registeredOwners?: string[];
  registeredOn?: string;
  pricePaid?: { amount: number; date: string };
  leaseTermYears?: number;
  leaseStartDate?: string;
  leaseRemainingYears?: number;
  charges?: number;
  restrictions?: number;
  cautions?: number;
  hasRestrictiveCovenants?: boolean;
  rawDocumentUrl?: string;
}

export interface SellerQuestion {
  question: string;
  rationale: string;
  audience: "seller" | "solicitor" | "estate-agent";
  priority: "high" | "medium" | "low";
}

export interface CompanyOwner {
  companyNumber: string;
  companyName: string;
  status: "active" | "dissolved" | "liquidation" | "administration" | "unknown";
  incorporatedOn?: string;
  registeredAddress?: string;
  sicCodes?: string[];
  officersCount?: number;
  outstandingCharges?: number;
  outstandingChargesDetail?: Array<{ lenderName?: string; classification?: string; createdOn?: string }>;
  insolvencyCases?: Array<{ type: string; dates?: Array<{ type?: string; date?: string }> }>;
  profileUrl: string;
  riskNote?: string;
  isOverseasEntity?: boolean;
}

export interface DisqualifiedOfficer {
  personId: string;
  name: string;
  dateOfBirth?: string;
  disqualifiedFrom?: string;
  disqualifiedUntil?: string;
  caseReason?: string;
  profileUrl: string;
}

export interface TitlePlanRef {
  documentUrl: string;
  orderRef?: string;
}

export interface LeaseAddon {
  /** "pending" until the OC2 PDF arrives; "ready" with documentUrl set after fulfilment. */
  status: "pending" | "ready" | "failed";
  orderedAt: string;
  fulfilledAt?: string;
  documentUrl?: string;
  /** Free-text note shown to the buyer if anything special applies (e.g. "older lease — may take 3 working days"). */
  note?: string;
}

export interface Ews1Addon {
  /** "pending" until cladding check is complete; "ready" when findings posted. */
  status: "pending" | "ready" | "failed";
  orderedAt: string;
  fulfilledAt?: string;
  /** Whether the building is registered as a Higher-Risk Building (BSR register). */
  hrbRegistered?: boolean;
  /** EWS1 rating if a form was found on FIA or Building Safety Portal. */
  rating?: "A1" | "A2" | "A3" | "B1" | "B2" | "Unknown";
  /** Date of EWS1 assessment if known. */
  assessedOn?: string;
  /** Assessor / fire engineer name if known. */
  assessor?: string;
  /** PDF link to the EWS1 form if available. */
  documentUrl?: string;
  /** Operator notes summarising the cladding situation for this building. */
  notes?: string;
}

export interface PaidReport {
  free: FreeReport;
  title?: TitleRegisterSummary;
  /** PropertyData-ordered HM Land Registry title plan PDF (boundary diagram). */
  titlePlan?: TitlePlanRef;
  /** Optional £9.99 lease summary add-on; pending until manually fulfilled, then ready. */
  lease?: LeaseAddon;
  /** Optional £4.99 EWS1 cladding check add-on; pending until operator posts findings. */
  ews1?: Ews1Addon;
  /** AI-generated questions to ask the seller / solicitor / estate agent. */
  sellerQuestions?: SellerQuestion[];
  /** Companies House lookup if the registered owner is a corporation. */
  companyOwner?: CompanyOwner;
  /** Disqualified-director hits for the registered owner's name (where corporate). */
  disqualifiedDirectors?: DisqualifiedOfficer[];
  flags: {
    listedBuilding?: { listed: boolean; grade?: string; name?: string; entryUrl?: string };
    conservationArea?: { inArea: boolean; name?: string; reference?: string };
    treePreservationOrder?: { affected: boolean; count?: number; names?: string[] };
    article4?: { affected: boolean; name?: string };
    aonb?: { inArea: boolean; name?: string };
    greenBelt?: boolean;
    scheduledMonument?: { affected: boolean; name?: string };
    worldHeritageSite?: { inArea: boolean; name?: string };
    brownfieldLand?: boolean;
    coalReportingArea?: boolean;
    miningArea?: boolean;
    radonRiskBand?: 1 | 2 | 3 | 4 | 5 | 6;
    radonNote?: string;
    shrinkSwellBand?: 1 | 2 | 3 | 4 | 5;
    shrinkSwellLabel?: string;
    landslideBand?: 1 | 2 | 3 | 4 | 5;
    landslideLabel?: string;
    solubleRocksBand?: 1 | 2 | 3 | 4 | 5;
    collapsibleGroundBand?: 1 | 2 | 3 | 4 | 5;
    compressibleGroundBand?: 1 | 2 | 3 | 4 | 5;
    runningSandBand?: 1 | 2 | 3 | 4 | 5;
  };
  /** HMLR CCOD/OCOD ownership flag — set if registered owner is a corporate or overseas entity. */
  ownership?: OwnershipFlag;
  /** Building Safety Regulator Higher-Risk Building register status (high-rise flats only). */
  bsrHrb?: BsrHrbInfo;
  /** First-tier Tribunal Property Chamber history for this address/postcode. */
  tribunalHistory?: TribunalHistorySummary;
  /** £6.99 Plus tier: AI Solicitor brief — TA6-style follow-up enquiries. */
  solicitorBrief?: PreExchangeBrief;
  /** £6.99 Plus tier: AI Surveyor brief — what to ask the RICS L3 surveyor. */
  surveyorBrief?: PreExchangeBrief;
  /** £6.99 Plus tier: AI Mortgage broker brief — lending friction flags, no lender-specific claims. */
  mortgageBrief?: PreExchangeBrief;
  /** £6.99 Plus tier: most-recent Negotiation Report run. Always re-computed on demand against fresh BoE + UKHPI. */
  negotiationAnalysis?: NegotiationAnalysis;
  buyersVerdict?: string;
  generatedAt: string;
}

export interface BriefItem {
  /** Short heading — the topic, e.g. "BSR Higher-Risk Building register". */
  heading: string;
  /** Concrete finding from the data, with specific numbers/dates. */
  finding: string;
  /** The action the audience should take. */
  ask: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface PreExchangeBrief {
  audience: "solicitor" | "surveyor" | "mortgage_broker";
  /** One-line summary suitable as an email subject. */
  summary: string;
  /** Ranked findings, critical → low. */
  items: BriefItem[];
  /** Closing caveat (varies by audience). */
  caveat: string;
}

export interface NegotiationComp {
  address: string;
  price: number;
  date: string;
  propertyType?: string;
  pricePerSqM?: number;
  daysAgo?: number;
}

export interface NegotiationAdjustment {
  flag: string;
  direction: "down" | "up";
  /** Percentage adjustment to the baseline value (e.g. -3 for -3%). */
  pct: number;
  rationale: string;
}

export interface NegotiationAnalysis {
  /** What the buyer asked. */
  askingPrice: number;
  /** Suggested offer range derived from comps + flags + market trend. */
  suggestedOfferRange: { low: number; mid: number; high: number };
  /** Asking-price reasonableness: above / at / below the modelled fair value. */
  askingVsModelled: "above" | "at" | "below";
  /** Percentage difference between asking and modelled mid. */
  askingDeltaPct: number;
  /** Modelled fair value (mid of suggested range). */
  modelledFairValue: number;
  comparables: NegotiationComp[];
  /** Median £/m² of comparables if EPC floor area + comp areas are available. */
  medianPricePerSqM?: number;
  marketContext: {
    /** Current Bank of England base rate, percentage points (e.g. 4.25). */
    boeBaseRate?: number;
    /** Date string of the BoE rate snapshot. */
    boeRateAsOf?: string;
    /** UK 5-year nominal zero-coupon gilt yield (%). Market-implied path of
     *  short rates over the next 5 years plus a small term premium.
     *  Source: Bank of England IADB series IUDSNZC. NOT a BoE staff forecast. */
    marketImplied5YRate?: number;
    /** UK 20-year nominal zero-coupon gilt yield (%). Long-horizon market
     *  expectation including term premium. Source: BoE IADB series IUDLNZC. */
    marketImplied20YRate?: number;
    /** Land Registry UKHPI annual change for the local authority, percent. */
    ukhpiAnnualChangePct?: number;
    /** Date string of the UKHPI snapshot (YYYY-MM). */
    ukhpiAsOf?: string;
    /** Local authority name resolved from postcode. */
    localAuthority?: string;
  };
  adjustments: NegotiationAdjustment[];
  affordability: {
    /** Monthly mortgage at the asking price (75% LTV, 5-yr fix, BoE + ~1.5pp). */
    monthlyAtAsking?: number;
    /** Monthly mortgage at the suggested mid offer. */
    monthlyAtSuggested?: number;
    /** Monthly difference, asking minus suggested. */
    monthlySaving?: number;
    /** Monthly mortgage at asking, modelled at the market-implied 5Y horizon
     *  rate (5Y gilt yield + typical lender margin). What the buyer might be
     *  paying after their first remortgage if the gilt curve is right. */
    monthlyAtAskingFuture?: number;
    /** Monthly mortgage at suggested mid, at the future rate. */
    monthlyAtSuggestedFuture?: number;
    /** The future rate used (5Y gilt yield + ~1.0pp typical 5Y fix margin). */
    futureRate?: number;
    /** Assumed loan-to-value used in the model (default 75). */
    assumedLtv: number;
    /** Assumed mortgage rate used in the model (default BoE + 1.5pp). */
    assumedRate: number;
  };
  /** 200-400 word AI write-up composed from the numerical outputs above. */
  aiRationale?: string;
  /** Closing caveat shown to the buyer alongside the report. */
  caveat: string;
  /** ISO timestamp when this analysis was computed. */
  generatedAt: string;
}

export interface TribunalHistorySummary {
  count: number;
  topCategory?: string;
  byCategory: Record<string, number>;
  recent: Array<{
    slug: string;
    caseReference?: string;
    category?: string;
    propertyAddress?: string;
    buildingName?: string;
    applicantName?: string;
    respondentName?: string;
    decisionDate?: string;
    decisionSummary?: string;
    pdfUrl?: string;
    govUkUrl: string;
  }>;
}

export interface BsrHrbInfo {
  /** Was the building found on the BSR Higher-Risk Building register? */
  registered: boolean;
  /** Building name as it appears on the register. */
  buildingName?: string;
  /** Building height in metres (≥18m or ≥7 storeys to be on the register). */
  heightMetres?: number;
  /** Number of floors. */
  numberOfFloors?: number;
  /** Number of residential units. */
  residentialUnits?: number;
  /** Principal Accountable Person (organisation responsible for fire + structural safety). */
  principalAccountablePerson?: string;
  /** Year completed. */
  yearCompleted?: number;
  /** When this lookup was performed. */
  lookedUpAt?: string;
}

export interface OwnershipFlag {
  /** Title found in CCOD (UK companies). */
  ukCompanyOwned: boolean;
  /** Title found in OCOD (overseas companies). */
  overseasOwned: boolean;
  /** Proprietor name(s) from CCOD/OCOD. */
  proprietors?: string[];
  /** Country incorporated (OCOD only). */
  countryIncorporated?: string;
}
