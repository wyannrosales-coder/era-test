import macquarie from '../../assets/loc-macquarie.jpg';
import bedford from '../../assets/loc-bedford.jpg';
import mckenzie from '../../assets/loc-mckenzie.jpg';
import fairway from '../../assets/loc-fairway.jpg';
import stirling from '../../assets/loc-stirling.jpg';
import euston from '../../assets/loc-euston.jpg';
import heroMckenzie from '../../assets/coming-soon/hero-mckenzie.jpg';
import heroFairway from '../../assets/coming-soon/hero-fairway.jpg';
import heroStirling from '../../assets/coming-soon/hero-stirling.jpg';
import heroEuston from '../../assets/coming-soon/hero-euston.jpg';

import cardMacquarie from '../../assets/locations/card-macquarie-park.jpg';
import cardBedford from '../../assets/locations/card-bedford.jpg';
import cardMackenzie from '../../assets/locations/card-mackenzie.jpg';
import cardFairway from '../../assets/locations/card-fairway.jpg';
import cardStirling from '../../assets/locations/card-stirling.jpg';
import cardEuston from '../../assets/locations/card-euston.jpg';

export type Property = {
  id: string;
  name: string;
  address: string;
  city: string;
  image: string;
  comingSoon?: boolean;
  /** Property page, once one exists. */
  href?: string;
  /** Its photo on the Locations page (Figma 1182:19860), where it differs from `image`. */
  listingImage?: string;
  /** Coming-soon page: full-width hero photo and the year it opens. */
  heroImage?: string;
  openingYear?: string;
};

export type Region = {
  id: string;
  name: string;
  summary: string;
  cities: string[];
};

export const REGIONS: Region[] = [
  {
    id: 'au',
    name: 'Australia',
    summary: '3 cities • 5 properties',
    cities: ['Sydney', 'Melbourne', 'Perth'],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    summary: '1 city • 1 property',
    cities: ['London'],
  },
];

/** Every property, shown in the Locations carousel and the nav's Locations menu. */
export const PROPERTIES: Property[] = [
  {
    id: 'macquarie-park',
    name: 'EPIISOD Macquarie Park',
    address: '17 Lachlan Ave, Macquarie Park NSW 2113',
    city: 'Sydney',
    image: macquarie,
    listingImage: cardMacquarie,
    href: '/v2/locations/macquarie-park',
  },
  {
    id: 'bedford',
    name: 'EPIISOD Bedford',
    address: '33 Bedford St, North Melbourne VIC 3051',
    city: 'Melbourne',
    image: bedford,
    listingImage: cardBedford,
    href: '/v2/locations/bedford',
  },
  {
    id: 'mackenzie',
    name: 'EPIISOD MacKenzie',
    address: 'MacKenzie Street, Melbourne VIC',
    city: 'Melbourne',
    image: mckenzie,
    listingImage: cardMackenzie,
    comingSoon: true,
    href: '/locations/mackenzie',
    heroImage: heroMckenzie,
    openingYear: '2027',
  },
  {
    id: 'fairway',
    name: 'EPIISOD Fairway',
    address: 'Perth, WA',
    city: 'Perth',
    image: fairway,
    listingImage: cardFairway,
    comingSoon: true,
    href: '/locations/fairway',
    heroImage: heroFairway,
    openingYear: '2027',
  },
  {
    id: 'stirling',
    name: 'EPIISOD Stirling',
    address: 'Perth, WA',
    city: 'Perth',
    image: stirling,
    listingImage: cardStirling,
    comingSoon: true,
    href: '/locations/stirling',
    heroImage: heroStirling,
    openingYear: '2027',
  },
  {
    id: 'euston',
    name: 'EPIISOD Euston',
    address: 'Euston, London NW1',
    city: 'London',
    image: euston,
    listingImage: cardEuston,
    comingSoon: true,
    href: '/locations/euston',
    heroImage: heroEuston,
    openingYear: '2027',
  },
];
