/**
 * v2: phones and portrait tablets share the phone layout (the CSS uses the same media
 * query, written out in each file: `@media (max-width: 700px), (max-width: 1100px) and
 * (orientation: portrait)`).
 */
export const PHONE_QUERY = '(max-width: 700px), (max-width: 1100px) and (orientation: portrait)';
/** The phone layout and motion allowed, as one media query (GSAP matchMedia). */
export const PHONE_MOTION_QUERY =
  '(max-width: 700px) and (prefers-reduced-motion: no-preference), (max-width: 1100px) and (orientation: portrait) and (prefers-reduced-motion: no-preference)';
export const isPhoneLayout = () => window.matchMedia(PHONE_QUERY).matches;
