import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">P</span>
          <span className="text-base font-semibold text-slate-900">PropertyHistoryCheck</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
          <Link href="/property-history-check" className="hover:text-slate-900">How it works</Link>
          <Link href="/free-property-check" className="hover:text-slate-900">Free check</Link>
          <Link href="/blog" className="hover:text-slate-900">Guides</Link>
          <Link href="/check" className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">Check a property</Link>
        </nav>
      </div>
    </header>
  );
}
