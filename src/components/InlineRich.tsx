import Link from "next/link";
import type { ReactNode } from "react";

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Renders a plain-text string with markdown-style inline links.
 *
 * Blog post body copy is stored as plain strings in src/lib/blog/*, which means
 * contextual in-body internal links were impossible without hand-writing JSX per
 * post. This helper lets a paragraph or bullet contain [anchor text](/path) and
 * turns it into a real link, so cost guides can point at the calculators and
 * sibling guides from inside the sentence that discusses them.
 *
 * Only use this in sections[].paras and sections[].bullets. Never in
 * shortAnswer, faqs, table cells or description: those feed JSON-LD schema and
 * meta tags, where raw markdown would leak into the markup.
 */
export function inlineRich(text: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;

  while ((match = LINK_RE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const label = match[1];
    const href = match[2];
    const key = `${href}-${match.index}`;
    out.push(
      href.startsWith("/") ? (
        <Link key={key} href={href} className="text-blue-700 underline-offset-2 hover:underline">
          {label}
        </Link>
      ) : (
        <a
          key={key}
          href={href}
          className="text-blue-700 underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener"
        >
          {label}
        </a>
      )
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : text;
}
