/**
 * Locale helpers — single source of truth for the locales we ship.
 * Keep in sync with `i18n.locales` in astro.config.mjs.
 */
export const LOCALES = ['zh-CN', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-CN';

/** Human-readable label for the UI language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
};

/** BCP-47 code used for hreflang / <html lang>. */
export const LOCALE_BCP47: Record<Locale, string> = {
  'zh-CN': 'zh-CN',
  en: 'en',
};

/** OG locale string used by Open Graph protocol. */
export const OG_LOCALES: Record<Locale, string> = {
  'zh-CN': 'zh_CN',
  en: 'en_US',
};

/** Narrow an `unknown` value (e.g. a frontmatter field) to a known Locale. */
export function asLocale(value: unknown): Locale {
  return (LOCALES as readonly string[]).includes(value as string)
    ? (value as Locale)
    : DEFAULT_LOCALE;
}

/**
 * Strip an optional locale prefix from a pathname.
 *   stripLocalePrefix('/en/blog/foo', 'en') -> '/blog/foo'
 *   stripLocalePrefix('/blog/foo',    'en') -> '/blog/foo'
 */
export function stripLocalePrefix(pathname: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return pathname;
  const prefix = `/${locale}`;
  if (pathname === prefix) return '/';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

/**
 * Add a locale prefix to a pathname.
 *   prefixPathname('/blog/foo', 'en') -> '/en/blog/foo'
 *   prefixPathname('/blog/foo', 'zh-CN') -> '/blog/foo'
 */
export function prefixPathname(pathname: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return pathname;
  const base = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `/${locale}${base === '/' ? '' : base}`;
}

/**
 * Given a post id like `hello-world` or `hello-world.en`, return the
 * canonical slug (the part other locales share).
 *   canonicalSlugOf('hello-world.en') -> 'hello-world'
 *   canonicalSlugOf('hello-world')    -> 'hello-world'
 */
export function canonicalSlugOf(postId: string): string {
  return postId.endsWith('.en') ? postId.slice(0, -3) : postId;
}
