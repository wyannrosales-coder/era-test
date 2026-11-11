import { useRef, useState } from 'react';
import Calendar, { formatDay } from './Calendar';
import './ui.css';

/**
 * A date field that opens the site's calendar. Keeps a hidden <input> with the yyyy-mm-dd
 * value so forms still submit it; `onChange` gets the new value.
 */
export default function DateField({
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  placeholder = 'Choose a date',
  required,
  className,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  return (
    <span ref={wrap} className="ui-select ui-date">
      <input type="text" name={name} value={current} required={required} readOnly tabIndex={-1} aria-hidden="true" className="ui-select__native" onChange={() => {}} />
      <button
        type="button"
        className={`ui-select__button${className ? ` ${className}` : ''}${current ? '' : ' is-empty'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ui-select__value">{current ? formatDay(current) : placeholder}</span>
      </button>
      <Calendar
        open={open}
        anchor={wrap}
        value={current}
        min={min}
        max={max}
        onPick={(v) => {
          setInner(v);
          onChange?.(v);
        }}
        onClose={() => setOpen(false)}
      />
    </span>
  );
}
