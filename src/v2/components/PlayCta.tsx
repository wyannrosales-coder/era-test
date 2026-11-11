import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import './PlayCta.css';

/** Ring geometry in the 120 × 120 viewBox (Figma 1455:18177). */
const R = 59;
const CIRCUMFERENCE = 2 * Math.PI * R;
/** Each bright arc at rest: 15° of the ring (Figma's Group 139). */
const ARC = 0.0417 * CIRCUMFERENCE;
/** Hover timing and curves, as on the EPIISOD experience site's circle buttons. */
const DURATION = 0.8;
const EASE_IN_OUT = 'cubic-bezier(0.75, 0, 0.25, 1)';
const STAGGER_SPREAD = 0.2; // seconds between the first and last letter of the roll
/** How far (em) the button drifts toward the pointer, and the label a little further. */
const MAGNET = 25 / 16;

const LINES = ['Play', 'Video'];

/** Convert a CSS cubic-bezier into a GSAP ease function. */
function bezier(css: string) {
  const [x1, y1, x2, y2] = css.match(/[\d.]+/g)!.map(Number);
  const sample = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    if (x <= 0 || x >= 1) return x;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (sample(t, x1, x2) < x) lo = t;
      else hi = t;
    }
    return sample(t, y1, y2);
  };
}
const inOut = bezier(EASE_IN_OUT);
const soft = bezier('cubic-bezier(0.25, 0.1, 0.25, 1)');

/** The label, one line per word. Each line clips its own roll: the word rolls up and out
 *  while a copy of it rolls in from below, so lines never overlap mid-roll. */
function Label() {
  return (
    <span className="play-cta__label" aria-hidden>
      {LINES.map((line) => (
        <span key={line} className="play-cta__line">
          {([1, 2] as const).map((copy) => (
            <span key={copy} className={`play-cta__word play-cta__word--${copy}`}>
              {[...line].map((ch, i) => (
                <span key={i} className="play-cta__char">
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/**
 * The brand video's play button once the film is fully open (Figma 1455:18177), with
 * the circle-button hover of the EPIISOD experience site ("View rooms"):
 * - two short bright arcs on a faint ring grow round to close the circle;
 * - the label rolls up letter by letter, left to right, as a copy rolls in beneath;
 * - on desktop the button is magnetic — it drifts toward the pointer (the label a
 *   little further) and springs back when the pointer leaves.
 */
export default function PlayCta({ onPlay }: { onPlay: () => void }) {
  const rootRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const arcs = root.querySelectorAll('.play-cta__arc');
      const out = root.querySelectorAll('.play-cta__word--1 .play-cta__char');
      const incoming = root.querySelectorAll('.play-cta__word--2 .play-cta__char');
      const inner = root.querySelector('.play-cta__inner');

      gsap.set(arcs, { attr: { 'stroke-dasharray': `${ARC} ${CIRCUMFERENCE}` } });
      gsap.set(incoming, { yPercent: 100, opacity: 0 });

      // Letters further right start later, so the roll sweeps left → right.
      const byPosition = (spread: number) => (i: number, _el: Element, list: Element[]) => {
        const lefts = list.map((el) => el.getBoundingClientRect().left);
        const min = Math.min(...lefts);
        const range = Math.max(...lefts) - min || 1;
        return ((lefts[i] - min) / range) * spread;
      };

      const mm = gsap.matchMedia();
      mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const ring = gsap
          .timeline({ paused: true })
          .to(arcs, { attr: { 'stroke-dasharray': `${CIRCUMFERENCE / 2} ${CIRCUMFERENCE}` }, duration: DURATION, ease: inOut });

        const enter = () => {
          ring.play();
          gsap.fromTo(out, { yPercent: 0, opacity: 1 }, { yPercent: -100, opacity: 0, duration: DURATION, ease: soft, stagger: byPosition(STAGGER_SPREAD), overwrite: true });
          gsap.fromTo(incoming, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: DURATION, ease: soft, stagger: byPosition(STAGGER_SPREAD), overwrite: true });
        };
        const leave = () => {
          ring.reverse();
          gsap.to(out, { yPercent: 0, opacity: 1, duration: DURATION, ease: soft, stagger: byPosition(STAGGER_SPREAD), overwrite: true });
          gsap.to(incoming, { yPercent: 100, opacity: 0, duration: DURATION, ease: soft, stagger: byPosition(STAGGER_SPREAD), overwrite: true });
        };
        root.addEventListener('mouseenter', enter);
        root.addEventListener('mouseleave', leave);
        return () => {
          root.removeEventListener('mouseenter', enter);
          root.removeEventListener('mouseleave', leave);
        };
      });

      // Magnetic pull, desktop pointers only.
      mm.add('(min-width: 992px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const pull = (e: MouseEvent) => {
          const r = root.getBoundingClientRect();
          const dx = (e.clientX - r.left) / root.offsetWidth - 0.5;
          const dy = (e.clientY - r.top) / root.offsetHeight - 0.5;
          gsap.to(root, { x: `${dx * MAGNET}em`, y: `${dy * MAGNET}em`, ease: 'power4.out', duration: 1.6, overwrite: 'auto' });
          gsap.to(inner, { x: `${dx * MAGNET}em`, y: `${dy * MAGNET}em`, ease: 'power4.out', duration: 2, overwrite: 'auto' });
        };
        const release = () => {
          gsap.to([root, inner], { x: 0, y: 0, ease: 'elastic.out(1, 0.3)', duration: 1.6, overwrite: 'auto' });
        };
        root.addEventListener('mousemove', pull);
        root.addEventListener('mouseleave', release);
        return () => {
          root.removeEventListener('mousemove', pull);
          root.removeEventListener('mouseleave', release);
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <button ref={rootRef} type="button" className="play-cta" onClick={onPlay} aria-label="Play video">
      <svg className="play-cta__ring" viewBox="0 0 120 120" aria-hidden>
        <circle className="play-cta__track" cx="60" cy="60" r={R} />
        {/* Start angles as in Figma: upper-left and lower-right, drawn clockwise */}
        <circle className="play-cta__arc" cx="60" cy="60" r={R} transform="rotate(-150 60 60)" />
        <circle className="play-cta__arc" cx="60" cy="60" r={R} transform="rotate(30 60 60)" />
      </svg>
      <span className="play-cta__inner">
        <Label />
      </span>
    </button>
  );
}
