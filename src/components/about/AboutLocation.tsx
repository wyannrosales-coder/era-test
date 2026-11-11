import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import backdrop from '../../assets/about/location-bg.jpg';
import macquarieUniversity from '../../assets/about/place-macquarie-university.jpg';
import placeholder2 from '../../assets/property/hero.jpg';
import placeholder3 from '../../assets/property/amenity-02.jpg';
import placeholder4 from '../../assets/property/amenity-04.jpg';
import placeholder5 from '../../assets/property/amenity-07.jpg';
import arrowRight from '../../assets/about/arrow-right-bronze.svg';
import caret from '../../assets/about/carousel-caret.svg';
import './AboutLocation.css';

/**
 * Places around EPIISOD Macquarie Park. Only the first is in Figma (735:15251); the
 * other four names and photos are placeholders until the real ones are supplied.
 */
const PLACES = [
  { name: 'Macquarie University', image: macquarieUniversity },
  { name: 'Macquarie Centre', image: placeholder2 },
  { name: 'Macquarie University Metro', image: placeholder3 },
  { name: 'Macquarie Park Innovation District', image: placeholder4 },
  { name: 'Sydney CBD', image: placeholder5 },
];
/** Time each place stays up before the carousel advances (ms). */
const AUTOPLAY_DELAY = 4000;

/**
 * The location (Figma 735:15241): copy on a blurred, darkened photo beside an arched
 * carousel of nearby places. The carousel autoplays — pausing while hovered or focused,
 * off screen, or for reduced motion — and the arrows step through it, restarting the
 * timer. The backdrop drifts behind the content (parallax) and the section dims as the
 * sign-up slides over it.
 */
export default function AboutLocation() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  // On phones the carousel runs to the section's foot, where a drift would clip it
  useExitParallax(sectionRef, { driftOnPhones: false });

  const step = (dir: 1 | -1) => setSlide((s) => (s + dir + PLACES.length) % PLACES.length);

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

  // Backdrop parallax: the photo behind moves slower than the page
  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.about-location__backdrop',
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  const place = PLACES[slide];

  return (
    <section ref={sectionRef} className="about-location exit-parallax">
      <div className="about-location__bg" aria-hidden>
        <img className="about-location__backdrop" src={backdrop} alt="" />
        <div className="about-location__tint" />
      </div>

      <div className="about-location__content" data-exit-content>
        <div className="about-location__intro">
          <div className="about-location__copy">
            <div className="about-location__heading">
              <p className="eyebrow">The location</p>
              <h2 className="display-title">
                Where <em>ambition</em> resides.{' '}
                <br />
                Where <em>journeys</em> begin.
              </h2>
            </div>
            <div className="type-body-l about-location__text">
              <p>
                At the heart of one of Sydney’s most vibrant and connected districts, EPIISOD
                Macquarie Park places you where opportunity lives — surrounded by leading
                universities, global business centres, and a fast-growing innovation corridor.
              </p>
              <p>
                With Macquarie University just steps away and direct metro access to the CBD, you’re
                seamlessly connected to both academic excellence and the energy of city life.
              </p>
              <p>
                It's setting the stage where your ambitions take root, and your story unfolds at the
                centre of it all.
              </p>
            </div>
          </div>
          <a href="/locations/macquarie-park" className="about-location__button">
            <span>Discover the place</span>
            <img src={arrowRight} width={24} height={24} alt="" />
          </a>
        </div>

        <div
          ref={carouselRef}
          className="about-location__carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Places nearby"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {PLACES.map((p, i) => (
            <img
              key={p.name}
              className={`about-location__slide${i === slide ? ' is-active' : ''}`}
              src={p.image}
              alt=""
              aria-hidden={i !== slide}
            />
          ))}
          <div className="about-location__fade" aria-hidden />

          <div className="about-location__overlay">
            <p className="about-location__place" key={place.name} aria-live="polite">
              {place.name}
            </p>
            <div className="about-location__pager">
              <p className="about-location__count">
                {slide + 1} / {PLACES.length}
              </p>
              <button
                type="button"
                className="about-location__arrow"
                aria-label="Previous place"
                onClick={() => step(-1)}
              >
                <img
                  className="about-location__arrow--prev"
                  src={caret}
                  width={24}
                  height={24}
                  alt=""
                />
              </button>
              <button
                type="button"
                className="about-location__arrow"
                aria-label="Next place"
                onClick={() => step(1)}
              >
                <img
                  className="about-location__arrow--next"
                  src={caret}
                  width={24}
                  height={24}
                  alt=""
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
