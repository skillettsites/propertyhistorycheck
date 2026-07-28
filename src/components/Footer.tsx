import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 border-t border-white/10 pb-10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <Link href="/" className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              HomeBuyerCheck
            </Link>
            <p className="mt-2 text-xs leading-relaxed">
              Free UK property due-diligence reports. Used by buyers before instructing a solicitor.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Free Checks</h3>
            <ul className="space-y-2">
              <li><Link href="/check" className="hover:text-white transition-colors">Check a property</Link></li>
              <li><Link href="/free-property-check" className="hover:text-white transition-colors">Property check</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Property checker</Link></li>
              <li><Link href="/blog/freehold-checker-how-to-check" className="hover:text-white transition-colors">Freehold checker</Link></li>
              <li><Link href="/flood-risk-check" className="hover:text-white transition-colors">Flood risk check</Link></li>
              <li><Link href="/property-checks-before-buying" className="hover:text-white transition-colors">Pre-offer checklist</Link></li>
            </ul>
            <h3 className="font-semibold text-white mb-3 mt-5">Calculators</h3>
            <ul className="space-y-2">
              <li><Link href="/cost-of-buying-a-house-calculator" className="hover:text-white transition-colors">Cost of buying a house</Link></li>
              <li><Link href="/stamp-duty-calculator" className="hover:text-white transition-colors">Stamp duty calculator</Link></li>
              <li><Link href="/conveyancing-cost-calculator" className="hover:text-white transition-colors">Conveyancing cost</Link></li>
              <li><Link href="/property-survey-cost-calculator" className="hover:text-white transition-colors">Survey cost</Link></li>
              <li><Link href="/calculators" className="hover:text-white transition-colors">All calculators →</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Paid report</h3>
            <ul className="space-y-2">
              <li><Link href="/property-history-check" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/title-register-check" className="hover:text-white transition-colors">HM Land Registry title guide</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Guides &amp; legal</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-white transition-colors">All guides</Link></li>
              <li><Link href="/guides/buying-a-house-uk" className="hover:text-white transition-colors">Buying a UK house</Link></li>
              <li><Link href="/guides/conveyancing-explained" className="hover:text-white transition-colors">Conveyancing explained</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="gradient-line mt-8 mb-4" />

        <div className="text-[11px] text-gray-400 leading-relaxed mb-3 max-w-5xl mx-auto text-center px-4">
          <strong className="text-gray-300">Important:</strong> HomeBuyerCheck is an information aggregation service. It is not a substitute for formal conveyancing searches conducted by a qualified solicitor. Title information is sourced from HM Land Registry &copy; Crown copyright and database right. Environmental, flood, crime and EPC data is sourced from public government APIs under the Open Government Licence v3.0. Always verify findings with a qualified professional before making purchase decisions.
        </div>
        <div className="text-xs text-center text-gray-500">
          &copy; {new Date().getFullYear()} HomeBuyerCheck. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
