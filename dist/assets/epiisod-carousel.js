/* Resi-Life fan: polaroid cards on an arc. Position is driven by one CSS variable per
   card (--off, in card slots from the centre), so the browser animates transform only.
   Arrows, keys, swipe/drag (cards follow the pointer), or tapping a side card turn it. */
(function () {
  document.querySelectorAll('[data-ep-carousel]').forEach(function (root) {
    var fan = root.querySelector('[data-fan]');
    if (!fan) return;
    var cards = [].slice.call(fan.querySelectorAll('[data-fan-card]'));
    var n = cards.length, half = Math.floor(n / 2);
    var prev = root.querySelector('[data-car-prev]'), next = root.querySelector('[data-car-next]');
    var fill = root.querySelector('[data-car-fill]'), cur = root.querySelector('[data-car-current]'), tot = root.querySelector('[data-car-total]');
    var pad = function (k) { return k < 10 ? '0' + k : String(k); };
    var active = 0, last = cards.map(function () { return null; }), baseOffs = [];
    if (tot) tot.textContent = pad(n);

    function offFor(i) { return ((i - active + n + half) % n) - half; }   // -half..half, wraps
    function render() {
      cards.forEach(function (c, i) {
        var off = offFor(i);
        var jump = last[i] !== null && Math.abs(off - last[i]) > half;
        if (jump) { c.classList.add('is-jump'); c.style.opacity = '0'; }
        c.style.setProperty('--off', off);
        c.style.setProperty('--abs', Math.abs(off));
        c.classList.toggle('is-far', Math.abs(off) > 2);
        c.style.zIndex = String(20 - Math.abs(off));
        c.setAttribute('data-off', off);
        c.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
        if (jump) { void c.offsetHeight; requestAnimationFrame(function () { c.classList.remove('is-jump'); c.style.opacity = ''; }); }
        last[i] = off;
      });
      if (cur) cur.textContent = pad(active + 1);
      if (fill) fill.style.transform = 'scaleX(' + ((active + 1) / n).toFixed(3) + ')';
    }
    function go(to) { active = ((to % n) + n) % n; render(); }
    if (prev) prev.addEventListener('click', function () { go(active - 1); });
    if (next) next.addEventListener('click', function () { go(active + 1); });
    var moved = false;
    cards.forEach(function (c, i) {
      c.addEventListener('click', function () { if (!moved && i !== active) go(i); });
    });
    fan.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    });

    // drag: the fan follows the pointer, then settles on the nearest card
    var down = false, sx = 0, slot = 1;
    fan.addEventListener('pointerdown', function (e) {
      down = true; moved = false; sx = e.clientX;
      var m = /([\d.]+)\)\s*$/.exec(getComputedStyle(fan).getPropertyValue('--gx'));
      slot = cards[0].offsetWidth * (m ? parseFloat(m[1]) : 0.8);
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) < 6) return;
      moved = true; fan.classList.add('is-drag');
      var frac = dx / slot;                       // slots dragged
      cards.forEach(function (c, i) {
        var off = offFor(i) + frac;
        var co = Math.max(-half - 0.6, Math.min(half + 0.6, off));
        c.style.setProperty('--off', co);
        c.style.setProperty('--abs', Math.abs(co));
      });
    });
    function end(e) {
      if (!down) return;
      down = false;
      if (moved) {
        var dx = (e && e.clientX != null ? e.clientX : sx) - sx;
        var steps = Math.round(-dx / slot);
        fan.classList.remove('is-drag');
        last = last.map(function () { return null; });      // no wrap-jump on a drag settle
        go(active + steps);
        setTimeout(function () { moved = false; }, 0);
      }
    }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', function () { end(); });
    render();

    // entrance: rise into place one card at a time, centre first, once the fan is on screen
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
      fan.classList.add('is-pre');
      cards.forEach(function (c) {
        var off = parseInt(c.getAttribute('data-off'), 10) || 0;
        c.style.setProperty('--d', ((Math.abs(off) * 2 + (off > 0 ? 1 : 0)) * 130) + 'ms');
      });
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        fan.classList.add('is-intro');
        requestAnimationFrame(function () { fan.classList.remove('is-pre'); });
        setTimeout(function () {
          fan.classList.remove('is-intro');
          cards.forEach(function (c) { c.style.removeProperty('--d'); });
        }, 2600);
      }, { threshold: 0.3 });
      io.observe(fan);
    }
  });
})();
