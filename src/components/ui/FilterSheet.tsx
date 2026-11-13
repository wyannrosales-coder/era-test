import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { setScrollLocked } from '../../lib/smoothScroll';
import './FilterSheet.css';

/** True on phones (and small windows), where filters open in a bottom sheet instead of sitting on the page. */
export function useIsPhone(max = 700) {
  const query = `(max-width: ${max}px)`;
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return phone;
}

/** The filter icon (three sliders). */
export const FilterIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

/**
 * The button that opens the filters on a phone: the filter icon, "Filters", how many are on,
 * and a Clear link while any are. `tone="hero"` is for use over a photo.
 */
export function FilterTrigger({
  count,
  onOpen,
  onClear,
  tone,
  expanded,
}: {
  count: number;
  onOpen: () => void;
  onClear?: () => void;
  tone?: 'hero';
  expanded: boolean;
}) {
  return (
    <div className={`fsheet-trigger${tone === 'hero' ? ' fsheet-trigger--hero' : ''}`}>
      <button type="button" className="fsheet-trigger__button" onClick={onOpen} aria-haspopup="dialog" aria-expanded={expanded}>
        <FilterIcon />
        <span className="fsheet-trigger__label">Filters</span>
        {count > 0 && (
          <span className="fsheet-trigger__count" aria-label={`${count} applied`}>
            {count}
          </span>
        )}
      </button>
      {count > 0 && onClear && (
        <button type="button" className="fsheet-trigger__clear" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * A bottom sheet: rises from the foot of the screen over a dimmed page, closes on the backdrop,
 * the × button, Escape or a swipe down on its handle. The page behind doesn't scroll while it's open.
 */
export default function FilterSheet({ open, onClose, title = 'Filters', children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef(0);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      setScrollLocked(false);
      opener.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const down = (e: ReactPointerEvent) => {
    start.current = e.clientY;
    setDrag(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent) => drag !== null && setDrag(Math.max(0, e.clientY - start.current));
  const up = () => {
    if (drag !== null && drag > 90) onClose();
    setDrag(null);
  };

  return createPortal(
    <div className="fsheet" role="presentation">
      <div className="fsheet__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`fsheet__panel${drag !== null ? ' is-dragging' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={drag ? { transform: `translateY(${drag}px)` } : undefined}
      >
        <div className="fsheet__top" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <span className="fsheet__grab" aria-hidden="true" />
          <div className="fsheet__head">
            <h2 className="fsheet__title">{title}</h2>
            <button type="button" className="fsheet__close" aria-label="Close filters" onClick={onClose} onPointerDown={(e) => e.stopPropagation()}>
              <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" stroke="currentColor" strokeWidth="1.3">
                <path d="M1 1l8 8M9 1L1 9" />
              </svg>
            </button>
          </div>
        </div>
        <div className="fsheet__body" data-lenis-prevent>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
