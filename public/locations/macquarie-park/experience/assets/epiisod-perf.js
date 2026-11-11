/* Performance helpers. Decorative videos (the flowers, the ivy) fetch their files only when they are about to come into
   view, so the page no longer downloads and decodes dozens of megabytes of video up front. */
(function () {
  // iPhone/iPad can only play the flowers as 8-10 MB HEVC files: show their transparent still with a gentle sway instead
  var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) {
    [].forEach.call(document.querySelectorAll('video[data-lazy-video]'), function (v) {
      var s = v.querySelector('source[data-src*="bougainvillea"]');
      if (!s || !v.poster) return;
      var im = document.createElement('img');
      im.src = v.poster; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.loading = 'lazy'; im.decoding = 'async';
      im.className = v.className + ' ep-still';
      v.parentNode.replaceChild(im, v);
    });
  }

  // below-the-fold photos are lazy; warm the ones in slider/tab panels (hidden panels never load lazily) as they approach
  if ('IntersectionObserver' in window) {
    var warm = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        [].forEach.call(e.target.querySelectorAll('img[loading="lazy"]'), function (im) { im.loading = 'eager'; });
        warm.unobserve(e.target);
      });
    }, { rootMargin: '150% 0px 150% 0px' });
    [].forEach.call(document.querySelectorAll('.amen-w, [data-ep-zoom]'), function (el) { warm.observe(el.closest('section') || el); });
  }

  var vids = [].slice.call(document.querySelectorAll('video[data-lazy-video]'));
  if (!vids.length) return;
  function arm(v) {
    if (v.__armed) return; v.__armed = true;
    [].forEach.call(v.querySelectorAll('source[data-src]'), function (s) { s.src = s.getAttribute('data-src'); s.removeAttribute('data-src'); });
    v.preload = 'auto';
    try { v.load(); } catch (e) {}
    // if its section is already in view the page's own play/pause trigger has fired: start it now
    var r = v.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }
  if (!('IntersectionObserver' in window)) { vids.forEach(arm); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { arm(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '140% 0px 140% 0px' });
  vids.forEach(function (v) { io.observe(v); });

  // play only while the video itself is on screen (its section can be thousands of pixels tall, so the page's own trigger
  // keeps every video in it running); pause it the moment it leaves
  if (!('IntersectionObserver' in window)) return;
  var io2 = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { v.__vis = true; if (v.__armed && v.paused && !v.__occ && !(window.__epLite && v.__flower)) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
      else { v.__vis = false; if (!v.paused) v.pause(); }
    });
  }, { rootMargin: '8% 0px 8% 0px' });
  vids.forEach(function (v) {
    io2.observe(v);
    v.__flower = !!v.querySelector('source[data-src*="bougainvillea"], source[src*="bougainvillea"]');
    // whoever starts a flower (this file, the page's own triggers), safety mode keeps it still
    if (v.__flower) v.addEventListener('play', function () { if (window.__epLite) v.pause(); });
  });
  // safety mode (epiisod-frame.js): the flowers hold still on their poster frame; they resume when the device keeps up
  window.addEventListener('ep-lite', function (e) {
    vids.forEach(function (v) {
      if (!v.__flower) return;
      if (e.detail) { if (!v.paused) v.pause(); }
      else if (v.__armed && v.__vis && !v.__occ) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  });

  // the two big flowers beside the smart-room arch are covered by the photograph once the arch has opened: stop decoding
  // and drawing them then
  var area = document.querySelector('.arch-scroll-area:not(.amen-scroll-area)');
  var occl = vids.filter(function (v) { return v.closest('.arch-intro-s'); });
  if (area && occl.length) {
    var qd = false;
    function chk() {
      qd = false;
      var covered = area.getBoundingClientRect().top < -window.innerHeight * 0.3;
      occl.forEach(function (v) {
        if (v.__occ === covered) return;
        v.__occ = covered;
        v.style.visibility = covered ? 'hidden' : '';
        if (covered) { if (!v.paused) v.pause(); }
        else { var r = v.getBoundingClientRect(); if (v.__armed && r.bottom > 0 && r.top < window.innerHeight) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
      });
    }
    window.__epFrame.on(chk, area);
    chk();
  }
})();
