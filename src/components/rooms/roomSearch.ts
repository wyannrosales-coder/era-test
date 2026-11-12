/**
 * Room search: the five filters of the live site's Find a room page (epiisod.com/en-au/
 * find-a-room, November 2026) and the rules that tie them together.
 *
 * - City narrows Institution (a city's own institutions, plus the nationwide ones) and
 *   Term (the 26-week AY 2027 lease is Melbourne only).
 * - A filter left empty ('') means "any".
 * - Room types, Price range and Term don't depend on each other.
 */
import { MACQUARIE_PARK } from '../property/propertyContent';
import type { PropertyContent, RoomType } from '../property/propertyContent';
import { PROPERTIES } from '../locationData';
import { PROPERTY_PAGES } from '../property/propertyPages';
import { ALL_READY } from '../../lib/prototypeMode';
import { BEDFORD } from '../property/bedfordContent';

export type CityId = 'melbourne' | 'sydney' | 'perth' | 'london';

export type Filters = {
  city: '' | CityId;
  institution: string;
  type: '' | RoomType;
  price: string;
  term: string;
};
export const NO_FILTERS: Filters = { city: '', institution: '', type: '', price: '', term: '' };

export const CITIES: { id: CityId; label: string }[] = [
  { id: 'melbourne', label: 'Melbourne' },
  // Perth only once its properties are open (prototype switch)
  ...(ALL_READY ? [{ id: 'perth' as const, label: 'Perth' }] : []),
  { id: 'sydney', label: 'Sydney' },
];

/** `city: null` institutions are offered in every city. */
type Institution = { id: string; label: string; city: CityId | null };
const nationwide = (ids: string[]): Institution[] =>
  ids.map((label) => ({ id: label, label, city: null }));
const inCity = (city: CityId, labels: string[]): Institution[] =>
  labels.map((label) => ({ id: label, label, city }));

export const INSTITUTIONS: Institution[] = [
  ...nationwide([
    'Carnegie Melon University',
    'Eynesbury College',
    'Flinders University',
    'ICHM',
    'Kaplan Professional',
    'Le Cordon Bleu',
    'TAFE',
    'Torrens University Australia',
    'University of Adelaide',
    'University of South Australia',
  ]),
  ...inCity('melbourne', [
    'Deakin University',
    'Federation University',
    'La Trobe University',
    'Monash University',
    'RMIT University',
    'Swinburne University',
    'Torrens University',
    'University of Melbourne',
    'Victoria University',
  ]),
  ...inCity('sydney', [
    'Australian Catholic University',
    'Macquarie University',
    'The University of New South Wales',
    'The University of Sydney',
    'UNSW Sydney',
    'University of Australia',
    'University of Sydney',
    'University of Technology Sydney',
    'Western Sydney University',
  ]),
];

export const ROOM_TYPES: { id: RoomType; label: string }[] = [
  { id: 'Studio', label: 'Studio' },
  { id: 'Shared', label: 'Shared Apartment' },
];

export const PRICE_RANGES = [
  { id: 'under-650', label: 'Under AU$650', test: (p: number) => p < 650 },
  { id: '650-800', label: 'AU$650 - 800', test: (p: number) => p >= 650 && p <= 800 },
  { id: 'over-800', label: 'Above AU$800', test: (p: number) => p > 800 },
];

/** A lease term; `stayIds` are the property stays (propertyContent) it prices. */
type Term = { id: string; label: string; stayIds: string[]; cities?: CityId[] };
export const TERMS: Term[] = [
  { id: '4163', label: 'AY2026 24 Weeks Lease', stayIds: ['4163'] },
  { id: '4164', label: 'AY2026 48 Weeks Lease', stayIds: ['4164'] },
  { id: '4165', label: 'AY2026 52 Weeks Lease', stayIds: ['4165'] },
  { id: '4170', label: 'AY2026 44 Weeks Lease', stayIds: ['4170'] },
  { id: '4172', label: 'AY 2027 24 Weeks Lease', stayIds: ['4172'] },
  { id: '4173', label: 'AY 2027 44 Weeks Lease', stayIds: ['4173'] },
  { id: '4174', label: 'AY 2027 48 Weeks Lease', stayIds: ['4174'] },
  { id: '4175', label: 'AY 2027 52 Weeks Lease', stayIds: ['4175', '5141'] },
  { id: '5143', label: 'AY 2027 26 Weeks Lease', stayIds: ['5143'], cities: ['melbourne'] },
  { id: 'short-stay-term', label: 'Short Stay - Min 12 weeks, move out by 12th Feb 2027', stayIds: ['short-stay-term'] },
];

/** What each dropdown offers for the chosen city, in the order shown. */
export const institutionsFor = (city: Filters['city']) =>
  INSTITUTIONS.filter((i) => !city || i.city === null || i.city === city);
