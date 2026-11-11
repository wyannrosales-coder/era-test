/* One scroll listener and one animation frame for every scroll-driven section. Each section registers its update with
   the element it lives in; updates only run while that element is within a screen of the viewport (and once more as it
   leaves, so it can settle). While the page is moving <html> carries .is-scrolling, which drops the costly frosted-glass
   blurs until it comes to rest. */
(function () {
  var tasks = [], queued = false, html = document.documentElement, scrolling = false, stopT = 0;
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { (e.target.__epT || []).forEach(function (t) { t.vis = e.isIntersecting; t.force = true; }); });
    kick();
  }, { rootMargin: '100% 0px 100% 0px' }) : null;

  function frame() {
    queued = false;
    for (var i = 0; i < tasks.length; i++) {
      var t = tasks[i];
      if (!t.vis && !t.force) continue;
      t.force = false;
      try { t.fn(); } catch (err) { if (window.console) console.error(err); }
    }
  }
  function kick() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  function on(fn, el) {
    var t = { fn: fn, vis: !el || !io, force: true };
    tasks.push(t);
    if (el && io) { (el.__epT = el.__epT || []).push(t); io.observe(el); }
    kick();
    return t;
  }

  window.addEventListener('scroll', function () {
    kick();
    if (!scrolling) { scrolling = true; html.classList.add('is-scrolling'); }
    clearTimeout(stopT);
    stopT = setTimeout(function () { scrolling = false; html.classList.remove('is-scrolling'); }, 180);
  }, { passive: true });
  window.addEventListener('resize', function () { tasks.forEach(function (t) { t.force = true; }); kick(); });

  window.__epFrame = { on: on, kick: kick };

  // Safety mode: the page watches its own frame rate. If a device stays below ~45 fps for a second, <html> gets .ep-lite
  // and window.__epLite is set, which turns off the costliest extras (frosted glass, the flower videos, the aerial
  // cross-fade, the hero's dissolve blur). They come back once the device has kept up for a few seconds; if it slips
  // again soon after, lite stays on for the rest of the visit.
  var BAD = 22, GOOD = 15, buf = [], sum = 0, lastF = 0, badT = 0, goodT = 0, exitAt = 0, locked = false, t0 = performance.now();
  window.__epLite = false;
  function setLite(v) {
    if (window.__epLite === v) return;
    window.__epLite = v;
    html.classList.toggle('ep-lite', v);
    try { window.dispatchEvent(new CustomEvent('ep-lite', { detail: v })); } catch (e) {}
    if (!v) exitAt = performance.now();
  }
  if (!/[?&]lite=0/.test(location.search)) (function watch(t) {
    requestAnimationFrame(watch);
    if (/[?&]lite=1/.test(location.search)) { setLite(true); return; }
    var dt = lastF ? t - lastF : 0; lastF = t;
    if (!dt || dt > 250 || document.hidden || t - t0 < 4000) return;     // loading, tab switches and stalls don't count
    buf.push(dt); sum += dt; if (buf.length > 45) sum -= buf.shift();
    var avg = sum / buf.length;
    if (!window.__epLite) {
      badT = avg > BAD ? badT + dt : 0;
      if (badT > 1000) { setLite(true); badT = 0; goodT = 0; if (exitAt && t - exitAt < 15000) locked = true; }
    } else if (!locked) {
      goodT = avg < GOOD ? goodT + dt : 0;
      if (goodT > 5000) { setLite(false); goodT = 0; }
    }
  })(performance.now());
})();
