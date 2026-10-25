/* Two versions of the site. Version 1 is the chocolate look; version 2 drops the tint and follows the EPIISOD design-system
   colours with the lighter navigation. Chosen with the logo in the header, Shift+B, or ?v=1 / ?v=2, and remembered in this
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
  var q = /[?&]v=([12])(?:&|$)/.exec(location.search);
  if (q) write(q[1]);
  apply(read() === '2' ? '2' : '1');
  if (read() === '2' || q) write(read() === '2' ? '2' : '1');          // keep the address in step on first load too
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
    if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || (e.key !== 'B' && e.key !== 'b')) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    toggle();
  });
  // the header's logo (the wordmark in version 1, the emblem in version 2) switches between the two
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('.ep-gh_logo');
    if (a) { e.preventDefault(); toggle(); }
  });
})();
