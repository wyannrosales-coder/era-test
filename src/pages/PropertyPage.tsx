import { useEffect } from 'react';
import Nav, { scrollToSection } from '../components/Nav';
import { ScrollTrigger } from '../lib/smoothScroll';
import type { SubLink } from '../components/Nav';
import PropertyHero from '../components/property/PropertyHero';
import Amenities from '../components/property/Amenities';
import Amenities3D from '../components/property/Amenities3D';
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
    const id = window.location.hash.slice(1);
    if (!Object.values(SECTIONS).includes(id)) return;
    let timer = 0;
    const go = () => {
      timer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        scrollToSection(id, { immediate: true });
        // Once there, the nav settles into its scrolled state (the sub-navigation a few
        // pixels taller on phones): measure against it once more
        timer = window.setTimeout(() => scrollToSection(id, { immediate: true }), 700);
      }, 300);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.removeEventListener('load', go);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <Nav
        // The property's experience page, when it has one, joins the row as its first link
        subLinks={
          content.experienceHref
            ? [{ label: 'Experience', target: 'experience', href: content.experienceHref }, ...SUB_LINKS]
            : SUB_LINKS
        }
        hideBarAfter={SECTIONS.amenities}
        barHiddenIn={BAR_HIDDEN_IN}
        hiddenIn={HIDDEN_IN}
      />
      <main>
        <PropertyHero content={content} onSeeRooms={() => scrollToSection(SECTIONS.rooms)} />
        {content.amenities3d ? (
          <Amenities3D id={SECTIONS.amenities} content={content} />
        ) : (
          <Amenities id={SECTIONS.amenities} content={content} />
        )}
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
