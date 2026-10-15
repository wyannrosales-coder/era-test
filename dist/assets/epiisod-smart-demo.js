/* Smart room: invites the visitor to try the app (desktop phone and the phone/tablet bottom sheet alike).
   Once the app is fully on screen, it demos itself once: a notification slides down inside the app, a tap ripple presses
   Desk Lights and then Main Light (the photograph dims for real), both come back on, and it hands over: "Your turn".
   The demo is silent and stops the moment the visitor touches anything. After two of their own interactions, a short
   "Welcome home" note appears with a Book a tour link. */
(function () {
  var S = window.__epSmart;
  if (!S || !S.phone) return;
  var phone = S.phone, scr = phone.querySelector('.ep-phone_screen');
  if (!scr) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var played = false, running = false, touched = false, uses = 0, rewarded = false, timers = [], flipped = {}, seenT = 0;

  var note = document.createElement('div');
  note.className = 'sm-note'; note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite');
  scr.appendChild(note);
  function show(html, cls) { note.innerHTML = html; note.className = 'sm-note is-on' + (cls ? ' ' + cls : ''); }
  function hide() { note.classList.remove('is-on'); }
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function stopTimers() { timers.forEach(clearTimeout); timers = []; }
  function btn(k) { return phone.querySelector('[data-sw="' + k + '"]'); }

  function ripple(el) {
    var sr = scr.getBoundingClientRect(), br = el.getBoundingClientRect();
    var d = document.createElement('i');
    d.className = 'sm-tap';
    d.style.left = (br.left - sr.left + br.width / 2).toFixed(1) + 'px';
    d.style.top = (br.top - sr.top + br.height / 2).toFixed(1) + 'px';
    scr.appendChild(d);
    setTimeout(function () { d.remove(); }, 1200);
  }
  function press(k, withRipple) {
    var b = btn(k);
    if (!b) return;
    if (withRipple) ripple(b);
    setTimeout(function () {
      if (touched && withRipple) return;
      window.__epDemoQuiet = true;
      try { b.click(); } finally { window.__epDemoQuiet = false; }
      flipped[k] = !flipped[k];
    }, withRipple ? 260 : 0);
  }
  function restore() { Object.keys(flipped).forEach(function (k) { if (flipped[k]) press(k, false); }); flipped = {}; }

  function invite() {
    show('<b>Your turn</b><span>Tap a switch, or slide to unlock the door.</span>', 'is-turn');
    phone.classList.add('sm-invite');
  }
  function play() {
    played = true; running = true;
    if (reduce) { running = false; invite(); return; }
    show('<b>Your smart room</b><span>Every switch controls the room in the photo.</span>');
    at(1100, function () { press('desk', true); });
    at(2500, function () { press('main', true); });
    at(4100, function () { press('desk', true); });
    at(4900, function () { press('main', true); });
    at(6300, function () { running = false; flipped = {}; invite(); });
    at(15000, function () { if (!touched) { hide(); phone.classList.remove('sm-invite'); } });
  }
  function abort() {                                   // scrolled away mid-demo: put the room back, try again next time
    stopTimers(); running = false; restore(); hide(); played = false;
  }

  // the visitor takes over: stop the demo straight away
  ['pointerdown', 'keydown'].forEach(function (ev) {
    phone.addEventListener(ev, function (e) {
      if (!e.isTrusted || touched) return;
      touched = true; stopTimers();
      if (running) { running = false; flipped = {}; }
      phone.classList.remove('sm-invite');
      if (note.classList.contains('is-turn') || !rewarded) hide();
    }, true);
  });
  // their own interactions: after two, a quiet "welcome home"
  function used() {
    uses++;
    if (uses === 2 && !rewarded) {
      rewarded = true;
      setTimeout(function () {
        show('<b>Welcome home.</b><span>This is your room at EPIISOD.</span><a href="#" class="sm-note_cta" data-sm-book>Book a tour <i>→</i></a>', 'is-home');
        setTimeout(hide, 9000);
      }, 1100);
    }
  }
  phone.addEventListener('click', function (e) {
    if (!e.isTrusted) return;
    if (e.target.closest('[data-sm-book]')) {
      e.preventDefault();
      var real = document.querySelector('[data-modal-cta-btn="book-a-call"]:not([data-sm-book])');
      if (real) real.click(); else location.href = 'https://epiisod.com/en-au';
      return;
    }
    if (e.target.closest('[data-sw], [data-mode], [data-fan], [data-air-up], [data-air-down], .sm_air')) used();
  });
  var knob = phone.querySelector('.sm_knob');
  if (knob) knob.addEventListener('pointerup', function (e) { if (e.isTrusted) used(); });

  // start once the app is fully on screen and usable, and has stayed so for a moment
  function ready() {
    var r = phone.getBoundingClientRect(), vh = window.innerHeight, cs = getComputedStyle(phone);
    return r.height > 120 && r.top >= -8 && r.bottom <= vh + 8 && cs.pointerEvents !== 'none' && +cs.opacity > 0.95 && cs.display !== 'none' && !document.hidden;
  }
  setInterval(function () {
    if (touched) return;
    var ok = ready();
    if (running && !ok) { abort(); return; }
    if (played || running) return;
    if (ok) { if (!seenT) seenT = performance.now(); else if (performance.now() - seenT > 700) play(); }
    else seenT = 0;
  }, 250);
})();
