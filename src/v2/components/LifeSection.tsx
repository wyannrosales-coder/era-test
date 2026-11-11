import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import WellnessReveal from './WellnessReveal';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/smoothScroll';
import { PHONE_QUERY } from '../lib/phone';
import lifeBg from '../../assets/v2/life-bg.jpg';
import './LifeSection.css';

/** Scroll (in screen heights) the card spends expanding while the intro is pinned. */
const EXPAND_SCREENS = 1;
/** Figma 1441:16726: the card's middle state is 648 of the 800px-tall frame. */
const TALL = 648 / 800;
/** Share of the expansion spent growing taller before it widens to the full screen. */
const SPLIT = 0.4;

/**
 * Life @ EPIISOD → Student Life (Figma 1441:15379 → 1441:16726 → 1441:16734).
 *
 * The intro pins (CSS sticky): a white card holding the heading over a darkened photo.
 * Scrolling, the card grows — first taller, then out to the edges — until the screen is
 * solid white. The Student Life fold, laid out `slide` px below the top of the section,
 * then scrolls up over the white intro (white on white, so the hand-off is seamless) and
 * its own sticky stage takes over without a jump.
 *
 * The card is a clip-path on a full-screen white layer, so the heading never moves and
 * nothing re-lays out while it animates.
 */
export default function LifeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wellnessRef = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState(() => window.innerHeight);
  const expand = Math.round(vh * EXPAND_SCREENS);
  // The Student Life fold starts once the expansion is done and the white intro has
  // scrolled a screen beneath it.
  const slide = expand + vh;
  // Scroll spent stepping through the three stories (≈ 0.9 screen per image).
  const stepScroll = Math.round(vh * 2.2);
  const [wellnessHeight, setWellnessHeight] = useState(0);

  useEffect(() => {
    const el = wellnessRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWellnessHeight(el.offsetHeight));
    ro.observe(el);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // The section's height comes from React state; re-measure triggers once it settles.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [wellnessHeight, vh]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const card = section?.querySelector<HTMLElement>('.life__card');
      const heading = section?.querySelector<HTMLElement>('.life__heading');
      if (!section || !card || !heading) return;

      // Card insets (px) for a box of w × h centred on the screen.
      const inset = (w: number, h: number) => {
        const x = Math.max(0, (card.clientWidth - w) / 2);
        const y = Math.max(0, (card.clientHeight - h) / 2);
        return `inset(${y}px ${x}px ${y}px ${x}px)`;
      };
      // Starts hugging the heading (Figma: 40px padding around it).
      const start = () => inset(heading.offsetWidth + 80, heading.offsetHeight + 80);
      const tall = () => inset(heading.offsetWidth + 80, card.clientHeight * TALL);

      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', phone: PHONE_QUERY },
        (ctx) => {
          const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
          if (!motion) {
            gsap.set(card, { clipPath: start });
            return;
          }
          gsap
            .timeline({
              defaults: { ease: 'power2.inOut' },
              // Phones scroll natively, so a short catch-up smooths the touch input
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: `+=${expand}`,
                scrub: phone ? 0.6 : true,
                invalidateOnRefresh: true,
              },
            })
            // Every stage is a fromTo with all four insets written out: the browser reports
            // a symmetric inset in shorthand ("inset(85px 574px)"), and tweening from that
            // to a four-value inset animated only two edges, so the card leaned left.
            .fromTo(card, { clipPath: start }, { clipPath: tall, duration: SPLIT })
            .fromTo(card, { clipPath: tall }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1 - SPLIT, immediateRender: false })
            // The photo settles back as the card covers it.
            .fromTo('.life__photo', { scale: 1.12 }, { scale: 1, ease: 'none', duration: 1 }, 0);

          // Gentle drift on the way in, before the intro pins.
          gsap.fromTo(
            '.life__photo',
            { yPercent: -8 },
            {
              yPercent: 0,
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
            },
          );
        },
      );
    },
    { scope: sectionRef, dependencies: [expand], revertOnUpdate: true },
  );

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
        <div className="life__image" aria-hidden>
          <img className="life__photo" src={lifeBg} alt="" draggable={false} />
          <div className="life__overlay" />
        </div>
        <div className="life__card" aria-hidden />
        <div className="life__heading heading-group">
          <p className="eyebrow">life @ Epiisod</p>
          <h2 className="display-title">
            An <em className="medium">elevated</em>
            <br />
            student life
          </h2>
        </div>
      </div>
      <div ref={wellnessRef} className="life__wellness">
        <WellnessReveal offset={slide} stepScroll={stepScroll} />
      </div>
    </section>
  );
}
