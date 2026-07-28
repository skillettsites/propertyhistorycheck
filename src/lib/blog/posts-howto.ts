import type { BlogPost } from "./types";

export const posts_howto: BlogPost[] = [
  {
    slug: "how-to-check-if-a-house-is-in-a-flood-zone",
    title: "How to Check if a House Is in a Flood Zone (Free + Paid)",
    h1: "How to Check if a House Is in a Flood Zone",
    description:
      "Check whether a UK house is in a flood zone for free using the Environment Agency flood map, plus how a full report adds context. Step by step.",
    datePublished: "2026-05-29",
    category: "qa",
    shortAnswer:
      "Check a flood zone for free using the Environment Agency Flood map for planning on gov.uk: enter the postcode or address and read off the flood zone. Zone 1 is low probability, Zone 2 medium and Zone 3 high. HomeBuyerCheck shows the same Environment Agency zone per address alongside crime, schools and other checks in one report.",
    table: {
      caption: "Free vs paid ways to check flood risk",
      columns: ["Method", "Cost", "What you get"],
      rows: [
        [
          "Environment Agency Flood map for planning (gov.uk)",
          "Free",
          "Flood Zone 1, 2 or 3 for rivers and the sea by postcode or address",
        ],
        [
          "Environment Agency long term flood risk service (gov.uk)",
          "Free",
          "Risk from rivers, sea, surface water and reservoirs as low to high",
        ],
        [
          "HomeBuyerCheck free report",
          "Free",
          "Environment Agency flood zone per address with crime, schools and council tax",
        ],
        [
          "Conveyancer flood search",
          "Around 20 to 60 pounds",
          "Detailed insurer style assessment ordered during conveyancing",
        ],
      ],
    },
    sections: [
      {
        heading: "Check the flood zone in five steps",
        bullets: [
          "Open the Environment Agency Flood map for planning on gov.uk.",
          "Enter the full postcode or address of the property you are buying.",
          "Read the flood zone shown on the map: Zone 1 is low probability, Zone 2 medium and Zone 3 high.",
          "Switch to the long term flood risk service to see surface water and reservoir risk, which the planning map does not cover.",
          "Save a dated screenshot so you can compare it against any flood search your conveyancer later orders.",
        ],
      },
      {
        heading: "What the flood zones mean",
        paras: [
          "The Environment Agency divides land into flood zones based on the probability of flooding from rivers and the sea, ignoring any defences that are in place. Zone 1 has a low probability, Zone 2 a medium probability and Zone 3 a high probability.",
          "A property in Zone 2 or 3 is not automatically a bad buy, but it does mean you should look closer at flood defences, past flooding and the cost and availability of buildings insurance before you commit.",
        ],
      },
      {
        heading: "Why surface water risk matters too",
        paras: [
          "The planning flood zones only cover rivers and the sea. Many UK homes that flood are hit by surface water, which is rainwater that cannot drain away fast enough. The Environment Agency long term flood risk service rates surface water risk separately, so always check both maps for the same address.",
        ],
      },
      {
        heading: "Where HomeBuyerCheck fits in",
        paras: [
          "These free sources are reliable but scattered across different gov.uk tools. HomeBuyerCheck pulls the Environment Agency flood zone for a specific address into one report alongside crime, schools, EPC, council tax and recent sales, so you can read the flood picture in context rather than tab hopping. The free report covers the flood zone, and the paid tiers add ground risk, radon and ownership checks.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is checking a flood zone free in the UK?",
        a: "Yes. The Environment Agency Flood map for planning and the long term flood risk service on gov.uk are both free to use by postcode or address. HomeBuyerCheck also shows the Environment Agency flood zone for an address in its free report.",
      },
      {
        q: "What is the difference between Flood Zone 2 and Flood Zone 3?",
        a: "Flood Zone 2 is a medium probability of flooding from rivers or the sea, while Flood Zone 3 is a high probability. Both ignore the effect of existing flood defences, so a defended property can still sit in Zone 3.",
      },
      {
        q: "Does a flood zone affect a mortgage or insurance?",
        a: "It can. Lenders and insurers look at flood risk, and homes in higher risk zones may face higher premiums or need the Flood Re scheme. Checking the zone early lets you get an insurance quote before you are committed.",
      },
      {
        q: "Can a house in Zone 1 still flood?",
        a: "Yes. Zone 1 only describes river and sea flood probability. Surface water flooding from heavy rain can affect Zone 1 homes, which is why you should also check the long term flood risk service.",
      },
    ],
    related: [
      "is-it-safe-to-buy-a-house-in-a-flood-zone",
      "what-checks-before-buying-a-house",
      "how-to-check-a-property-before-buying",
    ],
  },
  {
    slug: "how-to-find-out-who-owns-a-property-uk",
    title: "How to Find Out Who Owns a Property in the UK",
    h1: "How to Find Out Who Owns a Property in the UK",
    description:
      "Find the legal owner of any UK property for £7 with the HM Land Registry title register. Step by step, plus how to spot a corporate or overseas owner.",
    datePublished: "2026-05-29",
    category: "qa",
    shortAnswer:
      "To find out who owns a UK property, download the title register from HM Land Registry on gov.uk for 7 pounds. The register names the registered legal owner and shows the price paid where recorded. HomeBuyerCheck Premium goes further by flagging corporate or overseas ownership using HM Land Registry CCOD and OCOD datasets.",
    table: {
      caption: "Ways to find a UK property owner",
      columns: ["Method", "Cost", "What it shows"],
      rows: [
        [
          "HM Land Registry title register (gov.uk)",
          "7 pounds",
          "The registered legal owner and price paid where recorded",
        ],
        [
          "HM Land Registry title plan (gov.uk)",
          "7 pounds",
          "The boundary of the registered land",
        ],
        [
          "HomeBuyerCheck Premium",
          "From 4.99 pounds",
          "Flags corporate and overseas ownership from HMLR CCOD and OCOD data",
        ],
        [
          "Ask the estate agent or seller",
          "Free",
          "Informal confirmation, but not a legal record",
        ],
      ],
    },
    sections: [
      {
        heading: "Find the owner in four steps",
        bullets: [
          "Go to the Search for land and property information service on gov.uk and enter the address.",
          "Select the property and choose to download the title register, which currently costs 7 pounds.",
          "Read the proprietorship section of the register, which names the registered legal owner.",
          "If you also want the boundary, download the matching title plan for 7 pounds.",
        ],
      },
      {
        heading: "What the title register tells you",
        paras: [
          "The HM Land Registry title register is the official record of who owns a registered property in England and Wales. It names the legal owner, shows any restrictions or charges such as a mortgage, and often records the price paid on the last sale.",
          "A small number of older properties are unregistered, in which case there will be no register and ownership has to be proved with the original title deeds held by the owner or their solicitor.",
          "The £7 register is a one-off download you can order yourself. It is separate from the conveyancing searches your solicitor orders later, which run to £250 to £450 on top of the legal fee; the [conveyancing cost calculator](/conveyancing-cost-calculator) totals both for your purchase price.",
        ],
      },
      {
        heading: "Spotting corporate and overseas owners",
        paras: [
          "Some homes are owned by a company rather than an individual, and some by an overseas company. HM Land Registry publishes the Commercial and Corporate Ownership Data and the Overseas Companies Ownership Data for this. HomeBuyerCheck Premium checks these datasets and flags when an address is owned by a corporate or overseas entity, which can matter for leasehold blocks, recent flips and freehold ground rent arrangements.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does it cost to find out who owns a property?",
        a: "Downloading the HM Land Registry title register on gov.uk costs 7 pounds, and the title plan is 7 pounds too. There is no charge to ask the estate agent, but only the register is an official legal record.",
      },
      {
        q: "Can I find a property owner for free?",
        a: "You cannot get the official owner name for free from HM Land Registry, as the title register carries a small fee. You can ask the seller or agent informally, and HomeBuyerCheck Premium flags corporate and overseas ownership as part of a wider report.",
      },
      {
        q: "Does the title register show the price the owner paid?",
        a: "Often yes. The register usually records the price paid on the most recent sale, although it may be absent on very old transfers or where the price was not registered.",
      },
      {
        q: "Why does corporate ownership matter when buying?",
        a: "Corporate or overseas ownership can signal a buy to let, a recent flip or a complex freehold structure. It is worth understanding before you buy, which is why HomeBuyerCheck Premium surfaces it from HM Land Registry CCOD and OCOD data.",
      },
    ],
    related: [
      "what-checks-before-buying-a-house",
      "how-to-check-a-property-before-buying",
      "property-check-before-buying-a-house-uk",
    ],
  },
  {
    slug: "how-to-check-a-property-before-buying",
    title: "How to Check a Property Before Buying: Step by Step",
    h1: "How to Check a Property Before Buying: Step by Step",
    description:
      "A step by step guide to checking a UK property before buying, from free flood, crime and EPC checks to paid ground risk, radon and HM Land Registry searches.",
    datePublished: "2026-05-29",
    category: "qa",
    shortAnswer:
      "To check a property before buying, work through the free public sources first: the Environment Agency flood map, Police.uk crime data, the gov.uk EPC register and the GIAS schools service. Then add paid checks for ground risk, radon and HM Land Registry ownership. HomeBuyerCheck runs the free checks instantly per address and adds the paid ones from 4.99 pounds.",
    table: {
      caption: "Key property checks and where the data comes from",
      columns: ["Check", "Source", "Free or paid"],
      rows: [
        ["Flood zone", "Environment Agency", "Free"],
        ["Crime levels", "Police.uk", "Free"],
        ["Energy rating (EPC)", "gov.uk EPC register", "Free"],
        ["Nearby schools", "GIAS (Get Information about Schools)", "Free"],
        ["Council tax band", "Valuation Office Agency", "Free"],
        ["Ground stability and coal", "BGS and Coal Authority", "Paid"],
        ["Radon risk band", "UKHSA", "Paid"],
        ["Legal ownership", "HM Land Registry", "Paid"],
      ],
    },
    sections: [
      {
        heading: "Check a property in seven steps",
        bullets: [
          "Check the flood zone for the address on the Environment Agency flood map and long term flood risk service.",
          "Review local crime levels on Police.uk for the streets around the property.",
          "Look up the EPC on the gov.uk energy certificate register to see the energy rating and any improvement notes.",
          "Find nearby schools and their inspection ratings using GIAS, the Get Information about Schools service.",
          "Confirm the council tax band through the Valuation Office Agency to gauge running costs.",
          "Order ground risk and coal mining checks where relevant, using BGS and Coal Authority data.",
          "Download the HM Land Registry title register to confirm the legal owner before you exchange.",
        ],
      },
      {
        heading: "Start with the free checks",
        paras: [
          "Most of the data that matters when buying a UK home is published for free, but it is spread across many government services. Flood comes from the Environment Agency, crime from Police.uk, energy ratings from the gov.uk EPC register, schools from GIAS and council tax bands from the Valuation Office Agency.",
          "Running these early, before you pay for surveys or legal work, helps you spot deal breakers while you can still walk away cheaply.",
        ],
      },
      {
        heading: "Add the paid checks that a viewing misses",
        paras: [
          "Some risks are not obvious from a viewing. Ground stability and historic coal mining come from the British Geological Survey and the Coal Authority. Radon risk comes from UKHSA. Legal ownership and any corporate or overseas owner come from HM Land Registry.",
          "These are the checks a conveyancer would normally order during the legal process, but seeing an early indication helps you decide whether a property is worth pursuing.",
        ],
      },
      {
        heading: "Doing it all in one place",
        paras: [
          "HomeBuyerCheck aggregates the scattered free sources into one instant report per address, covering flood, crime, schools, EPC, recent sales and council tax at no cost. The 4.99 pound Premium tier adds ground risk, radon and HM Land Registry ownership, and Premium Plus at 6.99 pounds goes further. The free report alone covers the checks most buyers skip simply because they are hard to find.",
        ],
      },
    ],
    faqs: [
      {
        q: "What should I check before buying a house in the UK?",
        a: "Check the flood zone, local crime, the EPC energy rating, nearby schools and the council tax band for free, then add ground risk, radon and HM Land Registry ownership checks. These cover the main risks beyond what a viewing shows.",
      },
      {
        q: "Are property checks free in the UK?",
        a: "Many are. Flood, crime, EPC, schools and council tax band are all published free by government services. Ground risk, radon and the HM Land Registry title register involve a fee. HomeBuyerCheck runs the free checks instantly and offers the paid ones from 4.99 pounds.",
      },
      {
        q: "When should I run these checks?",
        a: "Run the free checks before you make an offer, so you can spot problems while it is cheap to walk away. Order the paid ground, radon and ownership checks once you are serious about a specific property.",
      },
      {
        q: "Do these checks replace a survey or conveyancer?",
        a: "No. They are an early due diligence layer that helps you choose which properties to pursue. You still need a survey and a conveyancer, who will order formal searches before you exchange contracts.",
      },
    ],
    related: [
      "what-checks-before-buying-a-house",
      "property-check-before-buying-a-house-uk",
      "is-it-safe-to-buy-a-house-in-a-flood-zone",
    ],
  },
  {
    slug: "how-to-check-for-japanese-knotweed-before-buying",
    title: "How to Check for Japanese Knotweed Before Buying",
    h1: "How to Check for Japanese Knotweed Before Buying",
    description:
      "Check for Japanese knotweed before buying a UK house by spotting bamboo-like stems and shovel-shaped leaves, reading the TA6 form, and asking a surveyor to confirm.",
    datePublished: "2026-05-29",
    category: "qa",
    shortAnswer:
      "To check for Japanese knotweed before buying, look for its bamboo-like hollow stems, shovel-shaped leaves and dense fast spreading clumps around the garden and boundaries. Check the seller TA6 property information form, which asks about knotweed. There is no single free national knotweed map, so ask a surveyor or knotweed specialist to confirm any suspect plant.",
    table: {
      caption: "How to check for Japanese knotweed",
      columns: ["Step", "Method", "Cost"],
      rows: [
        ["Visual inspection", "Look for stems, leaves and spread on the viewing", "Free"],
        ["TA6 form", "Read the seller declaration about knotweed", "Free"],
        ["Surveyor", "Ask the surveyor to flag knotweed in the report", "Part of survey fee"],
        ["Knotweed specialist", "Commission a dedicated knotweed survey", "Varies by provider"],
      ],
    },
    sections: [
      {
        heading: "Check for knotweed in four steps",
        bullets: [
          "On the viewing, look for tall bamboo-like hollow stems, often with purple or red speckles, growing in dense clumps.",
          "Check the leaves, which are shovel or heart shaped, bright green and arranged in a zig zag along the stem.",
          "Read the seller TA6 property information form, which specifically asks whether the property is affected by Japanese knotweed.",
          "Ask your surveyor or a knotweed specialist to confirm any suspect plant, because growth looks different through the seasons.",
        ],
      },
      {
        heading: "What Japanese knotweed looks like",
        paras: [
          "Japanese knotweed has hollow, bamboo-like stems that can reach two to three metres in summer, with shovel-shaped leaves growing in a zig zag pattern. It spreads quickly and densely, often along boundaries, near outbuildings and from neighbouring land.",
          "In winter the canes die back to brown, brittle stems, which can make it easy to miss. If you view in the colder months, look for the dead canes and ask whether the plant has appeared in previous summers.",
        ],
      },
      {
        heading: "Why it matters for mortgages",
        paras: [
          "Japanese knotweed can affect mortgageability. Some lenders will refuse a property or require a treatment plan with an insurance backed guarantee before they lend, because the plant can damage structures and is expensive to remove.",
          "This is why the TA6 form asks about it directly. If the seller declares knotweed, ask to see any treatment plan and guarantee. If they declare none but you spot it, raise it before you proceed.",
        ],
      },
      {
        heading: "There is no single free national map",
        paras: [
          "Unlike flood zones or radon, there is no single official free national map of Japanese knotweed in the UK. Detection relies on a visual inspection, the seller declaration and a professional opinion. HomeBuyerCheck focuses on the data risks that do have authoritative sources, such as flood, ground stability and radon, while knotweed should be confirmed on the ground by a surveyor.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I check for Japanese knotweed for free?",
        a: "You can check for free by inspecting the property visually and reading the seller TA6 form, which asks about knotweed. There is no single free national knotweed map, so a surveyor or specialist is needed to confirm any suspect plant.",
      },
      {
        q: "What does Japanese knotweed look like?",
        a: "It has hollow bamboo-like stems, often speckled purple or red, and shovel-shaped bright green leaves growing in a zig zag along the stem. It forms dense clumps that spread quickly, and dies back to brown canes in winter.",
      },
      {
        q: "Does Japanese knotweed affect getting a mortgage?",
        a: "It can. Some lenders refuse properties with knotweed or require a treatment plan with an insurance backed guarantee before lending, because the plant can damage structures and is costly to remove.",
      },
      {
        q: "Is the seller required to declare knotweed?",
        a: "The TA6 property information form asks the seller whether the property is affected by Japanese knotweed. A false declaration can have legal consequences, but you should still inspect and ask a surveyor to check.",
      },
      {
        q: "When is the best time to spot knotweed?",
        a: "Late spring to summer is easiest, when the green stems and leaves are in full growth. In winter only brown brittle canes remain, so ask whether the plant has appeared in previous summers.",
      },
    ],
    related: [
      "what-checks-before-buying-a-house",
      "how-to-check-a-property-before-buying",
      "property-check-before-buying-a-house-uk",
    ],
  },
  {
    slug: "how-to-check-radon-risk-before-buying-a-house",
    title: "How to Check Radon Risk Before Buying a House",
    h1: "How to Check Radon Risk Before Buying a House",
    description:
      "Check radon risk before buying a UK house for free using the UKHSA radon map by postcode, understand the indicative band, and see how a full report adds it per address.",
    datePublished: "2026-05-29",
    category: "qa",
    shortAnswer:
      "To check radon risk before buying, use the free UKHSA radon map on gov.uk and enter the postcode to see the indicative radon band for the area. The higher the band, the greater the chance of elevated radon. HomeBuyerCheck Premium includes the UKHSA Radon Affected Area band for the specific address alongside flood, ground and ownership checks.",
    table: {
      caption: "Ways to check radon risk",
      columns: ["Method", "Cost", "What you get"],
      rows: [
        [
          "UKHSA radon map (gov.uk)",
          "Free",
          "Indicative radon band for the area by postcode",
        ],
        [
          "HomeBuyerCheck Premium",
          "From 4.99 pounds",
          "UKHSA Radon Affected Area band for the address in one report",
        ],
        [
          "Home radon test kit",
          "Around 50 pounds",
          "An actual measured radon level over a period in the home",
        ],
      ],
    },
    sections: [
      {
        heading: "Check radon risk in four steps",
        bullets: [
          "Open the UKHSA radon map service on gov.uk.",
          "Enter the postcode of the property you are considering.",
          "Read the indicative radon band shown, which estimates the chance that homes in that area have elevated radon.",
          "If the area is a higher band, plan to test the actual property with a radon detector after purchase, as area data is only indicative.",
        ],
      },
      {
        heading: "What the radon band means",
        paras: [
          "Radon is a natural radioactive gas that seeps from the ground and can build up indoors. UKHSA maps the country into bands that estimate the proportion of homes in an area expected to be above the radon action level. A higher band means a greater chance, not a certainty, that a given home is affected.",
          "Because the band describes an area rather than a specific building, the only way to know the true level in a particular house is to measure it with a radon detector left in place for a period of time.",
        ],
      },
      {
        heading: "What to do if the risk is higher",
        paras: [
          "A higher radon band is not a reason to abandon a purchase. Elevated radon can usually be reduced with simple measures such as improved under-floor ventilation or a radon sump. If you buy in a higher band area, order a radon test and follow UKHSA guidance on reducing levels if needed.",
        ],
      },
      {
        heading: "Seeing radon in your property report",
        paras: [
          "The free UKHSA map is useful but only gives an area band. HomeBuyerCheck Premium includes the UKHSA Radon Affected Area band for the specific address in the same report as flood, ground stability, coal and HM Land Registry ownership, so you can weigh radon alongside the other ground risks rather than checking it in isolation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I check radon risk for free?",
        a: "Yes. The UKHSA radon map on gov.uk lets you check the indicative radon band for an area by postcode at no cost. HomeBuyerCheck Premium also includes the UKHSA Radon Affected Area band for the specific address.",
      },
      {
        q: "What is a radon Affected Area?",
        a: "A Radon Affected Area is one where UKHSA estimates a higher proportion of homes are above the radon action level. It indicates greater likelihood across the area, but the actual level in a single home can only be confirmed by testing it.",
      },
      {
        q: "Does a high radon band mean I should not buy?",
        a: "No. A higher band means you should test the property, but elevated radon can usually be reduced with measures such as better ventilation or a radon sump. It is a manageable risk rather than a deal breaker.",
      },
      {
        q: "How do I measure radon in a specific house?",
        a: "Use a radon detector kit, which costs around 50 pounds and is left in place for a period to measure the actual indoor level. The UKHSA area band only indicates likelihood, so testing is the only way to confirm a single property.",
      },
    ],
    related: [
      "what-checks-before-buying-a-house",
      "how-to-check-a-property-before-buying",
      "do-i-need-a-coal-mining-search",
    ],
  },
];
