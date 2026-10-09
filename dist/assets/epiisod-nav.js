/* Section navigation for the desktop scroll bar: ticks per section (hover = thumbnail, click = go there),
   plus previous / next buttons beside the "Scroll" label. */
(function () {
  var ready = 0;
  function boot() {
    var bar = document.querySelector('[data-s-bar]');
    var fly = document.getElementById('flythrough');
    if (!fly) { if (++ready < 40) setTimeout(boot, 250); return; }
    if (document.querySelector('.ep-mnav')) return;

    var q = function (s) { return document.querySelector(s); };
    var amen = q('.amen-scroll-area');
    var reveal = q('#reveal');
    var resi = q('section.section.arch');
    var lastSec = [].slice.call(document.querySelectorAll('body section')).pop();
    var nearby = q('#nearby');
    var stops = [
      { label: 'Welcome',      el: fly,    img: '/assets/flythrough/poster1.jpg', at: function () { return 0; } },
      { label: 'Life here',    el: reveal, img: '/assets/reveal/poster.jpg', at: function () { return top(reveal) + 4; } },
      { label: 'Amenities',    el: amen,   at: function () { return top(reveal) + parseFloat(reveal.style.getPropertyValue('--rv-len') || 0) + 24; } },
      { label: 'The story',    el: amen && amen.nextElementSibling, img: '/assets/flythrough/poster2.jpg' },
      { label: 'Nearby',       el: nearby, img: '/assets/d6e2a8a6e1-6a15185e6803ae588479d12b_era-residence-master-plan-p-500.png' },
      { label: 'Location',     el: nearby && nearby.nextElementSibling, img: '/assets/e5a7ecf096-6a15185e6803ae588479d12b_era-residence-master-plan-p-800.png' },
      { label: 'Bedrooms',     el: nearby && nearby.nextElementSibling && nearby.nextElementSibling.nextElementSibling },
      { label: 'Stays',        el: q('[data-ep-rooms-pin]'), img: '/assets/323a425745-6a1571e51d50c8bcf5f4bb3d_era-residence-garden-2-p-500.png' },
      { label: 'Resi-Life',    el: resi, img: '/assets/resi-life/resi-life-toast.webp' },
      { label: 'Design',       el: resi && resi.nextElementSibling },
      { label: 'Contact',      el: lastSec }
    ].filter(function (s) { return s.el; });

    function top(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
    function thumbFor(s) {
      if (s.img) return s.img;
      var im = s.el.querySelector('img[src]:not([src^="data:"])');
      if (!im) return '';
      var m = (im.getAttribute('srcset') || '').match(/(\S+)\s+500w/);
      return m ? m[1] : im.getAttribute('src');
    }
    function target(s) { return Math.max(0, Math.round(s.at ? s.at() : top(s.el))); }
    function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }

    // ticks along the existing bar
    var wrap = document.createElement('div');
    wrap.className = 'ep-nav_ticks';
    var thumbs = stops.map(thumbFor);
    var ticks = stops.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ep-nav_tick'; b.setAttribute('aria-label', 'Go to ' + s.label);
      var card = document.createElement('span');
      card.className = 'ep-nav_card';
      var src = thumbFor(s);
      card.innerHTML = (src ? '<img alt="" loading="lazy" src="' + src + '">' : '') + '<span>' + s.label + '</span>';
      b.appendChild(card);
      b.addEventListener('click', function () { go(i); });
      wrap.appendChild(b);
      return b;
    });
    if (bar) bar.appendChild(wrap);

    function go(i) {
      i = Math.max(0, Math.min(stops.length - 1, i));
      var y = target(stops[i]);
      var L = window.__lenis;
      if (L && L.scrollTo) L.scrollTo(y, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }
    function current() {
      var y = window.pageYOffset + 8, idx = 0;
      for (var i = 0; i < stops.length; i++) if (target(stops[i]) <= y) idx = i;
      return idx;
    }

    // previous / next beside "Scroll"
    var btns = document.createElement('div');
    btns.className = 'ep-nav_btns';
    btns.setAttribute('data-theme', '');
    var chev = function (d) { return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="' + d + '"/></svg>'; };
    btns.innerHTML = '<button type="button" class="ep-nav_btn" data-nav="prev" aria-label="Previous section">' + chev('M4 10l4-4 4 4') + '</button>' +
                     '<button type="button" class="ep-nav_btn" data-nav="next" aria-label="Next section">' + chev('M4 6l4 4 4-4') + '</button>';
    document.body.appendChild(btns);
    btns.querySelector('[data-nav="next"]').addEventListener('click', function () { go(current() + 1); });
    btns.querySelector('[data-nav="prev"]').addEventListener('click', function () {
      var c = current();
      go(window.pageYOffset - target(stops[c]) > 120 ? c : c - 1);
    });


    // ---- phones and tablets: floating pill (previous / current section / next) that opens a thumbnail list ----
    var pill = document.createElement('div');
    pill.className = 'ep-mnav';
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    pill.innerHTML =
      '<button type="button" class="ep-mnav_btn" data-m="prev" aria-label="Previous section">' + chev('M4 10l4-4 4 4') + '</button>' +
      '<button type="button" class="ep-mnav_name" aria-haspopup="dialog" aria-expanded="false"><em data-m="num"></em><span data-m="name"></span></button>' +
      '<button type="button" class="ep-mnav_btn" data-m="next" aria-label="Next section">' + chev('M4 6l4 4 4-4') + '</button>' +
      '<i class="ep-mnav_prog" data-m="prog"></i>';
    var sheet = document.createElement('div');
    sheet.className = 'ep-msheet';
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', 'Jump to a section'); sheet.hidden = true;
    sheet.innerHTML = '<div class="ep-msheet_top"><span>Sections</span><button type="button" data-m="close" aria-label="Close">' +
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div><ol>' +
      stops.map(function (s, i) {
        return '<li><button type="button" data-go="' + i + '"><em>' + pad(i + 1) + '</em><span>' + s.label + '</span></button></li>';
      }).join('') + '</ol>';
    document.body.appendChild(pill);
    document.body.appendChild(sheet);
    var nameEl = pill.querySelector('[data-m="name"]'), numEl = pill.querySelector('[data-m="num"]'), progEl = pill.querySelector('[data-m="prog"]'), nameBtn = pill.querySelector('.ep-mnav_name');
    function setOpen(o) { sheet.hidden = !o; nameBtn.setAttribute('aria-expanded', o ? 'true' : 'false'); document.documentElement.classList.toggle('ep-msheet-open', o); if (o) markList(); }
    function markList() {
      var c = current();
      [].forEach.call(sheet.querySelectorAll('[data-go]'), function (b) { b.classList.toggle('is-on', +b.getAttribute('data-go') === c); });
    }
    pill.querySelector('[data-m="next"]').addEventListener('click', function () { go(current() + 1); });
    pill.querySelector('[data-m="prev"]').addEventListener('click', function () {
      var c = current();
      go(window.pageYOffset - target(stops[c]) > 120 ? c : c - 1);
    });
    nameBtn.addEventListener('click', function () { setOpen(sheet.hidden); });
    sheet.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]');
      if (g) { setOpen(false); go(+g.getAttribute('data-go')); return; }
      if (e.target.closest('[data-m="close"]')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) setOpen(false); });

    var lastIdx = -1, idleT = 0, lastY = window.pageYOffset;
    function mobileState() {
      var c = current();
      if (c !== lastIdx) { lastIdx = c; nameEl.textContent = stops[c].label; numEl.textContent = pad(c + 1); }
      progEl.style.transform = 'scaleX(' + Math.min(1, window.pageYOffset / maxScroll()).toFixed(4) + ')';
    }
    window.addEventListener('scroll', function () {
      mobileState();
      if (Math.abs(window.pageYOffset - lastY) > 3 && sheet.hidden) pill.classList.add('is-away');
      lastY = window.pageYOffset;
      clearTimeout(idleT);
      idleT = setTimeout(function () { pill.classList.remove('is-away'); }, 700);
    }, { passive: true });
    mobileState();

    function place() {
      // evenly spaced so every stop is easy to hit (the thumb still shows true progress)
      stops.forEach(function (s, i) { ticks[i].style.top = (stops.length > 1 ? i / (stops.length - 1) * 100 : 0) + '%'; });
      var c = current();
      ticks.forEach(function (t, i) { t.classList.toggle('is-on', i === c); });
    }
    place();
    window.addEventListener('scroll', function () { var c = current(); ticks.forEach(function (t, i) { t.classList.toggle('is-on', i === c); }); }, { passive: true });
    window.addEventListener('resize', place);
    window.addEventListener('load', place);
    var n = 0, iv = setInterval(function () { place(); if (++n > 20) clearInterval(iv); }, 1000);
  }
  boot();
})();
