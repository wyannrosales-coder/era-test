/**
 * Navigation options for UX testing. Option A is the original navigation; option B
 * (Figma 690:3977, the default) drops the hamburger on desktop and moves its content into
 * the bar and mega menus. `?nav=b` / `?nav=a` on any page switches, and the choice is
 * remembered on this device so it holds while moving between pages.
 *
 * The Locations menu has its own pair: A lists every property by city; B (Figma
 * 1081:16430, the default) lists the open ones and names the coming-soon ones beside
 * them, as information only. `?locations=b` / `?locations=a` switches it the same way.
 *
 * The footer logo has a pair too: B (Figma 1254:7885, the default) starts from the emblem
 * and opens it out into the wordmark; A assembles the wordmark. `?footer=a` / `?footer=b`.
 */
export type NavVariant = 'a' | 'b';

function readVariant(param: string, storageKey: string, fallback: NavVariant = 'a'): NavVariant {
  const fromUrl = new URLSearchParams(window.location.search).get(param)?.toLowerCase();
  if (fromUrl === 'a' || fromUrl === 'b') {
    try {
      window.localStorage.setItem(storageKey, fromUrl);
    } catch {
      // Storage unavailable: the URL choice still applies to this page
    }
    return fromUrl;
  }
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === 'a' || stored === 'b' ? stored : fallback;
  } catch {
    return fallback;
  }
}

/** Read once per page load (the choice only changes through the URL). */
export const NAV_VARIANT: NavVariant = readVariant('nav', 'epiisod-nav-variant', 'b');
export const LOCATIONS_MENU_VARIANT: NavVariant = readVariant('locations', 'epiisod-locations-menu-variant', 'b');
export const FOOTER_VARIANT: NavVariant = readVariant('footer', 'epiisod-footer-variant', 'b');
