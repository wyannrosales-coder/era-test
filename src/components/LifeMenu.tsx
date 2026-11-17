import { MegaMenuPanel } from './MegaMenu';
import type { NavVariant } from '../lib/navVariant';
import arrowRight from '../assets/menu-arrow-right.svg';
import { PROPERTIES } from './locationData';
import { experienceHref } from '../lib/links';
import './LifeMenu.css';

type LifeMenuProps = {
  id: string;
  open: boolean;
  onNavigate: () => void;
  variant?: NavVariant;
};

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
 * The property experiences as a list under "Experience": every property, each entering its
 * experience page, or marked "Coming soon" while it has none.
 */
function ExperienceList({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="life-menu__experience-list">
      <p className="life-menu__list-label">Enter an experience</p>
      <ul className="life-menu__properties">
        {PROPERTIES.map((property) => {
          const href = experienceHref(property.id);
          const body = (
            <>
              <span className="life-menu__property-text">
                <span className="life-menu__property-name">{property.name.replace(/^EPIISOD\s+/, '')}</span>
                <span className="life-menu__property-city">{property.city}</span>
              </span>
              <span className="life-menu__property-cta">
                {href ? 'Enter' : 'Coming soon'}
                {href && <img loading="lazy" decoding="async" src={arrowRight} width={14} height={14} alt="" />}
              </span>
            </>
          );
          return (
            <li key={property.id}>
              {href ? (
                <a href={href} className="life-menu__property" onClick={onNavigate}>
                  {body}
                </a>
              ) : (
                <span className="life-menu__property is-soon">{body}</span>
              )}
            </li>
          );
        })}
      </ul>
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
            <ExperienceList onNavigate={onNavigate} />
          </div>
          <div className="nav-menu-b__blog">
            <p className="nav-menu-b__label life-menu__title">Blog</p>
            {BLOG_LINKS.map(({ title, href, description }) => (
              <a key={title} href={href} className="nav-menu-b__link nav-menu-b__link--article" onClick={onNavigate}>
                <span className="nav-menu-b__article">
                  {title}
                  <img loading="lazy" decoding="async" src={arrowRight} width={16} height={16} alt="" />
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
