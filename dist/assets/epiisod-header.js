/* Global EPIISOD header (from the EPIISOD design system site): logo, About Us / Life @ EPIISOD / Promotions / Contact,
   Book A Tour, View Rooms, Login and language. Transparent over the hero, chocolate and slimmer once scrolled. Desktop
   opens mega menus on hover; under 1024px a burger opens a full panel. Links are placeholders until the real pages exist. */
(function () {
  var LIFE = [
    ['Why EPIISOD?', 'Where Your Story Finds Its Place'],
    ['International Student', 'Safe, Secure, and Convenient Student Accommodation'],
    ['For Parents', 'Your Child’s Success Starts with the Right Student Accommodation in Australia'],
    ['Moving In', 'Move-In Guide: Everything You Need to Know'],
    ['Scholarships', 'EPIISOD is dedicated to making elevated student living more accessible.'],
    ['EPIISOD Experience', 'The EPIISOD Experience goes beyond accommodation to create a living environment shaped around everyday ease.']
  ];
  var CONTACT = [
    ['Contact Us', 'Reach out to our team — we’re here to help.'],
    ['Join Waitlist', 'Don’t miss your next chapter — sign up to get notified when rooms open.'],
    ['FAQs', 'Everything you need to know before you move in.']
  ];
  var IMG = { life: '/assets/design/studio-dusk.webp', contact: '/assets/amenities/gym.webp' };
  var caret = '<svg class="ep-gh_caret" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var eye = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>';
  var signin = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9.5 2.5h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3M6 5l3 3-3 3M9 8H2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function links(list, cls) {
    return list.map(function (l) { return '<a href="#" class="' + cls + '"><span class="ep-gh_ml">' + l[0] + '</span><span class="ep-gh_ms">' + l[1] + '</span></a>'; }).join('');
  }

  var h = document.createElement('header');
  h.className = 'ep-gh';
  h.innerHTML =
    '<div class="ep-gh_in">' +
      // logo: placeholder until the EPIISOD wordmark file is dropped in
      '<a href="#flythrough" class="ep-gh_logo" aria-label="EPIISOD, back to top"><span class="ep-gh_word">EPIISOD</span></a>' +
      '<nav class="ep-gh_nav" aria-label="Main">' +
        '<a href="#" class="ep-gh_item" data-plain>About Us</a>' +
        '<button type="button" class="ep-gh_item" data-mega="life" aria-expanded="false">Life @ EPIISOD' + caret + '</button>' +
        '<a href="#" class="ep-gh_item" data-plain>Promotions</a>' +
        '<button type="button" class="ep-gh_item" data-mega="contact" aria-expanded="false">Contact' + caret + '</button>' +
      '</nav>' +
      '<div class="ep-gh_act">' +
        '<a href="#" class="ep-gh_link ep-gh_wide">Book A Tour' + eye + '</a>' +
        '<a href="#rooms" class="ep-gh_rooms" data-rooms>View Rooms</a>' +
        '<a href="#" class="ep-gh_link ep-gh_wide">Login' + signin + '</a>' +
        '<span class="ep-gh_lang ep-gh_wide">EN <i>/</i> 中文' + caret + '</span>' +
        '<button type="button" class="ep-gh_burger" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>' +
      '</div>' +
    '</div>';
  var mega = document.createElement('div');
  mega.className = 'ep-gh_mega'; mega.setAttribute('hidden', '');
  mega.innerHTML = '<div class="ep-gh_mega_in"><img class="ep-gh_mega_img" alt="" loading="lazy" decoding="async"><div class="ep-gh_mega_cols"></div></div>';
  var panel = document.createElement('div');
  panel.className = 'ep-gh_panel'; panel.setAttribute('hidden', '');
  panel.innerHTML =
    '<a href="#" class="ep-gh_pi">About Us</a>' +
    '<button type="button" class="ep-gh_pi" data-sub="life" aria-expanded="false">Life @ EPIISOD' + caret + '</button>' +
    '<div class="ep-gh_sub" data-subl="life" hidden>' + links(LIFE, 'ep-gh_sl') + '</div>' +
    '<a href="#" class="ep-gh_pi">Promotions</a>' +
    '<button type="button" class="ep-gh_pi" data-sub="contact" aria-expanded="false">Contact' + caret + '</button>' +
    '<div class="ep-gh_sub" data-subl="contact" hidden>' + links(CONTACT, 'ep-gh_sl') + '</div>' +
    '<div class="ep-gh_pbtns"><a href="#" class="ep-gh_pb ep-gh_pb--gold">Book A Tour</a><a href="#" class="ep-gh_pb">Login</a><span class="ep-gh_pb">EN</span></div>';
  document.body.appendChild(h); document.body.appendChild(mega); document.body.appendChild(panel);
  document.documentElement.classList.add('has-ep-gh');

  var html = document.documentElement, open = null, menu = false, closeT = 0;
  var img = mega.querySelector('.ep-gh_mega_img'), cols = mega.querySelector('.ep-gh_mega_cols');
  var megaBtns = [].slice.call(h.querySelectorAll('[data-mega]'));

  function setDark() {
    var dark = window.pageYOffset > 60 || menu;
    h.classList.toggle('is-dark', dark);
  }
  function showMega(k) {
    clearTimeout(closeT);
    if (open === k) return;
    open = k;
    img.src = IMG[k];
    cols.className = 'ep-gh_mega_cols is-' + k;
    cols.innerHTML = links(k === 'life' ? LIFE : CONTACT, 'ep-gh_ml_a');
    mega.removeAttribute('hidden');
    megaBtns.forEach(function (b) { b.setAttribute('aria-expanded', b.getAttribute('data-mega') === k ? 'true' : 'false'); b.classList.toggle('is-on', b.getAttribute('data-mega') === k); });
    h.classList.add('is-mega');
  }
  function hideMega() {
    if (!open) return;
    open = null;
    mega.setAttribute('hidden', '');
    megaBtns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); b.classList.remove('is-on'); });
    h.classList.remove('is-mega');
  }
  megaBtns.forEach(function (b) {
    b.addEventListener('mouseenter', function () { showMega(b.getAttribute('data-mega')); });
    b.addEventListener('click', function () { if (open === b.getAttribute('data-mega')) hideMega(); else showMega(b.getAttribute('data-mega')); });
  });
  [].forEach.call(h.querySelectorAll('[data-plain], .ep-gh_act, .ep-gh_logo'), function (el) { el.addEventListener('mouseenter', hideMega); });
  h.addEventListener('mouseleave', function (e) { if (!mega.contains(e.relatedTarget)) closeT = setTimeout(hideMega, 160); });
  mega.addEventListener('mouseenter', function () { clearTimeout(closeT); });
  mega.addEventListener('mouseleave', function (e) { if (!h.contains(e.relatedTarget)) hideMega(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hideMega(); setMenu(false); } });

  // burger panel (under 1024px)
  var burger = h.querySelector('.ep-gh_burger');
  function setMenu(v) {
    if (menu === v) return;
    menu = v;
    panel.toggleAttribute('hidden', !v);
    burger.setAttribute('aria-expanded', v ? 'true' : 'false');
    h.classList.toggle('is-menu', v);
    html.classList.toggle('ep-gh-lock', v);
    var L = window.__lenis;
    if (L) { if (v && L.stop) L.stop(); else if (!v && L.start) L.start(); }
    setDark();
  }
  burger.addEventListener('click', function () { setMenu(!menu); });
  [].forEach.call(panel.querySelectorAll('[data-sub]'), function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-sub'), list = panel.querySelector('[data-subl="' + k + '"]'), on = list.hasAttribute('hidden');
      [].forEach.call(panel.querySelectorAll('[data-subl]'), function (x) { x.setAttribute('hidden', ''); });
      [].forEach.call(panel.querySelectorAll('[data-sub]'), function (x) { x.setAttribute('aria-expanded', 'false'); });
      if (on) { list.removeAttribute('hidden'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  // placeholder links do nothing yet; View Rooms and the logo glide to their place on this page
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.ep-gh a, .ep-gh_mega a, .ep-gh_panel a');
    if (!a) return;
    var href = a.getAttribute('href');
    e.preventDefault();
    if (href && href.length > 1) {
      setMenu(false); hideMega();
      var t = document.querySelector(href);
      if (!t) return;
      var y = href === '#flythrough' ? 0 : t.getBoundingClientRect().top + window.pageYOffset;
      var L = window.__lenis;
      if (L && L.scrollTo) L.scrollTo(y, { duration: 1.4, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  // the bar slips away while scrolling down and comes back on the first scroll up (always shown near the top, and
  // while a menu is open)
  var qd = false, lastY = window.pageYOffset;
  function hideOnScroll() {
    var y = window.pageYOffset, d = y - lastY;
    if (Math.abs(d) < 4) return;
    lastY = y;
    var hide = d > 0 && y > 120 && !menu && !open;
    h.classList.toggle('is-hidden', hide);
  }
  window.addEventListener('scroll', function () {
    if (qd) return; qd = true;
    requestAnimationFrame(function () { qd = false; setDark(); hideMega(); hideOnScroll(); });
  }, { passive: true });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); else hideMega(); });
  setDark();
})();
