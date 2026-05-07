/**
 * Top-traffic UK towns for programmatic SEO. Each becomes a /[town-slug] page.
 */

export interface TownMeta {
  slug: string;
  name: string;
  region: string;
  outcode: string;
}

export const TOP_TOWNS: TownMeta[] = [
  { slug: "london", name: "London", region: "Greater London", outcode: "SW1" },
  { slug: "manchester", name: "Manchester", region: "Greater Manchester", outcode: "M1" },
  { slug: "birmingham", name: "Birmingham", region: "West Midlands", outcode: "B1" },
  { slug: "liverpool", name: "Liverpool", region: "Merseyside", outcode: "L1" },
  { slug: "leeds", name: "Leeds", region: "West Yorkshire", outcode: "LS1" },
  { slug: "sheffield", name: "Sheffield", region: "South Yorkshire", outcode: "S1" },
  { slug: "bristol", name: "Bristol", region: "Bristol", outcode: "BS1" },
  { slug: "nottingham", name: "Nottingham", region: "Nottinghamshire", outcode: "NG1" },
  { slug: "newcastle", name: "Newcastle upon Tyne", region: "Tyne and Wear", outcode: "NE1" },
  { slug: "coventry", name: "Coventry", region: "West Midlands", outcode: "CV1" },
  { slug: "leicester", name: "Leicester", region: "Leicestershire", outcode: "LE1" },
  { slug: "oxford", name: "Oxford", region: "Oxfordshire", outcode: "OX1" },
  { slug: "cambridge", name: "Cambridge", region: "Cambridgeshire", outcode: "CB1" },
  { slug: "brighton", name: "Brighton", region: "East Sussex", outcode: "BN1" },
  { slug: "bath", name: "Bath", region: "Somerset", outcode: "BA1" },
  { slug: "reading", name: "Reading", region: "Berkshire", outcode: "RG1" },
  { slug: "milton-keynes", name: "Milton Keynes", region: "Buckinghamshire", outcode: "MK1" },
  { slug: "guildford", name: "Guildford", region: "Surrey", outcode: "GU1" },
  { slug: "portsmouth", name: "Portsmouth", region: "Hampshire", outcode: "PO1" },
  { slug: "southampton", name: "Southampton", region: "Hampshire", outcode: "SO14" },
  { slug: "bournemouth", name: "Bournemouth", region: "Dorset", outcode: "BH1" },
  { slug: "plymouth", name: "Plymouth", region: "Devon", outcode: "PL1" },
  { slug: "exeter", name: "Exeter", region: "Devon", outcode: "EX1" },
  { slug: "gloucester", name: "Gloucester", region: "Gloucestershire", outcode: "GL1" },
  { slug: "swindon", name: "Swindon", region: "Wiltshire", outcode: "SN1" },
  { slug: "didcot", name: "Didcot", region: "Oxfordshire", outcode: "OX11" },
  { slug: "newbury", name: "Newbury", region: "Berkshire", outcode: "RG14" },
  { slug: "st-albans", name: "St Albans", region: "Hertfordshire", outcode: "AL1" },
  { slug: "watford", name: "Watford", region: "Hertfordshire", outcode: "WD1" },
  { slug: "warrington", name: "Warrington", region: "Cheshire", outcode: "WA1" },
  { slug: "chester", name: "Chester", region: "Cheshire", outcode: "CH1" },
  { slug: "preston", name: "Preston", region: "Lancashire", outcode: "PR1" },
  { slug: "derby", name: "Derby", region: "Derbyshire", outcode: "DE1" },
  { slug: "peterborough", name: "Peterborough", region: "Cambridgeshire", outcode: "PE1" },
  { slug: "cardiff", name: "Cardiff", region: "Wales", outcode: "CF10" },
  { slug: "swansea", name: "Swansea", region: "Wales", outcode: "SA1" },
  { slug: "newport", name: "Newport", region: "Wales", outcode: "NP20" },
  { slug: "tunbridge-wells", name: "Tunbridge Wells", region: "Kent", outcode: "TN1" },
  { slug: "canterbury", name: "Canterbury", region: "Kent", outcode: "CT1" },
  { slug: "bromley", name: "Bromley", region: "Greater London", outcode: "BR1" },
  { slug: "croydon", name: "Croydon", region: "Greater London", outcode: "CR0" },
  { slug: "kingston-upon-thames", name: "Kingston upon Thames", region: "Greater London", outcode: "KT1" },
  { slug: "twickenham", name: "Twickenham", region: "Greater London", outcode: "TW1" },
  { slug: "harrow", name: "Harrow", region: "Greater London", outcode: "HA1" },
  { slug: "enfield", name: "Enfield", region: "Greater London", outcode: "EN1" },
  { slug: "ilford", name: "Ilford", region: "Greater London", outcode: "IG1" },
  { slug: "romford", name: "Romford", region: "Greater London", outcode: "RM1" },
  { slug: "dartford", name: "Dartford", region: "Kent", outcode: "DA1" },
];

export function getTown(slug: string): TownMeta | undefined {
  return TOP_TOWNS.find((t) => t.slug === slug.toLowerCase());
}
