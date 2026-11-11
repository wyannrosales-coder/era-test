import { useRef } from 'react';
import VLine from '../VLine';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import photoLeft from '../../assets/promotions/vip-left.jpg';
import photoRight from '../../assets/promotions/vip-right.jpg';
import line from '../../assets/partners-line.svg';
import '../about/AboutStory.css';
import './PromotionsVip.css';

/**
 * VIP privilege (Figma 786:11296): an invitation to get in touch between two photos that
 * bleed off the edges. As in the page hero, the frames hold still and the pictures drift
 * subtly inside them. Phones (Figma 786:11707) show one photo below the invitation instead.
 */
export default function PromotionsVip() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.promotions-vip__photo img',
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="promotions-vip">
      <div className="promotions-vip__inner">
        <div className="promotions-vip__content">
          <VLine src={line} length={100} />
          <div className="promotions-vip__heading">
            <p className="eyebrow">VIP privilege</p>
            <h2 className="display-title">
              Can’t wait to secure your <em>desired</em> room?
            </h2>
          </div>
          <p className="type-body-l promotions-vip__text">
            Contact us to enjoy VIP early-bird privilege today.
          </p>
          <a href="/contact" className="about-button">
            Contact us
          </a>
        </div>

        <div className="promotions-vip__photo promotions-vip__photo--left">
          <img src={photoLeft} alt="" />
        </div>
        <div className="promotions-vip__photo promotions-vip__photo--right">
          <img src={photoRight} alt="" />
        </div>
        <div className="promotions-vip__photo promotions-vip__photo--single">
          <img src={photoRight} alt="" />
        </div>
      </div>
    </section>
  );
}
