/* Smart room on phones and tablets: after the full-screen photo, scrolling zooms the picture out into the top of the screen
   while a bottom sheet slides up with the room app's tiled controls. */
(function () {
  var S = window.__epSmart;
  if (!S) return;
  var mq = window.matchMedia('(max-width: 991px)'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var host = S.blk.closest('section') || S.blk;
  var wrap = document.createElement('section');
  wrap.className = 'ep-msm'; wrap.setAttribute('aria-label', 'Smart room controls');
  wrap.innerHTML = '<div class="ep-msm_stick"><div class="ep-msm_img"></div><div class="ep-msm_txt"></div><div class="ep-msm_sheet"><i class="ep-msm_grab"></i></div></div>';
  wrap.setAttribute('data-bg', 'dark');
  var stick = wrap.firstChild, box = stick.querySelector('.ep-msm_img'), sheet = stick.querySelector('.ep-msm_sheet'), txt = stick.querySelector('.ep-msm_txt');
  var hint = S.phone.querySelector('.ep-app_hint'), hintDesk = hint ? hint.textContent : '';
  var inMobile = false, raf = 0;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var CLR = ['left', 'top', 'width', 'height', 'transform', 'opacity', 'display', 'pointerEvents', 'position', 'maxWidth', 'objectFit'];
  function clear(el) { CLR.forEach(function (k) { el.style[k] = ''; }); }
  function enter() {
    if (inMobile) return; inMobile = true;
    // the same photograph and words as the section above: here they are pushed up and shrunk by the sheet
    var q = function (sel) { var e = S.blk.querySelector(sel); return e ? e.textContent.trim() : ''; };
    var au = [].map.call(S.blk.querySelectorAll('.arch-s_author .l1'), function (e) { return e.textContent.trim(); });
    txt.innerHTML = '<h2>' + q('.arch-s_t h2') + '</h2><p class="ep-msm_q">' + q('.arch-s_quote .h5') + '</p><p class="ep-msm_au">' + au.join('<br>') + '</p><p class="ep-disclaimer">' + q('.ep-disclaimer') + '</p>';
    host.style.display = 'none';
    host.insertAdjacentElement('afterend', wrap);
    [S.phone, S.lights, S.vc].forEach(clear);
    S.img.style.cssText = ''; S.box.style.background = '';
    box.appendChild(S.lights); sheet.appendChild(S.phone); stick.appendChild(S.vc);
    if (hint) hint.textContent = 'Artist’s rendition. The app and the room may differ.';
    measure();
  }
  function leave() {
    if (!inMobile) return; inMobile = false;
    S.img.insertAdjacentElement('afterend', S.lights); S.blk.appendChild(S.phone); S.blk.appendChild(S.vc);
    [S.phone, S.lights, S.vc].forEach(clear);
    if (hint) hint.textContent = hintDesk;
    host.style.display = '';
    wrap.remove();
  }
  var vh = 0, vw = 0;
  function measure() { vh = window.innerHeight; vw = document.documentElement.clientWidth; wrap.style.height = Math.round(vh * 2.6) + 'px'; update(); }
  function update() {
    raf = 0;
    if (!inMobile) return;
    var r = wrap.getBoundingClientRect();
    var t = clamp(-r.top / Math.max(1, r.height - vh));
    var p = reduce ? (t > 0.2 ? 1 : 0) : ease(clamp((t - 0.12) / 0.55));
    var fullH = vw * 9 / 16;                           // the whole picture at the width of the screen
    var sheetH = vh - fullH;
    var imgH = lerp(vh, fullH, p);
    box.style.height = imgH.toFixed(1) + 'px';
    var ar = 16 / 9, wc = Math.max(vw, vh * ar);       // full-bleed cover at first, the whole picture at the end
    var w = lerp(wc, vw, p), h = w / ar, L = S.lights.style;
    L.position = 'absolute'; L.left = '50%'; L.top = (imgH / 2).toFixed(1) + 'px'; L.width = w.toFixed(1) + 'px'; L.height = h.toFixed(1) + 'px'; L.transform = 'translate(-50%,-50%)'; L.display = 'block';
    sheet.style.height = sheetH + 'px';
    var out = clamp(p / 0.5);
    txt.style.opacity = (1 - out).toFixed(3); txt.style.transform = 'translateY(' + (-ease(out) * 56).toFixed(1) + 'px)'; txt.style.visibility = out >= 1 ? 'hidden' : 'visible';
    sheet.style.transform = 'translateY(' + ((1 - p) * 104).toFixed(2) + '%)';
    var P = S.phone.style; P.display = 'block'; P.opacity = '1'; P.pointerEvents = p > 0.7 ? 'auto' : 'none';
    S.vc.style.top = (imgH - 44).toFixed(1) + 'px'; S.vc.style.display = 'flex'; S.vc.style.opacity = (0.4 + 0.6 * p).toFixed(2);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) S.load(); }, { rootMargin: '150% 0px' }).observe(wrap); else S.load();
  function tick() { if (!raf) raf = requestAnimationFrame(update); }
  function sync() { if (mq.matches) enter(); else leave(); }
  window.__epFrame.on(update, wrap);
  window.addEventListener('resize', function () { if (inMobile) measure(); });
  if (mq.addEventListener) mq.addEventListener('change', sync);
  sync();
})();
