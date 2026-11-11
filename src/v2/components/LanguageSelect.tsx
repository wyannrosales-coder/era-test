import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import dropdownLight from '../../assets/v2/dropdown-white.svg';
import dropdownDark from '../../assets/v2/dropdown-dark.svg';
import globeLight from '../../assets/v2/globe-white.svg';
import globeDark from '../../assets/v2/globe-dark.svg';
import './LanguageSelect.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'zh', label: '中文', name: '中文' },
] as const;
type Language = (typeof LANGUAGES)[number]['code'];
const STORAGE_KEY = 'epiisod-language';

const readSaved = (): Language => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((l) => l.code === saved) ? (saved as Language) : 'en';
  } catch {
    return 'en';
  }
};

/**
 * The nav's language menu: EN (English) or 中文. The choice sets the page's `lang`
 * and is remembered on this device. The site's copy isn't translated yet.
 */
export default function LanguageSelect({ onOpen }: { onOpen?: () => void }) {
  const [language, setLanguage] = useState<Language>(readSaved);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage unavailable (private mode etc.): the choice just isn't remembered
    }
  }, [language]);

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
      >
        {/* Figma 1441:16140: globe, language, caret */}
        <span className="nav__icon" style={{ width: 16, height: 16 }}>
          <img className="nav__icon-light" src={globeLight} width={16} height={16} alt="" />
          <img className="nav__icon-dark" src={globeDark} width={16} height={16} alt="" />
        </span>
        <span lang={current.code}>{current.label}</span>
        <span className="nav__icon language-select__caret" style={{ width: 16, height: 16 }}>
          <img className="nav__icon-light" src={dropdownLight} width={16} height={16} alt="" />
          <img className="nav__icon-dark" src={dropdownDark} width={16} height={16} alt="" />
        </span>
      </button>

      <ul className="language-select__menu" onKeyDown={onListKey}>
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
              <span className="language-select__label">{l.label}</span>
              {l.name !== l.label && <span className="language-select__name">{l.name}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
