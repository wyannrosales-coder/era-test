/**
 * Prototype settings (the nav's settings modal): choices that change how the whole site
 * looks while it is being reviewed. Each is kept on this device and applied as a
 * `data-` attribute on <html>, which src/styles/theme.css reads:
 *
 * - corners, set apart for image containers, buttons (and fields) and cards (and panels):
 *   `curved` (rounded) or `sharp` (square);
 * - theme: `light` (the current look) or `dark`.
 *
 * Whether the other properties are coming soon or all ready lives in prototypeMode.ts,
 * since it changes the pages themselves and so reloads the page.
 */
export type Corners = 'curved' | 'sharp';
export type Theme = 'light' | 'dark';

export type CornerPart = 'media' | 'buttons' | 'cards';

const KEYS = {
  media: 'epiisod-corners-media',
  buttons: 'epiisod-corners-buttons',
  cards: 'epiisod-corners-cards',
  theme: 'epiisod-theme',
} as const;

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

// The first version had one corners choice for everything; it seeds the three
const legacyCorners = read<Corners>('epiisod-corners', ['curved', 'sharp'], 'curved');

export const settings = {
  media: read<Corners>(KEYS.media, ['curved', 'sharp'], legacyCorners),
  buttons: read<Corners>(KEYS.buttons, ['curved', 'sharp'], legacyCorners),
  cards: read<Corners>(KEYS.cards, ['curved', 'sharp'], legacyCorners),
  theme: read<Theme>(KEYS.theme, ['light', 'dark'], 'light'),
};

// The frozen v2 site keeps its own look
const IS_V2 = /^\/v2(\/|$)/.test(window.location.pathname);

const apply = () => {
  if (IS_V2) return;
  const root = document.documentElement;
  root.dataset.cornersMedia = settings.media;
  root.dataset.cornersButtons = settings.buttons;
  root.dataset.cornersCards = settings.cards;
  root.dataset.theme = settings.theme;
  // The hand-built experience pages have light and dark looks of their own (epiisod-version.js): 2 is light, 1 is dark
  (window as unknown as { __epVer?: { set: (v: string) => void } }).__epVer?.set(settings.theme === 'dark' ? '1' : '2');
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

export const setCorners = (part: CornerPart, v: Corners) => set(part, v);
export const setTheme = (v: Theme) => set('theme', v);
export const resetSettings = () => {
  setCorners('media', 'curved');
  setCorners('buttons', 'curved');
  setCorners('cards', 'curved');
  setTheme('light');
};
