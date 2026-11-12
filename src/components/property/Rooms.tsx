import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import VLine from '../VLine';
import FilterTabs from './FilterTabs';
import RoomSearchBar from '../rooms/RoomSearchBar';
import { NO_FILTERS, TERMS, roomsOf, searchRooms, type CityId, type Filters } from '../rooms/roomSearch';
import { PROPERTIES } from '../locationData';
import { useExitParallax } from '../../lib/useExitParallax';
import { ScrollTrigger, scrollToY } from '../../lib/smoothScroll';
import roomsLine from '../../assets/property/rooms-line.svg';
import sortIcon from '../../assets/property/icon-sort.svg';
import tagLightning from '../../assets/property/rooms/tag-lightning.svg';
import tagStar from '../../assets/property/rooms/tag-star.svg';
import tagTag from '../../assets/property/rooms/tag-tag.svg';
import tagProhibit from '../../assets/property/rooms/tag-prohibit.svg';
import tagGift from '../../assets/property/rooms/tag-gift.svg';
import type { PropertyContent, Room, RoomTag, RoomType } from './propertyContent';
import type { RoomDetails } from './roomDetails';
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
type ListedRoom = Room & { weekly?: number | undefined };

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

/** Room card (Figma 539:30859): photo with a status tag, type, name, views and price; opens the room's page. */
function RoomCard({
  room,
  currency,
  index,
  href,
  detail,
  opening,
}: {
  room: ListedRoom;
  currency: string;
  index: number;
  href?: string;
  /** The list view's size, views, key features and summary. */
  detail?: RoomDetails;
  /** Before bookings open: shown in place of the price. */
  opening?: string;
}) {
  const tagId = room.available ? room.tag : 'soldOut';
  const tag = tagId ? TAGS[tagId] : undefined;
  const Card = href ? 'a' : 'article';
  return (
    <Card
      href={href}
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
          {detail && (
            <div className="room-card__more">
              <p className="room-card__meta">
                <span>{detail.size.split(' (')[0]}</span>
                {detail.views.length > 0 && <span>{detail.views.join(' · ')} views</span>}
              </p>
              <p className="room-card__summary">{detail.description}</p>
              {detail.keyFeatures.length > 0 && (
                <ul className="room-card__chips">
                  {detail.keyFeatures.slice(0, 4).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {opening ? (
          <p className="room-card__price room-card__price--opening">
            <span className="room-card__from">{opening}</span>
            <span className="room-card__register">Register interest</span>
          </p>
        ) : room.weekly !== undefined ? (
          <p className="room-card__price">
            <span className="room-card__from">From</span>
            <span className="room-card__amount">
              {currency} {room.weekly}
            </span>
            <span className="room-card__unit">wk / person</span>
          </p>
        ) : (
          <p className="room-card__price room-card__price--soon">Pricing coming soon</p>
        )}
      </div>
    </Card>
  );
}

/**
 * Rooms (Figma 1080:5710): the heading, the five room filters (City, Institution, Room
 * types, Price range, Term: the Find a room page's, with the property's city fixed), then
 * the room grid with its availability switch, sort and Studio / Shared tabs. The filters
 * apply when Search rooms is pressed; the tabs, switch and sort apply at once. A term
 * shows that term's prices and only the rooms it offers. Changing a filter while scrolled
 * into the list keeps the view on the top of the list, however much shorter it gets. The
 * hand-over to the next section only dims.
 */
export default function Rooms({ id, content }: { id: string; content: PropertyContent }) {
  const propertyId = PROPERTIES.find((p) => `${content.brand} ${content.place}` === p.name)?.id ?? '';
  const cityId = content.city.toLowerCase() as CityId;
  const base: Filters = { ...NO_FILTERS, city: cityId };
  const listing = useMemo(() => roomsOf(content, propertyId), [content, propertyId]);
  // `draft` is what the fields show; `applied` is what the list uses
  const [draft, setDraft] = useState<Filters>(base);
  const [applied, setApplied] = useState<Filters>(base);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortId>('asc');
  const [menu, setMenu] = useState<'sort' | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const sectionRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  /** Set when a filter changes while the list is scrolled under the pinned fields. */
  const anchorToList = useRef(false);
  useExitParallax(sectionRef, { drift: false });

  const closeMenu = useRef(() => setMenu(null)).current;
  useDismiss(menu === 'sort', sortRef, closeMenu);

  const type = applied.type || ALL;
  // The chosen term's stay on this property, for the room pages' links
  const stay = content.stays.find((s) => TERMS.find((t) => t.id === applied.term)?.stayIds.includes(s.id)) ?? null;

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

  // The rooms for the filters, at the property's list price when no term is chosen
  const rooms = useMemo<ListedRoom[]>(
    () =>
      // Before opening there are no prices, so a term or price range would match nothing
      searchRooms(listing, content.opening ? { ...applied, term: '', price: '' } : applied, 'list')
        .map(({ room, weekly }): ListedRoom | null => {
          const card = content.rooms.find((r) => r.id === room.roomId);
          return card ? { ...card, weekly } : null;
        })
        .filter((r): r is ListedRoom => !!r)
        .filter((r) => !availableOnly || r.available)
        .sort((a, b) => {
          // Rooms without a price yet go last
          if (a.weekly === undefined || b.weekly === undefined) return Number(a.weekly === undefined) - Number(b.weekly === undefined);
          return sort === 'asc' ? a.weekly - b.weekly : b.weekly - a.weekly;
        }),
    [content, listing, applied, availableOnly, sort],
  );

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

  // A room's page, carrying over the chosen term and date
  const roomHref = (roomId: string) => {
    const slug = content.roomDetails.find((d) => d.roomId === roomId)?.slug;
    if (!slug) return undefined;
    const params = new URLSearchParams();
    if (stay) params.set('term', stay.id);
    const query = params.toString();
    return `${window.location.pathname.replace(/\/$/, '')}/${slug}${query ? `?${query}` : ''}`;
  };
  // Re-keying the grid replays the cards' entrance whenever the list changes
  const listKey = rooms.map((r) => `${r.id}:${r.weekly ?? 'x'}`).join(',');

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
          <div ref={searchRef} className="rooms__search">
            <RoomSearchBar
              value={draft}
              lockedCity={cityId}
              onChange={setDraft}
              onSearch={() => changeFilter(() => setApplied(draft))}
              onClear={() =>
                changeFilter(() => {
                  setDraft(base);
                  setApplied(base);
                })
              }
            />
          </div>
        </div>

        <div ref={resultsRef} className="rooms__results">
          <div className="rooms__toolbar">
            <div className="rooms__controls">
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
              <div className="rooms__view" role="group" aria-label="Layout">
                <button
                  type="button"
                  className={`rooms__view-button${view === 'grid' ? ' is-on' : ''}`}
                  aria-pressed={view === 'grid'}
                  aria-label="Grid view"
                  onClick={() => setView('grid')}
                >
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="3" width="5.5" height="5.5" rx="1" />
                    <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" />
                    <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" />
                    <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`rooms__view-button${view === 'list' ? ' is-on' : ''}`}
                  aria-pressed={view === 'list'}
                  aria-label="List view"
                  onClick={() => setView('list')}
                >
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
                    <path d="M3.5 5h13M3.5 10h13M3.5 15h13" />
                  </svg>
                </button>
              </div>
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
            </div>

            <FilterTabs
              className="rooms__types"
              label="Room type"
              options={[ALL, 'Studio', 'Shared']}
              value={type}
              onChange={(t) =>
                changeFilter(() => {
                  const next = (t === ALL ? '' : t) as '' | RoomType;
                  setApplied((f) => ({ ...f, type: next }));
                  setDraft((f) => ({ ...f, type: next }));
                })
              }
            />
          </div>

          <div key={`${listKey}:${view}`} className={`rooms__grid${view === 'list' ? ' is-list' : ''}`} aria-live="polite">
            {rooms.map((room, i) => (
              <RoomCard
                key={room.id}
                room={room}
                currency={content.roomCurrency}
                index={i}
                href={roomHref(room.id)}
                opening={content.opening}
                detail={view === 'list' ? content.roomDetails.find((d) => d.roomId === room.id) : undefined}
              />
            ))}
          </div>
          {rooms.length === 0 && <p className="rooms__empty">No rooms match these filters.</p>}
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
