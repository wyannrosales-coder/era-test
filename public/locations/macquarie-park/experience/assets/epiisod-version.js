/* Two versions of the site. Version 1 is the chocolate look; version 2 drops the tint and follows the EPIISOD design-system
   colours with the lighter navigation. Chosen with the sun / moon button at the bottom left, Shift+B, or ?v=1 / ?v=2, and remembered in this
   browser. Runs first (in the head) so the right look is there before anything paints. */
(function () {
  var de = document.documentElement, KEY = 'ep-ver', fadeT = 0;
  // remembered in four places (local storage, a cookie, session storage and the address itself) so a reload keeps the version
  // even where one of them is blocked or cleared; the address (?v=2) wins, then the others
  function cookie() { var m = /(?:^|; )ep-ver=([12])/.exec(document.cookie || ''); return m ? m[1] : null; }
  function read() {
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    return v || cookie() || (function () { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } })();
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    try { sessionStorage.setItem(KEY, v); } catch (e) {}
    try { document.cookie = 'ep-ver=' + v + '; path=/; max-age=31536000; SameSite=Lax'; } catch (e) {}
    try {
      var u = new URL(location.href); u.searchParams.set('v', v);
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }
  function apply(v) {
    de.setAttribute('data-ep-ver', v);
    if (v === '1') de.setAttribute('data-ep-tint', 'brown'); else de.removeAttribute('data-ep-tint');   // version 1 keeps the chocolate overlays
  }
  // The page is fixed to the light look (version 2): there is no switcher any more, and a stored
  // choice or ?v= is ignored. To bring the dark look back, change LOCKED to '1' (or null to re-enable the switch).
  var LOCKED = '2';
  var q = /[?&]v=([12])(?:&|$)/.exec(location.search);
  if (LOCKED) { apply(LOCKED); }
  else {
    if (q) write(q[1]);
    apply(read() === '2' ? '2' : '1');
    if (read() === '2' || q) write(read() === '2' ? '2' : '1');          // keep the address in step on first load too
  }
  function set(v, fade) {
    v = v === '2' ? '2' : '1';
    if (de.getAttribute('data-ep-ver') === v) return;
    if (fade !== false) { de.classList.add('ep-ver-fade'); clearTimeout(fadeT); fadeT = setTimeout(function () { de.classList.remove('ep-ver-fade'); }, 700); }
    write(v); apply(v);
    try { document.dispatchEvent(new CustomEvent('ep-ver-change', { detail: v })); } catch (e) {}
  }
  function toggle() { set(de.getAttribute('data-ep-ver') === '2' ? '1' : '2'); }
  window.__epVer = { get: function () { return de.getAttribute('data-ep-ver'); }, set: set, toggle: toggle };
  window.addEventListener('keydown', function (e) {
    if (LOCKED || !e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || (e.key !== 'B' && e.key !== 'b')) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    toggle();
  });
  // the round sun / moon button at the bottom left of the page switches between the two
  function label() {
    var b = document.querySelector('[data-ep-ver-toggle]'); if (!b) return;
    var light = de.getAttribute('data-ep-ver') === '2';
    b.setAttribute('aria-pressed', light ? 'true' : 'false');
    b.setAttribute('aria-label', light ? 'Switch to the dark look' : 'Switch to the light look');
    b.title = light ? 'Dark look' : 'Light look';
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-ep-ver-toggle]');
    if (a && !LOCKED) { e.preventDefault(); toggle(); label(); }
  });
  document.addEventListener('ep-ver-change', label);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', label); else label();
})();
