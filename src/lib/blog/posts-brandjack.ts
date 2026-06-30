import type { BlogPost } from "./types";

/**
 * Brand-jack / branded-report cost posts. These target buyers searching for a
 * specific commercial search product by name (Homecheck, Groundsure, Landmark)
 * and the cost of it. Honest framing: these reports are ordered by your
 * conveyancer, not bought direct; HomeBuyerCheck lets you screen the same kinds
 * of risk (flood, ground, contamination) for free / £4.99 before you commit.
 */
export const posts_brandjack: BlogPost[] = [
  {
    slug: "homecheck-professional-flood-report-cost",
    title: "Homecheck Professional Flood Report Cost (UK 2026)",
    h1: "Homecheck Professional Flood Report Cost (2026)",
    description:
      "A Homecheck Professional Flood Report costs around £30 to £45. See what it covers, when your conveyancer orders one, and how to screen a property's flood risk free before you pay.",
    datePublished: "2026-06-30",
    category: "cost",
    shortAnswer:
      "A Homecheck Professional Flood Report costs around £30 to £45 in 2026. It is a flood-specific report, produced by Landmark, that your conveyancer orders when an environmental search flags possible flood risk. It assesses river, coastal, surface water and groundwater flooding for the property and gives an insurability view. You can screen flood risk for free first with HomeBuyerCheck before paying for it.",
    table: {
      caption: "Homecheck Professional Flood Report in context (UK, 2026)",
      columns: ["Report", "Typical cost", "Ordered by"],
      rows: [
        ["Homecheck Professional Flood Report", "£30 to £45", "Conveyancer (when flood flagged)"],
        ["Environmental search (includes flood screen)", "£40 to £70", "Conveyancer"],
        ["HomeBuyerCheck free report (flood screen)", "Free", "You, instantly"],
        ["HomeBuyerCheck Premium (flood + ground + more)", "£4.99", "You, instantly"],
      ],
    },
    sections: [
      {
        heading: "What the Homecheck Professional Flood Report is",
        paras: [
          "The Homecheck Professional Flood Report is a specialist flood assessment produced by Landmark, one of the two big UK search providers. It is not part of the standard search pack you always pay for. Instead, your conveyancer orders it when the environmental search returns a possible flood concern and a more detailed look is needed.",
          "It costs around £30 to £45 and digs deeper than the flood screen inside a general environmental search, covering river, coastal, surface water and groundwater flooding, and giving a view on whether the property is likely to be insurable against flooding.",
        ],
      },
      {
        heading: "What it covers",
        bullets: [
          "Flooding from rivers and the sea, with modelled depths and likelihood.",
          "Surface water (pluvial) and groundwater flood risk for the property.",
          "An overall risk rating and a professional flood-risk assessment.",
          "An indication of whether standard buildings insurance is likely to be available.",
        ],
      },
      {
        heading: "Do you order it yourself?",
        paras: [
          "No. Like other conveyancing searches, you do not buy the Homecheck flood report directly. Your solicitor or licensed conveyancer orders it on your behalf during the legal process, usually only after the environmental search has flagged a reason to.",
          "That means you typically pay for it weeks into the purchase, after your offer is accepted and you have committed to legal fees. If flood risk is a concern for you, it is far cheaper to check it before you offer.",
        ],
      },
      {
        heading: "How to check flood risk for free first",
        paras: [
          "You do not need to wait for, or pay for, a Homecheck report to get an early read on flood risk. HomeBuyerCheck's free report shows flood risk for any UK address using live Environment Agency data, rivers, sea and surface water, in seconds.",
          "The £4.99 Premium report goes further, adding ground stability and subsidence risk from British Geological Survey data, mining, radon and more. Running this before you offer tells you whether flooding is even a concern for the property, so you only pay for a detailed flood report on a home worth pursuing.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a Homecheck Professional Flood Report cost?",
        a: "Around £30 to £45 in 2026. It is a flood-specific report produced by Landmark, ordered by your conveyancer when the environmental search flags possible flood risk.",
      },
      {
        q: "Can I buy a Homecheck flood report myself?",
        a: "Not usually. It is ordered by your solicitor or conveyancer as part of the legal process, not sold direct to buyers. If you want an early read on flood risk, HomeBuyerCheck's free report shows Environment Agency flood data for any address instantly.",
      },
      {
        q: "Is the Homecheck flood report the same as the environmental search?",
        a: "No. The environmental search (£40 to £70) screens flood risk along with contamination and ground stability. The Homecheck Professional Flood Report (£30 to £45) is a deeper, flood-only report ordered when that screen flags a concern.",
      },
      {
        q: "Can I check flood risk before paying for the report?",
        a: "Yes. HomeBuyerCheck shows flood risk from rivers, sea and surface water for any UK address free, using Environment Agency data, and its £4.99 Premium report adds ground and subsidence risk, so you can screen a property before any flood report is ordered.",
      },
    ],
    related: [
      "environmental-search-cost-uk",
      "groundsure-report-cost",
      "landmark-report-cost",
    ],
  },
  {
    slug: "groundsure-report-cost",
    title: "Groundsure Report Cost (UK 2026): What You Pay and Why",
    h1: "Groundsure Report Cost (2026)",
    description:
      "A Groundsure environmental report costs around £40 to £70. See what Groundsure reports cover, who orders them, and how to screen contamination, flood and ground risk for £4.99 first.",
    datePublished: "2026-06-30",
    category: "cost",
    shortAnswer:
      "A Groundsure environmental report costs around £40 to £70 in 2026, ordered by your conveyancer as part of the standard search pack. Groundsure is one of the two main UK environmental data providers, and its reports screen for contaminated land, flooding, ground stability and nearby energy and infrastructure projects. You can screen those same risk types for £4.99 with HomeBuyerCheck before the search is ordered.",
    table: {
      caption: "Groundsure report cost in context (UK, 2026)",
      columns: ["Report", "Typical cost", "Ordered by"],
      rows: [
        ["Groundsure environmental report", "£40 to £70", "Conveyancer"],
        ["Groundsure flood / specialist add-ons", "£30 to £60", "Conveyancer (if flagged)"],
        ["HomeBuyerCheck free report", "Free", "You, instantly"],
        ["HomeBuyerCheck Premium (ground + flood + more)", "£4.99", "You, instantly"],
      ],
    },
    sections: [
      {
        heading: "What a Groundsure report is",
        paras: [
          "Groundsure is one of the two leading environmental search providers in the UK, alongside Landmark. When your conveyancer orders the environmental search in the standard pack, it is often a Groundsure report that comes back. It costs around £40 to £70.",
          "The report screens the property and the land around it against a wide set of environmental data, flagging anything that might need a closer look before you commit to the purchase.",
        ],
      },
      {
        heading: "What Groundsure reports cover",
        bullets: [
          "Contaminated land risk, including former industrial use and landfill nearby.",
          "Flood risk from rivers, sea, surface water and groundwater.",
          "Ground stability, subsidence and natural ground hazards.",
          "Energy and infrastructure projects, such as planned developments and ground-source schemes.",
          "An overall pass or further-action recommendation.",
        ],
      },
      {
        heading: "Who orders it and when",
        paras: [
          "You do not buy a Groundsure report directly. Your conveyancer orders it as part of the search pack once your offer is accepted and you have instructed them, so you pay for it weeks into the process as a disbursement.",
          "If a Groundsure report returns a concern, you may be advised to commission a more detailed follow-up. Most properties pass, but the cost of investigating a contamination or stability flag after you own the property is far higher than checking up front.",
        ],
      },
      {
        heading: "Screen the same risks for £4.99 first",
        paras: [
          "You can get an early read on the big environmental risks before any Groundsure report is ordered. HomeBuyerCheck's free report shows flood risk from Environment Agency data for any address, and the £4.99 Premium report adds ground stability and subsidence risk from British Geological Survey data, mining, radon and listed or conservation overlays.",
          "It is not a replacement for the formal environmental search your solicitor orders, but it tells you whether a property carries obvious environmental concerns before you commit to the full search pack of £250 to £450.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a Groundsure report cost?",
        a: "A Groundsure environmental report costs around £40 to £70 in 2026, ordered by your conveyancer as part of the standard search pack. Specialist add-on reports cost more when a concern is flagged.",
      },
      {
        q: "What is the difference between Groundsure and Landmark?",
        a: "Both are major UK environmental search providers, and their core reports cover similar ground: contamination, flood and ground stability for around £40 to £70. Which one you get depends on what your conveyancer or search provider uses.",
      },
      {
        q: "Can I order a Groundsure report myself?",
        a: "Environmental searches are normally ordered through your conveyancer rather than bought direct. To screen a property's environmental risk yourself beforehand, HomeBuyerCheck's £4.99 Premium report covers flood, ground stability, mining and radon.",
      },
      {
        q: "Do I need a Groundsure report if I have a HomeBuyerCheck report?",
        a: "They serve different purposes. HomeBuyerCheck (£4.99) is a fast pre-offer screen so you do not waste search fees on the wrong property. The formal environmental search, whether Groundsure or Landmark, is the lender-grade report your solicitor relies on later. Most buyers use the cheap screen first, then the formal search once committed.",
      },
    ],
    related: [
      "environmental-search-cost-uk",
      "landmark-report-cost",
      "homecheck-professional-flood-report-cost",
    ],
  },
  {
    slug: "landmark-report-cost",
    title: "Landmark Report Cost (UK 2026): Environmental & Flood",
    h1: "Landmark Report Cost (2026)",
    description:
      "A Landmark environmental report costs around £40 to £70, with specialist flood reports from £30. See what Landmark reports cover, who orders them, and how to screen the same risks for £4.99 first.",
    datePublished: "2026-06-30",
    category: "cost",
    shortAnswer:
      "A Landmark environmental report costs around £40 to £70 in 2026, with specialist flood reports such as the Homecheck Professional Flood Report from about £30. Landmark is one of the two main UK environmental data providers, and its reports screen for contaminated land, flood, ground stability and infrastructure risk. You can screen the same risk types for £4.99 with HomeBuyerCheck before the search is ordered.",
    table: {
      caption: "Landmark report cost in context (UK, 2026)",
      columns: ["Report", "Typical cost", "Ordered by"],
      rows: [
        ["Landmark environmental report", "£40 to £70", "Conveyancer"],
        ["Landmark / Homecheck flood report", "£30 to £45", "Conveyancer (if flagged)"],
        ["HomeBuyerCheck free report", "Free", "You, instantly"],
        ["HomeBuyerCheck Premium (ground + flood + more)", "£4.99", "You, instantly"],
      ],
    },
    sections: [
      {
        heading: "What a Landmark report is",
        paras: [
          "Landmark is one of the two leading UK providers of property environmental and risk data, alongside Groundsure. Its reports are widely used in conveyancing, and the Homecheck brand of flood and environmental reports is part of the Landmark stable. A core environmental report costs around £40 to £70.",
          "Like all environmental searches, a Landmark report screens the property and surrounding land against a broad set of data so that any concern can be investigated before you exchange.",
        ],
      },
      {
        heading: "What Landmark reports cover",
        bullets: [
          "Contaminated land and former industrial or landfill use nearby.",
          "Flood risk from rivers, sea, surface water and groundwater.",
          "Ground stability, subsidence and natural hazards.",
          "Energy, infrastructure and planning considerations in the area.",
          "Specialist flood reports (such as the Homecheck Professional Flood Report) when a deeper look is needed.",
        ],
      },
      {
        heading: "Who orders it and when",
        paras: [
          "You do not buy a Landmark report directly. Your conveyancer orders it as part of the standard search pack after your offer is accepted, so the cost lands as a disbursement weeks into the purchase.",
          "If the report flags a concern, a specialist follow-up such as a flood report may be ordered, adding to the bill. Knowing the property's risk profile early helps you avoid spending on searches for a home you would walk away from.",
        ],
      },
      {
        heading: "Screen the same risks for £4.99 first",
        paras: [
          "Before any Landmark report is ordered, you can screen the headline risks yourself. HomeBuyerCheck's free report shows Environment Agency flood risk for any UK address, and the £4.99 Premium report adds ground stability and subsidence from British Geological Survey data, mining, radon and listing or conservation overlays.",
          "Use it pre-offer to decide whether a property is worth pursuing, then let your solicitor order the formal Landmark or Groundsure search once you are committed.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a Landmark report cost?",
        a: "A Landmark environmental report costs around £40 to £70 in 2026. Specialist flood reports, such as the Homecheck Professional Flood Report, start at around £30. Your conveyancer orders them as part of the search process.",
      },
      {
        q: "Is Homecheck the same as Landmark?",
        a: "Homecheck is a brand of property risk reports produced by Landmark. So a Homecheck Professional Flood Report is a Landmark product. Both screen environmental and flood risk for conveyancing.",
      },
      {
        q: "Can I buy a Landmark report directly?",
        a: "Landmark reports are normally ordered through your conveyancer rather than sold direct to buyers. To screen a property's flood and ground risk yourself first, HomeBuyerCheck's £4.99 Premium report covers those risks instantly.",
      },
      {
        q: "Landmark or Groundsure, which is better?",
        a: "Both are reputable, widely accepted UK environmental search providers covering similar risks at similar cost (£40 to £70). The choice usually comes down to what your conveyancer or search provider uses, and lenders accept either.",
      },
    ],
    related: [
      "environmental-search-cost-uk",
      "groundsure-report-cost",
      "homecheck-professional-flood-report-cost",
    ],
  },
];
