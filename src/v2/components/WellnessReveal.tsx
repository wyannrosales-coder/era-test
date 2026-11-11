import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { SplitText } from 'gsap/SplitText';
import { gsap, scrollToY, useGSAP } from '../../lib/smoothScroll';
import { isPhoneLayout } from '../lib/phone';
import wellnessMain from '../../assets/v2/student-1-main.jpg';
import comfortMain from '../../assets/v2/student-2-main.jpg';
import effortlessMain from '../../assets/v2/student-3-main.jpg';
import wellnessDetail from '../../assets/v2/student-1-inset.jpg';
import comfortDetail from '../../assets/v2/student-2-inset.jpg';
import effortlessDetail from '../../assets/v2/student-3-inset.jpg';
import './WellnessReveal.css';

gsap.registerPlugin(SplitText);

type Story = {
  title: ReactNode;
  label: string;
  body: string;
  image: string;
  /** The smaller photo that overlaps the main one. */
  detail: string;
};

// Placeholder copy (v2), one per story, until the final descriptions are written.
const BODY = {
  wellness:
    'Gym, study nooks and quiet corners to recharge — spaces that help you look after body and mind between lectures.',
  comfort:
    'Warm materials, soft light and furniture chosen for long study sessions and slow weekends alike.',
  effortless:
    'All bills included, fast Wi-Fi and a team on hand, so the everyday details are taken care of and you can focus on what matters.',
};

const STORIES: Story[] = [
  // v2 photos: Figma 1441:15388 (Wellness), 1441:16756 (Comfort-led), 1441:16770 (Effortless)
  { title: <em>Wellness</em>, label: 'Wellness', body: BODY.wellness, image: wellnessMain, detail: wellnessDetail },
  {
    title: (
      <>
        <em>Comfort-led</em> design
      </>
    ),
    label: 'Comfort-led design',
    body: BODY.comfort,
    image: comfortMain,
    detail: comfortDetail,
  },
  {
    title: (
      <>
        <em>Effortless</em> living
      </>
    ),
    label: 'Effortless living',
    body: BODY.effortless,
    image: effortlessMain,
    detail: effortlessDetail,
  },
];

/** Timeline time each story rests for at the start and end of the sequence. */
const HOLD = 0.25;
/** Horizontal slats the next photo is drawn in with, like blinds closing upwards. */
const SLATS = 30;
/** Each slat fills over this much of a 1-unit transition; their starts spread over the rest.
 *  Long, overlapping fills read as one soft sweep rather than separate bars. */
const SLAT_DURATION = 0.6;
const SLAT_STAGGER = (1 - SLAT_DURATION) / (SLATS - 1);

/** A mask showing each slat filled from its bottom edge by its progress (0–1). */
function slatMask(slats: { p: number }[]) {
  const step = 100 / SLATS;
  const stops = slats.map(({ p }, i) => {
    const start = i * step;
    const end = start + step;
    if (p >= 1) return `#000 ${start}% ${end}%`;
    const edge = start + step * p;
    return `#000 ${start}% ${edge}%, transparent ${edge}% ${end}%`;
  });
  return `linear-gradient(0deg, ${stops.join(', ')})`;
}

type WellnessRevealProps = {
  /** Scroll distance into the enclosing section before the sequence starts (the slide-in). */
  offset: number;
  /** Scroll distance the sequence is spread over. */
  stepScroll: number;
};

/**
 * Stepped story, after the Elyse Residence "Wellness-centered amenities" fold: the stage
 * pins while scrolling steps through the stories. The next photo is drawn over the
 * current one in thin horizontal slats, rising from the bottom; the smaller photo wipes
 * up from below; the heading and text lines slide out upwards and the next ones rise in.
 * A line beside the copy (above it on phones, Figma 794:5895) fills as the stories advance. If the reader stops between
 * stories, ScrollTrigger snaps smoothly to the nearest one. The segments of the line
 * jump to their story.
 */
