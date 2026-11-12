import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useExitParallax } from '../../lib/useExitParallax';
import play from '../../assets/property/icon-play-white.svg';
import { EXPERIENCE_URL } from '../../lib/links';
import type { PropertyContent } from './propertyContent';
import './Amenities.css';
import './Amenities3D.css';

// three.js and the model only come in when the section nears the screen
const BuildingViewer = lazy(() => import('./BuildingViewer'));
const MODEL = '/models/macquarie-park-building.glb';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Amenities with the 3D building (in place of the photo amenities, Amenities.tsx), in one
 * plain two-column section: the heading, the facade and the grouped, numbered amenities on
 * the left, the building on the right. Tapping an amenity lights its part of the building
 * and flies the camera to it, with a card and line on the spot. No pinning or scroll
 * animation. On phones the model sits under the heading, then the list.
 */
export default function Amenities3D({ id, content }: { id: string; content: PropertyContent }) {
  const { facade, groups } = content.amenities3d!;
  // Step 0 is the facade, the building as a whole; the amenities follow
  const items = [facade, ...groups.flatMap((g) => g.items)];
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const shown = active;
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

  useExitParallax(sectionRef);

  let n = 0;
  return (
    <section ref={sectionRef} className="a3d exit-parallax" id={id}>
      <div className="a3d__stage" ref={stageRef} id={`${id}-stage`}>
        <div className="a3d__inner" data-exit-content>
          <div className="a3d__copy">
            <div className="a3d__left">
              <header className="a3d__head">
                <p className="eyebrow">Amenities</p>
                <h2 className="a3d__heading">
                  Thoughtfully designed <em>student housing</em> in {content.city}
                </h2>
              </header>
              <div className="a3d__body">
              <button
                type="button"
                className={`a3d__facade${shown === 0 ? ' is-active' : ''}`}
                onClick={() => setActive(0)}
              >
                <span className="a3d__facade-title">View facade</span>
                <span className="a3d__facade-text">{facade.text}</span>
              </button>
              <div className="a3d__groups">
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
                              onClick={() => setActive(i)}
                            >
                              <span className="a3d__num">{pad(i)}</span>
                              <span className="a3d__title">{a.title}</span>
                            </button>
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
            </div>

            <div className="a3d__right">
              {near && current && (
                <Suspense fallback={null}>
                  <BuildingViewer
                    src={MODEL}
                    view={current.view}
                    parts={current.parts}
                    callout={current.anchor ? { title: current.title, text: current.text, image: current.image, anchor: current.anchor } : null}
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
