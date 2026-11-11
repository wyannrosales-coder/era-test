import { useRef } from 'react';
import VLine from '../VLine';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import line from '../../assets/partners-line.svg';
import backdrop from '../../assets/about/location-bg.jpg';
import photoLeft from '../../assets/why/living-left.jpg';
import photoRight from '../../assets/why/exp-convenience.jpg';
import './WhyLiving.css';

/**
 * EPIISOD living (Figma 912:4530): "Write your story" on a blurred chocolate backdrop,
 * between two photos that bleed off the edges. The backdrop and the pictures inside their
 * frames drift as the page scrolls; the two frames and the copy travel at different speeds.
 */
export default function WhyLiving({
  bookHref = '/locations/macquarie-park#rooms',
}: {
  /** Where "Book now" goes (v2 passes its own pages). */
  bookHref?: string;
} = {}) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const scrollTrigger = {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        };
        gsap.fromTo('.why-living__backdrop', { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger });
        gsap.fromTo('.why-living__photo img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger });
        // The frames themselves travel at different speeds and in opposite directions, and the copy
        // lags between them, so the section has real depth
        gsap.fromTo('.why-living__photo--left', { y: 90 }, { y: -90, ease: 'none', scrollTrigger });
        gsap.fromTo('.why-living__photo--right', { y: -60 }, { y: 120, ease: 'none', scrollTrigger });
        gsap.fromTo('.why-living__content', { y: 60 }, { y: -60, ease: 'none', scrollTrigger });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="why-living">
      <div className="why-living__bg" aria-hidden>
        <img className="why-living__backdrop" src={backdrop} alt="" />
        <div className="why-living__tint" />
      </div>

      <div className="why-living__photo why-living__photo--left">
        <img src={photoLeft} alt="" />
      </div>
      <div className="why-living__photo why-living__photo--right">
        <img src={photoRight} alt="" />
      </div>

      <div className="why-living__content">
        <VLine src={line} length={100} />
        <div className="heading-group why-living__heading">
          <p className="eyebrow">EPIISOD living</p>
          <h2 className="type-h2">
            Write <em>your story</em> with
            <br />
            EPIISOD
          </h2>
        </div>
        <a href={bookHref} className="why-living__button">
          Book now
        </a>
      </div>
    </section>
  );
}