export const termsFor = (city: Filters['city']) => TERMS.filter((t) => !city || !t.cities || t.cities.includes(city));

/** Applies a change, dropping an Institution or Term the new City doesn't offer. */
export function changeFilters(current: Filters, patch: Partial<Filters>): Filters {
  const next = { ...current, ...patch };
  if (next.institution && !institutionsFor(next.city).some((i) => i.id === next.institution)) next.institution = '';
  if (next.term && !termsFor(next.city).some((t) => t.id === next.term)) next.term = '';
  return next;
}

/** A room as the search sees it, whichever property it belongs to. */
export type SearchRoom = {
  key: string;
  propertyId: string;
  /** e.g. "EPIISOD Macquarie Park". */
  property: string;
  city: string;
  cityId: CityId;
  roomId: string;
  type: RoomType;
  typeLabel: string;
  name: string;
  image: string;
  /** e.g. "11.8 sqm". */
  size?: string;
  features?: string;
  available: boolean;
  /** The room's own page, once it has one. */
  href?: string;
  currency: string;
  /** Weekly price with no term chosen (the property page's own list price). */
  basePrice?: number;
  /** Before bookings open (e.g. "Opening Semester 2, 2027"): shown in place of a price. */
  opening?: string;
  /** Weekly price per stay id. */
  prices: Record<string, number>;
};

/** The rooms of a property that has its own page. */
export function roomsOf(content: PropertyContent, propertyId: string): SearchRoom[] {
  const property = PROPERTIES.find((p) => p.id === propertyId);
  return content.rooms.map((room) => {
    const details = content.roomDetails.find((d) => d.roomId === room.id);
    const prices: Record<string, number> = {};
    // Before opening a stay lists the room without a price
    if (!content.opening) for (const stay of content.stays) if (stay.prices[room.id] !== undefined) prices[stay.id] = stay.prices[room.id];
    return {
      key: `${propertyId}:${room.id}`,
      propertyId,
      property: `${content.brand} ${content.place}`,
      city: content.city,
      cityId: content.city.toLowerCase() as CityId,
      roomId: room.id,
      type: room.type,
      typeLabel: room.typeLabel,
      name: room.name,
      image: room.image,
      size: details?.size.split(' (')[0],
      features: room.features,
      available: room.available,
      href: details && property?.href ? `${property.href}/${details.slug}` : undefined,
      currency: content.roomCurrency,
      basePrice: content.opening ? undefined : room.price,
      opening: content.opening,
      prices,
    };
  });
}

/**
 * Every room across every property. With every property ready (prototype switch), each
 * Australian one lists its own rooms with prices (Bedford's have none yet).
 */
export const ALL_ROOMS: SearchRoom[] = ALL_READY
  ? PROPERTIES.filter((p) => PROPERTY_PAGES[p.id] && p.city !== 'London').flatMap((p) =>
      roomsOf(PROPERTY_PAGES[p.id], p.id),
    )
  : [...roomsOf(MACQUARIE_PARK, 'macquarie-park'), ...roomsOf(BEDFORD, 'bedford')];

/**
 * A room's weekly price: for a chosen term, that term's; otherwise the lowest the room
 * is offered at (`lowest`, as the Find a room page's "From") or its list price (`list`,
 * as the property page).
 */
export function weeklyPrice(room: SearchRoom, termId: string, mode: 'lowest' | 'list'): number | undefined {
  if (termId) {
    const term = TERMS.find((t) => t.id === termId);
    return term?.stayIds.map((id) => room.prices[id]).find((p) => p !== undefined);
  }
  const all = Object.values(room.prices);
  if (mode === 'list') return room.basePrice;
  return all.length ? Math.min(...all) : room.basePrice;
}

export type Result = { room: SearchRoom; weekly?: number };

/** The rooms matching every filter, cheapest first, with priceless rooms last. */
export function searchRooms(rooms: SearchRoom[], f: Filters, mode: 'lowest' | 'list' = 'lowest'): Result[] {
  const range = PRICE_RANGES.find((r) => r.id === f.price);
  const institution = INSTITUTIONS.find((i) => i.id === f.institution);
  return rooms
    .filter((r) => !f.city || r.cityId === f.city)
    .filter((r) => !institution || institution.city === null || institution.city === r.cityId)
    .filter((r) => !f.type || r.type === f.type)
    .map((room) => ({ room, weekly: weeklyPrice(room, f.term, mode) }))
    // A term or price range only matches rooms that have a price for it
    .filter(({ weekly }) => (!f.term && !range) || weekly !== undefined)
    .filter(({ weekly }) => !range || range.test(weekly!))
    .sort((a, b) => (a.weekly ?? Infinity) - (b.weekly ?? Infinity));
}
