import { experienceHref } from '../../lib/links';
import { MACQUARIE_AMENITY_GROUPS } from './amenityModel';
import type { AmenityGroup } from './amenityModel';
import hero from '../../assets/property/hero.jpg';
import roomQuad from '../../assets/property/rooms/quad-ensuite.jpg';
import roomSignature from '../../assets/property/rooms/signature-studio.jpg';
import roomSignatureFlex from '../../assets/property/rooms/signature-studio-flex.jpg';
import roomAspect from '../../assets/property/rooms/aspect-studio.jpg';
import roomAspectE from '../../assets/property/rooms/aspect-studio-e.jpg';
import roomEmpowered from '../../assets/property/rooms/empowered-studio.jpg';
import roomPremier from '../../assets/property/rooms/premier-empowered-studio.jpg';
import promoBanner from '../../assets/property/promo-banner.jpg';
import exterior from '../../assets/about/wide-macquarie.jpg';
import lobby from '../../assets/property/amenity-lobby.jpg';
import study from '../../assets/property/amenity-wifi.jpg';
import building from '../../assets/property/amenity-secure.jpg';
import coffee from '../../assets/experience/coffee.jpg';
import socialTable from '../../assets/property/amenity-social.jpg';
import { OFFERS } from '../promotions/promotionsData';
import { MACQUARIE_PARK_PLACES } from './macquarieParkMap';
import { MACQUARIE_PARK_ROOM_DETAILS, type RoomDetails } from './roomDetails';

export type RoomType = 'Studio' | 'Shared';

/** Status tag on a room card (Figma 539:30241). */
export type RoomTag = 'offer' | 'popular' | 'promotion' | 'soldOut' | 'value';

export type Room = {
  id: string;
  /** Used by the Studio / Shared filter. */
  type: RoomType;
  /** Shown above the name, e.g. "Shared Apartment". */
  typeLabel: string;
  name: string;
  image: string;
  tag: RoomTag;
  /** Views, e.g. "Garden/Urban/Pool/City", where known. */
  features?: string;
  /** Weekly price with no length of stay chosen. */
  price: number;
  available: boolean;
};

/**
 * A length of stay (lease term) a room can be booked for, as offered on the live site's
 * "Preferred Length of Stay" list. Each has its own check-in window and weekly prices.
 */
export type Stay = {
  id: string;
  /** The term's heading in the list, e.g. "Academic Year 2027". */
  group: string;
  /** e.g. "52 weeks". */
  label: string;
  /** Check-in is open between these dates (ISO, inclusive). */
  checkIn: { from: string; to: string };
  /** Weekly price per room id; rooms missing here aren't offered for this stay. */
  prices: Record<string, number>;
};

export type Promo = { id: string; title: string; text: string; image: string };

/** An amenity in the scroll story (Figma 1082:17874): `lead` is set in italic. */
export type Amenity = {
  lead: string;
  rest: string;
  text: string;
  /** The full-screen photo behind the list while it's active. */
  image: string;
  /** Figma's crop, as object-position with a zoom about it (default: centred cover). */
  crop?: { position: string; zoom: number };
};

export type Faq = { question: string; answer: string };

/** A place near the property; `image` is its photo in the finder, where there is one. */
export type MapPlace = { name: string; address: string; lat: number; lng: number; image?: string };
export type MapCategory = { name: string; places: MapPlace[] };

export type PropertyContent = {
  /** The property's experience page, when it has one (lib/links.ts). */
  experienceHref?: string;
  /** Shown before the italic part of the name, e.g. "EPIISOD" + "Macquarie Park". */
  brand: string;
  place: string;
  city: string;
  address: string;
  hero: string;
  amenities: Amenity[];
  /** Where the property has a 3D building: amenities by group, shown in place of the photo amenities. */
  amenities3d?: AmenityGroup[];
  rooms: Room[];
  /** Each room's details page (Figma 1195:26614), by room id. */
  roomDetails: RoomDetails[];
  roomCurrency: string;
  /** Lengths of stay, in the order listed. */
  stays: Stay[];
  /** The property's own pin. */
  mapCenter: { lat: number; lng: number };
  /** Nearby places, by category: the map's markers and its filter tabs. */
  mapPlaces: MapCategory[];
  promotion: { eyebrow: string; title: string; text: string; image: string };
  promos: Promo[];
  faqs: Faq[];
};

