import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PROPERTY_STATE, setPropertyState, type PropertyState } from '../lib/prototypeMode';
import {
  resetSettings,
  setCorners,
  setTheme,
  settings,
  subscribeSettings,
  type CornerPart,
  type Corners,
  type Theme,
} from '../lib/prototypeSettings';
import './SettingsModal.css';

type Option<T extends string> = { id: T; label: string; hint?: string; preview?: ReactNode };

/** Two or three choices as a radio group; options may carry a small preview of the choice. */
function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (next: T) => void;
  compact?: boolean;
}) {
  return (
    <div className={`settings__options${compact ? ' settings__options--compact' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={`settings__option${value === o.id ? ' is-on' : ''}`}
          onClick={() => value !== o.id && onChange(o.id)}
        >
          {o.preview}
          <span className="settings__option-text">
            <span className="settings__option-label">{o.label}</span>
            {o.hint && <span className="settings__option-hint">{o.hint}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg className="settings__icon" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

/** A mini page, in the light or dark look. */
const ThemePreview = ({ mode }: { mode: Theme }) => (
  <span className={`settings__mini settings__mini--${mode}`} aria-hidden>
    <i className="settings__mini-bar" />
    <i className="settings__mini-title" />
    <i className="settings__mini-line" />
    <i className="settings__mini-card" />
  </span>
);

const CORNER_ROWS: { part: CornerPart; title: string; help: string }[] = [
  { part: 'media', title: 'Image containers', help: 'Photos, galleries and banners' },
  { part: 'buttons', title: 'Buttons', help: 'Buttons, fields and dropdowns' },
  { part: 'cards', title: 'Cards', help: 'Room, blog and location cards, panels' },
];

/**
 * The prototype settings dialog: how the other properties stand (changing it reloads the
 * page), the corner style and the theme. Choices apply at once and are kept on this device.
 */
export function SettingsModal({ onClose }: { onClose: () => void }) {
  const snapshot = useSyncExternalStore(
    subscribeSettings,
    () => `${settings.media}|${settings.buttons}|${settings.cards}|${settings.theme}`,
  );
  const [media, buttons, cards, theme] = snapshot.split('|') as [Corners, Corners, Corners, Theme];
  const corners: Record<CornerPart, Corners> = { media, buttons, cards };
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('[aria-checked="true"], button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    document.documentElement.classList.add('settings-open');
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.classList.remove('settings-open');
      previous?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="settings" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="settings__dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" data-lenis-prevent>
        <header className="settings__header">
          <div>
            <p className="settings__eyebrow">Prototype</p>
            <h2 id="settings-title" className="settings__title">Settings</h2>
          </div>
          <button type="button" className="settings__close" aria-label="Close settings" onClick={onClose}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </header>

        <section className="settings__group">
          <div className="settings__group-head">
            <Icon><path d="M3 17V8l7-5 7 5v9M8 17v-5h4v5" /></Icon>
            <div>
              <h3 className="settings__label">Other properties</h3>
              <p className="settings__help">Coming soon is how the site stands today; All ready shows every property open. Changing it reloads the page.</p>
            </div>
          </div>
          <Choice<PropertyState>
            label="Other properties"
            value={PROPERTY_STATE}
            onChange={setPropertyState}
            options={[
              { id: 'soon', label: 'Coming soon', hint: 'As today' },
              { id: 'ready', label: 'All ready', hint: 'Every property open' },
            ]}
          />
        </section>

        <section className="settings__group">
          <div className="settings__group-head">
            <Icon><path d="M4 16V9a5 5 0 0 1 5-5h7" /></Icon>
            <div>
              <h3 className="settings__label">Corners</h3>
              <p className="settings__help">Set the shape of each part of the site on its own.</p>
            </div>
          </div>
          <ul className="settings__rows">
            {CORNER_ROWS.map((row) => (
              <li key={row.part} className="settings__row">
                <span className={`settings__shape settings__shape--${row.part} is-${corners[row.part]}`} aria-hidden>
                  {row.part === 'media' && (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8.5" cy="9" r="1.6" />
                      <path d="m3 18 5.5-5.5 4 4 3-3L21 18" />
                    </svg>
                  )}
                  {row.part === 'buttons' && <i />}
                  {row.part === 'cards' && (
                    <>
                      <i />
                      <b />
                      <b />
                    </>
                  )}
                </span>
                <span className="settings__row-text">
                  <span className="settings__row-title">{row.title}</span>
                  <span className="settings__row-help">{row.help}</span>
                </span>
                <Choice<Corners>
                  compact
                  label={row.title}
                  value={corners[row.part]}
                  onChange={(next) => setCorners(row.part, next)}
                  options={[
                    { id: 'curved', label: 'Curved' },
                    { id: 'sharp', label: 'Sharp' },
                  ]}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="settings__group">
          <div className="settings__group-head">
            <Icon><path d="M16.5 11.5A6.5 6.5 0 0 1 8.5 3.5a6.5 6.5 0 1 0 8 8Z" /></Icon>
            <div>
              <h3 className="settings__label">Theme</h3>
              <p className="settings__help">Light is the current look. The property experience pages follow it too.</p>
            </div>
          </div>
          <Choice<Theme>
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { id: 'light', label: 'Light', hint: 'Current', preview: <ThemePreview mode="light" /> },
              { id: 'dark', label: 'Dark', hint: 'Black and grey', preview: <ThemePreview mode="dark" /> },
            ]}
          />
        </section>

        <footer className="settings__footer">
          <button type="button" className="settings__reset" onClick={resetSettings}>
            Reset to defaults
          </button>
          <button type="button" className="settings__done" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/** The nav's settings icon, with its dialog. `row` is the phone menu's full-width version. */
export default function SettingsButton({ row = false }: { row?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={row ? 'settings-row' : 'settings-button'}
        aria-label="Prototype settings"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 14.6a1.2 1.2 0 0 0 .24 1.32l.04.04a1.45 1.45 0 1 1-2.05 2.05l-.04-.04a1.2 1.2 0 0 0-1.32-.24 1.2 1.2 0 0 0-.73 1.1v.12a1.45 1.45 0 1 1-2.9 0v-.06a1.2 1.2 0 0 0-.78-1.1 1.2 1.2 0 0 0-1.32.24l-.04.04a1.45 1.45 0 1 1-2.05-2.05l.04-.04a1.2 1.2 0 0 0 .24-1.32 1.2 1.2 0 0 0-1.1-.73h-.12a1.45 1.45 0 1 1 0-2.9h.06a1.2 1.2 0 0 0 1.1-.78 1.2 1.2 0 0 0-.24-1.32l-.04-.04A1.45 1.45 0 1 1 7.5 5.4l.04.04a1.2 1.2 0 0 0 1.32.24h.06a1.2 1.2 0 0 0 .73-1.1v-.12a1.45 1.45 0 1 1 2.9 0v.06a1.2 1.2 0 0 0 .73 1.1 1.2 1.2 0 0 0 1.32-.24l.04-.04a1.45 1.45 0 1 1 2.05 2.05l-.04.04a1.2 1.2 0 0 0-.24 1.32v.06a1.2 1.2 0 0 0 1.1.73h.12a1.45 1.45 0 1 1 0 2.9h-.06a1.2 1.2 0 0 0-1.1.73Z" />
        </svg>
        {row && <span>Prototype settings</span>}
      </button>
      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  );
}
