import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import VLine from '../VLine';
import CarouselArrows from '../ui/CarouselArrows';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import line from '../../assets/make-it-yours-line.svg';
import quotes from '../../assets/why/quotes.svg';
import millicent from '../../assets/why/review-millicent.jpg';
import alexander from '../../assets/why/review-alexander.jpg';
import ranni from '../../assets/why/review-ranni.jpg';
import corhyn from '../../assets/why/review-corhyn.jpg';
import fia from '../../assets/why/review-fia.jpg';
import rogier from '../../assets/why/review-rogier.jpg';
import './WhyReviews.css';

/** A crop as in Figma: object-position, with a zoom about that same point. */
type Crop = { position: string; zoom: number };

type Review = {
  name: string;
  course: string;
  university: string;
  quote: string;
  image: string;
  /** The portrait's crop (Figma 889:10333) and the open card's, centred on the face (929:4745). */
  crop: Crop;
  openCrop: Crop;
  /** The phone card's crop, always open (Figma 929:4597). */
  phoneCrop: Crop;
};

/**
 * Residents. Only Millicent's quote is in Figma (889:9647); the other five quotes, and
 * every course and university, are placeholders until the real reviews are supplied.
 */
const REVIEWS: Review[] = [
  {
    name: 'Millicent',
    course: 'Architecture',
    university: 'The University of Melbourne',
    quote: 'The accommodation is perfect, providing all an international student in Melbourne needs.',
    image: millicent,
    crop: { position: '46% 100%', zoom: 1.181 },
    openCrop: { position: '40% 43%', zoom: 1.497 },
    phoneCrop: { position: '42% 100%', zoom: 1.179 },
  },
  {
    name: 'Alexander',
    course: 'Commerce',
    university: 'Monash University',
    quote: 'Quiet study rooms when I need to focus, and always someone around for dinner after.',
    image: alexander,
    crop: { position: '65% 55%', zoom: 1.159 },
    openCrop: { position: '50% 26%', zoom: 1 },
    phoneCrop: { position: '50% 50%', zoom: 1 },
  },
  {
    name: 'Ranni',
    course: 'Fashion Design',
    university: 'RMIT University',
    quote: 'Moving abroad felt easy. The team made me feel at home from the very first day.',
    image: ranni,
    crop: { position: '50% 100%', zoom: 1.144 },
    openCrop: { position: '50% 44%', zoom: 1.413 },
    phoneCrop: { position: '50% 100%', zoom: 1.152 },
  },
  {
    name: 'Corhyn',
    course: 'Sport Science',
    university: 'Deakin University',
    quote: 'The rooftop and the gym are my favourite places to switch off between classes.',
    image: corhyn,
    crop: { position: '65% 100%', zoom: 1.722 },
    openCrop: { position: '80% 77%', zoom: 1.327 },
    phoneCrop: { position: '50% 89%', zoom: 1.606 },
  },
  {
    name: 'Fia',
    course: 'Nursing',
    university: 'La Trobe University',
    quote: 'Everything is close: campus, the train and the shops. I barely need to plan my day.',
    image: fia,
    crop: { position: '23% 100%', zoom: 1.117 },
    openCrop: { position: '0% 27%', zoom: 1.126 },
    phoneCrop: { position: '0% 69%', zoom: 1 },
  },
  {
    name: 'Rogier',
    course: 'Software Engineering',
    university: 'Swinburne University',
    quote: 'Fast WiFi, a proper desk and a community that actually does things together.',
    image: rogier,
    crop: { position: '83% 65%', zoom: 1.38 },
    openCrop: { position: '100% 35%', zoom: 1.344 },
    phoneCrop: { position: '100% 55%', zoom: 1.268 },
  },
];

/** Phones show every review expanded, with no interaction (matches WhyReviews.css). */
const PHONE_QUERY = '(max-width: 700px)';

/** Whether the phone layout applies; read up front so phones never animate open on load. */
function usePhoneLayout() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const onChange = () => setPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return phone;
}

/** Pointer travel (px) after which a press on the row is a drag, not a click. */
const DRAG_THRESHOLD = 6;

/** A card under the mouse opens after this pause (ms), so sweeping across doesn't flick each one open. */
const HOVER_DELAY = 140;

