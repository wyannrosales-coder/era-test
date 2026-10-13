# Changelog

## 3.4.1

- Reduce Motion carousel: each scene uses its clip's final frame (courtyard garden, rooftop pool) instead of the opening frame.
- Light-only colour scheme declared, so Chrome/Samsung automatic dark mode no longer inverts the white sections.
- Phones held sideways see the site instead of the old "Rotate your phone" cover.

## 3.4.0

- Reduce Motion hero: a one-screen carousel (title slide + four scenes) with swipe, arrows, arrow keys, dots and a 01 / 05 counter; short crossfade, no autoplay.
- Reduce Motion location: a still aerial frame with the four labelled dots (tap for cards), followed by a white section with the emblem, "At the heart of Macquarie Park" and the address.

## 3.3.2

- Hero with Reduce Motion on (iPhone/Mac accessibility): a title screen, then the four scenes as full-screen stills, each with its own caption. Previously every caption piled up over the title on one screen.

## 3.3.1

- Wellness amenities: tabs work again on iPhone/iPad (a startup step treated the flower stills as videos and stopped the rest of startup).
- Startup steps now run independently and log `[init] … failed` in the console instead of silently stopping the rest.

## 3.3.0

- Load: hero clips load progressively (clip 1 first, then on first scroll or idle); arch reveal video and location poster load when near; large photos converted to WebP and lazy-loaded; unused Lottie library removed. First 6 s on desktop: 20 MB → 12.4 MB.
- iPhone/iPad: bougainvillea flowers show a transparent still with a gentle sway instead of 8–10 MB HEVC videos.
- Scroll: one shared scroll/frame scheduler for all scroll-driven sections (off-screen sections sleep); hero loop sleeps when far away; nav colour check throttled; frosted-glass blurs drop while scrolling; static blurs pre-rendered.
- Smooth scroll: continuous damping instead of a fixed-duration tween restarted on every wheel tick. Compare with `?feel=b` (longer glide) or `?feel=old` (previous).
- Nearby locations: aerial frames pre-decoded off the main thread, full soft cross-fade between frames, ~150ms eased glide.
- Hero: medium scroll ease (~140ms desktop, ~80ms touch).
- Safety mode: below ~45 fps for a second the page drops frosted glass, flower videos, the aerial cross-fade and the hero dissolve blur, and restores them once the device keeps up (`?lite=1` forces it on, `?lite=0` disables it).
- Rooms magazine: shadow sits under the closed cover only (no dark patch on the left).
- Nearby locations (phones): poster no longer shows through the faded edges of the zoomed-out aerial view.
- Hero segment buttons: a visible fly-through (~1.6s to 3.6s on a gentle sine curve) with clips on the way preloaded; phones use the same curve.
- Earlier in this round: keyframe-dense hero clips, smoother hero scrub, eased hero segment buttons.

## 3.2.0

- Magazine: phone cover opens the flipbook on tap with an enticing header, swipe hint on a gradient, smoother shadows, and a 40px+ gap under the desktop header.
- Navigation: progress line and percentage on phones too; corner pieces follow the colour behind them.
- Room app: aircon dial number centred; tighter layout on desktop and phones.
- Preloader: diagonal capital EPIISOD lettering.

## 3.1.0

- Room app restyled: cream screen, serif type, dark smart panel, slide-to-unlock door with a 3 second auto-lock, round power buttons, and an aircon page with a ring dial, Heat / Cool / Dry / Fan modes and Auto / Low / Mid / High fan speeds.
- Navigation: line nav on the right shows a fan of section names on hover (desktop) or press and slide (phones); thick progress line with a small percentage; the hero segments sit on the bottom bar.
- Corner pieces (emblem, header links, Scroll label, chevrons) read the real colour behind them.
- Hero holds a quarter of a screen after the rooftop before the next section starts; phones use native scrolling and a lighter scrub.
- Magazine: page-turn fix when going back, an invitation heading and a circular Next / Back cursor.
- Phones: swipeable app copy, amenities names stacked at the foot, cover with blurred backdrop, and several layout fixes.

## 3.0.0

- Rooms: a magazine. Desktop is a book whose pages turn on click (chevron cursor with Next / Back); phones and tablets show the cover, then a full-screen flipbook that folds across the middle of the screen, one page per room with a photo carousel. Content from epiisod.com.
- Location: aerial video scrubs on a canvas, hotspots, a zoomed-out view on phones, and the closing words "At the heart of Macquarie Park" over the building.
- Smart room: the Design section is now a smart room. The photo zooms out to the full width while a phone with the room app (door, four lights, aircon with temperature and fan pages) lets you switch the lights in the photograph, with chimes and spoken confirmations, a door that relocks itself, and a volume control. On phones the picture zooms out beneath a bottom sheet of tiled controls.
- App section: the phone travels from the smart room to the app section; six app screens animate (bottom sheets rise, cards lift out of the phone) with tabs on desktop and swipe plus dots on phones.
- Amenities slider rebuilt from new photographs (gym, sauna, ice bath, yoga studio, rooftop pool) with a readability overlay.
- Navigation: Notion-style line nav on the right (desktop), hero segments on the bottom bar, updated phone menu.
- One page: View rooms glides to the rooms section; Book a tour and Contact are blank for now.
- Removed the previous site credits (console banner, footer credit logo and animation code) and HTML comments.

## 2.2.0

- Story panel: looping ivy video background (no sound, no overlay) replaces the pink flowers, dark chocolate type set in the lower part of the panel, and the panels after it share the video's own backdrop so there is no seam or edge strip.
- Progress pill follows the bar's colours and hides when idle; chevrons rotate when a section scrolls sideways; preloader percentage counter.

## 2.1.0

- Hero flythrough: video scrubs freely with scroll and snaps forward to the end of each clip; no dead scroll between the last clip and the video section; hero lower-right buttons removed.
- Video reveal: arch comes in higher with a smooth upward entrance, text arrives late in the lower third, amenities section sits behind it on exit.
- Section navigation: chevrons moved to the lower right and rotate when a section scrolls sideways; progress pill follows the bar's colours and hides when idle; mobile bar and full-screen section list.
- Preloader percentage counter; Resi-Life carousel navigation tucked closer; Life beyond the classroom arch grows in over a pinned rooms section.

## 2.0.0 — EPIISOD Macquarie Park rebrand

- Rebranded from ERA Residence to EPIISOD Macquarie Park: EPIISOD design-system colours and fonts, new photography, new copy, new logo and favicon.
- New scroll-driven flythrough hero with hoverable amenity pins.
- New arch-video reveal between the hero and the amenities section.
- Amenities section moved up to follow the video; its zoom/fade scroll effect removed.
- Nearby section with real local places; Resi-Life events section with a fanned polaroid carousel.
- Rooms section pinned while the "Life beyond the classroom" arch grows over it.
- Section navigation: progress-bar ticks with hover thumbnails and prev/next on desktop; hairline bar and full-screen list on mobile.
- Mobile and tablet fixes throughout.
