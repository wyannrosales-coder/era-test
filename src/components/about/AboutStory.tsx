import { useLayoutEffect, useRef, useState } from 'react';
import VLine from '../VLine';
import { gsap, ScrollTrigger, scrollToY, useGSAP } from '../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import wide from '../../assets/about/wide-macquarie.jpg';
import line from '../../assets/partners-line.svg';
import arrowRight from '../../assets/arrow-right-white.svg';
import './AboutStory.css';

const PHONE = '(max-width: 700px)';
/** Side of the starting square: Figma 745:15768, or smaller on phones. */
const SQUARE = { desktop: 208, phone: 140 };
/** Where on screen (from the top) the photo's centre is when it has fully opened. */
const OPEN_AT = '35%';
const size = () => (window.matchMedia(PHONE).matches ? 'phone' : 'desktop');

/**
 * Who we are and our property (Figma 745:15768 → 735:15210): two text blocks either side
 * of a photo of EPIISOD Macquarie Park that opens like the homepage's brand video. It
 * starts as a square close-up of the building, then — beginning as soon as the square is
 * fully on screen — widens to the full 1368 × 360 frame as the page scrolls on, fully open
 * by the time it's a little above the middle of the screen. Nothing pins: the page keeps
 * scrolling smoothly. The frame keeps its full slot throughout, so nothing below moves.
 * The section dims as the location section slides over it.
 */
export default function AboutStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const propertyTextRef = useRef<HTMLDivElement>(null);
  // Phones show the property text cut short under a fade until "Read more" (Figma 745:15539)
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState<number>();

  // Measure the full text so opening it can animate to its real height
  useLayoutEffect(() => {
    const el = propertyTextRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFullHeight(el.scrollHeight));
    ro.observe(el.firstElementChild ?? el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const slot = section?.querySelector<HTMLElement>('.about-story__photo');
      if (!section || !slot) return;

      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        // The slot's centre within the section (offsets ignore transforms, so it's stable)
        const slotCentre = () => {
          let top = 0;
          for (
            let n: HTMLElement | null = slot;
            n && n !== section;
            n = n.offsetParent as HTMLElement | null
          ) {
            top += n.offsetTop;
          }
          return top + slot.offsetHeight / 2;
        };

        // Widens from the moment the square is fully on screen until the photo's centre
        // reaches OPEN_AT, with a light catch-up so it glides without trailing the finger.
        gsap.fromTo(
          '.about-story__frame',
          { width: () => SQUARE[size()], height: () => SQUARE[size()] },
          {
            width: () => slot.clientWidth,
            height: () => slot.clientHeight,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: section,
              start: () => `top+=${slotCentre() + SQUARE[size()] / 2} bottom`,
              end: () => `top+=${slotCentre()} ${OPEN_AT}`,
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  // On phones it hands over to the location without dimming or drifting
  useExitParallax(sectionRef, { onPhones: false });

  const toggleText = () => {
    const opening = !expanded;
    setExpanded(opening);
    // Closing: if the text's start has scrolled away, bring it back into view first
    if (!opening) {
      const top = propertyTextRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) scrollToY(window.scrollY + top - 120);
    }
    // The page's height changes, so re-measure the scroll animations once it settles
    window.setTimeout(() => ScrollTrigger.refresh(), 750);
  };

  return (
    <section ref={sectionRef} className="about-story exit-parallax">
      <div className="about-story__content" data-exit-content>
        <div className="about-story__block">
          <div className="about-story__heading">
            <p className="eyebrow">Who we are</p>
            <h2 className="display-title">
              About <em>us</em>
            </h2>
          </div>
          <div className="about-story__columns">
            <div className="type-body-l about-story__text">
              <p>
                Centurion Corporation Limited is a publicly listed accommodation owner and operator
                with decades of experience across purpose-built living sectors globally. With a
                portfolio spanning student accommodation and worker housing across Australia, the
                UK, and other international markets, Centurion brings proven operational expertise,
                financial strength, and long-term stewardship to every asset it develops and
                manages.
              </p>
              <p>
                In Australia, Centurion has established a strong presence in the purpose-built
                student accommodation (PBSA) sector through its Dwell portfolio, including Dwell
                East End Adelaide (300 beds) near the Adelaide University, and Dwell Village
                Melbourne City (611 beds) close to RMIT University and the University of Melbourne.
              </p>
            </div>
            <div className="type-body-l about-story__text">
              <p>
                Building on this foundation, Centurion launched EPIISOD in July 2025 — a new PBSA
                brand conceived to deliver a more elevated, design-led, and experience-driven
                approach to student living. EPIISOD represents Centurion’s next chapter in
                Australia, underpinned by global experience and a long-term commitment to quality,
                care, and community.
              </p>
            </div>
          </div>
        </div>

        <div className="about-story__photo">
          <div className="about-story__frame">
            <img src={wide} alt="EPIISOD Macquarie Park among the trees" />
          </div>
        </div>

        <div
          className={`about-story__block about-story__block--property${expanded ? ' is-expanded' : ''}`}
        >
          <div className="about-story__heading">
            <p className="eyebrow">Our property</p>
            <h2 className="display-title">
              About EPIISOD <em>Macquarie Park</em>
            </h2>
          </div>
          <div
            ref={propertyTextRef}
            className="about-story__clamp"
            style={
              expanded && fullHeight
                ? ({ '--full-h': `${fullHeight}px` } as React.CSSProperties)
                : undefined
            }
          >
            <div className="about-story__columns">
              <div className="type-body-l about-story__text">
                <p>
                  EPIISOD Macquarie Park is the inaugural residence under the EPIISOD brand,
                  thoughtfully conceived to serve one of Sydney’s most dynamic education and
                  innovation precincts. Located within walking distance of Macquarie University,
                  Macquarie Centre, and the Metro station, the property places students at the
                  centre of academic, lifestyle, and transport connectivity.
                </p>
                <p>
                  Purpose-built to a contemporary standard, EPIISOD Macquarie Park offers a
                  carefully curated mix of private studios and shared apartments, with every room
                  featuring a private bathroom, modern furnishings, and dedicated study space.
                  Beyond the rooms, residents have access to a comprehensive range of amenities and
                  a curated event programme.
                </p>
              </div>
              <div className="type-body-l about-story__text">
                <p>
                  More than a place to live, EPIISOD Macquarie Park is designed as a setting for
                  growth — where elevated design, considered services, and curated community
                  experiences come together to support students through a defining chapter of their
                  lives.
                </p>
                <p>
                  Building on the success of Dwell, EPIISOD expands Centurion’s portfolio by
                  offering students a diverse range of affordable yet elevated accommodation
                  choices.
                </p>
                <p>At EPIISOD, we aren’t just a place to stay — we’re where your story unfolds.</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="about-story__more"
            aria-expanded={expanded}
            onClick={toggleText}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        </div>

        <div className="about-story__cta">
          <VLine src={line} length={100} />
          <a href="/locations/macquarie-park" className="about-button">
            <span>Discover the place</span>
            <img src={arrowRight} width={24} height={24} alt="" />
          </a>
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
