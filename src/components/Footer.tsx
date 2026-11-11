import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/smoothScroll';
import tiktok from '../assets/footer/tiktok.svg';
import facebook from '../assets/footer/facebook.svg';
import instagram from '../assets/footer/instagram.svg';
import wechat from '../assets/footer/wechat.svg';
import whatsapp from '../assets/footer/whatsapp.svg';
import wm01 from '../assets/footer/wordmark-01.svg';
import wm02 from '../assets/footer/wordmark-02.svg';
import wm03 from '../assets/footer/wordmark-03.svg';
import wm04 from '../assets/footer/wordmark-04.svg';
import wm05 from '../assets/footer/wordmark-05.svg';
import wm06 from '../assets/footer/wordmark-06.svg';
import wm07 from '../assets/footer/wordmark-07.svg';
import wm08 from '../assets/footer/wordmark-08.svg';
import wm09 from '../assets/footer/wordmark-09.svg';
import wm10 from '../assets/footer/wordmark-10.svg';
import wm11 from '../assets/footer/wordmark-11.svg';
import wm12 from '../assets/footer/wordmark-12.svg';
import lobeTop from '../assets/footer/emblem-lobe-top.svg';
import lobeRight from '../assets/footer/emblem-lobe-right.svg';
import lobeBottom from '../assets/footer/emblem-lobe-bottom.svg';
import lobeLeft from '../assets/footer/emblem-lobe-left.svg';
import { FOOTER_VARIANT } from '../lib/navVariant';
import './Footer.css';

/** The giant EPIISOD wordmark's parts, positioned as in Figma 539:18159 (top right bottom left, %). */
const WORDMARK: { src: string; inset: string; kind: 'arc-top' | 'arc-bottom' | 'letter' }[] = [
  // arcs
  { src: wm01, inset: '0.92% 12.3% 64.45% 72.86%', kind: 'arc-top' },
  { src: wm02, inset: '0% 43.42% 64.45% 41.46%', kind: 'arc-top' },
  { src: wm03, inset: '0.94% 74.84% 64.45% 10.33%', kind: 'arc-top' },
  { src: wm04, inset: '64.67% 27.8% -0.07% 57.1%', kind: 'arc-bottom' },
  { src: wm05, inset: '64.67% 59.11% 0.14% 25.88%', kind: 'arc-bottom' },
  // letters E P I I S O D
  { src: wm06, inset: '21.84% 95.11% 21.62% 0%', kind: 'letter' },
  { src: wm07, inset: '22.08% 79.08% 21.86% 15.4%', kind: 'letter' },
  { src: wm08, inset: '22.31% 65.95% 22.09% 32.51%', kind: 'letter' },
  { src: wm09, inset: '22.31% 50.26% 22.09% 48.2%', kind: 'letter' },
  { src: wm10, inset: '21.22% 33% 20.98% 62.31%', kind: 'letter' },
  { src: wm11, inset: '21.24% 14.85% 21.02% 75.55%', kind: 'letter' },
  { src: wm12, inset: '21.77% 0% 21.56% 92.08%', kind: 'letter' },
];

/*
 * Option B (Figma 1254:7885): the emblem, centred on the wordmark, opens out into it.
 * Figma units: the wordmark is 1368 × 224.08 and the 263px emblem sits on its centre.
 * Each lobe's box (padded 1 unit for its stroke) carries the wordmark arc it becomes and
 * the turn that takes it there; the bottom lobe parts in two for the two bottom arcs.
 */
const WM_W = 1368;
const WM_H = 224.0774;
const EMBLEM = 263;
const EMBLEM_X = (WM_W - EMBLEM) / 2;
const EMBLEM_Y = (WM_H - EMBLEM) / 2;
/** The emblem's E (x y w h, inside the emblem), where the wordmark's E starts from */
const EMBLEM_E = [98.64, 68.27, 65.76, 126.5];

const LOBES: { src: string; box: number[]; arc: number; turn: number }[] = [
  { src: lobeLeft, box: [-0.57, 50.32, 53.01, 162.35], arc: 2, turn: 90 },
  { src: lobeTop, box: [50.33, -0.57, 162.35, 53], arc: 1, turn: 0 },
  { src: lobeRight, box: [210.56, 50.32, 52.99, 162.36], arc: 0, turn: -90 },
  { src: lobeBottom, box: [50.33, 210.57, 162.37, 52.99], arc: 4, turn: 0 },
  { src: lobeBottom, box: [50.33, 210.57, 162.37, 52.99], arc: 3, turn: 0 },
];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const SOCIALS = [
  { name: 'TikTok', icon: tiktok },
  { name: 'Facebook', icon: facebook },
  { name: 'Instagram', icon: instagram },
  { name: 'WeChat', icon: wechat },
  { name: 'WhatsApp', icon: whatsapp },
];

