# Changelog

## 3.14.0

- **Phone chapter navigation: tap to open.** Tapping the right-edge lines now opens the chapter list and keeps it open; tap a chapter to jump there, or tap anywhere else to close it. Dragging along the strip and press-and-hold still work too (drag, then let go on a chapter to jump).

- **Build number is easier to see on phones.** On screens under 768 px the "v3.14.0" label moves to the top-right of the loading frame (below the status bar), a little bigger and darker, because the bottom is often covered by the browser toolbar.

- **Build number on the loading screen.** A tiny "v3.14.0" now sits in the bottom-right corner of the loading frame (faint, follows the dark or light colours) so you can tell which build you are looking at after a deploy. Update the number in `dist/index.html` (`.ep-ld_ver`) when the version changes.

- **Phone chapter navigation: no more selecting.** Touching the right-edge strip now cancels the browser's own touch handling (so iOS and Android never start their press-and-hold text / image selection or callout menu), clears any selection that does start, and blocks the selection, context-menu and drag events while a finger is down. The touch area reaches 22 px further left.

- **Phone chapter navigation: touch and drag.** Put a finger on the right-edge lines and drag up or down: the chapter list now opens straight away (after an 8 px move) and you scrub to a chapter and let go to jump. Press-and-hold (0.5 s) still opens it too. While a finger is on the strip, text and image selection, the callout menu and image dragging are switched off, so holding no longer selects photos; the touch area is also a little taller.

- **Glass top bar.** Once you scroll, the header becomes iOS-style frosted glass: a strong blur with boosted colour, a soft white edge highlight and shadow, slightly bolder nav text and a lightly filled Book a Tour button so it stays readable over photos and video. The dark version gets a tinted-brown glass. The open mega menu stays solid, and browsers without blur support fall back to a near-solid bar.

- **Flythrough clips about 40% smaller** (desktop 27.7 MB to 17.7 MB, mobile 15.2 MB to 8.9 MB), re-encoded with ffmpeg (H.264, CRF 30, a keyframe every 6 frames so scroll-scrubbing stays smooth). Similarity to the originals is 96–98% (SSIM), and the side-by-side frame check looked the same.

- **Site optimisation pass.** Original Webflow files (names starting with a 10-character hash) are now cached for a year; our own files keep the 1-day cache with background refresh. All 723 images across the pages decode off the main thread (`decoding="async"`), and `nosniff` is sent on every response. Images were re-checked for further compression and are already tight, and the scroll-scrubbed flythrough clips need their short-keyframe encoding, so both are left alone.

- **Branded page scrollbar.** The browser scrollbar is now a slim gold pill on a track that matches the dark or light version, with a lighter gold on hover (Firefox gets a thin gold bar; phones keep their native overlay bar).

- **Chapter navigation appears faster.** Hovering the right-hand scroll line now opens the chapter list after 0.7 s (was 1.2 s), and on phones a press-and-hold opens it after 0.5 s (was 1.1 s).

- **Life beyond the classroom photos are 50% bigger** (30% bigger on phones). To keep them clear of the headline, desktop now shows 11 of the 16 photos and phones show 6; none cross the headline and all stay whole inside the section.

- **Progress bar and photo travel.** The Design-led progress bar is now a thin full-width bar on the very top edge of the screen, above the header, and appears only while the sideways board is moving. In Life beyond the classroom the photos can now be dragged to within a few pixels of the section's top and bottom edges, and their shadows are no longer cut off at the edge (they fall onto the section below).

- **The Design-led film is 7x smaller.** The film is now played as a small looping picture, so it no longer needs a keyframe every 3 frames for scrubbing: re-encoded at 1280x720 (12.9 MB to 1.9 MB) and 960x540 for phones (6.5 MB to 0.9 MB). Measured against the original, the picture is nearly identical (PSNR 41 dB; pencil lines checked by eye at three moments). The four flythrough clips were tried too but are already tightly encoded for scrubbing (re-encoding made them bigger), so they are unchanged.

