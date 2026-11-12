import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { setScrollLocked } from '../../lib/smoothScroll';
import './TourModal.css';

/**
 * A virtual tour (Matterport) opened over the page, full screen, rather than as a page of
 * its own. Escape or the close button returns to the room.
 */
export default function TourModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    setScrollLocked(true);
    document.documentElement.classList.add('tour-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.classList.remove('tour-open');
      setScrollLocked(false);
      previous?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="tour" role="dialog" aria-modal="true" aria-label={`${title}: virtual tour`}>
      <header className="tour__bar">
        <p className="tour__title">
          <span>Virtual tour</span> {title}
        </p>
        <button ref={closeRef} type="button" className="tour__close" onClick={onClose} aria-label="Close virtual tour">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
          <span>Close</span>
        </button>
      </header>
      <iframe
        className="tour__frame"
        src={url}
        title={`${title}: virtual tour`}
        allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
        allowFullScreen
      />
    </div>,
    document.body,
  );
}
