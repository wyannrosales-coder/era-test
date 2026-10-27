/* "Life beyond the classroom": the EPIISOD Instagram posts lie around the headline like a loose pile of prints. When the section
   first comes into view they spill out from behind the headline (each on its own curve, with its own spin). Afterwards, on a mouse,
   any print can be picked up, thrown and left where it lands: it slides on with friction and bounces off the edges of the section.
   Touch screens and reduced motion get the same scatter without the spill or the dragging (the posts are links to Instagram). */
(function () {
  var track = document.querySelector('[data-sc-track]');
  if (!track) return;
  var stage = track.querySelector('[data-sc-stage]'), head = track.querySelector('.sc_head');
  var cards = [].slice.call(track.querySelectorAll('[data-sc]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var ROT = [-8, 6, -4, 9, 12, -11, -5, 7, 7, -9, 5, -7, 4, -6];       // each print's resting angle
  var geo = [], st = [], sw = 0, sh = 0, raf = 0, played = false, t0 = 0, zTop = 10, drag = null, spilling = false, t1 = 0;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  function measure() {
    sw = stage.clientWidth; sh = stage.clientHeight;
    cards.forEach(function (c) { c.style.setProperty('--fx', 0); c.style.setProperty('--fy', 0); });
    geo = cards.map(function (c, i) {
      var cs = getComputedStyle(c), w = c.offsetWidth, h = c.offsetHeight;
      var x = clamp(parseFloat(cs.getPropertyValue('--x')) / 100 * sw, 10, sw - w - 10), y = clamp(parseFloat(cs.getPropertyValue('--y')) / 100 * sh, 10, sh - h - 10);
      return { x: x, y: y, w: w, h: h, cx: x + w / 2, cy: y + h / 2, rot: ROT[i % ROT.length] };
    });
    st = cards.map(function (c, i) {
      var g = geo[i];
      return { x: 0, y: 0, r: g.rot, s: 1, vx: 0, vy: 0, vr: 0, free: false, arc: (rnd(i, 1) - 0.5) * 260, spin: (rnd(i, 2) - 0.5) * 150, delay: i * 55 + rnd(i, 3) * 90, dur: 950 + rnd(i, 4) * 450 };
    });
    paint();
  }
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
      var minX = -g.x, maxX = sw - g.w - g.x, minY = -g.y, maxY = sh - g.h - g.y;
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
    if (spilling) { if (spill(now)) more = true; else spilling = false; }
    if (slide() || drag) more = true;
    if (more) raf = requestAnimationFrame(step);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(step); }
  function play() {
    if (played) return; played = true;
    if (reduce) { head.style.opacity = 1; head.style.transform = 'translate(-50%, -50%)'; paint(); return; }
    t0 = performance.now(); spilling = true; kick();
  }
  // dragging (mouse only; touch keeps scrolling and the links)
  if (fine && !reduce) {
    cards.forEach(function (c, i) {
      c.addEventListener('dragstart', function (e) { e.preventDefault(); });
      c.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || !played || spilling) return;
        var s = st[i]; s.free = true; s.vx = s.vy = s.vr = 0;
        drag = { i: i, px: e.clientX, py: e.clientY, sx: s.x, sy: s.y, moved: false, hist: [{ t: performance.now(), x: e.clientX, y: e.clientY }] };
        c.style.zIndex = ++zTop; c.classList.add('is-drag');
        try { c.setPointerCapture(e.pointerId); } catch (err) {}
        kick();
      });
      c.addEventListener('pointermove', function (e) {
        if (!drag || drag.i !== i) return;
        var s = st[i], g = geo[i], dx = e.clientX - drag.px, dy = e.clientY - drag.py;
        if (!drag.moved && Math.hypot(dx, dy) < 5) return;
        drag.moved = true;
        s.x = clamp(drag.sx + dx, -g.x, sw - g.w - g.x); s.y = clamp(drag.sy + dy, -g.y, sh - g.h - g.y);
        s.r += (clamp(dx - (drag.lastdx || 0), -20, 20) * 0.35 - (s.r - g.rot) * 0.05); drag.lastdx = dx;
        var now = performance.now(); drag.hist.push({ t: now, x: e.clientX, y: e.clientY });
        while (drag.hist.length > 2 && now - drag.hist[0].t > 90) drag.hist.shift();
        kick();
      });
      function release(e) {
        if (!drag || drag.i !== i) return;
        var s = st[i], h = drag.hist, a = h[0], b = h[h.length - 1], dt = Math.max(16, b.t - a.t);
        if (drag.moved && performance.now() - b.t < 120) {
          s.vx = clamp((b.x - a.x) / dt * 16, -45, 45); s.vy = clamp((b.y - a.y) / dt * 16, -45, 45); s.vr = clamp(s.vx * 0.12, -6, 6);
        }
        c.classList.remove('is-drag'); c._moved = drag.moved; drag = null; kick();
      }
      c.addEventListener('pointerup', release); c.addEventListener('pointercancel', release);
      // a throw must not open Instagram
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
