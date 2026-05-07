/**
 * Top-traffic UK postcode outcodes for programmatic SEO.
 * Hand-picked from the 60 highest-population/highest-search-volume UK outcodes.
 * Each becomes a /[outcode] page and is included in the sitemap.
 */

export interface OutcodeMeta {
  code: string;
  name: string;
  region: string;
}

export const TOP_OUTCODES: OutcodeMeta[] = [
  { code: "SW1", name: "Westminster", region: "London" },
  { code: "E1", name: "Whitechapel", region: "London" },
  { code: "N1", name: "Islington", region: "London" },
  { code: "NW1", name: "Camden", region: "London" },
  { code: "SE1", name: "Southwark", region: "London" },
  { code: "W1", name: "Mayfair", region: "London" },
  { code: "EC1", name: "Clerkenwell", region: "London" },
  { code: "WC1", name: "Bloomsbury", region: "London" },
  { code: "M1", name: "Manchester city centre", region: "Greater Manchester" },
  { code: "M14", name: "Fallowfield", region: "Greater Manchester" },
  { code: "B1", name: "Birmingham city centre", region: "West Midlands" },
  { code: "B15", name: "Edgbaston", region: "West Midlands" },
  { code: "L1", name: "Liverpool city centre", region: "Merseyside" },
  { code: "LS1", name: "Leeds city centre", region: "West Yorkshire" },
  { code: "S1", name: "Sheffield city centre", region: "South Yorkshire" },
  { code: "BS1", name: "Bristol city centre", region: "Bristol" },
  { code: "NG1", name: "Nottingham city centre", region: "Nottinghamshire" },
  { code: "CV1", name: "Coventry city centre", region: "West Midlands" },
  { code: "NE1", name: "Newcastle city centre", region: "Tyne and Wear" },
  { code: "OX1", name: "Oxford city centre", region: "Oxfordshire" },
  { code: "OX11", name: "Didcot", region: "Oxfordshire" },
  { code: "CB1", name: "Cambridge", region: "Cambridgeshire" },
  { code: "CB2", name: "Trumpington", region: "Cambridgeshire" },
  { code: "BN1", name: "Brighton", region: "East Sussex" },
  { code: "BN2", name: "Kemptown", region: "East Sussex" },
  { code: "BA1", name: "Bath", region: "Somerset" },
  { code: "RG1", name: "Reading", region: "Berkshire" },
  { code: "RG14", name: "Newbury", region: "Berkshire" },
  { code: "GU1", name: "Guildford", region: "Surrey" },
  { code: "TN1", name: "Tunbridge Wells", region: "Kent" },
  { code: "ME1", name: "Rochester", region: "Kent" },
  { code: "CT1", name: "Canterbury", region: "Kent" },
  { code: "PO1", name: "Portsmouth", region: "Hampshire" },
  { code: "SO14", name: "Southampton", region: "Hampshire" },
  { code: "BH1", name: "Bournemouth", region: "Dorset" },
  { code: "PL1", name: "Plymouth", region: "Devon" },
  { code: "EX1", name: "Exeter", region: "Devon" },
  { code: "TR1", name: "Truro", region: "Cornwall" },
  { code: "GL1", name: "Gloucester", region: "Gloucestershire" },
  { code: "SN1", name: "Swindon", region: "Wiltshire" },
  { code: "SP1", name: "Salisbury", region: "Wiltshire" },
  { code: "MK1", name: "Milton Keynes", region: "Buckinghamshire" },
  { code: "AL1", name: "St Albans", region: "Hertfordshire" },
  { code: "WD1", name: "Watford", region: "Hertfordshire" },
  { code: "EN1", name: "Enfield", region: "Greater London" },
  { code: "IG1", name: "Ilford", region: "Greater London" },
  { code: "RM1", name: "Romford", region: "Greater London" },
  { code: "DA1", name: "Dartford", region: "Kent" },
  { code: "BR1", name: "Bromley", region: "Greater London" },
  { code: "CR0", name: "Croydon", region: "Greater London" },
  { code: "KT1", name: "Kingston upon Thames", region: "Greater London" },
  { code: "TW1", name: "Twickenham", region: "Greater London" },
  { code: "UB1", name: "Southall", region: "Greater London" },
  { code: "HA1", name: "Harrow", region: "Greater London" },
  { code: "WA1", name: "Warrington", region: "Cheshire" },
  { code: "CH1", name: "Chester", region: "Cheshire" },
  { code: "PR1", name: "Preston", region: "Lancashire" },
  { code: "DE1", name: "Derby", region: "Derbyshire" },
  { code: "LE1", name: "Leicester", region: "Leicestershire" },
  { code: "PE1", name: "Peterborough", region: "Cambridgeshire" },
  { code: "CF10", name: "Cardiff city centre", region: "Wales" },
  { code: "SA1", name: "Swansea", region: "Wales" },
  { code: "NP20", name: "Newport", region: "Wales" },
];

export function getOutcode(code: string): OutcodeMeta | undefined {
  return TOP_OUTCODES.find((o) => o.code.toUpperCase() === code.toUpperCase());
}
