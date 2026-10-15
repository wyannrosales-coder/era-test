/* Arch video reveal — drives the clip-path window from scroll position. */
(function () {
  var sec = document.querySelector('[data-ep-reveal]');
  if (!sec) return;
  var video = sec.querySelector('[data-rv-video]');
  var headerEls = document.querySelectorAll('.header-logo[data-theme], .header-nav[data-theme], .s-bar-w[data-theme]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD = 0.33, EXIT = 0.8;               // stuck phase, in viewport heights: hold, then the exit
  // with the video ring (epiisod-ring.js) the full-screen video does not shrink away: it becomes one panel of the ring,
  // which turns through the other moments while the section stays pinned for RING more screens
  var RING = sec.hasAttribute('data-ep-ring') && !reduce ? 1.15 : 0;
  if (RING) EXIT = 0.0001;
  var LEN_VH = HOLD + (RING || EXIT);
  window.__epRv = { sec: sec, hold: HOLD, ring: RING };
  var vw = 0, vh = 0, len = 0, raf = 0, playing = false, theme = '';
  // Phones and tablets: a flick can travel a whole screen in a fraction of a second, so tying the circle to the scroll
  // made it pop open in a frame. There, crossing a point plays the circle as a timed animation (and scrolling back up
  // plays it in reverse), and the video window is fixed to the screen by the browser instead of being held by script.
  var TOUCH = matchMedia('(hover: none) and (pointer: coarse)').matches && !reduce;
  var OPEN_MS = 1300, CLOSE_MS = 950;
  var anim = { v: 0, from: 0, to: 0, t0: 0, ms: 1, on: false }, tgt = 0, animRaf = 0, lastW = 0;
  if (TOUCH) sec.classList.add('ep-rv--touch');
  function animStep() {
    animRaf = 0;
    update();
    if (anim.on) animRaf = requestAnimationFrame(animStep);
  }
  function animTo(to) {
    if (to === anim.to && (anim.on || anim.v === to)) return;
    anim.from = anim.v; anim.to = to; anim.t0 = performance.now();
    anim.ms = (to ? OPEN_MS : CLOSE_MS) * Math.max(0.35, Math.abs(to - anim.v));
    anim.on = true;
    if (!animRaf) animRaf = requestAnimationFrame(animStep);
  }

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function soft(t) { return t * t * (3 - 2 * t); }

  var roomsPin = document.querySelector('[data-ep-rooms-pin]');
  function measureRooms() {
    if (!roomsPin) return;
    var s = roomsPin.firstElementChild;
    // the "Flexible stays" words sit in the middle of the screen, and stay there for a moment (HOLD) before the Life
    // beyond the classroom arch starts rising over them
    var lead = s.querySelector('.info-s_lead');
    if (lead) {
      lead.style.transform = '';
      var r = lead.getBoundingClientRect(), sr = s.getBoundingClientRect();
      var d = (sr.top + Math.min(s.offsetHeight, window.innerHeight) / 2) - (r.top + r.height / 2);
      lead.style.transform = 'translateY(' + Math.round(d) + 'px)';
    }
    var HOLD = reduce ? 0 : 0.45;
    roomsPin.style.height = (s.offsetHeight + window.innerHeight * (1 + HOLD)) + 'px';
  }

  function measure() {
    // on phones the address bar showing / hiding resizes the window: only a real change of width re-measures, so the
    // page below doesn't jump mid-scroll
    if (TOUCH && lastW && document.documentElement.clientWidth === lastW) { update(); return; }
    lastW = document.documentElement.clientWidth;
    measureRooms();
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    len = vh * LEN_VH;
    sec.style.setProperty('--rv-len', len + 'px');
    update();
  }

  function setTheme(next) {
    if (next === theme) return;
    theme = next;
    headerEls.forEach(function (el) {
      el.classList.remove('theme_on-light', 'theme_on-dark', 'theme_on-color');
      el.classList.add('theme_on-' + next);
    });
  }

  function update() {
    raf = 0;
    var rect = sec.getBoundingClientRect();
    if (TOUCH) vh = window.innerHeight;
    // the video is seen through a perfect circle that sits in the middle of the screen: it grows evenly as the section
    // arrives until it covers the corners, holds full screen, then shrinks back into a circle as it is pushed up and out
    var p1 = clamp((1 - rect.top / vh) * 3.4);   // fully open after ~30% of a screen of scrolling
    if (TOUCH) {
      // open once the section has risen a fifth of the way; close again only when it is back below a tenth (no flicker)
      if (rect.top < vh * 0.8) tgt = 1; else if (rect.top > vh * 0.9) tgt = 0;
      animTo(tgt);
      if (anim.on) {
        var u = clamp((performance.now() - anim.t0) / anim.ms);
        anim.v = lerp(anim.from, anim.to, u);                   // linear here: the shaping below eases it once, not twice
        if (u >= 1) anim.on = false;
      }
      p1 = anim.v;
      // nothing to draw (closed, or the ring has covered it, or the section has gone): let the browser skip it entirely
      sec.classList.toggle('rv-idle', p1 <= 0.001 || rect.bottom < vh * 0.25);
    }
    var y = -rect.top;
    var q = RING ? 0 : clamp((y - (len - EXIT * vh)) / (EXIT * vh));      // the exit
    var e = ease(q);
    var full = Math.sqrt(vw * vw + vh * vh) / 2 + 2;           // radius that covers every corner
    var r0 = Math.min(vw / 6, vh * 0.22);                     // the starting circle: about a third of the width across
    // the circle is born just below the bottom edge of the screen and climbs with the scroll as it grows, reaching the middle
    // (already most of the way to full size) at about 60% of the way in, and filling the screen by the end
    var EZ = TOUCH ? soft : ease;                             // timed on phones: a gentler curve with no sudden middle
    var rise = EZ(clamp(p1 / 0.6));
    var rIn = lerp(r0 * 0.55, full, EZ(p1));
    var cyIn = lerp(vh + r0 * 0.95, vh / 2, rise);
    var r = lerp(rIn, r0, e);
    var o = clamp((r - r0) / (full - r0));                     // 0 small circle .. 1 full screen
    // the window is held to the screen while the section rises (so the circle is never cut by the section's edge); on the
    // way out the video stays put and only the shrinking circle travels up and off the top
    var off = Math.max(0, rect.top);
    var cy = lerp(cyIn, -r0 - 24, e);
    var fs0 = vw < 768 ? 26 : 30, fs1 = vw < 768 ? 38 : Math.max(36, Math.min(vw * 0.042, 66));
    var s = sec.style;
    s.setProperty('--rv-cr', r.toFixed(1) + 'px');
    s.setProperty('--rv-gk', (1 - o).toFixed(3));                 // the gyro drift fades out as the circle fills the screen
    s.setProperty('--rv-cy', cy.toFixed(1) + 'px');
    s.setProperty('--rv-h', vh + 'px');
    if (!TOUCH) s.setProperty('--rv-ty', (-off).toFixed(1) + 'px');
    s.setProperty('--rv-dim', (clamp(p1 * 1.6) * 0.85 * (1 - clamp(q * 8))).toFixed(3));
    s.setProperty('--rv-scale', lerp(1.18, 1, o).toFixed(4));
    s.setProperty('--rv-fs', fs1.toFixed(2) + 'px');
    // the words only arrive once the circle has filled the screen, line by line, and leave as it starts to shrink
    var ct = clamp((p1 - 0.72) / 0.28);                         // the words start arriving while the circle is still finishing
    var c = clamp(ct * 1.4);
    s.setProperty('--rv-copy', c.toFixed(3));
    var seg = function (a, b) { return ease(clamp((ct - a) / (b - a))).toFixed(3); };
    s.setProperty('--rv-t1', seg(0, 0.45));
    s.setProperty('--rv-t2', seg(0.15, 0.6));
    s.setProperty('--rv-t3', seg(0.3, 0.75));
    s.setProperty('--rv-t4', seg(0.45, 0.9));
    s.setProperty('--rv-ttl', (1 - clamp(q / 0.3)).toFixed(3));
    sec.classList.toggle('is-open', c > 0.9 && q < 0.1);
    // only decode video while the section is on screen
    var on = rect.top < vh && rect.bottom > 0;
    if (video && on !== playing) {
      playing = on;
      if (on) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); } else video.pause();
    }
  }

  function tick() { if (!raf) raf = requestAnimationFrame(update); }

  if (reduce) { if (video) { video.removeAttribute('loop'); video.pause(); } return; }
  window.__epFrame.on(update, sec);
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  // layout above us (flythrough height, other sections) can settle late
  var n = 0, iv = setInterval(function () { measure(); if (++n > 12) clearInterval(iv); }, 500);
  measure();
})();
