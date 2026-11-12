import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PROPERTY_STATE, setPropertyState, type PropertyState } from '../lib/prototypeMode';
import {
  resetSettings,
  setCorners,
  setTheme,
  settings,
  subscribeSettings,
  type Corners,
  type Theme,
} from '../lib/prototypeSettings';
import './SettingsModal.css';

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; hint?: string; swatch?: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="settings__options" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={`settings__option${value === o.id ? ' is-on' : ''}`}
          onClick={() => value !== o.id && onChange(o.id)}
        >
          {o.swatch && <span className={`settings__swatch settings__swatch--${o.swatch}`} aria-hidden />}
          <span className="settings__option-label">{o.label}</span>
          {o.hint && <span className="settings__option-hint">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * The prototype settings dialog: how the other properties stand (changing it reloads the
 * page), the corner style and the theme. Choices apply at once and are kept on this device.
 */
export function SettingsModal({ onClose }: { onClose: () => void }) {
  const snapshot = useSyncExternalStore(
    subscribeSettings,
    () => `${settings.corners}|${settings.theme}`,
  );
  const [corners, theme] = snapshot.split('|') as [Corners, Theme];
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
          <h3 className="settings__label">Other properties</h3>
          <p className="settings__help">Coming soon is how the site stands today. All ready shows every property open. Changing it reloads the page.</p>
          <Segmented<PropertyState>
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
          <h3 className="settings__label">Corners</h3>
          <p className="settings__help">The shape of cards, photos, fields and buttons.</p>
          <Segmented<Corners>
            label="Corners"
            value={corners}
            onChange={setCorners}
            options={[
              { id: 'curved', label: 'Curved', hint: 'Rounded', swatch: 'curved' },
              { id: 'sharp', label: 'Sharp', hint: 'Square', swatch: 'sharp' },
            ]}
          />
        </section>

        <section className="settings__group">
          <h3 className="settings__label">Theme</h3>
          <p className="settings__help">Light is the current look. The property experience pages follow it too.</p>
          <Segmented<Theme>
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { id: 'light', label: 'Light', hint: 'Current', swatch: 'light' },
              { id: 'dark', label: 'Dark', hint: 'Black and grey', swatch: 'dark' },
            ]}
          />
        </section>

        <footer className="settings__footer">
          <button type="button" className="settings__reset" onClick={resetSettings}>
            Reset corners and theme
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
