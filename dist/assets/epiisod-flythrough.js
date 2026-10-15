/* EPIISOD scroll flythrough — scroll position scrubs four video clips, dissolving
   between scenes. Ported from the "EPIISOD Flythrough Hero" design.
   Each clip is fetched as a blob and played from memory so seeking always works,
   even on a host that ignores byte-range requests. */
(function () {
  var root = document.querySelector('[data-ep-fly]');
  if (!root) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(pointer: coarse)').matches;
  var PRE = 0.07;        // share of each clip reserved as dissolve pre-roll
  var CAP_START = 0.44;  // where each scene's caption takes over
  var XF = 0.22;         // dissolve band at the tail of each scene
  var LINGER = 0.3;
  var W = 1.2;           // scroll length of each scene, in viewport heights
  var SCRUB = 0.78;      // share of a scene spent scrubbing; the rest holds on the last frame
  var PIN_IN = 0.62, PIN_OUT = 0.80;

  var stages = [].slice.call(root.querySelectorAll('[data-fly-stage]'));
  var bar = root.querySelector('[data-fly-bar]');
  var intro = root.querySelector('[data-fly-intro]');
  var cta = root.querySelector('[data-fly-cta]');
  var boot = root.querySelector('[data-fly-boot]');
  var caps = [].slice.call(root.querySelectorAll('[data-fly-cap]'));
  var ticks = [].slice.call(root.querySelectorAll('[data-fly-tick]'));
  var labels = [].slice.call(root.querySelectorAll('[data-fly-raillabel]'));
  var railBtns = [].slice.call(root.querySelectorAll('[data-fly-railbtn]'));
  var pinLayers = [].slice.call(root.querySelectorAll('[data-fly-pins]'));
  var pts = [].slice.call(root.querySelectorAll('[data-fly-pt]'));

  var items = stages.map(function (stage) {
    return {
      stage: stage,
      poster: stage.querySelector('[data-fly-poster]'),
      video: stage.querySelector('[data-fly-video]'),
      duration: 6, loaded: false, loading: false, painted: false, primed: false, pending: null, objectUrl: null
    };
  });
  var N = items.length;

  function hideBoot() {
    if (!boot) return;
    boot.style.opacity = '0';
    setTimeout(function () { boot.style.display = 'none'; }, 420);
  }
  if (reduced) { hideBoot(); rmCarousel(); return; }

  // Reduce Motion: a one-screen carousel instead of the scroll flythrough. Slide 0 is the title over the lobby, slides 1-4
  // the four scenes with their captions. Swipe, arrows, arrow keys or dots; a short crossfade (CSS), never autoplay.
  function rmCarousel() {
    var pin = root.querySelector('.ep-fly_pin'), total = N + 1, k = 0;
    var arrow = function (d) { return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5') + '" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
    var names = ['Welcome'].concat(caps.map(function (c) { var t = c.querySelector('.ep-fly_cap_title'); return t ? t.textContent : ''; }));
    var nav = document.createElement('div');
    nav.className = 'ep-rmc';
    nav.innerHTML = '<button type="button" class="ep-rmc_btn" data-rmc="-1" aria-label="Previous scene">' + arrow(-1) + '</button>' +
      '<div class="ep-rmc_dots">' + names.map(function (n, i) { return '<button type="button" class="ep-rmc_dot" data-rmc-go="' + i + '" aria-label="' + n + '"></button>'; }).join('') + '</div>' +
      '<span class="ep-rmc_count" aria-live="polite"></span>' +
      '<button type="button" class="ep-rmc_btn" data-rmc="1" aria-label="Next scene">' + arrow(1) + '</button>';
    pin.appendChild(nav);
    var dots = [].slice.call(nav.querySelectorAll('.ep-rmc_dot')), count = nav.querySelector('.ep-rmc_count');
    var hint = root.querySelector('.ep-fly_hint');
    if (hint) hint.textContent = touch ? 'Swipe to explore' : 'Use the arrows to explore';
    root.setAttribute('aria-roledescription', 'carousel');
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function show(n) {
      k = (n + total) % total;
      stages.forEach(function (s, i) { s.classList.toggle('is-cur', i === Math.max(0, k - 1)); });
      caps.forEach(function (c, i) { c.classList.toggle('is-cur', i === k - 1); c.setAttribute('aria-hidden', i === k - 1 ? 'false' : 'true'); });
      if (intro) intro.classList.toggle('is-cur', k === 0);
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === k); d.setAttribute('aria-current', i === k ? 'true' : 'false'); });
      count.textContent = pad(k + 1) + ' / ' + pad(total);
    }
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rmc]'), d = e.target.closest('[data-rmc-go]');
      if (b) show(k + +b.getAttribute('data-rmc'));
      else if (d) show(+d.getAttribute('data-rmc-go'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var r = root.getBoundingClientRect();
      if (r.bottom < window.innerHeight * 0.4 || r.top > window.innerHeight * 0.6) return;   // only while the hero is on screen
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      show(k + (e.key === 'ArrowRight' ? 1 : -1));
    });
    // swipe: a mostly horizontal drag of 40px or more turns the slide; vertical drags keep scrolling the page
    var sx = 0, sy = 0, down = false;
    pin.addEventListener('pointerdown', function (e) { if (e.target.closest('.ep-rmc')) return; down = true; sx = e.clientX; sy = e.clientY; });
    pin.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) show(k + (dx < 0 ? 1 : -1));
    });
    pin.addEventListener('pointercancel', function () { down = false; });
    show(0);
  }

  function load(idx) {
    var it = items[idx];
    if (!it || it.loaded || it.loading) return Promise.resolve();
    it.loading = true;
    var src = it.video.getAttribute('data-src');
    // phones get a lighter version of the same clip
    if (touch || window.innerWidth < 768) src = src.replace(/\.mp4$/, '-m.mp4');
    return fetch(src)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function (b) {
        return new Promise(function (res) {
          it.objectUrl = URL.createObjectURL(b);
          var v = it.video;
          v.addEventListener('loadedmetadata', function () {
            it.duration = Math.max(0.4, (v.duration || 6) - 0.3);
            it.loaded = true;
            res();
          }, { once: true });
          v.addEventListener('error', function () { it.loaded = true; res(); }, { once: true });
          v.src = it.objectUrl;
          v.load();
          v.addEventListener('loadeddata', function () { paint(it); }, { once: true });
        });
      })
      .catch(function () { it.loaded = true; });
  }

  function primeAll() {
    items.forEach(function (it) {
      if (it.primed || !it.loaded) return;
      it.primed = true;
      var p = it.video.play();
      if (p && p.then) p.then(function () { it.video.pause(); }).catch(function () {});
      else { try { it.video.pause(); } catch (e) {} }
    });
  }

  // reveal the video once it has a real frame decoded
  function paint(it) {
    if (it.painted) return;
    var v = it.video;
    function reveal() {
      it.painted = true;
      v.style.transition = 'opacity 220ms';
      v.style.opacity = '1';
      if (it.poster) { it.poster.style.transition = 'opacity 220ms'; it.poster.style.opacity = '0'; }
    }
    try { if (v.currentTime < 0.02) v.currentTime = 0.04; } catch (e) {}
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(reveal);
    else v.addEventListener('seeked', reveal, { once: true });
    setTimeout(function () { if (!it.painted && v.readyState >= 2) reveal(); }, 500);
  }

  // coalesced seek: never queue a currentTime while the decoder is mid-seek
  function seek(it, t) {
    if (!it.loaded) return;
    var v = it.video;
    if (v.seeking) { it.pending = t; return; }
    if (!it.painted) paint(it);
    if (Math.abs(v.currentTime - t) < (touch ? 0.03 : 0.012)) return;
    it.pending = null;
    try {
      v.currentTime = t;
      v.addEventListener('seeked', function () {
        if (it.pending != null) { var q = it.pending; it.pending = null; seek(it, q); }
      }, { once: true });
    } catch (e) {}
  }

  // slow at the seams, quicker mid-scene
  function ease(t, k) {
    if (!k) return t;
    return Math.min(1, Math.max(0, t - (k * Math.sin(2 * Math.PI * t)) / (2 * Math.PI)));
  }
  function smoothstep(x) { return x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x); }
  function timeFor(it, i, seg) {
    var pre = i === 0 ? 0 : PRE;
    return (pre + seg * (1 - pre)) * it.duration;
  }

  var smoothed = 0, capTriggers = null, storyFill = null;

  function tick() {
    var rect = root.getBoundingClientRect(), vh = window.innerHeight;
    // the page's bottom-right section chevrons only appear once the hero has been scrolled past
    var inHero = rect.bottom > vh * 1.45;
    if (inHero !== tick.__in) { tick.__in = inHero; document.documentElement.classList.toggle('ep-in-hero', inHero); }
    // nothing to do while the section is well off screen
    if (rect.bottom < -vh || rect.top > vh * 2) return;
    // the camera position comes from swipes / arrows / the segment bar (see goTo), not from the page scroll
    if (tw) {
      var u = Math.min(1, (performance.now() - tw.t0) / (tw.dur * 1000));
      vpos = tw.from + (tw.to - tw.from) * (0.5 - 0.5 * Math.cos(Math.PI * u));
      if (u >= 1) { var done = tw.done; tw = null; if (done) done(); }
    }
    var p = vpos / N;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    smoothed = p;
    var sp = smoothed;

    if (bar) bar.style.width = (sp * 100).toFixed(2) + '%';
    if (storyFill) storyFill(vpos);
    if (intro) {
      var o0 = sp < 0.07 ? 1 - sp / 0.07 : 0;
      intro.style.opacity = o0.toFixed(3);
      intro.style.transform = 'translateY(' + (-sp * 70).toFixed(1) + 'px)';
    }

    var acc = sp * N, idx = 0;
    for (var i = 0; i < N; i++) {
      if (acc <= 1 || i === N - 1) { idx = i; break; }
      acc -= 1;
    }
    var segRaw = Math.min(1, Math.max(0, acc));
    railBtns.forEach(function (b, k) { var fv = Math.min(1, Math.max(0, sp * N - k)); if (b.__f !== fv.toFixed(3)) { b.style.setProperty('--f', fv.toFixed(3)); b.__f = fv.toFixed(3); } });
    var seg = ease(Math.min(1, segRaw / SCRUB), LINGER);

    // progressive: the next clip once this one is under way, the one after from its midpoint
    if (segRaw > 0.02 && items[idx + 1]) load(idx + 1);
    if (segRaw > 0.5 && items[idx + 2]) load(idx + 2);

    // a long eased dissolve with a matched push and a peak of blur hides the cut
    var seam = segRaw > 1 - XF && !!items[idx + 1];
    var f = seam ? smoothstep((segRaw - (1 - XF)) / XF) : 0;
    var blur = seam && !touch && !window.__epLite ? 2.6 * Math.sin(Math.PI * f) : 0;

    items.forEach(function (it, i) {
      var op = 0;
      if (i === idx) op = seam ? 1 - f : 1;
      else if (i === idx + 1) op = f;
      op = op < 0 ? 0 : op > 1 ? 1 : op;
      if (it.stage.__op !== op.toFixed(2)) { it.stage.style.opacity = op.toFixed(3); it.stage.__op = op.toFixed(2); }

      var sc = 1;
      if (i === idx) sc = 1 + 0.03 * seg;      // a slow push-in: continuous motion between the footage's own 24 frames
      if (seam && i === idx) sc = (1 + 0.03 * seg) * (1 + 0.038 * f);
      else if (seam && i === idx + 1) sc = 1.048 - 0.048 * f;
      var fx = (op > 0 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none') + '|' + sc.toFixed(4);
      if (it.stage.__fx !== fx) {
        it.stage.style.transform = 'scale(' + sc.toFixed(4) + ')';
        it.stage.style.filter = op > 0 && blur > 0.05 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
        it.stage.__fx = fx;
      }

      // only ONE video is seeked per frame; past the dissolve midpoint the incoming
      // clip takes over the scrub
      var driveNext = seam && f > 0.5;
      if (i === idx && !driveNext) { seek(it, timeFor(it, i, seg)); return; }
      if (i === idx + 1 && it.loaded) {
        paint(it);
        if (driveNext) seek(it, f * PRE * it.duration);
      }
    });

    // copy rises in at each scene's midpoint and holds until the next takes over
    var CAP_BAND = 0.055;
    if (!capTriggers) capTriggers = items.map(function (_, k) { return (k + CAP_START) / N; });
    caps.forEach(function (c, i) {
      var inAt = capTriggers[i];
      var outAt = i + 1 < capTriggers.length ? capTriggers[i + 1] : Infinity;
      var o = 0;
      if (sp >= inAt - CAP_BAND && sp < outAt) {
        var rise = Math.min(1, Math.max(0, (sp - (inAt - CAP_BAND)) / CAP_BAND));
        var fall = outAt === Infinity ? 1 : Math.min(1, Math.max(0, (outAt - sp) / CAP_BAND));
        o = Math.min(rise, fall);
      }
      c.style.zIndex = o > 0.5 ? '2' : '1';
      var key = o.toFixed(2);
      if (c.__o !== key) {
        c.style.opacity = o.toFixed(3);
        c.style.transform = 'translateY(' + (16 * (1 - o)).toFixed(1) + 'px)';
        c.__o = key;
      }
    });


    // hotspots: visible once the camera has settled, through the hold, then they fade as the dissolve starts
    var PB = 0.04;
    pinLayers.forEach(function (layer, i) {
      var a = (i + PIN_IN) / N, b = (i + PIN_OUT) / N;
      var o = 0;
      if (sp >= a - PB && sp <= b + PB) o = Math.min(1, Math.max(0, Math.min((sp - (a - PB)) / PB, (b + PB - sp) / PB)));
      var key = o.toFixed(2);
      if (layer.__o !== key) {
        layer.style.opacity = key;
        var on = o > 0.55;
        layer.classList.toggle('is-on', on);
        if (!on) closeTips();
        layer.__o = key;
      }
    });

    if (cta) {
      var last = idx === N - 1;
      var oc = last ? Math.min(1, Math.max(0, (segRaw - 0.55) / 0.25)) : 0;
      if (cta.__o !== oc.toFixed(2)) {
        cta.style.opacity = oc.toFixed(3);
        cta.style.pointerEvents = oc > 0.5 ? 'auto' : 'none';
        cta.__o = oc.toFixed(2);
      }
    }

    ticks.forEach(function (tk, i) {
      var on = i === idx;
      if (tk.__on !== on) {
        tk.__active = on;
        if (tk.parentNode) tk.parentNode.classList.toggle('is-on', on);
        tk.style.height = on ? '58px' : '34px';
        tk.style.width = on ? '2px' : '1px';
        tk.style.background = on ? '#d0a77f' : 'rgba(233,223,208,.3)';
        tk.__on = on;
        var lb = labels[i];
        if (lb) {
          lb.__active = on;
          if (!lb.__hover) { lb.style.opacity = on ? '1' : '0'; lb.style.transform = on ? 'translateX(0)' : 'translateX(6px)'; }
        }
      }
    });
  }

  // rail: click jumps to the end of a scene (just short of its dissolve) so its caption is up
  railBtns.forEach(function (btn, i) {
    var lb = labels[i], tk = ticks[i];
    btn.addEventListener('mouseenter', function () {
      if (lb) { lb.__hover = true; lb.style.opacity = '1'; lb.style.transform = 'translateX(0)'; if (!lb.__active) lb.style.color = '#dcd7d3'; }
      if (tk && !tk.__active) { tk.style.height = '46px'; tk.style.background = 'rgba(233,223,208,.7)'; }
    });
    btn.addEventListener('mouseleave', function () {
      if (lb) { lb.__hover = false; lb.style.color = '#d0a77f'; lb.style.opacity = lb.__active ? '1' : '0'; lb.style.transform = lb.__active ? 'translateX(0)' : 'translateX(6px)'; }
      if (tk && !tk.__active) { tk.style.height = '34px'; tk.style.background = 'rgba(233,223,208,.3)'; }
    });
    btn.addEventListener('click', function () { goTo(i + 1); });
  });

  // ---- scenes: drag / arrows / keys / story bars / auto-tour ------------------------------------------------------
  // Scene 0 is the title over the lobby; scenes 1-4 hold on the end of each clip with its caption; after the Rooftop an
  // end card offers the next step. Moving between scenes plays the flythrough (forward or in reverse); a sideways drag
  // scrubs it live under the finger. Left alone, the hero tours itself; any touch hands control back.
  var vpos = 0, state = 0, tw = null, END = N + 1;
  var pin = root.querySelector('.ep-fly_pin');
  function posOf(s) { return s <= 0 ? 0 : Math.min(s, N) - 1 + SCRUB - 0.012; }
  function clampPos(v) { return Math.max(0, Math.min(posOf(N), v)); }
  function loadAround(v) { var k = Math.max(0, Math.floor(v)); load(k); if (items[k + 1]) load(k + 1); }
  function glide(to, dur, done) { tw = { from: vpos, to: to, t0: performance.now(), dur: dur, done: done }; }
  function goTo(s, opt) {
    opt = opt || {};
    s = Math.max(0, Math.min(END, s));
    if (!opt.auto) userActed();
    var to = posOf(s);
    if (s === state && !tw && Math.abs(vpos - to) < 0.002) return;
    if (!opt.auto) root.classList.add('has-moved');
    state = s; syncNav();
    var from = vpos, lo = Math.min(from, to), hi = Math.max(from, to), waits = [];
    for (var k = Math.max(0, Math.floor(lo + 0.0001)); k <= Math.min(N - 1, Math.floor(hi)); k++) waits.push(load(k));
    loadAround(hi);
    var dur = Math.max(0.6, Math.min(5.2, Math.abs(to - from) * 2.6));
    clearTimeout(autoT); dwell = null;
    var start = function () { if (state !== s) return; glide(to, dur, arrived); };
    var timer = setTimeout(start, 2500);  // never wait forever on a slow connection
    Promise.all(waits).then(function () { clearTimeout(timer); start(); });
  }

  // chevrons + count, the swipe hint, the end card
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  var arrow = function (d) { return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5') + '" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
  var navEl = document.createElement('div');
  navEl.className = 'ep-fly_nav';
  navEl.innerHTML = '<button type="button" class="ep-fly_navbtn" data-go="-1" aria-label="Previous space">' + arrow(-1) + '</button>' +
    '<span class="ep-fly_count" aria-live="polite"></span>' +
    '<button type="button" class="ep-fly_navbtn" data-go="1" aria-label="Next space">' + arrow(1) + '</button>';
  pin.appendChild(navEl);
  var countEl = navEl.querySelector('.ep-fly_count'), prevBtn = navEl.querySelector('[data-go="-1"]'), nextBtn = navEl.querySelector('[data-go="1"]');
  navEl.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) goTo(state + +b.getAttribute('data-go')); });
  var hint = root.querySelector('.ep-fly_hint');
  // the opening screen offers a clear choice: start the tour, or carry on down the page
  var startEl = document.createElement('div');
  startEl.className = 'ep-fly_start';
  startEl.innerHTML = '<button type="button" class="ep-fly_startbtn"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>Start the tour</button>' +
    '<button type="button" class="ep-fly_skip">or scroll to continue<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  if (hint) hint.parentNode.insertBefore(startEl, hint.nextSibling);
  startEl.querySelector('.ep-fly_startbtn').addEventListener('click', function () { goTo(1); });
  startEl.querySelector('.ep-fly_skip').addEventListener('click', function () { scrollToY(root.getBoundingClientRect().top + window.pageYOffset + window.innerHeight); });
  if (hint) {
    hint.innerHTML = (touch ? '<span class="ep-fly_hand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-4.6-2.2L3.6 15a1.6 1.6 0 0 1 2.4-2.1L9 15.5"/></svg></span>Tap or swipe through the spaces' : 'Or pick a space below');
  }
  var endEl = document.createElement('div');
  endEl.className = 'ep-fly_end'; endEl.setAttribute('aria-hidden', 'true');
  endEl.innerHTML = '<div class="ep-fly_end_in"><p class="ep-fly_end_eb">That’s the tour</p><h3 class="ep-fly_end_h">Seen enough to picture yourself here?</h3>' +
    '<div class="ep-fly_end_btns"><a href="#rooms" class="ep-fly_end_btn ep-fly_end_btn--sand" data-end="rooms">View rooms</a><a href="#" class="ep-fly_end_btn" data-end="tour">Book a tour</a></div>' +
    '<button type="button" class="ep-fly_end_down" data-end="down">Keep scrolling<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<button type="button" class="ep-fly_end_again" data-end="again">Watch the tour again</button></div>';
  pin.appendChild(endEl);
  function scrollToY(y) {
    var L = window.__lenis;
    if (L && L.scrollTo && !touch) L.scrollTo(y, { duration: 1.4, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }
  endEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-end]'); if (!b) return;
    var k = b.getAttribute('data-end');
    e.preventDefault();
    if (k === 'rooms') { var r = document.getElementById('rooms'); if (r) scrollToY(r.getBoundingClientRect().top + window.pageYOffset); }
    else if (k === 'down') scrollToY(root.getBoundingClientRect().top + window.pageYOffset + window.innerHeight);
    else if (k === 'again') goTo(0);
  });

  // chapters: story bars at the top on phones, chapter cards along the bottom on larger screens. Both fill the same way:
  // the first part counts down the auto-tour's pause on a space, the rest follows the camera to the next one.
  var names = caps.map(function (c, i) { return labels[i] ? labels[i].textContent : ''; });
  var story = document.createElement('div');
  story.className = 'ep-fly_story';
  story.innerHTML = names.map(function (n, i) {
    return '<button type="button" class="ep-fly_sbar" data-chap="' + (i + 1) + '"><i><b></b></i><span>' + n + '</span></button>';
  }).join('');
  pin.appendChild(story);
  var cards = document.createElement('div');
  cards.className = 'ep-fly_cards';
  cards.innerHTML = names.map(function (n, i) {
    var t = caps[i] && caps[i].querySelector('.ep-fly_cap_title');
    return '<button type="button" class="ep-fly_card" data-chap="' + (i + 1) + '" aria-label="Go to ' + (t ? t.textContent : n) + '">' +
      '<span class="ep-fly_card_img" style="background-image:url(/assets/flythrough/thumb' + (i + 1) + '.webp)"></span>' +
      '<span class="ep-fly_card_t"><em>' + pad(i + 1) + '</em><strong>' + (t ? t.textContent : n) + '</strong></span>' +
      '<i class="ep-fly_card_bar"><b></b></i></button>';
  }).join('');
  pin.appendChild(cards);
  var fills = [].slice.call(story.querySelectorAll('b')).concat([].slice.call(cards.querySelectorAll('b')));
  var cardEls = [].slice.call(cards.querySelectorAll('.ep-fly_card')).concat([].slice.call(story.querySelectorAll('.ep-fly_sbar')));
  [story, cards].forEach(function (el) { el.addEventListener('click', function (e) { var b = e.target.closest('[data-chap]'); if (b) goTo(+b.getAttribute('data-chap')); }); });
  var dwell = null;                                    // { s: scene, t0, ms } while the auto-tour waits on a space
  storyFill = function (v) {
    var now = performance.now();
    for (var i = 0; i < N; i++) {
      // bar i belongs to space i+1: empty until the camera stops there, then it fills as the timer to the next flight,
      // and stays full once the tour has moved past it
      var past = state > i + 1 && !(tw && vpos < posOf(i + 1) + 0.001);
      var x = past ? 1 : (state === i + 1 && dwell && dwell.s === i ? Math.min(1, (now - dwell.t0) / dwell.ms) : 0), key = x.toFixed(3);
      [fills[i], fills[i + N]].forEach(function (f) { if (f && f.__k !== key) { f.style.transform = 'scaleX(' + key + ')'; f.__k = key; } });
    }
    var on = Math.min(state, N) - 1;
    cardEls.forEach(function (c, k) { var a = k % N === on; if (c.__on !== a) { c.classList.toggle('is-on', a); c.__on = a; } });
  };

  function syncNav() {
    var shown = Math.min(state, N);
    countEl.textContent = pad(shown + 1) + ' / ' + pad(N + 1);
    prevBtn.disabled = state === 0; nextBtn.disabled = state === END;
    root.classList.toggle('is-first', state === 0);
    root.classList.toggle('is-end', state === END);
    endEl.setAttribute('aria-hidden', state === END ? 'false' : 'true');
  }
  syncNav();
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var r = root.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.3 || r.bottom < window.innerHeight * 1.4) return;   // only while the hero fills the screen
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    goTo(state + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // touch: a sideways drag scrubs the flythrough live under the finger (one screen width = one space); on release it
  // glides to the nearest space, moving at least one space when the drag was decisive. Vertical drags scroll the page.
  var dg = null;
  pin.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' || e.target.closest('button, a')) return;
    dg = { x: e.clientX, y: e.clientY, v0: vpos, s0: Math.min(state, N), on: false, t0: performance.now() };
  });
  pin.addEventListener('pointermove', function (e) {
    if (!dg) return;
    var dx = e.clientX - dg.x, dy = e.clientY - dg.y;
    if (!dg.on) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      dg.on = true; tw = null; userActed(); root.classList.add('has-moved');
      if (state === END) { state = N; syncNav(); }
      dg.x = e.clientX; dx = 0;
    }
    vpos = clampPos(dg.v0 - dx / (window.innerWidth * 0.85));
    loadAround(vpos);
  });
  function release(e) {
    if (!dg) return;
    var d = dg; dg = null;
    if (!d.on) {
      // a quick tap: right side moves on, left third goes back (like stories); a long press just pauses the tour
      if (e && performance.now() - d.t0 < 350 && Math.abs(e.clientX - d.x) < 10 && Math.abs(e.clientY - d.y) < 10) {
        if (e.clientX > window.innerWidth * 0.33) goTo(Math.min(state, N) + 1); else goTo(Math.min(state, N) - 1);
      }
      return;
    }
    var dx = (e && e.clientX != null ? e.clientX : d.x) - d.x, w = window.innerWidth;
    var near = 0, best = 9;
    for (var k = 0; k <= N; k++) { var dd = Math.abs(posOf(k) - vpos); if (dd < best) { best = dd; near = k; } }
    if (dx < -w * 0.12 && near <= d.s0) near = d.s0 + 1;        // a decisive drag always moves at least one space
    if (dx > w * 0.12 && near >= d.s0) near = d.s0 - 1;
    near = Math.max(0, Math.min(N, near));
    state = -1;                                                // force the glide even if we settle back where we began
    goTo(near);
  }
  pin.addEventListener('pointerup', release);
  pin.addEventListener('pointercancel', function () { if (dg && dg.on) release(null); else dg = null; });

  // ---- auto-tour -------------------------------------------------------------------------------------------------
  // 0.3 s after the page loader clears, the camera flies from the lobby to the Concierge by itself. At each stop the
  // space's bar fills as a 4-second timer; when it is full the next flight starts. After the Rooftop's timer, the end
  // card. Any touch, click, key or wheel pauses the tour; after a quiet spell the current space's timer starts again.
  var DWELL = 4000, IDLE = 8000, autoT = 0, ready = false;
  function inView() { var r = root.getBoundingClientRect(); return r.top < window.innerHeight * 0.3 && r.bottom > window.innerHeight * 1.4 && !document.hidden; }
  function countdown() {
    clearTimeout(autoT);
    if (state < 1 || state > N) { dwell = null; return; }
    dwell = { s: state - 1, t0: performance.now(), ms: DWELL };
    autoT = setTimeout(function () {
      if (!inView() || tw || dg) { dwell = null; autoT = setTimeout(countdown, 1200); return; }   // try again shortly
      dwell = null;
      goTo(state + 1, { auto: true });                         // past the Rooftop this is the end card
    }, DWELL);
  }
  function arrived() { if (state >= 1 && state <= N) countdown(); }
  function userActed() {                                       // hand control to the visitor, resume after a quiet spell
    clearTimeout(autoT); dwell = null;
    if (state < END) autoT = setTimeout(countdown, IDLE);
  }
  ['pointerdown', 'keydown', 'wheel'].forEach(function (ev) {
    root.addEventListener(ev, function () { if (ready) userActed(); }, { passive: true });
  });
  function onReady() {
    if (ready) return;
    var pl = document.querySelector('[data-preloader]');
    if (pl && getComputedStyle(pl).display !== 'none') { setTimeout(onReady, 150); return; }
    ready = true;
    setTimeout(function () {
      if (state === 0 && !tw && !dg && !root.classList.contains('has-moved')) goTo(1, { auto: true });
    }, 300);
  }

  // ---- hotspots -------------------------------------------------------------
  // Pin coordinates are fractions of the 16:9 video frame, so they stay on the
  // object they describe at any viewport shape (object-fit: cover crop included).
  var FRAME = 16 / 9;
  function placePins() {
    var vw = root.clientWidth, vh = root.querySelector('.ep-fly_pin').clientHeight;
    var dw, dh;
    if (vw / vh > FRAME) { dw = vw; dh = vw / FRAME; } else { dh = vh; dw = vh * FRAME; }
    var phone = window.innerWidth <= 767;
    pts.forEach(function (pt) {
      var x = vw / 2 + (parseFloat(pt.getAttribute('data-fx')) - 0.5) * dw;
      var y = vh / 2 + (parseFloat(pt.getAttribute('data-fy')) - 0.5) * dh;
      var margin = phone ? 34 : 60;
      var hidden = x < margin || x > vw - margin || y < vh * 0.14 || y > vh * (phone ? 0.58 : 0.86);
      pt.style.left = x.toFixed(1) + 'px';
      pt.style.top = y.toFixed(1) + 'px';
      pt.style.display = hidden ? 'none' : '';
    });
  }
  function closeTips() {
    pts.forEach(function (pt) {
      if (pt.__open) {
        pt.__open = false;
        pt.classList.remove('is-open');
        var b = pt.querySelector('.ep-fly_pt_btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }
  // keep the card on screen: above the pin by default, below it near the top, nudged sideways at the edges
  function placeTip(pt) {
    var tip = pt.querySelector('.ep-fly_tip');
    tip.style.setProperty('--tip-shift', '0px');
    pt.classList.remove('is-below');
    var r = tip.getBoundingClientRect();
    if (r.top < 84) { pt.classList.add('is-below'); r = tip.getBoundingClientRect(); }
    var pad = 14, shift = 0;
    if (r.left < pad) shift = pad - r.left;
    else if (r.right > window.innerWidth - pad) shift = window.innerWidth - pad - r.right;
    tip.style.setProperty('--tip-shift', shift.toFixed(1) + 'px');
  }
  function openTip(pt) {
    if (pt.__open) return;
    closeTips();
    pt.__open = true;
    pt.classList.add('is-open');
    var b = pt.querySelector('.ep-fly_pt_btn');
    if (b) b.setAttribute('aria-expanded', 'true');
    placeTip(pt);
  }
  pts.forEach(function (pt) {
    var btn = pt.querySelector('.ep-fly_pt_btn');
    btn.addEventListener('mouseenter', function () { if (!touch) openTip(pt); });
    pt.addEventListener('mouseleave', function () { if (!touch) closeTips(); });
    btn.addEventListener('focus', function () { openTip(pt); });
    btn.addEventListener('blur', function () { setTimeout(function () { if (!pt.contains(document.activeElement)) closeTips(); }, 0); });
    btn.addEventListener('click', function (e) { e.preventDefault(); if (touch && pt.__open) closeTips(); else openTip(pt); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('[data-fly-pt]')) closeTips(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTips(); });
  placePins();
  window.addEventListener('resize', function () { placePins(); closeTips(); }, { passive: true });

  // only the opening clip loads up front; the second follows on the first scroll or once the page is idle, the rest as
  // the camera approaches
  function next() { load(1); window.removeEventListener('wheel', next); window.removeEventListener('touchstart', next); window.removeEventListener('keydown', next); }
  load(0).then(function () {
    hideBoot();
    onReady();
    window.addEventListener('wheel', next, { passive: true });
    window.addEventListener('touchstart', next, { passive: true });
    window.addEventListener('keydown', next);
    if (window.requestIdleCallback) requestIdleCallback(next, { timeout: 3000 }); else setTimeout(next, 2000);
  });
  setTimeout(hideBoot, 7000);
  window.addEventListener('touchstart', primeAll, { passive: true, once: true });

  // runs every frame while the hero is within a screen of the viewport, and sleeps the rest of the time
  var raf = 0, near = true;
  function loop() { tick(); raf = near ? requestAnimationFrame(loop) : 0; }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    near = es[0].isIntersecting;
    if (near && !raf) raf = requestAnimationFrame(loop);
  }, { rootMargin: '100% 0px 100% 0px' }).observe(root);
  loop();
  window.addEventListener('pagehide', function () {
    cancelAnimationFrame(raf);
    items.forEach(function (it) { if (it.objectUrl) URL.revokeObjectURL(it.objectUrl); });
  });
})();
