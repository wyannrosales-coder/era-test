/* "Life beyond the classroom": photos of EPIISOD life lie around the headline like a loose pile of prints. When the section
   first comes into view they spill out from behind the headline (each on its own curve, with its own spin). Afterwards, on a mouse,
   any print can be picked up, thrown and left where it lands: it slides on with friction and bounces off the edges of the section.
   On touch screens a print is picked up by holding it for a moment (a quick swipe still scrolls the page). Reduced motion gets the scatter without the spill or the dragging (the photos are the community's own). */
(function () {
  var track = document.querySelector('[data-sc-track]');
  if (!track) return;
  var stage = track.querySelector('[data-sc-stage]'), head = track.querySelector('.sc_head');
  var cards = [].slice.call(track.querySelectorAll('[data-sc]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TOP = 84;                                                           // clear of the header bar at the top of the sheet
  var BLEED = 0.16;                                                       // on phones a print may hang this far past the screen edge
  var ROT = [-8, 6, -4, 9, 12, -11, -5, 7, 7, -9, 5, -7, 4, -6];       // each print's resting angle
  var bl = function (w) { return sw < 768 ? w * BLEED : 0; };
  // the room a tilted print needs so that no corner, white edge or shadow is ever cut off: worst tilt 12 degrees; a shadow may fall past the section's edge, so the bottom limit is the tilt alone
  function bounds(w, h) {
    var r = 12 * Math.PI / 180, c = Math.cos(r), n = Math.sin(r), ex = Math.ceil((w * c + h * n - w) / 2) + 6, ey = Math.ceil((w * n + h * c - h) / 2) + 2;
    // y0 / y1 keep a resting print whole inside the section; ymin / ymax are how far it can be carried (up past the top, down past the bottom), always leaving 40% of it in view to grab
    return { x0: sw < 768 ? -bl(w) : ex, x1: sw < 768 ? sw - w + bl(w) : sw - w - ex, y0: TOP + ey, y1: sh - h - ey, ymin: Math.round(-0.6 * h), ymax: Math.round(sh - 0.4 * h) };
  }
  var geo = [], st = [], sw = 0, sh = 0, raf = 0, played = false, t0 = 0, zTop = 10, drag = null, spilling = false, t1 = 0;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function measure() {
    sw = stage.clientWidth; sh = stage.clientHeight;
    cards.forEach(function (c) { c.style.setProperty('--fx', 0); c.style.setProperty('--fy', 0); });
    geo = cards.map(function (c, i) {
      var cs = getComputedStyle(c), w = c.offsetWidth, h = c.offsetHeight;
      var bd = bounds(w, h), x = clamp(parseFloat(cs.getPropertyValue('--x')) / 100 * sw, bd.x0, Math.max(bd.x0, bd.x1)), y = clamp(TOP + parseFloat(cs.getPropertyValue('--y')) / 100 * (sh - TOP), bd.y0, Math.max(bd.y0, bd.y1));
      c.style.left = x.toFixed(1) + 'px'; c.style.top = y.toFixed(1) + 'px';       // the kept-clear, kept-whole position
      return { x: x, y: y, w: w, h: h, cx: x + w / 2, cy: y + h / 2, rot: ROT[i % ROT.length], bd: bd };
    });
    st = cards.map(function (c, i) {
      var g = geo[i];
      return { x: 0, y: 0, r: g.rot, s: 1, vx: 0, vy: 0, vr: 0, free: false, arc: (rnd(i, 1) - 0.5) * 260, spin: (rnd(i, 2) - 0.5) * 150, delay: i * 55 + rnd(i, 3) * 90, dur: 950 + rnd(i, 4) * 450 };
    });
    paint(); placeInk();
  }
  // ink under some of the prints: a small cluster of handwriting / doodles per print, put exactly where the print rests (so it is
  // covered completely) and switched on once the prints have landed; drag a print away and the ink is there
  var INKED = { 1: 1, 3: 1, 4: 1, 7: 1, 8: 1, 9: 1, 11: 1, 12: 1, 13: 1, 15: 1, 16: 1 }, inks = [], inkOnce = false;
  (function () {
    var n = { l: 0, p: 0 };
    cards.forEach(function (c, i) {
      var id = +c.getAttribute('data-i'); if (!INKED[id]) { inks[i] = null; return; }
      var o = c.getAttribute('style') && /--ar:\s*2\s*\/\s*3/.test(c.getAttribute('style')) ? 'p' : 'l', k = (n[o]++ * 5 + id) % 6 + 1;
      var im = document.createElement('img'); im.className = 'sc_ink'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.draggable = false; im.decoding = 'async';
      im.src = '/assets/ink/ink-' + o + k + '.svg?v=1'; stage.insertBefore(im, stage.firstChild); inks[i] = im;
    });
  })();
  function placeInk() {
    cards.forEach(function (c, i) {
      var im = inks[i], g = geo[i]; if (!im || !g) return;
      im.style.display = g.w ? '' : 'none';
      im.style.left = g.x.toFixed(1) + 'px'; im.style.top = g.y.toFixed(1) + 'px'; im.style.width = g.w + 'px'; im.style.height = g.h + 'px';
      im.style.transform = 'scale(.84)';
    });
  }
  function inkShow() { if (inkOnce) return; inkOnce = true; inks.forEach(function (im) { if (im) im.classList.add('is-on'); }); }
  function paint(intro) {
    cards.forEach(function (c, i) {
      var s = st[i]; if (!s) return;
      c.style.setProperty('--fx', s.x.toFixed(1)); c.style.setProperty('--fy', s.y.toFixed(1));
      c.style.setProperty('--rot', s.r.toFixed(2)); c.style.setProperty('--s', s.s.toFixed(3));
      c.style.setProperty('--o', (s.o === undefined ? 1 : s.o).toFixed(3));
    });
  }
  // the spill: from the middle of the headline to the print's own spot, on a curve, spinning down to its resting angle
  function spill(now) {
    if (!t1) t1 = now; var t = now - t1, doneAll = true;
    cards.forEach(function (c, i) {
      var g = geo[i], s = st[i], k = clamp((t - s.delay) / s.dur, 0, 1);
      if (k < 1) doneAll = false;
      var e = easeOut(k), over = 1 + Math.sin(k * Math.PI) * 0.04 * (1 - k);
      var sx = sw / 2 - g.cx, sy = sh / 2 - g.cy, len = Math.hypot(sx, sy) || 1;
      var nx = -sy / len, ny = sx / len, bow = Math.sin(k * Math.PI) * s.arc * (1 - k * 0.3);
      s.x = sx * (1 - e) + nx * bow; s.y = sy * (1 - e) + ny * bow;
      s.r = g.rot + s.spin * (1 - e); s.s = (0.5 + 0.5 * e) * over; s.o = clamp(k * 6, 0, 1);
    });
    var hk = easeOut(clamp((t - 700) / 900, 0, 1));
    head.style.opacity = hk.toFixed(3); head.style.transform = 'translate(-50%, -50%) scale(' + (0.95 + 0.05 * hk).toFixed(3) + ')';
    paint();
    return !doneAll || hk < 1;
  }
  // thrown prints: friction, a little spin from the throw, bounce off the walls of the section
  function slide() {
    var moving = false;
    cards.forEach(function (c, i) {
      var s = st[i], g = geo[i]; if (!s.free || (drag && drag.i === i)) return;
      s.x += s.vx; s.y += s.vy; s.r += s.vr; s.vx *= 0.955; s.vy *= 0.955; s.vr *= 0.94;
      var minX = g.bd.x0 - g.x, maxX = g.bd.x1 - g.x, minY = g.bd.ymin - g.y, maxY = g.bd.ymax - g.y;
      if (s.x < minX) { s.x = minX; s.vx = Math.abs(s.vx) * 0.55; s.vr *= -0.6; } else if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx) * 0.55; s.vr *= -0.6; }
      if (s.y < minY) { s.y = minY; s.vy = Math.abs(s.vy) * 0.55; s.vr *= -0.6; } else if (s.y > maxY) { s.y = maxY; s.vy = -Math.abs(s.vy) * 0.55; s.vr *= -0.6; }
      s.s += ((drag && drag.i === i ? 1.06 : 1) - s.s) * 0.2;
      if (Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vr) > 0.05) moving = true;
    });
    paint(); return moving;
  }
  function step(now) {
    raf = 0; var more = false;
    if (!played) return;
    // the spill runs until every print has landed, however long the browser paused the frames
    if (spilling) { if (spill(now)) more = true; else { spilling = false; inkShow(); } }
    if (slide() || drag) more = true;
    if (more) raf = requestAnimationFrame(step);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(step); }
  function play() {
    if (played) return; played = true;
    if (reduce) { head.style.opacity = 1; head.style.transform = 'translate(-50%, -50%)'; paint(); inkShow(); return; }
    t0 = performance.now(); spilling = true; kick();
  }
  // dragging: a mouse picks a print up at once; a finger holds it for a moment first, so a quick swipe still scrolls the page
  if (!reduce) {
    var HOLD = 230;
    cards.forEach(function (c, i) {
      var pend = null;
      c.addEventListener('dragstart', function (e) { e.preventDefault(); });
      c.addEventListener('contextmenu', function (e) { if (drag || pend) e.preventDefault(); });
      function begin(x, y, id, armed) {
        var s = st[i]; s.free = true; s.vx = s.vy = s.vr = 0;
        drag = { i: i, px: x, py: y, sx: s.x, sy: s.y, moved: false, armed: armed, hist: [{ t: performance.now(), x: x, y: y }] };
        c.style.zIndex = ++zTop; c.classList.add('is-drag');
        try { c.setPointerCapture(id); } catch (err) {}
        kick();
      }
      c.addEventListener('pointerdown', function (e) {
        if (!played || spilling) return;
        if (e.pointerType === 'mouse') { if (e.button !== 0) return; begin(e.clientX, e.clientY, e.pointerId, false); return; }
        pend = { x: e.clientX, y: e.clientY, id: e.pointerId };
        clearTimeout(pend.t);
        pend.t = setTimeout(function () {
          if (!pend) return; var p = pend; pend = null;
          begin(p.x, p.y, p.id, true);
          if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) { try { navigator.vibrate(10); } catch (err) {} }
        }, HOLD);
      });
      // once a print is held, the page must not scroll under the finger
      c.addEventListener('touchmove', function (e) { if (drag && drag.i === i && drag.armed && e.cancelable) e.preventDefault(); }, { passive: false });
      c.addEventListener('pointermove', function (e) {
        if (pend) { if (Math.hypot(e.clientX - pend.x, e.clientY - pend.y) > 8) { clearTimeout(pend.t); pend = null; } return; }
        if (!drag || drag.i !== i) return;
        var s = st[i], g = geo[i], dx = e.clientX - drag.px, dy = e.clientY - drag.py;
        if (!drag.moved && Math.hypot(dx, dy) < 5) return;
        drag.moved = true;
        s.x = clamp(drag.sx + dx, g.bd.x0 - g.x, g.bd.x1 - g.x); s.y = clamp(drag.sy + dy, g.bd.ymin - g.y, g.bd.ymax - g.y);
        s.r += (clamp(dx - (drag.lastdx || 0), -20, 20) * 0.35 - (s.r - g.rot) * 0.05); drag.lastdx = dx;
        var now = performance.now(); drag.hist.push({ t: now, x: e.clientX, y: e.clientY });
        while (drag.hist.length > 2 && now - drag.hist[0].t > 90) drag.hist.shift();
        kick();
      });
      function release() {
        if (pend) { clearTimeout(pend.t); pend = null; }
        if (!drag || drag.i !== i) return;
        var s = st[i], h = drag.hist, a = h[0], b = h[h.length - 1], dt = Math.max(16, b.t - a.t);
        if (drag.moved && performance.now() - b.t < 120) {
          s.vx = clamp((b.x - a.x) / dt * 16, -45, 45); s.vy = clamp((b.y - a.y) / dt * 16, -45, 45); s.vr = clamp(s.vx * 0.12, -6, 6);
        }
        c.classList.remove('is-drag'); c._moved = drag.moved || drag.armed; drag = null; kick();
      }
      c.addEventListener('pointerup', release); c.addEventListener('pointercancel', release);
      // a throw (or a hold) must not open Instagram
      c.addEventListener('click', function (e) { if (c._moved) { e.preventDefault(); c._moved = false; } });
    });
  }
  window.addEventListener('resize', function () { if (!drag && !spilling) { measure(); if (!played && !reduce) { cards.forEach(function (c, i) { st[i].o = 0; st[i].s = 0.5; }); paint(); } else if (played) { head.style.opacity = 1; } } });
  var started = false;
  function watch() {
    if (!('IntersectionObserver' in window)) { play(); return; }
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting && es[0].intersectionRatio >= 0.4) { play(); o.disconnect(); } }, { threshold: [0, 0.4, 0.6] }).observe(stage);
  }
  measure();
  if (!reduce) { cards.forEach(function (c, i) { st[i].o = 0; st[i].s = 0.5; }); head.style.opacity = 0; paint(); }
  watch();
})();
