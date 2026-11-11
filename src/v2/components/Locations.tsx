import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import LocationCard from './LocationCard';
import { COMING_SOON, HOME_PROPERTIES as PROPERTIES } from './homeLocations';
import { gsap } from '../../lib/smoothScroll';
import prevIcon from '../../assets/v2/loc-prev.svg';
import nextIcon from '../../assets/v2/loc-next.svg';
import './Locations.css';

const DRAG_THRESHOLD = 5;
/** Arrow-button glide, matching the site's other ease-in-out transitions. */
const GLIDE = { duration: 0.8, ease: 'power2.inOut' };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Figma 1441:15286 → 1441:16288. The intro column (with the coming-soon list) stays put
 * while the property cards scroll in a native horizontal scroller with card snapping —
 * trackpad/touch swipe, mouse drag, arrow keys or the prev/next buttons. Cards slide
 * beneath the intro (which picks up a soft shadow), the progress bar fills, and the
 * counter steps 01/02 → 02/02.
 */
export default function Locations() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const count = PROPERTIES.length;
  const [index, setIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const cardStep = () => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !first) return 580; // 556px card + 24px gap
    return first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
  };

  // Scroll position → progress bar + intro shadow (CSS variable), counter and buttons.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const progress = max > 1 ? Math.min(Math.max(viewport.scrollLeft / max, 0), 1) : 1;
      sectionRef.current?.style.setProperty('--progress', progress.toFixed(4));
      setIndex(Math.round(progress * (count - 1)));
      setAtStart(viewport.scrollLeft <= 1);
      setAtEnd(viewport.scrollLeft >= max - 1);
    };
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    viewport.addEventListener('scroll', onChange, { passive: true });
    const ro = new ResizeObserver(onChange);
    ro.observe(viewport);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('scroll', onChange);
      ro.disconnect();
    };
  }, [count]);

  /** Animate the carousel to `left`, with snapping paused meanwhile. */
  const glideTo = (left: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    gsap.killTweensOf(viewport);
    viewport.classList.add('is-gliding');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(viewport, {
      scrollLeft: Math.min(Math.max(left, 0), max),
      ...GLIDE,
      duration: reduced ? 0 : GLIDE.duration,
      onComplete: () => viewport.classList.remove('is-gliding'),
    });
  };

  const go = (dir: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const step = cardStep();
    glideTo((Math.round(viewport.scrollLeft / step) + dir) * step);
  };

  // Mouse drag (touch and trackpads scroll natively).
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    gsap.killTweensOf(e.currentTarget);
    drag.current = { startX: e.clientX, startScroll: e.currentTarget.scrollLeft, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    e.currentTarget.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    suppressClick.current = true;
    requestAnimationFrame(() => (suppressClick.current = false));

    // Favour the drag's direction once it's more than a fifth of a card.
    const viewport = e.currentTarget;
    const direction = -(e.clientX - d.startX);
    const step = cardStep();
    const raw = viewport.scrollLeft / step;
    const target =
      Math.abs(direction) > step / 5 ? (direction > 0 ? Math.ceil(raw) : Math.floor(raw)) : Math.round(raw);
    setDragging(false);
    glideTo(target * step);
  };

  const onClickCapture = (e: MouseEvent) => {
    if (suppressClick.current) e.preventDefault();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    go(e.key === 'ArrowRight' ? 1 : -1);
  };

  return (
    <section ref={sectionRef} className="locations" id="locations">
      <div className="locations__overview">
        <div className="locations__intro">
          <div className="locations__intro-copy">
            <div className="locations__heading">
              <p className="eyebrow">Locations</p>
              <h2 className="display-title">
                Write your <em>story</em>
              </h2>
            </div>
            <p className="type-body-l locations__lede">
              Modern spaces, all-inclusive amenities, and a vibrant student community—all in the
              cities where you study.
            </p>
          </div>

          <span className="locations__rule" aria-hidden />

          <div className="locations__soon">
            <p className="locations__soon-title">
              New locations <em>coming soon</em>!
            </p>
            {COMING_SOON.map((r) => (
              <div key={r.region} className="locations__soon-region">
                <p className="locations__soon-name">{r.region}</p>
                <ul>
                  {r.places.map((place) => (
                    <li key={place}>{place}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="locations__showcase">
          <div
            ref={viewportRef}
            className={`locations__viewport${dragging ? ' is-dragging' : ''}`}
            role="region"
            aria-roledescription="carousel"
            aria-label="EPIISOD properties"
            tabIndex={0}
            data-lenis-prevent-horizontal
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
            onKeyDown={onKeyDown}
          >
            <div ref={trackRef} className="locations__track">
              {PROPERTIES.map((p) => (
                <LocationCard key={p.id} property={p} />
              ))}
            </div>
          </div>

          <div className="locations__nav">
            <div className="locations__nav-row">
              <button
                type="button"
                className="locations__arrow"
                aria-label="Previous property"
                disabled={atStart}
                onClick={() => go(-1)}
              >
                <img src={prevIcon} width={24} height={24} alt="" />
              </button>
              <div className="locations__progress" aria-hidden>
                <div className="locations__progress-bar" style={{ ['--count' as string]: count }} />
              </div>
              <button
                type="button"
                className="locations__arrow"
                aria-label="Next property"
                disabled={atEnd}
                onClick={() => go(1)}
              >
                <img src={nextIcon} width={24} height={24} alt="" />
              </button>
            </div>
            <p className="locations__counter" aria-live="polite">
              {pad(index + 1)}/{pad(count)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
