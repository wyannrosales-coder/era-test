# EPIISOD website

The EPIISOD website (React + TypeScript + Vite) together with the Macquarie Park experience page, which is served by the same site at `/locations/macquarie-park/experience`. See [EXPERIENCE.md](EXPERIENCE.md) for how the experience page is put together and how it joins the site.

## Global home page

React + TypeScript + Vite build of the Figma "epiisod-global-home-page" frame (EPIISOD Mood Board, node 317:12911).

## Run

Requires Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Prototype animations implemented

| Element | Trigger | Transition (from Figma) | Where |
|---|---|---|---|
| Locations carousel | swipe / trackpad, mouse drag, ← → keys, or drag/click the progress bar (snaps to cards) | Cards slide under the intro column (shadow fades in); progress bar 0 → 440px | `src/components/Locations.*` |
| life @ epiisod → Wellness | page scroll (intro pinned) | Move In from the right, ease-in-out, over one viewport height of scroll | `src/components/LifeSection.*` |
| Brand video ("Make it yours") | page scroll (pinned over 1000px, `scrub: 1`) | 300px square grows into the 1136×639 frame (clip + image scale) as heading + frame ease to centre; tint and play fade in; then hero-style exit (half-speed drift + darken); click plays the film | `src/components/BrandVideo.*` |
| Partners | page scroll | Life @ epiisod-style parallax: photos drift at different speeds (0.3 / 0.18), heading + static logo row counter-drift slightly; Figma position when the section top meets the screen top | `src/components/Partners.*` |
| Token fold (before the sign-up) | auto-spin + page scroll (parallax, no pin) | Real-time 3D silver coin (three.js, `src/lib/coin3d.ts`, lazy-loaded) with the EPIISOD mark embossed; spins on its own as soon as the section appears; rows start closed and scroll up through it while it drifts 40%→62% down the screen; each row splits like liquid (opens just ahead, scroll-speed aware; oozes back closed, no overshoot) with nearby rows bulging away; it passes every row and ends below the last | `src/components/TokenFold.*` |
| Navigation | page scroll | Fixed; transparent with white type over the hero, cross-fades (400ms) to a 90% white bar with soft shadow, chocolate type/icons and a bronze BOOK A TOUR after 40px of scroll | `src/components/Nav.*` |
| Stay connected form | focus / typing | Focused field turns white with a bronze-700 border; when both fields are filled SUBMIT becomes solid bronze-700 with white type and arrow | `src/components/StayConnected.*` |
| Footer wordmark | page scroll | As the footer enters, the giant EPIISOD letters rise into place at alternating depths (parallax), staggered left→right, and the arcs swing in around their circle centres; settles exactly as designed | `src/components/Footer.*` |
| Wellness stories | page scroll (pinned stage), dot or image click | Track eases (power2.inOut) from one image to the next so each settles centred beside its heading; snaps to the nearest story when scrolling stops; heading + dots swap with it | `src/components/Wellness.*` |


## Scroll animation & smooth scrolling

Scroll-linked effects use [GSAP](https://gsap.com) ScrollTrigger (scrubbed timelines, no React re-renders while scrolling): hero exit parallax, the brand-video thumbnail-to-frame reveal, the life @ epiisod collage parallax, the Wellness slide-in and steps, and the Partners parallax. Page scrolling is eased with [Lenis](https://github.com/darkroomengineering/lenis), driven by GSAP's ticker so both update in the same frame. Setup lives in `src/lib/smoothScroll.ts`; import `gsap`, `ScrollTrigger` and `useGSAP` from there. GSAP's ScrollSmoother isn't used because it transforms the whole page, which breaks the CSS `position: sticky` layouts in the life/Wellness sections.

Parallax is skipped for viewers who prefer reduced motion (`gsap.matchMedia`), and touch devices keep native scrolling. The locations carousel opts out of horizontal smoothing (`data-lenis-prevent-horizontal`) so its native swipe and snapping still work. Use `scrollToY()` for any programmatic page scroll.

## 3D coin

The token in the before-sign-up fold is a real-time 3D coin built with [three.js](https://threejs.org) (MIT): a lathe-turned body with a rounded edge and raised rim, a physically based metal lit by three.js's `RoomEnvironment`, and the logo embossed from `token-mark.svg` via a height map. The module is a separate chunk loaded only when the section is ~1.5 screens away, and only renders while on screen. Change the metal with `COIN_COLOR` in `TokenFold.tsx` (`#d9d9d9` silver, `#c98a5e` bronze). Without WebGL a flat token is shown.

## Images

Raster assets are JPEGs sized to how they display (2× for retina). Full-size Figma exports are kept in `design-originals/` (git-ignored) for reference; the brand film only downloads when someone presses play.
