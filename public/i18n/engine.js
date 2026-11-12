/*
 * Site language (English / 中文 / हिन्दी): a small runtime translator shared by the React app and the
 * hand-built experience pages. It swaps the text of the page (text nodes, and the placeholder, aria-label,
 * alt and title attributes) for the translation of the same English string in /i18n/<lang>.json, and keeps
 * doing so as the page changes. The English source stays in a map, so switching back restores it exactly.
 * Elements with translate="no" or data-no-translate (brand names, prices) are left alone.
 *   window.__epLang.get() · .set('zh') · .on(fn) · .collectAll() (every English string on the page, for building the files)
 */
(function () {
  var LANGS = ['en', 'zh', 'hi'];
  var HTML_LANG = { en: 'en-AU', zh: 'zh-Hans', hi: 'hi' };
  var KEY = 'epiisod-lang';
  var ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
  var SKIP_TAG = /^(SCRIPT|STYLE|NOSCRIPT|CODE|TEXTAREA|SVG|CANVAS|IFRAME)$/i;
  var dicts = {}, cur = 'en', listeners = [], observer = null, queued = false, pending = [];
  var nodeState = new WeakMap();   // text node → { src, out }
  var attrState = new WeakMap();   // element → { attr: { src, out } }

  function read() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (LANGS.indexOf(q) > -1) return q;
      var s = localStorage.getItem(KEY);
      if (LANGS.indexOf(s) > -1) return s;
    } catch (e) {}
    return 'en';
  }
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function skipped(el) {
    for (; el; el = el.parentElement) {
      if (SKIP_TAG.test(el.tagName)) return true;
      if (el.hasAttribute && (el.getAttribute('translate') === 'no' || el.hasAttribute('data-no-translate'))) return true;
    }
    return false;
  }
  var LOCALE = { zh: 'zh-CN', hi: 'hi-IN' };
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  /* Dates and weekdays follow the language (calendar, date pickers); the rest comes from the dictionary */
  function special(k) {
    var loc = LOCALE[cur]; if (!loc || !window.Intl) return null;
    var m;
    try {
      if ((m = k.match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/)) && MONTHS.indexOf(m[2]) > -1)
        return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(+m[3], MONTHS.indexOf(m[2]), +m[1])));
      if ((m = k.match(/^([A-Z][a-z]+) (\d{4})$/)) && LONG.indexOf(m[1]) > -1)
        return new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(+m[2], LONG.indexOf(m[1]), 1)));
      if (DAYS.indexOf(k) > -1)
        return new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + DAYS.indexOf(k))));
    } catch (e) {}
    return null;
  }
  function lookup(src) {
    var d = dicts[cur]; if (!d) return null;
    var k = norm(src); if (!k || !/[A-Za-z]/.test(k)) return null;
    var v = d[k];
    if (v !== undefined && v !== '') return v;
    var s = special(k); if (s) return s;
    var ps = d.__patterns || [];
    for (var i = 0; i < ps.length; i++) {
      var r = new RegExp(ps[i][0]).exec(k);
      if (r) return ps[i][1].replace(/\{(\d)\}/g, function (_, n) { var part = r[+n] || ''; return d[part] || part; });
    }
    return null;
  }
  function withSpace(src, out) {
    var lead = (src.match(/^\s*/) || [''])[0], trail = (src.match(/\s*$/) || [''])[0];
    return lead + out + trail;
  }

  /* A heading whose words are each in a span of their own (a reveal animation): translated as one sentence */
  function isWordRoot(el) {
    if (el.nodeType !== 1 || SKIP_TAG.test(el.tagName)) return false;
    var spans = 0, gaps = 0;
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 1) {
        if (c.tagName !== 'SPAN' || c.children.length > 1) return false;
        if (c.children.length === 1 && c.firstElementChild.tagName !== 'SPAN') return false;
        spans++;
      } else if (c.nodeType === 3) {
        if (/\S/.test(c.nodeValue)) return false;
        gaps++;
      }
    }
    return spans >= 3 && gaps >= 2;
  }
  function leaves(el) {
    var out = [];
    (function w(n) { for (var c = n.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3) { if (c.parentNode !== el || /\S/.test(c.nodeValue)) out.push(c); } else if (c.nodeType === 1) w(c); } })(el);
    return out.filter(function (n) { return n.parentNode !== el; });
  }
  function blockText(el) {
    return norm(leaves(el).map(function (n) { var s = nodeState.get(n); return s && n.nodeValue === s.out ? s.src : n.nodeValue; }).join(' '));
  }
  function doBlock(el) {
    var ls = leaves(el);
    var states = ls.map(function (n) { var s = nodeState.get(n); return s && n.nodeValue === s.out ? s.src : n.nodeValue; });
    var key = norm(states.join(' '));
    var t = cur === 'en' ? null : lookup(key);
    if (t === null) {
      ls.forEach(function (n, i) { var s = nodeState.get(n); if (s && n.nodeValue === s.out) n.nodeValue = states[i]; nodeState.delete(n); });
      return false;
    }
    ls.forEach(function (n, i) {
      var out = i === 0 ? t : '';
      nodeState.set(n, { src: states[i], out: out, block: true });
      if (n.nodeValue !== out) n.nodeValue = out;
    });
    return true;
  }

  function doText(n) {
    if (!n.parentElement || skipped(n.parentElement)) return;
    var st = nodeState.get(n);
    // a node holds English unless it still holds the translation put there
    var ours = !!st && n.nodeValue === st.out;
    // a word of a translated heading is handled with its heading
    if (ours && st.block && cur !== 'en') return;
    var src = ours ? st.src : n.nodeValue;
    var t = cur === 'en' ? null : lookup(src);
    if (t === null) {
      if (ours) n.nodeValue = src;
      if (st) nodeState.delete(n);
      return;
    }
    var out = withSpace(src, t);
    nodeState.set(n, { src: src, out: out });
    if (n.nodeValue !== out) n.nodeValue = out;
  }
  function doAttrs(el) {
    if (skipped(el)) return;
    var map = attrState.get(el) || {};
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute(a)) { delete map[a]; return; }
      var v = el.getAttribute(a), st = map[a], ours = !!st && v === st.out;
      var src = ours ? st.src : v;
      var t = cur === 'en' ? null : lookup(src);
      if (t === null) { if (ours) el.setAttribute(a, src); delete map[a]; return; }
      map[a] = { src: src, out: t };
      if (v !== t) el.setAttribute(a, t);
    });
    attrState.set(el, map);
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1) return;
    if (SKIP_TAG.test(root.tagName)) return;
    doAttrs(root);
    if (!skipped(root) && isWordRoot(root) && doBlock(root)) return;
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  function doTitle() {
    var el = document.querySelector('title'); if (!el) return;
    var st = el.__ep;
    if (st && el.textContent === st.out) { if (cur === 'en') { el.textContent = st.src; el.__ep = null; } return; }
    if (cur === 'en') return;
    var t = lookup(el.textContent); if (t === null) return;
    el.__ep = { src: el.textContent, out: t }; el.textContent = t;
  }
  function flush() {
    queued = false;
    var list = pending; pending = [];
    observer && observer.disconnect();
    try { list.forEach(function (r) { walk(r); }); doTitle(); } finally { observe(); }
  }
  function schedule(n) {
    var el = n.nodeType === 3 ? n.parentElement : n;
    // a change inside a word-by-word heading re-does the whole heading
    for (var p = el, d = 0; p && d < 3; p = p.parentElement, d++) if (isWordRoot(p)) { n = p; break; }
    pending.push(n); if (!queued) { queued = true; requestAnimationFrame(flush); }
  }
  function observe() {
    if (!document.body) return;
    observer = observer || new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'childList') m.addedNodes.forEach(schedule);
        else if (m.type === 'characterData') schedule(m.target);
        else if (m.type === 'attributes') schedule(m.target);
      });
    });
    observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ATTRS });
  }

  function load(lang) {
    if (lang === 'en' || dicts[lang]) return Promise.resolve();
    return fetch('/i18n/' + lang + '.json').then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) { dicts[lang] = j; }).catch(function () { dicts[lang] = {}; });
  }
  function apply() {
    document.documentElement.lang = HTML_LANG[cur];
    document.documentElement.setAttribute('data-lang', cur);
    if (observer) observer.disconnect();
    walk(document.body); doTitle();
    observe();
    listeners.forEach(function (f) { try { f(cur); } catch (e) {} });
  }
  function set(lang, quiet) {
    if (LANGS.indexOf(lang) < 0) return;
    return load(lang).then(function () {
      cur = lang;
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      if (!quiet) {
        try { var u = new URL(location.href); if (lang === 'en') u.searchParams.delete('lang'); else u.searchParams.set('lang', lang); history.replaceState(history.state, '', u); } catch (e) {}
      }
      apply();
    });
  }
  /** Every English string on the page (text nodes and attributes), hidden or not: the source for the dictionaries. */
  function collectAll() {
    var out = {};
    (function w(n) {
      if (n.nodeType === 3) { if (n.parentElement && !skipped(n.parentElement)) { var st = nodeState.get(n); var s = norm(st ? st.src : n.nodeValue); if (s && /[A-Za-z]/.test(s)) out[s] = 1; } return; }
      if (n.nodeType !== 1 || SKIP_TAG.test(n.tagName)) return;
      if (!skipped(n) && isWordRoot(n)) { var bt = blockText(n); if (bt && /[A-Za-z]/.test(bt)) out[bt] = 1; return; }
      if (!skipped(n)) ATTRS.forEach(function (a) { if (n.hasAttribute(a)) { var m = (attrState.get(n) || {})[a]; var s = norm(m ? m.src : n.getAttribute(a)); if (s && /[A-Za-z]/.test(s) && !/^(https?:|\/|#)/.test(s) && !/\.(jpg|png|svg|webp)/i.test(s)) out[s] = 1; } });
      for (var c = n.firstChild; c; c = c.nextSibling) w(c);
    })(document.body);
    var t = document.title && norm(document.title); if (t) out[t] = 1;
    return Object.keys(out);
  }

  window.__epLang = { get: function () { return cur; }, set: set, on: function (f) { listeners.push(f); return function () { listeners = listeners.filter(function (x) { return x !== f; }); }; }, collectAll: collectAll, langs: LANGS };
  function boot() {
    var l = read();
    if (l !== 'en') set(l, true);
    observe();
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
