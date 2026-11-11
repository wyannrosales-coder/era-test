import macquarie from '../../assets/v2/loc-macquarie.jpg';
import bedford from '../../assets/v2/loc-bedford.jpg';
import { PROPERTIES } from './locationData';

export type HomeProperty = {
  id: string;
  /** Name after "EPIISOD", set in italics. */
  name: string;
  address: string;
  city: string;
  country: string;
  image: string;
  /** Figma's crop of the photo within the 360px-tall frame: width, left and top, in %. */
  crop: { width: number; left: number; top: number };
  href: string;
};

const hrefOf = (id: string) => PROPERTIES.find((p) => p.id === id)?.href ?? '#';

/** Open properties on the home page carousel (Figma 1441:15286). */
export const HOME_PROPERTIES: HomeProperty[] = [
  {
    id: 'macquarie-park',
    name: 'Macquarie Park',
    address: '17 Lachlan Ave, Macquarie Park NSW 2113',
    city: 'Sydney',
    country: 'Australia',
    image: macquarie,
    crop: { width: 100, left: 0, top: -33.06 },
    href: hrefOf('macquarie-park'),
  },
  {
    id: 'bedford',
    name: 'Bedford',
    address: '33 Bedford St, North Melbourne VIC 3051',
    city: 'Melbourne',
    country: 'Australia',
    image: bedford,
    crop: { width: 150.82, left: -25.41, top: -33.54 },
    href: hrefOf('bedford'),
  },
];

/** "New locations coming soon!" in the intro column. */
export const COMING_SOON: { region: string; places: string[] }[] = [
  { region: 'Australia', places: ['MacKenzie, Melbourne', 'Fairway, Perth', 'Stirling, Perth'] },
  { region: 'United Kingdom', places: ['Euston, London'] },
];
