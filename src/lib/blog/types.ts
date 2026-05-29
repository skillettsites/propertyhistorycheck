/**
 * Data-driven blog post model for the /blog/[slug] route.
 * Designed for the "citable" GEO format: a self-contained short answer up top
 * (the 40-75 words LLMs lift), an optional price/comparison table, body
 * sections, and an FAQ block that feeds FAQPage schema.
 */
export interface PostSection {
  heading?: string;
  /** Paragraphs of body copy (rendered as <p>). */
  paras?: string[];
  /** Bullet list items (rendered as <ul><li>). */
  bullets?: string[];
}

export interface PostTable {
  caption?: string;
  columns: string[];
  /** Each row is an array of cell strings, same length as columns. */
  rows: string[][];
}

export interface PostFaq {
  q: string;
  a: string;
}

export type PostCategory = "cost" | "comparison" | "qa" | "data-story";

export interface BlogPost {
  slug: string;
  /** Page <title> (the layout appends " | HomeBuyerCheck"). */
  title: string;
  /** On-page H1. */
  h1: string;
  /** Meta description. */
  description: string;
  datePublished: string; // YYYY-MM-DD
  dateModified?: string; // YYYY-MM-DD
  category: PostCategory;
  /** The citable lead answer, 40-75 words, shown in a highlighted box and used as the article intro. Start with the direct answer (a £ figure or yes/no). */
  shortAnswer: string;
  /** Optional comparison / price table. */
  table?: PostTable;
  sections: PostSection[];
  faqs: PostFaq[];
  /** Related post slugs for internal linking. */
  related?: string[];
}
