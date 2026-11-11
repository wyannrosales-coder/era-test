import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import VLine from '../VLine';
import { addStepSnap, gsap, ScrollTrigger, scrollToY, useGSAP } from '../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import line from '../../assets/make-it-yours-line.svg';
import play from '../../assets/property/icon-play-white.svg';
import type { Amenity, PropertyContent } from './propertyContent';
import { EXPERIENCE_URL } from '../../lib/links';
import './Amenities.css';

/** Figma sizes: the opening window, then the wide frame (transition 1099:34869). */
const WINDOW = { w: 324, h: 276 };
const WIDE = { w: 992, h: 454 };
/** Phones (Figma 1314:14065): the window under the lede, the frame it grows to as it rises,
 *  then the carousel's photo frame and the gap to the next one. */
const PHONE = { window: { w: 162, h: 140 }, wide: { w: 342, h: 297 }, card: { w: 342, h: 276 }, gap: 8 };

const cropStyle = (a: Amenity) =>
  (a.crop ? { '--pos': a.crop.position, '--zoom': a.crop.zoom } : undefined) as CSSProperties | undefined;

/**
 * Amenities (Figma 1080:5595 → transition 1099:34869). The heading scrolls in, then the
 * stage pins: the photo opens from a small window, through a wide frame, to the whole
 * screen (as the brand video does), and darkens behind the amenities list. Scrolling on
 * steps through the amenities: the active one grows, its description opens, the photo
 * behind it changes and the bar beside the list fills to it. It all follows the scroll
 * fluidly, 70% of a screen of scroll per amenity; when the scroll comes to rest in the list it
 * eases to the nearer amenity.
 *
 * On phones (Figma 1314:14065) the window sits under the lede and widens as it rises; the
 * stage pins and it opens to the whole screen and darkens. Over it, the amenities become a
 * carousel: each one's photo slides in from the right, the bar across fills, and its copy
 * hands over, a step of scroll per amenity, easing to the nearer one when it rests.
 *
 * Tablets and reduced motion get the heading, the photo, then the whole list.
 */
