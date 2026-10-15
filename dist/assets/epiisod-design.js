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
  fill.style.backgroundImage = 'url(' + img.getAttribute('src').replace(/\.webp$/, '-blur.webp') + ')';
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
    f.setAttribute('data-src', '/assets/design/lights/p' + FILE[k] + '.webp');
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
    bulb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a6.5 6.5 0 0 0-3.7 11.8c.5.4.7.9.7 1.5V17h6v-1.2c0-.6.2-1.1.7-1.5A6.5 6.5 0 0 0 12 2.5zM9.5 19h5v1.2a1.8 1.8 0 0 1-1.8 1.8h-1.4a1.8 1.8 0 0 1-1.8-1.8z"/></svg>',
    power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3.5v8M7 6.8a7.5 7.5 0 1 0 10 0"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10h8V8a3 3 0 0 0-5.8-1l-1.9-.7A5 5 0 0 1 16 8z"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.5v19M4.2 7l15.6 10M19.8 7 4.2 17M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
  };
  var NAMES = { desk: 'Desk Lights', main: 'Main Light', accent: 'Accent Light', kitchen: 'Kitchen Light' };
  var state = { door: false, desk: true, main: true, accent: true, kitchen: true, air: true };
  var count = phone && phone.querySelector('[data-app-count]');
  // ---- sound: a soft chime and a spoken confirmation ----
  var actx = null, voice = null, vol = 0.8, muted = false;
  function chime(up) {
    if (muted || vol <= 0 || window.__epDemoQuiet) return;           // the self-playing demo stays silent
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
    if (!('speechSynthesis' in window) || muted || vol <= 0 || window.__epDemoQuiet) return;
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
  var air = { t: 22, fan: 'Auto', mode: 'Cool' };
  var lockT = 0, cdT = 0, doorEnd = 0, knob = null, slideEl = null;
  function knobMax() { var cs = getComputedStyle(slideEl); return Math.max(0, slideEl.clientWidth - knob.offsetWidth - 2 * parseFloat(cs.paddingLeft)); }
  function knobTo(x, anim) { knob.style.transition = anim ? 'transform .45s cubic-bezier(.2,.8,.2,1)' : 'none'; knob.style.transform = 'translateX(' + x.toFixed(1) + 'px)'; }
  function cd() {
    var left = Math.max(0, doorEnd - Date.now());
    if (!slideEl) return;
    var n = Math.ceil(left / 1000), st = phone.querySelector('[data-door-status]');
    if (state.door) st.textContent = 'Unlocked · locks in ' + n + 's';
    slideEl.style.setProperty('--cd', (left / 3000).toFixed(3));
    if (!state.door || left <= 0) clearInterval(cdT);
  }
  function door(open, auto) {
    clearTimeout(lockT); clearInterval(cdT);
    state.door = open; paint();
    chime(open);
    say(open ? 'Door unlocked' : 'Door locked', 380);
    if (slideEl) {
      slideEl.classList.toggle('is-open', open);
      knobTo(open ? knobMax() : 0, true);
      if (open) { doorEnd = Date.now() + 3000; cd(); cdT = setInterval(cd, 100); lockT = setTimeout(function () { door(false, true); }, 3000); }
      else slideEl.style.setProperty('--cd', 0);
    }
  }
  function airSay(txt) { say(txt, 120); }
  var AIRS = { Auto: 2.6, Low: 3.4, Mid: 2.4, High: 1.5 }, MODES = ['Heat', 'Cool', 'Dry', 'Fan'], FANS = ['Auto', 'Low', 'Mid', 'High'];
  var RING = 377;
  function paint() {
    var key = 0; Object.keys(BIT).forEach(function (k) { if (state[k]) key |= BIT[k]; });
    Object.keys(frames).forEach(function (k) { frames[k].classList.toggle('is-on', +k === key); });
    airEl.classList.toggle('is-off', !state.air);
    var n = Object.keys(state).filter(function (k) { return k === 'door' ? !state.door : state[k]; }).length;
    if (count) count.textContent = n;
    if (phone) {
      Object.keys(NAMES).forEach(function (k) {
        var t = phone.querySelector('[data-tile="' + k + '"]'); if (!t) return;
        t.classList.toggle('is-on', !!state[k]);
        t.querySelector('[data-st]').textContent = state[k] ? 'On' : 'Off';
        t.querySelector('[data-sw]').setAttribute('aria-pressed', state[k] ? 'true' : 'false');
      });
      var ac = phone.querySelector('[data-tile="air"]');
      ac.classList.toggle('is-on', !!state.air);
      ac.querySelector('[data-st]').textContent = state.air ? air.t + '°C · ' + air.mode + ' · ' + air.fan : 'Off';
      [].forEach.call(phone.querySelectorAll('[data-sw="air"]'), function (b) { b.setAttribute('aria-pressed', state.air ? 'true' : 'false'); });
      var pg = phone.querySelector('[data-air-page]');
      pg.classList.toggle('is-off', !state.air);
      pg.querySelector('[data-air-temp]').textContent = air.t;
      pg.querySelector('[data-air-mode]').textContent = state.air ? air.mode : 'Off';
      pg.querySelector('[data-ring]').style.strokeDashoffset = (RING * (1 - (air.t - 16) / 14)).toFixed(1);
      [].forEach.call(pg.querySelectorAll('[data-mode]'), function (c) { c.classList.toggle('is-on', c.getAttribute('data-mode') === air.mode); });
      [].forEach.call(pg.querySelectorAll('[data-fan]'), function (c) { c.classList.toggle('is-on', c.getAttribute('data-fan') === air.fan); });
      lights.style.setProperty('--air-s', AIRS[air.fan] + 's');
      var ds = phone.querySelector('[data-door-status]'); if (ds && !state.door) ds.textContent = 'Locked';
    }
  }
  if (phone) {
    var scr = phone.querySelector('.ep-phone_screen');
    scr.innerHTML = '<div class="sm_in">' +
      '<h3 class="sm_title">Your smart room</h3>' +
      '<div class="sm_panel"><div><span>Smart panel</span><b>EPIISOD</b></div><div class="sm_cnt"><b data-app-count>6</b><span>active</span></div></div>' +
      '<div class="sm_door"><div class="sm_row"><div><b>Main door</b><small data-door-status>Locked</small></div></div>' +
        '<div class="sm_slide" data-slide><i class="sm_fill"></i><button type="button" class="sm_knob" aria-label="Slide to unlock the door">' + ICON.lock + '</button><span class="sm_chev">&gt;&gt;</span><span class="sm_end">' + ICON.unlock + '</span></div></div>' +
      '<p class="sm_lab">Lightings</p>' +
      '<div class="sm_grid">' + Object.keys(NAMES).map(function (k) {
        return '<div class="sm_tile is-on" data-tile="' + k + '"><div class="sm_top"><span class="sm_ico">' + ICON.bulb + '</span><button type="button" class="sm_pw" data-sw="' + k + '" aria-label="' + NAMES[k] + ' power" aria-pressed="true">' + ICON.power + '</button></div><b>' + NAMES[k] + '</b><small data-st>On</small></div>';
      }).join('') + '</div>' +
      '<div class="sm_tile sm_air is-on" data-tile="air"><span class="sm_ico">' + ICON.snow + '</span><div class="sm_nm"><b>Air conditioner</b><small data-st>22°C · Cool · Auto</small></div><span class="sm_go">' + ICON.chev + '</span><button type="button" class="sm_pw" data-sw="air" aria-label="Aircon power" aria-pressed="true">' + ICON.power + '</button></div></div>';
    var page = document.createElement('div');
    page.className = 'ep-app_page sm_page'; page.setAttribute('data-air-page', '');
    page.innerHTML =
      '<div class="sm_ph"><button type="button" class="sm_back" data-air-back aria-label="Back">' + ICON.back + '</button><div><b>Air conditioner</b><small data-air-mode>Cool</small></div><button type="button" class="sm_pw" data-sw="air" aria-label="Aircon power" aria-pressed="true">' + ICON.power + '</button></div>' +
      '<div class="sm_dial"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="sm_trk" cx="100" cy="100" r="80"/><circle class="sm_arc" data-ring cx="100" cy="100" r="80"/></svg><div class="sm_val"><b data-air-temp>22</b><span>°C</span></div><div class="sm_pm"><button type="button" data-temp="-1" aria-label="Cooler">−</button><button type="button" data-temp="1" aria-label="Warmer">+</button></div></div>' +
      '<div class="sm_chips">' + MODES.map(function (m) { return '<button type="button" data-mode="' + m + '">' + m + '</button>'; }).join('') + '</div>' +
      '<div class="sm_chips">' + FANS.map(function (f) { return '<button type="button" data-fan="' + f + '">' + f + '</button>'; }).join('') + '</div>';
    scr.appendChild(page);
    count = scr.querySelector('[data-app-count]');
    slideEl = scr.querySelector('[data-slide]'); knob = slideEl.querySelector('.sm_knob');
    function openAir(on) { scr.classList.toggle('is-air', on); }
    phone.addEventListener('click', function (e) {
      var sw = e.target.closest('[data-sw]');
      if (sw) { var k = sw.getAttribute('data-sw'); state[k] = !state[k]; paint(); if (k === 'air') { chime(state.air); airSay(state.air ? 'Aircon on. ' + air.mode + ' mode. ' + air.t + ' degrees. Fan speed ' + air.fan : 'Aircon off'); } return; }
      if (e.target.closest('[data-air-back]')) { openAir(false); return; }
      var t = e.target.closest('[data-temp]');
      if (t) { air.t = Math.max(16, Math.min(30, air.t + (+t.getAttribute('data-temp')))); state.air = true; paint(); airSay('Temperature ' + air.t + ' degrees'); return; }
      var m = e.target.closest('[data-mode]');
      if (m) { air.mode = m.getAttribute('data-mode'); state.air = true; paint(); airSay('Mode ' + air.mode); return; }
      var f = e.target.closest('[data-fan]');
      if (f) { air.fan = f.getAttribute('data-fan'); state.air = true; paint(); airSay('Fan speed ' + air.fan); return; }
      var tile = e.target.closest('[data-tile]');
      if (!tile) return;
      var k2 = tile.getAttribute('data-tile');
      if (k2 === 'air') openAir(true); else { state[k2] = !state[k2]; paint(); }
    });
    // slide the knob across the bar to unlock; let go early and it springs back
    var sd = null;
    knob.addEventListener('pointerdown', function (e) {
      if (state.door || e.button > 0) return;
      sd = { x: e.clientX, max: knobMax() };
      try { knob.setPointerCapture(e.pointerId); } catch (err) {}
      e.stopPropagation();
    });
    knob.addEventListener('pointermove', function (e) { if (!sd) return; knobTo(Math.max(0, Math.min(sd.max, e.clientX - sd.x)), false); });
    function endSlide(e) {
      if (!sd) return;
      var x = Math.max(0, Math.min(sd.max, e.clientX - sd.x)), full = x > sd.max * 0.8; sd = null;
      if (full) door(true); else knobTo(0, true);
    }
    knob.addEventListener('pointerup', endSlide); knob.addEventListener('pointercancel', function () { sd = null; knobTo(0, true); });
    knob.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !state.door) { e.preventDefault(); door(true); } });
    window.addEventListener('resize', function () { if (state.door) knobTo(knobMax(), false); });
  }
  if (phone) { var dh = document.createElement('span'); dh.className = 'ep-phone_drag'; dh.setAttribute('aria-hidden', 'true'); dh.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 1v14M1 8h14M8 1 6 3M8 1l2 2M8 15l-2-2M8 15l2-2M1 8l2-2M1 8l2 2M15 8l-2-2M15 8l-2 2"/></svg>Drag the phone to move it'; phone.appendChild(dh); }
  paint();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) loadFrames(); }, { rootMargin: '120% 0px' }).observe(blk); else loadFrames();

  // drag the phone anywhere on the screen (grab it by its frame, header or empty space; the switches still just switch)
  var ox = 0, oy = 0, drag = null;
  if (phone) {
    var moved = false;
    phone.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || !mq.matches || e.target.closest('.sm_knob')) return;
      drag = { x: e.clientX, y: e.clientY, ox: ox, oy: oy, id: e.pointerId, on: false };
      moved = false;
    });
    phone.addEventListener('pointermove', function (e) {
      if (!drag) return;
      if (e.buttons === 0) { drag = null; phone.classList.remove('is-drag'); return; }
      var mx = e.clientX - drag.x, my = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.hypot(mx, my) < 7) return;
        drag.on = true; moved = true; phone.classList.add('is-drag', 'was-dragged');
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
    // sizes come from the block's own (unscaled) layout box: during the intro the block is drawn scaled down, and its
    // on-screen size would leave the picture short of the bottom of the block
    var bw = box.offsetWidth || r.width, bh = box.offsetHeight || r.height;
    var w0 = Math.max(bw, bh * ar);                   // at rest: covering the whole block
    var h0 = w0 / ar, w = lerp(w0, bw, p), h = w / ar;               // zooms out until it spans the full width
    var cy = lerp(bh / 2, vh / 2 - r.top, p);         // and settles in the middle of the screen
    // ...but never past the edges of its own block: as the section scrolls away (down or back up) the picture leaves with
    // it, like any other content, instead of staying centred and being cut by the block's edge
    var hv = h0 * (w / w0);
    if (bh >= hv) cy = Math.max(hv / 2, Math.min(bh - hv / 2, cy));
    on = true;
    box.style.background = ''; fill.style.opacity = '0';   // around the picture: the section's own background, no blurred copy
    // the picture keeps one fixed size and is scaled and moved with transforms (composited on the GPU), instead of being
    // re-laid-out every frame
    var k = w / w0, ty = cy - h0 / 2;
    var geo = { position: 'absolute', maxWidth: 'none', left: '50%', top: '0px', width: w0.toFixed(1) + 'px', height: h0.toFixed(1) + 'px', transform: 'translate(-50%,' + ty.toFixed(1) + 'px) scale(' + k.toFixed(4) + ')' };
    var s = img.style; s.objectFit = 'cover';
    Object.keys(geo).forEach(function (kk) { if (s[kk] !== geo[kk]) s[kk] = geo[kk]; if (lights.style[kk] !== geo[kk]) lights.style[kk] = geo[kk]; });
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
