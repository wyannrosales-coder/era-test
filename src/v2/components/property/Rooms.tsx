import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import VLine from '../VLine';
import FilterTabs from './FilterTabs';
import { useExitParallax } from '../../lib/useExitParallax';
import { ScrollTrigger, scrollToY } from '../../../lib/smoothScroll';
import roomsLine from '../../../assets/property/rooms-line.svg';
import hourglass from '../../../assets/v2/property/icon-calendar.svg';
import calendarBlank from '../../../assets/v2/property/icon-calendar-check.svg';
import funnelIcon from '../../../assets/v2/property/icon-funnel.svg';
import xIcon from '../../../assets/v2/property/icon-x.svg';
import sortIconV2 from '../../../assets/v2/property/icon-sort.svg';
import caretDown from '../../../assets/property/caret-down-grey.svg';
import closeIcon from '../../../assets/property/location/icon-close.svg';
import sortIcon from '../../../assets/property/icon-sort.svg';
import tagLightning from '../../../assets/property/rooms/tag-lightning.svg';
import tagStar from '../../../assets/property/rooms/tag-star.svg';
import tagTag from '../../../assets/property/rooms/tag-tag.svg';
import tagProhibit from '../../../assets/property/rooms/tag-prohibit.svg';
import tagGift from '../../../assets/property/rooms/tag-gift.svg';
import { onStayChoiceRestored, readStayChoice, saveRoomsSpot, saveStayChoice } from '../../lib/stayChoice';
import type { PropertyContent, Room, RoomTag, Stay } from './propertyContent';
import './Rooms.css';

const ALL = 'All';
const TAGS: Record<RoomTag, { label: string; icon: string }> = {
  offer: { label: 'Exclusive Offer', icon: tagLightning },
  popular: { label: 'Popular Choice', icon: tagStar },
  promotion: { label: 'Promotion', icon: tagTag },
  soldOut: { label: 'Sold Out', icon: tagProhibit },
  value: { label: 'Best Value', icon: tagGift },
};
const SORTS = [
  { id: 'asc', label: 'Price: Low - High' },
  { id: 'desc', label: 'Price: High - Low' },
] as const;
type SortId = (typeof SORTS)[number]['id'];

/** A room as listed: its price for the chosen stay and date. */
type ListedRoom = Room & { weekly: number };

/** Today as an ISO date (local time). */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
/** The chosen stay, short enough for the field: "AY 2027 · 52 weeks", "Short Stay · min 12 weeks". */
const stayName = (s: Stay) =>
  s.group === 'Short Stay'
    ? `Short Stay · ${s.label.replace(/^Min (\d+ weeks).*/, 'min $1')}`
    : `${s.group.replace('Academic Year', 'AY')} · ${s.label}`;
const opensOn = (s: Stay, date: string) => date >= s.checkIn.from && date <= s.checkIn.to;

/** Closes a popover on a click elsewhere or Escape. */
function useDismiss(open: boolean, ref: RefObject<HTMLElement>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, ref, close]);
}

/** A search field (Figma 1080:5725): icon, value or placeholder, then a caret or a clear cross. */
function Field({
  icon,
  label,
  value,
  open,
  onOpen,
  onClear,
  children,
}: {
  icon: string;
  label: string;
  value: string | null;
  open?: boolean;
  onOpen: () => void;
  onClear: () => void;
  children?: ReactNode;
}) {
  return (
    <div className={`rooms__field${value ? ' has-value' : ''}${open ? ' is-open' : ''}`}>
      <button type="button" className="rooms__field-button" aria-expanded={open} onClick={onOpen}>
        <img src={icon} width={24} height={24} alt="" />
        <span className="rooms__field-text">
          {value ?? label}
          {value && <span className="visually-hidden">, {label}</span>}
        </span>
        {!value && <img src={caretDown} width={24} height={24} alt="" />}
      </button>
      {value && (
        <button type="button" className="rooms__field-clear" aria-label={`Clear ${label.toLowerCase()}`} onClick={onClear}>
          <img src={closeIcon} width={20} height={20} alt="" />
        </button>
      )}
      {children}
    </div>
  );
}

