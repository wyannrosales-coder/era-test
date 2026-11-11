import { useEffect, useState } from 'react';
import { PROPERTIES } from './locationData';
import './EnquiryPill.css';

const DISMISSED_KEY = 'epiisod-enquiry-dismissed';

/**
 * The floating "Make an enquiry" pill, bottom right on every page except Contact.
 * On a property's pages it carries that property's name as a tag; the × hides it for the
 * rest of the visit. Mounted once by src/main.tsx and by the experience pages' nav island.
 */
export default function EnquiryPill() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [shown, setShown] = useState(false);

  // Fades in a moment after load so it doesn't compete with the hero
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (dismissed || path === '/contact' || path === '/join-the-waitlist') return null;

  const property = PROPERTIES.find((p) => p.href && (path === p.href || path.startsWith(`${p.href}/`)));
  const tag = property?.name.replace(/^EPIISOD\s+/i, '');

  return (
    <div className={`enquiry-pill${shown ? ' is-shown' : ''}`}>
      <a className="enquiry-pill__link" href="/contact">
        <svg className="enquiry-pill__icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 3.2h12v7.6H8.4L5 13.6v-2.8H2z" strokeLinejoin="round" />
        </svg>
        <span>Make an enquiry</span>
        {tag && <span className="enquiry-pill__tag">{tag}</span>}
      </a>
      <button
        type="button"
        className="enquiry-pill__close"
        aria-label="Hide enquiry button"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(DISMISSED_KEY, '1');
          } catch {
            /* private mode: it just comes back next page */
          }
        }}
      >
        <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true" stroke="currentColor" strokeWidth="1.3">
          <path d="M1 1l8 8M9 1L1 9" />
        </svg>
      </button>
    </div>
  );
}