- **Life beyond the classroom uses your own photos, and nothing is cut off any more.** The Instagram posts are replaced by 16 of your photos (`assets/life/`, 8 on phones; they are no longer links to Instagram). The section is now truly full width on desktop too (a 38 px gutter was cutting both sides), and every photo is kept whole: the room a tilted photo needs, including its white edge and shadow, is reserved at the top, bottom and (on desktop) the sides, so a photo can be dragged or thrown only as far as that limit. On phones the outer photos may still hang a little past the screen edge. On desktop a photo now lifts, grows slightly and the picture leans in when you hover it.
- **Navigation tidy-up.** The percentage beside the line column is readable again in the light version (it was dark text on a dark pill). The round up and down buttons beside "Scroll" are gone. The "Design-led" progress line is now at the top of the section, under the header, instead of the bottom.

- **The footer's resident pass and strap are redesigned from the Figma ("V5 DESIGN").** Both faces are redrawn to the design (`epiisod-badge.js`, pieces in `assets/badge/`): the front is a dark chocolate card with the large italic E, the EPIISOD wordmark and "Macquarie Park", "Welcome home" with your name (now in Albert Sans), "Resident since 2027", the skyline, the barcode and "Tap to flip"; the back is a cream card with "Book your stay / Your room is waiting.", the two buttons (Book a tour and View rooms still work), the address and the flip cue. The gold clip sits over the slot, and the card is the design's taller shape. The lanyard is the design's: a dark ribbon with sand lettering while the front faces you, sand with dark lettering once the back does (it blends as the card turns), stitched along both edges and lettered "EPIISOD · MACQUARIE PARK". The pass is the same on the light and dark versions; the light version's footer now has the design's cream wash.

- **Mobile and light-version fixes, navigation review, and a lighter site.**
  - The "Design-led student living" card on phones now has the three figures in one row (8 room types, 12 week stays, AU$615 from per week) with a larger headline.
  - Light version: the "EPIISOD Macquarie Park" map label is white on charcoal (it was bronze on charcoal), and the "from AU$615 per week" tag on the magazine cover is pearl with dark text (it was dark on bronze).
  - Life beyond the classroom on phones: the section is full width (the prints were being cut off by a 23 px gutter), the outer prints hang a little past the screen edge, the headline sits above the prints and none cross it. A print can now be picked up on a touch screen by holding it for a moment (a quick swipe still scrolls); it can be thrown like with a mouse.
  - Side navigation: hovering the line column on a desktop now waits 1.2 s before the list of chapters opens, and on a phone you hold for 1.1 s (a tap or swipe opens nothing). A new chapter, "Design-led living", sits between Wellness amenities and Nearby locations (the phone list has it too), so there are now seven on the desktop line and nine in the phone list.
  - Lighter: 109 files that nothing in the site referenced were removed (about 88 MB, mostly seven bougainvillea videos and old Webflow image sizes; they remain in git history), the before/after pictures were recompressed (2.7 MB to 2.0 MB), and `vercel.json` now sets a one-day cache (with a week of stale-while-revalidate) on `/assets/` so repeat visits reuse files instead of re-checking each one.

- **"Design-led student living" is a drawing board that scrolls sideways.** The section is pinned and your vertical scroll moves it left, across four sheets on one continuous graph-paper background: the floating film with its card, then three before-and-after sheets (communal kitchen, study hall, screening room) where the technical drawing sits under the finished photograph and a draggable line between them reveals one or the other (it also works by touch and with the arrow keys, and gives a small sweep when first seen). Each sheet has its own card at the lower left ("Meticulously designed communal areas", "Thoughtfully crafted spaces to focus", "Elegantly furnished to unwind"), a dimension line and corner marks, and eases in once; a thin line at the foot tracks progress. A fifth sheet carries "Everything within reach" (moved here from the Nearby section, whose old screen is now hidden): the graph paper fades slowly to white as the board approaches it, and its label, headline (word by word), line, rules and three walking times each appear in turn. The pictures and cards also drift slightly against the board as they pass, and each sheet's dimension line draws itself. On phones and with reduced motion the sheets stack and scroll normally. Pictures are in `assets/blueprint/` (`epiisod-building.js/.css`).

- **The building section covers the full height again, with a sharper film.** The film is now your 2x-upscaled 16 s cut of Comp 1 (2432x1368), re-rendered at 1600x900 (13 MB; 1024x576, 6.6 MB, on phones) with a keyframe every 3 frames. It has four real stages: the sketch rests at 4.0 s, the line drawing at 7.4 s, the grey model at 11.5 s and the colour render at 15.3 s, so the four accordion rows each have their own picture. The stage is the full screen height; the film is 94% of it, anchored at the bottom, and its top edge colours (paper, white, sky) are carried up behind the header so the tower's roof has room. The film's own zoom (about 2-3%) is cancelled inside the file as before, and a 1.6% crop removes the thin black border the upscaler left round the picture. The previous films are saved in `~/.epiisod-tools`.