/** Room card (Figma 539:30859): photo with a status tag, type, name, views and price; opens the room's page. */
function RoomCard({
  room,
  currency,
  index,
  href,
  onOpen,
  opening,
}: {
  room: ListedRoom;
  currency: string;
  index: number;
  href?: string;
  onOpen?: (card: HTMLElement) => void;
  /** Before bookings open: shown in place of the price. */
  opening?: string;
}) {
  const tagId = room.available ? room.tag : 'soldOut';
  const tag = tagId && TAGS[tagId];
  const Card = href ? 'a' : 'article';
  return (
    <Card
      href={href}
      data-room-id={room.id}
      onClick={onOpen && ((e: MouseEvent<HTMLElement>) => onOpen(e.currentTarget))}
      className={`room-card${room.available ? '' : ' is-sold-out'}`}
      style={{ '--i': Math.min(index, 7) } as CSSProperties}
    >
      <div className="room-card__image">
        <img src={room.image} alt="" />
        {tag && (
          <span className={`room-card__tag room-card__tag--${tagId}`}>
            <img src={tag.icon} width={16} height={16} alt="" />
            {tag.label}
          </span>
        )}
      </div>
      <div className="room-card__body">
        <div className="room-card__heading">
          <p className="room-card__type">{room.typeLabel}</p>
          <h3 className="type-h4 room-card__name">{room.name}</h3>
          {/* Kept even when empty so every card's price lines up */}
          <p className={`room-card__features${room.features ? '' : ' is-empty'}`}>
            {room.features ?? ' '}
          </p>
        </div>
        {opening ? (
          <p className="room-card__price room-card__price--opening">
            <span className="room-card__from">{opening}</span>
            <span className="room-card__register">Register interest</span>
          </p>
        ) : (
          <p className="room-card__price">
            <span className="room-card__from">From</span>
            <span className="room-card__amount">
              {currency} {room.weekly}
            </span>
            <span className="room-card__unit">wk / person</span>
          </p>
        )}
      </div>
    </Card>
  );
}

/**
 * Rooms (Figma 1080:5710): the heading, the length-of-stay and check-in fields, then the
 * room grid with its availability switch, sort and Studio / Shared tabs. Every control
 * updates the list as soon as it changes: a length of stay shows that term's prices and
 * only the rooms it offers, and limits check-in to its window; a check-in date on its own
 * shows the rooms open that day at their lowest price. While the rooms scroll past, the two
 * fields stay pinned under the sub-navigation on a white band (Figma 1182:17147). Changing
 * a filter while scrolled into the list keeps the view on the top of the list, however
 * much shorter it gets. The hand-over to the next section only dims — a drift would carry
 * the pinned fields.
 */
