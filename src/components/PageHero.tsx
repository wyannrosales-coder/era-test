import { useRef } from 'react';
import type { ReactNode } from 'react';
import VLine from './VLine';
import { gsap, useGSAP } from '../lib/smoothScroll';
import line from '../assets/partners-line.svg';
import './PageHero.css';

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  /** The paragraphs under the title, if any. */
  children?: ReactNode;
  /** An optional button between the copy and the line. */
  action?: ReactNode;
  /** Optional content below the line (Experience: the partner logos). */
  after?: ReactNode;
  /** Extra class for page-specific spacing. */
  className?: string;
  /** Left and right photos; phones show one of them below the line. */
  photos: { left: string; right: string };
  /** Which photo phones show (Promotions, Figma 794:4540, uses the right one). */
  phonePhoto?: 'left' | 'right';
  tone?: 'white' | 'cream';
};

/**
 * Top of a content page (About us Figma 735:13875, Promotions 786:9895): the page title
 * between two photos that bleed off the edges, then a gold line. The photo frames hold
 * still; only the pictures inside drift a touch as the page scrolls (a subtle parallax).
 * Phones (Figma 745:15704) show one photo below the line instead.
 */
export default function PageHero({
  eyebrow,
  title,
  children,
  action,
  after,
  className = '',
  photos,
  phonePhoto = 'left',
  tone = 'white',
}: PageHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.page-hero__photo img',
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              // A short catch-up keeps the drift soft, and smooth under a finger
              scrub: 0.8,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={`page-hero${tone === 'cream' ? ' page-hero--cream' : ''} ${className}`}>
      <div className="page-hero__inner">
        <div className="page-hero__content">
          <div className="page-hero__copy">
            <div className="page-hero__heading">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="type-h1">{title}</h1>
            </div>
            {children && <div className="type-body-l page-hero__lede">{children}</div>}
          </div>
          {action}
          <VLine src={line} length={100} />
          {after}
        </div>

        <div className="page-hero__photo page-hero__photo--left">
          <img src={photos.left} alt="" />
        </div>
        <div className="page-hero__photo page-hero__photo--right">
          <img src={photos.right} alt="" />
        </div>
        <div className="page-hero__photo page-hero__photo--single">
          <img src={photos[phonePhoto]} alt="" />
        </div>
      </div>
    </section>
  );
}
