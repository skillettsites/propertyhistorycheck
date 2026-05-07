// Core property data shapes. Composed by `getFreeReport()` and the paid orchestrator.

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
}

export interface PriceSale {
  price: number;
  date: string; // ISO date
  propertyType?: "D" | "S" | "T" | "F" | "O";
  newBuild?: boolean;
  tenure?: "F" | "L";
  paon?: string;
  saon?: string;
  street?: string;
}

export interface PriceHistory {
  sales: PriceSale[];
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

export type FloodBand = "very_low" | "low" | "medium" | "high" | "unknown";

export interface FloodRisk {
  riversAndSea: FloodBand;
  surfaceWater: FloodBand;
  reservoirs?: boolean;
  groundwater?: FloodBand;
  // Premium-only:
  climateProjected2050?: FloodBand;
}

export interface CrimeStat {
  category: string;
  count: number;
}

export interface CrimeData {
  monthsCovered: number;
  totalIncidents: number;
  byCategory: CrimeStat[];
  nationalAverage?: number;
}

export interface BroadbandData {
  maxDownloadMbps?: number;
  maxUploadMbps?: number;
  fttpAvailable?: boolean;
  averageDownloadMbps?: number;
}

export interface MobileCoverage {
  network: "EE" | "O2" | "Vodafone" | "Three";
  voice4g?: "good" | "limited" | "none";
  data4g?: "good" | "limited" | "none";
  data5g?: "good" | "limited" | "none";
}

export interface CouncilTax {
  band?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  estimatedAnnualCost?: number;
  authority?: string;
}

export interface School {
  name: string;
  type: string;
  ofstedRating?: "Outstanding" | "Good" | "Requires Improvement" | "Inadequate";
  distanceMiles: number;
  ageRange?: string;
  urn?: string;
}

export interface PlanningApplication {
  reference: string;
  description: string;
  status?: string;
  decision?: string;
  date?: string;
  url?: string;
}

export interface FreeReport {
  property: PostcodeAddress;
  priceHistory?: PriceHistory;
  epc?: EpcData;
  flood?: FloodRisk;
  crime?: CrimeData;
  broadband?: BroadbandData;
  mobile?: MobileCoverage[];
  councilTax?: CouncilTax;
  schools?: School[];
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
  charges?: number; // count of registered charges
  restrictions?: number;
  cautions?: number;
  hasRestrictiveCovenants?: boolean;
  rawDocumentUrl?: string;
}

export interface PaidReport {
  free: FreeReport;
  title?: TitleRegisterSummary;
  flood?: FloodRisk; // expanded
  planning?: PlanningApplication[];
  flags: {
    listedBuilding?: { listed: boolean; grade?: string; entryUrl?: string };
    conservationArea?: { inArea: boolean; name?: string };
    treePreservationOrder?: { affected: boolean; count?: number };
    radonRiskBand?: 1 | 2 | 3 | 4 | 5;
    miningArea?: boolean;
    coalReportingArea?: boolean;
    contaminatedLand?: boolean;
    aonb?: boolean;
    greenBelt?: boolean;
    article4?: boolean;
    knotweedRisk?: "low" | "medium" | "high" | "unknown";
  };
  airQuality?: {
    no2?: number;
    pm25?: number;
    daqi?: number;
  };
  buyersVerdict?: string; // generated narrative summary
  generatedAt: string;
}
