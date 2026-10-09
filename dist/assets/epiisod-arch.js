/* "Life beyond the classroom": the sheet starts as a small arch and grows to full size as it rises over the pinned
   rooms section; the photos then rise and fade in one after another. */
(function () {
  var sec = document.querySelector('section.section.arch');
  if (!sec) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vw = 0, vh = 0, R = 0, raf = 0;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function measure() {
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    R = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) * 50;   // the sheet's resting corner radius
    update();
  }

  function update() {
    raf = 0;
    var rect = sec.getBoundingClientRect();
    var p = ease(clamp((vh - rect.top) / (vh * 0.92)));
    if (p >= 0.999) { sec.style.clipPath = ''; return; }
    var w0 = Math.min(vw < 768 ? vw * 0.72 : 360, vw * 0.8);
    var w = lerp(w0, vw, p);
    var side = (vw - w) / 2;
    var r = lerp(w / 2, R, p * p);
    sec.style.clipPath = 'inset(0 ' + side.toFixed(1) + 'px 0 ' + side.toFixed(1) + 'px round ' + r.toFixed(1) + 'px ' + r.toFixed(1) + 'px 0 0)';
  }
  function tick() { if (!raf) raf = requestAnimationFrame(update); }

  // photos rise and fade in one after another
  var pics = [].slice.call(sec.querySelectorAll('.interior-s_l_img, .interior-s_r_img'));
  if (!reduce && 'IntersectionObserver' in window) {
    pics.forEach(function (p, i) { p.classList.add('ep-rise'); p.style.setProperty('--rise-d', (i * 0.18) + 's'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -14% 0px', threshold: 0.05 });
    pics.forEach(function (p) { io.observe(p); });
  }

  if (reduce) return;
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  var n = 0, iv = setInterval(function () { measure(); if (++n > 12) clearInterval(iv); }, 500);
  measure();
})();
