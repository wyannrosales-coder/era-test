import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import RoomSearchBar from '../components/rooms/RoomSearchBar';
import {
  ALL_ROOMS,
  CITIES,
  INSTITUTIONS,
  NO_FILTERS,
  PRICE_RANGES,
  ROOM_TYPES,
  TERMS,
  changeFilters,
  searchRooms,
  type Filters,
  type Result,
} from '../components/rooms/roomSearch';
import bannerImage from '../assets/property/hero.jpg';
import './FindRoomPage.css';

const PARAMS = ['city', 'institution', 'type', 'price', 'term'] as const;

/** Filters from the address (?city=sydney&term=4175…), ignoring anything unknown. */
function filtersFromUrl(): Filters {
  const q = new URLSearchParams(window.location.search);
  const pick = <T extends string>(key: string, valid: readonly T[]) => {
    const v = q.get(key) ?? '';
    return (valid as readonly string[]).includes(v) ? (v as T) : ('' as const);
  };
  const city = pick('city', CITIES.map((c) => c.id));
  return changeFilters(NO_FILTERS, {
    city,
    institution: pick('institution', INSTITUTIONS.map((i) => i.id)),
    type: pick('type', ROOM_TYPES.map((t) => t.id)),
    price: pick('price', PRICE_RANGES.map((p) => p.id)),
    term: pick('term', TERMS.map((t) => t.id)),
  });
}

function urlFor(f: Filters) {
  const q = new URLSearchParams();
  for (const k of PARAMS) if (f[k]) q.set(k, f[k]);
  const s = q.toString();
  return `${window.location.pathname}${s ? `?${s}` : ''}`;
}

/** A room's card: photo with its property, then type · city, name, size and price. */
function Card({ result, term, index }: { result: Result; term: string; index: number }) {
  const { room, weekly } = result;
  const href =
    room.href && term ? `${room.href}?term=${term}` : (room.href ?? `/contact?property=${room.propertyId}`);
  return (
    <a
      className={`find-card${room.available ? '' : ' is-sold-out'}`}
      href={href}
      style={{ '--i': Math.min(index, 7) } as CSSProperties}
    >
      <span className="find-card__image">
        <img src={room.image} alt="" loading="lazy" />
        <span className="find-card__property">{room.property}</span>
      </span>
      <span className="find-card__body">
        <span className="find-card__type">
          {room.typeLabel} · {room.city}
        </span>
        <span className="find-card__name">{room.name}</span>
        {room.size && <span className="find-card__size">{room.size}</span>}
        {room.opening ? (
          <span className="find-card__enquire">{room.opening} · Register interest</span>
        ) : weekly !== undefined ? (
          <span className="find-card__price">
            <span className="find-card__from">From</span>
            <span className="find-card__amount">
              {room.currency}
              {weekly}
            </span>
            <span className="find-card__unit">/ wk{room.type === 'Shared' ? ' / person' : ''}</span>
          </span>
        ) : (
          <span className="find-card__enquire">Enquire for pricing</span>
        )}
      </span>
    </a>
  );
}

/**
 * Find a room: every room across every EPIISOD, filtered by City, Institution, Room types,
 * Price range and Term (after epiisod.com/en-au/find-a-room). The filters are kept in the
 * address, so a search can be shared and the back button restores it.
 */
export default function FindRoomPage() {
  const initial = useMemo(filtersFromUrl, []);
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const results = useMemo(() => searchRooms(ALL_ROOMS, applied), [applied]);
  const lowest = results.reduce<number | undefined>(
    (min, { weekly }) => (weekly === undefined ? min : min === undefined ? weekly : Math.min(min, weekly)),
    undefined,
  );

  const run = (f: Filters) => {
    setApplied(f);
    window.history.replaceState(null, '', urlFor(f));
  };

  return (
    <>
      <Nav />
      <main className="find-page">
        <header className="find-page__hero">
          <img className="find-page__hero-image" src={bannerImage} alt="" />
          <div className="find-page__hero-overlay" aria-hidden />
          <div className="find-page__hero-inner">
            <p className="eyebrow find-page__eyebrow">Find a room</p>
            <h1 className="type-h1 find-page__title">
              Every room, across every <em>EPIISOD.</em>
            </h1>
            <RoomSearchBar
              className="room-search--hero find-page__search"
              value={draft}
              onChange={setDraft}
              onSearch={() => run(draft)}
              onClear={() => {
                setDraft(NO_FILTERS);
                run(NO_FILTERS);
              }}
            />
          </div>
        </header>

        <section className="find-page__body" aria-label="Rooms">
          <p className="find-page__count" aria-live="polite">
            {results.length} {results.length === 1 ? 'room matches' : 'rooms match'}
            {lowest !== undefined && <> · from AU${lowest} / wk</>}
          </p>

          {results.length ? (
            <div className="find-page__grid">
              {results.map((r, i) => (
                <Card key={`${r.room.key}:${r.weekly}`} result={r} term={applied.term} index={i} />
              ))}
            </div>
          ) : (
            <div className="find-page__empty">
              <h2 className="type-h3">No rooms match those filters.</h2>
              <p>Try another city, term or price range — or clear the filters to see every room.</p>
              <button
                type="button"
                className="room-search__clear"
                onClick={() => {
                  setDraft(NO_FILTERS);
                  run(NO_FILTERS);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
