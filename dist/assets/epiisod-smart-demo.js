/* Smart room: invites the visitor to try the app (desktop phone and the phone/tablet bottom sheet alike).
   1. Invite: once the app is fully on screen, the room darkens softly around it, a large caption sits beside the phone
      ("Try it — tap a light and watch the room") and a ghost finger glides to Desk Lights and taps it (the light in the
      photograph really goes off, then on again). It repeats every few seconds until the visitor touches the app. Silent.
   2. Challenge: after their first touch the caption becomes "Set the mood": four dots fill as each light goes off; with
      all four off, "Welcome home" with a Book a tour button. */
(function () {
  var S = window.__epSmart;
  if (!S || !S.phone) return;
  var phone = S.phone, scr = phone.querySelector('.ep-phone_screen');
  if (!scr) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LIGHTS = ['desk', 'main', 'accent', 'kitchen'];
  var phase = 'idle', shown = false, timers = [], loopT = 0, seenT = 0, done = false, uses = 0, dismissed = false;

  // ---- elements (fixed to the screen, placed from the phone's position each frame while shown) ----
  var veil = document.createElement('div'); veil.className = 'sm-veil'; veil.setAttribute('aria-hidden', 'true');
  var cap = document.createElement('div'); cap.className = 'sm-cap'; cap.setAttribute('role', 'status'); cap.setAttribute('aria-live', 'polite');
  var finger = document.createElement('div'); finger.className = 'sm-finger'; finger.setAttribute('aria-hidden', 'true');
  finger.innerHTML = '<svg viewBox="0 0 48 48" fill="none"><path d="M18 22V9.5a3.5 3.5 0 0 1 7 0V20m0-3a3.5 3.5 0 0 1 7 0v4m0-1.5a3.5 3.5 0 0 1 7 0V30a13 13 0 0 1-13 13h-2.5a13 13 0 0 1-10-4.7L7.6 31.4a3.4 3.4 0 0 1 5.1-4.5L18 32" stroke="#24120c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#f6efe6"/></svg>';
  document.body.appendChild(veil); document.body.appendChild(cap); document.body.appendChild(finger);

  function btn(k) { return phone.querySelector('[data-sw="' + k + '"]'); }
  function isOn(k) { var b = btn(k); return b && b.getAttribute('aria-pressed') === 'true'; }
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function stopTimers() { timers.forEach(clearTimeout); timers = []; clearTimeout(loopT); }

  var X = '<button type="button" class="sm-cap_x" data-sm-x aria-label="Dismiss"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>';
  function setCap(html, cls) { cap.innerHTML = X + html; cap.className = 'sm-cap is-on' + (cls ? ' ' + cls : ''); place(); }
  function inviteCap() { setCap('<span class="sm-cap_eb">Try it</span><b class="sm-cap_t">Tap a light and watch the room</b><span class="sm-cap_s">Every switch in the app controls the room you see.</span>'); }
  function challengeCap() {
    var off = LIGHTS.filter(function (k) { return !isOn(k); }).length;
    var dots = LIGHTS.map(function (k) { return '<i class="' + (isOn(k) ? '' : 'is-off') + '"></i>'; }).join('');
    setCap('<span class="sm-cap_eb">Set the mood</span><b class="sm-cap_t">Turn the lights down for the night</b><span class="sm-cap_dots">' + dots + '<em>' + off + ' of 4</em></span>', 'is-challenge');
    return off;
  }
  function welcomeCap() {
    setCap('<span class="sm-cap_eb">Lights out</span><b class="sm-cap_t">Welcome home.</b><span class="sm-cap_s">This is your room at EPIISOD.</span><a href="#" class="sm-cap_cta" data-sm-book>Book a tour <i>→</i></a>', 'is-home');
  }

  // caption beside the phone (desktop: on its left, or right if there's no room); on phones and tablets it sits on the
  // photograph just above the controls sheet
  function place() {
    var r = phone.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, cw = cap.offsetWidth, ch = cap.offsetHeight;
    var sheet = phone.closest('.ep-msm_sheet');
    var x, y;
    if (sheet) {
      var st = sheet.getBoundingClientRect().top;
      x = (vw - cw) / 2; y = Math.max(12, st - ch - 14);
    } else {
      x = r.left - cw - 44; if (x < 16) x = Math.min(vw - cw - 16, r.right + 44);
      y = r.top + r.height * 0.36 - ch / 2;
    }
    cap.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    // the room darkens softly around the phone (the centre stays clear so the photograph's lights still read)
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    veil.style.background = 'radial-gradient(ellipse ' + Math.round(Math.max(r.width * 1.5, vw * 0.36)) + 'px ' + Math.round(r.height * 0.9) + 'px at ' + Math.round(cx) + 'px ' + Math.round(cy) + 'px, rgba(18,9,5,0) 0%, rgba(18,9,5,0) 55%, rgba(18,9,5,.5) 100%)';
  }

  function ripple(el) {
    var sr = scr.getBoundingClientRect(), br = el.getBoundingClientRect(), d = document.createElement('i');
    d.className = 'sm-tap';
    d.style.left = (br.left - sr.left + br.width / 2).toFixed(1) + 'px';
    d.style.top = (br.top - sr.top + br.height / 2).toFixed(1) + 'px';
    scr.appendChild(d); setTimeout(function () { d.remove(); }, 1200);
  }
  function quietClick(b) { window.__epDemoQuiet = true; try { b.click(); } finally { window.__epDemoQuiet = false; } }
  function fingerTo(el, dur) {
    var r = el.getBoundingClientRect();
    finger.style.transitionDuration = dur + 'ms';
    finger.style.transform = 'translate(' + Math.round(r.left + r.width / 2 - 14) + 'px,' + Math.round(r.top + r.height / 2 - 6) + 'px)';
  }
  function fingerRest() {
    var r = cap.getBoundingClientRect();
    finger.style.transitionDuration = '0ms';
    finger.style.transform = 'translate(' + Math.round(r.right - 40) + 'px,' + Math.round(r.bottom - 10) + 'px)';
  }
  // one demonstration: the finger glides to Desk Lights, taps (off), waits, taps again (on), and drifts away
  function demo() {
    if (phase !== 'invite' || reduce) return;
    var b = btn('desk'); if (!b) return;
    fingerRest(); finger.classList.add('is-on');
    at(60, function () { fingerTo(b, 950); });
    at(1100, function () { finger.classList.add('is-tap'); ripple(b); quietClick(b); });
    at(1380, function () { finger.classList.remove('is-tap'); });
    at(2900, function () { finger.classList.add('is-tap'); ripple(b); quietClick(b); });
    at(3180, function () { finger.classList.remove('is-tap'); finger.classList.remove('is-on'); });
    loopT = setTimeout(function () { if (phase === 'invite') demo(); }, 6500);
  }

  function show() {
    shown = true; phase = 'invite';
    veil.classList.add('is-on'); phone.classList.add('sm-invite');
    inviteCap(); demo();
  }
  function hideAll() {
    shown = false; stopTimers();
    // a demo tap may have left Desk Lights off: put it back
    if (phase === 'invite' && !isOn('desk')) { var b = btn('desk'); if (b) quietClick(b); }
    veil.classList.remove('is-on'); cap.classList.remove('is-on'); finger.classList.remove('is-on', 'is-tap'); phone.classList.remove('sm-invite');
  }

  // the visitor takes over: the invitation stops for good, the challenge starts
  phone.addEventListener('pointerdown', function (e) {
    if (!e.isTrusted || phase !== 'invite') return;
    stopTimers(); finger.classList.remove('is-on', 'is-tap');
    if (!isOn('desk')) { var b = btn('desk'); if (b) quietClick(b); }   // undo a half-finished demo before their own tap lands
    phase = 'challenge'; veil.classList.remove('is-on'); phone.classList.remove('sm-invite');
    setTimeout(function () { if (phase === 'challenge') challengeCap(); }, 60);
  }, true);
  phone.addEventListener('click', function (e) {
    if (!e.isTrusted) return;
    if (e.target.closest('[data-sw], [data-mode], [data-fan], .sm_air')) uses++;
    if (phase !== 'challenge') return;
    setTimeout(function () {
      if (phase !== 'challenge') return;
      var off = challengeCap();
      if (off === 4) { phase = 'home'; done = true; setTimeout(welcomeCap, 700); setTimeout(function () { cap.classList.remove('is-on'); }, 12000); }
    }, 40);
  });
  cap.addEventListener('click', function (e) {
    if (e.target.closest('[data-sm-x]')) { hideAll(); dismissed = true; phase = 'dismissed'; document.documentElement.classList.remove('ep-in-app'); return; }
    if (!e.target.closest('[data-sm-book]')) return;
    e.preventDefault();
    var real = document.querySelector('[data-modal-cta-btn="book-a-call"]');
    if (real) real.click(); else location.href = 'https://epiisod.com/en-au';
  });

  // show while the app is fully on screen and usable; keep the caption placed while it is
  // the smart room section itself must be filling the screen (the phone later travels on into the app section, where
  // the invitation has no place)
  var host = phone.closest('.ep-msm') || S.blk.closest('.arch-scroll-area') || S.blk;
  function inSection() {
    var sec = phone.closest('.ep-msm') || host, b = sec.getBoundingClientRect(), vh = window.innerHeight;
    return b.top < vh * 0.25 && b.bottom > vh * 0.75;
  }
  function ready() {
    if (dismissed || !inSection()) return false;
    var r = phone.getBoundingClientRect(), vh = window.innerHeight, cs = getComputedStyle(phone);
    return r.height > 120 && r.top >= -8 && r.bottom <= vh + 8 && cs.pointerEvents !== 'none' && +cs.opacity > 0.95 && cs.display !== 'none' && !document.hidden;
  }
  (function watch() {
    requestAnimationFrame(watch);
    var ok = ready();
    // phones: the section line on the right edge sits over the controls sheet; it steps aside while the app is up
    document.documentElement.classList.toggle('ep-in-app', ok && !!phone.closest('.ep-msm_sheet'));
    if (!ok) { seenT = 0; if (shown) hideAll(); return; }
    if (!shown) {
      if (done && phase === 'home') return;
      if (!seenT) seenT = performance.now();
      if (performance.now() - seenT < 600) return;
      if (phase === 'idle' || phase === 'invite') show();
      else { shown = true; challengeCap(); }
      return;
    }
    place();
  })();
})();
