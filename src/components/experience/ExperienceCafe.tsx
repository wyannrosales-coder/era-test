import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { addStepSnap, gsap, useGSAP } from '../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import coffee from '../../assets/experience/coffee.jpg';
import sonder from '../../assets/experience/sonder.jpg';
import './ExperienceCafe.css';

type Moment = {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  /** Figma's crop: object-position, with a zoom about that same point. */
  crop: { position: string; zoom: number };
  /** The crop in the phones' 342 × 276 frame (Figma 1275:8537). */
  phoneCrop: { position: string; zoom: number };
};

const cropStyle = ({ position, zoom }: Moment['crop']) =>
  ({ objectPosition: position, transformOrigin: position, transform: `scale(${zoom})` }) as CSSProperties;

/** Figma 1071:5417. */
const MOMENTS: Moment[] = [
  {
    eyebrow: 'A cafe everyday moments',
    title: '10 Coffee Hill',
    text: 'Your go-to spot to start the day, catch up with friends, or take a break in between at every EPIISOD.',
    image: coffee,
    crop: { position: '50% 100%', zoom: 1 },
    phoneCrop: { position: '50% 84%', zoom: 1.252 },
  },
  {
    eyebrow: 'Support, whenever you need it',
    title: 'Sonder',
    text: '24/7 access to safety and wellbeing support, right at your fingertips.',
    image: sonder,
    crop: { position: '91% 0%', zoom: 1.208 },
    phoneCrop: { position: '78% 26%', zoom: 1.569 },
  },
];

/** Figma sizes: the opening window and the full photo (672 × 562.84). */
const WINDOW = { w: 324, h: 276, centreX: 394 };
const PHOTO = { w: 672, h: 562.84 };
const GAP = 24;
/** Phones (Figma 1275:8537): the frame, the opening window inside it, the gap to the next. */
const PHONE = { w: 342, h: 276, winW: 176.09, winH: 150, gap: 8 };

/**
 * Everyday moments (transition, Figma 1071:5417), stepped like the homepage's student
 * life fold. The section pins; the photo opens from a small window into the full frame
 * (as the brand video does), with the next one peeking below. Scrolling on slides the
 * photos up to the next moment while its copy rises in and the bar beside it fills.
 * When the reader stops, the scroll eases on to the next step: window, first, second.
 *
 * On phones (Figma 1275:8537) the window opens the same way above the copy and a bar
 * across, then the photos slide sideways to the next moment, the next one peeking in
 * from the screen's edge. Reduced motion gets each moment as a plain photo with its copy.
 */
