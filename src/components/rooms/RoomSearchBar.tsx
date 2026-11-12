import type { FormEvent } from 'react';
import Select from '../ui/Select';
import {
  CITIES,
  PRICE_RANGES,
  ROOM_TYPES,
  changeFilters,
  institutionsFor,
  termsFor,
  type CityId,
  type Filters,
} from './roomSearch';
import './RoomSearchBar.css';

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  /** Runs the search with the chosen filters (the Search rooms button, or Enter). */
  onSearch: () => void;
  onClear: () => void;
  /** A property's own page: its city is fixed, so the City field only shows it. */
  lockedCity?: CityId;
  className?: string;
};

/**
 * The five room filters (after the live site's Find a room page): City,
 * Institution, Room types, Price range and Term, then Clear and Search rooms. City narrows
 * Institution and Term (roomSearch.ts). Nothing is applied until Search rooms is pressed.
 */
export default function RoomSearchBar({ value, onChange, onSearch, onClear, lockedCity, className }: Props) {
  const city = lockedCity ?? value.city;
  const set = (patch: Partial<Filters>) => onChange(changeFilters(value, patch));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch();
  };
  const dirty = Object.entries(value).some(([k, v]) => v && !(lockedCity && k === 'city'));

  return (
    <form className={`room-search${className ? ` ${className}` : ''}`} onSubmit={submit} role="search" aria-label="Find a room">
      <div className="room-search__field room-search__field--city">
        <span className="room-search__label">City</span>
        <Select
          aria-label="City"
          value={city}
          disabled={!!lockedCity}
          onChange={(e) => set({ city: e.target.value as Filters['city'] })}
        >
          <option value="">All cities</option>
          {[...CITIES, ...(lockedCity && !CITIES.some((c) => c.id === lockedCity) ? [{ id: lockedCity, label: lockedCity[0].toUpperCase() + lockedCity.slice(1) }] : [])].map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="room-search__field room-search__field--wide">
        <span className="room-search__label">Institution</span>
        <Select
          aria-label="Institution"
          value={value.institution}
          onChange={(e) => set({ institution: e.target.value })}
        >
          <option value="">All university</option>
          {institutionsFor(city).map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="room-search__field">
        <span className="room-search__label">Room types</span>
        <Select
          aria-label="Room types"
          value={value.type}
          onChange={(e) => set({ type: e.target.value as Filters['type'] })}
        >
          <option value="">All room types</option>
          {ROOM_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="room-search__field">
        <span className="room-search__label">Price range</span>
        <Select
          aria-label="Price range"
          value={value.price}
          onChange={(e) => set({ price: e.target.value })}
        >
          <option value="">All</option>
          {PRICE_RANGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="room-search__field room-search__field--wide">
        <span className="room-search__label">Term</span>
        <Select
          aria-label="Term"
          value={value.term}
          onChange={(e) => set({ term: e.target.value })}
        >
          <option value="">All term</option>
          {termsFor(city).map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="room-search__actions">
        {dirty && (
          <button type="button" className="room-search__clear" onClick={onClear}>
            Clear
          </button>
        )}
        <button type="submit" className="room-search__submit">
          Search rooms
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}
