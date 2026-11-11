import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, RefObject } from 'react';
import { gsap } from '../../lib/smoothScroll';

const DRAG_THRESHOLD = 5;
/** How far a released drag coasts: px per (px/ms) of release velocity. */
const MOMENTUM = 220;
/** Glide to a card, matching the site's other eased transitions. */
const GLIDE = { duration: 0.7, ease: 'power3.out' };

/**
 * A row of promo cards (Figma 1082:16918, 1346:27101). Trackpad and touch scroll natively
 * with snapping; a mouse drag follows the pointer, then coasts and glides to the nearest
 * card. The progress bar doubles as a scrollbar — drag its thumb, click the track, or use
 * the arrow keys — and hides when every card already fits. `hostRef` receives the
 * `--visible` and `--progress` variables the bar is drawn from.
 */
export function usePromoCarousel(hostRef: RefObject<HTMLElement>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    startX: number;
    startScroll: number;
    moved: boolean;
    /** Recent pointer positions, for the release velocity. */
    samples: { x: number; t: number }[];
  } | null>(null);
  const scrub = useRef<{ startX: number; startScroll: number; ratio: number; jumpTo: number | null; moved: boolean } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  // Progress bar: thumb sized to the visible share, moved by scroll position (no re-render)
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const progress = max > 1 ? viewport.scrollLeft / max : 0;
      const style = hostRef.current?.style;
      style?.setProperty('--visible', (viewport.clientWidth / viewport.scrollWidth).toFixed(4));
      style?.setProperty('--progress', progress.toFixed(4));
      if (scrubberRef.current) {
        scrubberRef.current.hidden = max <= 1;
        scrubberRef.current.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      }
    };
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    viewport.addEventListener('scroll', onChange, { passive: true });
    const ro = new ResizeObserver(onChange);
    ro.observe(viewport);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('scroll', onChange);
      ro.disconnect();
      gsap.killTweensOf(viewport);
    };
  }, [hostRef]);

  /** Distance from one card to the next. */
  const cardStep = () => {
    const first = trackRef.current?.children[0] as HTMLElement | undefined;
    const gap = trackRef.current ? parseFloat(getComputedStyle(trackRef.current).columnGap) || 0 : 0;
    return (first?.offsetWidth ?? 324) + gap;
  };

  /** Ease the row to `left` (snapped to a card), with CSS snapping paused meanwhile. */
  const glideTo = (left: number, snap = true) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const step = cardStep();
    const target = Math.min(Math.max(snap ? Math.round(left / step) * step : left, 0), max);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.killTweensOf(viewport);
    viewport.classList.add('is-gliding');
    gsap.to(viewport, {
      scrollLeft: target,
      ...GLIDE,
      duration: reduced ? 0 : GLIDE.duration,
      onComplete: () => viewport.classList.remove('is-gliding'),
    });
  };

  // Mouse drag on the cards (touch and trackpads scroll natively)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    gsap.killTweensOf(e.currentTarget);
    drag.current = {
      startX: e.clientX,
      startScroll: e.currentTarget.scrollLeft,
      moved: false,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    };
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
    d.samples = [...d.samples.filter((s) => e.timeStamp - s.t < 100), { x: e.clientX, t: e.timeStamp }];
    e.currentTarget.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    // A drag shouldn't also click the card link it ended on
    suppressClick.current = true;
    requestAnimationFrame(() => (suppressClick.current = false));
    setDragging(false);

    // Coast in the direction of the throw, then settle on the nearest card
    const first = d.samples[0];
    const dt = e.timeStamp - first.t;
    const velocity = dt > 0 ? (e.clientX - first.x) / dt : 0;
    glideTo(e.currentTarget.scrollLeft - velocity * MOMENTUM);
  };

  const onClickCapture = (e: MouseEvent) => {
    if (suppressClick.current) e.preventDefault();
  };

  const onViewportKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    glideTo(e.currentTarget.scrollLeft + (e.key === 'ArrowRight' ? 1 : -1) * cardStep());
  };

  // Scrubber: drag the thumb, or press the track to glide there
  const onScrubDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const viewport = viewportRef.current;
    const thumb = thumbRef.current;
    const track = thumb?.parentElement;
    if (!viewport || !thumb || !track) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const travel = track.clientWidth - thumb.offsetWidth;
    if (max <= 1 || travel <= 0) return;
    e.preventDefault();
    gsap.killTweensOf(viewport);

    const ratio = max / travel;
    let jumpTo: number | null = null;
    if (!thumb.contains(e.target as Node)) {
      // The scroll position that would centre the thumb under the pointer
      const thumbLeft = e.clientX - track.getBoundingClientRect().left - thumb.offsetWidth / 2;
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
      // Pressed the track then dragged: grab the thumb at that spot and follow
      s.moved = true;
      if (s.jumpTo !== null) s.startScroll = s.jumpTo;
      viewport.classList.add('is-gliding');
      setDragging(true);
    }
    viewport.scrollLeft = s.startScroll + dx * s.ratio;
  };

  const onScrubUp = () => {
    const s = scrub.current;
    scrub.current = null;
    const viewport = viewportRef.current;
    if (!s || !viewport) return;
    setDragging(false);
    if (!s.moved) {
      if (s.jumpTo !== null) glideTo(s.jumpTo);
      return;
    }
    glideTo(viewport.scrollLeft);
  };

  const onScrubKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const step = cardStep();
    const moves: Record<string, number> = {
      ArrowRight: viewport.scrollLeft + step,
      ArrowUp: viewport.scrollLeft + step,
      ArrowLeft: viewport.scrollLeft - step,
      ArrowDown: viewport.scrollLeft - step,
      Home: 0,
      End: viewport.scrollWidth,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    glideTo(moves[e.key]);
  };

  return {
    trackRef,
    thumbRef,
    /** Spread onto the scrolling row. */
    viewportProps: {
      ref: viewportRef,
      className: `promotions__viewport${dragging ? ' is-dragging' : ''}`,
      tabIndex: 0,
      'data-lenis-prevent-horizontal': true,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
      onKeyDown: onViewportKeyDown,
    },
    /** Spread onto the progress bar's hit area. */
    scrubberProps: {
      ref: scrubberRef,
      className: 'promotions__scrubber',
      role: 'slider',
      tabIndex: 0,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 0,
      onPointerDown: onScrubDown,
      onPointerMove: onScrubMove,
      onPointerUp: onScrubUp,
      onPointerCancel: onScrubUp,
      onKeyDown: onScrubKeyDown,
    },
  };
}
