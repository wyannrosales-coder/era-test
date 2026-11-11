import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Phones resize the viewport as the address bar shows and hides; re-measuring every
// scroll animation then makes pinned sections jump, so only real resizes count.
ScrollTrigger.config({ ignoreMobileResize: true });

// Images and web fonts that arrive after the scroll animations have measured the page
// change its height, and every pinned section below then starts early and jumps when it
// catches. Re-measure whenever the page's height changes on its own; the height the last
// re-measure left (pin spacing included) doesn't count, so it settles after one pass.
if (typeof ResizeObserver !== 'undefined') {
  let measured = 0;
  let timer = 0;
  ScrollTrigger.addEventListener('refresh', () => {
    measured = document.body.offsetHeight;
  });
  new ResizeObserver(() => {
    if (document.body.offsetHeight === measured) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.body);
}

let lenis: Lenis | null = null;

/**
 * Scroll feel. Each wheel/trackpad movement travels SCROLL_SPEED of its usual
 * distance, then glides for SCROLL_DURATION seconds on an exponential ease-out —
 * quick to respond, then a long, gentle deceleration as it lands.
 */
const SCROLL_SPEED = 0.8;
const SCROLL_DURATION = 1.4;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Smooth (eased) page scrolling driven by GSAP's ticker, so Lenis and every
 * ScrollTrigger animation update in the same frame — no drift or double work.
 * Skipped for viewers who prefer reduced motion; touch keeps native scrolling.
 */
export function initSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  lenis = new Lenis({
    duration: SCROLL_DURATION,
    easing: easeOutExpo,
    wheelMultiplier: SCROLL_SPEED,
    anchors: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/**
 * Scroll the page to `top`, through Lenis when it's running so the two don't fight.
 * `immediate` jumps without animating (e.g. to hold the view steady after a re-layout).
 */
export function scrollToY(top: number, { immediate = false }: { immediate?: boolean } = {}) {
  if (lenis) lenis.scrollTo(top, immediate ? { immediate: true, force: true } : { duration: SCROLL_DURATION * 1.2, easing: easeOutExpo });
  else window.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' });
}

/** Freeze page scrolling (e.g. behind an open menu panel), through Lenis when it's running. */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  // Experience pages run their own Lenis (window.__lenis): hold that one too
  const pageLenis = (window as { __lenis?: { stop(): void; start(): void } }).__lenis;
  if (locked) pageLenis?.stop();
  else pageLenis?.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Step snapping for a pinned ScrollTrigger, done through Lenis so the two don't fight
 * (ScrollTrigger's own `snap` moves the page while Lenis holds its own target, and the
 * page springs back). Once scrolling has come to rest inside the trigger, the page eases
 * on to the next of `points` (trigger progress, 0–1) in the direction it was last
 * scrolled, so a light scroll never falls back — or, with `nearest`, settles on whichever
 * is closer: a gentle magnetic pull that never carries the page on. Returns a cleanup
 * function.
 */
export function addStepSnap(
  trigger: ScrollTrigger,
  points: () => number[],
  {
    duration = 1.1,
    rest = 160,
    nearest = false,
    lean = 0,
    paused,
  }: {
    duration?: number;
    rest?: number;
    nearest?: boolean;
    /** With `nearest`: once the page has moved this share of the way (0–1) towards the
     *  next stop in the direction it was scrolled, it settles there rather than back. */
    lean?: number;
    /** While this returns true (e.g. a scrollbar is being dragged), no snapping. */
    paused?: () => boolean;
  } = {},
) {
  let timer = 0;
  let lastY = window.scrollY;
  let direction = 0;
  let snapping = false;

  const snap = () => {
    if (snapping || paused?.()) return;
    const { start, end } = trigger;
    const y = window.scrollY;
    if (y <= start + 1 || y >= end - 1) return;
    const targets = points().map((p) => start + p * (end - start));
    if (targets.some((t) => Math.abs(t - y) < 2)) return;
    // Only between the stops: before the first one the page scrolls freely
    if (y < targets[0] - 1 || y > targets[targets.length - 1] + 1) return;
    let target: number;
    if (nearest) {
      target = targets.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
      if (lean > 0) {
        const below = Math.max(...targets.filter((t) => t <= y));
        const above = Math.min(...targets.filter((t) => t >= y));
        if (Number.isFinite(below) && Number.isFinite(above) && above > below) {
          const f = (y - below) / (above - below);
          if (direction > 0 && f >= lean) target = above;
          else if (direction < 0 && f <= 1 - lean) target = below;
        }
      }
    }
    else {
      const ahead = targets.filter((t) => (direction >= 0 ? t > y : t < y));
      // Past the last step (or before the first) the page is free to move on
      if (!ahead.length) return;
      target = direction >= 0 ? Math.min(...ahead) : Math.max(...ahead);
    }
    snapping = true;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      snapping = false;
      lastY = window.scrollY;
    };
    if (lenis) lenis.scrollTo(target, { duration, easing: easeInOutCubic, onComplete: done });
    else window.scrollTo({ top: target, behavior: 'smooth' });
    // A new scroll can interrupt the glide, and then onComplete never comes: free up anyway
    // so the next rest still settles
    window.setTimeout(done, duration * 1000 + 50);
  };

  const onScroll = () => {
    if (snapping) return;
    const y = window.scrollY;
    if (y !== lastY) direction = Math.sign(y - lastY);
    lastY = y;
    window.clearTimeout(timer);
    timer = window.setTimeout(snap, rest);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(timer);
  };
}

export { gsap, ScrollTrigger, useGSAP };
