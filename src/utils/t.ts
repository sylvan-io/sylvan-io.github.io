/**
 * Translation helper.
 *
 * Usage:
 *   import { useT } from '../utils/t';
 *   const t = useT(Astro.currentLocale);
 *   const heading = t('blog.heading');                         // -> "文章"
 *   const link    = t('blogPost.readingTime', { minutes: 8 }); // -> "8 分钟阅读"
 *
 * Behavior:
 *   - The caller passes the locale explicitly via useT() so this helper has
 *     no dependency on Astro's runtime globals.
 *   - Falls back to `DEFAULT_LOCALE` when a key is missing in the requested locale.
 *   - Returns the dotted key itself if the key is missing in BOTH locales —
 *     the build still succeeds and the missing string is easy to grep for.
 *   - Interpolation: `{name}` placeholders are replaced from the `vars` map.
 */
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n';
import zhCN from '../i18n/zh-CN.json';
import en from '../i18n/en.json';

type Dict = Record<string, unknown>;

const DICTIONARIES: Record<Locale, Dict> = {
  'zh-CN': zhCN as Dict,
  en: en as Dict,
};

/**
 * Resolve `a.b.c` against a nested dictionary.
 * Returns `undefined` when any segment is missing.
 */
function lookup(dict: Dict, key: string): unknown {
  const segments = key.split('.');
  let cur: unknown = dict;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in (cur as Dict)) {
      cur = (cur as Dict)[seg];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** Interpolate `{name}` style placeholders. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      return String(vars[name]);
    }
    return match;
  });
}

/**
 * Curried form: returns a `t(key, vars?)` bound to a locale.
 * Use this in .astro frontmatter so you don't repeat the locale arg.
 */
export function useT(locale: Locale | string | undefined) {
  const effective: Locale = (locale && (LOCALES as readonly string[]).includes(locale as Locale))
    ? (locale as Locale)
    : DEFAULT_LOCALE;

  return (key: string, vars?: Record<string, string | number>) => {
    const primary = lookup(DICTIONARIES[effective], key);
    if (typeof primary === 'string') return interpolate(primary, vars);

    if (effective !== DEFAULT_LOCALE) {
      const fallback = lookup(DICTIONARIES[DEFAULT_LOCALE], key);
      if (typeof fallback === 'string') return interpolate(fallback, vars);
    }

    // Last resort: return the key so the missing string is grep-able.
    return key;
  };
}

/**
 * Imperative form. Mostly useful in TS files that don't have an `Astro`
 * global (RSS generator, robots.txt). Pass the locale explicitly.
 */
export function t(
  key: string,
  vars?: Record<string, string | number>,
  locale?: Locale | string,
): string {
  return useT(locale)(key, vars);
}
