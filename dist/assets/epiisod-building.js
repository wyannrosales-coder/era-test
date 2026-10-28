/* Design-led student living: a drawing board that scrolls sideways. Panel 1 is a small film that loops silently while on screen; panels 2 to 4
   are a technical drawing under the finished photograph with a draggable line between them. Vertical scroll moves the board sideways on
   desktop (the section is pinned); on phones and with reduced motion the panels simply stack. Each panel eases in once. */
(function () {
  var sec = document.getElementById('building');
  if (!sec) return;
  var track = sec.querySelector('.bd_track'), stick = sec.querySelector('.bd_stick'), rail = sec.querySelector('.bd_rail');
  var pns = [].slice.call(sec.querySelectorAll('.bd_pn'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 768px)');
  var side = false, dist = 0, active = false, raf = 0, curX = 0;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  // sideways scroll
  function measure() {
    side = wide.matches && !reduce;
    if (!side) { track.style.removeProperty('--bd-track'); rail.style.transform = ''; sec.style.removeProperty('--bd-p'); return; }
    dist = Math.max(0, rail.scrollWidth - window.innerWidth);
    track.style.setProperty('--bd-track', (window.innerHeight + dist) + 'px');
  }
  function step() {
    raf = 0; if (!active || !side) return;
    var r = track.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    curX = -p * dist; rail.style.transform = 'translate3d(' + curX.toFixed(1) + 'px,0,0)';
    stick.style.setProperty('--bd-p', p.toFixed(4));
    // depth: each sheet's picture and card drift a little against the board as it passes
    var vw = window.innerWidth;
    for (var i = 0; i < pns.length; i++) {
      var d = (i * vw + curX) / vw; if (d < -1.2 || d > 1.2) continue;     // -1 (left of the screen) .. 1 (right of it)
      var fw = pns[i].querySelector('.bd_fw'), cd = pns[i].querySelector('.bd_card');
      if (fw) fw.style.setProperty('--px', (d * -36).toFixed(1) + 'px');
      if (cd) cd.style.setProperty('--px2', (d * 70).toFixed(1) + 'px');
    }
    raf = requestAnimationFrame(step);
  }
  function run(v) { active = v; if (v && !raf) raf = requestAnimationFrame(step); }
  measure(); window.addEventListener('resize', measure); if (wide.addEventListener) wide.addEventListener('change', measure);
  window.addEventListener('load', measure);

  // panel 1: the film
  var vid = sec.querySelector('.bd_vid'), small = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  var loading = false, ready = false, visible = false;
  function sync() { if (!ready || !vid) return; if (visible && !reduce) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); }
  function load() {
    if (!vid || loading) return; loading = true;
    var src = vid.getAttribute('data-src'); if (small) src = src.replace(/\.mp4/, '-m.mp4');
    fetch(src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
      vid.addEventListener('loadeddata', function () { ready = true; sync(); }, { once: true });
      vid.src = URL.createObjectURL(b); vid.load();
    }).catch(function () { loading = false; });
  }

  // before / after sliders
  function slider(fr) {
    var hd = fr.querySelector('.bd_hd'), pos = 50, dragging = false, anim = 0;
    function set(v) { pos = Math.max(0, Math.min(100, v)); fr.style.setProperty('--pos', pos + '%'); hd.setAttribute('aria-valuenow', Math.round(pos)); }
    function fromEvent(e) { var r = fr.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    fr.addEventListener('pointerdown', function (e) { dragging = true; cancelAnimationFrame(anim); try { fr.setPointerCapture(e.pointerId); } catch (x) {} fromEvent(e); });
    fr.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    var end = function () { dragging = false; };
    fr.addEventListener('pointerup', end); fr.addEventListener('pointercancel', end);
    hd.addEventListener('keydown', function (e) { var d = e.key === 'ArrowLeft' ? -5 : e.key === 'ArrowRight' ? 5 : 0; if (d) { e.preventDefault(); set(pos + d); } });
    // a small sweep the first time it is seen, to show that it moves
    fr._sweep = function () {
      if (reduce) return; var t0 = null, from = 92, to = 50; set(from);
      function f(t) { if (dragging) return; if (t0 === null) t0 = t; var k = clamp((t - t0) / 1700), e = 1 - Math.pow(1 - k, 3); set(from + (to - from) * e); if (k < 1) anim = requestAnimationFrame(f); }
      setTimeout(function () { if (!dragging) anim = requestAnimationFrame(f); }, 1100);
    };
  }
  [].slice.call(sec.querySelectorAll('[data-cmp]')).forEach(slider);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) { load(); measure(); } }, { rootMargin: '1200px 0px' }).observe(sec);
    new IntersectionObserver(function (es) { run(es[0].isIntersecting); }, { rootMargin: '10% 0px' }).observe(track);
    if (vid) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(vid);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; e.target.classList.add('is-in'); io.unobserve(e.target); var c = e.target.querySelector('[data-cmp]'); if (c && c._sweep) c._sweep(); });
    }, { threshold: 0.45 });
    pns.forEach(function (p) { io.observe(p); });
  } else { pns.forEach(function (p) { p.classList.add('is-in'); }); visible = true; load(); run(true); }
})();
