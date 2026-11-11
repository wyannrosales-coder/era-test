import { useRef } from 'react';
import VLine from './VLine';
import { gsap, useGSAP } from '../lib/smoothScroll';
import partner1 from '../assets/partner-1.svg';
import partner2a from '../assets/partner-2a.svg';
import partner2b from '../assets/partner-2b.svg';
import partner3 from '../assets/partner-3.svg';
import partner4 from '../assets/partner-4.svg';
import partnersLeft from '../assets/partners-left.jpg';
import partnersRight from '../assets/partners-right.jpg';
import line from '../assets/partners-line.svg';
import './Partners.css';

export type Logo =
  | { kind: 'single'; src: string; width: number; height: number }
  | { kind: 'split'; mark: string; word: string };

/** Placeholder partner logos, in Figma order (539:11933). */
export const LOGOS: Logo[] = [
  { kind: 'single', src: partner1, width: 198.915, height: 30.566 },
  { kind: 'split', mark: partner2a, word: partner2b },
  { kind: 'single', src: partner3, width: 210.676, height: 44.487 },
  { kind: 'single', src: partner4, width: 198.915, height: 30.566 },
];

export function LogoSlot({ logo }: { logo: Logo }) {
  return (
    <div className="partner-logo">
      {logo.kind === 'single' ? (
        <img src={logo.src} width={logo.width} height={logo.height} alt="Partner logo" />
      ) : (
        <div className="partner-logo__split" role="img" aria-label="Partner logo">
          <img className="partner-logo__mark" src={logo.mark} alt="" />
          <img className="partner-logo__word" src={logo.word} alt="" />
        </div>
      )}
    </div>
  );
}

/**
 * Figma 539:11927. The heading and logos drift gently (--speed) while the section passes
 * through the viewport; the photo frames hold still where Figma places them and the
 * pictures drift subtly inside, as in the About us hero. Phones (Figma 713:4366) show
 * one photo below the logos instead, with the same drift inside its frame.
 */
export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          phone: '(max-width: 700px)',
        },
        (ctx) => {
          const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
          if (!motion) return;
          // As in the About us hero, the photo frames hold still and the pictures drift
          // subtly inside them: the two side photos on larger screens, and on phones
          // (Figma 713:4366) the single photo below the logos.
          gsap.fromTo(
            phone ? '.partners__single img' : '.partners__photo img',
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: phone ? '.partners__single' : section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          );

          // Phones keep the heading and logos still
          if (phone) return;
          gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
            // The photo frames stay put
            if (el.classList.contains('partners__photo')) return;
            const speed = parseFloat(getComputedStyle(el).getPropertyValue('--speed')) || 0;
            gsap.fromTo(
              el,
              { y: () => speed * window.innerHeight },
              {
                y: () => -speed * section.offsetHeight,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="partners">
      <div className="partners__content" data-parallax>
        <VLine src={line} length={100} />
        <div className="heading-group">
          <p className="eyebrow">Partners</p>
          <h2 className="display-title">
            Student experience
            <br />
            brought to <em>life</em>
          </h2>
        </div>
        <div className="partners__logos">
          {LOGOS.map((logo, i) => (
            <LogoSlot key={i} logo={logo} />
          ))}
        </div>
        <div className="partners__single">
          <img src={partnersRight} alt="" />
        </div>
      </div>

      <div className="partners__photo partners__photo--left" data-parallax>
        <img src={partnersLeft} alt="" />
      </div>
      <div className="partners__photo partners__photo--right" data-parallax>
        <img src={partnersRight} alt="" />
      </div>
    </section>
  );
}
