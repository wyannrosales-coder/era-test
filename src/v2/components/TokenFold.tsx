import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import VLine from './VLine';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/smoothScroll';
import { PHONE_QUERY, isPhoneLayout } from '../lib/phone';
import line from '../../assets/partners-line.svg';
import mark from '../../assets/token-mark.svg';
import './TokenFold.css';

/** Metal of the 3D coin — EPIISOD bronze (between brand bronze-500 #d0a77f and
 *  bronze-700 #896d42). '#d9d9d9' gives silver. */
const COIN_COLOR = '#c99d6a';
/** Seconds per full turn of the automatic spin (before scroll speeds it up). */
const SPIN_SECONDS = 2.4;
/** Where on screen the token travels between as the rows flow past it (parallax). On
 *  phones the rows are short, so the token drifts up the screen instead — lengthening
 *  the scroll it takes to cross them, for a gentler pass. */
const TOKEN_SCREEN = { desktop: ['40%', '62%'], phone: ['80%', '32%'] };
/** Desktop (v2): where on screen the coin is when the section first appears. From there it
 *  only ever falls — revealed as the section's top edge slides up past it — rather than
 *  riding up from the bottom on the section's edge and then turning round. */
const FALL_FROM = 0.3;
const isPhone = isPhoneLayout;
/** Extra radius used to part the text ahead of the token's edge — plus more when
 *  scrolling fast, so the liquid opening never trails the token. Sized for the 154px
 *  desktop token; smaller tokens (phones) scale them down in proportion. */
const LEAD = 24;
const LEAD_PER_SPEED = 0.07; // extra px of lead per px/s of scroll speed (capped below)
const LEAD_MAX_EXTRA = 90;
/** Room left between the token's silhouette and the text as it passes. */
const CLEARANCE = 6;
/** How far (px) rows near the token bulge away from it, like displaced liquid. */
const BULGE = 8;

/**
 * Figma 539:12297 rows, closed: each row reads as one continuous line and only splits
 * where the token passes. `join` marks halves that are one phrase split mid-word (no
 * space between them); the others get a word space.
 */
const ROWS: { left: ReactNode; right: ReactNode; join?: boolean; only?: 'desktop' | 'phone' }[] = [
  {
    left: (
      <>
        Thoughtfully <em>desig</em>
      </>
    ),
    right: (
      <>
        <em>ned</em> student living.
      </>
    ),
    join: true,
  },
  { left: 'Live well, study better.', right: 'An elevated student life', only: 'desktop' },
  // Phones (Figma 713:4138) give each of those phrases its own row
  { left: 'Live well, s', right: 'tudy better.', join: true, only: 'phone' },
  { left: 'An elevated', right: 'student life', only: 'phone' },
  {
    left: (
      <>
        Make it <em>yours.</em>
      </>
    ),
    right: 'Wellness,',
  },
  {
    left: (
      <>
        <em>Comfort-led</em> design,
      </>
    ),
    right: (
      <>
        <em>Effortless</em> living.
      </>
    ),
  },
  {
    left: 'Write yo',
    right: (
      <>
        ur <em>story</em>
      </>
    ),
    join: true,
  },
];

/**
 * The token: a real-time 3D coin (src/lib/coin3d.ts, loaded on demand) drawn into
 * `.token__canvas`. Until it's ready — or if WebGL isn't available — a flat token shows.
 */
function Token() {
  return (
    <div className="token">
      <div className="token__coin">
        {/* Travels with the token but doesn't spin */}
        <div className="token__shadow" />
        <div className="token__fallback">
          <img src={mark} width={72} height={72} alt="" />
        </div>
        <div className="token__canvas" />
      </div>
    </div>
  );
}

/**
 * Figma 539:12297 ("before-cta-fold"). A recap of the page's headlines with the EPIISOD
 * token. The token spins on its own from the moment the section appears, starting on the
 * gold line. As you scroll, the rows flow up past it (it drifts down the screen more
 * slowly — parallax) and each row splits around it like liquid: the halves part just
 * ahead of the token, then flow back together with a soft wobble, while nearby rows bulge
 * away. It passes every row and ends below "Write your story" before the footer.
 * Decorative: the headlines repeat earlier sections.
 */
