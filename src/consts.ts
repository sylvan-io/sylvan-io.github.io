/**
 * Site-wide constants.
 *
 * Navigation labels are kept here as translation keys so every page renders
 * the label via `t(navItem.labelKey)`. Edit the strings themselves in
 * src/i18n/*.json.
 */

export const SITE_TITLE = 'Shane Ou';
export const SITE_DESCRIPTION_KEY = 'site.description' as const;

export type NavItem = {
  href: string;
  /** Dotted path into the i18n dictionary. */
  labelKey: 'nav.home' | 'nav.work' | 'nav.blog' | 'nav.projects';
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/home', labelKey: 'nav.home' },
  { href: '/work', labelKey: 'nav.work' },
  { href: '/blog', labelKey: 'nav.blog' },
  { href: '/projects', labelKey: 'nav.projects' },
];
