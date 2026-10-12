/* Desktop: the phone from the smart room travels to the left of the screen and becomes the phone of the app section. */
(function () {
  var S = window.__epSmart, app = document.getElementById('app');
  if (!S || !app) return;
  var mq = window.matchMedia('(min-width: 992px)'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target = app.querySelector('.ep-ap_phone');
  var fly = document.createElement('div');
  fly.className = 'ep-trv'; fly.setAttribute('aria-hidden', 'true');
  fly.innerHTML = '<div class="ep-trv_in"><div class="ep-trv_a"></div><div class="ep-trv_b"></div></div>';
  document.body.appendChild(fly);
  var inn = fly.firstChild, A = inn.querySelector('.ep-trv_a'), B = inn.querySelector('.ep-trv_b');
  B.style.backgroundImage = 'url(/assets/app/f1_full.jpg)';
  var active = false, cloneW = 266, cloneH = 520, on = false;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function snapshot() {
    var scr = S.phone.querySelector('.ep-phone_screen');
    cloneW = scr.offsetWidth || 266; cloneH = scr.offsetHeight || 520;
    A.innerHTML = ''; var c = scr.cloneNode(true); c.className = 'ep-phone_screen'; c.style.cssText = 'position:absolute;left:0;top:0;width:' + cloneW + 'px;height:' + cloneH + 'px;margin:0;';
    A.appendChild(c);
    var sheet = c.querySelector('.ep-app_page'); if (sheet) sheet.style.display = 'none';
  }
  function show(v) { fly.style.display = v ? 'block' : 'none'; S.phone.style.visibility = v ? 'hidden' : ''; target.style.visibility = v ? 'hidden' : ''; }
  function update() {
    if (!mq.matches || reduce) { if (on) { on = false; show(false); } return; }
    var vh = window.innerHeight, top = app.getBoundingClientRect().top;
    var p = clamp(1 - top / (vh * 0.9));
    // only while the smart room phone is actually showing, and not once the app is fully in place
    var smartOn = S.phone.style.display === 'block' && parseFloat(S.phone.style.opacity || 0) > 0.5;
    var go = p > 0.001 && p < 0.999 && (smartOn || on);
    if (!go) { if (on) { on = false; show(false); } return; }
    if (!on) { on = true; snapshot(); show(true); }
    var a = S.phone.getBoundingClientRect(), b = target.getBoundingClientRect(), e = ease(p);
    var l = lerp(a.left, b.left, e), t = lerp(a.top, b.top, e), w = lerp(a.width, b.width, e), h = lerp(a.height, b.height, e);
    var pad = lerp(10, 11, e), rad = lerp(40, 46, e);
    fly.style.cssText = 'display:block;left:' + l.toFixed(1) + 'px;top:' + t.toFixed(1) + 'px;width:' + w.toFixed(1) + 'px;height:' + h.toFixed(1) + 'px;padding:' + pad.toFixed(1) + 'px;border-radius:' + rad.toFixed(1) + 'px';
    var iw = w - pad * 2, ih = h - pad * 2, sc = iw / cloneW;
    inn.style.borderRadius = lerp(31, 36, e).toFixed(1) + 'px';
    A.style.cssText = 'width:' + cloneW + 'px;height:' + cloneH + 'px;transform:scale(' + sc.toFixed(4) + ');transform-origin:0 0;opacity:' + (1 - ease(clamp((p - 0.45) / 0.35))).toFixed(3);
    B.style.opacity = ease(clamp((p - 0.35) / 0.4)).toFixed(3);
  }
  function loop() { try { update(); } catch (err) { window.__flyErr = String(err && err.stack || err); } requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
})();
