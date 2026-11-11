import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/smoothScroll';
import { PHONE_MOTION_QUERY, isPhoneLayout } from '../lib/phone';
import tiktok from '../../assets/footer/tiktok.svg';
import facebook from '../../assets/footer/facebook.svg';
import instagram from '../../assets/footer/instagram.svg';
import wm01 from '../../assets/footer/wordmark-01.svg';
import wm02 from '../../assets/footer/wordmark-02.svg';
import wm03 from '../../assets/footer/wordmark-03.svg';
import wm04 from '../../assets/footer/wordmark-04.svg';
import wm05 from '../../assets/footer/wordmark-05.svg';
import wm06 from '../../assets/footer/wordmark-06.svg';
import wm07 from '../../assets/footer/wordmark-07.svg';
import wm08 from '../../assets/footer/wordmark-08.svg';
import wm09 from '../../assets/footer/wordmark-09.svg';
import wm10 from '../../assets/footer/wordmark-10.svg';
import wm11 from '../../assets/footer/wordmark-11.svg';
import wm12 from '../../assets/footer/wordmark-12.svg';
import { FOOTER_VARIANT } from '../../lib/navVariant';
import { MORPHS, crescentAt, fitMorphs } from './footerMorph';
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
 * v2: each lobe reshapes into the wordmark arc it becomes (footerMorph.ts) — one solid
 * crescent that travels, turns and flattens, rather than the lobe and arc crossfading.
 */
const WM_W = 1368;
const WM_H = 224.0774;
const EMBLEM = 263;
const EMBLEM_X = (WM_W - EMBLEM) / 2;
const EMBLEM_Y = (WM_H - EMBLEM) / 2;
/** The emblem's E (x y w h, inside the emblem), where the wordmark's E starts from */
const EMBLEM_E = [98.64, 68.27, 65.76, 126.5];

/** Figma 1441:15932: TikTok, Instagram, Facebook. */
const SOCIALS = [
  { name: 'TikTok', icon: tiktok },
  { name: 'Instagram', icon: instagram },
  { name: 'Facebook', icon: facebook },
];

/** Figma 1441:15877 link columns. */
const EPIISOD_LINKS = [
  'About',
  'Why EPIISOD',
  'Experience',
  'For International Students',
  'For Parents',
  'Moving In',
  'Scholarships',
  'Promotions',
  'Blog',
];
const LOCATIONS = [{ region: 'Australia', sites: ['Macquarie Park, Sydney', 'Bedford, Melbourne'] }];
const COMING_SOON = [
  { region: 'Australia', sites: ['MacKenzie, Melbourne', 'Fairway, Perth', 'Stirling, Perth'] },
  { region: 'United Kingdom', sites: ['Euston, London'] },
];
const CONTACT_LINKS = ['Contact Us', 'Join the Waitlist', 'FAQS', 'Book a Tour', 'E-Brochure'];
const POLICY_LINKS = ['Privacy Policy', 'Cancellation Policy', 'GBV Support', 'GBV Whole-of-Organization Plan'];
/** Footer links with a page so far; the rest link to '#' until their pages exist. */
const LINK_HREFS: Record<string, string> = {
  About: '/about',
  'Why EPIISOD': '/v2/why-epiisod',
  Experience: '/v2/experience',
  'For Parents': '/blog/for-parents',
  'For International Students': '/blog/for-international-students',
  Promotions: '/v2/promotions',
  Blog: '/blog/for-parents',
  'Contact Us': '/v2/contact',
  'Join the Waitlist': '/v2/join-the-waitlist',
  FAQS: '/v2/faqs',
  'Macquarie Park, Sydney': '/v2/locations/macquarie-park',
  'Bedford, Melbourne': '/v2/locations/bedford',
  'MacKenzie, Melbourne': '/locations/mackenzie',
  'Fairway, Perth': '/locations/fairway',
  'Stirling, Perth': '/locations/stirling',
  'Euston, London': '/locations/euston',
};

/** A heading over regions, each a bold region name followed by its properties. */
function RegionGroup({ title, regions }: { title: string; regions: { region: string; sites: string[] }[] }) {
  return (
    <div className="footer__group">
      <h2 className="type-h5 footer__heading">{title}</h2>
      <div className="footer__locations">
        {regions.map((r) => (
          <ul key={r.region} className="footer__links">
            <li className="footer__city">{r.region}</li>
            {r.sites.map((site) => (
              <li key={site}>
                <a href={LINK_HREFS[site] ?? '#'}>{site}</a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

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
          const morphs = gsap.utils.toArray<SVGPathElement>('.footer__morph path');
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
              end: () => `+=${window.innerHeight * (isPhoneLayout() ? 0.8 : 1)}`,
              pin: band,
              anticipatePin: 1,
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
            defaults: { ease: 'sine.inOut' },
          });

          // Each lobe's outline shifts into its arc's (and its colour with it): a single
          // solid shape throughout, so nothing shows through mid-way. The bottom lobe is
          // drawn twice, parting into the two bottom arcs.
          // Each piece is redrawn every frame as a true crescent part-way between its lobe
          // and its arc (footerMorph.ts), so it never warps. The first and last frames show
          // the exact lobe and arc drawings.
          const shapes = fitMorphs();
          const morph = { t: 0 };
          const draw = () => {
            const t = morph.t;
            morphs.forEach((path, i) => {
              path.setAttribute(
                'd',
                t <= 0.001 ? MORPHS[i].from.d : t >= 0.999 ? MORPHS[i].to.d : crescentAt(shapes[i].from, shapes[i].to, t),
              );
            });
          };
          tl.fromTo(morph, { t: 0 }, { t: 1, duration: 1, onUpdate: draw, onStart: draw }, 0);
          MORPHS.forEach((m, i) => {
            tl.fromTo(morphs[i], { fill: m.from.fill }, { fill: m.to.fill, duration: 1 }, 0);
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
      gsap.matchMedia().add(PHONE_MOTION_QUERY, () => {
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
            {FOOTER_VARIANT === 'b' && (
              // The emblem's lobes, which morph into the wordmark's arcs (footerMorph.ts)
              <svg
                className="footer__morph"
                viewBox={`0 0 ${WM_W} ${WM_H}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                {MORPHS.map((m, i) => (
                  <path
                    key={i}
                    d={m.from.d}
                    fill={m.from.fill}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="footer__body">
        <div className="footer__inner">
          <div className="footer__columns">
            <div className="footer__column">
              <LinkGroup title="EPIISOD" links={EPIISOD_LINKS} />
            </div>

            <div className="footer__column">
              <RegionGroup title="Locations" regions={LOCATIONS} />
              <RegionGroup title="Coming soon" regions={COMING_SOON} />
            </div>

            <div className="footer__column">
              <LinkGroup title="Contact" links={CONTACT_LINKS} />
            </div>

            <div className="footer__column">
              <LinkGroup title="Policies & Support" links={POLICY_LINKS} />
            </div>

            <div className="footer__column">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
