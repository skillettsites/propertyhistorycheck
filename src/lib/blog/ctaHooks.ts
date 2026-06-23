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
};
