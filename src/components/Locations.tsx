import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import LocationCard from './LocationCard';
import { PROPERTIES, REGIONS } from './locationData';
import { gsap } from '../lib/smoothScroll';
import caretRight from '../assets/loc-caret-right.svg';
import activeDot from '../assets/loc-active-dot.svg';
import './Locations.css';

const ALL = 'All';
const DRAG_THRESHOLD = 5;
/** Track-click glide, matching the site's other ease-in-out transitions. */
const GLIDE = { duration: 0.6, ease: 'power2.inOut' };

/**
 * Figma 539:10827 → 539:11232. A native horizontal scroller with card snapping:
 * trackpad/touch swipe, mouse drag and arrow keys all move it. As it scrolls, cards
 * slide beneath the intro column (which picks up a soft shadow) and the progress
 * bar travels to the end of its track.
 */
export default function Locations() {
  const [regionId, setRegionId] = useState(REGIONS[0].id);
  const [city, setCity] = useState(ALL);

  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const scrub = useRef<{
    startX: number;
    startScroll: number;
    ratio: number;
    /** Where a press on the track points to; null when the thumb itself was grabbed. */
    jumpTo: number | null;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const [scrollable, setScrollable] = useState(false);
  const [dragging, setDragging] = useState(false);

  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];
  const properties = useMemo(
    () =>
      PROPERTIES.filter((p) => region.cities.includes(p.city) && (city === ALL || p.city === city)),
    [region, city],
  );

  // The cards on screen lag the filter: the old ones leave, then the new ones arrive
  const [shown, setShown] = useState(properties);
  const latest = useRef(properties);
  latest.current = properties;
  const first = useRef(true);
  const seen = useRef(false);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = () => Array.from(trackRef.current?.children ?? []).filter((c) => c.tagName === 'A' || c.classList.contains('location-card')) as HTMLElement[];

  /** New cards rise in one after another, the first few leading. */
  const arrive = () => {
    const list = cards();
    if (!list.length) return;
    gsap.killTweensOf(list);
    if (reduced()) {
      gsap.set(list, { opacity: 1, y: 0, clearProps: 'transform' });
      return;
    }
    gsap.fromTo(
      list,
      { opacity: 0, y: 44, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity' },
    );
  };

  // Until the section first comes on screen the cards wait, hidden; then they arrive
  useLayoutEffect(() => {
    if (!seen.current && !reduced()) gsap.set(cards(), { opacity: 0 });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || seen.current) return;
        seen.current = true;
        io.disconnect();
        arrive();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The filter changed: the cards on screen drift up and away, then the new set arrives
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const out = cards();
    gsap.killTweensOf(out);
    const swap = () => {
      setShown(latest.current);
    };
    if (!seen.current || reduced() || !out.length) {
      swap();
      return;
    }
    gsap.to(out, { opacity: 0, y: -18, duration: 0.24, ease: 'power2.in', stagger: 0.035, onComplete: swap });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  // Once the new set is in place: start at its first card, then let it arrive
  useLayoutEffect(() => {
    if (first.current) return;
    viewportRef.current?.scrollTo({ left: 0 });
    if (seen.current && !reduced()) gsap.set(cards(), { opacity: 0 });
    requestAnimationFrame(arrive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  // The city filters' dot slides to the chosen one
  const filtersRef = useRef<HTMLDivElement>(null);
  const [dot, setDot] = useState<{ x: number } | null>(null);
  useLayoutEffect(() => {
    const place = () => {
      const active = filtersRef.current?.querySelector<HTMLElement>('.locations__filter.is-active');
      if (active) setDot({ x: active.offsetLeft + active.offsetWidth / 2 - 4 });
    };
    place();
    const ro = new ResizeObserver(place);
    if (filtersRef.current) ro.observe(filtersRef.current);
    return () => ro.disconnect();
  }, [city, regionId]);

  const selectRegion = (id: string) => {
    setRegionId(id);
    setCity(ALL);
  };

  const cardStep = () => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !first) return 348;
    return first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
  };

  // Track scroll position → progress bar + intro shadow (written straight to CSS, no re-render).
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = viewport.scrollWidth - viewport.clientWidth;
      setScrollable(max > 1);
      const progress = max > 1 ? Math.min(Math.max(viewport.scrollLeft / max, 0), 1) : 0;
      sectionRef.current?.style.setProperty('--progress', progress.toFixed(4));
      scrubberRef.current?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
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
  }, []);

  // Mouse drag (touch and trackpads scroll natively).
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
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

    // Favour the direction of the drag: content dragged left means moving forward.
    snapToCard(e.currentTarget, -(e.clientX - d.startX));
  };

  /**
   * Glide to the nearest card, leaning toward `direction` (+ forward, − back) once
   * the move is more than a fifth of a card, then hand back to CSS snapping.
   */
  const snapToCard = (viewport: HTMLDivElement, direction: number) => {
    const step = cardStep();
    const raw = viewport.scrollLeft / step;
    const index =
      Math.abs(direction) > step / 5 ? (direction > 0 ? Math.ceil(raw) : Math.floor(raw)) : Math.round(raw);
    viewport.scrollTo({ left: index * step, behavior: 'smooth' });
    window.setTimeout(() => {
      viewport.classList.remove('is-scrubbing');
      setDragging(false);
    }, 450);
  };

  /** Animate the carousel to `left` (the bronze bar follows), with snapping paused meanwhile. */
  const glideTo = (viewport: HTMLDivElement, left: number) => {
    gsap.killTweensOf(viewport);
    viewport.classList.add('is-scrubbing');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(viewport, {
      scrollLeft: left,
      ...GLIDE,
      duration: reduced ? 0 : GLIDE.duration,
      onComplete: () => viewport.classList.remove('is-scrubbing'),
    });
  };

  // Progress bar as a scrollbar: drag the bronze thumb, or click the track to glide there.
  const onScrubDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const viewport = viewportRef.current;
    const progress = progressRef.current;
    const thumb = thumbRef.current;
    if (!viewport || !progress || !thumb) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const travel = progress.clientWidth - thumb.offsetWidth;
    if (max <= 1 || travel <= 0) return;
    e.preventDefault();
    gsap.killTweensOf(viewport);

    const ratio = max / travel;
    let jumpTo: number | null = null;
    if (!thumb.contains(e.target as Node)) {
      // The position that would centre the thumb under the pointer.
      const thumbLeft = e.clientX - progress.getBoundingClientRect().left - thumb.offsetWidth / 2;
      jumpTo = Math.min(Math.max(thumbLeft * ratio, 0), max);
    }
    scrub.current = { startX: e.clientX, startScroll: viewport.scrollLeft, ratio, jumpTo, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onScrubMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = scrub.current;
    const viewport = viewportRef.current;
    if (!s || !viewport) return;
    const dx = e.clientX - s.startX;
    if (!s.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      // Pressed the track then dragged: grab the thumb at the pressed spot and follow.
      s.moved = true;
      if (s.jumpTo !== null) s.startScroll = s.jumpTo;
      viewport.classList.add('is-scrubbing');
      setDragging(true);
    }
    viewport.scrollLeft = s.startScroll + dx * s.ratio;
  };

  const onScrubUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = scrub.current;
    scrub.current = null;
    const viewport = viewportRef.current;
    if (!s || !viewport) return;

    if (!s.moved) {
      // A click on the track: glide smoothly to the card nearest the clicked spot.
      if (s.jumpTo !== null) {
        const step = cardStep();
        const max = viewport.scrollWidth - viewport.clientWidth;
        glideTo(viewport, Math.min(Math.round(s.jumpTo / step) * step, max));
      }
      return;
    }
    snapToCard(viewport, (e.clientX - s.startX) * s.ratio);
  };

  const onScrubKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const moves: Record<string, number> = {
      ArrowRight: viewport.scrollLeft + cardStep(),
      ArrowUp: viewport.scrollLeft + cardStep(),
      ArrowLeft: viewport.scrollLeft - cardStep(),
      ArrowDown: viewport.scrollLeft - cardStep(),
      Home: 0,
      End: max,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    viewport.scrollTo({ left: moves[e.key], behavior: 'smooth' });
  };

  /** Chevron buttons: one card back or forward. */
  const stepCards = (dir: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const left = Math.min(Math.max(Math.round(viewport.scrollLeft / cardStep()) * cardStep() + dir * cardStep(), 0), max);
    glideTo(viewport, left);
  };

  const onClickCapture = (e: MouseEvent) => {
    if (suppressClick.current) e.preventDefault();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    e.currentTarget.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
  };

  const filters = [ALL, ...region.cities];

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

          <ul className="locations__regions">
            {REGIONS.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`locations__region${r.id === regionId ? ' is-active' : ''}`}
                  aria-pressed={r.id === regionId}
                  onClick={() => selectRegion(r.id)}
                >
                  <span className="locations__region-header">
                    <span className="locations__region-name">{r.name}</span>
                    <img src={caretRight} width={16} height={16} alt="" />
                  </span>
                  <span className="locations__region-summary">{r.summary}</span>
                </button>
              </li>
            ))}
          </ul>
          {/* Phones show the regions as tabs, so the active one's summary sits below them */}
          <p className="locations__summary">{region.summary}</p>

          <div className="locations__arrows" role="group" aria-label="Browse properties">
            <button type="button" className="locations__arrow" aria-label="Previous property" disabled={!scrollable} onClick={() => stepCards(-1)}>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
            <button type="button" className="locations__arrow" aria-label="Next property" disabled={!scrollable} onClick={() => stepCards(1)}>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="locations__showcase">
          <div className="locations__showcase-header">
            <h3 key={region.id} className="type-h3 locations__region-title">{region.name}</h3>
            <div ref={filtersRef} className="locations__filters" role="group" aria-label="Filter by city">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`locations__filter${f === city ? ' is-active' : ''}`}
                  aria-pressed={f === city}
                  onClick={() => setCity(f)}
                >
                  <span>{f}</span>
                </button>
              ))}
              {dot && <img className="locations__filter-dot" src={activeDot} width={8} height={8} alt="" style={{ transform: `translateX(${dot.x}px)` }} />}
            </div>
          </div>

          <div
            ref={viewportRef}
            className={`locations__viewport${dragging ? ' is-dragging' : ''}`}
            role="region"
            aria-roledescription="carousel"
            aria-label={`${region.name} properties`}
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
              {shown.map((p) => (
                <LocationCard key={p.id} property={p} />
              ))}
            </div>
            {shown.length === 0 && (
              <p className="locations__empty">
                New {city === ALL ? region.name : city} homes are on the way. Stay tuned.
              </p>
            )}
          </div>

          <div
            ref={scrubberRef}
            className={`locations__scrubber${scrollable ? '' : ' is-disabled'}`}
            role="slider"
            tabIndex={scrollable ? 0 : -1}
            aria-label={`${region.name} properties position`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            aria-disabled={!scrollable}
            onPointerDown={onScrubDown}
            onPointerMove={onScrubMove}
            onPointerUp={onScrubUp}
            onPointerCancel={onScrubUp}
            onKeyDown={onScrubKeyDown}
          >
            <div ref={progressRef} className="locations__progress">
              <div
                ref={thumbRef}
                className={`locations__progress-bar${scrollable ? '' : ' is-full'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
