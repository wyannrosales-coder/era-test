/**
 * Prototype settings (the nav's settings modal): choices that change how the whole site
 * looks while it is being reviewed. Each is kept on this device and applied as a
 * `data-` attribute on <html>, which src/styles/theme.css reads:
 *
 * - corners: `curved` (cards, photos and fields rounded) or `sharp` (square);
 * - theme: `light` (the current look) or `dark`.
 *
 * Whether the other properties are coming soon or all ready lives in prototypeMode.ts,
 * since it changes the pages themselves and so reloads the page.
 */
export type Corners = 'curved' | 'sharp';
export type Theme = 'light' | 'dark';

const KEYS = { corners: 'epiisod-corners', theme: 'epiisod-theme' } as const;

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

export const settings = {
  corners: read<Corners>(KEYS.corners, ['curved', 'sharp'], 'curved'),
  theme: read<Theme>(KEYS.theme, ['light', 'dark'], 'light'),
};

// The frozen v2 site keeps its own look
const IS_V2 = /^\/v2(\/|$)/.test(window.location.pathname);

const apply = () => {
  if (IS_V2) return;
  const root = document.documentElement;
  root.dataset.corners = settings.corners;
  root.dataset.theme = settings.theme;
};
apply();

const listeners = new Set<() => void>();
export const subscribeSettings = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function set<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
  settings[key] = value;
  try {
    window.localStorage.setItem(KEYS[key], value);
  } catch {
    // Storage unavailable: the choice holds until the page is reloaded
  }
  apply();
  listeners.forEach((fn) => fn());
}

export const setCorners = (v: Corners) => set('corners', v);
export const setTheme = (v: Theme) => set('theme', v);
export const resetSettings = () => {
  setCorners('curved');
  setTheme('light');
};