export default function ExperienceCafe() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-animated');
        const q = gsap.utils.selector(section);
        const column = q('.xp-cafe__media')[0] as HTMLElement;
        const track = q('.xp-cafe__track')[0] as HTMLElement;
        const items = q('.xp-cafe__item') as HTMLElement[];

        /** Photo size and the window's inset at the start, from the column's real size. */
        const geo = () => {
          const k = Math.min(1, column.clientWidth / PHOTO.w);
          const w = PHOTO.w * k;
          const h = PHOTO.h * k;
          const top = (column.clientHeight - h) / 2;
          const winW = WINDOW.w * k;
          const winH = WINDOW.h * k;
          const left = WINDOW.centreX * k - winW / 2;
          return {
            w,
            h,
            top,
            inset: {
              top: top + (h - winH) / 2,
              right: column.clientWidth - left - winW,
              bottom: column.clientHeight - top - (h + winH) / 2,
              left,
            },
            // The photo in the window is shown a touch larger, as Figma crops it (788 / 672)
            zoom: 788 / 672,
            origin: `${left + winW / 2}px ${h / 2}px`,
          };
        };

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            // The stage pins, not the section, so the section grows by the pinned scroll
            // and the exit parallax below starts once the sequence is done
            trigger: q('.xp-cafe__stage')[0] as HTMLElement,
            start: 'top top',
            // About a screen of scroll per step, as on the homepage's student life fold
            end: '+=200%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        tl.set(track, { top: () => geo().top, width: () => geo().w })
          .set('.xp-cafe__photo', { height: () => geo().h })
          .set(items.slice(1), { autoAlpha: 0, y: 40 })
          .addLabel('window')
          // 1) The window opens into the full photo
          .fromTo(
            column,
            {
              clipPath: () => {
                const i = geo().inset;
                return `inset(${i.top}px ${i.right}px ${i.bottom}px ${i.left}px)`;
              },
            },
            { clipPath: 'inset(0px 0px 0px 0px)', duration: 1, ease: 'power2.inOut' },
          )
          .fromTo(
            track,
            { scale: () => geo().zoom, transformOrigin: () => geo().origin },
            { scale: 1, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          .addLabel('moment0')
          .to({}, { duration: 0.3 })
          // 2) On to the next moment: photos slide up, copy hands over, the bar fills
          .to(track, { y: () => -(geo().h + GAP), duration: 1, ease: 'power2.inOut' })
          .to(items[0], { autoAlpha: 0, y: -40, duration: 0.45, ease: 'power1.in' }, '<')
          .to(items[1], { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '<0.4')
          .fromTo(
            '.xp-cafe__progress-bar',
            { scaleY: 1 / MOMENTS.length },
            { scaleY: 1, duration: 1, ease: 'power2.inOut' },
            '<-0.4',
          )
          .addLabel('moment1')
          .to({}, { duration: 0.3 });

        // Ease on to the next step once the scroll comes to rest: window, first, second
        const removeSnap = addStepSnap(tl.scrollTrigger!, () =>
          ['window', 'moment0', 'moment1'].map((l) => tl.labels[l] / tl.duration()),
        );

        return () => {
          removeSnap();
          section.classList.remove('is-animated');
        };
      });

      gsap.matchMedia().add('(max-width: 700px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-carousel');
        const q = gsap.utils.selector(section);
        const stage = q('.xp-cafe__stage')[0] as HTMLElement;
        const column = q('.xp-cafe__media')[0] as HTMLElement;
        const track = q('.xp-cafe__track')[0] as HTMLElement;
        const items = q('.xp-cafe__item') as HTMLElement[];

        /** The frame's size, the window's inset in it, and the page gutter beside it. */
        const geo = () => {
          const w = column.clientWidth;
          const k = w / PHONE.w;
          const h = PHONE.h * k;
          const x = (w - PHONE.winW * k) / 2;
          const y = (h - PHONE.winH * k) / 2;
          return { w, h, x, y, gutter: (stage.clientWidth - w) / 2 };
        };

        gsap.set(q('.xp-cafe__photo img'), {
          objectPosition: (i: number) => MOMENTS[i].phoneCrop.position,
          transformOrigin: (i: number) => MOMENTS[i].phoneCrop.position,
          scale: (i: number) => MOMENTS[i].phoneCrop.zoom,
        });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=200%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        tl.set('.xp-cafe__photo', { width: () => geo().w, height: () => geo().h })
          .set(items.slice(1), { autoAlpha: 0, x: 40 })
          .addLabel('window')
          // 1) The window opens into the full frame, and out to the screen's edges so the
          //    next photo peeks in
          .fromTo(
            column,
            {
              clipPath: () => {
                const g = geo();
                return `inset(${g.y}px ${g.x}px ${g.y}px ${g.x}px)`;
              },
            },
            {
              clipPath: () => `inset(0px ${-geo().gutter}px 0px ${-geo().gutter}px)`,
              duration: 1,
              ease: 'power2.inOut',
            },
          )
          // The bar and copy only rise in once the photo has opened
          .fromTo(
            ['.xp-cafe__progress', items[0]],
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 },
          )
          .addLabel('moment0')
          .to({}, { duration: 0.3 })
          // 2) On to the next moment: photos slide across, copy hands over, the bar fills
          .to(track, { x: () => -(geo().w + PHONE.gap), duration: 1, ease: 'power2.inOut' })
          .to(items[0], { autoAlpha: 0, x: -40, duration: 0.45, ease: 'power1.in' }, '<')
          .to(items[1], { autoAlpha: 1, x: 0, duration: 0.55, ease: 'power2.out' }, '<0.4')
          .fromTo(
            '.xp-cafe__progress-bar',
            { scaleX: 1 / MOMENTS.length },
            { scaleX: 1, duration: 1, ease: 'power2.inOut' },
            '<-0.4',
          )
          .addLabel('moment1')
          .to({}, { duration: 0.3 });

        const removeSnap = addStepSnap(tl.scrollTrigger!, () =>
          ['window', 'moment0', 'moment1'].map((l) => tl.labels[l] / tl.duration()),
        );

        return () => {
          removeSnap();
          section.classList.remove('is-carousel');
        };
      });
    },
    { scope: sectionRef },
  );

  // Hand-over to the Instagram band: once the pin lets go, the copy and photo lag behind
  // and dim as the band slides up over them. Set up after the pin, so it measures the
  // section with its pinned scroll already added.
  useExitParallax(sectionRef);

  return (
    <section ref={sectionRef} className="xp-cafe exit-parallax" aria-label="Everyday moments">
      {/* Animated stage (larger screens) */}
      <div className="xp-cafe__stage" aria-hidden>
        <div className="xp-cafe__media" data-exit-content>
          <div className="xp-cafe__track">
            {MOMENTS.map((m) => (
              <div key={m.title} className="xp-cafe__photo">
                <img src={m.image} alt="" style={cropStyle(m.crop)} />
              </div>
            ))}
          </div>
        </div>
        <div className="xp-cafe__copy" data-exit-content>
          <div className="xp-cafe__progress">
            <span className="xp-cafe__progress-bar" />
          </div>
          <div className="xp-cafe__items">
            {MOMENTS.map((m) => (
              <div key={m.title} className="xp-cafe__item">
                <p className="eyebrow">{m.eyebrow}</p>
                <h3 className="type-h3">{m.title}</h3>
                <p className="type-body-l xp-cafe__text">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plain layout (phones, reduced motion) */}
      <div className="xp-cafe__static" data-exit-content>
        {MOMENTS.map((m) => (
          <article key={m.title} className="xp-cafe__moment">
            <div className="xp-cafe__moment-img">
              <img src={m.image} alt="" style={cropStyle(m.crop)} />
            </div>
            <div className="xp-cafe__moment-copy">
              <p className="eyebrow">{m.eyebrow}</p>
              <div className="xp-cafe__moment-text">
                <h3 className="type-h3">{m.title}</h3>
                <p className="type-body-l xp-cafe__text">{m.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
