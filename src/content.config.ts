import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog tags — English slugs in frontmatter, displayed in the active locale
 * via src/utils/tags.ts. Keep both the slug list (BLOG_TAGS) and the
 * translation keys (`tags.<slug>` in src/i18n/*.json) in sync.
 */
export const BLOG_TAGS = [
  'cs-fundamentals',
  'go',
  'java',
  'python',
  'rust',
  'ai',
  'containers',
  'middleware',
  'architecture',
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

/** Locales a blog post can be written in. Mirrors src/i18n/index.ts. */
export const BLOG_LANGS = ['zh-CN', 'en'] as const;
export type BlogLang = (typeof BLOG_LANGS)[number];

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    /**
     * Explicit content id. Required for any post whose filename contains
     * characters that Astro's slugger would mangle (notably the `.en` locale
     * suffix). For the canonical zh-CN post the filename alone is enough.
     *
     * Convention: `slug` MUST equal the canonical slug for zh-CN posts,
     * and `<canonical>.en` for English translations.
     */
    slug: z.string().optional(),
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.enum(BLOG_TAGS)).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    /** ISO locale code for this post's content. Defaults to zh-CN. */
    lang: z.enum(BLOG_LANGS).default('zh-CN'),
    /**
     * Cross-language links. The key is the OTHER language, the value is that
     * post's id (typically the canonical slug, e.g. 'hello-world' for the
     * zh-CN file and 'hello-world.en' for the English file).
     *
     * The .en convention auto-detects its zh-CN peer by stripping `.en`,
     * so this field is technically optional — declare it only when the
     * id mapping is non-obvious.
     */
    translations: z.record(z.string(), z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repoUrl: z.string().url(),
    demoUrl: z.string().url().optional(),
    stack: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
    lang: z.enum(BLOG_LANGS).default('zh-CN'),
  }),
});

export const collections = { blog, projects };
