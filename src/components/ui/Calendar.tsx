import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useFloating } from './useFloating';
import './ui.css';

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s: string) => new Date(`${s}T00:00`);
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const formatDay = (s: string) =>
  parse(s).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * A date picker popup in the site's style (the browser's own picker is never used).
 * Dates are yyyy-mm-dd strings. Days outside [min, max] can't be picked. Arrow keys move
 * by day / week, Enter picks, Escape closes.
 */
export default function Calendar({
  open,
  anchor,
  value,
  min,
  max,
  onPick,
  onClose,
}: {
  open: boolean;
  anchor: RefObject<HTMLElement | null>;
  value?: string | null;
  min?: string;
  max?: string;
  onPick: (value: string) => void;
  onClose: () => void;
}) {
  const startMonth = () => {
    const base = value ? parse(value) : min ? parse(min) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  };
  const [month, setMonth] = useState(startMonth);
  const [focusDay, setFocusDay] = useState<string>(() => value || min || iso(new Date()));
  const ref = useRef<HTMLDivElement>(null);
  const pos = useFloating(open, anchor, 380);

  useEffect(() => {
    if (!open) return;
    const m = startMonth();
    setMonth(m);
    setFocusDay(value || min || iso(new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchor.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, anchor, onClose]);

  useEffect(() => {
    if (open && pos) ref.current?.querySelector<HTMLElement>('[data-focus="true"]')?.focus({ preventScroll: true });
  }, [open, pos, focusDay, month]);

  if (!open || !pos) return null;

  const disabled = (s: string) => (!!min && s < min) || (!!max && s > max);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<string | null> = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => iso(new Date(month.getFullYear(), month.getMonth(), i + 1))),
  ];
  const todayStr = iso(new Date());
  const monthLabel = month.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  const prevDisabled = !!min && iso(new Date(month.getFullYear(), month.getMonth(), 0)) < min;
  const nextDisabled = !!max && iso(new Date(month.getFullYear(), month.getMonth() + 1, 1)) > max;
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key in step) {
      e.preventDefault();
      const d = parse(focusDay);
      d.setDate(d.getDate() + step[e.key]);
      const next = iso(d);
      setFocusDay(next);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  return createPortal(
    <div
      ref={ref}
      className={`ui-cal${pos.flip ? ' is-flipped' : ''}`}
      role="dialog"
      aria-label="Choose a date"
      onKeyDown={onKeyDown}
      style={{
        left: Math.min(pos.left, Math.max(8, window.innerWidth - 320 - 8)),
        ...(pos.flip ? { bottom: window.innerHeight - pos.top + 6 } : { top: pos.top + 6 }),
      }}
    >
      <div className="ui-cal__head">
        <button type="button" className="ui-cal__nav" aria-label="Previous month" disabled={prevDisabled} onClick={() => shift(-1)}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <span className="ui-cal__title" aria-live="polite">
          {monthLabel}
        </span>
        <button type="button" className="ui-cal__nav" aria-label="Next month" disabled={nextDisabled} onClick={() => shift(1)}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
      <div className="ui-cal__grid" role="grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="ui-cal__dow" role="columnheader">
            {w}
          </span>
        ))}
        {cells.map((s, i) =>
          s ? (
            <button
              key={s}
              type="button"
              role="gridcell"
              data-focus={s === focusDay}
              tabIndex={s === focusDay ? 0 : -1}
              disabled={disabled(s)}
              aria-selected={s === value}
              aria-current={s === todayStr ? 'date' : undefined}
              aria-label={formatDay(s)}
              className={`ui-cal__day${s === value ? ' is-selected' : ''}${s === todayStr ? ' is-today' : ''}`}
              onClick={() => {
                onPick(s);
                onClose();
              }}
            >
              {Number(s.slice(8))}
            </button>
          ) : (
            <span key={`b${i}`} />
          ),
        )}
      </div>
    </div>,
    document.body,
  );
}
