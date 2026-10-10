/* Preloader percentage: counts 0 to 100 in step with the loading line. */
(function () {
  var el = document.querySelector('[data-ep-pct]');
  if (!el) return;
  var n = el.querySelector('.ep-preload_n');
  var started = false, last = -1;
  function frame() {
    var pre = document.querySelector('[data-preloader]');
    if (!pre || pre.style.display === 'none') { el.classList.add('is-done'); return; }
    var track = document.querySelector('.preloader_progress_track');
    if (track && window.gsap) {
      var y = window.gsap.getProperty(track, 'yPercent');
      if (typeof y === 'number') {
        if (!started && y < -4) { started = true; el.classList.add('is-on'); }
        if (started) {
          var p = Math.max(0, Math.min(100, Math.round(100 + y)));
          if (p !== last) { last = p; n.textContent = p; }
          if (p >= 100) { el.classList.add('is-full'); }
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
