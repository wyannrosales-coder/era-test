import { useRef } from 'react';
import VLine from '../VLine';
import { gsap, useGSAP } from '../../../lib/smoothScroll';
import heroLine from '../../../assets/hero-line.svg';
import pin from '../../../assets/coming-soon/icon-location-pin-light.svg';
import type { Property } from '../locationData';
import './ComingSoonHero.css';

const BRAND = 'EPIISOD';

/**
 * Coming-soon hero (Figma 539:23201): the property's name, opening year and address
 * over its photo. Same exit parallax as the homepage hero — the photo drifts at half
 * speed, the copy lags and fades, and the scene darkens as the next section slides over.
 */
export default function ComingSoonHero({ property }: { property: Property }) {
  const sectionRef = useRef<HTMLElement>(null);
  const place = property.name.replace(new RegExp(`^${BRAND}\\s+`), '');

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({
            defaults: { ease: 'none', duration: 1 },
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true },
          })
          .to('.coming-soon-hero__image', { yPercent: 50 }, 0)
          .to('.coming-soon-hero__content', { y: 320 }, 0)
          .to('.coming-soon-hero__content', { opacity: 0, duration: 0.7 }, 0)
          .to('.coming-soon-hero__shade', { opacity: 0.6 }, 0);
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="coming-soon-hero">
      <img className="coming-soon-hero__image" src={property.heroImage ?? property.image} alt="" />
      <div className="coming-soon-hero__overlay" aria-hidden />
      <div className="coming-soon-hero__shade" aria-hidden />

      <div className="coming-soon-hero__content">
        <h1 className="type-h1 coming-soon-hero__title">
          {BRAND} <em>{place}</em>
        </h1>

        <VLine src={heroLine} length={50} />

        <p className="coming-soon-hero__status">
          Is coming soon{property.openingYear && <> in <strong>{property.openingYear}</strong></>}
        </p>

        <p className="coming-soon-hero__address">
          <img src={pin} width={24} height={24} alt="" />
          {property.name}, {property.address}
        </p>
      </div>
    </section>
  );
}
