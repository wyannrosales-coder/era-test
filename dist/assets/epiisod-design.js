/* Design / smart room section (desktop).
   1. Once the word has scrolled away, the photo zooms out until the whole picture spans the full width of the screen.
   2. A phone then rises into view with the room's app: the main door (first), the desk, main, accent and kitchen lights,
      and the aircon. Each switch dims its own part of the photograph. */
(function () {
  var img = document.querySelector('img[data-ep-zoom]');
  if (!img) return;
  var bg = img.closest('.w_bg'), box = img.closest('.img-w'), blk = img.closest('.arch-w');
  if (!bg || !box || !blk) return;
  var mq = window.matchMedia('(min-width: 992px)'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // a soft, enlarged copy of the photograph sits behind it, so wherever the zoomed-out picture falls short of the screen the
  // gap is filled with the room's own colours instead of a flat colour
  var fill = document.createElement('div');
  fill.className = 'ep-blurfill'; fill.setAttribute('aria-hidden', 'true');
  fill.style.backgroundImage = 'url(' + img.getAttribute('src') + ')';
  box.insertBefore(fill, box.firstChild);

  // ---- the lights: 16 photographs, one for every combination of the four room lights ----
  // bits: main (track spot) 1, desk 2, accent (shelf strip + bedside) 4, kitchen (hood) 8
  var FILE = { 0: 79, 1: 80, 9: 81, 8: 82, 4: 83, 5: 84, 12: 85, 13: 86, 2: 87, 3: 88, 10: 89, 11: 90, 6: 91, 7: 92, 14: 93, 15: 94 };
  var BIT = { main: 1, desk: 2, accent: 4, kitchen: 8 };
  var lights = document.createElement('div');
  lights.className = 'ep-lights'; lights.setAttribute('aria-hidden', 'true');
  var frames = {};
  Object.keys(FILE).forEach(function (k) {
    var f = document.createElement('img');
    f.className = 'ep-lt'; f.alt = ''; f.decoding = 'async'; f.draggable = false;
    f.setAttribute('data-src', '/assets/design/lights/p' + FILE[k] + '.jpg');
    if (+k === 15) f.classList.add('is-on');
    lights.appendChild(f); frames[k] = f;
  });
  var loaded = false;
  function loadFrames() {
    if (loaded) return; loaded = true;
    Object.keys(frames).forEach(function (k) { frames[k].src = frames[k].getAttribute('data-src'); });
  }
  var airEl = document.createElement('div'); airEl.className = 'ep-air';
  airEl.innerHTML = '<i></i><i></i><i></i>';
  lights.appendChild(airEl);
  img.insertAdjacentElement('afterend', lights);

  // ---- the phone ----
  var phone = blk.querySelector('[data-ep-phone]');
  var ICON = {
    desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 20h6M9 20v-6l5-8 3 2-3 8-5 4"/><path d="M13 5l3.5 2.2"/></svg>',
    main: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    accent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3"/></svg>',
    kitchen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8h16l-2 5H6zM12 13v3M9 19h6M7 4h10"/></svg>',
    air: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/></svg>',
    door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 21V4h12v17M4 21h16"/><circle cx="14.5" cy="12.5" r=".6" fill="currentColor"/></svg>'
  };
  var ROWS = [['door', 'Main Door', 'Smart access'], ['desk', 'Desk Lights', 'Under-cabinet'], ['main', 'Main Light', 'Ceiling'], ['accent', 'Accent Light', 'Shelf and bedside'], ['kitchen', 'Kitchen Light', 'Hood and counter'], ['air', 'Aircon', '22°C · Auto']];
  var state = { door: false, desk: true, main: true, accent: true, kitchen: true, air: true };
  var count = phone && phone.querySelector('[data-app-count]');
  // ---- sound: a soft chime and a spoken confirmation ----
  var actx = null, voice = null, vol = 0.8, muted = false;
  function chime(up) {
    if (muted || vol <= 0) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var t0 = actx.currentTime, notes = up ? [659.25, 880, 1318.5] : [1318.5, 987.77, 659.25];
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + i * 0.13);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.2 * vol), t0 + i * 0.13 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.13 + 0.7);
        o.connect(g); g.connect(actx.destination); o.start(t0 + i * 0.13); o.stop(t0 + i * 0.13 + 0.75);
      });
    } catch (err) {}
  }
  var speakT = 0;
  function say(txt, delay) {
    if (!('speechSynthesis' in window) || muted || vol <= 0) return;
    clearTimeout(speakT);
    speakT = setTimeout(function () {
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt); u.rate = 0.98; u.pitch = 1; u.volume = vol;
        if (!voice) { var vs = window.speechSynthesis.getVoices(); voice = vs.filter(function (v) { return /en-AU/i.test(v.lang); })[0] || vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null; }
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-AU';
        window.speechSynthesis.speak(u);
      } catch (err) {}
    }, delay || 0);
  }
  var lockT = 0, cdT = 0, doorEnd = 0;
  function cd() {
    var left = Math.max(0, doorEnd - Date.now());
    var tile = phone && phone.querySelector('[data-tile="door"]');
    if (!tile) return;
    var n = Math.ceil(left / 1000);
    var sub = tile.querySelector('[data-sub="door"]');
    if (state.door) sub.textContent = 'Unlocked \u00b7 locks in ' + n + 's';
    tile.style.setProperty('--cd', (left / 3000).toFixed(3));
    tile.querySelector('[data-cd]').textContent = state.door ? n : '';
    if (!state.door || left <= 0) { clearInterval(cdT); tile.classList.remove('is-cd'); }
  }
  function door(open, auto) {
    clearTimeout(lockT); clearInterval(cdT);
    state.door = open; paint();
    chime(open);
    say(open ? 'Door unlocked' : 'Door locked', 380);
    var tile = phone && phone.querySelector('[data-tile="door"]');
    if (open) {
      doorEnd = Date.now() + 3000;
      if (tile) tile.classList.add('is-cd');
      cd(); cdT = setInterval(cd, 100);
      lockT = setTimeout(function () { door(false, true); }, 3000);
    } else if (tile) { tile.classList.remove('is-cd'); tile.style.setProperty('--cd', 0); }
  }
  function airSay(txt) { say(txt, 120); }
  var air = { t: 22, fan: 'Auto' };
  function paint() {
    var key = 0; Object.keys(BIT).forEach(function (k) { if (state[k]) key |= BIT[k]; });
    Object.keys(frames).forEach(function (k) { frames[k].classList.toggle('is-on', +k === key); });
    airEl.classList.toggle('is-off', !state.air);
    var n = Object.keys(state).filter(function (k) { return k === 'door' ? !state.door : state[k]; }).length;
    if (count) count.textContent = n + ' of 6 active';
    if (phone) {
      [].forEach.call(phone.querySelectorAll('[data-sw]'), function (b) { var k = b.getAttribute('data-sw'); var on = k === 'door' ? !state.door : !!state[k]; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.classList.toggle('is-on', on); });
      var ds = phone.querySelector('[data-sub="door"]'); if (ds && !state.door) ds.textContent = 'Locked'; if (ds && state.door && ds.textContent.indexOf('Unlocked') !== 0) ds.textContent = 'Unlocked';
      var as = phone.querySelector('[data-sub="air"]'); if (as) as.textContent = state.air ? air.t + '°C · Fan ' + air.fan : 'Off';
      var pt = phone.querySelector('[data-air-temp]'); if (pt) { pt.textContent = air.t; phone.querySelector('[data-air-page]').classList.toggle('is-off', !state.air); }
      [].forEach.call(phone.querySelectorAll('[data-fan]'), function (f) { f.classList.toggle('is-on', f.getAttribute('data-fan') === air.fan); });
      var spd = { Low: 3.4, Med: 2.4, High: 1.5, Auto: 2.6 }[air.fan]; lights.style.setProperty('--air-s', spd + 's');
    }
  }
  if (phone) {
    var list = phone.querySelector('[data-app-list]');
    var T = function (k, nm, sub, cls) { return '<div class="ep-tile ' + cls + '" data-tile="' + k + '"><span class="ep-app_ico">' + ICON[k] + '</span>' + (k === 'door' ? '<span class="ep-cd" data-cd></span>' : '') + '<span class="ep-app_nm"><b>' + nm + '</b><small' + (sub ? ' data-sub="' + k + '"' : '') + '>' + (sub || '') + '</small></span><button type="button" class="ep-sw" role="switch" aria-checked="false" aria-label="' + nm + '" data-sw="' + k + '"><i></i></button></div>'; };
    list.innerHTML = T('door', 'Main Door', 'Locked', 'is-wide') +
      '<div class="ep-app_grid">' + T('desk', 'Desk Lights', 'Under-cabinet', 'is-sq') + T('main', 'Main Light', 'Ceiling spot', 'is-sq') + T('accent', 'Accent Light', 'Shelf and bedside', 'is-sq') + T('kitchen', 'Kitchen Light', 'Hood and counter', 'is-sq') + '</div>' +
      T('air', 'Aircon', '22°C', 'is-wide is-air');
    // the aircon page slides in over the list
    var page = document.createElement('div');
    page.className = 'ep-app_page'; page.setAttribute('data-air-page', '');
    page.innerHTML = '<div class="ep-app_phead"><button type="button" class="ep-app_back" data-air-back aria-label="Back">\u2039</button><div><b>Aircon</b><small>Living space</small></div><button type="button" class="ep-sw" role="switch" aria-checked="true" aria-label="Aircon power" data-sw="air"><i></i></button></div>' +
      '<div class="ep-app_dial"><button type="button" data-temp="-1" aria-label="Cooler">\u2212</button><div><b data-air-temp>22</b><span>\u00b0C</span></div><button type="button" data-temp="1" aria-label="Warmer">+</button></div>' +
      '<p class="ep-app_lbl">Fan speed</p><div class="ep-app_fans">' + ['Low', 'Med', 'High', 'Auto'].map(function (f) { return '<button type="button" data-fan="' + f + '">' + f + '</button>'; }).join('') + '</div>' +
      '<p class="ep-app_hint">Set the temperature and fan speed</p>';
    phone.querySelector('.ep-phone_screen').appendChild(page);
    var scr = phone.querySelector('.ep-phone_screen');
    function openAir(on) { scr.classList.toggle('is-air', on); }
    phone.addEventListener('click', function (e) {
      var sw = e.target.closest('[data-sw]');
      if (sw) { var k = sw.getAttribute('data-sw'); if (k === 'door') door(!state.door); else { state[k] = !state[k]; paint(); if (k === 'air') { chime(state.air); airSay(state.air ? 'Aircon on. ' + air.t + ' degrees. Fan speed ' + air.fan : 'Aircon off'); } } return; }
      if (e.target.closest('[data-air-back]')) { openAir(false); return; }
      var t = e.target.closest('[data-temp]');
      if (t) { air.t = Math.max(16, Math.min(30, air.t + (+t.getAttribute('data-temp')))); state.air = true; paint(); airSay('Temperature ' + air.t + ' degrees'); return; }
      var f = e.target.closest('[data-fan]');
      if (f) { air.fan = f.getAttribute('data-fan'); state.air = true; paint(); airSay('Fan speed ' + air.fan); return; }
      var tile = e.target.closest('[data-tile]');
      if (!tile) return;
      var k2 = tile.getAttribute('data-tile');
      if (k2 === 'air') openAir(true); else if (k2 === 'door') door(!state.door); else { state[k2] = !state[k2]; paint(); }
    });
    var all = phone.querySelector('[data-app-all]');
    if (all) all.addEventListener('click', function () {
      var ks = ['desk', 'main', 'accent', 'kitchen', 'air'];
      var any = ks.some(function (k) { return state[k]; });
      ks.forEach(function (k) { state[k] = !any; }); paint();
    });
  }
  paint();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) loadFrames(); }, { rootMargin: '120% 0px' }).observe(blk); else loadFrames();

  // drag the phone anywhere on the screen (grab it by its frame, header or empty space; the switches still just switch)
  var ox = 0, oy = 0, drag = null;
  if (phone) {
    var moved = false;
    phone.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || !mq.matches) return;
      drag = { x: e.clientX, y: e.clientY, ox: ox, oy: oy, id: e.pointerId, on: false };
      moved = false;
    });
    phone.addEventListener('pointermove', function (e) {
      if (!drag) return;
      if (e.buttons === 0) { drag = null; phone.classList.remove('is-drag'); return; }
      var mx = e.clientX - drag.x, my = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.hypot(mx, my) < 7) return;
        drag.on = true; moved = true; phone.classList.add('is-drag');
        try { phone.setPointerCapture(drag.id); } catch (err) {}
      }
      var vw = document.documentElement.clientWidth, vh = window.innerHeight;
      var r = phone.getBoundingClientRect();
      var dx = drag.ox + mx - ox, dy = drag.oy + my - oy;
      if (r.left + dx < 8) dx = 8 - r.left; if (r.right + dx > vw - 8) dx = vw - 8 - r.right;
      if (r.top + dy < 8) dy = 8 - r.top; if (r.bottom + dy > vh - 8) dy = vh - 8 - r.bottom;
      ox += dx; oy += dy;
    });
    var end = function () { drag = null; phone.classList.remove('is-drag'); };
    phone.addEventListener('pointerup', end); phone.addEventListener('pointercancel', end); window.addEventListener('pointerup', end); window.addEventListener('blur', end);
    phone.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    // a double tap on the frame puts it back
    phone.addEventListener('dblclick', function (e) { if (!e.target.closest('[data-sw], [data-app-all], [data-tile], button')) { ox = 0; oy = 0; } });
  }

  // ---- a quiet volume control for the section ----
  var vc = document.createElement('div');
  vc.className = 'ep-vol'; vc.setAttribute('data-ep-vol', '');
  vc.innerHTML = '<button type="button" aria-label="Mute sound" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path class="w1" d="M15.5 9a4 4 0 0 1 0 6"/><path class="w2" d="M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="x" d="M16 9.5l5 5M21 9.5l-5 5"/></svg></button><input type="range" min="0" max="100" value="80" aria-label="Volume">';
  blk.appendChild(vc);
  var vr = vc.querySelector('input'), vb = vc.querySelector('button');
  function vpaint() { vc.classList.toggle('is-muted', muted || vol <= 0); vb.setAttribute('aria-pressed', muted ? 'true' : 'false'); vr.style.setProperty('--v', (muted ? 0 : vol * 100) + '%'); }
  vr.addEventListener('input', function () { vol = vr.value / 100; muted = vol <= 0; if (muted && 'speechSynthesis' in window) window.speechSynthesis.cancel(); vpaint(); });
  vr.addEventListener('change', function () { chime(true); });
  vb.addEventListener('click', function () { muted = !muted; if (muted && 'speechSynthesis' in window) window.speechSynthesis.cancel(); else { if (vol <= 0) { vol = 0.8; vr.value = 80; } chime(true); } vpaint(); });
  vpaint();

  window.__epSmart = { load: loadFrames, blk: blk, img: img, lights: lights, phone: phone, vc: vc, box: box };

  // ---- layout, every frame while the section is near the screen ----
  var on = false, near = false, running = false;
  function resetAll() {
    if (!on) return;
    on = false;
    ['position', 'left', 'top', 'width', 'height', 'maxWidth', 'transform', 'objectFit'].forEach(function (k) { img.style[k] = ''; });
    box.style.background = ''; fill.style.opacity = '0';
    lights.style.display = 'none';
    if (phone) phone.style.display = 'none';
    vc.style.display = 'none';
  }
  function update() {
    if (!mq.matches || reduce) { resetAll(); return; }
    var r = box.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var p = ease(clamp(-r.top / 640));
    var ar = (img.naturalWidth || 2000) / (img.naturalHeight || 1116);
    var w0 = Math.max(r.width, r.height * ar);        // at rest: covering the whole block
    var w = lerp(w0, r.width, p), h = w / ar;         // zooms out until it spans the full width
    var cy = lerp(r.height / 2, vh / 2 - r.top, p);   // and settles in the middle of the screen
    on = true;
    box.style.background = ''; fill.style.opacity = Math.min(1, p * 6).toFixed(3);
    var geo = { position: 'absolute', maxWidth: 'none', left: (r.width / 2).toFixed(1) + 'px', top: cy.toFixed(1) + 'px', width: w.toFixed(1) + 'px', height: h.toFixed(1) + 'px', transform: 'translate(-50%,-50%)' };
    var s = img.style; s.objectFit = 'cover';
    Object.keys(geo).forEach(function (k) { s[k] = geo[k]; lights.style[k] = geo[k]; });
    lights.style.display = '';
    // the phone rises in once the whole picture is on screen
    if (phone) {
      var q = ease(clamp(p / 0.28));
      var br = blk.getBoundingClientRect();
      phone.style.display = 'block';
      var ph = phone.offsetHeight || 560, pw = phone.offsetWidth || 280;
      phone.style.left = (vw / 2 - br.left - pw / 2 + ox).toFixed(1) + 'px';
      phone.style.top = ((vh - ph) / 2 - br.top + (1 - q) * (vh * 0.55) + oy).toFixed(1) + 'px';
      phone.style.opacity = q.toFixed(3);
      phone.style.pointerEvents = q > 0.6 ? 'auto' : 'none';
      vc.style.display = 'flex'; vc.style.opacity = (q * 0.9).toFixed(3); vc.style.pointerEvents = q > 0.6 ? 'auto' : 'none';
      var dc = blk.querySelector('.ep-disclaimer'); if (dc) { var dr = dc.getBoundingClientRect(); vc.style.left = (dr.left - br.left).toFixed(1) + 'px'; vc.style.top = (dr.bottom + 10 - br.top).toFixed(1) + 'px'; }
    }
  }
  function loop() { update(); if (near) requestAnimationFrame(loop); else running = false; }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { near = es[0].isIntersecting; if (near) start(); }, { rootMargin: '30% 0px 30% 0px' }).observe(blk.closest('.arch-scroll-area') || blk);
  } else { near = true; start(); }
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  if (mq.addEventListener) mq.addEventListener('change', update);
  update();
})();
