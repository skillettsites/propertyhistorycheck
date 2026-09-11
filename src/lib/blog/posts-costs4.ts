import type { BlogPost } from "./types";

/**
 * Cost-cluster expansion, September 2026. Ten "[fee / survey] cost UK" topics
 * chosen from Google Keyword Planner UK volumes (pulled 11 September 2026) and
 * checked against the site's own Search Console page-by-query data so no topic
 * overlaps an existing post. Same citable format as the 23 July posts: a direct
 * answer with the price range and date, a price table, honest body, FAQs.
 *
 * Every figure in every post comes from a named provider page fetched on the
 * date in `sources[].fetched`. If a figure is not in one of those pages it is
 * not in the post.
 */

const VERIFIED = "2026-09-11";

export const posts_costs4: BlogPost[] = [
  {
    slug: "solicitor-fees-for-buying-a-house-uk",
    title: "Solicitor Fees for Buying a House UK (2026): £790 to £1,500 Legal Fee",
    h1: "How Much Are Solicitor Fees for Buying a House?",
    description:
      "Solicitor fees for buying a house are £790 to £1,500 plus VAT for the legal work in 2026, with disbursements adding around £550 or more. Average all-in cost £1,509 (HomeOwners Alliance). What you pay, why leasehold costs more, and how to cut the bill.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "conveyancing-fees",
    quickAnswer:
      "Budget £1,300 to £1,900 all-in for a freehold purchase in 2026: a legal fee of roughly £790 to £1,500 plus VAT, and around £550 of disbursements on top. Leasehold adds about £300.",
    shortAnswer:
      "Solicitor fees for buying a house in the UK are typically £790 to £1,500 plus VAT for the legal work in 2026, with disbursements (searches, Land Registry, bank transfers, ID checks) adding around £550 or more. The HomeOwners Alliance puts the average all-in cost of buying at £1,509 including disbursements and VAT, with leasehold purchases costing around £300 more. Prices checked 11 September 2026.",
    table: {
      caption: "Solicitor fees for buying a house (UK, checked 11 September 2026)",
      columns: ["Item", "Typical cost", "Source"],
      rows: [
        ["Legal fee, freehold purchase", "£790 to £1,500 plus VAT", "Homeward Legal, Taylor Rose"],
        ["Legal fee, leasehold purchase", "Around £1,000 plus VAT, or roughly £300 more than freehold", "Homeward Legal, HomeOwners Alliance"],
        ["Disbursements (searches, HMLR, transfers, ID)", "Around £550", "Homeward Legal worked example at £277,000"],
        ["Average all-in cost of buying", "£1,509 incl. disbursements and VAT", "HomeOwners Alliance (Reallymoving data)"],
        ["All-in by price: £150,000 freehold", "£1,200 to £1,400", "Homeward Legal"],
        ["All-in by price: £400,000 freehold", "£1,600 to £1,900", "Homeward Legal"],
        ["All-in by price: £600,000+ leasehold", "£2,300 to £3,000", "Homeward Legal"],
      ],
    },
    sections: [
      {
        heading: "What the fee actually covers",
        paras: [
          "A conveyancing quote has two halves. The legal fee is what the solicitor or licensed conveyancer charges for their own work: reviewing the contract and title, raising enquiries, reporting to you and your lender, exchanging contracts and completing. Taylor Rose quotes £850 to £1,500 plus VAT for buyers in 2026; Homeward Legal's worked example at the £277,000 average house price is £790 for a freehold and £1,000 for a leasehold.",
          "The second half is disbursements, the third-party costs the firm pays on your behalf. Homeward Legal's example puts these at around £550 for a standard purchase with a mortgage, made up of the search pack, Land Registry fees, a bank transfer fee and identity checks. We break those down in the guide to [conveyancing disbursements](/blog/conveyancing-disbursements-uk).",
          "Stamp duty is separate again. It is a tax paid through your solicitor, not a fee, and can dwarf everything else. Work it out with the [stamp duty calculator](/stamp-duty-calculator).",
        ],
      },
      {
        heading: "Why leasehold costs more",
        paras: [
          "Every source we checked charges more for a leasehold purchase: the HomeOwners Alliance says around £300 more, and Homeward Legal's examples show £1,000 against £790 in legal fees. The extra covers reading the lease, checking ground rent and service charge history in the management pack, and dealing with notice fees and deeds of covenant the freeholder demands on completion.",
          "If you are buying a flat, get those leasehold extras itemised in the quote before you instruct. The [leasehold management pack](/blog/leasehold-management-pack-cost-uk) is paid by the seller, but the buyer-side notice and certificate fees are yours.",
        ],
      },
      {
        heading: "How the price scales with the property",
        paras: [
          "Legal fees rise with the purchase price because the firm's risk and insurance exposure rises with it. Homeward Legal's 2026 table runs from £1,200 to £1,400 all-in for a £150,000 freehold up to £1,900 to £2,500 for freeholds over £600,000, and £2,300 to £3,000 for leaseholds at that level. Part of that climb is the Land Registry fee, which is banded by price, and part is the legal fee itself.",
          "Use the [conveyancing cost calculator](/conveyancing-cost-calculator) to see a full estimate for your price band, tenure and mortgage position before you collect quotes.",
        ],
      },
      {
        heading: "How to pay less without cutting corners",
        bullets: [
          "Get three fixed-fee quotes and compare the total including VAT and disbursements, not the headline legal fee. A £600 headline can become £1,100 once disbursements land.",
          "Ask whether the quote is no-completion, no-fee. If the purchase falls through you would still owe the disbursements already paid out, but not the legal fee.",
          "Check the extras list: gifted deposit paperwork (£50 to £100 per the HomeOwners Alliance), Help to Buy ISA redemption (capped at £50 plus VAT), and unregistered property supplements (£120 to £240) are all common add-ons.",
          "Do not choose on price alone. Slow conveyancing costs chains, and a lender panel mismatch can force you to pay a second firm.",
          "Screen the property before you instruct. A cheap pre-offer check that flags a serious problem saves the whole legal fee on a purchase that was never going to complete.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much are solicitor fees for buying a house in 2026?",
        a: "The legal fee for the solicitor's own work is typically £790 to £1,500 plus VAT for a freehold purchase, with disbursements adding around £550. The HomeOwners Alliance's average for buying, including disbursements and VAT, is £1,509. Leasehold purchases cost around £300 more.",
      },
      {
        q: "Are solicitor fees higher for a more expensive house?",
        a: "Yes. Homeward Legal's 2026 figures run from £1,200 to £1,400 all-in for a £150,000 freehold to £1,900 to £2,500 for a freehold over £600,000. The Land Registry fee is banded by price and legal fees generally rise with the value too.",
      },
      {
        q: "What is the difference between legal fees and disbursements?",
        a: "Legal fees pay the solicitor for their work. Disbursements are costs the solicitor pays to third parties on your behalf, such as local authority searches, Land Registry fees, bank transfer charges and identity checks, and are passed on at cost.",
      },
      {
        q: "Do I pay solicitor fees if the purchase falls through?",
        a: "It depends on the firm. Many offer no-completion, no-fee terms so the legal fee is waived, but disbursements already paid out, such as searches, are still charged. Check the terms before you instruct.",
      },
      {
        q: "Can I use a licensed conveyancer instead of a solicitor?",
        a: "Yes. Licensed conveyancers are regulated property specialists and often cheaper than a full-service solicitor. Whichever you choose, make sure the firm is on your mortgage lender's panel.",
      },
    ],
    related: ["conveyancing-disbursements-uk", "how-much-are-property-searches-when-buying", "land-registry-fees-when-buying-uk", "cost-of-buying-a-house-uk"],
    sources: [
      { label: "HomeOwners Alliance, Conveyancing Fees: What To Expect In 2026", url: "https://hoa.org.uk/advice/guides-for-homeowners/i-am-buying/much-conveyancing-fees-cost/", fetched: VERIFIED },
      { label: "Homeward Legal, Conveyancing Fees 2026", url: "https://www.homewardlegal.co.uk/guides-advice/post/how-much-are-average-conveyancing-fees", fetched: VERIFIED },
      { label: "Taylor Rose, Conveyancing Costs 2026", url: "https://www.taylor-rose.co.uk/posts/Typical-Costs-Conveyancing-2026", fetched: VERIFIED },
    ],
  },

  {
    slug: "eicr-cost-when-buying-a-house-uk",
    title: "EICR Cost UK (2026): £100 to £300 for an Electrical Safety Certificate",
    h1: "How Much Does an EICR Cost When Buying a House?",
    description:
      "An EICR (electrical installation condition report) costs £100 to £300 for a typical home in 2026, around £200 on average. Prices by property size, when buyers should get one, and how it differs from a survey.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "specialist-surveys",
    quickAnswer:
      "£100 to £300 for a domestic EICR in 2026, around £200 on average. A one-bed flat is £80 to £150; a four-bed house £200 to £300. Homeowners are not legally required to have one, but it is the only way to know the wiring's real condition before you buy.",
    shortAnswer:
      "An EICR, the electrical installation condition report often called an electrical safety certificate, costs £100 to £300 for a typical UK home in 2026, with an average around £200. Checkatrade quotes £100 to £250; TestFast's 2026 table runs from £80 to £150 for a one-bed flat to £250 to £350 for a five-bed house, with London 20% or more above the national average. Prices checked 11 September 2026.",
    table: {
      caption: "EICR cost by property size (UK, checked 11 September 2026)",
      columns: ["Property", "Typical cost", "Time on site"],
      rows: [
        ["1-bed flat", "£80 to £150", "1 to 2 hours"],
        ["2-bed house", "£120 to £200", "2 to 3 hours"],
        ["3-bed house", "£150 to £250", "2 to 4 hours"],
        ["4-bed house", "£200 to £300", "3 to 5 hours"],
        ["5+ bed house", "£250 to £350", "4 to 6 hours"],
        ["London premium", "£200 to £300 for a typical home, 20%+ above average", "TestFast regional table"],
        ["Checkatrade national range", "£100 to £250, average £200", "Fixed price, not hourly"],
      ],
    },
    sections: [
      {
        heading: "What an EICR is and what it is not",
        paras: [
          "An EICR is a formal inspection and test of a property's fixed wiring by a qualified electrician: the consumer unit, circuits, sockets, switches and earthing. It grades every defect (C1 danger present, C2 potentially dangerous, C3 improvement recommended, FI further investigation) and gives an overall satisfactory or unsatisfactory result. It is not a certificate that the electrics are new, and it does not cover appliances.",
          "It is also not part of a RICS survey. A Level 2 or Level 3 surveyor will look at the consumer unit and note visible problems, but they do not test circuits. If the survey says \"the electrical installation should be tested by a qualified electrician\", the EICR is that test. See the guide to [RICS survey cost](/blog/rics-survey-cost-uk) for what the survey does and does not cover.",
        ],
      },
      {
        heading: "When a buyer should pay for one",
        paras: [
          "Homeowners are not legally required to have an EICR. Landlords in England are: the Electrical Safety Standards in the Private Rented Sector Regulations 2020 require an EICR at least every five years, and gov.uk confirms the same five-year rule now extends to the social rented sector. If you are buying to let, you will need a valid report before the tenancy starts anyway.",
          "For an owner-occupier, the cases that justify £100 to £300 are: a property last rewired more than 25 years ago, an old fuse box with no RCD protection, visible DIY wiring, a survey comment recommending testing, or any plan to extend or renovate. A C1 or C2 finding is a straight negotiating item because the seller would face the same with any buyer.",
        ],
      },
      {
        heading: "Why the price varies so much",
        bullets: [
          "Circuit count drives time on site. TestFast's table pairs a one-bed flat with 4 to 6 circuits and a five-bed house with 14 to 20 or more.",
          "Region: London runs £200 to £300 for a typical home against £100 to £180 in the North, per TestFast's 2026 regional table.",
          "Access: boarded-in consumer units, loft wiring and outbuildings add time.",
          "Remedial work is always quoted separately once the report identifies defects. A satisfactory report costs the fee; an unsatisfactory one starts a second conversation.",
          "Checkatrade prices EICRs as a fixed job, not hourly, so ask for a fixed quote rather than a day rate (£250 to £500 per Checkatrade).",
        ],
      },
      {
        heading: "How to save",
        paras: [
          "Ask the seller first. A landlord seller must already hold an EICR under five years old, and any seller who has had recent electrical work should have an Electrical Installation Certificate for it. Either can be handed over free. If the seller has nothing and the property is older, the £100 to £300 is cheap against a rewire that runs into thousands.",
          "Book the EICR at the same time as any other specialist survey to share the access arrangements, and if you are buying to let, combine it with the [gas safety certificate](/blog/gas-safety-certificate-cost-uk) visit where the same firm offers both.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does an EICR cost in 2026?",
        a: "£100 to £300 for a typical UK home, around £200 on average. Small flats start at about £80 to £150 and large houses reach £250 to £350. London is 20% or more above the national average.",
      },
      {
        q: "Do I need an EICR to buy a house?",
        a: "No. There is no legal requirement for an owner-occupier to have one, and lenders do not normally ask for it. Landlords do need one: rented homes in England must have an EICR at least every five years.",
      },
      {
        q: "Does a house survey include an electrical test?",
        a: "No. RICS Level 2 and Level 3 surveys are visual. The surveyor will note the age and condition of the consumer unit and any obvious defects but will not test circuits, and will usually recommend an EICR if the installation looks old.",
      },
      {
        q: "What happens if the EICR is unsatisfactory?",
        a: "The report lists coded defects. C1 and C2 items make the installation unsatisfactory and need remedial work, which is quoted separately. For a buyer this is a negotiating point: ask the seller to fix the items or reduce the price by the quoted cost.",
      },
      {
        q: "How long is an EICR valid?",
        a: "The electrician recommends the next inspection date on the report, commonly five years for a domestic property. For rented homes in England the legal maximum interval is five years.",
      },
    ],
    related: ["gas-safety-certificate-cost-uk", "rics-survey-cost-uk", "do-i-need-a-survey-when-buying-a-house", "asbestos-survey-cost-uk"],
    sources: [
      { label: "Checkatrade, Electrical Safety Check Costs in the UK 2026", url: "https://www.checkatrade.com/blog/cost-guides/electrical-safety-check-cost/", fetched: VERIFIED },
      { label: "TestFast, EICR Cost Guide UK 2026", url: "https://testfast.uk/blog/eicr-cost-guide-uk-2026", fetched: VERIFIED },
      { label: "Total Skills, EICR Cost UK 2026", url: "https://www.totalskills.co.uk/guides/eicr-cost-guide", fetched: VERIFIED },
      { label: "gov.uk, Electrical safety standards in the private rented sector", url: "https://www.gov.uk/government/publications/electrical-safety-standards-in-the-private-rented-sector-guidance-for-landlords-tenants-and-local-authorities", fetched: VERIFIED },
    ],
  },

  {
    slug: "gas-safety-certificate-cost-uk",
    title: "Gas Safety Certificate Cost UK (2026): £60 to £90 for a CP12",
    h1: "How Much Does a Gas Safety Certificate Cost?",
    description:
      "A gas safety certificate (CP12) costs £60 to £90 in 2026, around £80 on average, plus £10 to £20 per extra appliance. Who legally needs one, what buyers should ask the seller for, and how to save.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "specialist-surveys",
    quickAnswer:
      "£60 to £90 for a single-boiler property in 2026, around £80 on average, with £10 to £20 added per extra gas appliance. Only landlords are legally required to hold one, renewed every 12 months.",
    shortAnswer:
      "A gas safety certificate, officially a Landlord Gas Safety Record and commonly called a CP12, costs £60 to £90 in the UK in 2026, with an average of around £80 according to Checkatrade. Each additional gas appliance adds £10 to £15 (Checkatrade) or £10 to £20 (Logbook), so a home with a boiler, hob and gas fire typically lands at £80 to £120. London and the South East are higher. Prices checked 11 September 2026.",
    table: {
      caption: "Gas safety certificate costs (UK, checked 11 September 2026)",
      columns: ["Item", "Typical cost", "Source"],
      rows: [
        ["CP12, single appliance (boiler only)", "£60 to £90, average £80", "Checkatrade (updated June 2026), Logbook"],
        ["Each additional appliance", "£10 to £15 (Checkatrade) or £10 to £20 (Logbook)", "Both"],
        ["Boiler, hob and gas fire", "£80 to £120", "Logbook"],
        ["London and South East", "Add 15 to 30%", "Logbook"],
        ["Renewal interval for landlords", "Every 12 months", "gov.uk"],
      ],
    },
    sections: [
      {
        heading: "Who actually needs a gas safety certificate",
        paras: [
          "Only landlords are legally required to hold one. gov.uk's private renting guidance is explicit: a landlord must have a Gas Safe registered engineer do an annual gas safety check on each appliance and flue, and give the tenant a copy before they move in or within 28 days of the check. An owner-occupier has no such duty, and a mortgage lender will not ask for a certificate on a purchase.",
          "That changes the question for a buyer. If you are buying to let, the CP12 is a fixed running cost you will pay every year from day one. If you are buying to live in, the certificate is optional, but the underlying check, is the boiler safe and the flue sound, is still worth £60 to £90 on an older installation.",
        ],
      },
      {
        heading: "What the check covers",
        bullets: [
          "Every gas appliance the landlord supplies: boiler, hob, oven, gas fire, water heater.",
          "Flues and chimneys, for correct operation and no spillage of combustion products.",
          "Pipework, for tightness (a leak test) and adequate ventilation.",
          "Safety devices and the operating pressure and heat input of each appliance.",
          "It is not a boiler service. A service is a separate maintenance job, though many engineers offer both in one visit for a bundled price.",
        ],
      },
      {
        heading: "What buyers should ask for",
        paras: [
          "If the seller is a landlord, ask for the current CP12 and the last two years' records. Gaps or repeated \"at risk\" or \"immediately dangerous\" classifications on old records tell you how the installation has been looked after. If the seller is an owner-occupier, ask for the boiler service history instead; there will be no certificate to show.",
          "A boiler that fails a safety check is a negotiating item, not necessarily a deal-breaker. A replacement boiler costs far more than the £60 to £90 check, so the check is cheap insurance on any property where the boiler is more than ten years old. The same logic applies to the [EICR](/blog/eicr-cost-when-buying-a-house-uk) for the electrics.",
        ],
      },
      {
        heading: "How to save",
        bullets: [
          "Bundle the check with a boiler service. Both sources note engineers price the pair lower than two separate visits.",
          "Count appliances before you book, so the quote covers everything and there is no per-appliance surprise on the day.",
          "Landlords with more than one property should ask for a block-booking rate.",
          "Use the Gas Safe Register to verify the engineer's ID card. Logbook's guide points out that a certificate from an unregistered engineer is worthless, and for a landlord it can invalidate a Section 21 notice.",
          "Outside London, expect the lower end of the range; Logbook puts the London and South East premium at 15 to 30%.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much is a gas safety certificate in 2026?",
        a: "£60 to £90 for a property with one gas appliance, around £80 on average, with £10 to £20 added for each extra appliance. A three-appliance home is usually £80 to £120. London and the South East cost more.",
      },
      {
        q: "Do I need a gas safety certificate when buying a house?",
        a: "Not as an owner-occupier. The legal duty is on landlords, who must have an annual check by a Gas Safe registered engineer and give tenants the record. If you are buying to let, you will need a certificate before the tenancy starts.",
      },
      {
        q: "How long does a gas safety certificate last?",
        a: "Twelve months. gov.uk requires landlords to have the check done annually on each appliance and flue, and to give tenants a copy within 28 days of the check.",
      },
      {
        q: "Is a gas safety check the same as a boiler service?",
        a: "No. The safety check confirms the appliance and flue are safe to use. A service is maintenance, cleaning and adjustment. Many engineers do both in one visit at a bundled price.",
      },
      {
        q: "Can the seller give me their gas safety certificate?",
        a: "Yes, if they are a landlord they will have one and should hand it over with the tenancy paperwork. An owner-occupier seller will not have a certificate; ask for the boiler service history instead.",
      },
    ],
    related: ["eicr-cost-when-buying-a-house-uk", "rics-survey-cost-uk", "cost-of-buying-a-house-uk"],
    sources: [
      { label: "Checkatrade, Gas Safety Certificate Cost UK (2026 Guide), last updated June 2026", url: "https://www.checkatrade.com/blog/cost-guides/gas-safety-certificate-cost/", fetched: VERIFIED },
      { label: "Logbook, Gas Safety Certificate Cost UK 2026, updated 19 August 2026", url: "https://www.logbook.co.uk/gas-safety-certificate-cost-uk/", fetched: VERIFIED },
      { label: "gov.uk, Private renting: your landlord's safety responsibilities", url: "https://www.gov.uk/private-renting/your-landlords-safety-responsibilities", fetched: VERIFIED },
    ],
  },

  {
    slug: "cctv-drain-survey-cost-uk",
    title: "CCTV Drain Survey Cost UK (2026): £90 to £450, Homebuyer Survey £250+",
    h1: "How Much Does a CCTV Drain Survey Cost?",
    description:
      "A CCTV drain survey costs £90 to £450 in 2026: a basic look-and-see is £85 to £235, a full survey with a written report £200 to £350, and a pre-purchase homebuyer drain survey around £250 to £350. When buyers need one and how to avoid paying twice.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "specialist-surveys",
    quickAnswer:
      "A homebuyer CCTV drain survey costs about £250 to £350 in 2026. Basic camera checks start around £85 to £235; large properties run £350 to £450. Worth it on older houses, properties with trees close to the drains, or anywhere a survey mentions damp at low level.",
    shortAnswer:
      "A CCTV drain survey costs £90 to £450 in the UK in 2026 depending on the type. Checkatrade prices a basic survey at £85 to £235 (average £160), a full survey with a written report at £200 to £350 (average £275) and a large-property survey at £350 to £450. MyJobQuote puts the average pre-purchase homebuyer drain survey at £250 to £350. Excavation to reach a drain adds £100 to £300. Prices checked 11 September 2026.",
    table: {
      caption: "CCTV drain survey costs (UK, checked 11 September 2026)",
      columns: ["Survey type", "Typical cost", "Source"],
      rows: [
        ["Basic CCTV survey (no written report)", "£85 to £235, average £160", "Checkatrade"],
        ["Full CCTV survey with written report and footage", "£200 to £350, average £275", "Checkatrade"],
        ["Homebuyer (pre-purchase) drain survey", "£250 to £350", "MyJobQuote"],
        ["Large property", "£350 to £450", "Checkatrade, MyJobQuote"],
        ["Ground excavation to locate or reach a drain", "£100 to £300 extra", "Checkatrade, MyJobQuote"],
        ["Jetting or cleaning if needed", "£100 to £150 extra", "MyJobQuote"],
        ["Budget quotes seen", "Look-and-see £60 to £140; full report £70 to £220", "homecosts.co.uk"],
      ],
    },
    sections: [
      {
        heading: "What a drain survey shows that a house survey cannot",
        paras: [
          "A RICS Level 2 or Level 3 surveyor lifts inspection chamber covers where they can and looks in. They do not run a camera through the pipes. A CCTV drain survey does: a technician feeds a camera along every accessible run and records cracks, displaced joints, root ingress, collapsed sections and misconnections, then maps the layout. The full version comes with a written report and the footage, which is what you need if you intend to negotiate or claim on insurance.",
          "Drainage problems are expensive precisely because they are underground. MyJobQuote's guide puts a drain line repair at around £850 and a new soakaway at £500 to £1,000, and a full collapse under a driveway costs far more. Against that, £250 to £350 for a homebuyer survey is cheap.",
        ],
      },
      {
        heading: "When a buyer should order one",
        bullets: [
          "Pre-1950 property, where clay pipes and old joints are common.",
          "Mature trees within a few metres of the drain runs, especially willow, poplar and oak.",
          "The survey or your own viewing notes damp at low level, gurgling, slow drains or a persistent smell.",
          "Any sign of ground movement: cracked paths, sunken patios, hollow-sounding areas near manholes.",
          "Extensions built over or near old drains, where build-over consent may never have been obtained.",
          "You want the drains insured. Some insurers will not cover pre-existing defects, so a clean survey at purchase protects a later claim.",
        ],
      },
      {
        heading: "Shared and public drains",
        paras: [
          "Since 2011 most shared drains and lateral drains outside the property boundary in England and Wales belong to the water company, so a defect there is its problem rather than yours. Your solicitor's [drainage and water search](/blog/drainage-and-water-search-cost-uk) confirms whether the property is on a public sewer and where the boundary of responsibility falls, but it does not inspect the pipes. The two documents answer different questions.",
          "If the property is on a septic tank or treatment plant rather than mains drainage, a camera survey of the pipework is only half the job; the tank itself needs inspecting. See the guide to [sewer connection cost](/blog/sewer-connection-cost-uk) if you are weighing a connection to the mains.",
        ],
      },
      {
        heading: "How to save",
        bullets: [
          "Ask for a homebuyer survey with a written report, not a basic look-and-see. The cheaper version gives you no evidence to negotiate with.",
          "Confirm the price includes footage and a drainage plan. Both Checkatrade and MyJobQuote list these as what separates the £275 average full survey from the £160 basic one.",
          "Ask whether jetting is included or extra. MyJobQuote and homecosts both flag it as a common add-on of £100 to £150.",
          "Get the excavation risk quoted up front if there are no visible inspection chambers; locating and digging to a drain adds £100 to £300.",
          "Use the report. A written defect list with repair estimates is a direct price-reduction argument that most sellers accept rather than lose the sale.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a CCTV drain survey cost in 2026?",
        a: "A basic camera survey is £85 to £235 and a full survey with a written report £200 to £350, according to Checkatrade. A homebuyer pre-purchase survey averages £250 to £350 (MyJobQuote). Large properties run £350 to £450.",
      },
      {
        q: "Is a drain survey worth it when buying a house?",
        a: "On an older property, or one with trees near the drains or any sign of damp or slow drainage, yes. Drain repairs typically run from around £850 for a line repair upward, and a written survey gives you the evidence to negotiate the price.",
      },
      {
        q: "Does a house survey include the drains?",
        a: "Only visually. A RICS surveyor lifts accessible inspection covers and looks in but does not run a camera through the pipes. A CCTV drain survey is a separate specialist job.",
      },
      {
        q: "What extra costs can a drain survey involve?",
        a: "Excavation to locate or reach a drain adds £100 to £300, and jetting to clear a blockage so the camera can pass adds around £100 to £150. Ask for both to be quoted up front.",
      },
      {
        q: "Who is responsible for shared drains?",
        a: "In England and Wales, most shared drains and lateral drains outside the property boundary have been the water company's responsibility since 2011. Drains serving only your property within its boundary are yours.",
      },
    ],
    related: ["drainage-and-water-search-cost-uk", "sewer-connection-cost-uk", "structural-engineer-report-cost-uk", "rics-survey-cost-uk"],
    sources: [
      { label: "Checkatrade, CCTV Drain Survey Cost Breakdown 2026", url: "https://www.checkatrade.com/blog/cost-guides/cctv-drain-survey-cost/", fetched: VERIFIED },
      { label: "MyJobQuote, Drain Survey Cost Guide 2026", url: "https://www.myjobquote.co.uk/costs/drain-survey-cost", fetched: VERIFIED },
      { label: "homecosts.co.uk, CCTV Drain Survey Cost and Prices 2026", url: "https://homecosts.co.uk/cctv-drain-survey-cost/", fetched: VERIFIED },
    ],
  },

  {
    slug: "party-wall-surveyor-cost-uk",
    title: "Party Wall Surveyor Cost UK (2026): £150 to £200 an Hour, £1,000 Award",
    h1: "How Much Does a Party Wall Surveyor Cost?",
    description:
      "A party wall surveyor costs £150 to £200 an hour in 2026 and a party wall award around £1,000 with one agreed surveyor, or £900 to £2,700 by project type. Two surveyors double it. When buyers need one and how to keep the cost down.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "specialist-surveys",
    quickAnswer:
      "Around £1,000 for a party wall award with a single agreed surveyor in 2026; £900 to £2,700 depending on the project, and double that if you and the neighbour appoint separate surveyors. Surveyors charge roughly £150 to £200 an hour. If your neighbour consents in writing, no surveyor is needed at all.",
    shortAnswer:
      "A party wall surveyor costs £150 to £200 an hour according to the HomeOwners Alliance, with Checkatrade quoting an average of £200 and a range of £90 to £450. A party wall award costs around £1,000 with one agreed surveyor; Checkatrade's project ranges run from £900 to £1,200 for a loft conversion to £1,800 to £2,700 for a basement, and double when each side appoints its own surveyor. The building owner pays. Prices checked 11 September 2026.",
    table: {
      caption: "Party wall surveyor costs (UK, checked 11 September 2026)",
      columns: ["Item", "Typical cost", "Source"],
      rows: [
        ["Surveyor hourly rate", "£150 to £200 (HOA); £90 to £450, average £200 (Checkatrade)", "Both"],
        ["Party wall award, single agreed surveyor", "Around £1,000", "HOA, Checkatrade"],
        ["Loft conversion, single surveyor", "£900 to £1,200", "Checkatrade"],
        ["Extension, single surveyor", "£1,200 to £1,500", "Checkatrade"],
        ["New build, single surveyor", "£1,500 to £1,800", "Checkatrade"],
        ["Basement, single surveyor", "£1,800 to £2,700", "Checkatrade"],
        ["Two surveyors (one each side)", "£1,800 to £5,400 across the same project types", "Checkatrade"],
        ["Neighbour consents in writing", "£0, no surveyor required", "gov.uk guidance"],
      ],
    },
    sections: [
      {
        heading: "Why this matters to a buyer",
        paras: [
          "Party wall costs are a home-improvement expense, not a purchase cost, but they land on buyers in two ways. First, if you are buying with a loft conversion, side-return extension or basement in mind, the party wall process is part of the real budget and the timeline: notices must be served before work starts, and a dissenting neighbour triggers the award. Second, if the seller has already done work to a shared wall, you want to see the award or the written consent; work done without either can leave you inheriting a dispute.",
          "The gov.uk Party Wall etc. Act 1996 guidance sets out the notice periods and the appointment of surveyors. The Act applies in England and Wales to work on a shared wall, building on the boundary, and excavations within three or six metres of a neighbour's structure depending on depth.",
        ],
      },
      {
        heading: "One surveyor or two",
        paras: [
          "The cost turns almost entirely on how your neighbour responds. If they consent in writing within 14 days of the notice, no surveyor is needed and the cost is nil. If they dissent, either both sides agree a single surveyor (the cheaper route, around £1,000 for the award) or each appoints their own, and Checkatrade's figures show the total roughly doubling to £1,800 to £5,400 depending on the project.",
          "The building owner, the person doing the work, pays both surveyors in the normal course. A neighbour has no incentive to keep costs down, which is why a friendly conversation before serving the notice is worth more than any other saving here.",
        ],
      },
      {
        heading: "What the award covers",
        bullets: [
          "A schedule of condition of the neighbouring property before work starts, so any damage is measurable.",
          "The permitted works, working hours and access arrangements.",
          "Who pays for what, including making good any damage.",
          "The mechanism for disputes during the work.",
          "It is a legal document. Keep it with the deeds; a future buyer will ask for it.",
        ],
      },
      {
        heading: "How to keep the cost down",
        bullets: [
          "Talk to the neighbour before the formal notice and show them the drawings. Consent costs nothing; dissent costs £1,000 or more.",
          "Propose an agreed single surveyor in the notice letter, with a name and their hourly rate.",
          "Ask for a fixed fee for the award rather than an open hourly rate. Checkatrade's £90 to £450 hourly range is wide enough to matter.",
          "Serve notices early. Delays while surveyors are appointed can hold up a building contract and cost more than the award.",
          "Check the planning side first. If the work is in a conservation area or the house is listed, the [listed building](/guides/listed-building-grades) and Article 4 constraints may shape the design before the party wall process starts.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a party wall surveyor cost in 2026?",
        a: "Surveyors charge about £150 to £200 an hour according to the HomeOwners Alliance, with Checkatrade's average at £200 and a range of £90 to £450. A full party wall award with one agreed surveyor is around £1,000.",
      },
      {
        q: "How much is a party wall agreement?",
        a: "Around £1,000 with a single agreed surveyor. By project, Checkatrade quotes £900 to £1,200 for a loft conversion, £1,200 to £1,500 for an extension and £1,800 to £2,700 for a basement, roughly doubling if each side appoints its own surveyor.",
      },
      {
        q: "Who pays the party wall surveyor?",
        a: "The building owner, the person carrying out the work, normally pays for both surveyors, including the neighbour's if two are appointed.",
      },
      {
        q: "Can I do a party wall agreement without a surveyor?",
        a: "Yes. If the neighbour consents to the notice in writing, no surveyor is needed. Surveyors are only appointed when the neighbour dissents or does not respond within 14 days.",
      },
      {
        q: "Does buying a house involve party wall costs?",
        a: "Not directly. The costs arise when you do work to a shared wall or near the boundary. But if the seller has done such work, ask for the award or written consent, because work done without either can leave the buyer with an unresolved dispute.",
      },
    ],
    related: ["structural-engineer-report-cost-uk", "level-3-building-survey-cost-uk", "tree-survey-cost-uk"],
    sources: [
      { label: "Checkatrade, Party Wall Surveyor Cost Guide 2026", url: "https://www.checkatrade.com/blog/cost-guides/party-wall-surveyor-cost/", fetched: VERIFIED },
      { label: "HomeOwners Alliance, Party Wall Agreement Explained 2026", url: "https://hoa.org.uk/advice/guides-for-homeowners/i-am-improving/party-wall-agreement/", fetched: VERIFIED },
      { label: "gov.uk, Party Wall etc. Act 1996 guidance", url: "https://www.gov.uk/guidance/party-wall-etc-act-1996-guidance", fetched: VERIFIED },
    ],
  },

  {
    slug: "roof-survey-cost-uk",
    title: "Roof Survey Cost UK (2026): £100 to £500, Drone Surveys From £200",
    h1: "How Much Does a Roof Survey Cost?",
    description:
      "A roof survey costs £100 to £500 in 2026, around £250 to £300 on average. A basic visual inspection is £100 to £250, a full roof survey £250 to £400 and a drone survey £200 to £350. When buyers need one beyond the RICS survey, and how to avoid scaffolding costs.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "specialist-surveys",
    quickAnswer:
      "£100 to £500 in 2026, with the average around £250 to £300. A ground-level visual check is £100 to £250, a full roof survey £250 to £400 and a drone survey £200 to £350. Scaffolding, if needed, can cost more than the survey itself.",
    shortAnswer:
      "A roof survey costs £100 to £500 in the UK in 2026. MyJobQuote puts the average at £300, with a basic visual inspection at £100 to £200, a full roof survey at £250 to £400, a drone survey at £200 to £350 and a thermal or moisture scan at £300 to £500. Checkatrade's average roof inspection is £250 and its average drone survey £200. FixMyRoof quotes £150 to £250 for a standard visual inspection. Prices checked 11 September 2026.",
    table: {
      caption: "Roof survey costs (UK, checked 11 September 2026)",
      columns: ["Survey type", "Typical cost", "Source"],
      rows: [
        ["Basic visual inspection (ground level or ladder)", "£100 to £200 (MyJobQuote); £150 to £250 (FixMyRoof)", "Both"],
        ["Full roof survey with report", "£250 to £400 (MyJobQuote); £300 to £500 (Checkatrade)", "Both"],
        ["Drone roof survey", "£200 to £350 (MyJobQuote); £200 average (Checkatrade); £200 to £400 (FixMyRoof)", "All three"],
        ["Thermal imaging or moisture scan", "£300 to £500", "MyJobQuote, FixMyRoof"],
        ["Flat roof inspection", "From £150", "Checkatrade"],
        ["PRC (precast concrete) roof survey", "£300 to £500+", "FixMyRoof"],
        ["Scaffolding if ladder access is unsafe", "£640 to £1,200 (MyJobQuote); £200 to £1,000 per week (Checkatrade)", "Both"],
      ],
    },
    sections: [
      {
        heading: "What a RICS survey already tells you about the roof",
        paras: [
          "A Level 2 homebuyer survey includes a roof check from ground level and from inside the loft where accessible, and FixMyRoof notes it typically costs £400 to £500 but does not give a dedicated roof report. A Level 3 building survey goes further, but still usually from ladders and vantage points, not from the roof itself. Read our guides to [RICS survey cost](/blog/rics-survey-cost-uk) and [Level 3 building survey cost](/blog/level-3-building-survey-cost-uk) for what each level inspects.",
          "A standalone roof survey is the answer when the surveyor writes something like \"the roof covering could not be fully inspected\" or \"a roofing contractor should report further\". Those lines are common on older or taller houses and they are the surveyor telling you a gap exists.",
        ],
      },
      {
        heading: "When it is worth paying for",
        bullets: [
          "Roof over 40 years old, slate or clay with visible slipped or missing tiles.",
          "Flat roofs of any age, which have shorter lives and hidden failure modes; thermal scanning finds trapped moisture.",
          "Damp staining on upper-floor ceilings or in the loft.",
          "Chimneys with cracked flaunching or leaning stacks; MyJobQuote prices stack removal at £1,200 to £1,400.",
          "A three-storey or steeply pitched roof the surveyor could not see properly.",
          "Non-standard construction. FixMyRoof notes lenders often require a PRC survey before approving a purchase of a precast concrete home.",
          "A full replacement on a typical three-bed semi runs £5,000 to £15,000 (FixMyRoof) or £4,250 to £7,250 average (MyJobQuote), so a £250 to £400 survey that finds it coming is cheap.",
        ],
      },
      {
        heading: "Drone versus ladders",
        paras: [
          "Drone surveys have become the default for anything that cannot be reached safely from a ladder. Checkatrade's roofing contact puts scaffolding at £200 to £1,000 a week, and MyJobQuote's range is £640 to £1,200, either of which can exceed the survey fee several times over. A drone survey at £200 to £400 captures high-resolution images of every slope, valley and chimney without any of that.",
          "The trade-off is touch. A drone cannot lift a tile or probe a soft flat-roof deck. For a suspected leak the sequence that works is drone first for the overview, then a targeted ladder or access inspection of the one area that looks wrong.",
        ],
      },
      {
        heading: "How to save",
        bullets: [
          "Get the roof section of the RICS survey first and only commission a roof survey if it flags a gap; do not pay for both blind.",
          "Ask for a written report with photos and repair estimates. A verbal opinion from a roofer quoting for the work is not evidence you can negotiate with.",
          "Choose an independent surveyor rather than a contractor who will bid for the repairs. FixMyRoof makes the same point about conflicts of interest.",
          "Specify drone access up front so no one prices scaffolding into the job.",
          "Ask about location premiums. FixMyRoof gives £180 to £220 for a visual inspection on a Manchester semi against £230 to £280 in Bromley, and 20 to 30% above national ranges in London.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a roof survey cost in 2026?",
        a: "£100 to £500, with the average around £250 to £300. A basic visual inspection is £100 to £250, a full survey with report £250 to £400 and a drone survey £200 to £350, according to MyJobQuote, Checkatrade and FixMyRoof.",
      },
      {
        q: "Does a house survey include the roof?",
        a: "Partly. A RICS Level 2 survey checks the roof from ground level and inside the loft; a Level 3 looks harder but still rarely from the roof itself. If the surveyor could not inspect the covering properly, they will recommend a separate roof survey.",
      },
      {
        q: "How much is a drone roof survey?",
        a: "About £200 to £350 for a residential roof in 2026, with Checkatrade's average at £200. Commercial drone surveys are £750 to £1,000. Drones avoid scaffolding, which can cost £200 to £1,200.",
      },
      {
        q: "Is a roof survey worth it before buying?",
        a: "If the roof is old, flat, hard to see or flagged in the survey, yes. A full roof replacement on a typical three-bed semi is £5,000 to £15,000, so a £250 to £400 survey that reveals it is coming pays for itself many times over in the negotiation.",
      },
      {
        q: "What is a PRC roof survey?",
        a: "A specialist inspection for precast reinforced concrete homes, typically £300 to £500 or more. FixMyRoof notes lenders often require one before approving a purchase of this type of property.",
      },
    ],
    related: ["rics-survey-cost-uk", "level-3-building-survey-cost-uk", "structural-engineer-report-cost-uk", "damp-survey-cost-uk"],
    sources: [
      { label: "MyJobQuote, How Much Does a Roof Survey Cost in the UK in 2026?", url: "https://www.myjobquote.co.uk/costs/roof-survey", fetched: VERIFIED },
      { label: "Checkatrade, Roof Inspection Cost Breakdown 2026", url: "https://www.checkatrade.com/blog/cost-guides/roof-inspection-cost/", fetched: VERIFIED },
      { label: "FixMyRoof, Roof Survey Cost UK 2026", url: "https://www.fixmyroof.co.uk/roof-survey-costs/", fetched: VERIFIED },
    ],
  },

  {
    slug: "mortgage-valuation-cost-uk",
    title: "Mortgage Valuation Cost UK (2026): £0 to £300, RICS Valuation £300 to £900",
    h1: "How Much Does a Mortgage Valuation Cost?",
    description:
      "A mortgage valuation costs up to £300 in 2026 and is often free with the mortgage deal; Halifax charges a flat £100 and Santander £180. An independent RICS valuation is £300 to £600 and a Red Book valuation £500 to £900+. What each is for and when you need the paid version.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "specialist-surveys",
    quickAnswer:
      "Usually £0 to £300 in 2026. Many lenders include the mortgage valuation free; where charged, the HomeOwners Alliance says to budget up to £300 (Halifax £100 flat, Santander £180). An independent RICS valuation report is £300 to £600 and a formal Red Book valuation £500 to £900 or more.",
    shortAnswer:
      "A mortgage valuation costs up to £300 in 2026 according to the HomeOwners Alliance, and is often free as part of the mortgage deal; where a lender does charge, the HomeOwners Alliance cites Halifax at a flat £100 and Santander at £180 on properties up to £2.5 million, with some lenders charging considerably more. Nivek Surveyors put a basic mortgage valuation at £150 to £350, a standard RICS valuation report at £300 to £600 and a RICS Red Book valuation at £500 to £900 or more. Prices checked 11 September 2026.",
    table: {
      caption: "Valuation costs (UK, checked 11 September 2026)",
      columns: ["Type of valuation", "Typical cost", "What it is for"],
      rows: [
        ["Lender's mortgage valuation", "Often free; up to £300 where charged (HOA)", "The lender's own check that the property secures the loan"],
        ["Halifax mortgage valuation", "Flat £100", "HOA, citing the lender's fee"],
        ["Santander mortgage valuation", "£180 on properties up to £2.5 million", "HOA, citing the lender's fee"],
        ["Desktop valuation", "£150 to £300", "Written estimate from comparables, no inspection (Nivek)"],
        ["Mortgage valuation, if commissioned privately", "£150 to £350", "Nivek"],
        ["RICS valuation report", "£300 to £600", "Shared ownership, Help to Buy, remortgage, tax planning (Nivek)"],
        ["RICS Red Book valuation", "£500 to £900+", "Probate, divorce, HMRC, court (Nivek)"],
      ],
    },
    sections: [
      {
        heading: "The mortgage valuation is for the lender, not you",
        paras: [
          "When you apply for a mortgage the lender instructs a surveyor to confirm the property is worth enough to secure the loan. That is all it does. It is frequently a drive-by or a desktop exercise, and even where the surveyor visits, you may not see the report. The HomeOwners Alliance's guidance is blunt: the valuation is a requirement of the lender, and if it charges anything you can expect to pay between £100 and £1,500 or more in some cases, though its mortgage fees table says to budget up to £300 and many deals include it free.",
          "It is not a survey. It will not tell you about damp, the roof, the wiring or subsidence. If you want to know the condition of the building you need a [RICS Level 2 or Level 3 survey](/blog/rics-survey-cost-uk), which is a separate fee of several hundred pounds.",
        ],
      },
      {
        heading: "Down valuations and what they cost you",
        paras: [
          "The valuation matters most when it comes in below your agreed price. The HomeOwners Alliance's worked example: buying at £300,000 with a £60,000 deposit needs an 80% mortgage of £240,000, but if the surveyor values the property at £250,000 the lender will only advance 80% of that, £200,000, leaving you £40,000 short. Your options are to renegotiate the price, find the difference, or challenge the valuation with comparable evidence.",
          "That is the point at which a buyer's own evidence pays off. Recent sold prices for similar properties nearby, which HomeBuyerCheck pulls from HM Land Registry in the free report, are exactly what a lender's surveyor is asked to consider on an appeal.",
        ],
      },
      {
        heading: "When you need a paid, independent valuation",
        bullets: [
          "Shared ownership staircasing, Help to Buy redemption and some remortgages, where the scheme or lender requires a RICS valuation report: £300 to £600 per Nivek.",
          "Probate, divorce settlements, capital gains or inheritance tax reporting and court proceedings, which need a Red Book valuation: £500 to £900 or more.",
          "Buying without a mortgage, where no lender valuation exists and you want an independent opinion before offering: a desktop valuation at £150 to £300 is the cheap option.",
          "Leasehold extension and freehold purchase negotiations, which use a specialist valuation rather than a mortgage one.",
        ],
      },
      {
        heading: "How to save",
        bullets: [
          "Compare deals on the whole fee package. The HomeOwners Alliance lists arrangement fees up to £1,500, booking fees up to £250 and valuation fees up to £300; a free valuation on a dearer rate is not always a saving.",
          "Do not pay for a separate valuation when you are buying with a mortgage; the lender's one is sufficient for the loan, and your money is better spent on a condition survey.",
          "If you want both, ask the lender whether its panel surveyor can upgrade the visit to a Level 2 survey on the same day. Combined visits are usually cheaper than two separate ones.",
          "Bring evidence to a down valuation rather than accepting it. Three comparable sold prices in the last six months are the standard basis for an appeal.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a mortgage valuation cost in 2026?",
        a: "Often nothing, because many lenders include it in the deal. Where charged, the HomeOwners Alliance says to budget up to £300, citing Halifax at a flat £100 and Santander at £180 on properties up to £2.5 million. Some lenders charge more on high-value properties.",
      },
      {
        q: "Is a mortgage valuation the same as a survey?",
        a: "No. The valuation confirms the property is adequate security for the loan and is for the lender. A RICS Level 2 or Level 3 survey inspects the condition of the building and is for you. Most buyers need both.",
      },
      {
        q: "How much is a RICS valuation?",
        a: "Nivek Surveyors quote £300 to £600 for a standard RICS valuation report and £500 to £900 or more for a Red Book valuation used for probate, divorce, tax or court purposes.",
      },
      {
        q: "What happens if the valuation is lower than my offer?",
        a: "The lender will lend the agreed percentage of the lower figure, leaving a gap you must fund or negotiate away. In the HomeOwners Alliance example a £50,000 down valuation on an 80% mortgage leaves the buyer £40,000 short. You can appeal with comparable sold prices.",
      },
      {
        q: "Do I need a valuation if I am a cash buyer?",
        a: "Not legally. Nobody will insist on one. A desktop valuation at £150 to £300 gives you an independent view before offering, and a condition survey tells you about the building itself.",
      },
    ],
    related: ["rics-survey-cost-uk", "homebuyer-survey-cost-uk", "cost-of-buying-a-house-uk", "solicitor-fees-for-buying-a-house-uk"],
    sources: [
      { label: "HomeOwners Alliance, Mortgage Valuations Explained", url: "https://hoa.org.uk/advice/guides-for-homeowners/i-am-buying/mortgage-valuations/", fetched: VERIFIED },
      { label: "HomeOwners Alliance, Mortgage Fees Explained", url: "https://hoa.org.uk/advice/guides-for-homeowners/i-am-buying/mortgage-fees-and-costs/", fetched: VERIFIED },
      { label: "Nivek Surveyors, House Valuation Cost UK 2026", url: "https://www.niveksurveyors.com/post/how-much-does-a-valuation-cost-in-the-uk", fetched: VERIFIED },
    ],
  },

  {
    slug: "bankruptcy-search-k16-cost-uk",
    title: "Bankruptcy Search (K16) Cost UK (2026): £6 to £7 Per Name",
    h1: "How Much Does a Bankruptcy Search (K16) Cost When Buying a House?",
    description:
      "A K16 bankruptcy search costs £6 per name online or £7 by post at HM Land Registry's Land Charges Department in 2026; solicitors' quotes still show £2 to £5. What it checks, why your lender insists on it, and the free way to check yourself.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "conveyancing-fees",
    quickAnswer:
      "£6 per name online or £7 per name by post, per the gov.uk Land Charges fee table (page updated 9 December 2024). It is a routine disbursement your solicitor runs against every buyer named on the mortgage shortly before completion.",
    shortAnswer:
      "A bankruptcy search, form K16, costs £6 per name when applied for through the HM Land Registry portal or £7 per name by post, according to the gov.uk Land Charges fees page (last updated 9 December 2024). Conveyancing firms' own guides still quote £2 to £5 per name, so expect a figure in that band on your quote. Your mortgage lender requires the search against every borrower to confirm no bankruptcy or insolvency proceedings are registered. Prices checked 11 September 2026.",
    table: {
      caption: "Bankruptcy search costs (UK, checked 11 September 2026)",
      columns: ["Item", "Cost", "Source"],
      rows: [
        ["K16 official search, online (portal or Business Gateway)", "£6 per name", "gov.uk Land Charges fees"],
        ["K16 official search, by post", "£7 per name", "gov.uk Land Charges fees"],
        ["K15 full Land Charges search (unregistered land)", "Same fee: £6 online, £7 post, per name", "gov.uk Land Charges fees"],
        ["As quoted on conveyancing estimates", "£2 to £5 per name", "Conveyancing Calculator; AWD Law £2 to £4; HOA £4; Propelr £2"],
        ["Individual Insolvency Register", "Free to search yourself", "gov.uk"],
      ],
    },
    sections: [
      {
        heading: "What the K16 search actually checks",
        paras: [
          "The K16 is an official search of the Land Charges register against a person's name, limited to bankruptcy entries. It reveals whether a bankruptcy petition or order has been registered against the buyer. It is the buyer who is searched, not the property: the lender wants to know the person it is lending to is not insolvent before the mortgage advance is released, because a bankrupt's assets vest in the trustee in bankruptcy.",
          "The full K15 search covers all Land Charges entries against a name and is used on unregistered land, where charges are registered against owners' names rather than a title number. Most residential purchases involve registered land, so the K16 is the one that appears on a buyer's completion statement.",
        ],
      },
      {
        heading: "Why the quote says £2 to £5 and gov.uk says £6 to £7",
        paras: [
          "The gov.uk fee table for HM Land Registry Land Charges services, last updated 9 December 2024, lists the K15 and K16 official search at £7 per name by post and £6 per name through the portal. The conveyancing guides we checked on the same day quote lower figures: £2 to £5 (Conveyancing Calculator), £2 to £4 (AWD Law), £4 (HomeOwners Alliance) and £2 (Propelr). Some of those guides may predate the current fee table, and some firms round or absorb small disbursements.",
          "Either way it is one of the smallest lines on a completion statement. The [conveyancing disbursements](/blog/conveyancing-disbursements-uk) that actually move the total are the search pack and the Land Registry registration fee.",
        ],
      },
      {
        heading: "Timing: the search is done late",
        bullets: [
          "The search is usually run shortly before completion, after exchange, because the lender wants the position as close to the advance as possible.",
          "Each borrower is searched separately, so a joint purchase pays twice.",
          "If a name variant or a common name throws up an entry that is not you, the solicitor files a certificate confirming it does not apply. That is routine and does not delay completion.",
          "A genuine entry is a serious problem: the lender will not release funds, and the purchase cannot proceed until the position is resolved.",
        ],
      },
      {
        heading: "How to check yourself, free",
        paras: [
          "gov.uk's Individual Insolvency Register can be searched free of charge for bankruptcies, debt relief orders and individual voluntary arrangements in England and Wales. If you have any doubt about an old debt, check it before you apply for a mortgage rather than at the point of completion, when the cost of a surprise is a collapsed purchase.",
          "The register is also useful in the other direction. If the seller is a private individual and you have any reason to think they are in financial difficulty, a free search reassures you the sale is not about to be interrupted by a trustee. For company sellers, HomeBuyerCheck's Premium report runs the equivalent check at Companies House automatically.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much is a bankruptcy search when buying a house?",
        a: "The official HM Land Registry K16 fee is £6 per name online or £7 by post, per the gov.uk Land Charges fee table. Conveyancing firms' guides quote £2 to £5 per name, so expect a figure in that band on your estimate.",
      },
      {
        q: "What is a K16 search?",
        a: "An official search of the Land Charges register against a person's name for bankruptcy entries only. It is run against each buyer named on the mortgage, usually shortly before completion, because the lender needs to know the borrower is not bankrupt.",
      },
      {
        q: "Who pays for the bankruptcy search?",
        a: "The buyer, as a disbursement on the solicitor's bill. It is required by the mortgage lender, so cash buyers may not need one at all.",
      },
      {
        q: "Can I check for bankruptcy for free?",
        a: "Yes. The Individual Insolvency Register on gov.uk is free to search and covers bankruptcies, debt relief orders and IVAs in England and Wales.",
      },
      {
        q: "What is the difference between a K15 and a K16 search?",
        a: "The K15 searches the full Land Charges register against a name and is used for unregistered land. The K16 is limited to bankruptcy entries and is the standard lender requirement on registered land. Both cost £6 online or £7 by post per name.",
      },
    ],
    related: ["conveyancing-disbursements-uk", "solicitor-fees-for-buying-a-house-uk", "land-registry-fees-when-buying-uk", "how-to-find-out-who-owns-a-property-uk"],
    sources: [
      { label: "gov.uk, HM Land Registry: Land Charges fees (last updated 9 December 2024)", url: "https://www.gov.uk/guidance/hm-land-registry-land-charges-fees", fetched: VERIFIED },
      { label: "gov.uk, Search the bankruptcy and insolvency register", url: "https://www.gov.uk/search-bankruptcy-insolvency-register", fetched: VERIFIED },
      { label: "Conveyancing Calculator, What Are Conveyancing Disbursements?", url: "https://www.conveyancingcalculator.co.uk/blog/what-are-conveyancing-disbursements/", fetched: VERIFIED },
      { label: "AWD Law, What are conveyancing disbursements?", url: "https://awdlaw.co.uk/what-are-conveyancing-disbursements/", fetched: VERIFIED },
      { label: "Propelr, Disbursements in Conveyancing", url: "https://www.propelr.co.uk/guides/disbursements-explained", fetched: VERIFIED },
    ],
  },

  {
    slug: "conveyancing-disbursements-uk",
    title: "Conveyancing Disbursements UK (2026): What They Are and What Each Costs",
    h1: "What Are Conveyancing Disbursements, and What Do They Cost?",
    description:
      "Conveyancing disbursements are the third-party costs your solicitor pays on your behalf: searches £250 to £450, Land Registry fee £20 to £1,105, bank transfer £20 to £45, ID checks £6 to £30, bankruptcy search £6 to £7. Full 2026 list with sources and what buyers versus sellers pay.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "conveyancing-fees",
    quickAnswer:
      "Disbursements are costs your solicitor pays to other people on your behalf and passes on at cost. For a buyer in 2026 they typically total around £550 on top of the legal fee: searches £250 to £450, Land Registry registration £20 to £1,105 by price band, a bank transfer fee £20 to £45, ID checks £6 to £30 a person and a bankruptcy search £6 to £7 a name.",
    shortAnswer:
      "Conveyancing disbursements are the costs your solicitor pays to third parties on your behalf, separate from their own legal fee, and passed on without mark-up. For a buyer in 2026 the main ones are the search pack (£250 to £450, HomeOwners Alliance), the HM Land Registry registration fee (£20 to £1,105 depending on price and whether it is filed online, gov.uk), the bank transfer fee (£20 to £30 HOA; £35 to £45 Propelr), anti-money-laundering ID checks (£6 to £20 HOA; £10 to £30 per person Propelr) and a bankruptcy search (£6 to £7 per name, gov.uk). Homeward Legal's worked example totals around £550. Prices checked 11 September 2026.",
    table: {
      caption: "Conveyancing disbursements for a buyer (England and Wales, checked 11 September 2026)",
      columns: ["Disbursement", "Typical cost", "Source"],
      rows: [
        ["Local authority, drainage and environmental searches", "£250 to £450", "HomeOwners Alliance; Taylor Rose £250 to £400"],
        ["HM Land Registry registration fee (Scale 1, online)", "£20 (up to £80,000) to £500 (over £1 million); £100 at £100,001 to £200,000; £150 at £200,001 to £500,000", "gov.uk, updated 28 April 2025"],
        ["HM Land Registry registration fee (Scale 1, by post)", "£45 to £1,105 across the same bands; £230 at £100,001 to £200,000; £330 at £200,001 to £500,000", "gov.uk"],
        ["Official copies of the register and title plan", "£7 each online (£11 by post), so £14 for both", "gov.uk information services fees"],
        ["Official search with priority (OS1)", "£7 online, £11 by post", "gov.uk"],
        ["Bank transfer (CHAPS / telegraphic transfer) fee", "£20 to £30 (HOA); £35 to £45 incl. VAT (Propelr); £15 to £40 (Conveyancing Calculator)", "Three sources"],
        ["Anti-money-laundering ID check", "£6 to £20 (HOA); £10 to £30 per person (Propelr)", "Two sources"],
        ["Bankruptcy search (K16)", "£6 online or £7 by post per name (gov.uk); £2 to £5 on firms' guides", "gov.uk, Conveyancing Calculator"],
        ["Property fraud (lawyer) check", "£10", "HomeOwners Alliance"],
        ["Indemnity insurance, if a title defect needs cover", "£20 to £300 one-off", "Propelr"],
        ["Worked example, all disbursements at £277,000 with a mortgage", "Around £550", "Homeward Legal"],
      ],
    },
    sections: [
      {
        heading: "Disbursements versus legal fees",
        paras: [
          "Every conveyancing quote should show two figures: the legal fee, which is the firm's charge for its own work, and disbursements, which are amounts it pays out to other organisations for you. Propelr's guide makes the practical point: a headline fee of £600 plus VAT can easily become £1,100 or more once disbursements are added, so always compare quotes on the total. The legal fee side is covered in our guide to [solicitor fees for buying a house](/blog/solicitor-fees-for-buying-a-house-uk).",
          "Disbursements are not negotiable with the solicitor because the solicitor does not set them. They are set by councils, HM Land Registry, banks and search providers. What you can do is understand which ones apply to you and avoid paying for any twice.",
        ],
      },
      {
        heading: "The ones that move the total",
        paras: [
          "Two disbursements dominate a buyer's bill. The search pack, £250 to £450 according to the HomeOwners Alliance, covers the local authority search (LLC1 and CON29), the drainage and water search and an environmental search; see [how much property searches cost](/blog/how-much-are-property-searches-when-buying) for each component. The HM Land Registry registration fee is banded by purchase price under Scale 1 of the fee order: on gov.uk's current table, filed online, it is £20 up to £80,000, £40 to £100,000, £100 to £200,000, £150 to £500,000, £295 to £1 million and £500 above that, roughly doubling if the application is lodged by post. Our guide to [Land Registry fees when buying](/blog/land-registry-fees-when-buying-uk) has the full bands.",
          "Everything else is small change by comparison: £14 for official copies of the register and plan, £7 for the priority search, £20 to £45 for the CHAPS transfer, £6 to £30 a head for identity checks and £6 to £7 a name for the bankruptcy search.",
        ],
      },
      {
        heading: "Buyer versus seller",
        bullets: [
          "Buyers pay the searches, the Land Registry registration fee, the priority search, the bankruptcy search and stamp duty (a tax paid through the solicitor rather than a disbursement in the strict sense).",
          "Sellers pay for official copies of their own title (£7 each), the CHAPS transfer of the proceeds and any mortgage redemption (£35 to £45 each per Propelr), and their own ID checks. Propelr puts a straightforward freehold seller's disbursements at £100 to £350 in total.",
          "Both sides pay anti-money-laundering ID checks, each person separately.",
          "Indemnity insurance for a title defect (£20 to £300) is usually paid by the seller but is negotiable.",
          "Leasehold buyers also face freeholder or managing-agent charges on completion (notice of transfer, notice of charge, deed of covenant, certificate of compliance), which vary by lease and should be itemised in the quote.",
        ],
      },
      {
        heading: "How to keep disbursements down",
        bullets: [
          "Ask the solicitor to file the Land Registry application electronically. The gov.uk fee is less than half the postal fee in every band.",
          "Do not order searches until you are past the point of walking away. If the purchase collapses after the searches are ordered, that £250 to £450 is spent; Propelr notes disbursements already paid out remain owed even under no-completion, no-fee terms.",
          "Screen the property before you instruct so the search money is only spent on a purchase that will proceed.",
          "Check the extras. The HomeOwners Alliance lists common add-ons of £50 to £100 for gifted-deposit paperwork, up to £60 for a Lifetime or Help to Buy ISA bonus and £120 to £240 for an unregistered property; make sure they are on the quote only if they apply.",
          "Ask whether the quoted CHAPS fee is one transfer or two. Propelr's example shows a seller paying twice, once to redeem the mortgage and once to receive the balance.",
        ],
      },
    ],
    faqs: [
      {
        q: "What are disbursements in conveyancing?",
        a: "Costs your solicitor pays to third parties on your behalf and passes on at cost, separate from their legal fee. For buyers the main ones are the search pack, the Land Registry registration fee, the bank transfer fee, identity checks and the bankruptcy search.",
      },
      {
        q: "How much are disbursements when buying a house?",
        a: "Homeward Legal's 2026 worked example at the £277,000 average price is around £550, made up mostly of searches (£250 to £450) and the Land Registry fee (£150 online in that price band). Higher-value purchases pay more because the Land Registry fee is banded by price.",
      },
      {
        q: "Are disbursements included in the solicitor's quote?",
        a: "They should be listed separately on any proper quote. Always ask for the total including VAT and disbursements; a low headline legal fee can nearly double once they are added.",
      },
      {
        q: "Do I pay disbursements if the sale falls through?",
        a: "Yes, for any already paid out, such as searches ordered before the purchase collapsed. No-completion, no-fee arrangements waive the legal fee, not the disbursements.",
      },
      {
        q: "Is stamp duty a disbursement?",
        a: "Strictly it is a tax, but it is paid through your solicitor at completion and appears on the same completion statement. It is often the largest single item, so use a stamp duty calculator early.",
      },
    ],
    related: ["solicitor-fees-for-buying-a-house-uk", "how-much-are-property-searches-when-buying", "land-registry-fees-when-buying-uk", "bankruptcy-search-k16-cost-uk", "what-is-a-search-fee-when-buying-a-house"],
    sources: [
      { label: "HomeOwners Alliance, Conveyancing Fees: What To Expect In 2026 (disbursements table)", url: "https://hoa.org.uk/advice/guides-for-homeowners/i-am-buying/much-conveyancing-fees-cost/", fetched: VERIFIED },
      { label: "gov.uk, HM Land Registry: Registration Services fees (last updated 28 April 2025)", url: "https://www.gov.uk/guidance/hm-land-registry-registration-services-fees", fetched: VERIFIED },
      { label: "gov.uk, HM Land Registry: Information Services fees (last updated 9 December 2024)", url: "https://www.gov.uk/guidance/hm-land-registry-information-services-fees", fetched: VERIFIED },
      { label: "gov.uk, HM Land Registry: Land Charges fees", url: "https://www.gov.uk/guidance/hm-land-registry-land-charges-fees", fetched: VERIFIED },
      { label: "Propelr, Disbursements in Conveyancing: What Are They?", url: "https://www.propelr.co.uk/guides/disbursements-explained", fetched: VERIFIED },
      { label: "Homeward Legal, Conveyancing Fees 2026", url: "https://www.homewardlegal.co.uk/guides-advice/post/how-much-are-average-conveyancing-fees", fetched: VERIFIED },
      { label: "Taylor Rose, Conveyancing Costs 2026", url: "https://www.taylor-rose.co.uk/posts/Typical-Costs-Conveyancing-2026", fetched: VERIFIED },
      { label: "Conveyancing Calculator, What Are Conveyancing Disbursements?", url: "https://www.conveyancingcalculator.co.uk/blog/what-are-conveyancing-disbursements/", fetched: VERIFIED },
    ],
  },

  {
    slug: "tree-survey-cost-uk",
    title: "Tree Survey Cost UK (2026): £150 to £950, Mortgage Tree Report £250 to £450",
    h1: "How Much Does a Tree Survey Cost?",
    description:
      "A tree survey costs £150 to £950 in 2026 depending on type: a mortgage or subsidence tree report £250 to £450, a condition survey £300 to £800, a BS5837 planning survey £295 to £760 for a small garden and £400 to £1,500+ as a full package. When a buyer needs one and how TPOs change the picture.",
    datePublished: "2026-09-11",
    lastVerified: VERIFIED,
    category: "cost",
    cluster: "specialist-surveys",
    quickAnswer:
      "£150 to £950 in 2026. A mortgage tree report, the one a lender asks for when a valuation notes trees near the house, is £250 to £450 (average £300). A BS5837 survey for planning is £295 to £760 for a small domestic site and £400 to £1,500 or more as a full package.",
    shortAnswer:
      "A tree survey costs £150 to £950 in the UK in 2026 according to Indigo Surveys, depending on what it is for: an initial survey averages £250, a mortgage tree report £300 (range £250 to £450), a health and safety condition survey £500 (£300 to £800) and a full arboricultural survey for planning £600 (£350 to £950). PlanWatch puts a basic BS5837 survey for a small domestic site at £295 to £760 and a full planning package at £400 to £1,500 or more. Prices checked 11 September 2026.",
    table: {
      caption: "Tree survey costs by type (UK, checked 11 September 2026)",
      columns: ["Survey type", "Typical cost", "Source"],
      rows: [
        ["Initial tree survey", "£150 to £350, average £250", "Indigo Surveys"],
        ["Mortgage tree report (lender or subsidence query)", "£250 to £450, average £300 (Indigo); around £600 (Peter Yeates)", "Both"],
        ["Health and safety condition survey", "£300 to £800, average £500 (Indigo); £400 for a domestic garden (Peter Yeates)", "Both"],
        ["BS5837 survey, small domestic site", "£295 to £760 (PlanWatch); from £500 (Peter Yeates)", "Both"],
        ["Full BS5837 planning package (survey, constraints plan, impact assessment, protection plan)", "£400 to £1,500+ (PlanWatch); £350 to £950, average £600 (Indigo)", "Both"],
        ["Arboricultural impact assessment as an add-on", "From around £200", "PlanWatch"],
        ["Decay detection and diagnostics", "£400 to £600", "Indigo Surveys"],
      ],
    },
    sections: [
      {
        heading: "The three reasons a buyer ends up paying for one",
        paras: [
          "The first is the lender. If the mortgage valuation notes a large tree close to the house, particularly on shrinkable clay, the lender may ask for an arboricultural report on the subsidence risk before it confirms the offer. Indigo prices that mortgage tree report at £250 to £450; Peter Yeates quotes around £600 for a subsidence-focused report depending on tree count. This is the same trigger that produces a [structural engineer's report](/blog/structural-engineer-report-cost-uk) when cracking has already appeared.",
          "The second is planning. If you are buying with an extension in mind and there are trees on or near the plot, the council will expect a BS5837 tree survey with the application: £295 to £760 for a simple garden per PlanWatch, rising to £400 to £1,500 or more once a constraints plan, impact assessment and protection plan are needed. The third is safety: a large or old tree overhanging the house, a neighbour's property or a road is a duty-of-care liability from the day you complete, and a condition survey at £300 to £800 tells you what needs doing.",
        ],
      },
      {
        heading: "Tree Preservation Orders and conservation areas",
        paras: [
          "A tree survey does not tell you whether you are allowed to touch the tree. That is a planning question. A Tree Preservation Order (TPO) makes it an offence to fell, top, lop or uproot the tree without the council's consent, and every tree over a small trunk diameter in a conservation area needs six weeks' notice to the council before work. Indigo's guide notes fines can reach £20,000 per offence under the Town and Country Planning Act 1990.",
          "HomeBuyerCheck's Premium report flags TPOs and conservation area designations from planning.data.gov.uk for the address, which is the first thing to check before you budget for either removing a tree or building near one. Our guide to [buying in a conservation area](/guides/conservation-area-buyers-guide) covers the wider restrictions, including Article 4 directions.",
        ],
      },
      {
        heading: "What drives the price",
        bullets: [
          "Tree count. PlanWatch's £295 to £500 bracket is a short site visit and a concise schedule; fifteen trees along two boundaries pushes into the £1,000 to £1,500 package.",
          "Which documents the council asks for. The survey alone is rarely enough for planning; the impact assessment and protection plan are separate deliverables.",
          "Purpose. A mortgage report answers one question about one or two trees; a condition survey inspects everything on the plot.",
          "Diagnostics. Decay detection with specialist equipment is £400 to £600 on top.",
          "Regional rates. Indigo notes most surveys start from £200, and travel adds to rural jobs.",
        ],
      },
      {
        heading: "How to save",
        bullets: [
          "Ask the seller for any existing survey. A BS5837 report from a previous planning application, or an arboricultural report from an insurance claim, may still be usable.",
          "Check for TPOs and conservation area status before commissioning anything, so you do not pay for a survey of a tree you cannot remove or a scheme that will not get consent.",
          "Match the survey to the question. A lender's subsidence query needs a mortgage tree report, not a full BS5837 package.",
          "Combine the visit. An arboriculturalist can produce the condition survey and the planning survey from one site visit if you ask up front.",
          "Get the removal cost quoted at the same time if the report recommends felling. Indigo's guide gives £240 to £340 for a small tree and £1,190 or more for a large one, plus £160 to £710 for stump removal, which is the number that matters for the negotiation.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a tree survey cost in 2026?",
        a: "£150 to £950 depending on the type. Indigo Surveys averages £250 for an initial survey, £300 for a mortgage tree report, £500 for a condition survey and £600 for a full arboricultural survey. PlanWatch puts a basic BS5837 planning survey at £295 to £760 and a full package at £400 to £1,500 or more.",
      },
      {
        q: "Why does my mortgage lender want a tree survey?",
        a: "Because a large tree close to the house, especially on clay soil, is a subsidence risk. The lender wants an arboriculturalist's opinion on whether the tree threatens the foundations before it confirms the loan. This report typically costs £250 to £450.",
      },
      {
        q: "What is a BS5837 tree survey?",
        a: "The British Standard survey used for planning applications. It records every tree on and near the site with its root protection area, and is usually accompanied by a tree constraints plan, an arboricultural impact assessment and a tree protection plan. Expect £295 to £760 for a small garden and £400 to £1,500 or more for the full package.",
      },
      {
        q: "Can I remove a tree after I buy the house?",
        a: "Only if it is not protected. Trees under a Tree Preservation Order need council consent, and trees in a conservation area need six weeks' notice. Breaches can attract fines of up to £20,000 per offence. Check the designations before you plan any work.",
      },
      {
        q: "Does a house survey cover trees?",
        a: "A RICS surveyor will note trees close to the building and any cracking that might be linked to them, but will not assess the trees themselves. If the survey or valuation raises the point, an arboriculturalist's report is the follow-up.",
      },
    ],
    related: ["structural-engineer-report-cost-uk", "party-wall-surveyor-cost-uk", "rics-survey-cost-uk", "japanese-knotweed-survey-cost-uk"],
    sources: [
      { label: "Indigo Surveys, Tree Survey Cost UK 2026", url: "https://indigosurveys.co.uk/tree-survey-cost/", fetched: VERIFIED },
      { label: "PlanWatch, How Much Does a Tree Survey Cost in 2026?", url: "https://planwatch.co.uk/tree-surveys/how-much-does-a-tree-survey-cost", fetched: VERIFIED },
      { label: "Peter Yeates Arboriculture, How Much Does a Tree Survey Cost? UK Guide (2026)", url: "https://www.peteryeatesarb.co.uk/tree-survey-cost/", fetched: VERIFIED },
    ],
  },
];
