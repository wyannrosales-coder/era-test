import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import VLine from './VLine';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import heroImage from '../../assets/v2/hero.jpg';
import heroLine from '../../assets/v2/hero-line.svg';
import dropdown from '../../assets/v2/dropdown-white.svg';
import arrowRight from '../../assets/v2/hero-arrow.svg';
import { REGIONS } from './locationData';
import './Hero.css';

/** Cities per country, in the order of the Locations page. */
const CITIES: Record<string, string[]> = Object.fromEntries(REGIONS.map((r) => [r.name, r.cities]));

/** The Locations page, showing one country's city. */
export const locationsHref = (country: string, city: string) =>
  `/locations?${new URLSearchParams({ country, city })}`;

type HeroProps = {
  image?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** The line between the title and the subtitle (Locations, Figma 1182:17842) rather than above the search. */
  lineAfterTitle?: boolean;
  /** What the search does; by default it opens the Locations page for the chosen city. */
  onSearch?: (country: string, city: string) => void;
};

/**
 * The full-screen hero with the "Start your story" search: the homepage's, and — with its
 * own photo and copy — the Locations page's.
 */
export default function Hero({
  image = heroImage,
  title = (
    <>
      Thoughtfully designed <em>student living</em>
    </>
  ),
  subtitle = 'Modern spaces, all-inclusive amenities, and a vibrant student community—all in the cities where you study.',
  lineAfterTitle = false,
  onSearch = (country, city) => window.location.assign(locationsHref(country, city)),
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [country, setCountry] = useState(REGIONS[0].name);
  const [city, setCity] = useState(REGIONS[0].cities[0]);

  const onCountryChange = (next: string) => {
    setCountry(next);
    setCity(CITIES[next][0]);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(country, city);
  };

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
            <VLine src={heroLine} length={64} />
            <p className="type-lead hero__subtitle">{subtitle}</p>
          </>
        ) : (
          <>
            <div className="hero__copy">
              <h1 className="type-h1 hero__title">{title}</h1>
              <p className="type-lead hero__subtitle">{subtitle}</p>
            </div>
            <VLine src={heroLine} length={64} />
          </>
        )}

        <form className="hero-search" onSubmit={onSubmit}>
          <div className="hero-search__cell">
            <div className="hero-search__field hero-search__field--intro">Start your story</div>
          </div>

          <label className="hero-search__cell hero-search__cell--action">
            <div className="hero-search__field">
              <span className="hero-search__label">Country</span>
              <span className="hero-search__select">
                <select value={country} onChange={(e) => onCountryChange(e.target.value)}>
                  {Object.keys(CITIES).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <img src={dropdown} width={16} height={16} alt="" />
              </span>
            </div>
          </label>

          <label className="hero-search__cell hero-search__cell--action">
            <div className="hero-search__field">
              <span className="hero-search__label">City</span>
              <span className="hero-search__select">
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES[country].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <img src={dropdown} width={16} height={16} alt="" />
              </span>
            </div>
          </label>

          <div className="hero-search__cell hero-search__cell--action">
            <button type="submit" className="hero-search__submit" aria-label="Search">
              <img src={arrowRight} width={24} height={24} alt="" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
