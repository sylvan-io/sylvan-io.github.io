import type { BlogTag } from '../content.config';
import { DEFAULT_LOCALE, type Locale } from '../i18n';
import { t as translate } from './t';

/**
 * Resolve a tag label for the requested locale.
 * Falls back to the default locale (zh-CN) when the dictionary has no entry.
 */
export const getTagLabel = (slug: BlogTag, locale: Locale | string = DEFAULT_LOCALE): string =>
  translate(`tags.${slug}`, undefined, locale);

/**
 * Resolve a tag description for the requested locale.
 */
export const getTagDescription = (slug: BlogTag, locale: Locale | string = DEFAULT_LOCALE): string =>
  translate(`tags.descriptions.${slug}`, undefined, locale);
