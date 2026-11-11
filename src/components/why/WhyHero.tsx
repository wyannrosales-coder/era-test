import { useEffect, useRef, useState } from 'react';
import wellness from '../../assets/why/hero.jpg';
import comfort from '../../assets/property/rooms/signature-studio-flex.jpg';
import effortless from '../../assets/why/exp-community.jpg';
import caret from '../../assets/about/carousel-caret.svg';
import './WhyHero.css';

/**
 * Slides. Only the first photo is in Figma (889:10313, "1 / 3"); the other two photos
 * are stand-ins from the site until the real ones are supplied.
 */
const SLIDES = [
  { name: 'Wellness', image: wellness },
  { name: 'Comfort-led design', image: comfort },
  { name: 'Effortless living', image: effortless },
];
/** Time each slide stays up before the carousel advances (ms). */
const AUTOPLAY_DELAY = 4000;

/**
 * Why EPIISOD intro (Figma 889:10307): the title on the left, a photo carousel flush
 * with the right edge. The carousel autoplays — pausing while hovered or focused, off
 * screen, or for reduced motion — and the arrows step through it, restarting the timer.
 */
export default function WhyHero() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

  const step = (dir: 1 | -1) => setSlide((s) => (s + dir + SLIDES.length) % SLIDES.length);

  // Autoplay; depends on `slide`, so using the arrows restarts the countdown
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || !inView || reduced) return;
    const timer = window.setTimeout(() => step(1), AUTOPLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [slide, paused, inView]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const current = SLIDES[slide];

  return (
    <section className="why-hero">
      <div className="why-hero__copy">
        <div className="why-hero__heading">
          <p className="eyebrow">Why EPIISOD</p>
          <h1 className="type-h1 why-hero__title">
            Thoughtfully <em>designed</em> student living
          </h1>
        </div>
        <p className="type-body-l why-hero__lede">Where it all comes together.</p>
      </div>

      <div
        ref={carouselRef}
        className="why-hero__carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Life at EPIISOD"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {SLIDES.map((s, i) => (
          <img
            key={s.name}
            className={`why-hero__slide${i === slide ? ' is-active' : ''}`}
            src={s.image}
            alt=""
            aria-hidden={i !== slide}
          />
        ))}
        <div className="why-hero__fade" aria-hidden />

        <div className="why-hero__overlay">
          <p className="why-hero__name" key={current.name} aria-live="polite">
            {current.name}
          </p>
          <div className="why-hero__pager">
            <p className="why-hero__count">
              {slide + 1} / {SLIDES.length}
            </p>
            <button type="button" className="why-hero__arrow" aria-label="Previous" onClick={() => step(-1)}>
              <img className="why-hero__arrow--prev" src={caret} width={24} height={24} alt="" />
            </button>
            <button type="button" className="why-hero__arrow" aria-label="Next" onClick={() => step(1)}>
              <img className="why-hero__arrow--next" src={caret} width={24} height={24} alt="" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
