import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement, ReactNode, SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { useFloating } from './useFloating';
import './ui.css';

/** The field box the list lines up with, when the select sits inside one. */
const DEFAULT_ANCHOR = '.contact-field__box, .room-book__control, .faq-page__jump, .blog-post__jump, .hero-search__cell';

type Opt = { value: string; label: string; disabled: boolean; group?: string };

function readOptions(children: ReactNode): Opt[] {
  const out: Opt[] = [];
  const walk = (nodes: ReactNode, group?: string) =>
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      const el = child as ReactElement<{ value?: string; disabled?: boolean; label?: string; children?: ReactNode }>;
      if (el.type === 'optgroup') {
        walk(el.props.children, el.props.label);
      } else if (el.type === 'option') {
        const text = Children.toArray(el.props.children).join('');
        out.push({ value: el.props.value ?? text, label: text, disabled: !!el.props.disabled, group });
      }
    });
  walk(children);
  return out;
}

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'> & {
  /** No visible label: only the trigger area (used over a flag icon). */
  bare?: boolean;
  /** Element whose width and position the list follows (default: this component's wrapper). */
  anchorSelector?: string;
  /** Shown when nothing is selected. */
  placeholder?: string;
};

/**
 * A drop-in replacement for <select> that follows the design system instead of the
 * browser's menu. The real <select> stays in the DOM (visually hidden) so forms, required
 * validation, FormData, `value` and `onChange` behave exactly as before; choosing an option
 * sets it and fires a normal change event.
 */
export default function Select({ children, className, bare, anchorSelector, placeholder, onChange, ...rest }: Props) {
  const options = useMemo(() => readOptions(children), [children]);
  const nativeRef = useRef<HTMLSelectElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [current, setCurrent] = useState<string>(() => String(rest.value ?? rest.defaultValue ?? ''));
  const id = useId();
  const typed = useRef({ text: '', t: 0 });

  // Follow the native select's value (controlled changes, form resets)
  useEffect(() => {
    const el = nativeRef.current;
    if (!el) return;
    const sync = () => setCurrent(el.value);
    sync();
    el.addEventListener('change', sync);
    const form = el.form;
    const onReset = () => window.setTimeout(sync, 0);
    form?.addEventListener('reset', onReset);
    return () => {
      el.removeEventListener('change', sync);
      form?.removeEventListener('reset', onReset);
    };
  }, []);
  useEffect(() => {
    if (rest.value !== undefined) setCurrent(String(rest.value));
  }, [rest.value]);

  const pos = useFloating(open, anchorRef, 300);
  const selected = options.find((o) => o.value === current);

  const openList = () => {
    anchorRef.current =
      wrapRef.current?.closest<HTMLElement>(anchorSelector ?? DEFAULT_ANCHOR) ?? wrapRef.current;
    const i = options.findIndex((o) => o.value === current && !o.disabled);
    setActive(i >= 0 ? i : Math.max(0, options.findIndex((o) => !o.disabled)));
    setOpen(true);
  };

  const choose = (o: Opt) => {
    if (o.disabled) return;
    const el = nativeRef.current;
    if (el && el.value !== o.value) {
      el.value = o.value;
      // React listens for the native 'change' bubbling from the select
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setCurrent(o.value);
    setOpen(false);
    wrapRef.current?.querySelector<HTMLButtonElement>('.ui-select__button')?.focus();
  };

  // Close on outside press / Escape; keep the active option in view
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, active, pos]);

  const move = (dir: 1 | -1, from = active) => {
    let i = from;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) return i;
    }
    return from;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(move(1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(move(-1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(options.findIndex((o) => !o.disabled));
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1 - [...options].reverse().findIndex((o) => !o.disabled));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key.length === 1) {
      // Type-ahead
      const t = typed.current;
      window.clearTimeout(t.t);
      t.text += e.key.toLowerCase();
      t.t = window.setTimeout(() => (t.text = ''), 600);
      const i = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(t.text));
      if (i >= 0) setActive(i);
    }
  };

  const label = selected && selected.value !== '' ? selected.label : (placeholder ?? selected?.label ?? '');
  const empty = !selected || selected.value === '';
  const ariaLabel = rest['aria-label'];
  const groups: Array<{ group?: string; items: Array<{ o: Opt; i: number }> }> = [];
  options.forEach((o, i) => {
    const last = groups[groups.length - 1];
    if (last && last.group === o.group) last.items.push({ o, i });
    else groups.push({ group: o.group, items: [{ o, i }] });
  });

  return (
    <span ref={wrapRef} className={`ui-select${bare ? ' ui-select--bare' : ''}${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`ui-select__button${className ? ` ${className}` : ''}${empty ? ' is-empty' : ''}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        disabled={rest.disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {!bare && <span className="ui-select__value">{label}</span>}
      </button>
      <select ref={nativeRef} {...rest} onChange={onChange} className="ui-select__native" tabIndex={-1} aria-hidden="true">
        {children}
      </select>
      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            className={`ui-list${pos.flip ? ' is-flipped' : ''}`}
            style={{
              left: pos.left,
              minWidth: Math.max(pos.width, 180),
              ...(pos.flip ? { bottom: window.innerHeight - pos.top + 6 } : { top: pos.top + 6 }),
            }}
          >
            {groups.map((g, gi) => (
              <li key={gi} role="presentation" className="ui-list__group">
                {g.group && <span className="ui-list__label">{g.group}</span>}
                <ul role="presentation">
                  {g.items.map(({ o, i }) => (
                    <li
                      key={o.value + i}
                      role="option"
                      aria-selected={o.value === current}
                      aria-disabled={o.disabled || undefined}
                      data-active={i === active}
                      className={`ui-list__option${o.value === current ? ' is-selected' : ''}${o.disabled ? ' is-disabled' : ''}`}
                      onPointerEnter={() => !o.disabled && setActive(i)}
                      onClick={() => choose(o)}
                    >
                      <span>{o.label}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </span>
  );
}