/** Room ids in the order of the price lists below. */
const ROOM_ORDER = ['quad', 'quint', 'signature', 'signature-flex', 'aspect', 'aspect-e', 'empowered', 'premier-empowered'];
const priceList = (...weekly: number[]) => Object.fromEntries(weekly.map((p, i) => [ROOM_ORDER[i], p]));

/**
 * Lengths of stay at EPIISOD Macquarie Park, with the weekly prices from the live site
 * (epiisod.com, October 2026). The AY 2027 check-in window is the live site's; the AY 2026
 * and Short Stay windows aren't published there, so these are assumptions to confirm —
 * Short Stay's follows its "min 12 weeks, move out by 12th Feb 2027".
 */
const MACQUARIE_PARK_STAYS: Stay[] = [
  { id: '4175', group: 'Academic Year 2027', label: '52 weeks', checkIn: { from: '2026-12-01', to: '2027-03-31' }, prices: priceList(615, 615, 725, 727, 745, 840, 873, 893) },
  { id: '4174', group: 'Academic Year 2027', label: '48 weeks', checkIn: { from: '2026-12-01', to: '2027-03-31' }, prices: priceList(615, 615, 725, 727, 745, 840, 873, 893) },
  { id: '4173', group: 'Academic Year 2027', label: '44 weeks', checkIn: { from: '2026-12-01', to: '2027-03-31' }, prices: priceList(615, 615, 725, 727, 745, 840, 873, 893) },
  { id: '4172', group: 'Academic Year 2027', label: '24 weeks', checkIn: { from: '2026-12-01', to: '2027-03-31' }, prices: priceList(655, 655, 765, 767, 785, 880, 913, 933) },
  { id: '4165', group: 'Academic Year 2026', label: '52 weeks', checkIn: { from: '2026-01-01', to: '2026-11-30' }, prices: priceList(599, 599, 699, 786, 786, 832, 865, 893) },
  { id: '4164', group: 'Academic Year 2026', label: '48 weeks', checkIn: { from: '2026-01-01', to: '2026-11-30' }, prices: priceList(599, 599, 699, 786, 786, 832, 865, 893) },
  { id: '4170', group: 'Academic Year 2026', label: '44 weeks', checkIn: { from: '2026-01-01', to: '2026-11-30' }, prices: priceList(599, 599, 699, 786, 786, 832, 865, 893) },
  { id: '4163', group: 'Academic Year 2026', label: '24 weeks', checkIn: { from: '2026-01-01', to: '2026-11-30' }, prices: priceList(639, 639, 816, 826, 826, 872, 905, 933) },
  // Only these two studios are offered for a short stay
  { id: 'short-stay-term', group: 'Short Stay', label: 'Min 12 weeks, move out by 12 Feb 2027', checkIn: { from: '2026-01-01', to: '2026-11-20' }, prices: { signature: 816, aspect: 826 } },
];

// TODO: replace with the real answers — the design only lists the questions.
const PENDING_ANSWER =
  'Our team is preparing a detailed answer. In the meantime, visit the FAQ page or contact us and we will be happy to help.';

