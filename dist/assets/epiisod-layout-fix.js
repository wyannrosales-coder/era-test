/* The location section scrolls sideways. The site measures its track once at start-up,
   before the web fonts and images have settled, so on some screens the distance it
   scrolls ends up shorter than the content and the page moves on before the section
   has been seen. This re-measures after fonts/images load and on resize, and updates the
   existing animation in place so nothing else that depends on it is rebuilt. */
(function () {
  var timer = null;
  function fix() {
    var a = document.querySelector('.loc-scroll-area');
    if (!a || !window.gsap || !window.ScrollTrigger) return false;
    var tw = a._horizontalTween, t = a.querySelector('.loc-scroll-area_track');
    if (!tw || !t) return false;
    var need = t.scrollWidth - a.offsetWidth;
    var wantH = t.scrollWidth;
    var haveX = -tw.vars.x, haveH = parseFloat(a.style.height) || 0;
    if (Math.abs(haveX - need) > 1 || Math.abs(haveH - wantH) > 1) {
      var prog = tw.progress();
      tw.progress(0);
      gsap.set(t, { x: 0 });
      a.style.height = wantH + 'px';
      tw.vars.x = -need;
      tw.invalidate();
      tw.progress(prog);
      ScrollTrigger.refresh();
    }
    return true;
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(fix, 120); }

  var tries = 0;
  var poll = setInterval(function () { fix(); if (++tries > 30) clearInterval(poll); }, 500);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  window.addEventListener('load', function () { schedule(); setTimeout(fix, 1500); setTimeout(fix, 4000); });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('load', function (e) { if (e.target && e.target.tagName === 'IMG') schedule(); }, true);
})();