const LOCATIONS = [
  { city: 'Sydney', sites: ['Macquarie Park'] },
  { city: 'Perth', sites: ['Fairway', 'Stirling'] },
  { city: 'Melbourne', sites: ['North Melbourne', 'Central Melbourne'] },
  { city: 'London', sites: ['Euston'] },
];

const EPIISOD_LINKS = ['About', 'Why EPIISOD', 'Experience', 'For Parents', 'For International Students', 'Blog'];
const CONTACT_LINKS = ['Contact Us', 'Book a Tour', 'FAQS'];
const POLICY_LINKS = ['Cancellation', 'Policy 1', 'Policy 2'];
/** Footer links with a page so far; the rest link to '#' until their pages exist. */
const LINK_HREFS: Record<string, string> = {
  About: '/about',
  'Why EPIISOD': '/why-epiisod',
  Experience: '/experience',
  'For Parents': '/blog/for-parents',
  'For International Students': '/blog/for-international-students',
  Blog: '/blog/for-parents',
  'Contact Us': '/contact',
  FAQS: '/faqs',
};
const LEGAL_LINKS = ['Terms and Condition', 'Something something', 'Something something'];

function LinkGroup({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="footer__group">
      <h2 className="type-h5 footer__heading">{title}</h2>
      <ul className="footer__links">
        {links.map((link) => (
          <li key={link}>
            <a href={LINK_HREFS[link] ?? '#'}>{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Figma 539:18251: giant wordmark over a light cream footer with three link columns.
 * As the footer scrolls in, the wordmark assembles in two beats: a faint, partial rise as
 * it enters, then — as it nears the centre of the screen — the letters rise home at
 * alternating depths, left to right, and the arcs swing in around their circle centres,
 * landing as designed at the centre. The links then rise in as it carries on up.
 */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const footer = footerRef.current;
      if (!footer) return;
      if (FOOTER_VARIANT === 'b')
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          const box = footer.querySelector<HTMLElement>('.footer__wordmark')!;
          const parts = gsap.utils.toArray<HTMLElement>('.footer__wordmark-part');
          const lobes = gsap.utils.toArray<HTMLElement>('.footer__emblem-lobe');
          const [e, ...others] = parts.slice(5);
          // Layout boxes (untouched by transforms), in px inside the wordmark
          const at = (el: HTMLElement) => ({
            x: el.offsetLeft + el.offsetWidth / 2,
            y: el.offsetTop + el.offsetHeight / 2,
            w: el.offsetWidth,
            h: el.offsetHeight,
          });
          const unit = () => box.offsetWidth / WM_W;

          // 1 · Coming up: on the home page the coin above fades and settles away first, then
          // the emblem rises into view, arriving as it reaches the centre of the screen.
          // Triggers sit on the band around the wordmark (it moves, the band doesn't); the
          // band's padding is even, so its centre is the wordmark's.
          const band = footer.querySelector<HTMLElement>('.footer__brand')!;
          const coin = document.querySelector<HTMLElement>('.token-fold .token');
          const intro = gsap.timeline({
            scrollTrigger: {
              trigger: band,
              start: 'top bottom',
              end: 'center center',
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          });
          if (coin)
            intro.fromTo(
              coin,
              { opacity: 1, scale: 1 },
              { opacity: 0, scale: 0.8, ease: 'power1.in', duration: 0.4 },
              0,
            );
          intro.fromTo(box, { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.5);

          // 2 · Held at the centre for a screen's worth of scrolling, the emblem slowly opens
          // out: each lobe glides to its place, turning and widening into a wordmark arc as
          // it goes, the E slides left, and the other letters rise in behind it, right → left.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: band,
              start: 'center center',
              end: () => `+=${window.innerHeight * (window.innerWidth <= 700 ? 0.8 : 1)}`,
              pin: band,
              anticipatePin: 1,
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
            defaults: { ease: 'sine.inOut' },
          });

          LOBES.forEach((lobe, i) => {
            const arc = parts[lobe.arc];
            const sideways = lobe.turn !== 0;
            const from = () => at(lobes[i]);
            const to = () => at(arc);
            gsap.set(arc, { transformOrigin: '50% 50%' });
            tl.fromTo(
              arc,
              {
                x: () => from().x - to().x,
                y: () => from().y - to().y,
                rotation: -lobe.turn,
                scaleX: () => (sideways ? from().h : from().w) / to().w,
                scaleY: () => (sideways ? from().w : from().h) / to().h,
                opacity: 0,
              },
              {
                x: 0,
                y: 0,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                duration: 1,
              },
              0,
            ).fromTo(
              lobes[i],
              { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
              {
                x: () => to().x - from().x,
                y: () => to().y - from().y,
                rotation: lobe.turn,
                scaleX: () => (sideways ? to().h : to().w) / from().w,
                scaleY: () => (sideways ? to().w : to().h) / from().h,
                opacity: 0,
                duration: 1,
              },
              0,
            );
          });

          // The E is the same size in both: it only travels
          tl.fromTo(
            e,
            {
              x: () => (EMBLEM_X + EMBLEM_E[0] + EMBLEM_E[2] / 2) * unit() - at(e).x,
              y: () => (EMBLEM_Y + EMBLEM_E[1] + EMBLEM_E[3] / 2) * unit() - at(e).y,
            },
            { x: 0, y: 0, duration: 1 },
            0,
          );
          // Set up front: a staggered fromTo only pre-renders its first letter
          gsap.set(others, { yPercent: 40, opacity: 0 });
          tl.to(
            others,
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.6,
              stagger: { each: 0.08, from: 'end' },
            },
            0.35,
          );

          // 3 · Hand-over: once the hold ends the wordmark scrolls up until its top is
          // STICK_TOP down the screen, then stays there while the links come up beneath it.
          // When they've closed half the space between them, it goes on up with them.
          const hold = tl.scrollTrigger!;
          const STICK_TOP = 0.15;
          const body = footer.querySelector<HTMLElement>('.footer__body')!;
          // The space is read from CSS: the pin moves the band's own margin onto its spacer
          const stay = () =>
            (parseFloat(getComputedStyle(footer).getPropertyValue('--logo-b-space')) +
              parseFloat(getComputedStyle(body).paddingTop)) /
            2;
          const stickAt = () => hold.end + window.innerHeight * (0.5 - STICK_TOP) - box.offsetHeight / 2;
          gsap.fromTo(
            '.footer__drift',
            { y: 0 },
            {
              y: stay,
              ease: 'none',
              scrollTrigger: {
                start: stickAt,
                end: () => stickAt() + stay(),
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

      if (FOOTER_VARIANT === 'a')
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
          const letters = gsap.utils.toArray<HTMLElement>('.footer__wordmark-part--letter');
          const arcsTop = gsap.utils.toArray<HTMLElement>('.footer__wordmark-part--arc-top');
          const arcsBottom = gsap.utils.toArray<HTMLElement>('.footer__wordmark-part--arc-bottom');

          // From the wordmark coming into view until it reaches the middle of the screen
          // clamp(): on very tall screens the page can't scroll that far, so it finishes
          // at the bottom of the page instead
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: '.footer__wordmark',
              start: 'top bottom',
              end: 'clamp(center center)',
              // A gentle catch-up, so the pieces glide after the scroll
              scrub: 1.2,
            },
          });

          // 1 · Coming in: a quiet hint. The letters rise only part of the way out of the
          // wordmark's band (which clips them) and the arcs turn half way, all faint.
          tl.fromTo(
            letters,
            { yPercent: (i: number) => (i % 2 ? 150 : 110), opacity: 0 },
            {
              yPercent: (i: number) => (i % 2 ? 50 : 35),
              opacity: 0.4,
              duration: 1,
              ease: 'sine.inOut',
            },
            0,
          ).fromTo(
            [...arcsTop, ...arcsBottom],
            { rotation: (i: number) => (i % 2 ? 60 : -60), opacity: 0 },
            {
              rotation: (i: number) => (i % 2 ? 30 : -30),
              opacity: 0.4,
              duration: 1,
              ease: 'sine.inOut',
            },
            0,
          );

          // 2 · Nearing the centre: the clear move. Letters rise home left → right, the arcs
          // swing into place, landing as designed as the wordmark reaches the centre.
          tl.to(
            letters,
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power2.inOut',
              stagger: 0.05,
            },
            1,
          ).to(
            [...arcsTop, ...arcsBottom],
            {
              rotation: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.inOut',
              stagger: 0.05,
            },
            1.05,
          );
        });

      // 3 · Then the links. On wider screens the three columns sit side by side: they rise
      // in, left → right, as the wordmark carries on up past the centre. If the page ends
      // before the wordmark gets there (very tall screens), they start a short way before
      // the bottom instead of all at once at the end.
      if (FOOTER_VARIANT === 'a')
        gsap.matchMedia().add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
          const LINKS_SCROLL = 350;
          const wordmarkAtCentre = () => {
            const r = footer.querySelector('.footer__wordmark')!.getBoundingClientRect();
            return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2;
          };
          const linksStart = () => Math.min(wordmarkAtCentre(), ScrollTrigger.maxScroll(window) - LINKS_SCROLL);
          gsap.fromTo(
            '.footer__column, .footer__legal',
            { y: 48, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              ease: 'power1.out',
              stagger: 0.15,
              scrollTrigger: {
                trigger: '.footer__wordmark',
                start: linksStart,
                end: () => linksStart() + LINKS_SCROLL,
                scrub: 1.2,
              },
            },
          );
        });

      // Option B: the links come up beneath the held logo, so they rise in left → right
      // as they arrive on screen.
      if (FOOTER_VARIANT === 'b')
        gsap.matchMedia().add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            '.footer__column, .footer__legal',
            { y: 48, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              ease: 'power1.out',
              stagger: 0.15,
              scrollTrigger: {
                trigger: '.footer__inner',
                start: 'top 95%',
                end: 'clamp(top 55%)',
                scrub: 1.2,
              },
            },
          );
        });

      // Phones: the groups stack in one long column below the wordmark, so each rises in
      // as it comes up the screen.
      gsap.matchMedia().add('(max-width: 700px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.footer__group, .footer__legal').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 32, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 95%',
                end: 'clamp(top 70%)',
                scrub: 1.2,
              },
            },
          );
        });
      });
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className={`footer footer--logo-${FOOTER_VARIANT}`}>
      <div className="footer__brand">
        <div className="footer__drift">
          <div className="footer__wordmark" role="img" aria-label="EPIISOD">
            {WORDMARK.map((part, i) => (
              <span
                key={i}
                className={`footer__wordmark-part footer__wordmark-part--${part.kind}`}
                style={{ inset: part.inset }}
              >
                <img src={part.src} alt="" />
              </span>
            ))}
            {FOOTER_VARIANT === 'b' &&
              LOBES.map((lobe, i) => (
                <span
                  key={`lobe-${i}`}
                  className="footer__emblem-lobe"
                  style={{
                    left: pct(EMBLEM_X + lobe.box[0], WM_W),
                    top: pct(EMBLEM_Y + lobe.box[1], WM_H),
                    width: pct(lobe.box[2], WM_W),
                    height: pct(lobe.box[3], WM_H),
                  }}
                >
                  <img src={lobe.src} alt="" />
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="footer__body">
        <div className="footer__inner">
          <div className="footer__columns">
            <div className="footer__column">
              <LinkGroup title="EPIISOD" links={EPIISOD_LINKS} />
              <div className="footer__group footer__group--follow">
                <h2 className="type-h5 footer__heading">Follow us</h2>
                <ul className="footer__socials">
                  {SOCIALS.map((s) => (
                    <li key={s.name}>
                      <a href="#" aria-label={s.name}>
                        <img src={s.icon} width={34} height={34} alt="" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="footer__column">
              <div className="footer__group">
                <h2 className="type-h5 footer__heading">Locations</h2>
                <div className="footer__locations">
                  {LOCATIONS.map((loc) => (
                    <ul key={loc.city} className="footer__links">
                      <li className="footer__city">{loc.city}</li>
                      {loc.sites.map((site) => (
                        <li key={site}>
                          <a href="#">{site}</a>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>

            <div className="footer__column">
              <LinkGroup title="Contact" links={CONTACT_LINKS} />
              <LinkGroup title="Policies" links={POLICY_LINKS} />
            </div>
          </div>

          <p className="footer__legal">
            {LEGAL_LINKS.map((link, i) => (
              <span key={i}>{link}</span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
