/**
 * The length of stay and check-in date a visitor has chosen at a property, shared by its
 * property page (Rooms) and its room pages: choose them on one, and the other opens with
 * them too. Kept per property for the browser session; a room link's ?term=&date= wins.
 */
export type StayChoice = { stayId: string | null; date: string | null };

const key = (place: string) => `epiisod:stay:${place}`;
const today = () => new Date().toISOString().slice(0, 10);

export function readStayChoice(place: string, { ignoreUrl = false } = {}): StayChoice {
  let saved: Partial<StayChoice> = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(key(place)) ?? '{}') ?? {};
  } catch {
    // Storage blocked (private mode) or unreadable: start fresh
  }
  const params = new URLSearchParams(window.location.search);
  const fromUrl = !ignoreUrl && (params.has('term') || params.has('date'));
  const stayId = (fromUrl ? params.get('term') : saved.stayId) || null;
  const date = (fromUrl ? params.get('date') : saved.date) || null;
  // A check-in date that has passed no longer applies
  return { stayId, date: date && date >= today() ? date : null };
}

export function saveStayChoice(place: string, choice: StayChoice) {
  try {
    if (!choice.stayId && !choice.date) sessionStorage.removeItem(key(place));
    else sessionStorage.setItem(key(place), JSON.stringify(choice));
  } catch {
    // Storage blocked: the choice still carries over through the room links
  }
}

/**
 * Back/Forward can show a page straight from the browser's cache, as it was left; this
 * hands it the choice made since (on the other page) so the two stay in step.
 */
export function onStayChoiceRestored(place: string, apply: (choice: StayChoice) => void) {
  const handler = (e: PageTransitionEvent) => {
    if (e.persisted) apply(readStayChoice(place, { ignoreUrl: true }));
  };
  window.addEventListener('pageshow', handler);
  return () => window.removeEventListener('pageshow', handler);
}

/**
 * Where the visitor left the rooms list: the room card they opened and how far down the
 * screen it sat, so coming back from that room's page lands on the same spot.
 */
export type RoomsSpot = { roomId: string; top: number };
const spotKey = (place: string) => `epiisod:rooms-spot:${place}`;

export function saveRoomsSpot(place: string, spot: RoomsSpot) {
  try {
    sessionStorage.setItem(spotKey(place), JSON.stringify(spot));
  } catch {
    // Storage blocked: coming back lands at the top of the rooms instead
  }
}

export function takeRoomsSpot(place: string): RoomsSpot | null {
  try {
    const spot = JSON.parse(sessionStorage.getItem(spotKey(place)) ?? 'null') as RoomsSpot | null;
    sessionStorage.removeItem(spotKey(place));
    return spot;
  } catch {
    return null;
  }
}
