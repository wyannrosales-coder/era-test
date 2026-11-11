import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { PROPERTIES, REGIONS } from './locationData';
import { setScrollLocked } from '../lib/smoothScroll';
import logo from '../assets/nav-logo-compact.svg';
import closeIcon from '../assets/menu/close.svg';
import caretRight from '../assets/menu/caret-right.svg';
import caretDown from '../assets/menu/caret-down.svg';
import caretLeft from '../assets/menu/caret-left.svg';
import './HamburgerMenu.css';

type Link = { label: string; href: string };

/** Expandable groups (Figma 652:9263 / 652:9422). Pages not built yet link to '#'. */
const GROUPS: Record<'life' | 'contact' | 'blog', Link[]> = {
  /** The desktop bar's Life @ EPIISOD menu (Figma 539:20915) */
  life: [
    { label: 'Why EPIISOD', href: '/why-epiisod' },
    { label: 'Experience', href: '/experience' },
    { label: 'Promotions', href: '/promotions' },
  ],
  contact: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Join Waitlist', href: '/join-the-waitlist' },
    { label: 'FAQs', href: '/faqs' },
  ],
  blog: [
    { label: 'For Parents', href: '/blog/for-parents' },
    { label: 'For International Students', href: '/blog/for-international-students' },
  ],
};

type HamburgerMenuProps = {
  open: boolean;
  onClose: () => void;
};

function PanelHeader({ onClose, closeRef }: { onClose: () => void; closeRef?: React.Ref<HTMLButtonElement> }) {
  return (
    <div className="menu-panel__header">
      <a href="/" className="menu-panel__logo" aria-label="EPIISOD home">
        <img src={logo} width={40} height={40} alt="" />
      </a>
      <button ref={closeRef} type="button" className="menu-panel__close" aria-label="Close menu" onClick={onClose}>
        <img src={closeIcon} width={24} height={24} alt="" />
      </button>
    </div>
  );
}

function Group({ label, links, onNavigate }: { label: string; links: Link[]; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <li className={`menu-panel__group${expanded ? ' is-expanded' : ''}`}>
      <button type="button" className="menu-panel__item" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded((e) => !e)}>
        <span>{label}</span>
        <img className="menu-panel__caret" src={caretDown} width={16} height={16} alt="" />
      </button>
      <div id={id} className="menu-panel__sub">
        <ul className="menu-panel__sub-clip">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="menu-panel__sub-link" tabIndex={expanded ? undefined : -1} onClick={onNavigate}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/**
 * Hamburger menu (Figma 652:9490): a white panel sliding in from the right over the
 * blurred page. Life @ EPIISOD, Contact and Blog expand in place; Locations links to its
 * page, and its arrow opens a second panel over the first, listing every property by country
 * and city. The main navigation
 * on tablets and phones, and the ☰ menu on desktop.
 */
export default function HamburgerMenu({ open, onClose }: HamburgerMenuProps) {
  const [locationsOpen, setLocationsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const locationsButtonRef = useRef<HTMLButtonElement>(null);

  // While open: freeze the page, start focus on the close button, close on Escape
  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      document.removeEventListener('keydown', onKey);
      previous?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  // Each opening starts on the main list
  useEffect(() => {
    if (!open) setLocationsOpen(false);
  }, [open]);

  const showLocations = (show: boolean) => {
    setLocationsOpen(show);
    requestAnimationFrame(() => (show ? backRef.current : locationsButtonRef.current)?.focus({ preventScroll: true }));
  };

  // Keep Tab within the panel while it's open
  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const scope = locationsOpen ? panelRef.current?.querySelector('.menu-panel--locations') : panelRef.current?.querySelector('.menu-panel--main');
    const focusable = scope ? [...scope.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => el.tabIndex !== -1) : [];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const panel = (key: string, children: ReactNode, extra = '') => (
    <div className={`menu-panel menu-panel--${key}${extra}`} data-lenis-prevent>
      {children}
    </div>
  );

  return (
    <div className={`hamburger${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="hamburger__backdrop" onClick={onClose} />
      <div
        ref={panelRef}
        className={`hamburger__panels${locationsOpen ? ' is-locations' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onKeyDown={trapFocus}
      >
        {panel(
          'main',
          <>
            <PanelHeader onClose={onClose} closeRef={closeRef} />
            <nav aria-label="Menu">
              <ul className="menu-panel__items">
                <Group label="Life @ EPIISOD" links={GROUPS.life} onNavigate={onClose} />
                {/* The word opens the Locations page; the arrow, every property by country and city */}
                <li className="menu-panel__split">
                  <a href="/locations" className="menu-panel__item" onClick={onClose}>
                    <span>Locations</span>
                  </a>
                  <button
                    ref={locationsButtonRef}
                    type="button"
                    className="menu-panel__split-caret"
                    aria-label="Locations menu"
                    onClick={() => showLocations(true)}
                  >
                    <img src={caretRight} width={16} height={16} alt="" />
                  </button>
                </li>
                <Group label="Contact" links={GROUPS.contact} onNavigate={onClose} />
                <li>
                  <a href="/about" className="menu-panel__item" onClick={onClose}>
                    <span>About</span>
                  </a>
                </li>
                <Group label="Blog" links={GROUPS.blog} onNavigate={onClose} />
              </ul>
            </nav>
            <a href="#" className="menu-panel__cta" onClick={onClose}>
              Book a tour
            </a>
          </>,
        )}

        {panel(
          'locations',
          <>
            <PanelHeader onClose={onClose} />
            <div className="menu-panel__locations">
              <button ref={backRef} type="button" className="menu-panel__back" onClick={() => showLocations(false)}>
                <img src={caretLeft} width={16} height={16} alt="" />
                Back
              </button>
              <div className="menu-panel__list">
                <p className="menu-panel__heading">Locations</p>
                <div className="menu-panel__countries">
                  {REGIONS.map((region) => (
                    <div key={region.id} className="menu-panel__country">
                      <p className="menu-panel__country-name">{region.name}</p>
                      {region.cities.map((city) => (
                        <div key={city} className="menu-panel__city">
                          <p className="menu-panel__city-name">{city}</p>
                          <ul className="menu-panel__properties">
                            {PROPERTIES.filter((p) => p.city === city).map((p) => (
                              <li key={p.id}>
                                <a href={p.href ?? '#'} className="menu-panel__property" onClick={onClose}>
                                  {p.name.replace(/^EPIISOD\s+/, '')}
                                  {p.comingSoon && <span className="menu-panel__soon">Soon</span>}
                                </a>
                                {p.experienceHref && (
                                  <a href={p.experienceHref} className="menu-panel__experience" onClick={onClose}>
                                    Experience
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>,
        )}
      </div>
    </div>
  );
}
