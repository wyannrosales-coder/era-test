/* The loader. A pearl frame around a chocolate card, a percentage counting at its foot; then EPIISOD rises with
   "Sydney · Macquarie Park" beneath it; then the middle I opens, the two halves slide apart and the hero's first frame
   grows out of the opening until it fills the screen. The frame, card and opening are drawn on a canvas (the opening is a
   hole, so what shows through is the real hero, and the last frame matches it exactly). era-main.js hands over to
   window.__epLoader.run(quick, done); done() runs when the opening is complete (it unlocks scroll and lets the hero's tour
   start). Returning visitors in the same session get a quicker count. */
(function () {
  var el = document.getElementById('ep-ld');
  if (!el) return;
  var cv = el.querySelector('.ep-ld_cv'), ctx = cv.getContext('2d');
  var mark = el.querySelector('.ep-ld_mark'), word = el.querySelector('.ep-ld_word'), sub = el.querySelector('.ep-ld_sub');
  var wl = el.querySelector('[data-ld="l"]'), wi = el.querySelector('[data-ld="i"]'), wr = el.querySelector('[data-ld="r"]');
  var count = el.querySelector('.ep-ld_count'), nEl = el.querySelector('.ep-ld_n'), fill = el.querySelector('.ep-ld_line b');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, M = 16, R = 6, sheen = null, geo = null, prog = 0;
  // version 1: dark chocolate edge to edge, the gold fills the border as the count climbs. Version 2: pearl, bronze.
  var V2 = document.documentElement.getAttribute('data-ep-ver') === '2';
  var PAL = V2 ? { bg: '#f4f2f0', track: 'rgba(33,37,41,.14)', fill: '#896d42', spot: '#896d42' }
               : { bg: null, track: 'rgba(208,167,127,.24)', fill: '#d0a77f', spot: '#d0a77f' };

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function inOutCubic(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function inOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  function size() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var cs = getComputedStyle(el); M = parseFloat(cs.getPropertyValue('--ld-m')) || 16; R = parseFloat(cs.getPropertyValue('--ld-r')) || 6;
    if (!M || isNaN(M)) M = Math.max(10, Math.min(30, W * 0.022));
    sheen = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.max(W, H) * 0.7);
    sheen.addColorStop(0, '#33190f'); sheen.addColorStop(0.6, '#24120c'); sheen.addColorStop(1, '#1c0e09');
  }
  // frame, card and (optionally) the opening, punched out so the page shows through
  var borderA = 1;
  function draw(rect, glyph) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = PAL.bg || sheen; ctx.fillRect(0, 0, W, H);
    if (borderA > 0) borderLine(borderA);
    if (rect || glyph) {
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
      if (glyph) {                                   // the letter I itself is the opening: the page shows through its shape
        ctx.save(); ctx.translate(geo.cx, geo.cy); ctx.scale(glyph, glyph); ctx.translate(-geo.cx, -geo.cy);
        ctx.font = geo.font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('I', geo.gx, geo.base); ctx.restore();
      }
      if (rect) { rr(ctx, rect.x, rect.y, rect.w, rect.h, rect.r); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // the border: a dim outline all the way round, with the gold running clockwise from the top centre as the count climbs
  function borderLine(a) {
    var x = M, y = M, w = W - 2 * M, h = H - 2 * M, r = Math.min(R, w / 2, h / 2);
    function path() {
      ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    var L = 2 * (w + h) - 8 * r + 2 * Math.PI * r;
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    ctx.strokeStyle = PAL.track; path(); ctx.stroke();
    if (prog > 0) { ctx.strokeStyle = PAL.fill; ctx.lineCap = 'round'; ctx.setLineDash([Math.max(0.01, L * prog), L * 2]); path(); ctx.stroke(); }
    ctx.restore();
  }

  // where the I is, and how big the opening starts: a stem the width and height of the letter
  function measure() {
    var wr_ = wi.getBoundingClientRect(), fs = parseFloat(getComputedStyle(word).fontSize) || 80;
    var cap = fs * 0.7;
    var g = document.createElement('canvas').getContext('2d'); g.font = getComputedStyle(word).font;
    var m = g.measureText('I'), asc = m.actualBoundingBoxAscent || cap, fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
    var base = (fa != null && fd != null) ? wr_.top + (wr_.height - (fa + fd)) / 2 + fa : wr_.top + wr_.height * 0.78;
    geo = { cx: wr_.left + wr_.width / 2, cy: base - asc / 2, iw: wr_.width, stemW: Math.max(3, fs * 0.075), stemH: asc, fs: fs, gx: wr_.left, base: base, font: g.font, adv: g.measureText('I').width };
  }
  function holeRect(u1, u2) {                 // u1: stem -> window, u2: window -> full screen
    var g = geo, w1 = Math.min(W * 0.27, 430), h1 = Math.min(H * 0.46, w1 * 0.78);
    var x0 = g.cx - g.stemW / 2, y0 = g.cy - g.stemH / 2;
    var x1 = g.cx - w1 / 2, y1 = g.cy - h1 / 2;
    var e1 = outCubic(clamp(u1)), e2 = inOutCubic(clamp(u2));
    var x = lerp(lerp(x0, x1, e1), 0, e2), y = lerp(lerp(y0, y1, e1), 0, e2);
    var r = lerp(lerp(g.stemW / 2, Math.min(R, 8), e1), 0, e2);
    var rt = lerp(lerp(g.stemW, w1, e1), W, e2) + x;     // right edge
    var bt = lerp(lerp(g.stemH, h1, e1), H, e2) + y;     // bottom edge
    var wNow = lerp(lerp(g.stemW, w1, e1), W, e2);
    return { x: x, y: y, w: rt - x, h: bt - y, r: r, widthNow: wNow };
  }

  var running = false, finished = false;
  function finish(done) {
    if (finished) return; finished = true; running = false;
    try { el.parentNode && el.parentNode.removeChild(el); } catch (e) {}
    window.__epLoaderDone = true;
    try { document.dispatchEvent(new CustomEvent('ep-loader-done')); } catch (e) {}
    if (done) try { done(); } catch (e) {}
  }

  var chars = [].slice.call(el.querySelectorAll('.ep-ld_c > i'));
  function showWord(quick) {
    var dur = quick ? 600 : 900, gap = quick ? 45 : 70;
    chars.forEach(function (c, i) { c.animate([{ transform: 'translateY(112%)' }, { transform: 'translateY(0)' }], { duration: dur, delay: i * gap, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }); });
    sub.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: quick ? 500 : 800, delay: quick ? 220 : 380, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
  }
  function ready() {                                                  // the page loaded and the hero's first frame is decoded
    var poster = (document.querySelector('link[rel="preload"][as="image"][href*="poster1"]') || {}).href || '/assets/flythrough/poster1.jpg?v=1792820100';
    var img = new Image(); img.src = poster;
    var imgReady = img.decode ? img.decode().catch(function () {}) : new Promise(function (r) { img.onload = img.onerror = r; });
    // ...and the hero's own first frame, if it can be ready in time (otherwise the poster, which is the same picture, stands in)
    var vid = new Promise(function (r) { var n = 0, iv = setInterval(function () { var v = document.querySelector('.ep-fly_video'); if ((v && v.readyState >= 2) || ++n > 30) { clearInterval(iv); r(); } }, 100); });
    var loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(function (r) { window.addEventListener('load', r, { once: true }); });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return Promise.all([imgReady, vid, Promise.race([loaded, new Promise(function (r) { setTimeout(r, 6000); })]), fonts]);
  }

  function run(quick, done, begin) {
    if (running || finished) return; running = true;
    var root = document.documentElement; root.classList.add('ep-ld-hide');
    var shown = false;
    function showHero() { if (shown) return; shown = true; root.classList.remove('ep-ld-hide'); root.classList.add('ep-ld-in'); setTimeout(function () { root.classList.remove('ep-ld-in'); }, 1000); }
    if (reduce) {
      var rs = function () { root.classList.remove('ep-ld-hide'); };                                                     // no split: the count, then the frame lifts away
      size(); el.classList.add('is-canvas'); draw(null); mark.style.opacity = 0;
      var t0r = performance.now(), okr = false; ready().then(function () { okr = true; });
      (function tickR(now) {
        var p = clamp((now - t0r) / 700); prog = okr ? p : Math.min(p, .9); draw(null); nEl.textContent = Math.round(prog * 100) + ' %'; fill.style.transform = 'scaleX(' + p + ')';
        if (p >= 1 && okr) { rs(); el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: 'forwards' }).onfinish = function () { finish(done); }; return; }
        requestAnimationFrame(tickR);
      })(performance.now());
      return;
    }
    size(); measure(); el.classList.add('is-canvas'); draw(null);
    window.addEventListener('resize', function () { if (!finished) { size(); measure(); } });
    var okReady = false; ready().then(function () { okReady = true; });
    // phases (ms): count, counter out, EPIISOD in, hold, stem + window (open1), window -> full screen (open2)
    var D = { count: quick ? 700 : 2100, out: 260, word: quick ? 650 : 950, hold: quick ? 380 : 760, cut: quick ? 560 : 950, grow: quick ? 1800 : 2700 };
    var t0 = performance.now(), phase = 'count', pt = t0, started = { word: false, open: false, tx: false };
    var safety = setTimeout(function () { if (!finished) { showHero(); el.style.transition = 'opacity .4s'; el.style.opacity = 0; setTimeout(function () { finish(done); }, 450); } }, 14000);
    function frame(now) {
      if (finished) { clearTimeout(safety); return; }
      var t = now - pt;
      if (phase === 'count') {
        var u = clamp(t / D.count), p = inOutSine(u) * 100;
        if (!okReady) p = Math.min(p, 91);
        nEl.textContent = Math.floor(p) + ' %'; fill.style.transform = 'scaleX(' + (p / 100) + ')'; prog = p / 100; draw(null);
        if (u >= 1 && okReady) { nEl.textContent = '100 %'; fill.style.transform = 'scaleX(1)'; prog = 1; draw(null); phase = 'out'; pt = now; }
      } else if (phase === 'out') {
        var o = clamp(t / D.out); count.style.opacity = 1 - o; count.style.transform = 'translateX(-50%) translateY(' + (o * 10) + 'px)';
        if (o >= 1) { phase = 'word'; pt = now; showWord(quick); measure(); }
      } else if (phase === 'word') {
        // the letters are in: the others step back and the I turns gold, so it reads as the doorway
        if (!started.spot && t >= D.word) {
          started.spot = true;
          var sd = quick ? 320 : 520;
          [wl, wr].forEach(function (w) { w.animate([{ opacity: 1 }, { opacity: 0.22 }], { duration: sd, easing: 'ease-out', fill: 'forwards' }); });
          wi.animate([{ color: getComputedStyle(wi).color }, { color: PAL.spot }], { duration: sd, easing: 'ease-out', fill: 'forwards' });
        }
        if (t >= D.word + D.hold) { phase = 'open'; pt = now; measure(); wi.style.opacity = 0; [wl, wr].forEach(function (w) { w.getAnimations().forEach(function (an) { an.cancel(); }); w.style.opacity = 0.22; }); sub.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }); try { begin && begin(); } catch (e) {} }
      } else if (phase === 'open') {
        // 1) the I is a cut-out: the first frame of the hero shows inside the letter, held for a moment
        // 2) the letter grows until it fills the screen (an opening grows from its stem to cover the rest), the hero with it
        var ug = clamp((t - D.cut) / D.grow), eg = inOutCubic(ug);
        var S = Math.max(8, (W * 0.5) / geo.stemW);
        var s = Math.exp(Math.log(S) * eg) * (1 + 0.035 * clamp(t / D.cut) * (1 - ug));
        var er = inOutCubic(clamp((ug - 0.5) / 0.5));
        var rect = er > 0 ? { x: lerp(geo.cx - geo.stemW / 2, 0, er), y: lerp(geo.cy - geo.stemH / 2, 0, er), w: lerp(geo.stemW, W, er), h: lerp(geo.stemH, H, er), r: lerp(geo.stemW / 2, 0, er) } : null;
        borderA = 1 - clamp(t / (D.cut * 0.9));
        draw(rect, s);
        // the other letters keep clear of the growing I and fade as it takes the screen
        var half = Math.max(0, (s - 1) * geo.adv / 2) * 1.04;
        wl.style.transform = 'translateX(' + (-half) + 'px)'; wr.style.transform = 'translateX(' + half + 'px)';
        var fo = 0.22 * (1 - clamp(ug / 0.45)); wl.style.opacity = fo; wr.style.opacity = fo;
        if (ug > 0.4) showHero();
        if (ug >= 1) { showHero(); finish(done); return; }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  window.__epLoader = { run: run };
})();
