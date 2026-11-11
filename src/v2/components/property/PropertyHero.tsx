import { useRef } from 'react';
import { gsap, useGSAP } from '../../../lib/smoothScroll';
import play from '../../../assets/property/icon-play-white.svg';
import tour360 from '../../../assets/property/icon-360.svg';
import photos from '../../../assets/property/icon-photos.svg';
import type { PropertyContent } from './propertyContent';
import './PropertyHero.css';

type PropertyHeroProps = {
  content: PropertyContent;
  onSeeRooms: () => void;
};

/**
 * Property hero (Figma 539:13191): name over the photo, rooms CTA and media links.
 * Same exit parallax as the homepage hero: as it scrolls away the photo drifts at half
 * speed (so the next section slides over it), the copy lags and fades, and it darkens.
 */
export default function PropertyHero({ content, onSeeRooms }: PropertyHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({
            defaults: { ease: 'none', duration: 1 },
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true },
          })
          .to('.property-hero__image', { yPercent: 50 }, 0)
          .to('.property-hero__content', { y: 320 }, 0)
          .to('.property-hero__content', { opacity: 0, duration: 0.7 }, 0)
          .to('.property-hero__shade', { opacity: 0.6 }, 0);
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="property-hero">
      <img
        className="property-hero__image"
        src={content.hero}
        style={content.heroPosition ? { objectPosition: content.heroPosition } : undefined}
        alt=""
      />
      <div className="property-hero__overlay" aria-hidden />
      <div className="property-hero__shade" aria-hidden />

      <div className="property-hero__content">
        {/* v2 (Figma 1455:18319 / 1461:12965): the name — on two lines where it's long —
            then the street address; on phones the name simply wraps (Figma 1455:19358) */}
        <h1 className="type-h1 property-hero__title">
          {content.brand}{' '}
          {!content.heroTitleOneLine && <br className="property-hero__break" />}
          <em>{content.place}</em>
        </h1>

        <p className="property-hero__address">{content.streetAddress}</p>

        <div className="property-hero__actions">
          <button type="button" className="property-hero__cta" onClick={onSeeRooms}>
            <span>Find a room</span>
          </button>

          <div className="property-hero__media">
            <a href="#" className="property-hero__media-link">
              <img src={play} width={24} height={24} alt="" />
              <span>Property video</span>
            </a>
            <a href="#" className="property-hero__media-link">
              <span className="property-hero__icon-360">
                <img src={tour360} width={28.86} height={19.651} alt="" />
              </span>
              <span>360 virtual tour</span>
            </a>
            <a href="#" className="property-hero__media-link">
              <img src={photos} width={24} height={24} alt="" />
              <span>See all photos</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