- **The "Macquarie Park NSW" panel is removed** (courtyard photo, "Beside Macquarie University", View rooms). The sideways track is now just Nearby.

- **Life beyond the classroom is a loose pile you can throw around.** 14 of @epiisod.au's own posts (`epiisod-social.js/.css`, pictures in `assets/social/`) now lie around the headline like scattered prints: irregular positions and sizes, each at its own angle, heavier at the sides, a few above and below the headline, all whole and inside the section. They spill out from behind the headline once, when the section first comes into view (each on its own curve, spinning down to its angle). On a mouse any print can then be picked up, thrown and left where it lands: it slides with friction and bounces off the edges, the grabbed one comes to the front, and a throw does not open Instagram (a plain click still does). Touch screens and reduced motion get the scatter without the spill or dragging. The section is no longer pinned for scrolling. The pictures are the posts' own carousel slides (about 720x900); some are text posters.
- **The loader no longer throws in a zero-width window** (a hidden or not-yet-sized tab made the border draw with a negative radius and the loader stopped at 0%).
- **The wellness ring no longer tips over to show its inside.** Dragging or hovering the ring tipped it by up to about 25 degrees; with the camera this close, that showed the ring from above as a big hollow ellipse (seen in a short, wide window). The tilt is now capped at about 6 degrees on both axes, whatever the pointer or phone does (`epiisod-ring.js`).
- **Loader, building film and spacing.** The middle I of EPIISOD (the one that opens) now sits in the exact middle of the screen (the word is shifted until it is, and the line beneath stays centred; `epiisod-loader.js`). The building film is the full height of the section again, with no fade at the top (only the soft side edges remain). The gap between the collage and the Resi-Life title is 40 px instead of about 190 px.
- **A title above the Resi-Life carousel:** "Resi-Life events" with the line "Food nights, day trips and farm visits: something on every week, so a room here turns into a community." The collage photos now keep 84 px clear of the top of the sheet (they were reaching its edge, under the header) and 12 px clear of the bottom; before, the script's clamp was never applied to where the cards were drawn.
- **The Life beyond the classroom sheet opens right out.** It still rises as a growing arch over the rooms, but the corners now open to the full, square-cornered sheet instead of stopping as an arch (`epiisod-arch.js`; the section's fixed arch radius is removed in `epiisod-social.css`). The spill of the photos now also finishes if the browser paused the frames.
- **The smart-room phone sits near the right edge** of the screen (about 7.5% in) instead of the middle, with the caption on its left; it still flies to the left for the app section.
- **The Life at EPIISOD circle opens again.** The previous clip on that section (to remove the dark curve over the building section) also cut the circle's top, which grows over the hero; it now clips only the bottom.
- **The building section is as tall as the film.** The pinned stage sits below the header and is exactly the film's height (full width at its own resolution, so the top and bottom are never cut), and the accordion now has the design of "Your residence, in your pocket" (number, serif name, dimmed until open, a bronze line runs under the open row).

- **The building replaces the story panel.** "Design-led student living, where comfort meets lush alfresco courtyards" is now a pinned section (`epiisod-building.js/.css`, film in `assets/building/`): a full-bleed film that the scroll scrubs. The building is pencilled in on paper and rests as a finished sketch, turns into the line drawing on white and rests, then the colour render sweeps in diagonally and settles (11.6 s film; rests at 3.9 s, 8.3 s and the end, with the colour sweep between 8.3 s and 10.6 s). The film is shown at about its own resolution (80% of the screen height, so it stays sharp) and the space around it is filled with the colours of its own left edge (paper, white, sky over ground), blurred, with the film's edges feathered into it. The film's column fills the screen while the sketch is drawn; once it is fully drawn a full-height column slides in on the right (the film narrows to 60% of the screen) with a small title, the four-row accordion (Concept, Design, Materials, Home; scrolling opens the row for the stage on screen and a click jumps to it), the button and one slim line of numbers (8 room types, 12 week stays, from AU$615 a week) at its foot. On phones the film stays on top (58% of the screen) and the column becomes a bottom sheet. The film zooms out and then in by itself; that was measured (building size against the film's last frame, every 0.25 s) and cancelled inside the video file (about 11% of dolly in this film), so every frame has the framing of the finished render and nothing is scaled on the page. The film is fetched as a blob and re-encoded with a keyframe every 3 frames (1280x720 at about 12.7 MB, 960x540 at about 6.4 MB for phones: a higher bitrate, because fine line work turned soft at 4 Mbps). Reduced motion shows the finished render. The ivy film is no longer used; the sideways track now starts at the Macquarie Park panel.

- The dark circle that hung over the top of the building section (the Life at EPIISOD video window, which is taller than its section) is now cut off at the section's bottom edge.
- **Hero waits for Start the tour.** The hero no longer starts by itself: the opening screen holds until the visitor presses Start the tour (or picks a space). After that the tour carries on as before. Going back to the title stops it again; "Watch again" on the end card counts as starting.

- The six pink bougainvillea videos are removed from the page. The middle "Macquarie Park NSW" panel (courtyard photo, "Beside Macquarie University", View rooms) that an earlier edit had deleted is back, so the sideways track is Story, Macquarie Park, Nearby again.

- **Two versions of the site.** Version 1 is the chocolate look (the default). Version 2 drops the tint and follows the Figma design-system colours: pearl `#f4f2f0` and stone `#dcd7d3` surfaces, grey type `#212529 / #343a40 / #6c757d`, chocolate `#391d13` for the stone sections' type, bronze `#896d42` buttons with a 4 px radius, neutral black overlays on video. Switch by clicking the logo in the header (the wordmark in version 1, the emblem in version 2) or pressing Shift+B; `?v=1` / `?v=2` also work. The choice is remembered four ways (local storage, a cookie, session storage and `?v=` in the address, which is kept in step), so a reload stays in the version you chose. The colours ease over half a second, keeping your scroll position. Files: `epiisod-version.js` (runs first, in the head), `epiisod-v2.css` (navigation, loader, tokens, buttons) and `epiisod-v2-auto.css`, generated from the site stylesheets by `python3 tools/make-v2-css.py` (re-run it after changing their brand colours).
- **Version 2 navigation**, from epiisod-test.vercel.app: transparent bar with the links on the left, the emblem centred, Log in, EN and an outlined Book a tour on the right, a burger that opens a white right-hand drawer over a blurred page, and a white blurred slimmer bar once scrolled. Same links as before (About Us, Life @ EPIISOD, Promotions, Contact).
- **Loader**: version 1 is dark chocolate edge to edge (the pale frame is gone). The border is a dim outline that a gold line fills, clockwise from the top centre, as the count reaches 100%; then the other letters step back and the middle I turns gold. The I itself is then the opening: the hero's first frame shows through the letter, held for a moment, and the letter grows until it fills the screen (about 2.7 s for the growth on a first visit, 1.8 s on a return). Version 2's loader is pearl with bronze.

- **Hero, a calmer flight**: the four clips are replaced with the new continuous 1080p dolly clips (lobby, honey timber, amber pendants, facade to pool), re-encoded with a keyframe every 3 frames so scrubbing stays quick (about 7 MB each on desktop, 3.9 MB on phones). A flight now takes about 4.2 s per clip instead of about 2.4 s (one number, `FLIGHT_S` in epiisod-flythrough.js), with a gentler start and stop and longer dissolves between jumps. During a flight the browser plays the clip itself instead of jumping to a new frame on every refresh. Fixed a ghost: the next clip's first frame no longer stays at a few percent over the held frame at the end of a flight. The chocolate overlays belong to version 1 (see below); version 2 uses neutral black ones.
- **Story panel**: the ivy film now sits in a soft rounded window on a white page, with the heading, line, numbers and button below it in dark type; entrance (window, then heading, line, numbers, button) follows the new timing and easing. Our own ivy video is used.

- New loader, after the reference clips: a pearl frame around a chocolate card, a small percentage counting at its foot; then EPIISOD rises with "Sydney · Macquarie Park" beneath it; then the middle I opens, EPI and SOD slide apart and the hero's first frame grows out of the opening until it fills the screen (the opening is a real hole, so what shows through is the hero itself and the last frame matches it exactly). Returning visitors in the same session get a quicker count. The count waits for the page, fonts and the hero's first frame, so it never opens onto nothing. Reduced motion: a short count and a fade.
- Hero: choosing a chapter that is not next door (thumbnails, rail) now cross-dissolves straight there (about a third of a second) instead of flying through the chapters in between; next-door chapters, the chevrons and the tour still fly.
- Hero: the hover hotspots (pins and their cards) are removed.
- Hero: the dip in brightness and the jitter at every seam between clips are fixed. The outgoing scene now stays opaque while the next fades in over it (fading both let the dark backdrop show through the middle of the dissolve: measured about a 15% drop in screen brightness, now flat), and the incoming film runs from its first frame all the way through the dissolve instead of waiting at its first frame and jumping ahead at the midpoint.
  The dissolve is also a little longer during flights, so it reads as a soft blend rather than a flash.
  The extra zoom the dissolve used to add (the outgoing scene pushing in a further 3.8% while the incoming one settled from 4.8% zoomed, plus a peak of blur) is gone: the scenes just blend, and the only movement is the footage's own slow push. No zoom at all remains: the slow push-in that ran through each scene is gone too, so the footage plays at its own size from first frame to last.
- Hero fix (found by stress-testing rapid taps, jumps, reversals, dragging and scrolling away mid-flight): a flight could start over a film that was still downloading, because asking for a clip that was already on its way returned at once. It now waits for that same download and the first frame, with a small ring if it takes more than a moment (slow connections only), instead of "flying" over a still picture and then jumping.

## 3.13.1

(also in this release)
- Smart room on tablets (landscape): the app's panel is filled top to bottom: a roomier title and cards, and the four lights share the free height instead of leaving the lower half empty.
- Smart room on phones (portrait): the sheet is only as tall as its controls need (up to about 60% of the screen) and the picture takes the rest, so it is much taller than before.
- Smart room on phones and tablets: turn or tilt the phone to look left and right across the room (the picture is wider than the screen and slides with the phone; Android works straight away, iPhone through the one-tap "Tilt your phone in 3D" pill). The gyro module now serves any section that registers with it.

- Smart room (desktop): the photograph covers the whole screen when zoomed out, so no band shows above or below it on screens shorter than 16:9.
- Smart room (phones and tablets): the app always fits.
  - Landscape and wide screens (tablets, phones on their side): the photo on the left and the app in a full-height panel on the right.
  - Portrait: the sheet's controls measure the room they have and scale down so every control, including the aircon, is visible; portrait tablets get a shorter picture, a taller sheet and controls capped at a comfortable width.
  - The "Try it" card sits over the picture when the app is at the side.

## 3.13.0

- Footer: the resident pass. An EPIISOD access card hangs from a sand lanyard at the top of the footer; drag it and it swings, tilts and can be flicked into a spin; tap or click it to flip it. The front is a chocolate pass with the emblem and "Welcome home, <your name>" (type a name in the form beside it and it prints on the pass; remembered on that device only); the back is pearl with "Your room is waiting", Book a tour and View rooms buttons on the card itself.
- Built without libraries: a small verlet physics world (rope plus a rigid card that can swing, pitch and spin) drawn with raw WebGL (lanyard ribbon, card edge, card with a soft sheen); phones use the same renderer (capped pixel density, runs only while the footer is on screen) and the lanyard also sways with the phone's tilt where allowed. Reduced motion or no WebGL: a still pass.
- The pass is never cut off: its canvas spans the full screen width (and the whole footer on landscape screens) rather than its column, it is kept inside that area however hard it is dragged or flicked, and the footer's scroll-linked zoom that resized the column is switched off.
- Footer layout: details (emblem, name form, phone, address, legal) left-aligned beside the pass on desktop and landscape; on phones and portrait tablets the pass comes first with the details beneath. The footer's scroll-linked fade no longer dims the pass.

## 3.12.0

- "Where your story begins" now uses the EPIISOD facade photograph (copper-finned tower with the sign), with the words placed for each screen:
  - Landscape (desktop, laptops, landscape tablets and phones): the picture fills the screen, framed so the tower sits to the right, and the heading, paragraph and View rooms button sit in a column on the left over the sky and neighbouring building, with a soft shade behind them. Very short screens drop the paragraph so the rest fits.
  - Portrait (phones, portrait tablets): the tower fills the top of the screen and fades into the chocolate backdrop, with the words and button beneath, so nothing is written over the building.
  - The picture is no longer parallaxed or over-cropped, and the words stay clear of the footer that rises over the end of the section.
- Live well: the video's dark overlay now fades slowly through the hand-off onto the ring (and back in on the way up).
- Phones: the smart room's dark gradient no longer slides up with the words (it covers the foot of the photo); the location aerial gets the drifting clouds in its sky.
- Rooms magazine cover simplified: masthead, one headline ("Eight ways to live well."), "Studios & shared living", and the price on a sand tag.

## 3.11.0

- Smart room invitation, rebuilt: while the app is on screen the room darkens softly around it, a large "Try it - Tap a light and watch the room" card sits beside the phone (above the controls sheet on phones) and a ghost finger taps Desk Lights (the light in the photo really goes off and on). It repeats every few seconds until the visitor touches the app, hides when the section scrolls away and returns when you come back, and has an X to dismiss it.
- After the first touch it becomes a mood challenge: "Set the mood - Turn the lights down for the night" with four dots; with all lights off, "Lights out - Welcome home" and Book a tour.
- Smart room photo: no blurred band around it; as the section scrolls away (either direction) the photo leaves with it instead of being cut by the section's edge.
- Phones: the section line on the right steps aside while the app's controls are up, so the right-hand switches can be tapped.
- Location: the Macquarie University pin sits lower on the tower with its label on the left (above the dot on phones); Macquarie Station and Macquarie Centre swapped.

## 3.10.0

- Rooms magazine: new classic-masthead cover (warm desk-nook photograph, large ROOMS masthead, three readable cover lines, price line) on desktop, tablets and phones alike. Desktop: the heading sits just above the closed cover, and the open book grows to about 86% of the screen height. Fixed the phone/tablet magazine not appearing.
- Smart room: the app demos itself once when it arrives (a notification inside the app, tap ripples on Desk Lights and Main Light dimming the photo, then "Your turn"), silently, stopping as soon as the visitor touches it; after two of their own taps a "Welcome home" note offers Book a tour. Desktop and phones/tablets.
- Smart room intro (two photo panels): the photo now fills both panels at every desktop size (no grey band at the bottom on small laptops).
- In-between sizes (about 768-1400px): the wellness ring text has its own column and the ring is framed beside it; "Flexible stays" no longer slides onto its heading and the flowers stay in the corner on portrait tablets.
- Story (ivy arch): the video always fills the screen with no bands or off-colour gaps, and the words sit higher, together, under the inner arch.
- Location: the sky band matches the aerial footage's blues with a short feather (no seam, nothing covering the tower); the four location points are already on the map when the aerial lands, alongside the address.

## 3.9.0

- Live well: the full-screen video now holds for only about a quarter of a screen (long enough to read the words) before the shrink onto the ring starts, in both directions and on all devices; the ring stays pinned a quarter of a screen after it settles. Previously about 0.75 (phones) to 1 (desktop) screen of scrolling did nothing.
- Hero, first load: no more stutter near the end of the Concierge flight. Upcoming clips are fetched and decoded only after the camera lands, never mid-flight.
- Hero: Back from the Concierge to the opening screen now restarts the tour by itself after about 1.8 s (the restart timer was being cancelled).
- Hero on phones: "or scroll to continue" sits at the foot of the screen; the "Tap or swipe through the spaces" line is removed; no hairline under the header over the hero (phones and tablets).

## 3.8.3

- Wellness ring hand-off on phones: the Live well video shrinks into the ring's front panel as one move, still playing inside it, and dissolves into the panel's own picture only over the last part as it lands. Scrolling back up is the exact mirror: the picture turns back into the video as it lifts off the ring, then the video widens to full screen.
- iPhone: until Safari hands the video's first frame to the 3D ring, the panel uses the video's poster still, so the panel's own picture never shows early.

## 3.8.2

- Wellness ring on phones: the active panel is about 1.7x bigger and sits a little lower, clear of the gyro pill. Neighbouring panels still peek in on smaller phones.

## 3.8.1

Phones and tablets:

- The "Live well" circle and the hand-off onto the wellness ring follow the finger again, through a light smoothing glide with a speed limit: a flick still takes at least 0.8 s (circle) / 0.7 s (ring), so nothing pops or jitters. The circle opens over about 60% of a screen of scrolling.
- Ring hand-off in two steps, mirrored both ways: the video and the front panel cross-fade at full screen, then the panel shrinks into the ring (scrolling up, the panel widens back to full screen and dissolves into the video).
- Fixed the ring layer vanishing at once when scrolling back up; the original "Live well" words no longer show through mid-transition.

## 3.8.0

Phones and tablets (desktop unchanged):

- "Live well" circle plays as a smooth 1.3 s animation once you scroll into it (rising from the bottom and growing to full screen), and in reverse when you scroll back up, so a fast flick can no longer make it pop open or shut.
- The video window is pinned by the browser itself instead of by script: no dark band or lag behind the finger, including when the address bar shows or hides.
- The shrink onto the wellness ring plays as a 1.3 s animation too (reversing on the way back); the full-screen video stops drawing once the ring covers it.
- Ring framing on phones: camera pulled back so the side panels curve in at both edges and it reads as a ring.
- Gyro only runs while the circle or ring is near the screen, and only restyles that section (it used to restyle the whole page every frame).
- The address bar showing or hiding no longer re-measures sections, so the page below doesn't jump.

## 3.7.0

- Gyro 3D on phones: tilting the phone tips and shifts the wellness ring (pitch, lean and camera parallax), and the "Live well" circle drifts with it while small. Android works with no prompt; iPhone shows a small "Tilt your phone in 3D · Enable" pill (Apple's permission prompt) near the circle.
- Live well: the circle is born below the bottom edge and rises as it grows, filling the screen after about 30% of a screen of scrolling; the words arrive while it finishes.
- Hero tour: "Watch the tour again" cuts straight to the opening screen and the tour plays again by itself (the countdown no longer stops); jumping several spaces is one even flight with no stops at the spaces in between.
- Hero tour pauses while the hero is covered by the Live well circle or scrolled away, and carries on from where it stopped (bar included) when you come back.

## 3.6.0

- Wellness ring: after "Live well, study better" fills the screen, scrolling on shrinks that video onto the front panel of a 3D ring of the wellness amenities (Fitness Gym, Sauna, Ice Bath, Yoga Studio, Rooftop Pool & Terrace) on a white background. It replaces the old amenities slider.
  - Drag the ring with a mouse or finger; it follows the pointer, coasts and settles on the nearest panel. Dragging also tilts it in 3D (pitch and lean), and it leans towards the pointer on hover. A ring-shaped "Drag" cursor on desktop.
  - Back / next chevrons (and arrow keys); page scrolling carries on past the section. Amenity text on the left; the lower-right page chevrons stay hidden here.
  - Inactive panels fall into shadow so the active one stands out. Photos use a slow Ken Burns drift until videos are supplied (set `video` on a panel).
  - Scrolling back up dissolves the front panel slowly back into the original video, with the "Live well, study better" words returning.
- Cursor over the first magazine page already reads "View rooms" (3.5.0); this release also adds the ring entry in the section nav ("Wellness amenities").

## 3.5.0

- Hero redesign: one pinned screen; the flythrough plays between spaces (forward or in reverse) instead of scroll-scrubbing.
  - Auto-tour: 0.3 s after the loader the camera flies to the Concierge; each stop's bar fills as a 4 s timer, then the next flight. Any interaction pauses it.
  - Desktop/tablet: chapter cards along the bottom (thumbnail, number, name, timer line). Phones: Stories (bars at the top, tap right/left, hold to pause, drag to scrub live), edge chevrons.
  - Opening screen with "Start the tour" and "or scroll to continue"; end card after the Rooftop (View rooms, Book a tour, Keep scrolling, Watch again).
- Global EPIISOD header (About Us, Life @ EPIISOD and Contact mega menus, Promotions, Book A Tour, View Rooms, Login, EN / 中文; burger panel under 1024px). Hides while scrolling down, returns on scroll up. Logo is a text placeholder until the wordmark file arrives.
- "Live well, study better" reveal is a true circle that grows from the centre to full screen and shrinks back out on exit; text arrives once full screen.
- Location: new canopy-flight aerial video (1440px desktop / 960px phone frames), markers re-placed; EPIISOD marker is a Saf Sand pin with the E and a pulse; labels drop under their dot when they don't fit.
- Rooms magazine: "View rooms" cursor on the cover (desktop); "Open the rooms magazine" button, page arrows and swipe on tablets.
- "Flexible stays" text centres and holds before the Life beyond arch rises.
- Cookie banner removed for now; loader no longer swallows the first tap; right-hand section line hidden over the hero on phones/tablets; bottom-right chevrons appear only after the hero.

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
