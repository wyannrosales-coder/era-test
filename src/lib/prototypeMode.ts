/**
 * Prototype switch: how the properties stand. `soon` is today (Macquarie Park open, the
 * others coming soon); `ready` shows the site as if every property had opened — their
 * pages, rooms, experience links and menus all live, built from Macquarie Park's content
 * as a stand-in until each has its own. `?properties=ready` / `?properties=soon` on any
 * page switches, and the choice is remembered on this device (the nav's toggle sets it).
 */
export type PropertyState = 'soon' | 'ready';

const KEY = 'epiisod-property-state';

function read(): PropertyState {
  const fromUrl = new URLSearchParams(window.location.search).get('properties')?.toLowerCase();
  if (fromUrl === 'soon' || fromUrl === 'ready') {
    try {
      window.localStorage.setItem(KEY, fromUrl);
    } catch {
      // Storage unavailable: the URL choice still applies to this page
    }
    return fromUrl;
  }
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === 'ready' ? 'ready' : 'soon';
  } catch {
    return 'soon';
  }
}

/** Read once per page load; changing it reloads the page. */
export const PROPERTY_STATE: PropertyState = read();
export const ALL_READY = PROPERTY_STATE === 'ready';

export function setPropertyState(next: PropertyState) {
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // Storage unavailable: fall back to the URL
  }
  const url = new URL(window.location.href);
  url.searchParams.set('properties', next);
  window.location.assign(url.toString());
}
