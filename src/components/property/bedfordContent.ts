/**
 * Content for EPIISOD Bedford, North Melbourne (v2), laid out as Macquarie Park's page.
 * The hero is Figma 1461:12924; everything else is from the live site
 * (epiisod.com/en-au/melbourne/epiisod-bedford, November 2026). Bedford opens in
 * Semester 2, 2027, so there are no prices yet: rooms register interest instead of booking.
 */
import hero from '../../assets/property/bedford/hero.jpg';
import location from '../../assets/property/bedford/amenity-location.jpg';
import wellness from '../../assets/property/bedford/amenity-wellness.jpg';
import ease from '../../assets/property/bedford/amenity-ease.jpg';
import smart from '../../assets/property/bedford/amenity-smart.jpg';
import experience from '../../assets/property/bedford/amenity-experience.jpg';
import { BEDFORD_PLACES } from './bedfordMap';
import { BEDFORD_ROOM_DETAILS, BEDFORD_ROOMS } from './bedfordRooms';
import { MACQUARIE_PARK, type PropertyContent, type Stay } from './propertyContent';

/** Every room is offered for both terms; no prices until bookings open. */
const ALL_ROOMS = Object.fromEntries(BEDFORD_ROOMS.map((r) => [r.id, 0]));

/**
 * The live site's two terms. Both contracts start on 1 January 2027; the live site doesn't
 * publish a check-in window, so January–March is an assumption to confirm.
 */
const BEDFORD_STAYS: Stay[] = [
  { id: '5141', group: 'Academic Year 2027', label: '52 weeks', checkIn: { from: '2027-01-01', to: '2027-03-31' }, prices: ALL_ROOMS },
  { id: '5143', group: 'Academic Year 2027', label: '26 weeks', checkIn: { from: '2027-01-01', to: '2027-03-31' }, prices: ALL_ROOMS },
];

export const BEDFORD: PropertyContent = {
  slug: 'bedford',
  liveUrl: 'https://epiisod.com/en-au/melbourne/epiisod-bedford',
  opening: 'Opening Semester 2, 2027',
  brand: 'EPIISOD',
  place: 'Bedford',
  city: 'Melbourne',
  address: 'EPIISOD Bedford, 33 Bedford St, North Melbourne VIC 3051',
  streetAddress: '33 Bedford St, North Melbourne VIC 3051',
  heroTitleOneLine: true,
  hero,
  // Figma's crop: the photo fills the width from its top edge
  heroPosition: 'center top',
  // The live site's five slides, each with its highlights as the line below
  amenities: [
    {
      lead: 'Prime',
      rest: ' Location',
      text: '7 min walk to the University of Melbourne, 8 min tram ride to Victoria Market and 13 min to RMIT University.',
      image: location,
    },
    {
      lead: 'Wellness',
      rest: ' Spaces',
      text: 'A gym and yoga studio, weekly fitness sessions, and a rooftop pool, sauna and ice plunge.',
      image: wellness,
    },
    {
      lead: 'Everyday',
      rest: ' Ease',
      text: 'Monthly room cleaning, an on-site café, laundry and maintenance support.',
      image: ease,
    },
    {
      lead: 'Smart',
      rest: ' Living',
      text: 'Keyless, card-free access and everything you need in the EPIISOD app.',
      image: smart,
    },
    {
      lead: 'The',
      rest: ' Experience',
      text: 'Social and wellbeing events, curated experiences and partner perks, beyond the ordinary.',
      image: experience,
    },
  ],
  rooms: BEDFORD_ROOMS,
  roomDetails: BEDFORD_ROOM_DETAILS,
  roomCurrency: 'AU$',
  stays: BEDFORD_STAYS,
  mapCenter: { lat: -37.802, lng: 144.9554 },
  mapPlaces: BEDFORD_PLACES,
  // TODO: Bedford has no promotions or FAQs of its own yet; these are Macquarie Park's
  promotion: MACQUARIE_PARK.promotion,
  promos: MACQUARIE_PARK.promos,
  faqs: MACQUARIE_PARK.faqs,
};
