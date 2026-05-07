import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-semibold text-slate-900">PropertyHistoryCheck</p>
            <p className="mt-2 text-xs leading-relaxed">
              UK property due-diligence reports. Free instant checks, paid title and environmental reports for buyers — before you instruct a solicitor.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Product</p>
            <ul className="mt-2 space-y-1.5">
              <li><Link href="/check" className="hover:text-slate-900">Check a property</Link></li>
              <li><Link href="/property-history-check" className="hover:text-slate-900">How it works</Link></li>
              <li><Link href="/title-register-check" className="hover:text-slate-900">Title register check</Link></li>
              <li><Link href="/flood-risk-check" className="hover:text-slate-900">Flood risk check</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Guides</p>
            <ul className="mt-2 space-y-1.5">
              <li><Link href="/blog" className="hover:text-slate-900">All guides</Link></li>
              <li><Link href="/guides/buying-a-house-uk" className="hover:text-slate-900">Buying a house UK</Link></li>
              <li><Link href="/guides/conveyancing-explained" className="hover:text-slate-900">Conveyancing explained</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Legal</p>
            <ul className="mt-2 space-y-1.5">
              <li><Link href="/terms" className="hover:text-slate-900">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-slate-900">Privacy</Link></li>
              <li><Link href="/cookies" className="hover:text-slate-900">Cookies</Link></li>
              <li><Link href="/refunds" className="hover:text-slate-900">Refund policy</Link></li>
              <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-slate-500">
          Contains HM Land Registry data &copy; Crown copyright and database right. Police data from data.police.uk under the Open Government Licence v3.0.
          Informational use only. PropertyHistoryCheck is not a substitute for formal conveyancing searches by a qualified solicitor.
        </p>
      </div>
    </footer>
  );
}
