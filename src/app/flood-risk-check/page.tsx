import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "Free UK Flood Risk Check by Postcode",
  description:
    "Check the flood risk of any UK property by postcode. Free instant rivers/sea risk band sourced from the Environment Agency. Premium upgrade adds surface water, groundwater, and 2050 climate-projected risk.",
  alternates: { canonical: "/flood-risk-check" },
};

export default function FloodRiskCheckPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">UK flood risk check by postcode</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              Free instant flood-risk band for any UK property, sourced direct from the Environment Agency. Premium upgrade adds surface water risk, groundwater risk, and 2050 climate-projected flood risk under UKCP18 scenarios.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">Why flood risk matters before you offer</h2>
          <p className="mt-3 text-slate-700">
            UK home insurance premiums for properties in flood zones are routinely 2-5x higher than equivalent dry properties. Some lenders also require a Flood Risk Survey before approving a mortgage. Discovering this AFTER you&apos;ve made an offer can knock 5-15% off the price you&apos;re willing to pay &mdash; or kill the purchase entirely. Find it now.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What&apos;s included</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Free: rivers and sea risk band (Very Low / Low / Medium / High).</li>
            <li>Standard: full breakdown including surface water and reservoir risk; insurance implications.</li>
            <li>Premium: 2050 climate-projected risk using UKCP18 scenarios, plus Flood Re eligibility flag.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
