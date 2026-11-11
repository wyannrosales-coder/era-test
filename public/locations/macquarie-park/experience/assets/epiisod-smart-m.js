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
  var vh = 0, vw = 0, side = false, fitK = 1, sheetH = 0, lastSlack = 0, inView = false, panRaf = 0, G = window.__epGyro;
  if (G && G.watch) G.watch(wrap);
  // Landscape and wide enough (tablets, phones on their side): the picture takes the left of the screen and the app gets a
  // full-height panel on the right, where every control fits. Portrait: the picture on top and the sheet below.
  function measure() {
    vh = window.innerHeight; vw = document.documentElement.clientWidth;
    side = vw >= 640 && vw > vh * 1.05;
    wrap.classList.toggle('is-side', side);
    wrap.style.height = Math.round(vh * 2.6) + 'px';
    sizeSheet(); update(); fit();
  }
  // portrait: the sheet is as tall as its content needs (at most about 60% of the screen), so the picture takes the rest
  function sizeSheet() {
    if (side || !inMobile) return;
    var si = S.phone.querySelector('.sm_in');
    if (!si) { sheetH = Math.round(vh * 0.55); return; }
    si.classList.add('is-measuring');
    var nat = si.offsetHeight;
    si.classList.remove('is-measuring');
    sheetH = Math.round(Math.max(vh * 0.34, Math.min(nat + 26, vh * 0.6)));
  }
  // the controls measure the room they have and scale down (never up) so the whole app is always visible
  function fit() {
    if (!inMobile) return;
    var si = S.phone.querySelector('.sm_in'), scr = S.phone.querySelector('.ep-phone_screen');
    if (!si || !scr) return;
    si.classList.add('is-measuring');
    var natural = si.offsetHeight, cs = getComputedStyle(scr);
    si.classList.remove('is-measuring');
    var avail = scr.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (natural < 40 || avail < 40) return;
    var k = Math.max(0.58, Math.min(1, avail / natural));
    if (Math.abs(k - fitK) > 0.005) { fitK = k; si.style.setProperty('--fit', k.toFixed(3)); }
  }
  function update() {
    raf = 0;
    if (!inMobile) return;
    var r = wrap.getBoundingClientRect();
    var t = clamp(-r.top / Math.max(1, r.height - vh));
    var p = reduce ? (t > 0.2 ? 1 : 0) : ease(clamp((t - 0.12) / 0.55));
    var ar = 16 / 9, L = S.lights.style, P = S.phone.style;
    var out = clamp(p / 0.5);
    var sheetW = Math.round(vw * 0.42), wl = vw - sheetW;
    var fullH, imgH, w, wc, lx;
    if (side) {
      imgH = vh;
      var boxW = lerp(vw, wl, p);
      box.style.width = boxW.toFixed(1) + 'px'; box.style.right = 'auto';
      box.style.height = vh + 'px';
      wc = Math.max(vw, vh * ar); w = lerp(wc, Math.max(wl, vh * ar), p); lx = boxW / 2;
      sheet.style.width = sheetW + 'px'; sheet.style.height = vh + 'px'; sheet.style.left = 'auto'; sheet.style.right = '0'; sheet.style.top = '0'; sheet.style.bottom = 'auto';
      sheet.style.transform = 'translateX(' + ((1 - p) * 104).toFixed(2) + '%)';
      txt.style.maxWidth = Math.round(wl) + 'px';
      S.vc.style.top = (vh - 44).toFixed(1) + 'px';
    } else {
      var sH = sheetH || Math.round(vh * 0.55);
      fullH = vh - sH;
      imgH = lerp(vh, fullH, p);
      box.style.width = ''; box.style.right = ''; box.style.height = imgH.toFixed(1) + 'px';
      wc = Math.max(vw, vh * ar); w = lerp(wc, Math.max(vw, fullH * ar), p); lx = vw / 2;
      sheet.style.width = ''; sheet.style.left = ''; sheet.style.right = ''; sheet.style.top = ''; sheet.style.bottom = '';
      sheet.style.height = sH + 'px';
      sheet.style.transform = 'translateY(' + ((1 - p) * 104).toFixed(2) + '%)';
      txt.style.maxWidth = '';
      S.vc.style.top = (imgH - 44).toFixed(1) + 'px';
    }
    var h = w / ar;
    lastSlack = Math.max(0, (w - (side ? lerp(vw, wl, p) : vw)) / 2 - 4);        // how far the picture can slide each way when the phone is turned
    L.position = 'absolute'; L.left = lx.toFixed(1) + 'px'; L.top = (imgH / 2).toFixed(1) + 'px'; L.width = w.toFixed(1) + 'px'; L.height = h.toFixed(1) + 'px'; L.display = 'block';
    applyPan();
    txt.style.opacity = (1 - out).toFixed(3); txt.style.transform = 'translateY(' + (-ease(out) * 56).toFixed(1) + 'px)'; txt.style.visibility = out >= 1 ? 'hidden' : 'visible';
    P.display = 'block'; P.opacity = '1'; P.pointerEvents = p > 0.7 ? 'auto' : 'none';
    S.vc.style.display = 'flex'; S.vc.style.opacity = (0.4 + 0.6 * p).toFixed(2);
  }
  // turn or tilt the phone to look left and right across the room (the picture is wider than the screen)
  function applyPan() {
    var gx = G && G.on ? G.gx : 0, pan = -gx * lastSlack * 0.95;
    S.lights.style.transform = 'translate(calc(-50% + ' + pan.toFixed(1) + 'px), -50%)';
  }
  function panTick() {
    panRaf = 0;
    if (!inView || !inMobile) return;
    if (G && G.on) applyPan();
    panRaf = requestAnimationFrame(panTick);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) S.load(); inView = es[0].isIntersecting; if (inView && !panRaf && G) panRaf = requestAnimationFrame(panTick); }, { rootMargin: '150% 0px' }).observe(wrap); else S.load();
  function tick() { if (!raf) raf = requestAnimationFrame(update); }
  function sync() { if (mq.matches) enter(); else leave(); }
  window.__epFrame.on(update, wrap);
  window.addEventListener('resize', function () { if (inMobile) measure(); });
  window.addEventListener('load', function () { if (inMobile) measure(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (inMobile) measure(); });
  if (mq.addEventListener) mq.addEventListener('change', sync);
  sync();
})();
