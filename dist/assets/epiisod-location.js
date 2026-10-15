/* Location: scrubs an aerial flight (a WebP frame sequence drawn on a canvas, so it plays smoothly in every browser) with
   the scroll, and shows four hotspots only through the middle of the section. Pin positions are fractions of the 16:9
   frame, keyed to three moments of the clip because the camera drifts. */
(function () {
  var sec = document.getElementById('location');
  if (!sec) return;
  var pin = sec.querySelector('[data-loc-pin]');
  var sky = sec.querySelector('[data-loc-sky]');
  var canvas = sec.querySelector('[data-loc-canvas]');
  var ctx = canvas.getContext('2d');
  var text = sec.querySelector('[data-loc-text]');
  var layer = sec.querySelector('[data-loc-pins]');
  var pts = [].slice.call(sec.querySelectorAll('[data-loc-pt]'));
  var endBox = sec.querySelector('[data-loc-end]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Reduce Motion: the map is a still with its labelled dots, and the closing words follow as their own white section
  if (reduce) { sec.classList.add('is-rm'); if (endBox) { sec.appendChild(endBox); endBox.classList.add('is-in'); } }
  var FRAME = 16 / 9;
  // the canopy flight (8 s): an aerial drift towards EPIISOD (0-2.4 s, 16 frames a second), then a dive through the
  // treetops that settles on the building (10 a second). Phones load a lighter 960px set.
  var FRAMES = 94, DUR = 8.0, DRIFT = 2.4;
  var DIR = (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches) ? '/assets/location/frames-m/' : '/assets/location/frames/';
  var KT = [0.3, 1.3, 2.3];
  var KP = {
    uni:     [[0.432, 0.090], [0.427, 0.078], [0.424, 0.060]],   // the dark university tower
    station: [[0.611, 0.159], [0.615, 0.143], [0.615, 0.125]],   // by the cranes, at the top-left of the centre
    centre:  [[0.711, 0.238], [0.722, 0.224], [0.732, 0.200]],   // Macquarie Centre's roofs
    home:    [[0.535, 0.409], [0.536, 0.400], [0.541, 0.378]]    // EPIISOD: the grey and brown building
  };
  var vw = 0, vh = 0, raf = 0, sp = 0, open = null, dpr = 1, lastKey = '';
  var imgs = new Array(FRAMES), ready = new Array(FRAMES);
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pad(i) { return (i < 10 ? '00' : i < 100 ? '0' : '') + i; }

  // section progress -> clip time: arrive, a slow drift over the aerial view (hotspots live here), then the dive
  function timeAt(p) {
    if (p < 0.12) return lerp(0, KT[0], p / 0.12);
    if (p < 0.72) return lerp(KT[0], KT[2], (p - 0.12) / 0.6);
    return lerp(KT[2], DUR - 0.05, smooth((p - 0.72) / 0.18));
  }
  // where the 16:9 frame sits in the pin (css px). Desktop: like object-fit cover. Portrait phones: zoomed out so every
  // hotspot is in view during the aerial drift, easing back to a full-bleed cover for the dive
  var FV = 0.4;                               // fraction of the frame's width visible on a phone during the drift
  function layout(t) {
    if (vw / vh >= 0.9) {
      var dw = vw / vh > FRAME ? vw : vh * FRAME;
      return { dw: dw, dh: dw / FRAME, x: (vw - dw) / 2, y: (vh - dw / FRAME) / 2, zo: 0 };
    }
    var zo = 1 - smooth((t - KT[2]) / 1.6);
    var cover = vw / (vh * FRAME), fv = lerp(cover, FV, zo);
    var w = vw / fv, h = w / FRAME, xc = lerp(0.5, 0.575, zo), yc = lerp(0.5, 0.3, zo);
    return { dw: w, dh: h, x: vw / 2 - xc * w, y: vh * lerp(0.5, 0.47, zo) - yc * h, zo: zo };
  }
  function posAt(k, t) {
    var a = KP[k], f = clamp((t - KT[0]) / (KT[2] - KT[0])) * 2, i = Math.min(1, Math.floor(f)), u = f - i;
    return [lerp(a[i][0], a[i + 1][0], u), lerp(a[i][1], a[i + 1][1], u)];
  }

  // load the frames in order, a few at a time, but only once the section is within a couple of screens (the hero and the
  // page above get the bandwidth first); whatever has arrived is what gets drawn
  var started = false;
  function startLoad() {
    if (!lastKey && !ready.some(Boolean)) canvas.classList.add('is-poster');
    if (started) return; started = true;
    if (reduce) { fetchOne(21); return; }      // Reduce Motion: one still of the aerial drift (t = 1.3), dots on top
    var next = 0, active = 0, MAX = 6;
    function pump() {
      while (active < MAX && next < FRAMES) { (function (i) { active++; fetchOne(i, function () { active--; pump(); }); })(next++); }
    }
    pump();
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) startLoad(); }, { rootMargin: '250% 0px 100% 0px' }).observe(sec); else startLoad();
  function fetchOne(i, done) {
    var im = new Image();
    // decode off the main thread before the frame is ever drawn, so showing it for the first time costs nothing
    function keep(src) { imgs[i] = src; ready[i] = true; lastKey = ''; tick(); if (done) done(); }
    im.onload = function () {
      if (window.createImageBitmap) createImageBitmap(im).then(keep, function () { keep(im); });
      else if (im.decode) im.decode().then(function () { keep(im); }, function () { keep(im); });
      else keep(im);
    };
    im.onerror = function () { if (done) done(); };
    im.src = DIR + 'f' + pad(i) + '.webp';
  }
  function nearest(i, dir) {
    for (var k = i; k >= 0 && k < FRAMES; k += dir) if (ready[k]) return k;
    return -1;
  }

  function measure() {
    vw = pin.clientWidth; vh = pin.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    lastKey = '';
    update();
  }
  // draw like object-fit: cover, blending the two frames either side of the exact time
  function draw(t) {
    // 16 frames a second through the aerial drift, 10 a second for the dive
    var fp = Math.max(0, Math.min(FRAMES - 1.001, t < DRIFT ? t * 16 : DRIFT * 16 + (t - DRIFT) * 10)), i0 = Math.floor(fp), u = fp - i0;
    var a = nearest(i0, -1), b = nearest(i0 + 1, 1);
    if (a < 0 && b < 0) return;
    if (a < 0) a = b;
    if (b < 0) b = a;
    var L = layout(t), k = canvas.width / vw;
    var key = a + ':' + b + ':' + u.toFixed(2) + ':' + canvas.width + ':' + L.y.toFixed(1) + ':' + L.dw.toFixed(1);
    if (key === lastKey) return;
    lastKey = key;
    var im = imgs[a], cw = canvas.width, ch = canvas.height;
    var x = L.x * k, y = L.y * k, w = L.dw * k, h = L.dh * k;
    ctx.clearRect(0, 0, cw, ch);
    ctx.globalAlpha = 1;
    ctx.drawImage(im, x, y, w, h);
    // the poster is only a stand-in until the first frame: behind the faded edges of the zoomed-out phone view it would
    // show through as a second, mismatched picture
    if (canvas.classList.contains('is-poster')) canvas.classList.remove('is-poster');
    // a full soft cross-fade between neighbouring frames, so the footage flows instead of stepping (the lite mode keeps
    // only the nearest frame)
    var ba = window.__epLite ? (u < 0.5 ? 0 : 1) : u;
    if (b !== a && ba > 0.01) { ctx.globalAlpha = ba; ctx.drawImage(imgs[b], x, y, w, h); ctx.globalAlpha = 1; }
    // zoomed out: the picture's top and bottom edges melt into the backdrop colours
    if (L.zo > 0.001 && (y > 0 || y + h < ch)) {
      ctx.globalCompositeOperation = 'destination-out';
      var ft = h * 0.1, fb = h * 0.2, g = ctx.createLinearGradient(0, y, 0, y + ft);
      g.addColorStop(0, 'rgba(0,0,0,' + L.zo + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, y, cw, ft);
      g = ctx.createLinearGradient(0, y + h - fb, 0, y + h);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + L.zo + ')');
      ctx.fillStyle = g; ctx.fillRect(0, y + h - fb, cw, fb + 1);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function setOpen(pt) {
    if (open === pt) return;
    if (open) { open.classList.remove('is-open'); open.querySelector('.ep-loc_dot').setAttribute('aria-expanded', 'false'); }
    open = pt;
    if (open) { open.classList.add('is-open'); open.querySelector('.ep-loc_dot').setAttribute('aria-expanded', 'true'); }
  }

  function update() {
    raf = 0;
    var rect = sec.getBoundingClientRect();
    var skyH = sky ? sky.offsetHeight : 0;
    var span = Math.max(1, rect.height - skyH - vh);
    var p = clamp(-(rect.top + skyH) / span);
    // an eased glide (~150ms, the same at any refresh rate) toward the scroll position
    var now = performance.now(), dt = Math.min(0.1, Math.max(0.004, (now - (update.__t || now)) / 1000)); update.__t = now;
    sp += (p - sp) * (1 - Math.exp(-dt / 0.15));
    if (Math.abs(p - sp) > 0.0003) raf = requestAnimationFrame(update); else { sp = p; update.__t = 0; }
    var t = reduce ? 1.3 : timeAt(sp);
    draw(t);

    // text is there on arrival and gives way to the dive
    var to = 1 - smooth((sp - 0.66) / 0.1);
    text.style.opacity = to.toFixed(3);
    text.style.transform = 'translateY(' + ((1 - to) * 24).toFixed(1) + 'px)';

    // the closing words arrive as the building fills the frame
    if (endBox && !reduce) { if (sp > 0.9) endBox.classList.add('is-in'); else if (sp < 0.84) endBox.classList.remove('is-in'); }

    // hotspots: already there as the aerial settles at the top of the screen (they fade in over the last quarter screen
    // of its arrival), alongside the address, and leave with it before the dive
    var arrive = clamp(1 - (rect.top + skyH) / (vh * 0.25));
    var o = reduce ? 1 : smooth(arrive) * (1 - smooth((sp - 0.66) / 0.06));
    layer.style.opacity = o.toFixed(3);
    var on = o > 0.5;
    layer.classList.toggle('is-on', on);
    if (!on && open) setOpen(null);

    var tt = Math.min(KT[2], Math.max(KT[0], t));
    var LY = layout(t), dw = LY.dw, dh = LY.dh;
    pts.forEach(function (pt) {
      var k = pt.getAttribute('data-loc-pt'), xy = posAt(k, tt);
      var x = LY.x + xy[0] * dw, y = LY.y + xy[1] * dh;
      pt.style.left = x.toFixed(1) + 'px';
      pt.style.top = y.toFixed(1) + 'px';
      // the label sits to the right of its dot; it flips left near the right edge, and goes under the dot when it fits
      // neither side (narrow phones), keeping clear of the section line on the right
      var lab = pt.querySelector('.ep-loc_label'), lw = (lab.__w = lab.__w || lab.offsetWidth), gap = pt.getAttribute('data-loc-pt') === 'home' ? 32 : 20, edge = vw - 44;
      var fitsR = x + gap + lw < edge, fitsL = x - gap - lw > 12;
      pt.classList.toggle('is-flip', !fitsR && fitsL);
      pt.classList.toggle('is-under', !fitsR && !fitsL);
      var below = y < vh * 0.5;
      pt.classList.toggle('is-below', below);
      pt.classList.toggle('is-above', !below);
      pt.style.display = (x < 20 || x > vw - 20 || y < 20 || y > vh - 20) ? 'none' : '';
      var card = pt.querySelector('.ep-loc_card');
      var cx = Math.max(12, Math.min(vw - 12 - card.offsetWidth, x - card.offsetWidth / 2));
      card.style.marginLeft = (cx - x).toFixed(1) + 'px';
      card.style.left = '0px';
    });
  }
  function tick() { if (!raf) raf = requestAnimationFrame(update); }

  // hover (desktop) / tap (touch) opens a card
  pts.forEach(function (pt) {
    var dot = pt.querySelector('.ep-loc_dot'), label = pt.querySelector('.ep-loc_label');
    function enter() { if (layer.classList.contains('is-on')) setOpen(pt); }
    pt.addEventListener('mouseenter', enter);
    pt.addEventListener('mouseleave', function () { if (open === pt) setOpen(null); });
    dot.addEventListener('focus', enter);
    dot.addEventListener('click', function (e) { e.stopPropagation(); setOpen(open === pt ? null : pt); });
    label.addEventListener('click', function (e) { e.stopPropagation(); setOpen(open === pt ? null : pt); });
  });
  pin.addEventListener('click', function () { setOpen(null); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(null); });

  window.__epFrame.on(tick, sec);
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  // the picture is sized from the pin, which can still be settling when the script first runs (fonts, images above it),
  // so keep it in step with the pin's real size instead of trusting one early measurement
  if (window.ResizeObserver) new ResizeObserver(function () { if (pin.clientWidth !== vw || pin.clientHeight !== vh) measure(); }).observe(pin);
  var n = 0, iv = setInterval(function () { if (pin.clientWidth !== vw || pin.clientHeight !== vh || !canvas.width) measure(); if (++n > 40) clearInterval(iv); }, 500);
  document.addEventListener('visibilitychange', function () { lastKey = ''; tick(); });
  measure();
})();
