import schoolsIcon from '../../assets/property/location/cat-schools.svg';
import transportIcon from '../../assets/property/location/cat-transport.svg';
import foodIcon from '../../assets/property/location/cat-food.svg';
import shoppingIcon from '../../assets/property/location/cat-shopping.svg';
import telcosIcon from '../../assets/property/location/cat-telcos.svg';
import landmarksIcon from '../../assets/property/location/cat-landmarks.svg';

/** A 16px line icon as a data URI, for the categories the design has no icon for yet. */
const svg = (path: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`,
  )}`;

const medicalIcon = svg('<path d="M6 2.5h4v3.5h3.5v4H10v3.5H6V10H2.5V6H6z"/>');
const banksIcon = svg('<path d="M2 6 8 2.5 14 6zM3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 13.5h12"/>');

/**
 * The kinds of place the map shows, in the order of the filter chips. `source` is the
 * content's own category name (the live site's), `name` the short label on the chip.
 */
export const PLACE_CATEGORIES = [
  { source: 'Transport', name: 'Transport', icon: transportIcon },
  { source: 'Education', name: 'Schools', icon: schoolsIcon },
  { source: 'Food', name: 'Food', icon: foodIcon },
  { source: 'Shopping & Entertainment', name: 'Shopping', icon: shoppingIcon },
  { source: 'Medical', name: 'Medical', icon: medicalIcon },
  { source: 'Banks', name: 'Banks', icon: banksIcon },
  { source: 'Telcos & Post Offices', name: 'Telcos & Post', icon: telcosIcon },
  { source: 'Other Landmarks', name: 'Landmarks', icon: landmarksIcon },
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

/**
 * A CSS `url(...)` for an icon, safe to put in an inline style or an HTML attribute. In the
 * production build Vite inlines small SVGs as data URIs that contain single quotes, which would
 * end a quoted url('...') early and make the browser drop the whole declaration (the icon mask
 * then vanishes and the marker shows as a solid square), so quotes, brackets and spaces are
 * percent-encoded and the URL is left unquoted.
 */
export const cssUrl = (u: string) =>
  `url(${u.replace(/["'()\s]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))})`;
