import { PROPERTY_STATE, setPropertyState } from '../lib/prototypeMode';
import './PrototypeToggle.css';

/**
 * Prototype-only switch in the navigation: how the properties stand — "Coming soon" (as
 * today: only Macquarie Park open) or "All ready" (every property open). Switching reloads
 * the page in the other state (lib/prototypeMode.ts). Remove once the site goes live.
 */
export default function PrototypeToggle({ className = '' }: { className?: string }) {
  const options = [
    { id: 'soon', label: 'Soon', title: 'Other properties coming soon (as today)' },
    { id: 'ready', label: 'Ready', title: 'Every property open' },
  ] as const;
  return (
    <div className={`proto-toggle ${className}`} role="group" aria-label="Prototype: property status">
      <span className="proto-toggle__label">Prototype</span>
      <div className="proto-toggle__track">
        {options.map(({ id, label, title }) => (
          <button
            key={id}
            type="button"
            className={`proto-toggle__option${PROPERTY_STATE === id ? ' is-on' : ''}`}
            aria-pressed={PROPERTY_STATE === id}
            title={title}
            onClick={() => PROPERTY_STATE !== id && setPropertyState(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
