/* Story panel: the extra content arrives in turn once the panel is in view. */
(function () {
  var panel = document.querySelector('.loc-info-w');
  if (!panel) return;
  var items = [].slice.call(panel.querySelectorAll('[data-ep-rv]'));
  items.forEach(function (el, i) { el.style.setProperty('--rv', i + 1); });
  function on() { panel.classList.add('ep-story-in'); }
  function off() { panel.classList.remove('ep-story-in'); }
  if (!('IntersectionObserver' in window)) { on(); return; }
  // the panel travels sideways on desktop, so look at how much of it is on screen
  new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.intersectionRatio > 0.45) on(); else if (e.intersectionRatio < 0.05) off(); });
  }, { threshold: [0, 0.05, 0.45, 0.6] }).observe(panel);
})();
(function () {
  var area = document.querySelector('.loc-scroll-area');
  var scr = area && area.querySelector('.loc-scroll-area_screen');
  if (!scr) return;
  var mob = window.matchMedia('(max-width: 991px)'), raf = 0;
  function smooth(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  function update() {
    raf = 0;
    var v = 1;
    if (!mob.matches) {
      var r = area.getBoundingClientRect(), span = Math.max(1, r.height - window.innerHeight);
      v = smooth((-r.top / span - 0.5) / 0.45);
    }
    scr.style.setProperty('--ep-fade', v.toFixed(3));
  }
  function tick() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  update();
})();
