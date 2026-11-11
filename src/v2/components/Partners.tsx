import { useRef } from 'react';
import VLine from './VLine';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import { PHONE_QUERY } from '../lib/phone';
import sonder from '../../assets/v2/partners/sonder.png';
import adairs from '../../assets/v2/partners/adairs.png';
import drivemate from '../../assets/v2/partners/drivemate.png';
import chambers from '../../assets/v2/partners/chambers.png';
import crisp from '../../assets/v2/partners/crisp.png';
import dominos from '../../assets/v2/partners/dominos.png';
import tefal from '../../assets/v2/partners/tefal.png';
import oppo from '../../assets/v2/partners/oppo.png';
import partnersLeft from '../../assets/v2/partners-left.jpg';
import partnersRight from '../../assets/v2/partners-right.jpg';
import line from '../../assets/partners-line.svg';
import './Partners.css';

/** A picture placed in a logo's box (px), optionally cropped from a larger image (%). */
type Piece = {
  src: string;
  box: [left: number, top: number, width: number, height: number];
  crop?: { left: number; top: number; width: number; height: number };
};

export type Logo = {
  name: string;
  pieces: Piece[];
  /** Box height (px); 56 unless noted. */
  height?: number;
  /** Wordmark set as live text beside the pieces (Crisp Laundry). */
  text?: { lines: string[]; left: number; centreY: number };
};

/** Partner logos (Figma 1455:18084), in rows of four, placed exactly as in Figma. */
export const LOGOS: Logo[] = [
  { name: 'Sonder', pieces: [{ src: sonder, box: [14, 8, 171, 40] }] },
  { name: 'Adairs', pieces: [{ src: adairs, box: [29, -42, 140, 140] }] },
  { name: 'Drive mate', pieces: [{ src: drivemate, box: [0.46, -4.72, 198, 66] }] },
  {
    name: 'Chambers Coffee',
    // The emblem and the wordmark are two crops of one image
    pieces: [
      { src: chambers, box: [15.41, -4, 64, 64], crop: { left: -28.8, top: 0, width: 159.64, height: 159.64 } },
      {
        src: chambers,
        box: [79.41, 7.43, 102.171, 41.143],
        crop: { left: 0, top: -149.19, width: 100, height: 248.33 },
      },
    ],
  },
  {
    name: 'Crisp Laundry Services',
    pieces: [{ src: crisp, box: [0, 0.58, 54.904, 53.951] }],
    text: { lines: ['Crisp Laundry', 'Services'], left: 58.8, centreY: 27.33 },
  },
  { name: 'Domino’s', height: 52, pieces: [{ src: dominos, box: [5, -31, 189, 118] }] },
  { name: 'Tefal', pieces: [{ src: tefal, box: [32, -10, 135, 76] }] },
  { name: 'OPPO', pieces: [{ src: oppo, box: [22.46, -48.72, 155, 155] }] },
];

const px = (n: number) => `${n}px`;

export function LogoSlot({ logo }: { logo: Logo }) {
  return (
    <div className="partner-logo">
      <div className="partner-logo__box" role="img" aria-label={logo.name} style={{ height: logo.height ?? 56 }}>
        {logo.pieces.map(({ src, box: [left, top, width, height], crop }, i) => (
          <div key={i} className="partner-logo__piece" style={{ left: px(left), top: px(top), width: px(width), height: px(height) }}>
            <img
              src={src}
              alt=""
              draggable={false}
              style={
                crop
                  ? { left: `${crop.left}%`, top: `${crop.top}%`, width: `${crop.width}%`, height: `${crop.height}%` }
                  : undefined
              }
              className={crop ? 'is-cropped' : undefined}
            />
          </div>
        ))}
        {logo.text && (
          <p className="partner-logo__text" style={{ left: px(logo.text.left), top: px(logo.text.centreY) }}>
            {logo.text.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Figma 539:11927. The heading and logos drift gently (--speed) while the section passes
 * through the viewport; the photo frames hold still where Figma places them and the
 * pictures drift subtly inside, as in the About us hero. Phones (Figma 713:4366) show
 * one photo below the logos instead, with the same drift inside its frame.
 */
export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      gsap.matchMedia().add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          phone: PHONE_QUERY,
        },
        (ctx) => {
          const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
          // v2: phones show Figma's exact crop (1441:17554), held still so the faces stay framed
          if (!motion || phone) return;
          // As in the About us hero, the photo frames hold still and the pictures drift
          // subtly inside them: the two side photos on larger screens, and on phones
          // (Figma 713:4366) the single photo below the logos.
          gsap.fromTo(
            phone ? '.partners__single img' : '.partners__photo img',
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: phone ? '.partners__single' : section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          );

          // Phones keep the heading and logos still
          if (phone) return;
          gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
            // The photo frames stay put
            if (el.classList.contains('partners__photo')) return;
            const speed = parseFloat(getComputedStyle(el).getPropertyValue('--speed')) || 0;
            gsap.fromTo(
              el,
              { y: () => speed * window.innerHeight },
              {
                y: () => -speed * section.offsetHeight,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="partners">
      <div className="partners__content" data-parallax>
        <VLine src={line} length={100} />
        <div className="heading-group">
          <p className="eyebrow">Partners</p>
          <h2 className="display-title">
            Student experience
            <br />
            brought to <em>life</em>
          </h2>
        </div>
        <div className="partners__logos">
          {LOGOS.map((logo, i) => (
            <LogoSlot key={i} logo={logo} />
          ))}
        </div>
        <div className="partners__single">
          <img src={partnersRight} alt="" />
        </div>
      </div>

      <div className="partners__photo partners__photo--left" data-parallax>
        <img src={partnersLeft} alt="" />
      </div>
      <div className="partners__photo partners__photo--right" data-parallax>
        <img src={partnersRight} alt="" />
      </div>
    </section>
  );
}
