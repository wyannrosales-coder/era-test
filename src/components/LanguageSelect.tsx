import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import Flag from './Flag';
import { LANGUAGES, useLanguage, type Language } from '../lib/language';
import dropdownLight from '../assets/dropdown.svg';
import dropdownDark from '../assets/dropdown-dark.svg';
import './LanguageSelect.css';

/**
 * The nav's language menu: a flag and the language, with English, 中文 and हिन्दी to choose from.
 * The choice translates the whole page at once (public/i18n/engine.js), sets its `lang`, and is
 * remembered on this device and in the address (?lang=).
 */
export default function LanguageSelect({ onOpen }: { onOpen?: () => void }) {
  const [language, setLanguage] = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Close on a click elsewhere or Escape (returning focus to the button)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    optionRefs.current[LANGUAGES.findIndex((l) => l.code === language)]?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
    // Focus the current option only when the menu opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = () => {
    if (!open) onOpen?.();
    setOpen((o) => !o);
  };

  const choose = (code: Language) => {
    setLanguage(code);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Up/Down move between the options
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const i = optionRefs.current.findIndex((el) => el === document.activeElement);
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + LANGUAGES.length) % LANGUAGES.length;
    optionRefs.current[next]?.focus();
  };

  return (
    <div ref={rootRef} className={`language-select${open ? ' is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="nav__lang"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Language: ${current.name}`}
        onClick={toggle}
        translate="no"
      >
        <Flag code={current.code} size={20} />
        <span lang={current.code}>{current.label}</span>
        <span className="nav__icon language-select__caret" style={{ width: 16, height: 16 }}>
          <img className="nav__icon-light" src={dropdownLight} width={16} height={16} alt="" />
          <img className="nav__icon-dark" src={dropdownDark} width={16} height={16} alt="" />
        </span>
      </button>

      <ul className="language-select__menu" onKeyDown={onListKey} translate="no">
        {LANGUAGES.map((l, i) => (
          <li key={l.code}>
            <button
              ref={(el) => (optionRefs.current[i] = el)}
              type="button"
              lang={l.code}
              className={`language-select__option${l.code === language ? ' is-current' : ''}`}
              aria-current={l.code === language}
              onClick={() => choose(l.code)}
            >
              <Flag code={l.code} size={22} />
              <span className="language-select__label">{l.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The three languages as a row of buttons (the phone menu and the settings dialog). */
export function LanguageRow({ className = '' }: { className?: string }) {
  const [language, setLanguage] = useLanguage();
  return (
    <div className={`language-row ${className}`} role="radiogroup" aria-label="Language" translate="no">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          lang={l.code}
          aria-checked={language === l.code}
          className={`language-row__option${language === l.code ? ' is-on' : ''}`}
          onClick={() => language !== l.code && setLanguage(l.code)}
        >
          <Flag code={l.code} size={24} />
          <span>{l.name}</span>
        </button>
      ))}
    </div>
  );
}