export default function Rooms({ id, content }: { id: string; content: PropertyContent }) {
  const [type, setType] = useState(ALL);
  const [availableOnly, setAvailableOnly] = useState(false);
  // The stay and date chosen earlier here or on a room page (see lib/stayChoice)
  const [initialChoice] = useState(() => readStayChoice(content.place));
  const [stayId, setStayId] = useState<string | null>(() =>
    content.stays.some((s) => s.id === initialChoice.stayId) ? initialChoice.stayId : null,
  );
  const [date, setDate] = useState<string | null>(initialChoice.date);
  useEffect(() => saveStayChoice(content.place, { stayId, date }), [content.place, stayId, date]);
  useEffect(
    () =>
      onStayChoiceRestored(content.place, (c) => {
        setStayId(content.stays.some((s) => s.id === c.stayId) ? c.stayId : null);
        setDate(c.date);
      }),
    [content.place, content.stays],
  );
  /** null: the rooms in their own order (no sort chosen yet). */
  const [sort, setSort] = useState<SortId | null>(null);
  const [menu, setMenu] = useState<'stay' | 'sort' | null>(null);
  /** Phones (Figma 1455:20384): the filter panel and its not-yet-applied choices. */
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftSort, setDraftSort] = useState<SortId | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  /** Set when a filter changes while the list is scrolled under the pinned fields. */
  const anchorToList = useRef(false);
  useExitParallax(sectionRef, { drift: false });

  const closeMenu = useRef(() => setMenu(null)).current;
  useDismiss(menu === 'stay', searchRef, closeMenu);
  useDismiss(menu === 'sort', sortRef, closeMenu);
  const closeFilter = useRef(() => setFilterOpen(false)).current;
  useDismiss(filterOpen, filterRef, closeFilter);

  const openFilter = () => {
    setDraftAvailable(availableOnly);
    setDraftSort(sort);
    setMenu(null);
    setFilterOpen((o) => !o);
  };
  // Opened: bring the panel to the middle of the screen. Then scrolling back up closes it
  // (ignoring the centring scroll itself, and small wobbles).
  useEffect(() => {
    if (!filterOpen) return;
    let timer = 0;
    const raf = requestAnimationFrame(() => {
      const panel = filterRef.current?.querySelector<HTMLElement>('.rooms__filter-panel');
      if (!panel) return;
      const r = panel.getBoundingClientRect();
      scrollToY(window.scrollY + r.top + r.height / 2 - window.innerHeight / 2);
    });
    let settled = false;
    let lowest = window.scrollY;
    timer = window.setTimeout(() => {
      settled = true;
      lowest = window.scrollY;
    }, 1300);
    const onScroll = () => {
      if (!settled) return;
      lowest = Math.max(lowest, window.scrollY);
      if (window.scrollY < lowest - 40) setFilterOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [filterOpen]);

  const applyFilter = () => {
    changeFilter(() => {
      setAvailableOnly(draftAvailable);
      setSort(draftSort);
    });
    // Apply and Clear both apply and close. Closing it any other way (scrolling back up,
    // the cross, a tap outside) drops choices that weren't applied.
    setFilterOpen(false);
  };

  const stay = content.stays.find((s) => s.id === stayId) ?? null;
  // Check-in can't be in the past, nor outside the chosen stay's window
  const windows = stay ? [stay] : content.stays;
  const latest = (dates: string[]) => dates.reduce((a, b) => (b > a ? b : a));
  const minDate = latest([today(), ...windows.map((s) => s.checkIn.from).sort().slice(0, 1)]);
  const maxDate = latest(windows.map((s) => s.checkIn.to));

  /** Where the pinned fields end on screen: worked out from CSS, as the list may have moved. */
  const pinnedBottom = () => {
    const search = searchRef.current;
    if (!search) return 0;
    return (parseFloat(getComputedStyle(search).top) || 0) + search.offsetHeight + 16;
  };

  const changeFilter = (apply: () => void) => {
    const results = resultsRef.current;
    anchorToList.current = !!results && results.getBoundingClientRect().top < pinnedBottom();
    apply();
  };

  const chooseStay = (next: Stay | null) =>
    changeFilter(() => {
      setStayId(next?.id ?? null);
      // A date outside the new stay's window no longer applies
      if (next && date && !opensOn(next, date)) setDate(null);
      setMenu(null);
    });

  // The rooms for the chosen stay and date: with neither, the first stay's prices (as on
  // the live site); with only a date, every stay open that day, at its lowest price
  const rooms = useMemo<ListedRoom[]>(() => {
    const stays = stay ? [stay] : date ? content.stays.filter((s) => opensOn(s, date)) : null;
    return content.rooms
      .map((room) => {
        if (!stays) return { ...room, weekly: room.price };
        const prices = stays.map((s) => s.prices[room.id]).filter((p): p is number => p !== undefined);
        return prices.length ? { ...room, weekly: Math.min(...prices) } : null;
      })
      .filter((r): r is ListedRoom => !!r)
      .filter((r) => (type === ALL || r.type === type) && (!availableOnly || r.available))
      .sort((a, b) => (sort === null ? 0 : sort === 'asc' ? a.weekly - b.weekly : b.weekly - a.weekly));
  }, [content, stay, date, type, availableOnly, sort]);

  // After the list re-renders, put its top back right under the pinned fields, and
  // re-measure the scroll animations below, whose positions moved with the list's height
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Refresh first: it restores the scroll position it saw, which would undo the anchoring
    ScrollTrigger.refresh();
    const results = resultsRef.current;
    if (anchorToList.current && results) {
      scrollToY(window.scrollY + results.getBoundingClientRect().top - pinnedBottom(), { immediate: true });
    }
    anchorToList.current = false;
  }, [rooms]);

  const groups = [...new Set(content.stays.map((s) => s.group))];
  // A room's page, carrying over the chosen term and date
  const roomHref = (roomId: string) => {
    const slug = content.roomDetails.find((d) => d.roomId === roomId)?.slug;
    if (!slug) return undefined;
    const params = new URLSearchParams();
    if (stay) params.set('term', stay.id);
    if (date) params.set('date', date);
    const query = params.toString();
    return `${window.location.pathname.replace(/\/$/, '')}/${slug}${query ? `?${query}` : ''}`;
  };
  // Re-keying the grid replays the cards' entrance whenever the list changes
  const listKey = rooms.map((r) => `${r.id}:${r.weekly}`).join(',');

  const openDate = () => {
    const input = dateRef.current;
    if (!input) return;
    setMenu(null);
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  return (
    <section ref={sectionRef} className="rooms exit-parallax" id={id}>
      <div className="rooms__content">
        <div className="rooms__overview">
          <VLine src={roomsLine} length={60} />
          <div className="heading-group rooms__heading">
            <p className="eyebrow">Rooms</p>
            <h2 className="type-h2 rooms__title">
              Find your <em>space</em>
            </h2>
          </div>

          {/* TODO: connect to the booking engine */}
          <div ref={searchRef} className="rooms__search" role="search" aria-label="Find a room">
            <Field
              icon={hourglass}
              label="Length of Stay"
              value={stay && stayName(stay)}
              open={menu === 'stay'}
              onOpen={() => setMenu((m) => (m === 'stay' ? null : 'stay'))}
              onClear={() => chooseStay(null)}
            >
              {menu === 'stay' && (
                <div
                  className="rooms__menu rooms__stays"
                  role="listbox"
                  aria-label="Preferred length of stay"
                  data-lenis-prevent
                >
                  {groups.map((group) => (
                    <div key={group} className="rooms__stay-group" role="group" aria-label={group}>
                      <p className="rooms__stay-heading">{group.replace('Academic Year', 'AY')}</p>
                      {content.stays
                        .filter((s) => s.group === group)
                        .map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            role="option"
                            aria-selected={s.id === stayId}
                            className={`rooms__option${s.id === stayId ? ' is-current' : ''}`}
                            onClick={() => chooseStay(s)}
                          >
                            {s.label}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <Field
              icon={calendarBlank}
              label="Check-in Date"
              value={date && formatDate(date)}
              onOpen={openDate}
              onClear={() => changeFilter(() => setDate(null))}
            >
              <input
                ref={dateRef}
                className="rooms__date-input"
                type="date"
                tabIndex={-1}
                aria-hidden
                min={minDate}
                max={maxDate}
                value={date ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  changeFilter(() => setDate(value && value >= minDate && value <= maxDate ? value : null));
                }}
              />
            </Field>
          </div>
          {stay && (
            <p className="rooms__window" aria-live="polite">
              Check-in from {formatDate(stay.checkIn.from < today() ? today() : stay.checkIn.from)} to{' '}
              {formatDate(stay.checkIn.to)}
            </p>
          )}
        </div>

        <div ref={resultsRef} className="rooms__results">
          <div className="rooms__toolbar">
            {/* v2 (Figma 1455:18357): room types on the left, Sort and the toggle on the right */}
            <FilterTabs
              className="rooms__types"
              label="Room type"
              options={[ALL, 'Studio', 'Shared']}
              value={type}
              onChange={(t) => changeFilter(() => setType(t))}
            />
            {/* Phones: Sort and the switch move into a filter panel behind this button */}
            <div ref={filterRef} className="rooms__filter">
              <button
                type="button"
                className={`rooms__filter-button${filterOpen ? ' is-open' : ''}`}
                aria-label="Filter rooms"
                aria-expanded={filterOpen}
                onClick={openFilter}
              >
                <img src={funnelIcon} width={24} height={24} alt="" />
              </button>
              {filterOpen && (
                <div className="rooms__filter-panel" role="dialog" aria-label="Filter rooms" data-lenis-prevent>
                  <div className="rooms__filter-head">
                    <img src={funnelIcon} width={24} height={24} alt="" />
                    <span>Filter</span>
                    <button type="button" className="rooms__filter-close" aria-label="Close" onClick={closeFilter}>
                      <img src={xIcon} width={24} height={24} alt="" />
                    </button>
                  </div>
                  <label className="rooms__available rooms__filter-row">
                    <span>Available rooms only</span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={draftAvailable}
                      onChange={(e) => setDraftAvailable(e.target.checked)}
                    />
                    <span className="rooms__switch" aria-hidden />
                  </label>
                  {!content.opening && (
                    <>
                  <hr className="rooms__filter-rule" />
                  <p className="rooms__filter-sort">
                    <img src={sortIconV2} width={24} height={24} alt="" />
                    Sort
                  </p>
                  <div className="rooms__filter-options">
                    {SORTS.map((o) => (
                      <label key={o.id} className="rooms__filter-option">
                        <span>{o.label.replace(' - ', ' to ').replace('Low to High', 'Low to high').replace('High to Low', 'High to low')}</span>
                        <input
                          type="checkbox"
                          checked={draftSort === o.id}
                          onChange={(e) => setDraftSort(e.target.checked ? o.id : null)}
                        />
                      </label>
                    ))}
                  </div>
                    </>
                  )}
                  <div className="rooms__filter-actions">
                    <button
                      type="button"
                      className="rooms__filter-clear"
                      onClick={() => {
                        // Clears and applies at once, then closes
                        setDraftAvailable(false);
                        setDraftSort(null);
                        changeFilter(() => {
                          setAvailableOnly(false);
                          setSort(null);
                        });
                        setFilterOpen(false);
                      }}
                    >
                      Clear
                    </button>
                    <button type="button" className="rooms__filter-apply" onClick={applyFilter}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="rooms__controls">
              {/* No prices before opening: nothing to sort by */}
              {!content.opening && (
              <div ref={sortRef} className="rooms__sort">
                <button
                  type="button"
                  className="rooms__sort-button"
                  aria-expanded={menu === 'sort'}
                  onClick={() => setMenu((m) => (m === 'sort' ? null : 'sort'))}
                >
                  <img src={sortIcon} width={24} height={24} alt="" />
                  Sort
                </button>
                {menu === 'sort' && (
                  <div className="rooms__menu rooms__sorts" role="listbox" aria-label="Sort rooms">
                    {SORTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        role="option"
                        aria-selected={s.id === sort}
                        className={`rooms__option${s.id === sort ? ' is-current' : ''}`}
                        onClick={() => {
                          setSort(s.id);
                          setMenu(null);
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}
              <label className="rooms__available">
                <input
                  type="checkbox"
                  role="switch"
                  checked={availableOnly}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    changeFilter(() => setAvailableOnly(checked));
                  }}
                />
                <span className="rooms__switch" aria-hidden />
                Available rooms only
              </label>
            </div>

          </div>

          <div key={listKey} className="rooms__grid" aria-live="polite">
            {rooms.map((room, i) => (
              <RoomCard
                key={room.id}
                room={room}
                currency={content.roomCurrency}
                index={i}
                href={roomHref(room.id)}
                opening={content.opening}
                onOpen={(card) => saveRoomsSpot(content.place, { roomId: room.id, top: card.getBoundingClientRect().top })}
              />
            ))}
          </div>
          {rooms.length === 0 && (
            <p className="rooms__empty">
              {date && !stay
                ? `No rooms open for check-in on ${formatDate(date)}. Try another date, or choose a length of stay to see its check-in dates.`
                : 'No rooms match these filters.'}
            </p>
          )}
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