/**
 * Real voices (Figma 889:10333): a row of resident portraits running off the right edge.
 * Hovering a portrait, or clicking / tapping it, widens it (323 → 556px, Figma 889:9647)
 * and slides its review up over the photo, while the photo eases from the portrait's crop
 * to one centred on the face (Figma 929:4745); the rest of the row eases aside. A click keeps
 * the review open after the pointer leaves; clicking it again closes it.
 * On phones there's no interaction: every review is shown expanded, side by side.
 * With a mouse the row can also be dragged sideways. Below it, a progress bar (Figma
 * 929:4875) shows how much of the row is in view and where; it doubles as a scrollbar.
 */
export default function WhyReviews() {
  /** Opened by click, tap or keyboard; stays open. */
  const [selected, setSelected] = useState<number | null>(null);
  /** Under the mouse; wins over `selected` while the pointer is on the row. */
  const [hovered, setHovered] = useState<number | null>(null);
  const open = hovered ?? selected;
  const hoverTimer = useRef(0);
  /** Hover a card after a short pause; leaving (`null`) closes at once. */
  const hoverSoon = (card: typeof hovered) => {
    window.clearTimeout(hoverTimer.current);
    if (card === null) setHovered(null);
    else hoverTimer.current = window.setTimeout(() => setHovered(card), HOVER_DELAY);
  };
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);
  const phone = usePhoneLayout();

  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: the heading drifts up slowly while the row rises faster, so they close in as it scrolls past
  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const scrollTrigger = { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
        gsap.fromTo('.why-reviews__header', { y: 70 }, { y: -50, ease: 'none', scrollTrigger });
        gsap.fromTo('.why-reviews__track', { y: 110 }, { y: -40, ease: 'none', scrollTrigger });
      });
    },
    { scope: sectionRef },
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const scrub = useRef<{ x: number; left: number; ratio: number; jumpTo: number | null; moved: boolean } | null>(
    null,
  );

  // Progress bar: thumb sized to the visible share, moved by scroll position (no re-render).
  // Portraits change width as they open, so each is watched as well as the row.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      const progress = max > 1 ? track.scrollLeft / max : 0;
      const style = sectionRef.current?.style;
      style?.setProperty('--visible', Math.min(1, track.clientWidth / track.scrollWidth).toFixed(4));
      style?.setProperty('--progress', progress.toFixed(4));
      scrubberRef.current?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    };
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    track.addEventListener('scroll', onChange, { passive: true });
    const ro = new ResizeObserver(onChange);
    ro.observe(track);
    for (const item of Array.from(track.children)) ro.observe(item);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onChange);
      ro.disconnect();
    };
  }, []);

  /** Distance from one portrait to the next (closed width + gap). */
  const cardStep = () => {
    const track = trackRef.current;
    const first = track?.querySelector<HTMLElement>('.why-review:not(.is-open)');
    const gap = track ? parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
    return (first?.offsetWidth ?? 323) + gap;
  };

  const scrollRowTo = (left: number) => trackRef.current?.scrollTo({ left, behavior: 'smooth' });

  // Scrubber: drag the thumb, or press the bar to bring that spot to the thumb's centre
  const onScrubDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    const bar = thumb?.parentElement;
    if (!track || !thumb || !bar) return;
    const max = track.scrollWidth - track.clientWidth;
    const travel = bar.clientWidth - thumb.offsetWidth;
    if (max <= 1 || travel <= 0) return;
    e.preventDefault();
    const ratio = max / travel;
    let jumpTo: number | null = null;
    if (!thumb.contains(e.target as Node)) {
      const thumbLeft = e.clientX - bar.getBoundingClientRect().left - thumb.offsetWidth / 2;
      jumpTo = Math.min(Math.max(thumbLeft * ratio, 0), max);
    }
    scrub.current = { x: e.clientX, left: track.scrollLeft, ratio, jumpTo, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onScrubMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = scrub.current;
    const track = trackRef.current;
    if (!s || !track) return;
    const dx = e.clientX - s.x;
    if (!s.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      // Pressed the bar then dragged: grab the thumb at that spot and follow
      s.moved = true;
      if (s.jumpTo !== null) s.left = s.jumpTo;
    }
    track.scrollLeft = s.left + dx * s.ratio;
  };

  const onScrubUp = () => {
    const s = scrub.current;
    scrub.current = null;
    if (s && !s.moved && s.jumpTo !== null) scrollRowTo(s.jumpTo);
  };

  const onScrubKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const step = cardStep();
    const moves: Record<string, number> = {
      ArrowRight: track.scrollLeft + step,
      ArrowUp: track.scrollLeft + step,
      ArrowLeft: track.scrollLeft - step,
      ArrowDown: track.scrollLeft - step,
      Home: 0,
      End: track.scrollWidth,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    scrollRowTo(moves[e.key]);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !trackRef.current) return;
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    const track = trackRef.current;
    if (!d || !track) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    d.moved = true;
    track.classList.add('is-dragging');
    track.scrollLeft = d.left - dx;
  };

  const endDrag = () => {
    trackRef.current?.classList.remove('is-dragging');
    // Cleared after the click that ends the drag has been ignored
    window.setTimeout(() => (drag.current = null));
  };

  return (
    <section ref={sectionRef} className="why-reviews">
      <div className="why-reviews__header">
        <VLine src={line} length={100} />
        <div className="heading-group">
          <p className="eyebrow">Hear from our residents</p>
          <h2 className="type-h2">
            Real <em>voices</em>
          </h2>
        </div>
      </div>

      <div
        ref={trackRef}
        className="why-reviews__track"
        role="list"
        onPointerLeave={() => hoverSoon(null)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-lenis-prevent-horizontal
      >
        {REVIEWS.map((review, i) => {
          const isOpen = phone || open === i;
          const content = (
            <>
              <img
                className="why-review__image"
                src={review.image}
                alt=""
                draggable={false}
                style={
                  {
                    '--pos': review.crop.position,
                    '--zoom': review.crop.zoom,
                    '--open-pos': review.openCrop.position,
                    '--open-zoom': review.openCrop.zoom,
                    '--phone-pos': review.phoneCrop.position,
                    '--phone-zoom': review.phoneCrop.zoom,
                  } as CSSProperties
                }
              />
              <span className="why-review__shade" aria-hidden />
              <span className="why-review__name" aria-hidden={isOpen}>
                {review.name}
              </span>

              <span className="why-review__panel" aria-hidden={!isOpen}>
                <span className="why-review__body">
                  <span className="why-review__quote-row">
                    <span className="why-review__quote">“{review.quote}”</span>
                    <img src={quotes} width={48} height={48} alt="" />
                  </span>
                  <span className="why-review__author">
                    <span className="why-review__person">
                      <strong>{review.name}</strong>
                      <span className="why-review__comma">, </span>
                      <span className="why-review__course">{review.course}</span>
                    </span>
                    <span className="why-review__university">{review.university}</span>
                  </span>
                </span>
              </span>
            </>
          );
          return (
            <div key={review.name} role="listitem" className="why-reviews__item">
              {phone ? (
                <article className="why-review is-open is-static" aria-label={`${review.name}'s review`}>
                  {content}
                </article>
              ) : (
                <button
                  type="button"
                  className={`why-review${isOpen ? ' is-open' : ''}`}
                  aria-expanded={isOpen}
                  aria-label={`${review.name}'s review`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && !drag.current?.moved && hoverSoon(i)}
                  onTransitionEnd={(e) => {
                    // Once open, ease the row so the whole review is in view (the last
                    // portraits widen past the screen edge)
                    if (e.target !== e.currentTarget || e.propertyName !== 'width' || !isOpen) return;
                    const track = trackRef.current;
                    if (!track) return;
                    const card = e.currentTarget.getBoundingClientRect();
                    const view = track.getBoundingClientRect();
                    const margin = parseFloat(getComputedStyle(track).paddingRight) || 0;
                    const by =
                      Math.max(0, card.right - (view.right - margin)) || Math.min(0, card.left - view.left);
                    if (by) track.scrollBy({ left: by, behavior: 'smooth' });
                  }}
                  onClick={() => {
                    if (drag.current?.moved) return;
                    setSelected((s) => (s === i ? null : i));
                    // A click while hovering pins the review; let the hover follow the pin
                    hoverSoon(null);
                  }}
                >
                  {content}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div
        ref={scrubberRef}
        className="why-reviews__scrubber"
        role="slider"
        tabIndex={0}
        aria-label="Reviews position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        onPointerDown={onScrubDown}
        onPointerMove={onScrubMove}
        onPointerUp={onScrubUp}
        onPointerCancel={onScrubUp}
        onKeyDown={onScrubKeyDown}
      >
        <div className="why-reviews__progress">
          <div ref={thumbRef} className="why-reviews__progress-bar" />
        </div>
      </div>

      <CarouselArrows
        className="why-reviews__arrows"
        label="Browse reviews"
        onPrev={() => scrollRowTo(Math.max(0, (trackRef.current?.scrollLeft ?? 0) - cardStep()))}
        onNext={() => scrollRowTo((trackRef.current?.scrollLeft ?? 0) + cardStep())}
      />
    </section>
  );
}
