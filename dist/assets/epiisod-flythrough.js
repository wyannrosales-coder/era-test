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
  var XF = 0.16;         // dissolve band at the tail of each scene
  var LINGER = 0.3;
  var W = 1.5;           // scroll length of each scene, in viewport heights
  var SCRUB = 0.6;       // share of a scene spent scrubbing; the rest holds on the last frame
  var PIN_IN = 0.52, PIN_OUT = 0.88;

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
  if (reduced) { hideBoot(); return; }

  function load(idx) {
    var it = items[idx];
    if (!it || it.loaded || it.loading) return Promise.resolve();
    it.loading = true;
    var src = it.video.getAttribute('data-src');
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
    if (Math.abs(v.currentTime - t) < 0.012) return;
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

  var smoothed = 0, capTriggers = null;

  function tick() {
    var span = N * W * window.innerHeight;
    var rect = root.getBoundingClientRect();
    // nothing to do while the section is well off screen
    if (rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2) return;
    var p = span > 0 ? -rect.top / span : 0;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    smoothed += (p - smoothed) * 0.1;
    var sp = smoothed;

    if (bar) bar.style.width = (sp * 100).toFixed(2) + '%';
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
    var seg = ease(Math.min(1, segRaw / SCRUB), LINGER);

    if (segRaw > 0.15 && items[idx + 1]) load(idx + 1);
    if (items[idx + 2]) load(idx + 2);

    // a long eased dissolve with a matched push and a peak of blur hides the cut
    var seam = segRaw > 1 - XF && !!items[idx + 1];
    var f = seam ? smoothstep((segRaw - (1 - XF)) / XF) : 0;
    var blur = seam ? 2.6 * Math.sin(Math.PI * f) : 0;

    items.forEach(function (it, i) {
      var op = 0;
      if (i === idx) op = seam ? 1 - f : 1;
      else if (i === idx + 1) op = f;
      op = op < 0 ? 0 : op > 1 ? 1 : op;
      if (it.stage.__op !== op.toFixed(2)) { it.stage.style.opacity = op.toFixed(3); it.stage.__op = op.toFixed(2); }

      var sc = 1;
      if (seam && i === idx) sc = 1 + 0.038 * f;
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
    btn.addEventListener('click', function () {
      var target = (i + 0.74) / N;
      var span = N * W * window.innerHeight;
      var top = root.getBoundingClientRect().top + window.pageYOffset + target * span;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });


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

  // load the first two eagerly; the rest as the camera approaches
  load(0).then(hideBoot);
  load(1);
  setTimeout(hideBoot, 7000);
  window.addEventListener('touchstart', primeAll, { passive: true, once: true });

  var raf;
  (function loop() { tick(); raf = requestAnimationFrame(loop); })();
  window.addEventListener('pagehide', function () {
    cancelAnimationFrame(raf);
    items.forEach(function (it) { if (it.objectUrl) URL.revokeObjectURL(it.objectUrl); });
  });
})();