export default function Amenities({ id, content }: { id: string; content: PropertyContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  /** Page position of each amenity's stop (larger screens), for dragging the bar. */
  const stopsAt = useRef<(() => number[]) | null>(null);
  const dragging = useRef(false);
  const [active, setActive] = useState(0);
  const items = content.amenities;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-animated');
        const q = gsap.utils.selector(section);
        const stage = q('.amenities__stage')[0] as HTMLElement;
        const media = q('.amenities__media')[0] as HTMLElement;

        /** A frame of `w × h` Figma px, centred on the screen, as a clip-path inset. */
        const frame = ({ w, h }: { w: number; h: number }) => () => {
          const k = Math.min(1, stage.clientWidth / 1512);
          const x = Math.max(0, (stage.clientWidth - w * k) / 2);
          const y = Math.max(0, (stage.clientHeight - h * k) / 2);
          return `inset(${y}px ${x}px ${y}px ${x}px)`;
        };

        /** Timeline time of the first amenity; each of the others follows a unit later. */
        const STEPS_AT = 2.1;
        /** When the list arrives over the full-screen photo. */
        const LIST_AT = 1.5;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            // 70% of a screen of scroll per amenity: quick to move on, still room to stop
            end: () => `+=${window.innerHeight * 0.7 * (STEPS_AT + items.length - 1 + 0.3)}`,
            pin: true,
            // Follows the scroll closely, with just enough catch-up to smooth it
            scrub: 0.12,
            invalidateOnRefresh: true,
            // The active amenity follows the scroll; CSS eases each change
            onUpdate: (self) => {
              const t = self.progress * tl.duration();
              const step = Math.round(Math.min(Math.max(t - STEPS_AT, 0), items.length - 1));
              setActive((a) => (a === step ? a : step));
              // Once the list is up, each photo takes its Figma crop; until then it's whole.
              // Set on the element, not through React, which owns only the base classes.
              section.classList.toggle('is-listing', t >= LIST_AT);
            },
          },
        });

        // 0) On the way in, a gentle parallax between the heading and the small window: the
        //    heading lags behind the scroll while the window rises a touch faster, so the
        //    gap between them closes softly. It ends as the stage pins, with both in place.
        const approach = { trigger: stage, start: 'top bottom', end: 'top top', scrub: 0.2 };
        gsap.fromTo(
          '.amenities__intro',
          { y: 0 },
          { y: () => window.innerHeight * 0.08, ease: 'none', scrollTrigger: approach },
        );
        gsap.fromTo(
          media,
          { y: () => window.innerHeight * 0.12 },
          { y: 0, ease: 'none', immediateRender: true, scrollTrigger: approach },
        );

        tl.addLabel('window')
          // 1) The window opens to the wide frame, then to the whole screen
          // One continuous growth: speeding up into the wide frame, slowing out of it, so
          // the motion doesn't pause at the hand-over
          .fromTo(media, { clipPath: frame(WINDOW) }, { clipPath: frame(WIDE), duration: 0.8, ease: 'power1.in' })
          .addLabel('wide')
          // From an explicit four-edge start: the browser reports the wide frame in short form
          // ("inset(y x)"), and tweening that against four values opened the left edge first
          .fromTo(media, { clipPath: frame(WIDE) }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.8, ease: 'power1.out' })
          // 2) The photo darkens and the list arrives
          .fromTo('.amenities__overlay', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.3)
          .fromTo(
            '.amenities__copy',
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            1.6,
          )
          .addLabel('step0', STEPS_AT);
        // 3) One unit of scroll per amenity (the change itself is CSS, on `active`)
        for (let i = 1; i < items.length; i++) tl.addLabel(`step${i}`, STEPS_AT + i);
        tl.to({}, { duration: 0.3 }, STEPS_AT + items.length - 1);

        // Everything follows the scroll fluidly; once it comes to rest within the list, it
        // eases to an amenity: the next one if it moved even a little towards it, otherwise
        // back (a magnetic settle that never carries on further)
        const stops = () => items.map((_, i) => tl.labels[`step${i}`] / tl.duration());
        const removeSnap = addStepSnap(tl.scrollTrigger!, stops, {
          nearest: true,
          // A tenth of the way towards the next amenity is enough to settle there
          lean: 0.1,
          duration: 0.5,
          rest: 120,
          paused: () => dragging.current,
        });
        stopsAt.current = () => {
          const { start, end } = tl.scrollTrigger!;
          return stops().map((p) => start + p * (end - start));
        };

        return () => {
          removeSnap();
          stopsAt.current = null;
          section.classList.remove('is-animated');
          setActive(0);
          section.classList.remove('is-listing');
        };
      });
    },
    { scope: sectionRef, dependencies: [items.length] },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add('(max-width: 700px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-carousel');
        const q = gsap.utils.selector(section);
        const stage = q('.amenities__stage')[0] as HTMLElement;
        const media = q('.amenities__media')[0] as HTMLElement;
        const cards = q('.amenities__card') as HTMLElement[];
        const entries = q('.amenities__item') as HTMLElement[];

        /** A frame of `w × h` Figma px, centred across the stage and at its top. */
        const frame = ({ w, h }: { w: number; h: number }) => () => {
          const k = stage.clientWidth / 390;
          const x = (stage.clientWidth - w * k) / 2;
          return `inset(0px ${x}px ${stage.clientHeight - h * k}px ${x}px)`;
        };
        const cardW = () => q('.amenities__cards')[0].clientWidth;
        /** The photo's centre: the frame's centre while it's at the stage's top. */
        const middle = ({ h }: { h: number }) => () => `${(h * stage.clientWidth) / 390 / 2}px`;

        // One timeline from the moment the stage comes on screen, so the window's widening
        // and its opening can't fight over the clip-path (two scrubbed tweens on the same
        // property would let the late one win when scrolling fast). The pin is separate.
        // Units: 70% of a screen of scroll each; the approach is a whole screen.
        const UNIT = 0.7;
        const A = 1 / UNIT;
        const PINNED = 1.6 + items.length - 1 + 0.3;
        ScrollTrigger.create({
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * UNIT * PINNED}`,
          pin: true,
          invalidateOnRefresh: true,
        });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top bottom',
            end: () => `+=${window.innerHeight * (1 + UNIT * PINNED)}`,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });

        tl.set(cards, { width: cardW })
          .set(entries.slice(1), { autoAlpha: 0, x: 40 })
          .set('.amenities__progress-bar', { scaleX: 1 / items.length })
          // 0) On the way up, the window under the lede widens to the content width
          .fromTo(
            media,
            { clipPath: frame(PHONE.window), '--cy': middle(PHONE.window) },
            { clipPath: frame(PHONE.wide), '--cy': middle(PHONE.wide), duration: A, ease: 'power1.inOut' },
            0,
          )
          // 1) Pinned: the frame opens to the whole screen and darkens
          // From an explicit four-edge start (the browser reports the frame in short form,
          // which tweened against four values opens the left edge first)
          .fromTo(
            media,
            { clipPath: frame(PHONE.wide), '--cy': middle(PHONE.wide) },
            {
              clipPath: 'inset(0px 0px 0px 0px)',
              '--cy': () => `${stage.clientHeight / 2}px`,
              duration: 0.8,
              ease: 'power2.inOut',
              immediateRender: false,
            },
            A,
          )
          .fromTo('.amenities__overlay', { opacity: 0 }, { opacity: 0.95, duration: 0.4 }, A + 0.5)
          // 2) The carousel rises in over it
          .fromTo('.amenities__copy', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, A + 1)
          .addLabel('step0', A + 1.6);
        // 3) A unit of scroll per amenity: photos slide across, copy hands over, the bar fills
        for (let i = 1; i < items.length; i++) {
          const at = A + 1.6 + i - 1 + 0.15;
          tl.to('.amenities__track', { x: () => -i * (cardW() + PHONE.gap), duration: 0.7, ease: 'power2.inOut' }, at)
            .to(entries[i - 1], { autoAlpha: 0, x: -40, duration: 0.3, ease: 'power1.in' }, at)
            .to(entries[i], { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out' }, at + 0.3)
            .to('.amenities__progress-bar', { scaleX: (i + 1) / items.length, duration: 0.7, ease: 'power2.inOut' }, at)
            .addLabel(`step${i}`, A + 1.6 + i);
        }
        tl.to({}, { duration: 0.3 }, A + 1.6 + items.length - 1);

        const removeSnap = addStepSnap(
          tl.scrollTrigger!,
          () => items.map((_, i) => tl.labels[`step${i}`] / tl.duration()),
          { nearest: true, lean: 0.1, duration: 0.6, rest: 120 },
        );

        return () => {
          removeSnap();
          section.classList.remove('is-carousel');
        };
      });
    },
    { scope: sectionRef, dependencies: [items.length] },
  );

  /**
   * The bar beside the list doubles as a scrollbar: press or drag along it to move through
   * the amenities. The page follows the pointer between stops; letting go settles on the
   * nearest amenity (the step snap).
   */
  const scrubTo = (e: ReactPointerEvent<HTMLDivElement>, immediate: boolean) => {
    const at = stopsAt.current?.();
    if (!at || !at.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    // Each amenity owns an equal share of the bar; the middle of its share is its stop
    const f = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1) * at.length - 0.5;
    const i = Math.min(Math.max(Math.floor(f), 0), at.length - 2);
    const t = Math.min(Math.max(f - i, 0), 1);
    const y = at.length > 1 ? at[i] + (at[i + 1] - at[i]) * t : at[0];
    scrollToY(Math.round(immediate ? y : at[Math.round(Math.min(Math.max(f, 0), at.length - 1))]), { immediate });
  };

  const onBarDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!stopsAt.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('is-dragging');
    scrubTo(e, false);
  };

  const onBarMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) scrubTo(e, true);
  };

  const onBarUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.classList.remove('is-dragging');
    // Settle on the amenity nearest where it was let go
    scrubTo(e, false);
  };

  // Hand-over to the rooms: the finished frame lags and dims as they slide over it.
  // Set up after the pin, so it measures the section with its pinned scroll added.
  useExitParallax(sectionRef);

  return (
    <section ref={sectionRef} className="amenities exit-parallax" id={id}>
      <div className="amenities__intro">
        <VLine src={line} length={100} />
        <div className="heading-group">
          <p className="eyebrow">Amenities</p>
          <h2 className="type-h2">
            Thoughtfully designed <em>student housing</em> in {content.city}
          </h2>
        </div>
        <p className="type-body-l amenities__lede">
          Modern spaces, all-inclusive amenities, and a vibrant student community—all in the
          cities where you study.
        </p>
      </div>

      <div className="amenities__stage" id={`${id}-stage`}>
        {/* Drifts on the hand-over to the rooms; the stage itself is pinned, so the drift
            can't go on it (the two would compound) */}
        <div className="amenities__inner" data-exit-content>
          <div className="amenities__media" aria-hidden>
            {items.map((a, i) => (
              <img
                key={a.lead + a.rest}
                className={`amenities__photo${i === active ? ' is-active' : ''}`}
                src={a.image}
                alt=""
                style={cropStyle(a)}
              />
            ))}
            <div className="amenities__overlay" />
          </div>

          <div className="amenities__copy">
            {/* Phones: the amenities' photos in a row, slid across one at a time */}
            <div className="amenities__cards" aria-hidden>
              <div className="amenities__track">
                {items.map((a) => (
                  <div key={a.lead + a.rest} className="amenities__card">
                    <img src={a.image} alt="" />
                  </div>
                ))}
              </div>
            </div>
            <p className="eyebrow amenities__eyebrow">Amenities</p>
            <div className="amenities__list-row">
              <div
                className="amenities__progress"
                aria-hidden
                onPointerDown={onBarDown}
                onPointerMove={onBarMove}
                onPointerUp={onBarUp}
                onPointerCancel={onBarUp}
              >
                <span
                  className="amenities__progress-bar"
                  style={{ '--fill': `${((active + 1) / items.length) * 100}%` } as CSSProperties}
                />
              </div>
              <ul className="amenities__list">
                {items.map((a, i) => (
                  <li key={a.lead + a.rest} className={`amenities__item${i === active ? ' is-active' : ''}`}>
                    <h3 className="amenities__title">
                      <span className="amenities__lead">{a.lead}</span>
                      {a.rest}
                    </h3>
                    <div className="amenities__text-wrap">
                      <p className="amenities__text">{a.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href={EXPERIENCE_URL}
              className="amenities__button"
            >
              <img src={play} width={24} height={24} alt="" />
              <span>Enter the EPIISOD experience</span>
            </a>
          </div>
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
