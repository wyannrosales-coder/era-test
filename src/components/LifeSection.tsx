import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import LifeIntro from './LifeIntro';
import WellnessReveal from './WellnessReveal';
import { gsap, ScrollTrigger, scrollToY, useGSAP } from '../lib/smoothScroll';
import './LifeSection.css';

/**
 * Life @ epiisod fold → wellness fold, vertically on every screen (as on phones, Figma
 * 704:8742 → 704:8808). The intro pins (CSS sticky) while the wellness fold, laid out
 * `slide` px below the top of the section, scrolls up over it; once it reaches the top,
 * its own sticky stage takes over without a jump.
 *
 * As it's covered, the intro drifts up at a slower pace and dims (parallax with shade).
 */
export default function LifeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wellnessRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(() => window.innerHeight);
  // Scroll spent stepping through the three wellness stories (≈ 0.9 screen per image),
  // so each change keeps pace with an ordinary scroll.
  const stepScroll = Math.round(slide * 2.2);
  const [wellnessHeight, setWellnessHeight] = useState(0);

  useEffect(() => {
    const el = wellnessRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWellnessHeight(el.offsetHeight));
    ro.observe(el);
    const onResize = () => setSlide(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // The section's height comes from React state; re-measure triggers once it settles.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [wellnessHeight, slide]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // The wellness fold needs no animation to arrive: laid out a screen below, it simply
      // scrolls up over the pinned intro. The intro hands over with parallax: it drifts up
      // at a slower pace than the incoming fold and darkens.
      gsap.matchMedia().add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          phone: '(max-width: 700px)',
        },
        (ctx) => {
          const { motion, phone } = ctx.conditions as {
            motion: boolean;
            phone: boolean;
          };
          if (!motion) return;
          gsap
            .timeline({
              defaults: { ease: 'power1.inOut', duration: 1 },
              // Phones scroll natively, so a short catch-up smooths the touch input
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: `+=${slide}`,
                scrub: phone ? 0.6 : true,
              },
            })
            .fromTo('.life__intro-content', { y: 0 }, { y: -slide * 0.15 }, 0)
            .fromTo('.life__intro-shade', { opacity: 0 }, { opacity: 0.35 }, 0);
        },
      );

      // Parallax: each layer drifts at its own --speed from the moment the section
      // enters until the wellness fold covers it. At the section's top it sits
      // exactly where Figma places it. Phones use smaller speeds (LifeIntro.css) and a
      // short catch-up, so the drift is gentle and smooth under a finger.
      gsap.matchMedia().add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          phone: '(max-width: 700px)',
        },
        (ctx) => {
          const { motion, phone } = ctx.conditions as {
            motion: boolean;
            phone: boolean;
          };
          if (!motion) return;
          gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
            const speed = parseFloat(getComputedStyle(el).getPropertyValue('--speed')) || 0;
            gsap.fromTo(
              el,
              { y: () => speed * window.innerHeight },
              {
                y: -speed * slide,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top bottom',
                  end: `top top-=${slide}`,
                  scrub: phone ? 0.6 : true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        },
      );
    },
    { scope: sectionRef, dependencies: [slide], revertOnUpdate: true },
  );

  const skipToWellness = () => {
    const section = sectionRef.current;
    if (!section) return;
    scrollToY(section.getBoundingClientRect().top + window.scrollY + slide);
  };

  return (
    <section
      ref={sectionRef}
      className="life"
      style={
        {
          height: wellnessHeight ? slide + wellnessHeight : undefined,
          '--slide': `${slide}px`,
        } as CSSProperties
      }
      aria-label="Life at EPIISOD"
    >
      <div className="life__intro">
        <div className="life__intro-content">
          <LifeIntro onNext={skipToWellness} />
        </div>
        <div className="life__intro-shade" aria-hidden />
      </div>
      <div ref={wellnessRef} className="life__wellness">
        <WellnessReveal offset={slide} stepScroll={stepScroll} />
      </div>
    </section>
  );
}
