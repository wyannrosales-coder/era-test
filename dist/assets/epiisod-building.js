/* The building: a pinned full-bleed film that the scroll scrubs. It is pencilled in on paper, becomes the line drawing, then the
   grey model, then the finished colour render, and rests on each of those four pictures before moving on. The building sits on
   the left; once the sketch is fully drawn a full-height column slides in on the right (a bottom sheet on phones). It is an accordion with one row per stage; scrolling opens the row for the stage on screen and a click
   jumps to a stage. The film is fetched as a blob (so seeking always works) and re-encoded with a keyframe every few frames.
   The film's own zoom (out, then in) is cancelled in the file itself: it was measured against the final frame and every
   frame re-scaled to that framing, so the building keeps the size it has in the finished render and nothing moves on the page. */
(function () {
  var sec = document.getElementById('building');
  if (!sec) return;
  var vid = sec.querySelector('.bd_vid'), track = sec.querySelector('.bd_track'), ext = sec.querySelector('.bd_ext');
  var ectx = ext && ext.getContext ? ext.getContext('2d') : null;
  var rows = [].slice.call(sec.querySelectorAll('[data-bc]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  // where the film rests (seconds): the pencil sketch drawn (3.9), the line drawing (8.3), then the colour render sweeps in and settles
  var SEGS = [[0.03, 0.24, 0, 3.9], [0.30, 0.48, 3.9, 8.3], [0.55, 0.76, 8.3, 10.6], [0.82, 0.94, 10.6, 11.55]];
  var STAGE_AT = [0.28, 0.54, 0.80], CARD_AT = 0.25;
  var JUMP = [0.27, 0.52, 0.72, 0.96];                       // scroll positions at which each stage is at rest
  var ready = false, loading = false, cur = 0, stageNow = -1, cardNow = null, active = false, raf = 0;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function rng(p, a, b) { return clamp((p - a) / (b - a)); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function timeAt(p) { var t = 0; for (var i = 0; i < SEGS.length; i++) { var s = SEGS[i]; if (p >= s[0]) t = s[2] + (s[3] - s[2]) * ease(rng(p, s[0], s[1])); } return t; }
  function stageAt(p) { return p < STAGE_AT[0] ? 0 : p < STAGE_AT[1] ? 1 : p < STAGE_AT[2] ? 2 : 3; }
  function setStage(s) {
    if (s === stageNow) return; stageNow = s; sec.setAttribute('data-st', s);
    rows.forEach(function (r, k) { var on = k === s; r.classList.toggle('is-on', on); var b = r.querySelector('.bd_rb'); if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false'); });
  }
  function setCard(on) { if (on === cardNow) return; cardNow = on; sec.classList.toggle('is-card', on); }
  // the film is shown smaller than its column, so the space around it is filled with the colours of the film's own edge (paper, white,
  // sky over ground), stretched across and blurred by CSS; the film's edges are feathered into it
  var bg = sec.querySelector('.bd_bg');
  function drawExt() {
    if (!ectx || !vid.videoWidth) return;
    try { ectx.drawImage(vid, 0, 0, 3, vid.videoHeight, 0, 0, ext.width, ext.height); } catch (e) {}      // the film's left edge, stretched across: its top-to-bottom colours (sky, white, ground), none of its shapes
  }
  window.addEventListener('resize', drawExt);
  if (bg) bg.addEventListener('transitionend', drawExt);
  if (reduce) { vid.setAttribute('poster', '/assets/building/final.jpg?v=3'); setStage(3); setCard(true); sec.classList.add('is-still'); return; }

  function load() {
    if (loading) return; loading = true;
    var src = vid.getAttribute('data-src'); if (small) src = src.replace(/\.mp4/, '-m.mp4');
    fetch(src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
      vid.addEventListener('loadeddata', function () { ready = true; vid.currentTime = Math.max(0.04, cur); vid.classList.add('is-ready'); }, { once: true });
      vid.addEventListener('seeked', drawExt); vid.addEventListener('loadeddata', drawExt);
      vid.src = URL.createObjectURL(b); vid.load();
    }).catch(function () { loading = false; });
  }
  var stick = sec.querySelector('.bd_stick');
  function progress() { var r = track.getBoundingClientRect(), off = parseFloat(getComputedStyle(stick).top) || 0; return clamp((off - r.top) / Math.max(1, r.height - stick.offsetHeight)); }
  function step() {
    raf = 0; if (!active) return;
    var p = progress(), target = Math.min(timeAt(p), (vid.duration || 11.6) - 0.04);
    cur += (target - cur) * 0.22; if (Math.abs(target - cur) < 0.005) cur = target;
    if (ready && !vid.seeking && Math.abs(vid.currentTime - cur) > 0.02) { try { vid.currentTime = cur; } catch (e) {} }
    setStage(stageAt(p)); setCard(p >= CARD_AT);
    raf = requestAnimationFrame(step);
  }
  function on(v) { if (v === active) return; active = v; if (v && !raf) raf = requestAnimationFrame(step); }
  rows.forEach(function (r, k) {
    var b = r.querySelector('.bd_rb'); if (!b) return;
    b.addEventListener('click', function () {
      var rect = track.getBoundingClientRect(), off = parseFloat(getComputedStyle(stick).top) || 0, y = rect.top + window.pageYOffset + JUMP[k] * (rect.height - stick.offsetHeight) - off;
      if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(y, { duration: 1.6, easing: function (x) { return 1 - Math.pow(1 - x, 4); } }); else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: '1600px 0px' }).observe(sec);
    new IntersectionObserver(function (es) { on(es[0].isIntersecting); }, { rootMargin: '10% 0px' }).observe(track);
  } else { load(); on(true); }
})();
