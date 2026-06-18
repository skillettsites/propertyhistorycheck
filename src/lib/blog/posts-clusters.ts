import type { BlogPost } from "./types";

/**
 * Cluster expansion posts (June 2026). Each one doubles down on a proven
 * GSC demand cluster that had impressions but no dedicated page:
 *  - "search fee when buying a house" (striking distance, pos 8-10)
 *  - mining search siblings (the coal-mining cluster already wins clicks)
 *  - chancel repair indemnity insurance (high impression volume sub-cluster)
 *  - freehold checker (33 impressions, pos 33, no dedicated page)
 *  - sewer / water connection (drainage cluster, striking distance)
 *  - RICS Level 3 building survey (split from the combined RICS page)
 *  - radon survey cost (radon is a Premium report feature)
 *  - house history check (maps to /property-history-check money page)
 */
export const posts_clusters: BlogPost[] = [
  {
    slug: "what-is-a-search-fee-when-buying-a-house",
    title: "What Is a Search Fee When Buying a House? UK Costs (2026)",
    h1: "What Is a Search Fee When Buying a House?",
    description:
      "A search fee is the cost of the conveyancing searches your solicitor orders, around £250 to £450 in total in 2026. See exactly what each search fee covers, when you pay it, and how to avoid paying twice.",
    datePublished: "2026-06-11",
    category: "cost",
    shortAnswer:
      "A search fee is what you pay for the conveyancing searches your solicitor orders before you buy a house, totalling around £250 to £450 in 2026. It bundles the local authority search (£100 to £250), the drainage and water search (£40 to £75) and the environmental search (£40 to £70), with a coal mining search (£30 to £60) added in mining areas. The fees are disbursements, paid on top of your solicitor's own charge.",
    table: {
      caption: "What each search fee covers (UK, 2026)",
      columns: ["Search fee", "Typical cost", "What it checks"],
      rows: [
        ["Local authority search", "£100 to £250", "Planning, roads, charges on the property"],
        ["Drainage and water search", "£40 to £75", "Mains water and public sewer connections"],
        ["Environmental search", "£40 to £70", "Contamination, flood, ground stability"],
        ["Coal mining search", "£30 to £60", "Mining risk (coalfield areas only)"],
        ["Total search fees", "£250 to £450", "The full pack your solicitor orders"],
      ],
    },
    sections: [
      {
        heading: "What a search fee actually is",
        paras: [
          "A search fee is the charge for a conveyancing search, an enquiry your solicitor makes about a property on your behalf. Each search has its own fee, and they are listed on your completion statement as disbursements: costs your solicitor pays out to third parties and then bills back to you.",
          "Search fees are separate from your solicitor's own legal fee. When a quote lists \"searches\" as a line item of £250 to £450, that is the combined search fee for the standard pack, not money the solicitor keeps.",
        ],
      },
      {
        heading: "The search fees you will see on a quote",
        bullets: [
          "Local authority search fee: £100 to £250, the largest single fee, covering planning history, road status and any financial charges registered on the property.",
          "Drainage and water search fee: £40 to £75, confirming mains water and public sewer connections.",
          "Environmental search fee: £40 to £70, screening for contaminated land, flood and ground stability.",
          "Coal mining search fee: £30 to £60, ordered only where the property sits in a former coalfield.",
          "Chancel repair and other indemnity checks: a few pounds each, added where relevant.",
        ],
      },
      {
        heading: "When you pay the search fee",
        paras: [
          "You pay search fees after your offer is accepted and you have instructed a solicitor, usually within the first week or two of the conveyancing process. Many firms ask for the search fees up front because they are paying third parties straight away.",
          "This timing is the catch. If a sale falls through after searches are ordered, the search fee is generally not refundable and the searches cannot be reused on a different property. Buyers who lose two or three sales can pay the £250 to £450 search fee several times over.",
        ],
      },
      {
        heading: "Can you avoid or reduce the search fee?",
        paras: [
          "You cannot avoid search fees on a mortgaged purchase because lenders require the searches, and skipping them as a cash buyer means buying blind on planning, drainage and contamination. The fee itself is set by the council and the search providers, so there is little room to negotiate it down.",
          "What you can control is paying it on the wrong property. The smart move is to screen a property before you instruct a solicitor, so you only pay the search fee once, on a home you actually intend to buy.",
        ],
      },
      {
        heading: "Screen a property before you pay any search fee",
        paras: [
          "HomeBuyerCheck gives a free instant report on any UK address covering sales history, EPC, flood risk from the Environment Agency, crime, schools and council tax. The £4.99 Premium report adds ground risk from British Geological Survey data, radon, listed and conservation status, ownership from HM Land Registry, Companies House owner checks, the Building Safety Register and Property Chamber tribunal records, plus an AI buyer's verdict and a seller-question pack.",
          "Running that for £4.99 before you instruct a solicitor means the £250 to £450 search fee only ever gets paid on a property worth committing to. The £6.99 Premium+ report adds AI solicitor, surveyor and mortgage broker briefs so you walk into conveyancing already knowing what to ask.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a search fee when buying a house?",
        a: "A search fee is the cost of a conveyancing search your solicitor orders, such as the local authority, drainage and environmental searches. Together they total around £250 to £450 in 2026 and appear as disbursements on your completion statement.",
      },
      {
        q: "How much is the search fee for buying a house in 2026?",
        a: "The full set of search fees comes to around £250 to £450. The local authority search is the biggest at £100 to £250, with the drainage and water search (£40 to £75) and environmental search (£40 to £70) making up most of the rest.",
      },
      {
        q: "Is the search fee refundable if the sale falls through?",
        a: "Generally no. Once searches are ordered the fee is paid to third parties and is not refundable, and the searches cannot be transferred to another property. This is why screening a property before instructing a solicitor matters.",
      },
      {
        q: "Who pays the search fee, the buyer or the seller?",
        a: "The buyer pays. Search fees are disbursements on the buyer's solicitor's bill, ordered once the offer is accepted, and total around £250 to £450.",
      },
      {
        q: "Can I check a property for free before paying search fees?",
        a: "Yes. HomeBuyerCheck's free report covers sales history, Environment Agency flood risk, crime, schools and council tax, and the £4.99 Premium report adds ground risk, ownership and more, so you only pay the £250 to £450 search fee on a property you intend to buy.",
      },
    ],
    related: [
      "how-much-are-property-searches-when-buying",
      "local-authority-search-cost-uk",
      "conveyancing-searches-cost-uk-2026",
    ],
  },
  {
    slug: "mining-search-cost-uk",
    title: "Mining Search Cost UK (2026): When You Need One",
    h1: "Mining Search Cost UK (2026)",
    description:
      "A mining search costs around £30 to £60 in 2026 and is ordered when a property sits in a former coalfield or other mining area. See what it checks, how to tell if your property needs one, and how to find out for free first.",
    datePublished: "2026-06-11",
    category: "cost",
    shortAnswer:
      "A mining search costs around £30 to £60 in 2026 and is ordered by your solicitor when a property sits in a former coal mining area or other mining region. The Coal Authority CON29M search checks for old mine workings, shafts, subsidence claims and ground stability beneath the property. It is added to the standard search pack only where the location calls for it, so many buyers never need one.",
    table: {
      caption: "Mining search costs in context (UK, 2026)",
      columns: ["Search", "Typical cost", "When ordered"],
      rows: [
        ["Coal mining search (CON29M)", "£30 to £60", "Coalfield areas"],
        ["Non-coal mining search (tin, clay, brine)", "£30 to £90", "Relevant mining regions"],
        ["Environmental search (incl. ground stability)", "£40 to £70", "Most purchases"],
        ["Full conveyancing search pack", "£250 to £450", "Most purchases"],
      ],
    },
    sections: [
      {
        heading: "What a mining search is",
        paras: [
          "A mining search is a report on past and present mining activity beneath and around a property. The most common is the coal mining search, the CON29M, provided by the Coal Authority. Other regions have their own searches for tin, clay, limestone, brine and metalliferous mining.",
          "Your solicitor orders it as an add-on to the standard search pack, but only where the property's location flags a mining risk. In a former coalfield it is effectively standard; outside mining areas it is usually not needed at all.",
        ],
      },
      {
        heading: "What a mining search shows",
        bullets: [
          "Recorded coal mine workings, shafts and adits beneath or near the property.",
          "Past, present and proposed mining in the area.",
          "Any subsidence damage claims and whether they were settled.",
          "Ground stability and the risk of future movement.",
          "Whether the property is in a development high-risk area requiring further investigation.",
        ],
      },
      {
        heading: "How to tell if your property needs a mining search",
        paras: [
          "The simplest test is location. Large parts of the Midlands, the North East, Yorkshire, South Wales, the North West, Scotland's central belt and Kent sit over former coalfields. If a property is in one of these, expect a coal mining search to be ordered.",
          "You do not have to wait for your solicitor to find out. A pre-offer property check flags whether an address sits in a coal mining area, so you know in advance whether a mining search, and the small risk of subsidence issues, is in play.",
        ],
      },
      {
        heading: "Is a mining search worth it?",
        paras: [
          "Where it applies, yes. At £30 to £60 it is one of the cheapest searches, and mortgage lenders expect it in coalfield areas. A clear result is reassuring; a flagged result lets you investigate ground stability before you are committed.",
          "Old mine workings can cause subsidence that is expensive to remediate and can affect what a property is worth and whether it is insurable. Finding out for £30 to £60 before exchange is far cheaper than discovering it afterwards.",
        ],
      },
      {
        heading: "Check coal mining risk for free before you pay",
        paras: [
          "HomeBuyerCheck's free report shows the basics for any UK address. The £4.99 Premium report adds a coal mining area flag, ground stability and radon risk from official data, listed and conservation status, ownership from HM Land Registry and an AI buyer's verdict.",
          "Running that pre-offer tells you whether mining is even a factor at the address, so you only commit to the search pack, and the small extra mining search fee, on a property you intend to buy.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a mining search cost in the UK?",
        a: "A coal mining search (CON29M) costs around £30 to £60 in 2026. Non-coal mining searches for tin, clay or brine areas can be £30 to £90. It is added to the standard search pack only in relevant mining areas.",
      },
      {
        q: "Do I need a mining search?",
        a: "Only if the property sits in a former mining area, most commonly a coalfield. Your solicitor will order one automatically where the location calls for it. Outside mining regions it is usually not needed.",
      },
      {
        q: "How do I know if my property is in a coal mining area?",
        a: "Location is the key. You can check for free with HomeBuyerCheck: the £4.99 Premium report flags whether an address sits in a coal mining area and shows ground stability and subsidence risk before you pay for searches.",
      },
      {
        q: "What is the difference between a mining search and an environmental search?",
        a: "A mining search (£30 to £60) focuses specifically on mine workings, shafts and mining subsidence. An environmental search (£40 to £70) covers broader ground stability, contamination and flood risk. In mining areas you typically need both.",
      },
      {
        q: "Can old mining cause problems when buying a house?",
        a: "Yes. Old mine workings can cause subsidence that affects a property's value and insurability. A mining search identifies the risk for £30 to £60, far less than the cost of discovering it after you have bought.",
      },
    ],
    related: [
      "coal-mining-search-cost-uk",
      "do-i-need-a-coal-mining-search",
      "coal-mining-areas-uk-property-buyers-guide",
    ],
  },
  {
    slug: "chancel-repair-indemnity-insurance-cost-uk",
    title: "Chancel Repair Indemnity Insurance Cost UK (2026)",
    h1: "Chancel Repair Indemnity Insurance Cost UK (2026)",
    description:
      "Chancel repair indemnity insurance is a one-off premium of around £10 to £50 in 2026. See what it covers, when you need it, how it differs from the chancel search, and how to triage a property first.",
    datePublished: "2026-06-11",
    category: "cost",
    shortAnswer:
      "Chancel repair indemnity insurance is a one-off policy costing around £10 to £50 in 2026, paid once and lasting for as long as you own the property. It protects you against a claim for chancel repair liability, an old obligation that can require some homeowners to contribute to repairs of a parish church chancel. Your solicitor arranges it where a chancel search flags a possible risk, and it is one of the cheapest items in the whole conveyancing process.",
    table: {
      caption: "Chancel repair indemnity insurance and related costs (UK, 2026)",
      columns: ["Item", "Typical cost", "Type"],
      rows: [
        ["Chancel repair indemnity insurance", "£10 to £50", "One-off premium"],
        ["Chancel repair search", "£10 to £30", "Search fee"],
        ["Higher-cover chancel indemnity (large value)", "£50 to £200+", "One-off premium"],
        ["Other indemnity policies (restrictive covenant, etc.)", "£20 to £150", "One-off premium"],
      ],
    },
    sections: [
      {
        heading: "What chancel repair indemnity insurance is",
        paras: [
          "Chancel repair liability is a historic obligation, dating back centuries, that can make the owner of certain properties responsible for contributing to the repair of a local parish church's chancel. It applies to a minority of properties, often those on land once owned by the church.",
          "Chancel repair indemnity insurance is a one-off policy that pays out if a valid claim for this liability is ever made against you. It is cheap because the risk is low for most properties, but the potential cost of a successful claim can run into thousands, so insuring against it is sensible where a risk is flagged.",
        ],
      },
      {
        heading: "How much it costs",
        paras: [
          "For a typical home, chancel repair indemnity insurance costs around £10 to £50 as a single premium. You pay it once at the point of purchase and it covers you, and usually future owners, for as long as the policy terms allow.",
          "Higher-value properties, or policies with a larger indemnity limit, can cost £50 to £200 or more, but for most buyers it sits at the lower end. It is one of the smallest figures on a completion statement.",
        ],
      },
      {
        heading: "Search versus insurance: what is the difference?",
        paras: [
          "The chancel repair search (£10 to £30) checks whether a property might carry chancel repair liability. If the search comes back clear, you usually need no insurance. If it flags a possible risk, the cheapest way to deal with it is the indemnity policy rather than further detailed investigation.",
          "Many solicitors skip the separate search and simply recommend the indemnity policy straight away, because at £10 to £50 it is often cheaper than the search plus the lawyer's time to interpret it.",
        ],
      },
      {
        heading: "When you need it",
        bullets: [
          "When a chancel search or the title flags possible chancel repair liability.",
          "When your mortgage lender requires the risk to be covered before completion.",
          "When the property is near an old parish church or on historically church-owned land.",
          "As a low-cost precaution, even where the risk is uncertain, because the premium is small.",
        ],
      },
      {
        heading: "Triage a property before the conveyancing stage",
        paras: [
          "Chancel risk is one of many old obligations that can sit on a property. HomeBuyerCheck's £4.99 Premium report reads the ownership and risk picture for any UK address, including listed and conservation status, ground risk, and ownership from HM Land Registry, with an AI buyer's verdict that flags issues to raise with your solicitor.",
          "It will not replace the formal chancel indemnity policy, but it gives you the full risk context for £4.99 before you commit, so nothing on the completion statement is a surprise. The £6.99 Premium+ report adds an AI solicitor brief listing the exact pre-exchange enquiries to make.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much is chancel repair indemnity insurance?",
        a: "Chancel repair indemnity insurance is a one-off premium of around £10 to £50 for a typical home in 2026. Higher-value properties or larger cover limits can cost £50 to £200 or more, but most buyers pay at the lower end.",
      },
      {
        q: "Is chancel repair indemnity insurance a one-off or annual cost?",
        a: "It is a one-off premium. You pay it once at completion and it covers you, and often future owners, for as long as the policy terms allow. There is no annual renewal.",
      },
      {
        q: "Do I really need chancel repair insurance?",
        a: "You need it where a chancel search or the title flags possible chancel repair liability, or where your lender requires the risk to be covered. At £10 to £50 many buyers take it as a cheap precaution even when the risk is uncertain.",
      },
      {
        q: "What is the difference between a chancel search and chancel indemnity insurance?",
        a: "The chancel search (£10 to £30) checks whether the liability might apply. The indemnity insurance (£10 to £50) protects you financially if a claim is ever made. Many solicitors recommend going straight to the indemnity policy as it is often cheaper overall.",
      },
      {
        q: "Can I check a property's risks before completion?",
        a: "Yes. HomeBuyerCheck's £4.99 Premium report reads the ownership and risk picture for any UK address, including listed status, ground risk and an AI buyer's verdict, so you understand the full picture before you commit.",
      },
    ],
    related: [
      "chancel-repair-search-cost-uk",
      "what-is-a-chancel-repair-search",
      "conveyancing-searches-cost-uk-2026",
    ],
  },
  {
    slug: "freehold-checker-how-to-check",
    title: "Freehold Checker: How to Check If a Property Is Freehold (2026)",
    h1: "Freehold Checker: Is a Property Freehold or Leasehold?",
    description:
      "Use a freehold checker to confirm whether a UK property is freehold or leasehold before you offer. See the official way to check tenure for free, what the title register shows, and why it changes what you pay.",
    datePublished: "2026-06-11",
    category: "qa",
    shortAnswer:
      "To check whether a property is freehold or leasehold, look at its tenure on the HM Land Registry title register. A freehold checker reads this for you: freehold means you own the property and the land it sits on outright, while leasehold means you own the property for a fixed term and pay ground rent or service charges to a freeholder. HomeBuyerCheck shows the tenure of any UK address, with the full title register synthesis available from £4.99.",
    table: {
      caption: "Freehold versus leasehold at a glance",
      columns: ["Feature", "Freehold", "Leasehold"],
      rows: [
        ["Who owns the land", "You", "The freeholder"],
        ["Ground rent / service charge", "None", "Usually payable"],
        ["Length of ownership", "Indefinite", "Fixed lease term"],
        ["Common property type", "Most houses", "Most flats"],
        ["Where to confirm it", "Title register", "Title register + lease"],
      ],
    },
    sections: [
      {
        heading: "What a freehold checker does",
        paras: [
          "A freehold checker tells you whether a property is held as freehold or leasehold. Tenure is recorded on the property's official title register at HM Land Registry, and it is one of the first things you should confirm before making an offer, because it changes the true cost of ownership.",
          "Estate agent listings are not always reliable on tenure, and an assumption that a flat is share of freehold or that a house has no lease can be wrong. Checking the register removes the guesswork.",
        ],
      },
      {
        heading: "How to check if a property is freehold",
        bullets: [
          "Look up the property's title register, which records the tenure as freehold or leasehold.",
          "For a freehold, the register confirms outright ownership of the property and land.",
          "For a leasehold, the register references a lease; you then need the lease term and any ground rent.",
          "Watch for share of freehold flats, where the lease still exists but the freehold is owned collectively.",
          "Confirm any management company, estate rentcharge or service charge that applies.",
        ],
      },
      {
        heading: "Why tenure changes what you pay",
        paras: [
          "Leasehold ownership comes with costs and risks freehold does not: ground rent, service charges, a lease that shortens over time, and the cost of a lease extension once it drops below about 80 years. A short lease can make a flat hard to mortgage and expensive to fix.",
          "A freehold house avoids most of these, though some newer estates carry rentcharges or estate management fees. Knowing the tenure, and the numbers behind it, before you offer is the difference between a fair price and an expensive surprise.",
        ],
      },
      {
        heading: "Check tenure and the full title for any address",
        paras: [
          "HomeBuyerCheck acts as a freehold checker for any UK address: the report reads the tenure, ownership and risk picture so you know whether you are buying freehold or leasehold before you instruct anyone.",
          "The £4.99 Premium report adds ownership from HM Land Registry, Companies House owner checks and an AI buyer's verdict. The £14.99 Pre-Exchange Bundle adds a title & tenure synthesis (tenure, ownership and sale history read from public Land Registry data in plain English) plus the AI Solicitor, Surveyor and Mortgage briefs. The official title document, with the full covenants, easements and charges, is a separate £7 download from gov.uk.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I check if a property is freehold or leasehold?",
        a: "Check the tenure on the property's HM Land Registry title register. Freehold means you own the property and land outright; leasehold means you own it for a fixed term and pay a freeholder. HomeBuyerCheck reads the tenure of any UK address for you.",
      },
      {
        q: "Is there a free freehold checker?",
        a: "HomeBuyerCheck shows the tenure of any UK address, and the £4.99 Premium report confirms ownership from HM Land Registry. The £14.99 Pre-Exchange Bundle adds a title & tenure synthesis from public Land Registry data; the official title document with covenants and charges is a separate £7 gov.uk download.",
      },
      {
        q: "Can a flat be freehold?",
        a: "Most flats are leasehold, but some are share of freehold, where leaseholders collectively own the freehold. The lease still exists in those cases. The title register and lease confirm the exact arrangement.",
      },
      {
        q: "Why does it matter if a property is leasehold?",
        a: "Leasehold brings ground rent, service charges and a lease that shortens over time. A lease under about 80 years can be costly to extend and hard to mortgage, so confirming tenure before you offer protects you from an expensive surprise.",
      },
      {
        q: "Does the estate agent's listing confirm the tenure?",
        a: "Not reliably. Listings can be wrong or vague on tenure and share of freehold. The only authoritative source is the HM Land Registry title register, which HomeBuyerCheck reads for any UK address.",
      },
    ],
    related: [
      "how-to-find-out-who-owns-a-property-uk",
      "title-register-download-cost-uk",
      "what-is-a-con29-search",
    ],
  },
  {
    slug: "sewer-connection-cost-uk",
    title: "Sewer Connection Cost UK (2026): Mains Drainage Explained",
    h1: "Sewer Connection Cost UK (2026)",
    description:
      "Connecting a property to the public sewer costs from around £1,000 to several thousand pounds in 2026, depending on distance and works. See typical costs, how to confirm a property's drainage before you buy, and what the search shows.",
    datePublished: "2026-06-11",
    category: "cost",
    shortAnswer:
      "Connecting a property to the public sewer typically costs from around £1,000 to several thousand pounds in 2026, driven mainly by the distance to the nearest public sewer and the groundworks involved. There is also a water company connection charge on top. Most existing homes are already connected, which a drainage and water search (£40 to £75) confirms, so this cost mainly affects new builds, conversions and properties on septic tanks.",
    table: {
      caption: "Sewer and drainage connection costs (UK, 2026)",
      columns: ["Item", "Typical cost", "Notes"],
      rows: [
        ["New public sewer connection (groundworks)", "£1,000 to £5,000+", "Depends on distance and access"],
        ["Water company connection charge", "£500 to £1,500", "On top of the groundworks"],
        ["Septic tank to mains conversion", "£3,000 to £10,000+", "Where mains is reachable"],
        ["Drainage and water search (CON29DW)", "£40 to £75", "Confirms existing connections"],
      ],
    },
    sections: [
      {
        heading: "When sewer connection cost is a factor",
        paras: [
          "Most existing UK homes are already connected to the public sewer, so for a typical purchase there is no connection cost to worry about. It becomes relevant for new builds, barn conversions, plots, and properties currently on a septic tank or private treatment plant.",
          "The cost is driven mostly by how far the property is from the nearest public sewer and how difficult the groundworks are, because the connection pipe has to be dug and laid. A connection a few metres away is cheap; one across a road or a long driveway can run into thousands.",
        ],
      },
      {
        heading: "What it typically costs",
        bullets: [
          "Groundworks for a new connection: £1,000 to £5,000 or more, depending on distance and access.",
          "The water company's connection charge: usually £500 to £1,500 on top.",
          "Converting from a septic tank to mains: £3,000 to £10,000 or more where mains drainage is reachable.",
          "Ongoing: once connected, you pay standard sewerage charges on your water bill.",
        ],
      },
      {
        heading: "How to confirm a property's drainage before you buy",
        paras: [
          "The drainage and water search (CON29DW), at £40 to £75, confirms whether a property is connected to the mains water supply and the public sewer, where the sewers run, and whether any cross the land. Your solicitor orders it as one of the core searches.",
          "If a property is not on mains drainage, that changes its running costs and your obligations under the rules on private sewage. It is far better to know before you offer than to find out during conveyancing.",
        ],
      },
      {
        heading: "Screen drainage and risk for free first",
        paras: [
          "HomeBuyerCheck's free report covers the basics for any UK address, including Environment Agency flood risk. The £4.99 Premium report adds ground stability, radon, ownership from HM Land Registry and an AI buyer's verdict.",
          "Running it pre-offer means you only pay the £40 to £75 drainage search, and order the full search pack, on a property you intend to buy, and you go into conveyancing already aware of any drainage question marks.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does it cost to connect a property to the public sewer?",
        a: "Connecting to the public sewer typically costs from around £1,000 to several thousand pounds in 2026 for the groundworks, plus a water company connection charge of £500 to £1,500. Cost depends mainly on distance to the nearest sewer.",
      },
      {
        q: "Is my property already connected to the public sewer?",
        a: "Most existing homes are. The drainage and water search (CON29DW), costing £40 to £75, confirms whether a property is connected to mains water and the public sewer and where the sewers run.",
      },
      {
        q: "How much does it cost to convert a septic tank to mains drainage?",
        a: "Converting from a septic tank to mains drainage typically costs £3,000 to £10,000 or more where mains is reachable, driven by distance and groundworks. Where mains is far away, it may not be practical at all.",
      },
      {
        q: "Who pays for a new sewer connection?",
        a: "The property owner pays for the connection works and the water company's connection charge. For an existing connected home there is no such cost, only standard sewerage charges on the water bill.",
      },
      {
        q: "How can I check a property's drainage before buying?",
        a: "The drainage and water search confirms connections for £40 to £75. Before that, HomeBuyerCheck's free report and £4.99 Premium report screen flood and ground risk, so you only pay search fees on a property you intend to buy.",
      },
    ],
    related: [
      "drainage-and-water-search-cost-uk",
      "how-much-are-property-searches-when-buying",
      "environmental-search-cost-uk",
    ],
  },
  {
    slug: "level-3-building-survey-cost-uk",
    title: "Level 3 Building Survey Cost UK (2026): Full Price Guide",
    h1: "Level 3 Building Survey Cost UK (2026)",
    description:
      "A RICS Level 3 Building Survey costs around £600 to £1,500 or more in 2026, depending on the size and age of the property. See the full price bands, when you need a Level 3 over a Level 2, and how to decide.",
    datePublished: "2026-06-11",
    category: "cost",
    shortAnswer:
      "A RICS Level 3 Building Survey, the most detailed home survey, costs around £600 to £1,500 or more in 2026. Price rises with the size, age and condition of the property, so a large period or unusual home costs the most. The Level 3 is the right choice for older, larger, altered or run-down properties, where its detailed inspection of the structure and a clear repair picture can save far more than its fee.",
    table: {
      caption: "Level 3 Building Survey cost by property (UK, 2026)",
      columns: ["Property", "Typical Level 3 cost", "Why"],
      rows: [
        ["Small flat or modern house", "£600 to £800", "Less to inspect"],
        ["Typical 3-bed house", "£700 to £1,000", "Standard scope"],
        ["Large or period property", "£1,000 to £1,500+", "More structure, more risk"],
        ["Listed or unusual building", "£1,200 to £2,000+", "Specialist inspection"],
      ],
    },
    sections: [
      {
        heading: "What a Level 3 Building Survey is",
        paras: [
          "A RICS Level 3 Building Survey, sometimes still called a full structural survey, is the most thorough home survey. The surveyor inspects the structure in detail, describes the condition of each element, explains the cause of any defects and sets out the likely repairs.",
          "It is more detailed and more expensive than the Level 2 HomeBuyer Report. Where a Level 2 gives a traffic-light condition rating, a Level 3 goes further into why a problem exists and what to do about it.",
        ],
      },
      {
        heading: "Level 3 survey cost bands",
        bullets: [
          "Small flat or modern house: around £600 to £800.",
          "Typical three-bedroom house: around £700 to £1,000.",
          "Large or period property: around £1,000 to £1,500 or more.",
          "Listed, timber-framed or unusual building: £1,200 to £2,000 or more for a specialist.",
          "Add travel and any specialist follow-up reports (damp, structure, trees) on top.",
        ],
      },
      {
        heading: "When you need a Level 3 over a Level 2",
        paras: [
          "Choose a Level 3 for older properties (broadly pre-1930s), large or extended homes, anything in poor or unknown condition, listed buildings, non-standard construction, or where you plan major works. The detailed picture justifies the higher fee on these homes.",
          "For a conventional, reasonably modern house in apparent good condition, a Level 2 HomeBuyer Report (£400 to £900) is usually enough. Paying for a Level 3 on a simple modern flat is rarely necessary.",
        ],
      },
      {
        heading: "Surveys are separate from searches",
        paras: [
          "A Level 3 survey inspects the building's physical condition. It does not cover the legal and environmental risks, planning, drainage, contamination, mining, that conveyancing searches (£250 to £450) deal with. Most buyers pay for both.",
          "Before you spend on either, screen the property for free. HomeBuyerCheck's £4.99 Premium report flags ground risk, radon, listed and conservation status and ownership, with an AI surveyor brief in the £6.99 Premium+ report telling you exactly what to ask your RICS surveyor to focus on, so you get more value from the survey you pay for.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a Level 3 Building Survey cost in the UK?",
        a: "A RICS Level 3 Building Survey costs around £600 to £1,500 or more in 2026. Price depends on the size, age and condition of the property, with large period or listed homes at the top of the range.",
      },
      {
        q: "What is the difference between a Level 2 and Level 3 survey cost?",
        a: "A Level 2 HomeBuyer Report costs around £400 to £900 and suits conventional modern homes. A Level 3 Building Survey costs £600 to £1,500 or more and is the detailed choice for older, larger or altered properties.",
      },
      {
        q: "Do I need a Level 3 survey?",
        a: "Choose a Level 3 for older (pre-1930s), large, extended, listed, non-standard or run-down properties, or where you plan major works. For a conventional modern home in good condition, a Level 2 is usually enough.",
      },
      {
        q: "Is a Level 3 survey the same as conveyancing searches?",
        a: "No. A Level 3 survey inspects the building's condition. Conveyancing searches (£250 to £450) cover legal, planning, drainage and environmental matters. Most buyers pay for both.",
      },
      {
        q: "How can I get more value from a Level 3 survey?",
        a: "Screen the property first. HomeBuyerCheck's £6.99 Premium+ report includes an AI surveyor brief that lists exactly what to flag to your RICS surveyor, so the survey you pay for focuses on the right risks.",
      },
    ],
    related: [
      "rics-survey-cost-uk",
      "homebuyer-survey-cost-uk",
      "do-i-need-a-survey-when-buying-a-house",
    ],
  },
  {
    slug: "radon-survey-cost-uk",
    title: "Radon Survey & Test Cost UK (2026): How to Check Radon Risk",
    h1: "Radon Survey & Test Cost UK (2026)",
    description:
      "A home radon test costs around £50 to £200 in 2026, and you can check a property's radon risk for free first. See what radon testing costs, how to read the risk before you buy, and what to do if a property is in a radon area.",
    datePublished: "2026-06-11",
    category: "cost",
    shortAnswer:
      "A home radon test costs around £50 to £200 in 2026 depending on whether you use a short-term detector pack or a longer three-month measurement. Before paying for a test, you can check a property's radon risk for free by its postcode: radon is a naturally occurring radioactive gas that varies by geology, and only some areas are affected. HomeBuyerCheck flags radon risk at the exact address as part of its £4.99 Premium report.",
    table: {
      caption: "Radon testing and risk-check costs (UK, 2026)",
      columns: ["Option", "Typical cost", "What you get"],
      rows: [
        ["Radon risk check by postcode", "Free to £4.99", "Whether the address is in a radon area"],
        ["Short-term radon detector pack", "£50 to £100", "An indicative reading"],
        ["Three-month validated radon test", "£50 to £200", "An accurate average measurement"],
        ["Radon remediation (sump, ventilation)", "£500 to £2,000+", "If high levels are confirmed"],
      ],
    },
    sections: [
      {
        heading: "What a radon survey is",
        paras: [
          "Radon is a natural radioactive gas released from the ground. In most of the UK levels are harmless, but in certain areas, driven by the local geology, radon can build up inside buildings to levels worth reducing. Radon testing measures the concentration inside a property.",
          "A radon survey usually means placing detectors in the home for a period, then having them analysed. A short-term pack gives a quick indicative reading; a validated three-month test gives an accurate average, which is the figure used to decide whether action is needed.",
        ],
      },
      {
        heading: "What radon testing costs",
        bullets: [
          "Checking the radon risk of an address by postcode: free, or included in a £4.99 property report.",
          "A short-term radon detector pack: around £50 to £100.",
          "A validated three-month radon measurement: around £50 to £200.",
          "Remediation if high levels are confirmed (sump, improved ventilation): £500 to £2,000 or more.",
        ],
      },
      {
        heading: "Check radon risk before you buy",
        paras: [
          "You do not need to test before you offer, but you should know whether a property is in a radon affected area, because that tells you whether testing and possible remediation are even in play. This is a free risk check based on the property's location.",
          "If an address sits in a higher radon area, you can factor a test, and the small chance of remediation, into your decision and your offer. If it does not, radon is not something you need to spend on at all.",
        ],
      },
      {
        heading: "Radon risk in your property report",
        paras: [
          "HomeBuyerCheck's £4.99 Premium report flags radon risk at the exact address using official data, alongside ground stability, coal mining, listed and conservation status, ownership from HM Land Registry and an AI buyer's verdict.",
          "That means you learn whether radon matters at a property for £4.99, before you commit to a test or a survey. The £6.99 Premium+ report adds AI solicitor and surveyor briefs that tell you what to raise if radon or ground risk is flagged.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a radon test cost in the UK?",
        a: "A home radon test costs around £50 to £200 in 2026: roughly £50 to £100 for a short-term detector pack, or £50 to £200 for a validated three-month measurement. Checking the risk by postcode first is free or part of a £4.99 report.",
      },
      {
        q: "How do I check a property's radon risk before buying?",
        a: "Radon risk varies by location, so it can be checked by postcode for free. HomeBuyerCheck's £4.99 Premium report flags radon risk at the exact address, so you know whether testing is worth it before you offer.",
      },
      {
        q: "Do I need a radon test when buying a house?",
        a: "Only if the property is in a radon affected area. Check the risk by location first; if the address is not in a radon area, no test is needed. If it is, a £50 to £200 test confirms the actual level.",
      },
      {
        q: "What does it cost to fix high radon levels?",
        a: "Radon remediation, such as a sump and improved ventilation, typically costs £500 to £2,000 or more. It is only needed where a validated test confirms levels above the action level, which affects a minority of homes.",
      },
      {
        q: "Is radon risk included in a property report?",
        a: "Yes. HomeBuyerCheck's £4.99 Premium report flags radon risk at the exact address using official data, alongside ground risk, coal mining and ownership, so you understand the full risk picture before you buy.",
      },
    ],
    related: [
      "how-to-check-radon-risk-before-buying-a-house",
      "environmental-search-cost-uk",
      "coal-mining-search-cost-uk",
    ],
  },
  {
    slug: "house-history-check-uk",
    title: "House History Check UK (2026): How to Check a Property's Past",
    h1: "House History Check UK (2026)",
    description:
      "A house history check reveals a property's past sale prices, ownership, tenure, planning and risk before you buy. See how to check a house's history for free, what records to use, and what a full report adds.",
    datePublished: "2026-06-11",
    category: "qa",
    shortAnswer:
      "A house history check pulls together a property's past sale prices, ownership, tenure, planning and risk record so you understand what you are buying. You can check much of it for free: sold prices come from HM Land Registry, ownership from the title register, and risk from public data. HomeBuyerCheck runs a free instant house history check on any UK address, with ownership, ground risk and an AI buyer's verdict added in the £4.99 Premium report.",
    table: {
      caption: "What a house history check covers and where it comes from",
      columns: ["Record", "What it tells you", "Source"],
      rows: [
        ["Past sale prices", "What the property sold for and when", "HM Land Registry"],
        ["Ownership and tenure", "Who owns it, freehold or leasehold", "Title register"],
        ["Risk record", "Flood, ground, radon, mining", "Public risk data"],
        ["Planning and overlays", "Listed, conservation, alterations", "Council records"],
      ],
    },
    sections: [
      {
        heading: "What a house history check shows",
        paras: [
          "Checking a house's history means looking at the records that show what it has been, what has happened to it, and what risks sit on it. The core elements are its past sale prices, its current ownership and tenure, its planning and alteration history, and its environmental risk record.",
          "Together these answer the questions that change an offer: has the price moved oddly, who really owns it, is it freehold or leasehold, has it been altered without consent, and does it carry flood, ground or mining risk?",
        ],
      },
      {
        heading: "How to check a house's history for free",
        bullets: [
          "Past sale prices: HM Land Registry's sold price data shows what a property sold for and when.",
          "Ownership and tenure: the title register records the owner and whether it is freehold or leasehold.",
          "Flood risk: the Environment Agency publishes flood risk by location.",
          "Ground, radon and mining risk: official datasets flag these by area.",
          "Planning and listed status: local council and Historic England records show alterations and protections.",
        ],
      },
      {
        heading: "Why a house's history matters before you offer",
        paras: [
          "A property's history is where the risks hide. A sale price that jumped then fell can signal a problem; an owner that is an overseas company changes the picture; a loft or extension with no planning record can be a liability; a flood or subsidence history can affect value and insurance.",
          "Pulling this together before you offer, rather than during conveyancing, means you negotiate from knowledge and avoid paying search and survey fees on a property whose history should have warned you off.",
        ],
      },
      {
        heading: "Run a full house history check on any address",
        paras: [
          "HomeBuyerCheck runs a free instant house history check on any UK address: sales history, EPC, flood risk, crime, schools and council tax. The £4.99 Premium report adds ownership from HM Land Registry, a Companies House owner check, ground and radon risk, listed and conservation status, the Building Safety Register and Property Chamber tribunal records, plus an AI buyer's verdict.",
          "The £14.99 Pre-Exchange Bundle goes furthest, adding a title & tenure synthesis (tenure, ownership and sale history from public Land Registry data) plus the AI Solicitor, Surveyor and Mortgage briefs. For the official covenants, easements and charges, order the £7 title copy from gov.uk.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I check a house's history?",
        a: "Check its past sale prices on HM Land Registry, its ownership and tenure on the title register, and its flood, ground and planning record from public data. HomeBuyerCheck runs a free instant house history check on any UK address that pulls these together.",
      },
      {
        q: "Can I check a property's history for free?",
        a: "Yes. Sold prices, basic ownership and flood risk are all available from public sources. HomeBuyerCheck's free report combines sales history, EPC, flood risk, crime, schools and council tax for any UK address.",
      },
      {
        q: "How do I find out a house's past sale prices?",
        a: "HM Land Registry publishes sold price data showing what a property sold for and when. HomeBuyerCheck displays this sales history as part of its free house history check.",
      },
      {
        q: "What does a full house history check add over the free version?",
        a: "The £4.99 Premium report adds ownership from HM Land Registry, a Companies House owner check, ground, radon and mining risk, listed status and an AI buyer's verdict. The £14.99 Pre-Exchange Bundle adds a title & tenure synthesis from public Land Registry data plus the AI Solicitor, Surveyor and Mortgage briefs.",
      },
      {
        q: "Why check a house's history before making an offer?",
        a: "A property's history is where the risks hide: odd price moves, hidden ownership, unconsented alterations or a flood record. Checking before you offer lets you negotiate from knowledge and avoid paying fees on the wrong property.",
      },
    ],
    related: [
      "how-to-find-out-who-owns-a-property-uk",
      "how-to-check-a-property-before-buying",
      "title-register-download-cost-uk",
    ],
  },
];
