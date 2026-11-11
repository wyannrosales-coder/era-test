import { useRef } from 'react';
import { gsap, useGSAP } from '../../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import { MACQUARIE_PARK } from '../property/propertyContent';
import OfferCard from './OfferCard';
import { OFFERS } from './promotionsData';
import '../property/Promotions.css';
import './PromotionsOffers.css';

/**
 * The offers (Figma 786:10794): the featured promotion — the same banner as on the
 * property page — then every offer in a two-column grid. Cards rise into place as they
 * scroll into view, and the section dims as the VIP privilege slides over it.
 */
export default function PromotionsOffers() {
  const sectionRef = useRef<HTMLElement>(null);
  const { promotion } = MACQUARIE_PARK;
  useExitParallax(sectionRef, { onPhones: false });

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.offer-card').forEach((card, i) => {
          gsap.from(card, {
            y: 48,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out',
            // Side-by-side cards follow one another slightly
            delay: (i % 2) * 0.12,
            scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          });
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="promotions-offers exit-parallax">
      <div className="promotions-offers__content" data-exit-content>
        <div className="promo-banner">
          <div className="promo-banner__copy">
            <div className="promo-banner__text">
              <p className="promo-banner__eyebrow">{promotion.eyebrow}</p>
              <h2 className="type-h3 promo-banner__title">{promotion.title}</h2>
              <p className="type-body-m promo-banner__body">{promotion.text}</p>
            </div>
            <div className="promo-banner__actions">
              <a href="#" className="promo-banner__button">
                Learn more
              </a>
              <a
                href="/v2/locations/macquarie-park#rooms"
                className="promo-banner__button promo-banner__button--solid"
              >
                Book a room
              </a>
            </div>
          </div>
          <img className="promo-banner__image" src={promotion.image} alt="" />
        </div>

        <div className="promotions-offers__grid">
          {OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
