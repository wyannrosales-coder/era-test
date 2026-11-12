import { StrictMode } from 'react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { initSmoothScroll } from './lib/smoothScroll';
import EnquiryPill from './components/EnquiryPill';
import './styles/global.css';
import './styles/lux.css';
import './styles/theme.css';
import './styles/texture.css';
import './lib/prototypeSettings';

/**
 * Versions, chosen by URL: /v2 and /v2/… → version 2 (src/v2); every other path →
 * version 1, the site as deployed (src/App + src/components, frozen at the `v1` git tag).
 * Each loads on its own so only its styles are on the page — both use the same class
 * names, and loading them together would let v2 tweaks leak into v1.
 */
const path = window.location.pathname.replace(/\/+$/, '');
// Separate statements (not a ternary): Vite then gives each import its own preload list.
let loadPage: Promise<{ default: ComponentType }>;
if (path === '/v2' || path.startsWith('/v2/')) {
  loadPage = import('./v2/App');
} else {
  loadPage = import('./App');
}

initSmoothScroll();

// The floating enquiry pill lives outside the page so every page (v1 and v2) gets it
const pillRoot = document.createElement('div');
document.body.appendChild(pillRoot);
createRoot(pillRoot).render(<EnquiryPill />);

loadPage.then(({ default: Page }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Page />
    </StrictMode>,
  );
});
