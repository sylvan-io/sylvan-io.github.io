import type { Locale } from '../i18n';
import { DEFAULT_LOCALE, LOCALES } from '../i18n';
import { t as translate } from '../utils/t';

/** A link shown in the hero and footer.
 *  `icon` is any name from src/components/Icon.astro */
export interface SocialLink {
  url: string;
  label: string;
  icon?:
    | 'github'
    | 'linkedin'
    | 'instagram'
    | 'email'
    | 'rss'
    | 'download'
    | 'arrow-right'
    | 'arrow-left'
    | 'sun'
    | 'moon';
}

/**
 * A name rendered in the Hero heading.
 *
 * The full name is split into `family` (the part painted in the default
 * text color) and `given` (the part painted with the accent gradient via
 * `.accent`). Order follows the locale's writing system: family-first for
 * CJK, given-first for Western names. Every locale listed in `LOCALES`
 * must have an entry in `site.author.nameByLocale`.
 */
export interface LocalizedName {
  family: string;
  given: string;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  Site identity — edit this file first.
 *  Everything on the site (titles, meta tags, footer, hero
 *  social links) reads from here.
 * ─────────────────────────────────────────────────────────────
 */
export const site = {
  /** Full name — used for <title> and meta tags. Brand name, do NOT translate. */
  title: 'Sylvan',
  /** Short handle used in page titles and the brand mark. Do NOT translate. */
  shortTitle: 'Sylvan',
  /** Production URL — no trailing slash. Used for canonical URLs, OG tags, RSS and sitemap */
  url: 'https://sylvan-io.github.io',
  author: {
    /** Canonical (English) display name. Used in <title>, JSON-LD, etc. */
    name: 'Sylvan',
    /**
     * Per-locale display name for the Hero heading. Keys must cover every
     * entry in `LOCALES`. `family` is rendered as plain text; `given` is
     * rendered with the accent gradient.
     *
     * Note: the splash page (src/pages/index.astro) intentionally keeps
     * the English `shortTitle` instead of using this map.
     */
    nameByLocale: {
      'zh-CN': { family: '欧', given: '雪映' },
      en: { family: '', given: 'Sylvan' },
    } satisfies Record<Locale, LocalizedName>,
    email: 'ou_xue_ying@sina.com',         // TODO: replace with real email
    location: 'China',
    /** Optional: link to a PDF résumé served from /public */
    resume: '/resume/Resume.pdf',
  },
  /** Shown in the hero and footer. Set a slot to null to skip rendering it. */
  socials: {
    github:    { url: 'https://github.com/sylvan-io', label: 'GitHub', icon: 'github' },     // TODO: replace handle
    //linkedin:  { url: 'https://www.linkedin.com/in/sylvan-io', label: 'LinkedIn', icon: 'linkedin' }, // TODO: replace or set to null
    //instagram: { url: 'https://www.instagram.com/sylvan-io', label: 'Instagram', icon: 'instagram' }, // TODO: replace or set to null
    email:     { url: 'mailto:ou_xue_ying@sina.com', label: 'Email', icon: 'email' },            // TODO: replace
    rss:       { url: '/rss.xml', label: 'RSS', icon: 'rss' },
  } satisfies Record<string, SocialLink | null>,
};

export type SocialKey = keyof typeof site.socials;

/**
 * Compile-time check that every locale in `LOCALES` has a `nameByLocale`
 * entry. Without this, a new locale would silently fall through to the
 * `name` split and break the Hero heading.
 */
const _localizedNameCoverage: Record<Locale, true> = LOCALES.reduce(
  (acc, loc) => {
    if (!site.author.nameByLocale[loc]) {
      throw new Error(`site.author.nameByLocale is missing an entry for locale "${loc}".`);
    }
    acc[loc] = true;
    return acc;
  },
  {} as Record<Locale, true>,
);
void _localizedNameCoverage;

/**
 * Resolve the meta description for the requested locale.
 * Default fallback is the default locale.
 */
export const siteDescription = (locale: Locale | undefined = DEFAULT_LOCALE): string =>
  translate('site.description', undefined, locale);

/**
 * Prefix a root-relative path ("/img/x.jpg") with the configured base
 * path. Pass-through for external URLs and already-prefixed paths.
 */
export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (!path.startsWith('/')) return path;
  if (path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
};