export default function TokenFold() {
  const sectionRef = useRef<HTMLElement>(null);
  /** Current spin angle (radians), animated by GSAP and read by the 3D coin. */
  const spinRef = useRef({ angle: 0.35 });

  // Load the 3D coin as the section approaches, and draw it every frame while on screen.
  useEffect(() => {
    const section = sectionRef.current;
    const host = section?.querySelector<HTMLElement>('.token__canvas');
    if (!section || !host) return;

    let coin: import('../../lib/coin3d').Coin | null = null;
    let cancelled = false;
    let visible = false;
    const draw = () => {
      if (!coin) return;
      coin.setAngle(spinRef.current.angle);
      coin.render();
    };

    const load = async () => {
      try {
        const { createCoin } = await import('../../lib/coin3d');
        if (cancelled) return;
        coin = await createCoin(host, { markUrl: mark, color: COIN_COLOR });
        if (cancelled) return coin.dispose();
        coin.setTilt(0.12);
        section.classList.add('has-3d-coin');
        draw();
        if (visible) gsap.ticker.add(draw);
      } catch {
        // No WebGL (or it failed): the flat token stays.
      }
    };

    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          near.disconnect();
          load();
        }
      },
      { rootMargin: '150% 0px' },
    );
    near.observe(section);

    const onScreen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!coin) return;
      if (visible) gsap.ticker.add(draw);
      else gsap.ticker.remove(draw);
    });
    onScreen.observe(section);

    const ro = new ResizeObserver(() => {
      coin?.resize();
      draw();
    });
    ro.observe(host);

    return () => {
      cancelled = true;
      near.disconnect();
      onScreen.disconnect();
      ro.disconnect();
      gsap.ticker.remove(draw);
      coin?.dispose();
    };
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const coin = section?.querySelector<HTMLElement>('.token__coin');
      if (!section || !coin) return;
      const spinner = spinRef.current;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Spin on its own while the section is on screen — no waiting for scroll. Scrolling
        // faster spins it faster for a moment, easing back to the resting pace. The 3D
        // coin reads this angle every frame.
        const spin = gsap.to(spinner, {
          angle: `+=${Math.PI * 2}`,
          duration: SPIN_SECONDS,
          ease: 'none',
          repeat: -1,
          paused: true,
        });
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => (self.isActive ? spin.play() : spin.pause()),
            onUpdate: (self) => {
              const boost = 1 + Math.min(2.5, Math.abs(self.getVelocity()) / 1200);
              gsap.to(spin, { timeScale: boost, duration: 0.6, ease: 'power2.out', overwrite: true });
            },
          },
        });
      });

      // Every screen size: the token travels through the rows, splitting each one.
      // Re-run when crossing the phone breakpoint, where the set of rows changes.
      mm.add({ motion: '(prefers-reduced-motion: no-preference)', phone: PHONE_QUERY }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        // Only the rows shown at this size (the others are display: none)
        const rows = gsap.utils
          .toArray<HTMLElement>('.token-fold__row')
          .filter((row) => row.offsetParent !== null);
        const token = section.querySelector<HTMLElement>('.token')!;
        const vline = section.querySelector<HTMLElement>('.vline');
        // The lead and bulge distances, scaled to the token's size (1 on desktop)
        const k = () => token.offsetHeight / 154;

        // Offsets within the section (offsets ignore transforms, so they're stable).
        const topIn = (el: HTMLElement) => {
          let top = 0;
          for (let n: HTMLElement | null = el; n && n !== section; n = n.offsetParent as HTMLElement | null) {
            top += n.offsetTop;
          }
          return top;
        };
        // The token's laid-out spot is its end point, below the last row. It starts up by the
        // gold line, just far enough above the first row that every row begins closed.
        const endCentre = () => topIn(token) + token.offsetHeight / 2;
        const startCentre = () => {
          // Clear of the first row even at full scroll-speed lead, so rows always start closed.
          const clearOfFirstRow =
            topIn(rows[0]) - (token.offsetHeight / 2 + (LEAD + LEAD_MAX_EXTRA) * k() + 8);
          return vline ? Math.min(topIn(vline) + vline.offsetHeight / 2, clearOfFirstRow) : clearOfFirstRow;
        };

        // Liquid parting: halves open quickly just ahead of the token, then ooze back
        // together with a slow, viscous ease (no overshoot, so letters never collide);
        // rows near it bulge away vertically with a soft wobble.
        const lastPush = new Map<Element, number>();
        const flow = (el: Element, x: number) => {
          const prev = lastPush.get(el) ?? 0;
          if (Math.abs(x - prev) < 0.5) return;
          lastPush.set(el, x);
          const opening = Math.abs(x) > Math.abs(prev);
          gsap.to(el, {
            x,
            duration: opening ? 0.12 : 1.3,
            ease: opening ? 'power2.out' : 'expo.out',
            overwrite: true,
          });
        };
        const bulgeTo = rows.map((row) => gsap.quickTo(row, 'y', { duration: 0.9, ease: 'back.out(2)' }));

        // Scroll speed (px/s), measured every frame and eased so it settles to 0 when you stop.
        let speed = 0;
        let lastY = window.scrollY;
        let lastT = performance.now();
        const cut = () => {
          const now = performance.now();
          const dt = Math.max(1, now - lastT);
          const v = (Math.abs(window.scrollY - lastY) / dt) * 1000;
          speed += (v - speed) * 0.2;
          lastY = window.scrollY;
          lastT = now;

          const c = coin.getBoundingClientRect();
          const cy = c.top + c.height / 2;
          const scale = k();
          const R = c.height / 2 + (LEAD + Math.min(LEAD_MAX_EXTRA, speed * LEAD_PER_SPEED)) * scale;
          rows.forEach((row, i) => {
            const r = row.getBoundingClientRect();
            const rowCentre = r.top + r.height / 2;
            // The text band covers ascenders and descenders.
            const inkTop = r.top + r.height * 0.1;
            const inkBottom = r.bottom - r.height * 0.02;
            const dy = cy < inkTop ? inkTop - cy : cy > inkBottom ? cy - inkBottom : 0;
            const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
            const push = dy < R ? Math.max(0, Math.sqrt(R * R - dy * dy) + CLEARANCE - gap / 2) : 0;
            flow(row.children[0], -push);
            flow(row.children[1], push);
            // Bulge away from the token, strongest when it's just above or below the row.
            const d = rowCentre - cy;
            const near = Math.max(0, 1 - Math.abs(d) / (R * 2.2));
            bulgeTo[i](Math.sign(d) * near * BULGE * scale);
          });
        };

        // Recompute the split every frame while the section is on screen, so rows keep
        // relaxing closed behind the token even after scrolling stops.
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            if (self.isActive) {
              gsap.ticker.add(cut);
            } else {
              // Off screen: stop, and leave every row closed and level.
              gsap.ticker.remove(cut);
              lastPush.clear();
              gsap.set(rows.flatMap((row) => Array.from(row.children)), { x: 0, overwrite: true });
              gsap.set(rows, { y: 0, overwrite: true });
            }
          },
        });

        // Parallax travel: the rows scroll up past the token at normal speed while it
        // drifts down the screen more slowly (up, on phones), between the TOKEN_SCREEN points.
        const screenSpan = () => TOKEN_SCREEN[isPhone() ? 'phone' : 'desktop'];
        // Desktop: the fall starts as soon as the section's top reaches the bottom of the
        // screen, with the coin FALL_FROM down the screen (above the section's edge, so
        // clipped out of view until the edge passes it — see .token-fold's clip-path).
        const fallStart = () => window.innerHeight * FALL_FROM - (window.innerHeight + endCentre());
        gsap.fromTo(
          coin,
          { y: () => (isPhone() ? startCentre() - endCentre() : fallStart()) },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: () => (isPhone() ? `top+=${startCentre()} ${screenSpan()[0]}` : 'top bottom'),
              end: () => `top+=${endCentre()} ${screenSpan()[1]}`,
              // Phones scroll natively, so a short catch-up smooths the touch input
              scrub: isPhone() ? 0.6 : true,
              invalidateOnRefresh: true,
            },
          },
        );

        // Entry, mirroring the footer's exit (Footer.tsx): as this section's top edge slides
        // up past it, the coin fades in from 0 and grows from 80% (the exit fades it out and
        // shrinks it to 80%), with the matching ease and catch-up. On the inner coin, so it
        // never fights the footer's tween on .token.
        if (!isPhone())
          gsap.fromTo(
            coin,
            { opacity: 0, scale: 0.8 },
            {
              opacity: 1,
              scale: 1,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 60%',
                end: 'top 20%',
                scrub: 1.2,
                invalidateOnRefresh: true,
              },
            },
          );

        return () => gsap.ticker.remove(cut);
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="token-fold" aria-hidden>
      <VLine src={line} length={100} />

      <div className="token-fold__rows">
        {ROWS.map((row, i) => (
          <div
            key={i}
            className={`token-fold__row${row.join ? ' token-fold__row--join' : ''}${row.only ? ` token-fold__row--${row.only}` : ''}`}
          >
            <p className="token-fold__half token-fold__half--left">
              <span>{row.left}</span>
            </p>
            <p className="token-fold__half token-fold__half--right">{row.right}</p>
          </div>
        ))}
        <Token />
      </div>
    </section>
  );
}
