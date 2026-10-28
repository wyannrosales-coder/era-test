/* The app section. Desktop: pinned, the phone on the left changes screen (sliding sideways) as you scroll or pick a tab on
   the right. Phones and tablets: a phone you swipe left and right, with the words beside it and dots underneath. */
(function () {
  var sec = document.getElementById('app');
  if (!sec) return;
  var IMG = '/assets/app/s';
  var F = [
    { n: 'Amenities', t: 'Explore all your EPIISOD amenities', d: 'Reception, gym, study hub, outdoor pool, kitchen and dining, laundry, game room, meeting room, courtyard and BBQ desk, all in one place.' },
    { n: 'Parcels', t: 'Claim your parcel and keep track', d: 'See what is waiting for pick-up, what you have claimed and your recent parcels at a glance.' },
    { n: 'Discover', t: 'Discover life around your new home', d: 'Events and what is nearby: food and beverage, essentials, getting around, attractions and entertainment.' },
    { n: 'Maintenance', t: 'Submit maintenance requests', d: 'Report electrical, connectivity, housekeeping or general issues with photos, and follow the progress.' },
    { n: 'Payments', t: 'Make payments and view your transactions', d: 'Check your next rental payment, update direct debit and read your statement of accounts.' },
    { n: 'Resi-Life', t: 'Join exclusive Resi-Life activities', d: 'Browse the events, register in a tap and get an instant confirmation.' }
  ];
  var N = F.length;
  var pin = sec.querySelector('.ep-ap_pin'), stage = sec.querySelector('.ep-ap_stage');
  var track = sec.querySelector('[data-ap-track]'), screen = sec.querySelector('[data-ap-screen]');
  var tabs = sec.querySelector('[data-ap-tabs]'), dots = sec.querySelector('[data-ap-dots]');
  var mq = window.matchMedia('(min-width: 992px)');
  // every screen is built from the Figma frames so it can animate: a base picture, and either a bottom sheet that pushes up
  // over it or a card that lifts out of the phone
  var A = '/assets/app/';
  var CONF = [
    { base: 'f1_full.webp', sheet: { src: 's1.webp', top: 728 } },
    { base: 'f2_full.webp', pop: { x: 20 / 375, y: 478 / 812, w: 335 / 375, h: 110 / 812, k: 1.5, dx: 0 } },
    { base: 's3.webp', pop: { x: 0.523, y: 0.662, w: 0.43, h: 0.212, k: 1.5, dx: 0.07 } },
    { base: 'f4_full.webp', sheet: { src: 's4.webp', top: 418 } },
    { base: 's5.webp', pop: { x: 0.043, y: 0.572, w: 0.915, h: 0.188, k: 1.22, dx: 0 } },
    { base: 'f6_base.webp', dimmed: true, sheet: { src: 's6.webp', top: 766 } }
  ];
  track.innerHTML = F.map(function (f, i) {
    var c = CONF[i];
    return '<div class="ep-ap_slide" role="img" aria-label="' + f.n + ' screen of the EPIISOD app"><div class="ep-ap_pic' + (c.dimmed ? ' is-dimmed' : '') + '" style="background-image:url(' + A + c.base + ')"></div>' +
      (c.sheet ? '<div class="ep-ap_dim"></div><div class="ep-ap_sheet" style="aspect-ratio:600/' + (1296 - c.sheet.top) + ';background-image:url(' + A + c.sheet.src + ')"></div>' : '') + '</div>';
  }).join('');
  var fx = document.createElement('div');
  fx.className = 'ep-ap_fx'; fx.setAttribute('aria-hidden', 'true');
  CONF.forEach(function (c, i) { if (c.pop) { var d = document.createElement('div'); d.className = 'ep-ap_pop'; d.setAttribute('data-i', i); d.style.backgroundImage = 'url(' + A + c.base + ')'; fx.appendChild(d); } });
  sec.querySelector('.ep-ap_body').appendChild(fx);
  function layoutPops() {
    var sw = screen.clientWidth, sh = screen.clientHeight;
    [].forEach.call(fx.children, function (d) {
      var c = CONF[+d.getAttribute('data-i')].pop;
      d.style.left = (c.x * sw) + 'px'; d.style.top = (c.y * sh) + 'px'; d.style.width = (c.w * sw) + 'px'; d.style.height = (c.h * sh) + 'px';
      d.style.backgroundSize = sw + 'px auto'; d.style.backgroundPosition = (-c.x * sw) + 'px ' + (-c.y * sh) + 'px';
      d.style.setProperty('--k', c.k); d.style.setProperty('--dx', (c.dx * sw) + 'px');
    });
  }
  track.style.setProperty('--n', N);
  tabs.innerHTML = F.map(function (f, i) {
    return '<li><button type="button" class="ep-ap_tab" data-i="' + i + '"><span class="ep-ap_no">0' + (i + 1) + '</span><span class="ep-ap_nm">' + f.n + '</span><span class="ep-ap_more"><span><b>' + f.t + '</b><em>' + f.d + '</em></span></span></button></li>';
  }).join('');
  dots.innerHTML = F.map(function (f, i) { return '<button type="button" data-i="' + i + '" aria-label="' + f.n + '"></button>'; }).join('');
  var mt = document.createElement('div');
  mt.className = 'ep-ap_mtxt'; mt.innerHTML = '<p class="ep-ap_mno"></p><h3 class="ep-ap_mt"></h3><p class="ep-ap_md"></p>';
  stage.appendChild(mt);
  var cur = -1, fxT = 0;

  function play(i) {                                  // this screen's own animation: the screen rises, the pop-out piece pops
    layoutPops();                                     // sized from the phone as it is right now, not as it was at load
    [].forEach.call(track.children, function (sl) { sl.classList.remove('is-up'); });
    [].forEach.call(fx.children, function (d) { d.classList.remove('is-pop', 'is-on'); });
    track.children[i].classList.add('is-up');
    var d = fx.querySelector('[data-i="' + i + '"]');
    if (d) { d.classList.add('is-on'); void d.offsetWidth; d.classList.add('is-pop'); }
  }
  function show(i) {
    if (drag) { try { if (drag.on) screen.releasePointerCapture(drag.id); } catch (err) {} drag = null; }   // a click always wins over a half-finished swipe
    if (i === cur) {                                  // same screen: make sure it is in place and its animation is up
      place(0, true);
      if (!track.children[i].classList.contains('is-up')) play(i);
      return;
    }
    cur = i;
    [].forEach.call(tabs.children, function (li, k) { li.firstChild.classList.toggle('is-on', k === i); });
    [].forEach.call(dots.children, function (d, k) { d.classList.toggle('is-on', k === i); });
    place(0, true);
    mt.classList.remove('is-in');
    mt.querySelector('.ep-ap_mno').textContent = '0' + (i + 1) + ' / 0' + N;
    mt.querySelector('.ep-ap_mt').textContent = F[i].t;
    mt.querySelector('.ep-ap_md').textContent = F[i].d;
    void mt.offsetWidth; mt.classList.add('is-in');
    // the animation for this screen starts once it has slid into place (when the slide ends, or after a fallback delay)
    clearTimeout(fxT); track.removeEventListener('transitionend', onSlid);
    [].forEach.call(track.children, function (sl) { sl.classList.remove('is-up'); });
    [].forEach.call(fx.children, function (d) { d.classList.remove('is-pop', 'is-on'); });
    var go = function () { if (cur !== i || track.children[i].classList.contains('is-up')) return; clearTimeout(fxT); track.removeEventListener('transitionend', onSlid); play(i); };
    onSlid = function (e) { if (e.target === track && e.propertyName === 'transform') setTimeout(go, 60); };
    track.addEventListener('transitionend', onSlid);
    fxT = setTimeout(go, 900);
  }
  var onSlid = null;
  // the track sits at the current screen, plus however far a finger has dragged it
  function place(dx, anim) {
    if (anim) { track.style.transition = ''; void track.offsetWidth; } else track.style.transition = 'none';
    track.style.transform = 'translate3d(calc(' + (-Math.max(cur, 0) * 100 / N) + '% + ' + (dx || 0) + 'px),0,0)';
  }
  function measure() { layoutPops(); place(0, false); }
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); }).observe(screen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) show(+b.getAttribute('data-i')); });
  dots.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) show(+b.getAttribute('data-i')); });

  // swipe left and right through the screens (touch and mouse), vertical movement still scrolls the page
  var drag = null;
  screen.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false, w: screen.clientWidth || 1 };
  });
  screen.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 12) drag = null; return; }
      drag.on = true; try { screen.setPointerCapture(drag.id); } catch (err) {}
    }
    var edge = (cur === 0 && dx > 0) || (cur === N - 1 && dx < 0);
    place(edge ? dx * 0.3 : dx, false);
  });
  function endDrag(e) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.on) return;
    var dx = e.clientX - d.x, next = cur;
    if (dx < -d.w * 0.18) next = Math.min(N - 1, cur + 1); else if (dx > d.w * 0.18) next = Math.max(0, cur - 1);
    if (next === cur) place(0, true); else show(next);
  }
  screen.addEventListener('pointerup', endDrag); screen.addEventListener('pointercancel', endDrag);
  // the words under the phone swipe through the screens too
  var td = null;
  mt.addEventListener('pointerdown', function (e) { td = { x: e.clientX, y: e.clientY }; });
  mt.addEventListener('pointerup', function (e) {
    if (!td) return; var dx = e.clientX - td.x, dy = e.clientY - td.y; td = null;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.2) show(Math.max(0, Math.min(N - 1, cur + (dx < 0 ? 1 : -1))));
  });
  mt.addEventListener('pointercancel', function () { td = null; });
  screen.addEventListener('dragstart', function (e) { e.preventDefault(); });
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var r = sec.getBoundingClientRect(); if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.5) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (window.__epSmart && window.__epSmart.blk.getBoundingClientRect().bottom > innerHeight * 0.3) return;
    show(Math.max(0, Math.min(N - 1, cur + (e.key === 'ArrowRight' ? 1 : -1))));
  });
  show(0); measure();
})();
