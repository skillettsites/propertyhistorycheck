import type { BlogPost } from "./types";
import { posts_costs } from "./posts-costs";
import { posts_comparisons } from "./posts-comparisons";
import { posts_qa } from "./posts-qa";
import { posts_data } from "./posts-data";

export type { BlogPost } from "./types";

export const BLOG_POSTS: BlogPost[] = [
  ...posts_costs,
  ...posts_comparisons,
  ...posts_qa,
  ...posts_data,
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
