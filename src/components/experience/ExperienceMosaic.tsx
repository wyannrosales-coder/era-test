import { useRef } from 'react';
import VLine from '../VLine';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import { useExitParallax } from '../../lib/useExitParallax';
import courtyard from '../../assets/experience/mosaic-courtyard.jpg';
import lounge from '../../assets/experience/mosaic-lounge.jpg';
import pool from '../../assets/experience/mosaic-pool.jpg';
import lobbyTree from '../../assets/experience/mosaic-lobby-tree.jpg';
import dining from '../../assets/experience/mosaic-dining.jpg';
import terrace from '../../assets/experience/mosaic-terrace.jpg';
import hall from '../../assets/experience/mosaic-hall.jpg';
import line from '../../assets/hero-line.svg';
import play from '../../assets/property/icon-play-white.svg';
import perks from '../../assets/why/exp-convenience.jpg';
import privileges from '../../assets/experience/card-privileges.jpg';
import exclusives from '../../assets/experience/card-exclusives.jpg';
import { EXPERIENCE_URL } from '../../lib/links';
import './ExperienceMosaic.css';

type Photo = { image: string; size: 'tall' | 'short' };

/** The side columns of the wall (Figma 1058:5058): two tall photos each. */
const LEFT: Photo[] = [
  { image: courtyard, size: 'tall' },
  { image: lounge, size: 'tall' },
];
const RIGHT: Photo[] = [
  { image: terrace, size: 'tall' },
  { image: hall, size: 'tall' },
];

/** The three ways EPIISOD goes further, each with a photo (Figma 1071:5509). */
/**
 * Per card (Perks, Privileges, Exclusives): how far below its place it starts, in Figma
 * pixels of the 904px stage, and where it leaves to (px). All three rise together over
 * the same stretch of scroll, so each moves at its own speed: out of line on the way up
 * (Exclusives highest, Privileges lowest, as in Figma 1071:5509), meeting in the level
 * row as they arrive (1071:5582).
 */
const CARD_DEPTH = [
  { from: 420, to: -80 },
  { from: 560, to: -140 },
  { from: 300, to: -110 },
];

const CARDS = [
  {
    title: 'Perks',
    image: perks,
    text: 'Thoughtful inclusions that enhance daily living and convenience, seamlessly integrated into the resident experience',
  },
  {
    title: 'Privileges',
    image: privileges,
    text: 'Optional access to services and benefits that elevate quality of life, allowing residents to personalise how they live',
  },
  {
    title: 'Exclusives',
    image: exclusives,
    text: 'Curated events and experiences created especially for the EPIISOD community, fostering meaningful connection and personal growth',
  },
];

function Column({ photos, side }: { photos: Photo[]; side: 'left' | 'right' }) {
  return (
    <div className={`xp-mosaic__column xp-mosaic__column--${side}`}>
      {photos.map((photo, i) => (
        <div key={i} className={`xp-mosaic__photo xp-mosaic__photo--${photo.size}`}>
          <img src={photo.image} alt="" />
        </div>
      ))}
    </div>
  );
}

/**
 * A wall of EPIISOD spaces (Figma 1058:5057) that opens into "An elevated student life"
 * (transition, Figma 1058:5277). The section pins while it scrolls: the middle photo —
 * the lobby — widens and grows until it fills the screen, the side columns squeezed out,
 * and darkens under a chocolate veil (Figma 1058:4776 → 1058:4814). The photo inside
 * holds still at full size, so its frame only uncovers more of it. Then the heading
 * arrives with the Perks, Privileges and Exclusives cards rising in turn (1058:4900);
 * further on the cards lift away and the line and button take their place (1058:5278).
 *
 * On phones the wall sticks while the lobby fills the screen, and the content scrolls up
 * over it. With reduced motion the wall stays a plain grid and the Exclusives content
 * follows it on the darkened lobby photo.
 */
