"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[1000] bg-slate-900/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-white">Home</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Buyer</span>
            <span className="text-white">Check</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/check" className="hover:text-white transition-colors">Check a property</Link>
          <Link href="/property-history-check" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/title-register-check" className="hover:text-white transition-colors">Title register</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Guides</Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 px-4 py-3 space-y-2 bg-slate-900/95">
          <Link href="/check" className="block py-2 text-sm text-gray-300 hover:text-white">Check a property</Link>
          <Link href="/property-history-check" className="block py-2 text-sm text-gray-300 hover:text-white">How it works</Link>
          <Link href="/title-register-check" className="block py-2 text-sm text-gray-300 hover:text-white">Title register</Link>
          <Link href="/flood-risk-check" className="block py-2 text-sm text-gray-300 hover:text-white">Flood risk</Link>
          <Link href="/blog" className="block py-2 text-sm text-gray-300 hover:text-white">Guides</Link>
        </nav>
      )}
    </header>
  );
}
