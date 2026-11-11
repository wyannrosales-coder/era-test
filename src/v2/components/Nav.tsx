import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { scrollToY } from '../../lib/smoothScroll';
import { isPhoneLayout } from '../lib/phone';
import caretLight from '../../assets/v2/caret-down-white.svg';
import caretDark from '../../assets/v2/caret-down-dark.svg';
import logoLight from '../../assets/v2/nav-logo-white.svg';
import logoDark from '../../assets/v2/nav-logo-dark.svg';
import caretActive from '../../assets/v2/caret-up-bronze.svg';
import menuLight from '../../assets/menu-icon.svg';
import menuDark from '../../assets/menu-icon-dark.svg';
import MegaMenu from './MegaMenu';
import LanguageSelect from './LanguageSelect';
import HamburgerMenu from './HamburgerMenu';
import ContactMenu from './ContactMenu';
import { NAV_VARIANT } from '../../lib/navVariant';
import LifeMenu from './LifeMenu';
import LocationsMenu from './LocationsMenu';
import './Nav.css';

type MenuKey = 'life' | 'locations' | 'contact';

/**
 * Primary links; those with a `menu` toggle a mega menu instead of navigating. With both a
 * `menu` and an `href` (Locations), the word goes to the page and its caret opens the menu.
 * Contact us works the same way, its caret opening the contact menu (Figma 690:4830).
 */
const PRIMARY_LINKS: { label: string; menu?: MenuKey; href?: string; caret?: boolean }[] = [
  { label: 'Life @ epiisod', menu: 'life' },
  { label: 'Locations', menu: 'locations', href: '/locations' },
  { label: 'Contact us', menu: 'contact', href: '/v2/contact' },
];
const menuId = (menu: MenuKey) => `nav-${menu}-menu`;
/** A link in the sub-navigation row: scrolls to the section with this id. */
export type SubLink = { label: string; target: string };

/** Scroll distance (px) after which the nav gains its solid background. */
const SCROLLED_AFTER = 40;
/** Without `hideBarAfter`, the bar starts hiding on the way down once the page is scrolled this far (px). */
const HIDE_AFTER = 160;
/** Scroll movement (px) that counts as a change of direction for hiding the bar. */
const DIRECTION_TOLERANCE = 6;
/** Height of the scrolled bar: 12px padding ×2 + 48px logo + 1px rule (Nav.css). */
const COMPACT_BAR_HEIGHT = 73;
/** Grace period (ms) before a hovered-open menu closes once the pointer leaves the nav,
 *  so crossing a gap on the way down into the panel doesn't flicker it shut. */
const HOVER_CLOSE_DELAY = 200;
/** Moving the cursor within this distance (px) of the top of the window brings a hidden
 *  nav back (desktop pointers only). */
const PEEK_EDGE = 24;

const pageTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

/**
 * Scroll so `id`'s section lands just below the nav — below the sub-navigation alone
 * when the main bar will be hidden by the time it arrives.
 */
export function scrollToSection(id: string, { immediate = false }: { immediate?: boolean } = {}) {
  const section = document.getElementById(id);
  const header = document.querySelector<HTMLElement>('.nav');
  if (!section || !header) return;
  // Its full height, even while folded away over a phone's hero
  const subNav = header.querySelector<HTMLElement>('.nav__sub');
  const sub = subNav ? Math.max(subNav.offsetHeight, subNav.scrollHeight) : 0;
  const hideAfter = header.dataset.hideAfter && document.getElementById(header.dataset.hideAfter);
  const top = pageTop(section);
  const goingDown = top - sub > window.scrollY;
  const barHides =
    (header.dataset.barHiddenIn?.split(',') ?? []).includes(id) ||
    (!!hideAfter && goingDown && top - sub >= pageTop(hideAfter) - sub - COMPACT_BAR_HEIGHT);
  scrollToY(top - sub - (barHides ? 0 : COMPACT_BAR_HEIGHT), { immediate });
}

/** Menu caret: white/chocolate pointing down, swapping to Figma's bronze up-caret while
 *  its menu is open (Figma 1441:13847). */
function Caret() {
  return (
    <span className="nav__caret-icon">
      <Icon light={caretLight} dark={caretDark} size={16} />
      <img className="nav__caret-active" src={caretActive} width={16} height={16} alt="" />
    </span>
  );
}

/** An icon in both colourways, cross-fading with the nav's state. */
function Icon({ light, dark, size }: { light: string; dark: string; size: number }) {
  return (
    <span className="nav__icon" style={{ width: size, height: size }}>
      <img className="nav__icon-light" src={light} width={size} height={size} alt="" />
      <img className="nav__icon-dark" src={dark} width={size} height={size} alt="" />
    </span>
  );
}