export default function ExperienceMosaic({ id }: { id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-animated');
        const stageHeight = () => section.querySelector<HTMLElement>('.xp-mosaic__stage')?.offsetHeight ?? 904;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section.querySelector<HTMLElement>('.xp-mosaic__stage'),
            // The stage may be taller than the screen; centre it while pinned
            start: 'center center',
            end: '+=420%',
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(section, { '--p': 0 }, { '--p': 1, duration: 1, ease: 'power1.inOut' }, 0)
          .fromTo(section, { '--shade': 0 }, { '--shade': 1, duration: 0.35 }, 0.75)
          .fromTo('.xp-mosaic__heading', { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 1)
          // Cards rise from below together, each at its own speed, into a level row
          .fromTo(
            '.xp-mosaic__card',
            { y: (i: number) => (CARD_DEPTH[i].from * stageHeight()) / 904 },
            { y: 0, duration: 1, ease: 'power2.out' },
            1.1,
          )
          .fromTo('.xp-mosaic__card', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' }, 1.1)
          .to(
            '.xp-mosaic__card',
            { autoAlpha: 0, y: (i: number) => CARD_DEPTH[i].to, duration: 0.4, ease: 'power1.in', stagger: 0.05 },
            2.75,
          )
          // The line and button take their place, each at its own speed, and keep drifting
          .fromTo('.xp-mosaic__cta .vline', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 3.1)
          .fromTo('.xp-mosaic__button', { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.15)
          .to('.xp-mosaic__cta .vline', { y: -8, duration: 0.45 }, 3.55)
          .to('.xp-mosaic__button', { y: -16, duration: 0.45 }, 3.65)
          // Hold on the finished frame, the button in view, then the line and button lift
          // away before the page moves on
          .to({}, { duration: 0.5 })
          .to(
            ['.xp-mosaic__cta .vline', '.xp-mosaic__button'],
            { autoAlpha: 0, y: '-=40', duration: 0.45, ease: 'power1.in', stagger: 0.08 },
          )
          .to({}, { duration: 0.25 });
        return () => section.classList.remove('is-animated');
      });

      // Phones (Figma 1275:8431): the wall sticks (CSS) while the lobby frame grows to fill
      // the screen and darkens; the content then scrolls up over it as its background
      gsap.matchMedia().add('(max-width: 700px) and (prefers-reduced-motion: no-preference)', () => {
        section.classList.add('is-unfolding');
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section.querySelector<HTMLElement>('.xp-mosaic__inner'),
              start: 'top top',
              end: () => `+=${window.innerHeight * 0.8}`,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(section, { '--p': 0 }, { '--p': 1, duration: 1, ease: 'power1.inOut' }, 0)
          .fromTo(section, { '--shade': 0 }, { '--shade': 1, duration: 0.35 }, 0.7);
        return () => section.classList.remove('is-unfolding');
      });
    },
    { scope: sectionRef },
  );

  // Hand-over to the café: once the pin lets go, the finished frame lags behind and dims
  // as the next section slides up over it. Set up after the pin, so it measures the
  // section with its pinned scroll already added.
  useExitParallax(sectionRef);

  return (
    <section ref={sectionRef} className="xp-mosaic exit-parallax" id={id}>
      <div className="xp-mosaic__stage">
        <div className="xp-mosaic__inner" data-exit-content>
          <div className="xp-mosaic__grid" aria-hidden>
            <Column photos={LEFT} side="left" />
            <div className="xp-mosaic__column xp-mosaic__column--middle">
              <div className="xp-mosaic__photo xp-mosaic__photo--short">
                <img src={pool} alt="" />
              </div>
              <div className="xp-mosaic__photo xp-mosaic__photo--feature">
                <img src={lobbyTree} alt="" />
                <div className="xp-mosaic__veil" />
              </div>
              <div className="xp-mosaic__photo xp-mosaic__photo--short">
                <img src={dining} alt="" />
              </div>
            </div>
            <Column photos={RIGHT} side="right" />
          </div>

          <div className="xp-mosaic__content">
            <div className="xp-mosaic__heading">
              <div className="heading-group">
                <p className="eyebrow">Exclusives</p>
                <h2 className="type-h2">
                  An <em>elevated</em> student life
                </h2>
              </div>
              <p className="type-body-l xp-mosaic__lede">
                Exclusive access. A thriving community. Designed for EPIISOD residents.
              </p>
            </div>

            <ul className="xp-mosaic__cards">
              {CARDS.map(({ title, image, text }) => (
                <li key={title} className="xp-mosaic__card">
                  <img className="xp-mosaic__card-img" src={image} alt="" />
                  <div className="xp-mosaic__card-body">
                    <h3 className="xp-mosaic__card-title">{title}</h3>
                    <p className="xp-mosaic__card-text">{text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="xp-mosaic__cta">
              <VLine src={line} length={50} />
              <a
                href={EXPERIENCE_URL}
                className="xp-mosaic__button"
              >
                <img src={play} width={24} height={24} alt="" />
                <span>Enter the EPIISOD experience</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
