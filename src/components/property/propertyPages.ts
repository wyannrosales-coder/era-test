import { PROPERTIES } from '../locationData';
import { experienceHref } from '../../lib/links';
import { ALL_READY } from '../../lib/prototypeMode';
import { MACQUARIE_PARK, type PropertyContent } from './propertyContent';

/**
 * Page content for each property that has its own page, keyed by property id. With the
 * prototype switch on "all ready", every other property gets Macquarie Park's content
 * under its own name, city and photo — a stand-in showing how the site looks with them open.
 */
export const PROPERTY_PAGES: Record<string, PropertyContent> = {
  'macquarie-park': MACQUARIE_PARK,
  ...(ALL_READY
    ? Object.fromEntries(
        PROPERTIES.filter((p) => p.id !== 'macquarie-park').map((p) => [
          p.id,
          {
            ...MACQUARIE_PARK,
            experienceHref: experienceHref(p.id),
            place: p.name.replace(/^EPIISOD\s+/, ''),
            city: p.city,
            address: `${p.name}, ${p.address}`,
            hero: p.heroImage ?? p.image,
            roomCurrency: p.city === 'London' ? '£' : MACQUARIE_PARK.roomCurrency,
          } satisfies PropertyContent,
        ]),
      )
    : {}),
};
