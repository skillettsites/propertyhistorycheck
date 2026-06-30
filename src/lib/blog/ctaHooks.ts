/**
 * Contextual CTA hooks for high-traffic blog posts.
 *
 * The blog [slug] template shows one CTA box. By default it uses a generic
 * "Check any UK property" headline; when a post has an entry here, that
 * tailored line is used instead, so the call to action speaks to the exact
 * cost/process the reader just researched (much stronger conversion than a
 * generic prompt). Honest framing only: HomeBuyerCheck flags risks early and
 * cheaply, it does not replace the formal solicitor searches.
 *
 * Keyed by post slug. Add a new entry to tailor a post's CTA; otherwise the
 * generic copy in blog/[slug]/page.tsx is used.
 */
export const CTA_HOOKS: Record<string, string> = {
  "how-to-find-out-who-owns-a-property-uk":
    "Want to know who really owns a property, and whether it's a UK or overseas company with charges or insolvency flags? HomeBuyerCheck pulls the ownership picture for any address from £4.99.",
  "local-authority-search-cost-uk":
    "An official local authority search runs £100+ and takes weeks through your solicitor. HomeBuyerCheck flags the key planning, listing and Article 4 risks for your postcode in seconds, from £4.99.",
  "do-i-need-a-coal-mining-search":
    "Not sure if you need a coal mining search? HomeBuyerCheck shows the mining and ground-stability risk for your address instantly, so you know before you commit to the formal search, from £4.99.",
  "coal-mining-search-cost-uk":
    "A coal mining search costs £40+ and takes weeks via your solicitor. HomeBuyerCheck flags mining and subsidence risk for your postcode in seconds, from £4.99.",
  "what-is-a-con29-search":
    "The CON29 arrives weeks into conveyancing as part of a £250+ search pack. HomeBuyerCheck surfaces the key planning and environmental risks now, before you offer, from £4.99.",
  "freehold-checker-how-to-check":
    "Checking freehold vs leasehold? HomeBuyerCheck confirms tenure and flags the leasehold risks (tribunal history, freeholder company health) for any address, from £4.99.",
  "rics-survey-cost-uk":
    "Before you commit £500+ to a RICS survey, HomeBuyerCheck flags the property and area risks worth surveying for, ground stability, flooding, mining, listing, from £4.99.",
  "how-long-do-conveyancing-searches-take":
    "Searches take weeks. HomeBuyerCheck gives you the key risk flags on any property in seconds, so you can decide whether to offer before the slow searches even start, from £4.99.",
  "property-due-diligence-cost-uk":
    "Full pre-purchase due diligence through professionals runs into the hundreds. HomeBuyerCheck gives you the core risk picture on any address up front, from £4.99.",
  "how-much-are-property-searches-when-buying":
    "Searches cost £250 to £450 and are only ordered after you offer, so a failed sale means paying twice. HomeBuyerCheck screens any address for the big risks first, from £4.99, so you commit your search budget only on a property worth it.",
  "con29-search-cost-uk":
    "The CON29 lands weeks into conveyancing inside a £250+ pack. HomeBuyerCheck surfaces the key planning, charges and environmental risks now, before you offer, from £4.99.",
  "sewer-connection-cost-uk":
    "A new sewer connection can run into the thousands. Before you commit, HomeBuyerCheck flags drainage, ground and flood risk for any address in seconds, from £4.99.",
  "mining-search-cost-uk":
    "Buying in a former coalfield? HomeBuyerCheck shows mining and ground-stability risk for your address instantly, so you know before you pay for the formal CON29M search, from £4.99.",
  "environmental-search-cost-uk":
    "Contaminated-land liability can cost tens of thousands. HomeBuyerCheck screens flood and ground risk for any address before you order the £40-£70 environmental search, from £4.99.",
  "drainage-and-water-search-cost-uk":
    "Before the slow CON29DW comes back, HomeBuyerCheck flags flood, drainage and ground risk for any address in seconds, from £4.99, so you can offer with eyes open.",
  "homecheck-professional-flood-report-cost":
    "Don't wait weeks for a flood report. HomeBuyerCheck shows Environment Agency flood risk for any UK address free, and adds ground and subsidence risk from £4.99.",
  "groundsure-report-cost":
    "Screen the same risks a Groundsure report covers, contamination, flood, ground stability, before you offer. HomeBuyerCheck checks any address from £4.99.",
  "landmark-report-cost":
    "Screen the same risks a Landmark report covers, flood, ground stability, contamination, before you offer. HomeBuyerCheck checks any address from £4.99.",
};
