/* Arch video reveal — drives the clip-path window from scroll position. */
(function () {
  var sec = document.querySelector('[data-ep-reveal]');
  if (!sec) return;
  var video = sec.querySelector('[data-rv-video]');
  var headerEls = document.querySelectorAll('.header-logo[data-theme], .header-nav[data-theme], .s-bar-w[data-theme]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD = 0.33, EXIT = 0.8;               // stuck phase, in viewport heights: hold, then the exit
  var LEN_VH = HOLD + EXIT;
  var vw = 0, vh = 0, len = 0, raf = 0, playing = false, theme = '';

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var roomsPin = document.querySelector('[data-ep-rooms-pin]');
  function measureRooms() {
    if (!roomsPin) return;
    var s = roomsPin.firstElementChild;
    roomsPin.style.height = (s.offsetHeight + window.innerHeight) + 'px';
  }

  function measure() {
    measureRooms();
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    len = vh * LEN_VH;
    sec.style.setProperty('--rv-len', len + 'px');
    update();
  }

  function setTheme(next) {
    if (next === theme) return;
    theme = next;
    headerEls.forEach(function (el) {
      el.classList.remove('theme_on-light', 'theme_on-dark', 'theme_on-color');
      el.classList.add('theme_on-' + next);
    });
  }

  function update() {
    raf = 0;
    var rect = sec.getBoundingClientRect();
    // approach: the section's top travels from the bottom of the screen to the top; the arch rises and widens
    var p1 = clamp((1 - rect.top / vh) * 2.4);   // fully open once ~60% of a screen has been scrolled
    var o0 = ease(p1);
    // exit: the video stays pinned while it narrows into a downward-pointing arch and is pushed up and out at scroll
    // speed; the amenities section is already in place behind it
    var y = -rect.top;
    var q = clamp((y - (len - EXIT * vh)) / (EXIT * vh));
    var e = ease(q);
    var o = o0 * (1 - e);
    var w0 = Math.min(vw < 768 ? vw * 0.7 : 340, vw * 0.8);
    var w = lerp(w0, vw, o);
    var side = (vw - w) / 2;
    var top = lerp(vh * 0.16, 0, o0);
    var bot = vh * 0.22 * e;
    var r = (w / 2) * (1 - Math.pow(o0, 3));
    var rb = (w / 2) * e;
    var fs0 = vw < 768 ? 26 : 30, fs1 = Math.max(40, Math.min(vw * 0.056, 88));
    var s = sec.style;
    s.setProperty('--rv-side', side + 'px');
    s.setProperty('--rv-top', top + 'px');
    s.setProperty('--rv-bot', bot + 'px');
    s.setProperty('--rv-ty', (-EXIT * vh * q).toFixed(1) + 'px');
    s.setProperty('--rv-dim', (clamp(p1 * 1.6) * 0.85 * (1 - clamp(q * 8))).toFixed(3));
    s.setProperty('--rv-r', r + 'px');
    s.setProperty('--rv-rbx', rb.toFixed(1) + 'px');
    s.setProperty('--rv-rby', Math.min(rb, vh * 0.5).toFixed(1) + 'px');
    s.setProperty('--rv-scale', lerp(1.18, 1, o).toFixed(4));
    s.setProperty('--rv-fs', lerp(fs0, fs1, o).toFixed(2) + 'px');
    // copy appears once the video is full-bleed, rides the video as it narrows, and fades late
    var c = clamp((p1 - 0.78) / 0.22);
    s.setProperty('--rv-copy', c.toFixed(3));
    s.setProperty('--rv-ttl', (1 - clamp((q - 0.5) / 0.4)).toFixed(3));
    sec.classList.toggle('is-open', c > 0.9 && e < 0.1);
    // only decode video while the section is on screen
    var on = rect.top < vh && rect.bottom > 0;
    if (video && on !== playing) {
      playing = on;
      if (on) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); } else video.pause();
    }
  }

  function tick() { if (!raf) raf = requestAnimationFrame(update); }

  if (reduce) { if (video) { video.removeAttribute('loop'); video.pause(); } return; }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  // layout above us (flythrough height, other sections) can settle late
  var n = 0, iv = setInterval(function () { measure(); if (++n > 12) clearInterval(iv); }, 500);
  measure();
})();
