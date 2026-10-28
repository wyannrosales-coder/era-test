/* The footer's resident pass: an EPIISOD access card on a sand lanyard that swings, spins and flips. Drag it, tap it to flip
   it; type a name and it is printed on the pass; the back has Book a tour and View rooms.
   No libraries: a small verlet physics world (a rope of four links and a card made of five points held rigid by distance
   constraints, so it can swing, pitch and spin freely) drawn with raw WebGL as three textured pieces: the lanyard ribbon,
   the card's edge and the card, whose two faces are canvas textures drawn from the page's own fonts and emblem. Only runs
   while the footer is on screen. Reduced motion or no WebGL: a still card instead. */
(function () {
  var wrap = document.querySelector('.footer-w');
  if (!wrap) return;
  var fs = wrap.querySelector('.footer-s'), contact = wrap.querySelector('.footer-s_contact');
  if (!fs || !contact) return;
  var section = wrap.closest('section') || wrap;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  // ---- DOM: the stage with the canvas, and the "print your pass" form in the contact column ----
  var stage = document.createElement('div');
  stage.className = 'ep-badge';
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', 'Your EPIISOD resident pass. Drag it to swing it, tap it to flip it.');
  stage.innerHTML = '<p class="ep-badge_hint" aria-hidden="true"><i></i>' + (coarse ? 'Swipe the pass sideways. Tap to flip.' : 'Drag the pass. Click it to flip.') + '</p>';
  fs.appendChild(stage);
  // the canvas is not limited to the stage: on landscape screens it covers the whole footer (and ignores the pointer, which
  // is read from the footer instead), so a swinging, dragged or flicked pass is never cut off at the edge of its column
  var cv = document.createElement('canvas');
  cv.className = 'ep-badge_cv'; cv.setAttribute('aria-hidden', 'true');
  fs.appendChild(cv);

  var form = document.createElement('form');
  form.className = 'ep-badge_form'; form.setAttribute('autocomplete', 'off');
  form.innerHTML = '<span class="ep-badge_eb">Your resident pass</span>' +
    '<label class="ep-badge_h" for="ep-badge-name">Print your name on it</label>' +
    '<input id="ep-badge-name" class="ep-badge_in" type="text" maxlength="22" placeholder="Your name" enterkeyhint="done" autocapitalize="words" spellcheck="false">' +
    '<span class="ep-badge_note">Then flip it over to book a tour.</span>' +
    '<a class="ep-badge_book" href="#" data-ep-badge-book>Book a tour <i>→</i></a>';
  var anchorEl = contact.querySelector('.contact-cms') || contact.lastElementChild;
  contact.insertBefore(form, anchorEl);
  section.classList.add('ep-footer');
  var input = form.querySelector('input');
  form.addEventListener('submit', function (e) { e.preventDefault(); input.blur(); });

  var name = '';
  try { name = (localStorage.getItem('epBadgeName') || '').slice(0, 22); } catch (e) {}
  input.value = name;

  function bookTour() { var real = document.querySelector('[data-modal-cta-btn="book-a-call"]:not([data-ep-badge-book])'); if (real) real.click(); else window.open('https://epiisod.com/en-au', '_blank', 'noopener'); }
  function viewRooms() {
    var el = document.getElementById('rooms'); if (!el) return;
    if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(el, { duration: 1.8 }); else el.scrollIntoView({ behavior: 'smooth' });
  }
  form.querySelector('[data-ep-badge-book]').addEventListener('click', function (e) { e.preventDefault(); bookTour(); });

  // ---- the two faces, drawn once on canvases. The front is drawn in the design's own units (a 408.32 x 647.68 card), the back in its
  // units (357.28 x 566.72) scaled up to match; both end up 408 x 648, drawn at 2x ----
  var FW = 408, FH = 648, TS = 2, SF = FW / 408.32, SB = FW / 357.28;
  var cvF = document.createElement('canvas'), cvB = document.createElement('canvas');
  cvF.width = cvB.width = FW * TS; cvF.height = cvB.height = FH * TS;
  var stillRefresh = null, stillMode = false;
  var IM = {}, IMN = ['skyline', 'barcode', 'front-logo-a', 'front-logo-b', 'front-arrow', 'back-logo-a', 'back-logo-b', 'back-arrow', 'icon-location'], imLeft = IMN.length;
  IMN.forEach(function (k) {
    var im = new Image();
    im.onload = im.onerror = function () { if (--imLeft === 0) { drawFaces(); if (typeof upload === 'function') { upload(0); upload(1); } if (stillRefresh) stillRefresh(); } };
    im.src = '/assets/badge/' + k + '.svg?v=1'; IM[k] = im;
  });
  function img(g, k, x, y, w, h) { var im = IM[k]; if (im && im.complete && im.naturalWidth) { try { g.drawImage(im, x, y, w, h); } catch (e) {} } }

  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function spaced(g, text, x, y, sp, align, font, color) {
    g.font = font; g.fillStyle = color; g.textBaseline = 'middle'; g.textAlign = 'left';
    var w = 0, ws = [];
    for (var i = 0; i < text.length; i++) { var cw = g.measureText(text[i]).width; ws.push(cw); w += cw + (i < text.length - 1 ? sp : 0); }
    var cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    for (var j = 0; j < text.length; j++) { g.fillText(text[j], cx, y); cx += ws[j] + sp; }
    return w;
  }
  // the gold clip over the card's slot
  function clip(g, x, y, w, h, back) {
    g.fillStyle = back ? 'rgba(36,18,12,.28)' : 'rgba(0,0,0,.5)'; rr(g, x - 5, y + 2, w + 10, h - 4, (h - 4) / 2); g.fill();
    var m = g.createLinearGradient(0, y, 0, y + h); m.addColorStop(0, '#eadfc6'); m.addColorStop(.45, '#b99f72'); m.addColorStop(1, '#d9c6a2');
    g.fillStyle = m; rr(g, x, y, w, h, h / 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = .8; rr(g, x + .4, y + .4, w - .8, h - .8, h / 2); g.stroke();
    var hl = g.createLinearGradient(0, y, 0, y + h * .55); hl.addColorStop(0, 'rgba(255,255,255,.5)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; rr(g, x + 3, y + 2, w - 6, h * .45, h * .22); g.fill();
  }
  function bigE(g, x, base, size, alpha) {
    g.save(); g.globalAlpha = alpha; g.fillStyle = '#896d42'; g.font = 'italic 400 ' + size + 'px "Playfair Display", serif'; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillText('E', x, base); g.restore();
  }
  function drawFront() {
    var g = cvF.getContext('2d'); g.setTransform(TS * SF, 0, 0, TS * SF, 0, 0); g.clearRect(0, 0, 408.32, 647.68);
    var bg = g.createLinearGradient(424.96, -40.64, 37.12, 647.68); bg.addColorStop(0, '#3A1F15'); bg.addColorStop(.4547, '#24120C'); bg.addColorStop(1, '#170A05');
    g.fillStyle = bg; g.fillRect(0, 0, 408.32, 647.68);
    g.save(); g.beginPath(); g.rect(0, 0, 408.32, 647.68); g.clip(); bigE(g, 173.44, 280.3, 358.4, .28); g.restore();
    img(g, 'skyline', 180.48, 474.88, 213.76, 156.16);
    clip(g, 164.16, 32.68, 80, 30, false);
    // logo and label
    img(g, 'front-logo-a', 29.44 + 156.16 * .1033, 300.16, 120.82, 25.6); img(g, 'front-logo-b', 29.44, 300.16 + 25.6 * .2121, 156.16, 14.78);
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d7c5a9'; g.font = '300 9.6px "Albert Sans", sans-serif'; g.fillText('MACQUARIE PARK', 291.2, 312.6);
    g.fillStyle = '#896d42'; g.fillRect(29.44, 338.24, 350.08, .64);
    g.fillRect(29.44, 351.36, .64, 99);
    g.font = '300 12.8px "Albert Sans", sans-serif'; g.fillText('WELCOME HOME', 37.76, 365.3);
    if (name) {
      var size = 32; g.font = '400 ' + size + 'px "Albert Sans", sans-serif';
      while (g.measureText(name).width > 336 && size > 14) { size -= 1; g.font = '400 ' + size + 'px "Albert Sans", sans-serif'; }
      g.fillStyle = '#fbfaf7'; g.fillText(name, 36.48, 404.6);
    } else {
      g.font = '400 32px "Albert Sans", sans-serif'; g.fillStyle = 'rgba(251,250,247,.34)'; g.fillText('Your name', 36.48, 404.6);
    }
    g.font = '400 11.52px "Albert Sans", sans-serif'; g.fillStyle = '#a39a8e'; g.fillText('Resident Since 2027', 36.48, 437);
    if (!stillMode) { spaced(g, 'TAP TO FLIP', 22.4, 592.6, 2.15, 'left', '500 7.68px "Albert Sans", sans-serif', '#e9dfd0'); img(g, 'front-arrow', 95.8, 586.88, 11.52, 11.52); }
    img(g, 'barcode', 22.4, 602.24, 108.8, 34.56);
  }
  // the back's buttons, in canvas units as drawn (hit-testing mirrors them, because the back is seen flipped)
  var BTN = { book: [25.76 * SB, 428.96 * SB, 306.32 * SB, 32 * SB], rooms: [25.76 * SB, 464.8 * SB, 306.32 * SB, 34 * SB] };
  function drawBack() {
    var g = cvB.getContext('2d'); g.setTransform(TS * SB, 0, 0, TS * SB, 0, 0); g.clearRect(0, 0, 357.28, 566.72);
    var bg = g.createLinearGradient(371.84, -35.56, 32.48, 566.72); bg.addColorStop(0, '#FBFAF7'); bg.addColorStop(.4547, '#E9DFD0'); bg.addColorStop(1, '#D7C5A9');
    g.fillStyle = bg; g.fillRect(0, 0, 357.28, 566.72);
    g.save(); g.beginPath(); g.rect(0, 0, 357.28, 566.72); g.clip(); bigE(g, 14, 232.9, 313.6, .22); g.restore();
    clip(g, 142.64, 26.72, 72, 30, true);
    img(g, 'back-logo-a', 25.76 + 136.64 * .1033, 252, 105.72, 22.4); img(g, 'back-logo-b', 25.76, 252 + 22.4 * .2121, 136.64, 12.93);
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#391d13'; g.font = '300 8.4px "Albert Sans", sans-serif'; g.fillText('MACQUARIE PARK', 254.8, 262.6);
    g.fillStyle = '#896d42'; g.fillRect(25.76, 285.32, 306.32, .56);
    g.fillRect(25.76, 297.92, .56, 110.88);
    g.font = '300 11.2px "Albert Sans", sans-serif'; g.fillText('BOOK YOUR STAY', 32.48, 307.8);
    g.fillStyle = '#24120c'; g.font = '400 24.64px "Albert Sans", sans-serif'; g.fillText('Your room', 32.48, 335.4); g.fillText('is waiting.', 32.48, 363.4);
    g.fillStyle = '#776a5d'; g.font = '400 10.08px "Albert Sans", sans-serif'; g.fillText('Studios, ensuites and shared apartments, minutes from', 32.48, 390.2); g.fillText('Macquarie University.', 32.48, 402.6);
    // buttons
    g.fillStyle = '#391d13'; rr(g, 25.76, 428.96, 306.32, 32, 16); g.fill();
    spaced(g, 'BOOK A TOUR', 25.76 + 153.16, 444.96, 1.0, 'center', '500 8.4px "Albert Sans", sans-serif', '#fbfaf7');
    g.strokeStyle = '#896d42'; g.lineWidth = .56; rr(g, 26.04, 465.08, 305.76, 33.44, 16.7); g.stroke();
    spaced(g, 'VIEW ROOMS', 25.76 + 153.16, 481.8, 1.0, 'center', '500 8.4px "Albert Sans", sans-serif', '#24120c');
    img(g, 'icon-location', 19.6, 511.84, 13.44, 13.44);
    g.textAlign = 'left'; g.fillStyle = '#24120c'; g.font = '400 8.96px "Albert Sans", sans-serif'; g.fillText('17 Lachlan Ave, Macquarie Park NSW 2113', 36.96, 519);
    if (!stillMode) {
      spaced(g, 'TAP TO FLIP', 263.76, 518.6, 1.88, 'left', '500 6.72px "Albert Sans", sans-serif', '#391d13');
      var im = IM['back-arrow']; if (im && im.complete && im.naturalWidth) { g.save(); g.translate(263.76 + 73.68 + 10.08, 513.52); g.scale(-1, 1); try { g.drawImage(im, 0, 0, 10.08, 10.08); } catch (e) {} g.restore(); }
    }
  }
  function drawFaces() { drawFront(); drawBack(); }
  var fontsReady = false;
  function whenFonts(cb) {
    if (!document.fonts || !document.fonts.load) { cb(); return; }
    Promise.all([document.fonts.load('italic 400 40px "Playfair Display"'), document.fonts.load('300 12px "Albert Sans"'), document.fonts.load('400 12px "Albert Sans"'), document.fonts.load('500 12px "Albert Sans"')]).then(cb, cb);
  }

  // ---- a still card when motion is reduced or WebGL is missing ----
  function still() {
    stillMode = true;
    var dpr = 2;
    whenFonts(function () {
      drawFaces();
      var img = new Image(); img.alt = 'EPIISOD resident pass'; img.className = 'ep-badge_still'; img.src = cvF.toDataURL('image/png');
      stage.insertBefore(img, stage.firstChild); cv.style.display = 'none';
      stillRefresh = function () { img.src = cvF.toDataURL('image/png'); };
      if (imLeft === 0) stillRefresh();
      input.addEventListener('input', function () { name = input.value.trim(); drawFront(); stillRefresh(); });
    });
  }

  var gl = null;
  if (!reduce) { try { gl = cv.getContext('webgl', { alpha: true, antialias: true }) || cv.getContext('experimental-webgl', { alpha: true, antialias: true }); } catch (e) {} }
  if (!gl) { still(); return; }

  // ---- WebGL ----
  var VS = 'attribute vec3 aPos;attribute vec2 aUv;uniform vec2 uRes;uniform float uD;varying vec2 vUv;void main(){float w=(uD-aPos.z)/uD;gl_Position=vec4(aPos.xy/(uRes*0.5),0.0,w);vUv=aUv;}';
  var FS_CARD = 'precision mediump float;varying vec2 vUv;uniform sampler2D uF;uniform sampler2D uB;uniform vec3 uN;uniform float uAsp;uniform float uRad;uniform float uRim;uniform vec3 uRimC;' +
    'float rd(vec2 uv){vec2 p=(uv-0.5)*vec2(1.0,1.0/uAsp);vec2 q=abs(p)-vec2(0.5,0.5/uAsp)+uRad;return length(max(q,0.0))+min(max(q.x,q.y),0.0)-uRad;}' +
    'void main(){float d=rd(vUv);float a=1.0-smoothstep(-0.0035,0.0015,d);if(a<0.01)discard;' +
    'if(uRim>0.5){gl_FragColor=vec4(uRimC,a);return;}' +
    'bool fr=gl_FrontFacing;vec3 c=fr?texture2D(uF,vUv).rgb:texture2D(uB,vec2(1.0-vUv.x,vUv.y)).rgb;vec3 n=normalize(uN);if(!fr)n=-n;' +
    'vec3 L=normalize(vec3(-0.35,0.55,0.78));vec3 H=normalize(L+vec3(0.0,0.0,1.0));float sp=pow(max(dot(n,H),0.0),46.0)*0.3;float df=0.78+0.22*max(dot(n,L),0.0);' +
    'float band=smoothstep(0.0,1.0,sin((vUv.x*1.3+vUv.y*0.8+n.x*1.7-n.y*0.8)*7.0)*0.5+0.5);' +
    'vec3 col=c*df+vec3(0.84,0.66,0.5)*band*0.05+sp*vec3(1.0,0.95,0.86);' +
    'float edge=smoothstep(0.0,0.018,-d);col*=0.9+0.1*edge;gl_FragColor=vec4(col,a);}';
  var FS_RIB = 'precision mediump float;varying vec2 vUv;uniform sampler2D uT;uniform sampler2D uT2;uniform float uMix;void main(){vec3 c=mix(texture2D(uT,vUv).rgb,texture2D(uT2,vUv).rgb,uMix);float e=abs(vUv.x-0.5)*2.0;c*=0.9+0.1*(1.0-e*e);gl_FragColor=vec4(c,1.0);}';
  function prog(fsSrc) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsSrc)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    p.aPos = gl.getAttribLocation(p, 'aPos'); p.aUv = gl.getAttribLocation(p, 'aUv');
    ['uRes', 'uD', 'uF', 'uB', 'uN', 'uAsp', 'uRad', 'uRim', 'uRimC', 'uT', 'uT2', 'uMix'].forEach(function (n) { p[n] = gl.getUniformLocation(p, n); });
    return p;
  }
  var pCard = prog(FS_CARD), pRib = prog(FS_RIB);
  if (!pCard || !pRib) { gl = null; still(); return; }
  function mkTex(source, rep) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, rep ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); return t;
  }
  var texF, texB, texR, texR2;
  function upload(which) { if (!texF) return; gl.bindTexture(gl.TEXTURE_2D, which === 0 ? texF : texB); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, which === 0 ? cvF : cvB); }
  // the lanyard's strip, as designed: a dark ribbon with sand lettering for the front, sand with dark lettering for the back, stitched
  // down both edges and the words repeated along it. 64 x 512 (one repeat is 304 design units of the 38-wide strap), tiling
  var RIB_REP = 304;
  function ribbonCanvas(bg, ink, stitch) {
    var c = document.createElement('canvas'); c.width = 64; c.height = 512; var g = c.getContext('2d'), k = 64 / 38;
    g.fillStyle = bg; g.fillRect(0, 0, 64, 512);
    g.fillStyle = stitch; g.fillRect(5 * k, 0, 1.4, 512); g.fillRect(32 * k, 0, 1.4, 512);
    var t = 'EPIISOD  ·  MACQUARIE PARK  ·  ', fs = 11 * k, i, w = 0, ws = [];
    g.font = '500 ' + fs + 'px "Albert Sans", sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = ink;
    for (i = 0; i < t.length; i++) { ws.push(g.measureText(t[i]).width); w += ws[i]; }
    var sp = (512 - w) / t.length;                        // letter-spacing chosen so the phrase fills one repeat exactly
    g.save(); g.translate(32, 0); g.rotate(Math.PI / 2);
    var x = 0; for (i = 0; i < t.length; i++) { g.fillText(t[i], x, 0); x += ws[i] + sp; }
    g.restore();
    return c;
  }

  var buf = gl.createBuffer();
  var W = 0, H = 0, D = 1100, dpr = 1;
  var P = [], C = [];            // particles and constraints
  var cw = 280, ch = 392, L = 34, topY = 0, ax = 0, SW = 0, SH = 0;      // card size, rope link, anchor height and x, stage size
  function addP(x, y, im) { P.push({ x: x, y: y, z: 0, px: x, py: y, pz: 0, im: im }); }
  function cons(a, b, len) { C.push([a, b, len]); }
  function reset(intro) {
    P.length = 0; C.length = 0;
    cw = Math.min(300, SW * 0.7, SH * 0.72 / 1.5864); ch = cw * 1.5864;
    var Ty = ch / 2 + SH * 0.025; topY = H / 2 + 26; L = Math.max(22, (topY - Ty) / 4);
    addP(ax, topY, 0);
    for (var i = 1; i <= 3; i++) addP(ax, topY - L * i, 2.2);
    addP(ax, Ty, 1);                                  // 4: the clasp, the end of the rope
    addP(ax - cw / 2, Ty, 1); addP(ax + cw / 2, Ty, 1); addP(ax + cw / 2, Ty - ch, 1); addP(ax - cw / 2, Ty - ch, 1);   // 5..8: the corners
    for (var k = 1; k <= 4; k++) cons(k - 1, k, L);
    for (var a = 4; a <= 8; a++) for (var b = a + 1; b <= 8; b++) cons(a, b, Math.hypot(P[a].x - P[b].x, P[a].y - P[b].y));
    if (intro) { for (var j = 1; j < P.length; j++) P[j].px -= 2.2 + j * 0.15; P[5].pz += 1.4; P[8].pz += 1.4; P[6].pz -= 1.4; P[7].pz -= 1.4; }
    for (var m = 0; m < P.length; m++) { P[m].px0 = P[m].px; }
  }
  var portraitMQ = window.matchMedia('(max-aspect-ratio: 100/101)');
  function size() {
    var sr = stage.getBoundingClientRect(), fr = fs.getBoundingClientRect();
    // the canvas spans the full width of the screen (and the footer's height on landscape screens, the stage's on portrait),
    // so nothing the pass does is cut off by its column or by the page's side margins
    var vwid = document.documentElement.clientWidth;
    var vb = portraitMQ.matches ? sr : fr;
    var box = { left: 0, top: vb.top, width: vwid, height: vb.height };
    var nw = Math.round(box.width), nh = Math.round(box.height);
    if (nw < 40 || nh < 40 || sr.width < 40) return;
    var nax = Math.round((sr.left + sr.width / 2) - (box.left + box.width / 2));
    if (W && Math.abs(nw - W) < 3 && Math.abs(nh - H) < 70 && Math.abs(nax - ax) < 3 && Math.abs(sr.width - SW) < 3) return;    // the address bar moving is not a resize
    W = nw; H = nh; ax = nax; SW = sr.width; SH = sr.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.left = Math.round(-fr.left) + 'px'; cv.style.top = Math.round(box.top - fr.top) + 'px';
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    reset(started);
  }

  // ---- one physics step (fixed 1/120 s) ----
  var G = 2500, DT = 1 / 120, drag = null, lastPtr = { x: 0, y: 0, t: 0, vx: 0, vy: 0 };
  function step() {
    var gy = window.__epGyro, wind = gy && gy.on ? gy.gx * 1500 : 0, dt2 = DT * DT;
    var T = P[4], i, p, vx, vy, vz;
    for (i = 1; i < P.length; i++) {
      p = P[i];
      vx = (p.x - p.px) * 0.9965; vy = (p.y - p.py) * 0.9965; vz = (p.z - p.pz) * 0.985;
      p.px = p.x; p.py = p.y; p.pz = p.z;
      p.x += vx + wind * dt2; p.y += vy - G * dt2; p.z += vz;
      // keep the swing in the plane of the screen (the rope) and the card flat to it (the card), softly
      var tz = i >= 5 ? T.z : 0;
      p.z += (tz - p.z) * (i >= 5 ? 42 : 18) * dt2;
    }
    if (drag) {
      var g = grabPoint(), dx = drag.tx - g.x, dy = drag.ty - g.y, m = Math.hypot(dx, dy);
      if (m > 90) { dx *= 90 / m; dy *= 90 / m; }
      for (i = 4; i <= 8; i++) { P[i].x += dx * 0.5; P[i].y += dy * 0.5; }
      var vxp = lastPtr.vx;
      for (i = 5; i <= 8; i++) P[i].z += (P[i].x - T.x) * vxp * 0.000014;      // a gentle tilt with the drag, not a flip
    }
    for (var it = 0; it < 12; it++) {
      for (var c = 0; c < C.length; c++) {
        var a = P[C[c][0]], b = P[C[c][1]], rest = C[c][2];
        var ex = b.x - a.x, ey = b.y - a.y, ez = b.z - a.z, d = Math.sqrt(ex * ex + ey * ey + ez * ez) || 1e-4;
        var diff = (d - rest) / d, wa = a.im, wb = b.im, ws = wa + wb; if (!ws) continue;
        a.x += ex * diff * (wa / ws); a.y += ey * diff * (wa / ws); a.z += ez * diff * (wa / ws);
        b.x -= ex * diff * (wb / ws); b.y -= ey * diff * (wb / ws); b.z -= ez * diff * (wb / ws);
      }
      P[0].x = ax; P[0].y = topY; P[0].z = 0;
      // the pass stays inside its canvas: it bounces softly off the sides and the top
      // (as it appears on screen: a corner turned towards the camera looks bigger, so the limit is scaled by its depth)
      for (var bi = 4; bi <= 8; bi++) {
        var q = P[bi], wq = Math.max(0.6, (D - q.z) / D), lx = (W / 2 - 8) * wq, ly = (H / 2 - 6) * wq;
        if (q.x < -lx) q.x = -lx; else if (q.x > lx) q.x = lx;
        if (q.y > ly) q.y = ly; else if (q.y < -ly) q.y = -ly;
      }
    }
  }
  function impulseSpin(rate) {                          // an angular velocity about the clasp's vertical axis, rad/s
    var T = P[4];
    for (var i = 5; i <= 8; i++) { var ox = P[i].x - T.x; P[i].pz = P[i].z - rate * ox * DT; }
  }

  // ---- the card's geometry, the ray test and the hit regions ----
  function sub(a, b) { return [a.x - b.x, a.y - b.y, a.z - b.z]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function normal() { var n = cross(sub(P[8], P[5]), sub(P[6], P[5])); var l = Math.hypot(n[0], n[1], n[2]) || 1; return [n[0] / l, n[1] / l, n[2] / l]; }
  function rayCard(sx, sy) {                            // screen point (world px, y up) -> card (u, v) and which face
    var cam = [0, 0, D], dir = [sx, sy, -D], n = normal(), c0 = P[5];
    var den = dot(dir, n); if (Math.abs(den) < 1e-6) return null;
    var t = dot([c0.x - cam[0], c0.y - cam[1], c0.z - cam[2]], n) / den; if (t < 0) return null;
    var q = [cam[0] + dir[0] * t - c0.x, cam[1] + dir[1] * t - c0.y, cam[2] + dir[2] * t - c0.z];
    var e1 = sub(P[6], P[5]), e2 = sub(P[8], P[5]);
    var u = dot(q, e1) / dot(e1, e1), v = dot(q, e2) / dot(e2, e2);
    return { u: u, v: v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1, back: n[2] < 0 };
  }
  function grabPoint() { var e1 = sub(P[6], P[5]), e2 = sub(P[8], P[5]), c0 = P[5]; return { x: c0.x + e1[0] * drag.u + e2[0] * drag.v, y: c0.y + e1[1] * drag.u + e2[1] * drag.v }; }
  function regionAt(h) {                                // a button on the back, if the pointer is over one
    if (!h || !h.inside || !h.back) return null;
    var x = (1 - h.u) * FW, y = h.v * FH, k, b;
    for (k in BTN) { b = BTN[k]; if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) return k; }
    return null;
  }
  function toWorld(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left - W / 2, y: H / 2 - (e.clientY - r.top) }; }

  // ---- pointer ----
  var down = null;
  stage.style.touchAction = coarse ? 'pan-y' : 'none';
  fs.addEventListener('pointerdown', function (e) {
    if (e.button > 0 || (e.target.closest && e.target.closest('input, a, button, label, textarea'))) return;
    var w = toWorld(e), h = rayCard(w.x, w.y);
    if (!h || !h.inside) return;
    down = { x: e.clientX, y: e.clientY, t: performance.now(), h: h, id: e.pointerId };
    var s = (D - P[4].z) / D;
    drag = { u: Math.max(0, Math.min(1, h.u)), v: Math.max(0, Math.min(1, h.v)), tx: w.x * s, ty: w.y * s };
    lastPtr = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 };
    try { fs.setPointerCapture(e.pointerId); } catch (x) {}
    fs.style.cursor = 'grabbing';
  });
  fs.addEventListener('pointermove', function (e) {
    var w = toWorld(e);
    if (drag) {
      var s = (D - P[4].z) / D; drag.tx = w.x * s; drag.ty = w.y * s;
      var now = performance.now(), dt = Math.max(1, now - lastPtr.t);
      lastPtr.vx = lastPtr.vx * 0.6 + ((e.clientX - lastPtr.x) / dt * 1000) * 0.4; lastPtr.vy = lastPtr.vy * 0.6 + ((e.clientY - lastPtr.y) / dt * 1000) * 0.4;
      lastPtr.x = e.clientX; lastPtr.y = e.clientY; lastPtr.t = now;
    } else if (e.pointerType === 'mouse') {
      var h = rayCard(w.x, w.y);
      fs.style.cursor = regionAt(h) ? 'pointer' : (h && h.inside ? 'grab' : '');
    }
  });
  function release(e) {
    if (!drag) return;
    var moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) : 99, quick = down ? performance.now() - down.t < 420 : false;
    var vx = lastPtr.vx, h = down && down.h;
    drag = null; fs.style.cursor = '';
    if (e.type === 'pointercancel') return;
    if (moved < 7 && quick) {                           // a tap or click: a button on the back, or flip the card
      var k = regionAt(h);
      if (k === 'book') bookTour(); else if (k === 'rooms') viewRooms();
      else impulseSpin(h && h.back ? -9 : 9);
    } else if (Math.abs(vx) > 700) {                    // a flick: spin it
      impulseSpin(Math.max(-13, Math.min(13, vx * 0.0085)));
    }
    down = null;
  }
  fs.addEventListener('pointerup', release); fs.addEventListener('pointercancel', release);
  input.addEventListener('input', function () {
    name = input.value.trim(); try { localStorage.setItem('epBadgeName', name); } catch (e) {}
    drawFront(); upload(0);
    if (fontsReady) impulseSpin(5);
  });

  // ---- draw ----
  var quad = new Float32Array(6 * 5), rim = new Float32Array(6 * 5), rib = new Float32Array(2 * 40 * 5);
  function setQuad(arr, k, scale, off, n) {
    var c = [P[5], P[6], P[7], P[8]], uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
    var cx = (c[0].x + c[2].x) / 2, cy = (c[0].y + c[2].y) / 2, cz = (c[0].z + c[2].z) / 2;
    var idx = [0, 3, 2, 0, 2, 1];
    for (var i = 0; i < 6; i++) {
      var q = c[idx[i]], o = i * 5;
      arr[o] = cx + (q.x - cx) * scale + n[0] * off; arr[o + 1] = cy + (q.y - cy) * scale + n[1] * off; arr[o + 2] = cz + (q.z - cz) * scale + n[2] * off;
      arr[o + 3] = uv[idx[i]][0]; arr[o + 4] = uv[idx[i]][1];
    }
  }
  function ribbonPts() {
    var A = { x: ax, y: topY + 80, z: 0 }, ctl = [A, P[0], P[1], P[2], P[3], P[4]], out = [];
    for (var s = 0; s < ctl.length - 1; s++) {
      var p0 = ctl[Math.max(0, s - 1)], p1 = ctl[s], p2 = ctl[s + 1], p3 = ctl[Math.min(ctl.length - 1, s + 2)];
      for (var t = 0; t < 1; t += 0.2) {
        var t2 = t * t, t3 = t2 * t, f = function (a, b, c, d) { return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); };
        out.push([f(p0.x, p1.x, p2.x, p3.x), f(p0.y, p1.y, p2.y, p3.y), f(p0.z, p1.z, p2.z, p3.z)]);
      }
    }
    var e = P[4]; out.push([e.x, e.y, e.z]);
    return out;
  }
  function drawRibbon() {
    var pts = ribbonPts(), n = Math.min(pts.length, 40), hw = Math.max(9, cw * 0.0465), len = 0, o = 0, per = RIB_REP * cw / 408.32;
    for (var i = 0; i < n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1, nx = -ty / tl * hw, ny = tx / tl * hw;
      if (i > 0) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      var v = len / per;
      rib[o++] = pts[i][0] - nx; rib[o++] = pts[i][1] - ny; rib[o++] = pts[i][2] - 1; rib[o++] = 0; rib[o++] = v;
      rib[o++] = pts[i][0] + nx; rib[o++] = pts[i][1] + ny; rib[o++] = pts[i][2] - 1; rib[o++] = 1; rib[o++] = v;
    }
    gl.useProgram(pRib); bindCommon(pRib);
    var nz = normal()[2], mx = Math.max(0, Math.min(1, 0.5 - nz * 1.6));     // dark strap while the front faces you, sand once the back does
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texR); gl.uniform1i(pRib.uT, 2);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, texR2); gl.uniform1i(pRib.uT2, 3); gl.uniform1f(pRib.uMix, mx);
    gl.bufferData(gl.ARRAY_BUFFER, rib.subarray(0, o), gl.DYNAMIC_DRAW); attribs(pRib);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n * 2);
  }
  function bindCommon(p) { gl.uniform2f(p.uRes, W, H); gl.uniform1f(p.uD, D); gl.bindBuffer(gl.ARRAY_BUFFER, buf); }
  function attribs(p) { gl.enableVertexAttribArray(p.aPos); gl.vertexAttribPointer(p.aPos, 3, gl.FLOAT, false, 20, 0); gl.enableVertexAttribArray(p.aUv); gl.vertexAttribPointer(p.aUv, 2, gl.FLOAT, false, 20, 12); }
  function draw() {
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    drawRibbon();
    var n = normal();
    gl.useProgram(pCard); bindCommon(pCard);
    gl.uniform1f(pCard.uAsp, cw / ch); gl.uniform1f(pCard.uRad, 0.0376); gl.uniform3f(pCard.uN, n[0], n[1], n[2]);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texF); gl.uniform1i(pCard.uF, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texB); gl.uniform1i(pCard.uB, 1);
    // the card's edge: a slightly larger, darker copy a hair behind, so a turned card has thickness
    setQuad(rim, 0, 1.012, -1.6, n); gl.uniform1f(pCard.uRim, 1); gl.uniform3f(pCard.uRimC, 0.2, 0.12, 0.08);
    gl.bufferData(gl.ARRAY_BUFFER, rim, gl.DYNAMIC_DRAW); attribs(pCard); gl.drawArrays(gl.TRIANGLES, 0, 6);
    setQuad(quad, 0, 1, 0, n); gl.uniform1f(pCard.uRim, 0);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.DYNAMIC_DRAW); attribs(pCard); gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // ---- run while the footer is on screen ----
  var running = false, started = false, acc = 0, last = 0, ready = false;
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; acc += dt;
    var guard = 0; while (acc >= DT && guard++ < 6) { step(); acc -= DT; }
    draw();
  }
  function begin() {
    if (!ready || running || document.hidden) return;
    running = true; last = 0; requestAnimationFrame(loop);
  }
  function init() {
    texR = mkTex(ribbonCanvas('#24120c', '#d7c5a9', 'rgba(215,197,169,.35)'), true); texR2 = mkTex(ribbonCanvas('#d7c5a9', '#24120c', 'rgba(36,18,12,.35)'), true);
    drawFaces(); texF = mkTex(cvF); texB = mkTex(cvB);
    size(); ready = true; fontsReady = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { if (!started) { started = true; reset(true); } begin(); } else running = false;
      }, { rootMargin: '10% 0px' }).observe(stage);
    } else { started = true; reset(true); begin(); }
  }
  window.__epBadge = { corners: function () { return [5, 6, 7, 8].map(function (i) { return [P[i].x, P[i].y, P[i].z]; }); }, size: function () { return [W, H, D]; }, flip: function (r) { impulseSpin(r || 9); } };   // read-only helpers for testing
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // fonts first, so the faces are drawn in Playfair and Albert Sans
  whenFonts(function () { init(); });
  window.addEventListener('resize', function () { if (ready) size(); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { if (ready) size(); }).observe(fs);
  document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else if (ready) { var r = stage.getBoundingClientRect(); if (r.bottom > 0 && r.top < window.innerHeight) begin(); } });
})();
