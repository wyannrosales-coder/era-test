import { useEffect } from 'react';
import Nav, { scrollToSection } from '../components/Nav';
import { ScrollTrigger, scrollToY } from '../../lib/smoothScroll';
import { takeRoomsSpot } from '../lib/stayChoice';
import type { SubLink } from '../components/Nav';
import PropertyHero from '../components/property/PropertyHero';
import Amenities from '../components/property/Amenities';
import Rooms from '../components/property/Rooms';
import PropertyLocation from '../components/property/PropertyLocation';
import Promotions from '../components/property/Promotions';
import Faqs from '../components/property/Faqs';
import StayConnected from '../components/StayConnected';
import Footer from '../components/Footer';
import ToTop from '../components/ToTop';
import type { PropertyContent } from '../components/property/propertyContent';

/** Section ids, shared by the sub-navigation and the sections themselves. */
const SECTIONS = {
  amenities: 'amenities',
  rooms: 'rooms',
  location: 'location',
  promotions: 'promotions',
  faqs: 'faqs',
  waitlist: 'join-the-wait-list',
};

const SUB_LINKS: SubLink[] = [
  { label: 'Amenities', target: SECTIONS.amenities },
  { label: 'Room', target: SECTIONS.rooms },
  { label: 'Location', target: SECTIONS.location },
  { label: 'Promotions', target: SECTIONS.promotions },
  { label: 'FAQs', target: SECTIONS.faqs },
  { label: 'Join the wait list', target: SECTIONS.waitlist },
];

/**
 * Sections where the main bar stays hidden even when scrolling up: Rooms pins its own
 * controls under the sub-navigation, and Location's map tabs would sit under the bar.
 */
const BAR_HIDDEN_IN = [SECTIONS.rooms, SECTIONS.location];

/** The amenities' full-screen stage: no nav at all while it fills the screen. */
const HIDDEN_IN = [`${SECTIONS.amenities}-stage`];

/** A property's page (Figma 539:13190), reached from Locations in the nav and the homepage. */
export default function PropertyPage({ content }: { content: PropertyContent }) {
  // Arriving at a section (e.g. #rooms, back from a room's page): the browser's own jump
  // lands before the pinned sections above have measured, so go there once they have
  useEffect(() => {
    // Back from a room's page (its links, or Back when the browser had to reload this page):
    // land on the room card that was opened, where it sat on screen (lib/stayChoice)
    const back = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'back_forward';
    let id = window.location.hash.slice(1);
    const spot = id === SECTIONS.rooms || back ? takeRoomsSpot(content.place) : null;
    if (spot) id = SECTIONS.rooms;
    if (!Object.values(SECTIONS).includes(id)) return;
    let timer = 0;
    const land = () => {
      scrollToSection(id, { immediate: true });
      const card = spot && document.querySelector<HTMLElement>(`.rooms__grid [data-room-id="${spot.roomId}"]`);
      if (card) scrollToY(window.scrollY + card.getBoundingClientRect().top - spot.top, { immediate: true });
    };
    const go = () => {
      timer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        land();
        // Once there, the nav settles into its scrolled state (the sub-navigation a few
        // pixels taller on phones): measure against it once more
        timer = window.setTimeout(land, 700);
      }, 300);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.removeEventListener('load', go);
      window.clearTimeout(timer);
    };
  }, [content.place]);

  return (
    <>
      <Nav
        subLinks={SUB_LINKS}
        hideBarAfter={SECTIONS.amenities}
        barHiddenIn={BAR_HIDDEN_IN}
        hiddenIn={HIDDEN_IN}
      />
      <main>
        <PropertyHero content={content} onSeeRooms={() => scrollToSection(SECTIONS.rooms)} />
        <Amenities id={SECTIONS.amenities} content={content} />
        <Rooms id={SECTIONS.rooms} content={content} />
        <PropertyLocation id={SECTIONS.location} content={content} />
        <Promotions id={SECTIONS.promotions} content={content} />
        <Faqs id={SECTIONS.faqs} content={content} />
        <StayConnected id={SECTIONS.waitlist} exitParallax />
      </main>
      <Footer />
      <ToTop />
    </>
  );
}
