import { useRef } from 'react';
import PromoCard from '../promotions/PromoCard';
import CarouselArrows from '../ui/CarouselArrows';
import { usePromoCarousel } from '../promotions/usePromoCarousel';
import type { PropertyContent } from './propertyContent';
import './Promotions.css';

/**
 * Promotions (Figma 539:13639): the featured offer, then a row of promo cards that
 * scrolls, drags and scrubs (see usePromoCarousel).
 */
export default function Promotions({ id, content }: { id: string; content: PropertyContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { trackRef, thumbRef, viewportProps, scrubberProps } = usePromoCarousel(sectionRef);
  const { promotion } = content;

  /** One card back or forward. */
  const stepPromos = (dir: 1 | -1) => {
    const track = trackRef.current;
    const viewport = track?.parentElement;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !viewport || !first) return;
    const step = first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    viewport.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="promotions" id={id}>
      <div className="promo-banner">
        <div className="promo-banner__copy">
          <div className="promo-banner__text">
            <p className="promo-banner__eyebrow">{promotion.eyebrow}</p>
            <h3 className="type-h3 promo-banner__title">{promotion.title}</h3>
            <p className="type-body-m promo-banner__body">{promotion.text}</p>
          </div>
          <div className="promo-banner__actions">
            <a href="#" className="promo-banner__button">
              Learn more
            </a>
            <a href="#" className="promo-banner__button promo-banner__button--solid">
              Book a room
            </a>
          </div>
        </div>
        <img className="promo-banner__image" src={promotion.image} alt="" />
      </div>

      <div className="promotions__latest">
        <div className="promotions__header">
          <h2 className="type-h2 promotions__title">
            Latest <em>promotion</em>
          </h2>
          <div className="promotions__header-end">
            <CarouselArrows
              className="promotions__arrows"
              label="Browse promotions"
              onPrev={() => stepPromos(-1)}
              onNext={() => stepPromos(1)}
            />
            <a href="/promotions" className="promotions__all">
              View Promotions
            </a>
          </div>
        </div>

        <div {...viewportProps} role="region" aria-label="Latest promotions">
          <div ref={trackRef} className="promotions__track">
            {content.promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        </div>
      </div>

      <div {...scrubberProps} aria-label="Latest promotions position">
        <div className="promotions__progress">
          <div ref={thumbRef} className="promotions__progress-bar" />
        </div>
      </div>
    </section>
  );
}
