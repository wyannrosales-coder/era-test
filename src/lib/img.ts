/**
 * `fetchpriority="high"` for the photo at the top of a page (the largest thing on screen when
 * it opens), so the browser fetches it before other images. React 18 only passes the
 * attribute through in lowercase, which its types don't list, hence the spread:
 * `<img {...HIGH_PRIORITY} … />`.
 */
export const HIGH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>;
