/* The fixed corner pieces (emblem, header links, Scroll label, chevron buttons) read the real colour behind them and
   switch between light and dark type, instantly. */
(function () {
  var sel = ['.header-logo', '.header-nav', '.s-down', '.ep-nav_btns'];
  var els = [], cache = {}, cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  cv.width = cv.height = 12;
  function find() { els = sel.map(function (s) { return document.querySelector(s); }).filter(Boolean); }
  function lumMedia(m) {
    try {
      var key = m.currentSrc || m.src || '';
      var isVid = m.tagName === 'VIDEO';
      if (!isVid && cache[key] != null) return cache[key];
      if (isVid && (m.readyState < 2 || !m.videoWidth)) return 60;
      if (!isVid && (!m.complete || !m.naturalWidth)) return 60;
      cx.drawImage(m, 0, 0, 12, 12);
      var d = cx.getImageData(0, 0, 12, 12).data, s = 0;
      for (var i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      var L = s / (d.length / 4);
      if (!isVid) cache[key] = L;
      return L;
    } catch (e) { return 60; }
  }
  function lumAt(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el && el !== document.documentElement) {
      var t = el.tagName;
      if (t === 'VIDEO' || t === 'IMG' || t === 'CANVAS') return lumMedia(el) > 195 ? 255 : 40;
      var cs = getComputedStyle(el), bg = cs.backgroundColor, m = bg && bg.match(/rgba?\(([^)]+)\)/);
      if (cs.backgroundImage && /url\(/.test(cs.backgroundImage)) return 40;
      if (m) { var v = m[1].split(',').map(parseFloat), a = v.length > 3 ? v[3] : 1; if (a > 0.6) return 0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]; }
      el = el.parentElement;
    }
    return 244;
  }
  var busy = false, applying = false;
  function apply() {
    busy = false;
    if (!els.length) find();
    // let the page's own elements, not ours, answer elementFromPoint
    els.forEach(function (e) { e.style.pointerEvents = 'none'; });
    var res = els.map(function (e) {
      var r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return null;
      return lumAt(Math.min(window.innerWidth - 2, Math.max(2, r.left + r.width / 2)), Math.min(window.innerHeight - 2, Math.max(2, r.top + r.height / 2))) > 150;
    });
    els.forEach(function (e) { e.style.pointerEvents = ''; });
    applying = true;
    els.forEach(function (e, i) {
      if (res[i] == null) return;
      var want = res[i] ? 'theme_on-light' : 'theme_on-dark';
      if (!e.classList.contains(want)) { e.classList.remove('theme_on-light', 'theme_on-dark', 'theme_on-color'); e.classList.add(want); }
    });
    applying = false;
  }
  function tick() { if (!busy) { busy = true; requestAnimationFrame(apply); } }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  window.addEventListener('load', tick);
  // the page's own theming also edits these classes: put ours back straight away
  var mo = new MutationObserver(function () { if (!applying) tick(); });
  setTimeout(function () { find(); els.forEach(function (e) { mo.observe(e, { attributes: true, attributeFilter: ['class'] }); }); tick(); }, 600);
  setInterval(tick, 400);
})();
