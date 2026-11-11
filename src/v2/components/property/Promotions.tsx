import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../../lib/smoothScroll';
import prevIcon from '../../../assets/v2/loc-prev.svg';
import nextIcon from '../../../assets/v2/loc-next.svg';
import PromoCard from '../promotions/PromoCard';
import { usePromoCarousel } from '../promotions/usePromoCarousel';
import type { PropertyContent } from './propertyContent';
import './Promotions.css';

/**
 * Promotions (Figma 539:13639): the featured offer, then a row of promo cards that
 * scrolls, drags and scrubs (see usePromoCarousel).
 */
export default function Promotions({ id, content }: { id: string; content: PropertyContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { trackRef, viewportProps } = usePromoCarousel(sectionRef);
  const { promotion } = content;
  const count = content.promos.length;
  const [index, setIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const viewport = () => trackRef.current?.parentElement ?? null;

  // v2 (Figma 1455:19076): the counter, the progress line and the arrows follow the row
  useEffect(() => {
    const v = viewport();
    if (!v) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = v.scrollWidth - v.clientWidth;
      const progress = max > 1 ? Math.min(Math.max(v.scrollLeft / max, 0), 1) : 1;
      setIndex(Math.round(progress * (count - 1)));
      setAtStart(v.scrollLeft <= 1);
      setAtEnd(v.scrollLeft >= max - 1);
    };
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    v.addEventListener('scroll', onChange, { passive: true });
    const ro = new ResizeObserver(onChange);
    ro.observe(v);
    return () => {
      cancelAnimationFrame(frame);
      v.removeEventListener('scroll', onChange);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  /** Glide one card back or forward. */
  const go = (dir: 1 | -1) => {
    const v = viewport();
    const track = trackRef.current;
    if (!v || !track) return;
    const first = track.children[0] as HTMLElement | undefined;
    const step = (first?.offsetWidth ?? 324) + (parseFloat(getComputedStyle(track).columnGap) || 0);
    const max = v.scrollWidth - v.clientWidth;
    const target = Math.min(Math.max((Math.round(v.scrollLeft / step) + dir) * step, 0), max);
    gsap.killTweensOf(v);
    v.style.scrollSnapType = 'none';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(v, {
      scrollLeft: target,
      duration: reduced ? 0 : 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        v.style.scrollSnapType = '';
      },
    });
  };
  const pad = (n: number) => String(n).padStart(2, '0');

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
            {/* v2 (Figma 1455:18595): a single "More details" button */}
            <a href="#" className="promo-banner__button">
              More details
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
          <a href="/v2/promotions" className="promotions__all">
            View Promotions
          </a>
        </div>

        <div {...viewportProps} role="region" aria-label="Latest promotions">
          <div ref={trackRef} className="promotions__track">
            {content.promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        </div>
      </div>

      <div className="promotions__nav">
        <div className="promotions__nav-row">
          <button type="button" className="promotions__arrow" aria-label="Previous promotion" disabled={atStart} onClick={() => go(-1)}>
            <img src={prevIcon} width={24} height={24} alt="" />
          </button>
          <div className="promotions__line" aria-hidden>
            <div className="promotions__line-fill" style={{ width: `${((index + 1) / count) * 100}%` }} />
          </div>
          <button type="button" className="promotions__arrow" aria-label="Next promotion" disabled={atEnd} onClick={() => go(1)}>
            <img src={nextIcon} width={24} height={24} alt="" />
          </button>
        </div>
        <p className="promotions__counter" aria-live="polite">
          {pad(index + 1)}/{pad(count)}
        </p>
      </div>
    </section>
  );
}
