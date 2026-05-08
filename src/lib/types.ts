// Core property data shapes for PropertyHistoryCheck.

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
  generatedAt: string;
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

export interface PaidReport {
  free: FreeReport;
  title?: TitleRegisterSummary;
  flags: {
    listedBuilding?: { listed: boolean; grade?: string; entryUrl?: string };
    conservationArea?: { inArea: boolean; name?: string };
    treePreservationOrder?: { affected: boolean; count?: number };
    radonRiskBand?: 1 | 2 | 3 | 4 | 5 | 6;
    miningArea?: boolean;
    coalReportingArea?: boolean;
    contaminatedLand?: boolean;
    aonb?: boolean;
    greenBelt?: boolean;
    article4?: boolean;
    knotweedRisk?: "low" | "medium" | "high" | "unknown";
  };
  buyersVerdict?: string;
  generatedAt: string;
}
