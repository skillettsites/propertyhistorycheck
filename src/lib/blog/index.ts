import type { BlogPost } from "./types";
import { posts_costs } from "./posts-costs";
import { posts_comparisons } from "./posts-comparisons";
import { posts_qa } from "./posts-qa";
import { posts_data } from "./posts-data";
import { posts_reviews } from "./posts-reviews";
import { posts_costs2 } from "./posts-costs2";
import { posts_qa2 } from "./posts-qa2";
import { posts_howto } from "./posts-howto";

export type { BlogPost } from "./types";

export const BLOG_POSTS: BlogPost[] = [
  ...posts_costs,
  ...posts_comparisons,
  ...posts_qa,
  ...posts_data,
  ...posts_reviews,
  ...posts_costs2,
  ...posts_qa2,
  ...posts_howto,
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
