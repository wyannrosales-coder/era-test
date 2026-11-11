import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { gsap, scrollToY, useGSAP } from '../lib/smoothScroll';
import wellness1 from '../assets/wellness-1.jpg';
import wellness2 from '../assets/wellness-2.jpg';
import wellness3 from '../assets/wellness-3.jpg';
import dots1 from '../assets/dots-1.svg';
import dots2 from '../assets/dots-2.svg';
import dots3 from '../assets/dots-3.svg';
import './Wellness.css';

type Story = {
  title: ReactNode;
  label: string;
  body: string;
  dots: string;
  image: string;
};

const BODY =
  'Modern spaces, all-inclusive amenities, and a vibrant student community—all in the cities where you study.';

const STORIES: Story[] = [
  { title: <em>Wellness</em>, label: 'Wellness', body: BODY, dots: dots1, image: wellness1 },
  {
    title: (
      <>
        <em>Comfort-led</em> design
      </>
    ),
    label: 'Comfort-led design',
    body: BODY,
    dots: dots2,
    image: wellness2,
  },
  {
    title: (
      <>
        <em>Effortless</em> living
      </>
    ),
    label: 'Effortless living',
    body: BODY,
    dots: dots3,
    image: wellness3,
  },
];

/** Timeline time each aligned image rests for at the start and end of the sequence. */
const HOLD = 0.25;

type WellnessProps = {
  /** Scroll distance into the enclosing section before the sequence starts (the slide-in). */
  offset: number;
  /** Scroll distance the sequence is spread over. */
  stepScroll: number;
};

/**
 * Stepped story: the stage pins while the image track moves from one image to the
 * next with an ease-in-out, so each image settles aligned beside its heading. If the
 * reader stops between images, ScrollTrigger snaps smoothly to the nearest one.
 * Clicking a dot or an image jumps to that story.
 */
export default function Wellness({ offset, stepScroll }: WellnessProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const currentRef = useRef(0);
  const [current, setCurrent] = useState(0);

  // Timeline time at which story i is aligned.
  const timeOf = (i: number) => (i === 0 ? 0 : HOLD + i);

  useGSAP(
    () => {
      // The enclosing section drives the sequence. Found from our own element because a
      // parent's ref isn't attached yet when a child's layout effects run.
      const section = rootRef.current?.closest('section');
      const view = windowRef.current;
      const track = trackRef.current;
      if (!section || !view || !track) return;

      // Track offset that centres row i's image in the window. On phones (Figma 713:4094)
      // the images sit side by side and the track moves sideways instead, setting each
      // image at the start of the window with the next one peeking in on the right.
      const phone = () => window.matchMedia('(max-width: 700px)').matches;
      const alignedY = (i: number) => {
        const row = rowRefs.current[i];
        if (!row || phone()) return 0;
        return -row.offsetTop + (view.clientHeight - row.offsetHeight) / 2;
      };
      const alignedX = (i: number) => {
        const row = rowRefs.current[i];
        if (!row || !phone()) return 0;
        return -(row.offsetLeft - rowRefs.current[0]!.offsetLeft);
      };

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 1 },
        // Heading follows the (smoothed) animation, so text and image change together.
        onUpdate: () => {
          const t = tl.time();
          const index = t < timeOf(1) - 0.5 ? 0 : t < timeOf(2) - 0.5 ? 1 : 2;
          if (index !== currentRef.current) {
            currentRef.current = index;
            setCurrent(index);
          }
        },
        scrollTrigger: {
          trigger: section,
          start: `top top-=${offset}`,
          end: `top top-=${offset + stepScroll}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 'labels',
            // Settle on the story nearest where the reader stopped, not where their
            // scroll speed was heading — so no story gets skipped.
            inertia: false,
            duration: { min: 0.6, max: 1.2 },
            delay: 0.15,
            ease: 'power3.out',
          },
        },
      });

      tl.addLabel('story0', timeOf(0)).fromTo(
        track,
        { x: () => alignedX(0), y: () => alignedY(0) },
        { x: () => alignedX(0), y: () => alignedY(0), duration: HOLD, ease: 'none' },
      );
      for (let i = 1; i < STORIES.length; i++) {
        tl.to(track, { x: () => alignedX(i), y: () => alignedY(i) }).addLabel(
          `story${i}`,
          timeOf(i),
        );
      }
      tl.to({}, { duration: HOLD }).addLabel('end');

      timeline.current = tl;
    },
    { scope: rootRef, dependencies: [offset, stepScroll], revertOnUpdate: true },
  );

  const goTo = (i: number) => {
    const tl = timeline.current;
    const st = tl?.scrollTrigger;
    if (!tl || !st) return;
    scrollToY(st.start + (st.end - st.start) * (timeOf(i) / tl.duration()));
  };

  const story = STORIES[current];

  return (
    <div ref={rootRef} className="wellness" style={{ height: `calc(100vh + ${stepScroll}px)` }}>
      <div className="wellness__stage">
        <div className="wellness__heading">
          <p className="eyebrow">student life</p>
          <div className="wellness__copy" key={current}>
            <h3 className="type-h3 wellness__title">{story.title}</h3>
            <p className="type-body-l wellness__body">{story.body}</p>
          </div>
          <div className="wellness__dots">
            <img src={story.dots} width={8} height={56} alt="" />
            {STORIES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                className="wellness__dot"
                style={{ top: i * 24 - 8 }}
                aria-label={`Show ${s.label}`}
                aria-current={i === current}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <p className="visually-hidden" aria-live="polite">
            {story.label}, {current + 1} of {STORIES.length}
          </p>
        </div>

        <div ref={windowRef} className="wellness__window">
          <div ref={trackRef} className="wellness__track">
            {STORIES.map((s, i) => (
              <div
                key={s.label}
                ref={(el) => (rowRefs.current[i] = el)}
                className={`wellness__row wellness__row--${i + 1}${i === current ? ' is-current' : ''}`}
                onClick={() => i !== current && goTo(i)}
              >
                <div className="wellness__frame">
                  <img src={s.image} alt="" draggable={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
