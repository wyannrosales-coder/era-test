import { useEffect, useRef, useState } from 'react';
import VLine from './VLine';
import { gsap, useGSAP } from '../../lib/smoothScroll';
import { PHONE_QUERY } from '../lib/phone';
import thumbnail from '../../assets/video-thumbnail.jpg';
import line from '../../assets/make-it-yours-line.svg';
import PlayCta from './PlayCta';
import './BrandVideo.css';

/** "Luxury hotel room panning shot" — Mixkit Stock Video Free License. */
const VIDEO_SRC = '/media/brand-film.mp4';
/** Phones (Figma 704:8593 → 704:8727) start from a smaller square over a shorter scroll. */
const PHONE = PHONE_QUERY;
/** Side of the thumbnail square: Figma 539:10149, or 100px on phones. */
const THUMB_SIZE = { desktop: 300, phone: 100 };
/** Scroll distance (px) the pinned reveal is spread over — larger is slower. */
const EXPAND_SCROLL = { desktop: 1000, phone: 700 };
/** Extra scroll (as a share of EXPAND_SCROLL) the open film rests, still pinned, before
 *  the page moves on — so a small scroll once it's full doesn't start the exit. */
const REST = 0.5;
const isPhone = () => window.matchMedia(PHONE).matches;

/**
 * Figma 539:10149 → 539:11535. The frame always occupies its full 1136×639 slot (so
 * nothing below shifts) and starts as a 300px square in the middle of it. The square
 * scrolls up with the page; when its centre reaches the middle of the screen the section
 * holds there and the square opens evenly around that point — the image easing from
 * cover-fitting the square to filling the frame — before the page scrolls on. The tint
 * and play button arrive at the end; pressing play starts the film in place.
 */
export default function BrandVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** The film has replaced the thumbnail (stays true while paused). */
  const [started, setStarted] = useState(false);
  /** The film is playing; when paused, the Play video button returns over the frame. */
  const [playing, setPlaying] = useState(false);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const size = () => Math.min(THUMB_SIZE[isPhone() ? 'phone' : 'desktop'], stage.clientWidth, stage.clientHeight);
        const insetY = () => (stage.clientHeight - size()) / 2;
        const insetX = () => (stage.clientWidth - size()) / 2;
        // Top of `el` within the section, summed through any offsetParents (the transformed
        // GSAP layers count as one in Chrome); offsets ignore transforms, so it's stable.
        const topInSection = (el: HTMLElement) => {
          let top = 0;
          for (let n: HTMLElement | null = el; n && n !== section; n = n.offsetParent as HTMLElement | null) {
            top += n.offsetTop;
          }
          return top;
        };
        // Centre of the frame (and of the square) within the section.
        const frameCentre = () => topInSection(stage) + stage.offsetHeight / 2;

        // Hold + reveal: once the square's centre reaches the middle of the screen, the
        // section pins for EXPAND_SCROLL px while the square opens around that point, so
        // it grows evenly in every direction from where it stopped. A light catch-up
        // (scrub: 0.4) keeps it smooth without trailing the finger.
        const hold = gsap
          .timeline({
            defaults: { ease: 'power2.inOut', duration: 1 },
            scrollTrigger: {
              trigger: section,
              start: () => `top+=${frameCentre()} center`,
              end: () => `+=${EXPAND_SCROLL[isPhone() ? 'phone' : 'desktop'] * (1 + REST)}`,
              pin: true,
              // Pins a frame early so a fast touch flick doesn't overshoot before it holds
              anticipatePin: 1,
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            '.brand-video__frame',
            { clipPath: () => `inset(${insetY()}px ${insetX()}px ${insetY()}px ${insetX()}px)` },
            { clipPath: 'inset(0px 0px 0px 0px)' },
            0,
          )
          .fromTo('.brand-video__thumb', { scale: () => size() / stage.clientHeight }, { scale: 1 }, 0)
          .fromTo('.brand-video__tint', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0.6)
          .fromTo(
            '.brand-video__play',
            { opacity: 0, scale: 0.6 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
            0.7,
          )
          // Rest: the open film holds still before the page scrolls on.
          .to({}, { duration: REST });
        const pin = hold.scrollTrigger!;

        // 3) Exit — the hero's treatment: once the frame is open, the section drifts at
        //    half speed so the next section slides up over it, and the image darkens.
        gsap
          .timeline({
            defaults: { ease: 'none', duration: 1 },
            scrollTrigger: {
              trigger: section,
              start: () => pin.end,
              end: () => pin.end + section.offsetHeight,
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .fromTo('.brand-video__drift', { y: 0 }, { y: () => section.offsetHeight * 0.5 }, 0)
          // Darkens only once the next section is well on its way, not at the first scroll.
          .fromTo('.brand-video__shade', { opacity: 0 }, { opacity: 0.6, duration: 0.6 }, 0.4);
      });
    },
    { scope: sectionRef },
  );

  // Pause if the viewer scrolls away mid-film.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
    });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    video.play().catch(() => setStarted(false));
  };

  return (
    <section
      ref={sectionRef}
      className={`brand-video${started ? ' is-started' : ''}${playing ? ' is-playing' : ''}`}
    >
      {/* drift: exit parallax · lift: lays out the heading above the frame */}
      <div className="brand-video__drift">
        <div className="brand-video__lift">
          <div className="brand-video__intro">
            <VLine src={line} length={100} />
            <div className="heading-group">
              <p className="eyebrow">Make it yours</p>
              <h2 className="display-title">
                Live <em>well</em>, study <em>better</em>
              </h2>
            </div>
          </div>

          <div ref={stageRef} className="brand-video__stage">
            <div className="brand-video__frame">
              <img className="brand-video__thumb" src={thumbnail} alt="" />
              <video
                ref={videoRef}
                className="brand-video__video"
                poster={thumbnail}
                preload="none"
                playsInline
                controls={started}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false);
                  setStarted(false);
                }}
              >
                <source src={VIDEO_SRC} type="video/mp4" />
              </video>
              <div className="brand-video__tint" aria-hidden />
              <div className="brand-video__shade" aria-hidden />
              {/* Arrives at the end of the reveal (Figma 1455:18177) */}
              <div className="brand-video__play">
                <PlayCta onPlay={play} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
