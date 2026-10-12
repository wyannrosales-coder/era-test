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
    var amen = function () { return q('.amen-scroll-area'); };
    var reveal = q('#reveal');
    var revealEnd = function () { return top(reveal) + parseFloat(reveal.style.getPropertyValue('--rv-len') || 0) + 24; };
    var smart = function () { var m = q('.ep-msm'); return m && m.offsetParent !== null && getComputedStyle(m).display !== 'none' ? m : (q('.arch-scroll-area:not(.amen-scroll-area)') || q('.arch-scroll-area')); };
    var lastSec = [].slice.call(document.querySelectorAll('body section')).pop();
    // the six places on the desktop line nav, then the same plus the app and the footer on phones
    var S = {
      hero:   { label: 'Hero',                 find: function () { return fly; }, at: function () { return 0; } },
      well:   { label: 'Wellness amenities',   find: amen, at: revealEnd },
      nearby: { label: 'Nearby locations',     find: function () { return q('#location'); } },
      rooms:  { label: 'The rooms',            find: function () { return q('#rooms'); } },
      life:   { label: 'Life beyond',          find: function () { return q('section.section.arch'); } },
      smart:  { label: 'Smart rooms',          find: smart },
      app:    { label: 'The app',              find: function () { return q('#app'); } },
      end:    { label: 'Contact',              find: function () { return lastSec; } }
    };
    function build(keys) { return keys.map(function (k) { var x = S[k]; return { label: x.label, at: x.at, find: x.find, el: x.find() }; }).filter(function (x) { return x.el; }); }
    var dstops = build(['hero', 'well', 'nearby', 'rooms', 'life', 'smart']);
    var stops = build(['hero', 'well', 'nearby', 'rooms', 'life', 'smart', 'app', 'end']);

    function top(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
    function target(s) { var el = s.find ? s.find() : s.el; return Math.max(0, Math.round(s.at ? s.at() : (el ? top(el) : 0))); }
    function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }

    function go(i, list) {
      list = list || stops;
      i = Math.max(0, Math.min(list.length - 1, i));
      var y = target(list[i]);
      var L = window.__lenis;
      if (L && L.scrollTo) L.scrollTo(y, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }
    function current(list) {
      list = list || stops;
      var y = window.pageYOffset + 8, idx = 0;
      for (var i = 0; i < list.length; i++) if (target(list[i]) <= y) idx = i;
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
    btns.querySelector('[data-nav="next"]').addEventListener('click', function () { go(current(dstops) + 1, dstops); });
    btns.querySelector('[data-nav="prev"]').addEventListener('click', function () {
      var c = current(dstops);
      go(window.pageYOffset - target(dstops[c]) > 120 ? c : c - 1, dstops);
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

    // the progress pill only shows while the page is moving
    if (bar) {
      var idleT = 0, py = window.pageYOffset;
      window.addEventListener('scroll', function () {
        if (Math.abs(window.pageYOffset - py) < 1) return;
        py = window.pageYOffset;
        bar.classList.add('is-scrolling');
        clearTimeout(idleT);
        idleT = setTimeout(function () { bar.classList.remove('is-scrolling'); }, 1200);
      }, { passive: true });
      var thumb = bar.querySelector('[data-s-bar-thumb]');
      if (thumb) {
        thumb.addEventListener('pointerdown', function () { bar.classList.add('is-drag'); });
        window.addEventListener('pointerup', function () { bar.classList.remove('is-drag'); });
      }
    }

    // side by side while a horizontally scrolling section is on screen
    var hAreas = [].slice.call(document.querySelectorAll('[data-scroll-horizontal]'));
    function horizontal() {
      var vh = window.innerHeight, on = hAreas.some(function (a) { var r = a.getBoundingClientRect(); return r.top <= vh * 0.5 && r.bottom >= vh * 0.5; });
      btns.classList.toggle('is-h', on);
    }
    window.addEventListener('scroll', horizontal, { passive: true });
    horizontal();

    // ---- desktop: a column of fine lines on the right; hover opens it into a list of names ----
    var rn = document.createElement('nav');
    rn.className = 'ep-rnav'; rn.setAttribute('aria-label', 'Sections');
    rn.innerHTML = '<i class="ep-rnav_track"></i><i class="ep-rnav_fill"></i><span class="ep-rnav_pct"></span><ul>' + dstops.map(function (x, i) {
      return '<li style="--i:' + i + '"><button type="button" data-go="' + i + '" aria-label="Go to ' + x.label + '"><span class="ep-rnav_t">' + x.label + '</span><i class="ep-rnav_l"></i></button></li>';
    }).join('') + '</ul>';
    document.body.appendChild(rn);
    var rItems = [].slice.call(rn.querySelectorAll('li'));
    rn.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) go(+b.getAttribute('data-go'), dstops); });
    // what is behind the nav decides whether it is drawn light or dark: read the real colour under it
    function under() {
      var x = window.innerWidth - 70, y = window.innerHeight / 2;
      rn.style.pointerEvents = 'none';
      var el = document.elementFromPoint(x, y);
      rn.style.pointerEvents = '';
      while (el && el !== document.documentElement) {
        var t = el.tagName;
        if (t === 'IMG' || t === 'VIDEO' || t === 'CANVAS') return false;
        var cs = getComputedStyle(el), bg = cs.backgroundColor, m = bg && bg.match(/rgba?\(([^)]+)\)/);
        if (cs.backgroundImage && cs.backgroundImage !== 'none' && /url\(/.test(cs.backgroundImage)) return false;
        if (m) {
          var v = m[1].split(',').map(parseFloat), a = v.length > 3 ? v[3] : 1;
          if (a > 0.5) return (0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]) > 150;
        }
        el = el.parentElement;
      }
      return true;
    }
    function tone() { rn.classList.toggle('is-light', under()); }
    function lines() {
      tone();
      var c = current(dstops);
      rItems.forEach(function (li, i) { li.classList.toggle('is-on', i === c); li.classList.toggle('is-past', i < c); });
    }
    // lines near the pointer stretch a little, like a ruler
    rn.addEventListener('pointermove', function (e) {
      rItems.forEach(function (li) {
        var r = li.getBoundingClientRect(), d = Math.abs(e.clientY - (r.top + r.height / 2));
        li.style.setProperty('--near', Math.max(0, 1 - d / 70).toFixed(3));
      });
    });
    rn.addEventListener('pointerleave', function () { rItems.forEach(function (li) { li.style.removeProperty('--near'); }); });
    // overall progress: a hairline beside the lines, and a number that only shows while the page is moving
    var fillEl = rn.querySelector('.ep-rnav_fill'), pctEl = rn.querySelector('.ep-rnav_pct'), pIdle = 0, pY = window.pageYOffset;
    function prog() {
      var p = Math.min(1, Math.max(0, window.pageYOffset / maxScroll()));
      fillEl.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      pctEl.textContent = Math.round(p * 100) + '%';
      pctEl.style.top = (p * 100).toFixed(2) + '%';
      if (Math.abs(window.pageYOffset - pY) > 1) { pY = window.pageYOffset; rn.classList.add('is-moving'); clearTimeout(pIdle); pIdle = setTimeout(function () { rn.classList.remove('is-moving'); }, 1100); }
    }
    window.addEventListener('scroll', prog, { passive: true });
    prog();
    window.addEventListener('scroll', lines, { passive: true });
    window.addEventListener('resize', lines);
    window.addEventListener('load', lines);
    var n = 0, iv = setInterval(function () { lines(); if (++n > 20) clearInterval(iv); }, 1000);
    lines();
  }
  boot();
})();

/* One page: "View rooms" links glide to the rooms section; "Book a tour" and "Contact" are blank for now. */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#rooms"], [data-ep-blank], [data-modal-cta-btn], a[aria-label^="Book a tour"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#rooms') {
      e.preventDefault();               // other handlers (like closing the phone menu) still run
      var t = document.getElementById('rooms'), L = window.__lenis;
      if (!t) return;
      var y = t.getBoundingClientRect().top + (L && L.scroll != null ? L.scroll : window.pageYOffset);
      if (L && L.scrollTo) L.scrollTo(y, { duration: 1.6 }); else window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    }
  }, true);
})();
