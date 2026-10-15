# Changelog

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
