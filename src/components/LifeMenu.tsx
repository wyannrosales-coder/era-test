import { useCallback, useEffect, useRef, useState } from 'react';
import { MegaMenuPanel } from './MegaMenu';
import CarouselArrows from './ui/CarouselArrows';
import type { NavVariant } from '../lib/navVariant';
import arrowRight from '../assets/menu-arrow-right.svg';
import { PROPERTIES } from './locationData';
import { experienceHref } from '../lib/links';
import { ALL_READY } from '../lib/prototypeMode';
import loungePhoto from '../assets/experience/mosaic-lounge.jpg';
import './LifeMenu.css';

type LifeMenuProps = {
  id: string;
  open: boolean;
  onNavigate: () => void;
  variant?: NavVariant;
};

/**
 * The properties with an experience to enter (or one on its way), each with its photo:
 * Macquarie Park and Bedford, or — with every property ready (prototype switch) — all of them.
 */
const EXPERIENCE_ENTRIES = (ALL_READY ? PROPERTIES.map((p) => p.id) : ['macquarie-park', 'bedford']).flatMap((id) => {
  const property = PROPERTIES.find((p) => p.id === id);
  return property
    ? [
        {
          name: property.name.replace(/^EPIISOD\s+/, ''),
          image: id === 'macquarie-park' ? loungePhoto : property.image,
          href: experienceHref(id),
        },
      ]
    : [];
});

/** Option B's Blog column (Figma 1080:8880). */
const BLOG_LINKS = [
  {
    title: 'For International Students',
    href: '/blog/for-international-students',
    description: 'An elevated student living',
  },
  { title: 'For Parents', href: '/blog/for-parents', description: 'Choosing the right place for your child' },
];

const LINKS = [
  { title: 'Why EPIISOD', href: '/why-epiisod', description: 'Where Your Story Finds Its Place' },
  {
    title: 'Experience',
    href: '/experience',
    description:
      'The EPIISOD Experience goes beyond accommodation to create a living environment shaped around everyday ease, wellbeing, and connection.',
  },
];

/**
 * The property experiences as a horizontal carousel under "Experience": a photo card per
 * property, each entering its experience page (or marked coming soon), with chevrons.
 */
function ExperienceCarousel({ onNavigate }: { onNavigate: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setEdges({ prev: el.scrollLeft > 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = viewportRef.current;
    const card = el?.querySelector<HTMLElement>('.life-menu__experience');
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' });
  };

  return (
    <div className="life-menu__carousel">
      <div className="life-menu__carousel-head">
        <p className="life-menu__carousel-label">Enter an experience</p>
        <CarouselArrows
          className="life-menu__arrows"
          label="Browse the property experiences"
          canPrev={edges.prev}
          canNext={edges.next}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      </div>
      <div ref={viewportRef} className="life-menu__viewport" onScroll={measure} data-lenis-prevent>
        <ul className="life-menu__experiences">
          {EXPERIENCE_ENTRIES.map(({ name, image, href }) => {
            const body = (
              <>
                <img src={image} alt="" loading="lazy" />
                <span className="life-menu__experience-name">{name}</span>
                <span className="life-menu__experience-cta">
                  {href ? 'Enter the experience' : 'Coming soon'}
                  {href && <img src={arrowRight} width={14} height={14} alt="" />}
                </span>
              </>
            );
            return (
              <li key={name}>
                {href ? (
                  <a href={href} className="life-menu__experience" onClick={onNavigate}>
                    {body}
                  </a>
                ) : (
                  <span className="life-menu__experience is-soon">{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * Life @ EPIISOD mega menu (Figma 539:20915): page links with a short description,
 * highlighting on hover (Figma 539:21311). Navigation option B (Figma 1080:8880) stacks
 * them beside a Blog column, which in option A lives in the hamburger menu, then Promotions.
 */
export default function LifeMenu({ id, open, onNavigate, variant = 'a' }: LifeMenuProps) {
  if (variant === 'b') {
    return (
      <MegaMenuPanel id={id} open={open} heading="Life @ EPIISOD">
        <div className="nav-menu-b__life">
          <div className="nav-menu-b__pages">
            <a href="/why-epiisod" className="nav-menu-b__link" onClick={onNavigate}>
              <span className="life-menu__title">Why EPIISOD</span>
              <span className="life-menu__description">Where Your Story Finds Its Place</span>
            </a>
            <a href="/experience" className="nav-menu-b__link" onClick={onNavigate}>
              <span className="life-menu__title">Experience</span>
              <span className="life-menu__description nav-menu-b__small">
                The EPIISOD Experience that goes beyond accommodation
              </span>
            </a>
            <ExperienceCarousel onNavigate={onNavigate} />
          </div>
          <div className="nav-menu-b__blog">
            <p className="nav-menu-b__label life-menu__title">Blog</p>
            {BLOG_LINKS.map(({ title, href, description }) => (
              <a key={title} href={href} className="nav-menu-b__link nav-menu-b__link--article" onClick={onNavigate}>
                <span className="nav-menu-b__article">
                  {title}
                  <img src={arrowRight} width={16} height={16} alt="" />
                </span>
                <span className="type-body-s nav-menu-b__article-description">{description}</span>
              </a>
            ))}
          </div>
        </div>
      </MegaMenuPanel>
    );
  }

  return (
    <MegaMenuPanel id={id} open={open} heading="Life @ EPIISOD">
      <div className="life-menu__links">
        {LINKS.map(({ title, href, description }) => (
          <a key={title} href={href} className="life-menu__link" onClick={onNavigate}>
            <span className="life-menu__title">{title}</span>
            <span className="life-menu__description">{description}</span>
          </a>
        ))}
      </div>
    </MegaMenuPanel>
  );
}