/**
 * Fixed global navigation. Transparent with white type over the hero (Figma 539:10035);
 * once the page scrolls it fades to a compact 90% white bar — 40px logo, 12px padding —
 * with a soft shadow and chocolate type for readability (Figma 539:12758).
 * Clicking a menu link turns the bar solid white and expands its mega menu
 * (Figma 539:20915, 539:18628).
 *
 * Property pages pass `subLinks`: a second row jumping to the page's sections
 * (Figma 539:13194), which turns into a bronze band once scrolled (Figma 539:22227).
 * Scrolling down, the main bar slides away (on property pages only from `hideBarAfter`,
 * leaving the sub-navigation); scrolling up brings it back.
 * Within the `barHiddenIn` sections it stays hidden in both directions, for sections that
 * pin their own controls under the sub-navigation. While an element in `hiddenIn` fills
 * the top of the screen, the whole nav (sub-navigation too) slides away, for full-screen
 * scroll stories.
 * `tone="dark"` starts as a solid chocolate bar (Figma 539:24148) for pages without a hero;
 * `tone="cream"` as a cream bar with chocolate type (Figma 735:13845, About us).
 */
export default function Nav({
  subLinks,
  hideBarAfter,
  barHiddenIn,
  hiddenIn,
  tone = 'light',
}: {
  subLinks?: SubLink[];
  hideBarAfter?: string;
  /** Section ids where the main bar stays hidden even when scrolling up. */
  barHiddenIn?: string[];
  /** Element ids that hide the whole nav while they cover the top of the screen. */
  hiddenIn?: string[];
  /** `dark`: a solid chocolate bar until scrolled (Contact page). `cream`: a cream bar with
   *  chocolate type (About us). */
  tone?: 'light' | 'dark' | 'cream';
}) {
  const [scrolled, setScrolled] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  /** The cursor reached the top edge: show the nav even if scrolling had hidden it. */
  const [peek, setPeek] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const [currentSub, setCurrentSub] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number>();
  /** The open menu was opened by hovering (so a click on its link keeps it open). */
  const openedByHover = useRef(false);

  // Hover opens menus with a mouse; touch and pens keep tap-to-open.
  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), HOVER_CLOSE_DELAY);
  };
  const hoverOpen = (menu: MenuKey) => (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    cancelClose();
    openedByHover.current = true;
    setOpenMenu(menu);
  };
  const toggleMenu = (menu: MenuKey) => {
    cancelClose();
    // Clicking a link whose menu just opened on hover keeps it open (and pinned until
    // the pointer leaves) rather than closing it again.
    // Reads the current state (not this render's), as hover and click can land together.
    const keep = openedByHover.current;
    openedByHover.current = false;
    setOpenMenu((current) => (current === menu ? (keep ? current : null) : menu));
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Peek: on desktop, the cursor at the top edge of the window brings the hidden nav back.
  // It stays while the pointer is over the nav and hides again once it moves away below.
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onMove = (e: MouseEvent) => {
      if (!fine.matches) return;
      if (e.clientY <= PEEK_EDGE) {
        setPeek(true);
        return;
      }
      const header = headerRef.current;
      // Measured without the hide transform: the bar's full height from the top
      const navBottom = header ? header.offsetHeight : 0;
      if (e.clientY > navBottom + 8) setPeek(false);
    };
    // Leaving the window across its top edge (e.g. towards the browser's tabs) counts too
    const onLeave = (e: MouseEvent) => {
      if (fine.matches && !e.relatedTarget && e.clientY <= PEEK_EDGE) setPeek(true);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseout', onLeave);
    };
  }, []);
  const barRef = useRef<HTMLElement>(null);
  const subRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLLED_AFTER);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Hide the main bar while scrolling down — past `hideBarAfter` if given, otherwise once
  // the page has scrolled HIDE_AFTER px — and bring it back on the way up
  useEffect(() => {
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const header = headerRef.current;
      if (!header) return;
      const section = hideBarAfter ? document.getElementById(hideBarAfter) : null;
      if (hideBarAfter && !section) return;
      const hideFrom = section ? pageTop(section) - header.offsetHeight : HIDE_AFTER;
      // Phones keep the sub-navigation on screen throughout, even over full-screen stages
      const phone = isPhoneLayout();
      setHidden(
        !phone &&
        (hiddenIn ?? []).some((id) => {
          const r = document.getElementById(id)?.getBoundingClientRect();
          return !!r && r.top <= 1 && r.bottom > header.offsetHeight;
        }),
      );
      const inHiddenSection = (barHiddenIn ?? []).some((id) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        return !!r && r.top <= header.offsetHeight && r.bottom > header.offsetHeight;
      });
      if (y < hideFrom) {
        setCondensed(false);
        lastY = y;
      } else if (inHiddenSection) {
        setCondensed(true);
        lastY = y;
      } else if (Math.abs(y - lastY) > DIRECTION_TOLERANCE) {
        setCondensed(y > lastY);
        lastY = y;
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [hideBarAfter, barHiddenIn, hiddenIn]);

  // Publish how much of the nav is on screen (bar + sub-navigation, minus a hidden bar)
  // as --nav-offset, so sticky page content can sit just below it. Held while a menu is open.
  useEffect(() => {
    const header = headerRef.current;
    const bar = barRef.current;
    if (!header || !bar || openMenu) return;
    const update = () => {
      const sub = header.querySelector<HTMLElement>('.nav__sub')?.offsetHeight ?? 0;
      const visible = hidden ? 0 : (condensed ? 0 : bar.offsetHeight) + sub;
      document.documentElement.style.setProperty('--nav-offset', `${visible}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, [condensed, hidden, openMenu]);

  // The hidden bar slides up by its own height, which changes as it compacts
  useEffect(() => {
    const bar = barRef.current;
    const header = headerRef.current;
    if (!bar || !header) return;
    const ro = new ResizeObserver(() => header.style.setProperty('--bar-h', `${bar.offsetHeight}px`));
    // border-box: the bar compacts by padding too, which a content-box observer misses
    ro.observe(bar, { box: 'border-box' });
    return () => ro.disconnect();
  }, []);

  // The section under the nav is the sub-navigation's current link
  useEffect(() => {
    if (!subLinks) return;
    const update = () => {
      const below = (headerRef.current?.offsetHeight ?? 0) + 1;
      let current: string | null = null;
      for (const { target } of subLinks) {
        const r = document.getElementById(target)?.getBoundingClientRect();
        if (r && r.top <= below && r.bottom > below) current = target;
      }
      setCurrentSub(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [subLinks]);

  // Where the row scrolls sideways (tablets and phones), keep the current link in view
  useEffect(() => {
    const row = subRef.current;
    const link = currentSub && row?.querySelector<HTMLElement>(`[href="#${currentSub}"]`);
    if (!row || !link || row.scrollWidth <= row.clientWidth) return;
    const l = link.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    row.scrollBy({ left: l.left + l.width / 2 - (r.left + r.width / 2), behavior: 'smooth' });
  }, [currentSub]);

  // Where the row scrolls sideways: fade whichever edge has more links beyond it, and let
  // a mouse drag it along (touch already swipes it). A drag doesn't count as a click.
  useEffect(() => {
    const row = subRef.current;
    if (!row) return;
    const edges = () => {
      const max = row.scrollWidth - row.clientWidth;
      row.classList.toggle('has-more-left', row.scrollLeft > 2);
      row.classList.toggle('has-more-right', row.scrollLeft < max - 2);
    };
    let startX = 0;
    let startLeft = 0;
    let pointer: number | null = null;
    let dragged = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || row.scrollWidth <= row.clientWidth) return;
      pointer = e.pointerId;
      dragged = false;
      startX = e.clientX;
      startLeft = row.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) > 4) {
        dragged = true;
        row.setPointerCapture(e.pointerId);
        row.classList.add('is-dragging');
      }
      if (dragged) row.scrollLeft = startLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      row.classList.remove('is-dragging');
    };
    // Captured before the link's own click, so a drag never jumps to a section
    const click = (e: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      e.preventDefault();
      e.stopPropagation();
    };
    edges();
    const ro = new ResizeObserver(edges);
    ro.observe(row);
    row.addEventListener('scroll', edges, { passive: true });
    row.addEventListener('pointerdown', down);
    row.addEventListener('pointermove', move);
    row.addEventListener('pointerup', up);
    row.addEventListener('pointercancel', up);
    row.addEventListener('click', click, true);
    return () => {
      ro.disconnect();
      row.removeEventListener('scroll', edges);
      row.removeEventListener('pointerdown', down);
      row.removeEventListener('pointermove', move);
      row.removeEventListener('pointerup', up);
      row.removeEventListener('pointercancel', up);
      row.removeEventListener('click', click, true);
    };
  }, [subLinks]);

  // Close the open menu on Escape or a click anywhere outside the nav
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null);
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [openMenu]);

  return (
    <>
      <header
        ref={headerRef}
        className={`nav${tone !== 'light' ? ` nav--${tone}` : ''}${subLinks ? ' nav--sub' : ''}${scrolled ? ' is-scrolled' : ''}${openMenu ? ' is-open' : ''}${condensed && !openMenu && !peek ? ' is-condensed' : ''}${hidden && !openMenu && !peek ? ' is-hidden' : ''}`}
        data-hide-after={hideBarAfter}
        data-bar-hidden-in={barHiddenIn?.join(',')}
        onPointerLeave={scheduleClose}
        onPointerEnter={cancelClose}
      >
        <nav ref={barRef} className="nav__inner" aria-label="Main">
          <div className="nav__links">
            {PRIMARY_LINKS.map(({ label, menu, href = '#', caret = true }) =>
              menu && href !== '#' ? (
                <span key={label} className="nav__split" onPointerEnter={hoverOpen(menu)}>
                  <a href={href} className={`nav__link${openMenu === menu ? ' is-active' : ''}`}>
                    <span>{label}</span>
                  </a>
                  <button
                    type="button"
                    className={`nav__link nav__caret${openMenu === menu ? ' is-active' : ''}`}
                    aria-label={`${label} menu`}
                    aria-expanded={openMenu === menu}
                    aria-controls={menuId(menu)}
                    onClick={() => toggleMenu(menu)}
                  >
                    <Caret />
                  </button>
                </span>
              ) : menu ? (
                <button
                  key={label}
                  type="button"
                  className={`nav__link${openMenu === menu ? ' is-active' : ''}`}
                  aria-expanded={openMenu === menu}
                  aria-controls={menuId(menu)}
                  onPointerEnter={hoverOpen(menu)}
                  onClick={() => toggleMenu(menu)}
                >
                  <span>{label}</span>
                  {caret && <Caret />}
                </button>
              ) : (
                <a key={label} href={href} className="nav__link">
                  <span>{label}</span>
                </a>
              ),
            )}
          </div>

          <a href="/v2" className="nav__logo" aria-label="EPIISOD home" onPointerEnter={scheduleClose}>
            <Icon light={logoLight} dark={logoDark} size={48} />
          </a>

          <div className="nav__links nav__links--end" onPointerEnter={scheduleClose}>
            <div className="nav__actions">
              {NAV_VARIANT === 'b' && (
                <a href="/about" className="nav__link">
                  <span>About us</span>
                </a>
              )}
              {NAV_VARIANT === 'b' && <LanguageSelect onOpen={() => setOpenMenu(null)} />}
              <a href="#" className="nav__link">
                <span>Log in</span>
              </a>
              {NAV_VARIANT === 'a' && <LanguageSelect onOpen={() => setOpenMenu(null)} />}
              <a href="#" className="nav__cta">
                Book a room
              </a>
            </div>
            {/* Option B has no hamburger on desktop; it remains the navigation on tablets and phones */}
            <button
              type="button"
              className={`nav__menu${NAV_VARIANT === 'b' ? ' nav__menu--small-screens' : ''}`}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={panelOpen}
              onClick={() => {
                setOpenMenu(null);
                setPanelOpen(true);
              }}
            >
              <Icon light={menuLight} dark={menuDark} size={40} />
            </button>
          </div>
        </nav>

        <MegaMenu activeId={openMenu && menuId(openMenu)}>
          <LifeMenu
            id={menuId('life')}
            open={openMenu === 'life'}
            onNavigate={() => setOpenMenu(null)}
          />
          <LocationsMenu
            id={menuId('locations')}
            open={openMenu === 'locations'}
            onNavigate={() => setOpenMenu(null)}
          />
          <ContactMenu
            id={menuId('contact')}
            open={openMenu === 'contact'}
            onNavigate={() => setOpenMenu(null)}
          />
        </MegaMenu>

        {subLinks && (
          <nav ref={subRef} className="nav__sub" aria-label="On this page">
            {subLinks.map(({ label, target }) => (
              <a
                key={target}
                href={`#${target}`}
                // So a mouse drag moves the row rather than picking up the link
                draggable={false}
                className={`nav__link nav__sub-link${target === currentSub ? ' is-current' : ''}`}
                aria-current={target === currentSub ? 'location' : undefined}
                onClick={(e) => {
                  // Handled here, not by Lenis's anchor scrolling, so the section clears the bar
                  e.preventDefault();
                  e.stopPropagation();
                  scrollToSection(target);
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>
      {/* Outside the header: its hide-on-scroll transform would carry a fixed overlay */}
      <HamburgerMenu open={panelOpen} onClose={closePanel} />
    </>
  );
}
