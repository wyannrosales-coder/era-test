import { useEffect, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import background from '../../assets/property/hero.jpg';
import tiktok from '../../assets/contact/tiktok-light.svg';
import facebook from '../../assets/contact/facebook-light.svg';
import instagram from '../../assets/contact/instagram-light.svg';
import { useInstagramFeed } from './instagramFeed';
import type { InstagramPost } from './instagramFeed';
import './InstagramStrip.css';

const dateFormat = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
const countFormat = new Intl.NumberFormat('en-AU', { notation: 'compact' });

/** Hover / focus details: the caption, then the date and counts. */
function PostDetails({ post }: { post: InstagramPost }) {
  const counts = [
    post.likes !== undefined && `${countFormat.format(post.likes)} likes`,
    post.comments !== undefined && `${countFormat.format(post.comments)} comments`,
  ].filter(Boolean);
  return (
    <span className="instagram__details" aria-hidden>
      {post.caption && <span className="instagram__caption">{post.caption}</span>}
      <span className="instagram__meta">
        <span>{dateFormat.format(new Date(post.timestamp))}</span>
        {counts.length > 0 && <span>{counts.join(' · ')}</span>}
      </span>
      <span className="instagram__view">View on Instagram</span>
    </span>
  );
}
/** Copies of the posts in the track, so the loop never shows an edge on wide screens. */
const COPIES = 3;
/** Autoplay speed (px/s). */
const SPEED = 24;
/** Autoplay waits this long (ms) after the visitor last scrolled or dragged. */
const RESUME_AFTER = 1200;
const DRAG_THRESHOLD = 5;
/** How quickly a released drag's coasting fades (per second). */
const FRICTION = 4;
const SOCIALS = [
  { name: 'TikTok', icon: tiktok },
  { name: 'Facebook', icon: facebook },
  { name: 'Instagram', icon: instagram },
];

/**
 * "Life is good @EPIISOD" (Figma 539:23924): Instagram posts over a blurred photo.
 * The posts drift past in an endless loop that visitors can also scroll themselves —
 * trackpad swipe, Shift + wheel, drag (with a little coasting) or the arrow keys —
 * autoplay resuming shortly after. The backdrop lags behind the page scroll, and the
 * section drifts and dims as the next one slides over it.
 *
 * Posts come from the Instagram feed (instagramFeed.ts), with sample posts until it's
 * connected. Hovering or focusing a post shows its caption, date and counts; clicking
 * opens it on Instagram in a new tab (a drag never does). Touch screens have no hover,
 * so a tap opens the post directly.
 */
export default function InstagramStrip() {
  const posts = useInstagramFeed();
  /** Read by the frame loop, which outlives renders. */
  const postCount = useRef(posts.length);
  postCount.current = posts.length;
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  /** Loop state, kept out of React so the strip animates without re-rendering. */
  const loop = useRef({
    offset: 0,
    inertia: 0,
    lastInput: -Infinity,
    hovering: false,
    drag: null as null | { startX: number; startOffset: number; moved: boolean; samples: { x: number; t: number }[] },
    suppressClick: false,
  });
  useExitParallax(sectionRef);

  // One frame loop drives autoplay, coasting and wrapping; the track moves by transform
  useEffect(() => {
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!strip || !track) return;
    const state = loop.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setWidth = () => {
      const items = track.children;
      const next = items[postCount.current] as HTMLElement | undefined;
      return next ? next.offsetLeft - (items[0] as HTMLElement).offsetLeft : track.scrollWidth;
    };

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!state.drag) {
        if (Math.abs(state.inertia) > 5) {
          state.offset += state.inertia * dt;
          state.inertia *= Math.exp(-FRICTION * dt);
        } else if (!reduced && !state.hovering && now - state.lastInput > RESUME_AFTER) {
          state.offset += SPEED * dt;
        }
      }
      const width = setWidth();
      state.offset = ((state.offset % width) + width) % width;
      track.style.transform = `translate3d(${-state.offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // Horizontal wheel / trackpad swipe (or Shift + wheel) scrolls the strip; vertical passes to the page
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      state.offset += dx;
      state.inertia = 0;
      state.lastInput = performance.now();
    };
    strip.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frame);
      strip.removeEventListener('wheel', onWheel);
    };
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const state = loop.current;
    state.inertia = 0;
    state.drag = { startX: e.clientX, startOffset: state.offset, moved: false, samples: [{ x: e.clientX, t: e.timeStamp }] };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const state = loop.current;
    const d = state.drag;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.classList.add('is-dragging');
    }
    d.samples = [...d.samples.filter((s) => e.timeStamp - s.t < 100), { x: e.clientX, t: e.timeStamp }];
    state.offset = d.startOffset - dx;
    state.lastInput = performance.now();
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const state = loop.current;
    const d = state.drag;
    state.drag = null;
    if (!d?.moved) return;
    e.currentTarget.classList.remove('is-dragging');
    // A drag shouldn't also open the post it ended on
    state.suppressClick = true;
    requestAnimationFrame(() => (state.suppressClick = false));
    const first = d.samples[0];
    const dt = e.timeStamp - first.t;
    state.inertia = dt > 0 ? -((e.clientX - first.x) / dt) * 1000 : 0;
    state.lastInput = performance.now();
  };

  const onClickCapture = (e: MouseEvent) => {
    if (loop.current.suppressClick) e.preventDefault();
  };

  // Arrow keys glide one post at a time
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const state = loop.current;
    const step = (trackRef.current?.children[1] as HTMLElement | undefined)?.offsetLeft ?? 344;
    const proxy = { x: state.offset };
    state.lastInput = Infinity; // hold autoplay during the glide
    gsap.to(proxy, {
      x: state.offset + (e.key === 'ArrowRight' ? step : -step),
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => (state.offset = proxy.x),
      onComplete: () => (state.lastInput = performance.now()),
    });
  };

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.instagram__backdrop',
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="instagram exit-parallax">
      <img className="instagram__backdrop" src={background} alt="" />
      <div className="instagram__tint" aria-hidden />

      <div className="instagram__content" data-exit-content>
        <div className="heading-group">
          <p className="eyebrow instagram__eyebrow">EPIISOD living</p>
          <h2 className="display-title instagram__title">
            Life is <em>good</em> @EPIISOD
          </h2>
        </div>

        <div className="instagram__bar">
          <p>#EPIISOD is on Instagram</p>
          <div className="instagram__follow">
            <p>Follow Us</p>
            <ul>
              {SOCIALS.map(({ name, icon }) => (
                <li key={name}>
                  <a href="#" aria-label={name}>
                    <img src={icon} width={34} height={34} alt="" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          ref={stripRef}
          className="instagram__strip"
          role="region"
          aria-roledescription="carousel"
          aria-label="Instagram posts — use the arrow keys or scroll sideways"
          tabIndex={0}
          data-lenis-prevent-horizontal
          onPointerEnter={(e) => e.pointerType === 'mouse' && (loop.current.hovering = true)}
          onPointerLeave={() => (loop.current.hovering = false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onKeyDown={onKeyDown}
        >
          {/* Repeated copies of the posts, so the loop wraps seamlessly */}
          <ul ref={trackRef} className="instagram__track">
            {Array.from({ length: COPIES }, () => posts).flat().map((post, i) => (
              <li key={`${post.id}-${i}`} aria-hidden={i >= posts.length}>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={i >= posts.length ? -1 : undefined}
                  aria-label={`Instagram post: ${post.caption || 'view on Instagram'} (opens in a new tab)`}
                  draggable={false}
                >
                  <img src={post.image} alt="" draggable={false} />
                  <PostDetails post={post} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
