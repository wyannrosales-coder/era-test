import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import PropertyMap from './PropertyMap';
import type { MapMarker } from './PropertyMap';
import { PLACE_CATEGORIES } from './placeCategories';
import { useExitParallax } from '../../lib/useExitParallax';
import { setScrollLocked } from '../../lib/smoothScroll';
import pin from '../../assets/property/icon-location-pin.svg';
import searchIcon from '../../assets/property/location/icon-search.svg';
import closeIcon from '../../assets/property/location/icon-close.svg';
import type { PropertyContent } from './propertyContent';
import './PropertyLocation.css';

/** Straight-line distance (km) between two points. */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** "450 m", "2.4 km", "18 km" */
function formatDistance(km: number) {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

/** Near enough to walk: "6 min walk" (about 4.5 km/h, in a straight line). */
const walkTime = (km: number) => (km <= 2 ? `${Math.max(1, Math.round(km / 0.075))} min walk` : '');

/** The distances the list can be limited to (km); null is any. */
const DISTANCES: { km: number | null; label: string }[] = [
  { km: null, label: 'Any' },
  { km: 0.5, label: '500 m' },
  { km: 1, label: '1 km' },
  { km: 2, label: '2 km' },
  { km: 5, label: '5 km' },
];

/** When nothing limits the distance, the map frames the places this close (km), if any. */
const FRAME_KM = 2.5;

type ListedPlace = MapMarker & { source: string; km: number; walk: string };

const iconStyle = (icon: string) => ({ '--icon': `url('${icon}')` }) as CSSProperties;

/**
 * Location (Figma 1080:5903): the address, then the neighbourhood map. Every notable place
 * nearby is marked on it from the start, with its category's icon; places close together
 * gather into numbered clusters until zoomed in. Over the map's top, chips filter by kind of
 * place (any number at once) and the list beside the map, nearest first, filters further by
 * distance and name. Pointing at a place in the list lights its marker, and choosing one
 * moves the map to it and opens its card (photo, address, directions).
 *
 * Phones: the map shows the chips and every marker; a button at its foot opens it full
 * screen with the list rising from the bottom.
 */
export default function PropertyLocation({ id, content }: { id: string; content: PropertyContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const picks = useRef(0);
  useExitParallax(sectionRef);

  /** The kinds of place chosen (content category names); none means all of them. */
  const [kinds, setKinds] = useState<string[]>([]);
  const [maxKm, setMaxKm] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  /** The place under the pointer in the list, and the one chosen. */
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);
  /** Larger screens: the list is shown beside the map (it can be folded away). */
  const [listOpen, setListOpen] = useState(true);
  const [phone, setPhone] = useState(() => window.matchMedia('(max-width: 700px)').matches);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 1000px)').matches);
  /** Phones: the map fills the screen, with the list at its foot. */
  const [full, setFull] = useState(false);
  const isFull = phone && full;

  useEffect(() => {
    const phoneQuery = window.matchMedia('(max-width: 700px)');
    const narrowQuery = window.matchMedia('(max-width: 1000px)');
    const update = () => {
      setPhone(phoneQuery.matches);
      setNarrow(narrowQuery.matches);
    };
    phoneQuery.addEventListener('change', update);
    narrowQuery.addEventListener('change', update);
    return () => {
      phoneQuery.removeEventListener('change', update);
      narrowQuery.removeEventListener('change', update);
    };
  }, []);

  // Full screen: the page stays still behind it; Escape closes it
  useEffect(() => {
    if (!isFull) return;
    setScrollLocked(true);
    // The chat button would sit over the list
    document.body.classList.add('map-is-full');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeFull();
    document.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      document.body.classList.remove('map-is-full');
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFull]);

  // Every place, with its kind and distance
  const everything = useMemo<ListedPlace[]>(() => {
    const list: ListedPlace[] = [];
    PLACE_CATEGORIES.forEach((kind) => {
      content.mapPlaces
        .find((c) => c.name === kind.source)
        ?.places.forEach((place, index) => {
          const km = distanceKm(content.mapCenter, place);
          list.push({
            id: `${kind.source}-${index}`,
            source: kind.source,
            category: kind.name,
            icon: kind.icon,
            place,
            km,
            distance: formatDistance(km),
            walk: walkTime(km),
          });
        });
    });
    return list;
  }, [content]);

  // The kinds this property has places for, with how many each has under the distance and
  // name chosen (so a chip shows what picking it adds)
  const needle = query.trim().toLowerCase();
  const withinReach = useMemo(
    () =>
      everything.filter(
        (p) =>
          (maxKm === null || p.km <= maxKm) &&
          (!needle || `${p.place.name} ${p.place.address} ${p.category}`.toLowerCase().includes(needle)),
      ),
    [everything, maxKm, needle],
  );
  const kindsHere = useMemo(
    () => PLACE_CATEGORIES.filter((k) => everything.some((p) => p.source === k.source)),
    [everything],
  );

  // What's shown on the map and in the list, nearest first
  const visible = useMemo(
    () => withinReach.filter((p) => !kinds.length || kinds.includes(p.source)).sort((a, b) => a.km - b.km),
    [withinReach, kinds],
  );
  const filtered = kinds.length > 0 || maxKm !== null || needle !== '';

  // A chosen place that a filter has taken away is no longer chosen
  useEffect(() => {
    if (selected && !visible.some((p) => p.id === selected)) setSelected(null);
  }, [visible, selected]);

  const toggleKind = (source: string) => setKinds((k) => (k.includes(source) ? k.filter((s) => s !== source) : [...k, source]));
  const clearFilters = () => {
    setKinds([]);
    setMaxKm(null);
    setQuery('');
  };

  const closeFull = () => {
    setFull(false);
    setHover(null);
  };

  const choose = (placeId: string) => {
    setSelected(placeId);
    setFocus({ id: placeId, n: ++picks.current });
  };

  // A marker clicked on the map: mark its place in the list and bring it into view
  const onMarkerClick = (placeId: string) => {
    setSelected(placeId);
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>(`[data-place="${placeId}"]`);
    if (list && item) {
      const top = item.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
      if (top < list.scrollTop || top + item.offsetHeight > list.scrollTop + list.clientHeight)
        list.scrollTo({ top: top - 48, behavior: 'smooth' });
    }
  };

  // The list starts from its top again when the filters change
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [kinds, maxKm, needle]);

  const panelWidth = narrow ? 320 : 400;
  const panelShown = isFull || (!phone && listOpen);
  // The corner of the map the list and chips cover, kept clear when framing places
  const inset = useMemo(
    () =>
      isFull
        ? { left: 0, top: 112, bottom: window.innerHeight * 0.44 + 16 }
        : phone
          ? { left: 0, top: 64, bottom: 72 }
          : { left: listOpen ? panelWidth + 48 : 0, top: 120 },
    [phone, isFull, listOpen, panelWidth],
  );

  // What the map frames: the places this close to the property (or, with a distance chosen,
  // all that are shown), so it opens on the neighbourhood rather than the far-off campuses
  const framePoints = useMemo(() => {
    if (maxKm !== null) return visible.map((p) => p.place);
    const near = visible.filter((p) => p.km <= FRAME_KM);
    return (near.length ? near : visible.slice(0, 5)).map((p) => p.place);
  }, [visible, maxKm]);
  const frameKey = `${[...kinds].sort().join(',')}|${maxKm}|${needle}|${isFull}|${phone}|${listOpen}`;

  const highlight = hover ?? selected;
  const heading = `${visible.length} ${visible.length === 1 ? 'place' : 'places'} nearby`;

  return (
    <section ref={sectionRef} className="property-location exit-parallax" id={id}>
      <div className="property-location__content" data-exit-content>
        <div className="property-location__header">
          <h2 className="type-h2 property-location__title">Location</h2>
          <p className="type-body-l property-location__address">
            <img src={pin} width={24} height={24} alt="" />
            {content.address}
          </p>
        </div>

        <div
          className={`property-location__map${isFull ? ' is-full' : ''}${panelShown && !phone ? ' has-panel' : ''}`}
          style={{ '--panel-w': `${panelWidth}px` } as CSSProperties}
        >
          <PropertyMap
            brand={content.brand}
            place={content.place}
            address={content.address.replace(/^[^,]+,\s*/, '')}
            center={content.mapCenter}
            markers={visible}
            frameKey={frameKey}
            framePoints={framePoints}
            inset={inset}
            highlight={highlight}
            focus={focus}
            full={isFull}
            onMarkerClick={onMarkerClick}
          />

          {isFull && (
            <button type="button" className="property-location__close" aria-label="Close map" onClick={closeFull}>
              <img src={closeIcon} width={24} height={24} alt="" />
            </button>
          )}

          {/* Filter by kind of place: any number at once */}
          <div className="place-chips" role="group" aria-label="Show places of these kinds" data-lenis-prevent>
            <button
              type="button"
              className={`place-chip${kinds.length === 0 ? ' is-on' : ''}`}
              aria-pressed={kinds.length === 0}
              onClick={() => setKinds([])}
            >
              All
              <span className="place-chip__count">{withinReach.length}</span>
            </button>
            {kindsHere.map((k) => {
              const count = withinReach.filter((p) => p.source === k.source).length;
              const on = kinds.includes(k.source);
              return (
                <button
                  key={k.source}
                  type="button"
                  className={`place-chip${on ? ' is-on' : ''}${count === 0 && !on ? ' is-empty' : ''}`}
                  aria-pressed={on}
                  aria-label={`${k.name}, ${count} ${count === 1 ? 'place' : 'places'}`}
                  onClick={() => toggleKind(k.source)}
                >
                  <i className="place-icon" style={iconStyle(k.icon)} aria-hidden />
                  {k.name}
                  <span className="place-chip__count">{count}</span>
                </button>
              );
            })}
          </div>

          {!phone && !listOpen && (
            <button type="button" className="place-fold place-fold--show" onClick={() => setListOpen(true)}>
              Show list
              <span className="place-chip__count">{visible.length}</span>
            </button>
          )}

          {phone && !full && (
            <button type="button" className="place-fold place-fold--phone" onClick={() => setFull(true)}>
              <img src={searchIcon} width={20} height={20} alt="" />
              View list
              <span className="place-chip__count">{visible.length}</span>
            </button>
          )}

          {panelShown && (
            <aside className="place-panel" aria-label="Places near the property">
              <header className="place-panel__head">
                <div>
                  <h3 className="place-panel__title" aria-live="polite">
                    {heading}
                  </h3>
                  <p className="place-panel__sub">Nearest first</p>
                </div>
                {filtered && (
                  <button type="button" className="place-panel__clear" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
                {!phone && (
                  <button
                    type="button"
                    className="place-panel__fold"
                    aria-label="Hide the list"
                    onClick={() => setListOpen(false)}
                  >
                    <img src={closeIcon} width={24} height={24} alt="" />
                  </button>
                )}
              </header>

              <label className="place-search">
                <img src={searchIcon} width={20} height={20} alt="" />
                <input
                  type="search"
                  placeholder="Search places"
                  aria-label="Search places by name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>

              <div className="place-distance" role="radiogroup" aria-label="Distance from the property">
                <span className="place-distance__label">Within</span>
                {DISTANCES.map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    role="radio"
                    aria-checked={maxKm === d.km}
                    className={`place-distance__option${maxKm === d.km ? ' is-on' : ''}`}
                    onClick={() => setMaxKm(d.km)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Scrolls on its own: the page's smooth scroll leaves the wheel to it */}
              <ul ref={listRef} className="place-list" data-lenis-prevent>
                {visible.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      data-place={p.id}
                      className={`place-row${p.id === highlight ? ' is-lit' : ''}${p.id === selected ? ' is-selected' : ''}`}
                      aria-current={p.id === selected}
                      onPointerEnter={() => setHover(p.id)}
                      onPointerLeave={() => setHover((h) => (h === p.id ? null : h))}
                      onFocus={() => setHover(p.id)}
                      onBlur={() => setHover((h) => (h === p.id ? null : h))}
                      onClick={() => choose(p.id)}
                    >
                      <span className="place-row__thumb">
                        {p.place.image ? (
                          <img src={p.place.image} width={64} height={64} alt="" loading="lazy" />
                        ) : (
                          <i className="place-icon" style={iconStyle(p.icon)} aria-hidden />
                        )}
                      </span>
                      <span className="place-row__body">
                        <span className="place-row__name">{p.place.name}</span>
                        <span className="place-row__meta">
                          <i className="place-icon place-icon--small" style={iconStyle(p.icon)} aria-hidden />
                          {p.category}
                          <span className="place-row__dot" aria-hidden>
                            ·
                          </span>
                          {p.distance}
                          {p.walk && (
                            <>
                              <span className="place-row__dot" aria-hidden>
                                ·
                              </span>
                              {p.walk}
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {visible.length === 0 && (
                <div className="place-empty">
                  <p>No places match.</p>
                  <button type="button" onClick={clearFilters}>
                    Clear filters
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
      <div className="exit-shade" aria-hidden />
    </section>
  );
}
