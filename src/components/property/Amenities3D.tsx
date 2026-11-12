import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import VLine from '../VLine';
import { addStepSnap, gsap, useGSAP } from '../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import line from '../../assets/make-it-yours-line.svg';
import play from '../../assets/property/icon-play-white.svg';
import { EXPERIENCE_URL } from '../../lib/links';
import type { PropertyContent } from './propertyContent';
import './Amenities.css';
import './Amenities3D.css';

// three.js and the model only come in when the section nears the screen
const BuildingViewer = lazy(() => import('./BuildingViewer'));
const MODEL = '/models/macquarie-park-building.glb';

/** Figma sizes of the opening window and the wide frame, as the photo amenities use. */
const WINDOW = { w: 324, h: 276 };
const WIDE = { w: 992, h: 454 };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Amenities with the 3D building (in place of the photo amenities, Amenities.tsx): the
 * same entrance, a small window that opens to the whole screen as the stage pins. Then
 * the amenities, grouped and numbered, take the left column and the building the right.
 * Scrolling on steps through the amenities, and hovering one does too: each lights its
 * part of the building and flies the camera to it. Drag the model to look around.
 *
 * Phones, tablets and reduced motion get the model, then the list; tapping an amenity
 * flies to it.
 */
export default function Amenities3D({ id, content }: { id: string; content: PropertyContent }) {
  const groups = content.amenities3d ?? [];
  const items = groups.flatMap((g) => g.items);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const shown = hover ?? active;
  const current = items[shown];

  // Load when within a screen or two; render only while on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setNear(true);
      setOnScreen(true);
      return;
    }
    const far = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), far.disconnect()), {
      rootMargin: '150% 0px',
    });
    const vis = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '20% 0px' });
    far.observe(el);
    vis.observe(el);
    return () => {
      far.disconnect();
      vis.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-animated');
        const q = gsap.utils.selector(section);
        const stage = q('.a3d__stage')[0] as HTMLElement;
        const media = q('.a3d__media')[0] as HTMLElement;

        const frame = ({ w, h }: { w: number; h: number }) => () => {
          const k = Math.min(1, stage.clientWidth / 1512);
          const x = Math.max(0, (stage.clientWidth - w * k) / 2);
          const y = Math.max(0, (stage.clientHeight - h * k) / 2);
          return `inset(${y}px ${x}px ${y}px ${x}px)`;
        };

        const STEPS_AT = 2.2;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${window.innerHeight * 0.6 * (STEPS_AT + items.length - 1 + 0.3)}`,
            pin: true,
            scrub: 0.12,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const t = self.progress * tl.duration();
              const step = Math.round(Math.min(Math.max(t - STEPS_AT, 0), items.length - 1));
              setActive((a) => (a === step ? a : step));
            },
          },
        });

        const approach = { trigger: stage, start: 'top bottom', end: 'top top', scrub: 0.2 };
        gsap.fromTo('.a3d__intro', { y: 0 }, { y: () => window.innerHeight * 0.08, ease: 'none', scrollTrigger: approach });
        gsap.fromTo(
          media,
          { y: () => window.innerHeight * 0.12 },
          { y: 0, ease: 'none', immediateRender: true, scrollTrigger: approach },
        );

        tl.fromTo(media, { clipPath: frame(WINDOW) }, { clipPath: frame(WIDE), duration: 0.8, ease: 'power1.in' })
          .fromTo(media, { clipPath: frame(WIDE) }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.8, ease: 'power1.out' })
          // The photo gives way to the section's own surface, then the two columns arrive
          .fromTo('.a3d__panel', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.3)
          .fromTo('.a3d__left', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 1.65)
          .fromTo('.a3d__right', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 1.75)
          .addLabel('step0', STEPS_AT);
        for (let i = 1; i < items.length; i++) tl.addLabel(`step${i}`, STEPS_AT + i);
        tl.to({}, { duration: 0.3 }, STEPS_AT + items.length - 1);

        const removeSnap = addStepSnap(
          tl.scrollTrigger!,
          () => items.map((_, i) => tl.labels[`step${i}`] / tl.duration()),
          { nearest: true, lean: 0.1, duration: 0.5, rest: 120 },
        );

        return () => {
          removeSnap();
          section.classList.remove('is-animated');
          setActive(0);
        };
      });
    },
    { scope: sectionRef, dependencies: [items.length] },
  );

  useExitParallax(sectionRef);

  let n = -1;
  return (
    <section ref={sectionRef} className="amenities a3d exit-parallax" id={id}>
      <div className="amenities__intro a3d__intro">
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

      <div className="a3d__stage" ref={stageRef} id={`${id}-stage`}>
        <div className="a3d__inner" data-exit-content>
          <div className="a3d__media" aria-hidden>
            <img src={content.amenities[0]?.image} alt="" />
            <div className="a3d__panel" />
          </div>

          <div className="a3d__copy">
            <div className="a3d__left">
              <p className="eyebrow a3d__eyebrow">Amenities</p>
              <div className="a3d__groups" onMouseLeave={() => setHover(null)}>
                {groups.map((g) => (
                  <div key={g.name} className="a3d__group">
                    <h3 className="a3d__group-name">{g.name}</h3>
                    <ol className="a3d__list">
                      {g.items.map((a) => {
                        n += 1;
                        const i = n;
                        const on = i === shown;
                        return (
                          <li key={a.title} className={`a3d__item${on ? ' is-active' : ''}`}>
                            <button
                              type="button"
                              className="a3d__row"
                              aria-expanded={on}
                              onMouseEnter={() => setHover(i)}
                              onFocus={() => setHover(i)}
                              onBlur={() => setHover(null)}
                              onClick={() => setActive(i)}
                            >
                              <span className="a3d__num">{pad(i + 1)}</span>
                              <span className="a3d__title">{a.title}</span>
                            </button>
                            <div className="a3d__text-wrap">
                              <p className="a3d__text">{a.text}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </div>
              <a href={EXPERIENCE_URL} className="amenities__button a3d__button">
                <img src={play} width={24} height={24} alt="" />
                <span>Enter the EPIISOD experience</span>
              </a>
            </div>

            <div className="a3d__right">
              {near && current && (
                <Suspense fallback={null}>
                  <BuildingViewer
                    src={MODEL}
                    view={current.view}
                    parts={current.parts}
                    active={onScreen}
                    onLoaded={() => setLoaded(true)}
                  />
                </Suspense>
              )}
              <p className={`a3d__loading${loaded ? ' is-done' : ''}`} aria-hidden={loaded}>
                Loading the building…
              </p>
              <p className="a3d__hint" aria-hidden>
                <span>{current?.title}</span> · Drag to look around
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
