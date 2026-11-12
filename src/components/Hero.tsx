import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import VLine from './VLine';
import { gsap, useGSAP } from '../lib/smoothScroll';
import heroImage from '../assets/hero.jpg';
import heroLine from '../assets/hero-line.svg';
import RoomSearchBar from './rooms/RoomSearchBar';
import { NO_FILTERS, type Filters } from './rooms/roomSearch';
import './Hero.css';

/** Find a room, with the filters in its address. */
export const findRoomHref = (f: Filters) => {
  const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
  return `/find-a-room${q.size ? `?${q}` : ''}`;
};

/** The Locations page, showing one country's city. */
export const locationsHref = (country: string, city: string) =>
  `/locations?${new URLSearchParams({ country, city })}`;

type HeroProps = {
  image?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** The line between the title and the subtitle (Locations, Figma 1182:17842) rather than above the search. */
  lineAfterTitle?: boolean;
  /** What the search does; by default it opens Find a room with the chosen filters. */
  onSearch?: (filters: Filters) => void;
};

/**
 * The full-screen hero with the "Start your story" search: the homepage's, and — with its
 * own photo and copy — the Locations page's.
 */
export default function Hero({
  image = heroImage,
  title = (
    <>
      Thoughtfully designed <br className="hero__br" />
      <em>student living</em>
    </>
  ),
  subtitle = 'Modern spaces, all-inclusive amenities, and a vibrant student community—all in the cities where you study.',
  lineAfterTitle = false,
  onSearch = (filters) => window.location.assign(findRoomHref(filters)),
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  // Exit parallax: as the hero scrolls away the photo drifts at half speed (so the next
  // section slides over it), the copy lags further and fades, and the scene darkens.
  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({
            defaults: { ease: 'none', duration: 1 },
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true },
          })
          .to('.hero__image', { yPercent: 50 }, 0)
          .to('.hero__content', { y: 320 }, 0)
          .to('.hero__content', { opacity: 0, duration: 0.7 }, 0)
          .to('.hero__shade', { opacity: 0.6 }, 0);
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="hero">
      <img className="hero__image" src={image} alt="" />
      <div className="hero__overlay" aria-hidden />
      <div className="hero__shade" aria-hidden />

      <div className="hero__content">
        {lineAfterTitle ? (
          <>
            <h1 className="type-h1 hero__title">{title}</h1>
            <VLine src={heroLine} length={50} />
            <p className="type-lead hero__subtitle">{subtitle}</p>
          </>
        ) : (
          <>
            <div className="hero__copy">
              <h1 className="type-h1 hero__title">{title}</h1>
              <p className="type-lead hero__subtitle">{subtitle}</p>
            </div>
            <VLine src={heroLine} length={50} />
          </>
        )}

        <RoomSearchBar
          className="room-search--hero"
          value={filters}
          onChange={setFilters}
          onSearch={() => onSearch(filters)}
          onClear={() => setFilters(NO_FILTERS)}
        />
      </div>
    </section>
  );
}