/** Content for EPIISOD Macquarie Park (Figma 539:13190). */
export const MACQUARIE_PARK: PropertyContent = {
  experienceHref: experienceHref('macquarie-park'),
  brand: 'EPIISOD',
  place: 'Macquarie Park',
  city: 'Sydney',
  address: 'EPIISOD Macquarie Park, 17 Lachlan Ave, Macquarie Park NSW 2113',
  hero,
  // Photos and crops from Figma 1099:34869; every description is a placeholder (Figma:
  // "Something lorem ipsum…").
  amenities3d: MACQUARIE_AMENITY_GROUPS,
  amenities: [
    {
      lead: 'Prime',
      rest: ' Location',
      text: 'Minutes from Macquarie University, the Metro and Macquarie Centre.',
      image: exterior,
      crop: { position: '0% 62%', zoom: 1.357 },
    },
    {
      lead: 'Reception',
      rest: ' 24/7',
      text: 'A friendly team on hand day and night, whenever you need us.',
      image: lobby,
      crop: { position: '0% 88%', zoom: 1.63 },
    },
    {
      lead: 'Unlimited',
      rest: ' WiFi',
      text: 'Fast, reliable internet in every room and shared space.',
      image: study,
      crop: { position: '0% 100%', zoom: 1.169 },
    },
    {
      lead: 'Secure',
      rest: ' Building',
      text: 'Keyless entry and 24/7 security, so you can feel at home.',
      image: building,
      crop: { position: '18% 32%', zoom: 1.341 },
    },
    {
      lead: 'Onsite',
      rest: ' Cafe',
      text: 'Coffee and a bite downstairs, made just for residents.',
      image: coffee,
      crop: { position: '0% 67%', zoom: 1.16 },
    },
    {
      lead: 'Big Social',
      rest: ' Calendar',
      text: 'Dinners, events and trips that make it easy to meet people.',
      image: socialTable,
    },
  ],
  rooms: [
    { id: 'quad', type: 'Shared', typeLabel: 'Shared Apartment', name: 'Quad 4 Bedroom Ensuite', image: roomQuad, tag: 'offer', price: 615, available: true },
    { id: 'quint', type: 'Shared', typeLabel: 'Shared Apartment', name: 'Quint 5 Bedroom Ensuite', image: roomQuad, tag: 'popular', price: 615, available: true },
    { id: 'signature', type: 'Studio', typeLabel: 'Studio', name: 'Signature Studio', image: roomSignature, tag: 'promotion', features: 'Garden/Urban/Pool/City', price: 725, available: true },
    { id: 'signature-flex', type: 'Studio', typeLabel: 'Studio', name: 'Signature Studio Flex', image: roomSignatureFlex, tag: 'promotion', price: 727, available: true },
    { id: 'aspect', type: 'Studio', typeLabel: 'Studio', name: 'Aspect Studio', image: roomAspect, tag: 'promotion', features: 'Garden/Urban/Pool/City', price: 745, available: true },
    { id: 'aspect-e', type: 'Studio', typeLabel: 'Studio', name: 'Aspect Studio E', image: roomAspectE, tag: 'promotion', features: 'Garden/Pool', price: 840, available: true },
    { id: 'empowered', type: 'Studio', typeLabel: 'Studio', name: 'Empowered Studio', image: roomEmpowered, tag: 'soldOut', price: 873, available: false },
    { id: 'premier-empowered', type: 'Studio', typeLabel: 'Studio', name: 'Premier Empowered Studio', image: roomPremier, tag: 'value', price: 893, available: true },
  ],
  roomDetails: MACQUARIE_PARK_ROOM_DETAILS,
  roomCurrency: 'AU$',
  stays: MACQUARIE_PARK_STAYS,
  mapCenter: { lat: -33.77917242506175, lng: 151.11718975214868 },
  mapPlaces: MACQUARIE_PARK_PLACES,
  promotion: {
    eyebrow: 'Promotion',
    title: 'Refer a Friend - Double the Joy, $600 in Rewards!',
    text: "Refer a friend to EPIISOD and you'll both receive a $300 rent credit once they move in. It's our way of saying thanks for growing our community!",
    image: promoBanner,
  },
  // The same offers as the Promotions page (Figma 1082:16918)
  promos: OFFERS.map(({ id, title, text, image }) => ({ id, title, text, image })),
  faqs: [
    'What documents are required to book a room?',
    'How do I book a room?',
    'What payments do I need to make when applying?',
    'When do I pay my rent?',
    'Is my reservation confirmed once I pay the holding deposit?',
    'Can I view the accommodation before applying?',
    'What is included in my rent?',
    'Will I be able to select my own desired room?',
    'Can I live with my friends or specify preferences for my roommates?',
    'Can I have additional occupant staying with me throughout my lease?',
  ].map((question) => ({ question, answer: PENDING_ANSWER })),
};
