/**
 * Property experience pages: the immersive, hand-built page each property can have at
 * /locations/<property>/experience (see locations/<property>/experience/index.html and
 * vite.config.ts). List a property's id here once its page exists and every entry point
 * (property page, Locations menu, cards) starts linking to it.
 */
const EXPERIENCE_PROPERTIES = ['macquarie-park'];

/** A property's experience page, or undefined while it has none. */
export const experienceHref = (propertyId: string): string | undefined =>
  EXPERIENCE_PROPERTIES.includes(propertyId) ? `/locations/${propertyId}/experience` : undefined;

/** Where the general "Enter the (EPIISOD) experience" buttons lead: the first experience page. */
export const EXPERIENCE_URL = experienceHref(EXPERIENCE_PROPERTIES[0])!;
