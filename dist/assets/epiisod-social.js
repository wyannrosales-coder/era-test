/* "Life beyond the classroom": the EPIISOD Instagram posts fly out from behind the headline into a tilted ring around it as you
   scroll, then float with the pointer (each at its own depth); the one under the pointer lifts. Phones and reduced motion get the
   same arrangement without the float. */
(function () {
  var track = document.querySelector('[data-sc-track]');
  if (!track) return;
  var stage = track.querySelector('[data-sc-stage]'), head = track.querySelector('.sc_head');
  var cards = [].slice.call(track.querySelectorAll('[data-sc]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var geo = [], px = 0, py = 0, tx = 0, ty = 0, active = false, raf = 0, lastP = -1;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function rng(p, a, b) { return clamp((p - a) / (b - a)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function measure() {
    var sw = stage.clientWidth, sh = stage.clientHeight;
    geo = cards.map(function (c) {
      var cs = getComputedStyle(c), x = parseFloat(cs.getPropertyValue('--x')) / 100 * sw, y = parseFloat(cs.getPropertyValue('--y')) / 100 * sh;
      var w = c.offsetWidth, h = c.offsetHeight;
      return { dx: sw / 2 - (x + w / 2), dy: sh / 2 - (y + h / 2), rot: parseFloat(cs.getPropertyValue('--rot')) || 0, dp: parseFloat(cs.getPropertyValue('--dp')) || 1 };
    });
    lastP = -1;
  }
  function apply(p) {
    var n = cards.length;
    cards.forEach(function (c, i) {
      var g = geo[i]; if (!g) return;
      var q = reduce ? 1 : ease(rng(p, 0.02 + i * 0.02, 0.36 + i * 0.02));
      var fx = (1 - q) * g.dx + (fine && !reduce && q > 0.98 ? px * g.dp * 22 : 0), fy = (1 - q) * g.dy + (fine && !reduce && q > 0.98 ? py * g.dp * 14 : 0);
      c.style.setProperty('--fx', fx.toFixed(1)); c.style.setProperty('--fy', fy.toFixed(1));
      c.style.setProperty('--s', lerp(0.35, 1, q).toFixed(3)); c.style.setProperty('--o', clamp(q * 3).toFixed(3));
      c.style.setProperty('--rot', (g.rot * lerp(2.4, 1, q)).toFixed(2));
    });
    var hp = reduce ? 1 : ease(rng(p, 0.5, 0.66));          // the words arrive once the cards have flown clear of them
    head.style.opacity = hp.toFixed(3); head.style.transform = 'translate(-50%, -50%) scale(' + lerp(0.94, 1, hp).toFixed(3) + ')';
  }
  function progress() { var r = track.getBoundingClientRect(), vh = window.innerHeight; return clamp(-r.top / Math.max(1, r.height - vh)); }
  function step() {
    raf = 0; if (!active) return;
    var p = progress(), moving = Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002;
    px += (tx - px) * 0.08; py += (ty - py) * 0.08;
    if (p !== lastP || moving) { lastP = p; apply(p); }
    raf = requestAnimationFrame(step);
  }
  function on(v) { if (v === active) return; active = v; if (v) { measure(); if (!raf) raf = requestAnimationFrame(step); } }
  if (fine && !reduce) {
    track.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; }, { passive: true });
    track.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
  }
  window.addEventListener('resize', function () { measure(); apply(progress()); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { on(es[0].isIntersecting); }, { rootMargin: '10% 0px' }).observe(track); else on(true);
  measure(); apply(progress());
})();