export default function WellnessReveal({ offset, stepScroll }: WellnessRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const currentRef = useRef(0);
  const [current, setCurrent] = useState(0);
  // The copy is split into lines as laid out at the time, so it's re-split whenever that
  // layout may have changed: when a web font finishes loading (Google Fonts loads each
  // weight only once it's used, so `document.fonts.ready` can come too early), or when
  // the copy's box changes size. Otherwise lines measured in a fallback font wrap again
  // inside their masks, leaving stray breaks mid-sentence.
  const [layoutKey, setLayoutKey] = useState(0);

  useEffect(() => {
    const boxes = rootRef.current?.querySelector('.wellness-reveal__boxes');
    let timer = 0;
    const resplit = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => setLayoutKey((k) => k + 1), 150);
    };
    let lastSize = '';
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const size = `${Math.round(width)}x${Math.round(height)}`;
      if (lastSize && size !== lastSize) resplit();
      lastSize = size;
    });
    if (boxes) ro.observe(boxes);
    document.fonts.ready.then(resplit);
    document.fonts.addEventListener('loadingdone', resplit);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      document.fonts.removeEventListener('loadingdone', resplit);
    };
  }, []);

  // Timeline time at which story i is shown.
  const timeOf = (i: number) => (i === 0 ? 0 : HOLD + i);

  useGSAP(
    () => {
      const root = rootRef.current;
      // The enclosing section drives the sequence. Found from our own element because a
      // parent's ref isn't attached yet when a child's layout effects run.
      const section = root?.closest('section');
      if (!root || !section) return;

      const q = gsap.utils.selector(root);
      const bigImages = q('.wellness-reveal__big-img') as HTMLElement[];
      const smallImages = q('.wellness-reveal__small-img');
      const boxes = q('.wellness-reveal__box');
      const fill = q('.wellness-reveal__progress-fill')[0];
      const phone = isPhoneLayout();
      const axis = phone ? 'scaleX' : 'scaleY';

      const splits = boxes.map((box) => ({
        title: SplitText.create(box.querySelector('h3'), { type: 'lines', mask: 'lines' }),
        body: SplitText.create(box.querySelector('p'), { type: 'lines', mask: 'lines' }),
      }));

      // Every photo after the first starts with all its slats empty
      const slats = bigImages.map(() => Array.from({ length: SLATS }, () => ({ p: 0 })));
      const paintMasks = () => {
        for (let i = 1; i < bigImages.length; i++) {
          bigImages[i].style.setProperty('--slats', slatMask(slats[i]));
        }
      };
      paintMasks();

      gsap.set(boxes.slice(1), { autoAlpha: 0 });
      gsap.set(fill, { [axis]: 1 / STORIES.length });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          paintMasks();
          // The copy shown mid-transition decides which story is current
          const t = tl.time();
          let index = 0;
          for (let i = 1; i < STORIES.length; i++) if (t >= timeOf(i) - 0.5) index = i;
          if (index !== currentRef.current) {
            currentRef.current = index;
            setCurrent(index);
          }
        },
        scrollTrigger: {
          trigger: section,
          start: `top top-=${offset}`,
          end: `top top-=${offset + stepScroll}`,
          // Follows the (already smoothed) scroll closely, with just enough catch-up to
          // soften touch input
          scrub: 0.4,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 'labels',
            // Settle on the story nearest where the reader stopped, not where their
            // scroll speed was heading — so no story gets skipped.
            inertia: false,
            duration: { min: 0.5, max: 1 },
            delay: 0.1,
            ease: 'power2.out',
          },
        },
      });

      tl.addLabel('story0', timeOf(0)).to({}, { duration: HOLD });

      for (let i = 1; i < STORIES.length; i++) {
        const t0 = timeOf(i) - 1;
        const prev = splits[i - 1];
        const next = splits[i];

        // Main photo: slats fill bottom to top, each one rising from its own bottom edge
        slats[i].forEach((slat, k) => {
          tl.to(slat, { p: 1, duration: SLAT_DURATION, ease: 'sine.inOut' }, t0 + k * SLAT_STAGGER);
        });

        // Smaller photo wipes up from below
        tl.fromTo(
          smallImages[i],
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'sine.inOut' },
          t0,
        );

        // Copy: the current lines ease up out of their masks, then the next drift in
        tl.fromTo(
          [...prev.title.lines, ...prev.body.lines],
          { yPercent: 0 },
          { yPercent: -100, duration: 0.4, stagger: 0.03, ease: 'sine.in', immediateRender: false },
          t0,
        )
          .set(boxes[i - 1], { autoAlpha: 0 }, t0 + 0.5)
          .set(boxes[i], { autoAlpha: 1 }, t0 + 0.5)
          .fromTo(
            next.title.lines,
            { yPercent: 100 },
            { yPercent: 0, duration: 0.45, stagger: 0.05, ease: 'sine.out' },
            t0 + 0.5,
          )
          .fromTo(
            next.body.lines,
            { yPercent: 100 },
            { yPercent: 0, duration: 0.36, stagger: 0.04, ease: 'sine.out' },
            t0 + 0.56,
          );

        tl.to(fill, { [axis]: (i + 1) / STORIES.length, duration: 1, ease: 'sine.inOut' }, t0);
        tl.addLabel(`story${i}`, timeOf(i));
      }
      tl.to({}, { duration: HOLD }).addLabel('end');

      timeline.current = tl;

      return () => {
        splits.forEach(({ title, body }) => {
          title.revert();
          body.revert();
        });
      };
    },
    {
      scope: rootRef,
      dependencies: [offset, stepScroll, layoutKey],
      revertOnUpdate: true,
    },
  );

  const goTo = (i: number) => {
    const tl = timeline.current;
    const st = tl?.scrollTrigger;
    if (!tl || !st) return;
    scrollToY(st.start + (st.end - st.start) * (timeOf(i) / tl.duration()));
  };

  return (
    <div
      ref={rootRef}
      className="wellness-reveal"
      style={{ height: `calc(100vh + ${stepScroll}px)` }}
    >
      <div className="wellness-reveal__stage">
        <div className="wellness-reveal__heading">
          <p className="eyebrow wellness-reveal__eyebrow">student life</p>
          <div className="wellness-reveal__progress">
            <div className="wellness-reveal__progress-fill" />
            {STORIES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                className="wellness-reveal__jump"
                aria-label={`Show ${s.label}`}
                aria-current={i === current}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div className="wellness-reveal__boxes">
            {STORIES.map((s) => (
              <div key={s.label} className="wellness-reveal__box">
                <h3 className="type-h3 wellness-reveal__title">{s.title}</h3>
                <p className="type-body-l wellness-reveal__body">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="visually-hidden" aria-live="polite">
            {STORIES[current].label}, {current + 1} of {STORIES.length}
          </p>
        </div>

        <div className="wellness-reveal__images">
          <div className="wellness-reveal__big">
            {STORIES.map((s, i) => (
              <div key={s.label} className={`wellness-reveal__big-img wellness-reveal__big-img--${i + 1}`}>
                <img src={s.image} alt="" draggable={false} />
              </div>
            ))}
          </div>
          <div className="wellness-reveal__small">
            {STORIES.map((s) => (
              <div key={s.label} className="wellness-reveal__small-img">
                <img src={s.detail} alt="" draggable={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
