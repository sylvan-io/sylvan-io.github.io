import { getCollection, type CollectionEntry } from 'astro:content';
import type { BlogTag } from '../content.config';
import {
  DEFAULT_LOCALE,
  canonicalSlugOf,
  type Locale,
} from '../i18n';
import { t as translate } from './t';

export type BlogPost = CollectionEntry<'blog'>;

/** All non-draft blog posts, sorted by pubDate desc. */
export const getAllPosts = async (): Promise<BlogPost[]> => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
};

/** N most recent non-draft blog posts. */
export const getRecentPosts = async (n: number): Promise<BlogPost[]> => {
  const all = await getAllPosts();
  return all.slice(0, n);
};

/** All posts that carry the given tag. */
export const getPostsByTag = async (tag: BlogTag): Promise<BlogPost[]> => {
  const posts = await getCollection(
    'blog',
    ({ data }) => !data.draft && data.tags.includes(tag),
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
};

/** All unique tags actually used by published posts, with counts. */
export const getUsedTags = async (): Promise<
  { tag: BlogTag; count: number }[]
> => {
  const posts = await getAllPosts();
  const counts = new Map<BlogTag, number>();
  for (const p of posts) {
    for (const t of p.data.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

/** Format an ISO date as YYYY-MM-DD. */
export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Format an ISO date in a locale-appropriate way.
 *   zh-CN -> YYYY-MM-DD
 *   en    -> MMM D, YYYY
 */
export const formatDateLocalized = (date: Date, locale: Locale): string => {
  if (locale === 'en') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return formatDate(date);
};

/** Estimate reading time in minutes (Chinese + English mixed: ~600 chars/min). */
export const readingTime = (body: string | undefined): number => {
  if (!body) return 1;
  const chars = body.replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(chars / 600));
};

/**
 * Locale-aware reading time string.
 *   zh-CN -> "8 分钟阅读"
 *   en    -> "8 min read"
 */
export const readingTimeLabel = (
  minutes: number,
  locale: Locale,
): string =>
  translate('blogPost.readingTime', { minutes }, locale);

/* ─────────────────────────────────────────────────────────────
 *  Translation-aware resolution
 *  ───────────────────────────────────────────────────────────── */

/** Result of resolving a canonical slug for a target locale. */
export type ResolvedPost = {
  /** The post that should be rendered (possibly a fallback). */
  post: BlogPost;
  /** True when we rendered a different-locale version of the slug. */
  isFallback: boolean;
  /** Map of locale → post id for every available translation of this slug. */
  availableTranslations: Partial<Record<Locale, string>>;
};

/**
 * Group every published post by its canonical slug (e.g. `hello-world` for
 * both `hello-world` and `hello-world.en`).
 */
const groupByCanonicalSlug = (posts: BlogPost[]): Map<string, BlogPost[]> => {
  const groups = new Map<string, BlogPost[]>();
  for (const p of posts) {
    const slug = canonicalSlugOf(p.id);
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug)!.push(p);
  }
  return groups;
};

/**
 * Given a canonical slug and a target locale, return the best matching post.
 *
 *   resolvePost('hello-world', 'zh-CN') -> { post: hello-world.md,   isFallback: false, ... }
 *   resolvePost('hello-world', 'en')
 *     -> { post: hello-world.en.md, isFallback: false, ... }   if English translation exists
 *     -> { post: hello-world.md,    isFallback: true,  ... }   otherwise (renders Chinese)
 *
 * Returns `null` when no published post exists for the given slug in any language.
 */
export const resolvePost = async (
  canonicalSlug: string,
  locale: Locale,
): Promise<ResolvedPost | null> => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const groups = groupByCanonicalSlug(posts);
  const group = groups.get(canonicalSlug);
  if (!group || group.length === 0) return null;

  const targetId =
    locale === DEFAULT_LOCALE ? canonicalSlug : `${canonicalSlug}.${locale}`;
  const targetPost = group.find((p) => p.id === targetId);

  let isFallback = false;
  let postToRender: BlogPost;
  if (targetPost) {
    postToRender = targetPost;
  } else {
    // Fall back to the default-locale canonical post (id === canonicalSlug).
    const fallback = group.find((p) => p.id === canonicalSlug);
    if (!fallback) return null;
    postToRender = fallback;
    isFallback = locale !== DEFAULT_LOCALE;
  }

  const availableTranslations: Partial<Record<Locale, string>> = {};
  for (const p of group) {
    availableTranslations[p.data.lang] = p.id;
  }

  return { post: postToRender, isFallback, availableTranslations };
};

/**
 * One entry for the blog list page.
 */
export type ListedPost = {
  /** The post to render in the card — best representative for the locale. */
  post: BlogPost;
  /** True when this card is showing a different language than the page. */
  isFallback: boolean;
};

/**
 * Return one entry per canonical slug, each represented by the best match for
 * the requested locale (English if available, otherwise the canonical zh-CN).
 *
 * Used by both /blog and /en/blog so the EN site never shows an empty list
 * even when no English translations exist yet — fallback cards are tagged
 * with isFallback=true so the UI can render a language badge.
 */
export const getLocalizedList = async (locale: Locale): Promise<ListedPost[]> => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const groups = groupByCanonicalSlug(posts);

  const out: ListedPost[] = [];
  for (const [slug, group] of groups) {
    const targetId = locale === DEFAULT_LOCALE ? slug : `${slug}.${locale}`;
    const localized = group.find((p) => p.id === targetId);
    if (localized) {
      out.push({ post: localized, isFallback: false });
      continue;
    }
    const canonical = group.find((p) => p.id === slug);
    if (!canonical) continue;
    out.push({ post: canonical, isFallback: locale !== DEFAULT_LOCALE });
  }

  return out.sort(
    (a, b) => b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf(),
  );
};

/**
 * Resolve the "newer / older" navigation for a post. Each neighbor is
 * resolved through the same locale as the current post, with fallback.
 */
export const getPostNeighbors = async (
  currentPost: BlogPost,
  locale: Locale,
): Promise<{ newer?: BlogPost; older?: BlogPost }> => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sorted = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  const idx = sorted.findIndex((p) => p.id === currentPost.id);
  if (idx < 0) return {};

  const newer = sorted[idx - 1];
  const older = sorted[idx + 1];

  const resolve = async (p: BlogPost | undefined): Promise<BlogPost | undefined> => {
    if (!p) return undefined;
    if (p.data.lang === locale) return p;
    const canonical = canonicalSlugOf(p.id);
    const resolved = await resolvePost(canonical, locale);
    return resolved?.post;
  };

  return {
    newer: await resolve(newer),
    older: await resolve(older),
  };
};
