# Property experience pages

Each property can have an immersive "experience" page beside its SEO property page. Macquarie Park is the first:

| | Address | Built with |
|---|---|---|
| Property page (SEO) | `/locations/macquarie-park` | React (`src/pages/PropertyPage.tsx`) |
| Experience page | `/locations/macquarie-park/experience` | Hand-built page (this document) |

## Where it lives

- `locations/macquarie-park/experience/index.html`: the page itself. It is a second HTML entry for Vite (see `vite.config.ts`), not part of the React app, so its own scripts and animations run untouched.
- `public/locations/macquarie-park/experience/assets/`: its styles, scripts, images and films, served at the same address. Everything the page loads is addressed from `/locations/macquarie-park/experience/assets/…`, so nothing collides with the main site's `/assets/`.
- `tools/`: helper scripts that regenerate some of those assets (`make-ink.py`, `make-v2-css.py`).
- `CHANGELOG.md`: the experience page's change history.

## How it joins the main site

- **Navigation.** The page has `<div id="site-nav"></div>` and loads `src/experience/navIsland.tsx`, which mounts the site's own `<Nav>` there. Change the nav once and the experience page follows. `src/experience/navIsland.css` gives the nav the base styles it normally gets from `global.css`.
- **Entry points.** `src/lib/links.ts` lists which properties have an experience page. From that list the property page (hero button and sub-navigation), the Locations mega menu, the hamburger menu, the home carousel card and the `/locations` listing all show a link. `/experience` and the property page's Amenities button lead there too.
- **Links out.** "Explore room" in the rooms magazine opens `/locations/macquarie-park/<room>`; "All rooms" opens the property page's Rooms section; book-a-tour fallbacks go to `/contact`.
- **Footer.** The experience keeps its own ending (the resident pass), not the site footer.
- **Dark / light.** Both looks ship. The round sun / moon button at the bottom left switches (also Shift+B, or `?v=1` / `?v=2`), and the choice is remembered.
- **Search engines.** The page is indexable, with its own title, description and canonical address, and is listed in `public/sitemap.xml`. The canonical and sitemap assume the site lives at `https://www.epiisod.com`: change them if it does not.

## Adding another property's experience

1. Put its page at `locations/<property>/experience/index.html` and its files under `public/locations/<property>/experience/assets/`.
2. Add `<div id="site-nav"></div>` and `<script type="module" src="/src/experience/navIsland.tsx"></script>` at the top of its `<body>`.
3. Add the property's id to `EXPERIENCE_PAGES` in `vite.config.ts`, to `EXPERIENCE_PROPERTIES` in `src/lib/links.ts`, and a rewrite for its address in `vercel.json`.

## Run it

`npm run dev`, then open `http://localhost:5173/locations/macquarie-park/experience`.
