import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Nav from '../components/Nav';
import '../styles/tokens.css';
import '../styles/type.css';
import './navIsland.css';

/**
 * The site's navigation, mounted on a property's experience page.
 *
 * Experience pages (locations/<property>/experience/index.html) are hand-built pages, not
 * part of the React app, so they can keep their own scripts and animations. This small
 * entry gives them the very same <Nav> as every other page: change the nav once and the
 * experience pages follow. The page only needs <div id="site-nav"></div> and this script.
 */
const mount = document.getElementById('site-nav');
if (mount) {
  createRoot(mount).render(
    <StrictMode>
      <Nav />
    </StrictMode>,
  );
}
