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

  // ---- the two faces, drawn once on canvases (design units 360 x 504, drawn at 2x) ----
  var FW = 360, FH = 504, TS = 2;
  var cvF = document.createElement('canvas'), cvB = document.createElement('canvas');
  cvF.width = cvB.width = FW * TS; cvF.height = cvB.height = FH * TS;
  var emblem = null, stillRefresh = null, stillMode = false;
  (function loadEmblem() {
    var svg = document.querySelector('[data-ep-emblem]');
    if (!svg) return;
    try {
      var src = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, '#d0a77f');
      if (!/xmlns=/.test(src)) src = src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      src = src.replace(/<svg([^>]*?)width="[^"]*"/, '<svg$1width="158"').replace(/<svg([^>]*?)height="[^"]*"/, '<svg$1height="158"');
      var im = new Image();
      im.onload = function () { emblem = im; drawFront(); upload(0); if (stillRefresh) stillRefresh(); };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
    } catch (e) {}
  })();

  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function spaced(g, text, x, y, sp, align, font, color) {
    g.font = font; g.fillStyle = color; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    var w = 0, ws = [];
    for (var i = 0; i < text.length; i++) { var cw = g.measureText(text[i]).width; ws.push(cw); w += cw + (i < text.length - 1 ? sp : 0); }
    var cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    for (var j = 0; j < text.length; j++) { g.fillText(text[j], cx, y); cx += ws[j] + sp; }
    return w;
  }
  function clasp(g, light) {
    var m = g.createLinearGradient(0, 8, 0, 40);
    if (light) { m.addColorStop(0, '#b9a98f'); m.addColorStop(.5, '#7e6f58'); m.addColorStop(1, '#a89878'); } else { m.addColorStop(0, '#e1cfae'); m.addColorStop(.5, '#a58b62'); m.addColorStop(1, '#d4bd94'); }
    g.fillStyle = m; rr(g, 150, 6, 60, 32, 9); g.fill();
    g.fillStyle = 'rgba(20,10,6,.62)'; rr(g, 166, 16, 28, 11, 5.5); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; rr(g, 150.5, 6.5, 59, 31, 8.5); g.stroke();
  }
  function fins(g, light) {
    var seed = 7;
    for (var x = 14; x < FW - 14; x += 9) {
      seed = (seed * 9301 + 49297) % 233280; var h = 10 + (seed / 233280) * 26;
      var gr = g.createLinearGradient(0, FH - 14 - h, 0, FH - 14);
      if (light) { gr.addColorStop(0, 'rgba(176,96,40,.0)'); gr.addColorStop(1, 'rgba(176,96,40,.55)'); } else { gr.addColorStop(0, 'rgba(214,120,48,0)'); gr.addColorStop(1, 'rgba(214,120,48,.85)'); }
      g.fillStyle = gr; g.fillRect(x, FH - 14 - h, 4, h);
    }
  }
  function drawFront() {
    var g = cvF.getContext('2d'); g.setTransform(TS, 0, 0, TS, 0, 0); g.clearRect(0, 0, FW, FH);
    var bg = g.createLinearGradient(0, 0, FW, FH); bg.addColorStop(0, '#3a1d11'); bg.addColorStop(.55, '#24120c'); bg.addColorStop(1, '#1a0c07');
    g.fillStyle = bg; g.fillRect(0, 0, FW, FH);
    var rg = g.createRadialGradient(180, 140, 8, 180, 140, 250); rg.addColorStop(0, 'rgba(208,167,127,.2)'); rg.addColorStop(1, 'rgba(208,167,127,0)'); g.fillStyle = rg; g.fillRect(0, 0, FW, FH);
    fins(g, false);
    g.strokeStyle = 'rgba(208,167,127,.5)'; g.lineWidth = 1; rr(g, 12, 12, FW - 24, FH - 24, 20); g.stroke();
    clasp(g, false);
    if (emblem) g.drawImage(emblem, 150, 60, 60, 60);
    spaced(g, 'EPIISOD', 180, 160, 7, 'center', '500 21px "Playfair Display", serif', '#e3cfae');
    spaced(g, 'RESIDENT PASS', 180, 184, 3.4, 'center', '600 10px "Albert Sans", sans-serif', 'rgba(246,241,234,.72)');
    g.fillStyle = 'rgba(208,167,127,.45)'; g.fillRect(70, 208, 220, 1);
    spaced(g, 'WELCOME HOME,', 180, 246, 3.4, 'center', '600 10px "Albert Sans", sans-serif', '#d0a77f');
    g.textAlign = 'center';
    if (name) {
      var size = 42; g.font = '400 ' + size + 'px "Playfair Display", serif';
      while (g.measureText(name).width > 292 && size > 18) { size -= 2; g.font = '400 ' + size + 'px "Playfair Display", serif'; }
      g.fillStyle = '#f6f1ea'; g.fillText(name, 180, 298);
    } else {
      g.font = 'italic 400 32px "Playfair Display", serif'; g.fillStyle = 'rgba(246,241,234,.34)'; g.fillText('Your name', 180, 296);
    }
    spaced(g, 'MACQUARIE PARK · SYDNEY', 180, 338, 3, 'center', '600 9.5px "Albert Sans", sans-serif', 'rgba(246,241,234,.6)');
    spaced(g, 'RESIDENT SINCE 2027', 180, 358, 3, 'center', '600 9.5px "Albert Sans", sans-serif', 'rgba(246,241,234,.6)');
    // barcode
    var seed = 3, bx = 34; g.fillStyle = 'rgba(246,241,234,.78)';
    for (var i = 0; i < 38; i++) { seed = (seed * 9301 + 49297) % 233280; var bw = 1 + Math.floor((seed / 233280) * 3); g.fillRect(bx, 396, bw, 26); bx += bw + 1.6; }
    spaced(g, 'EPI-MQP-2027', 34, 440, 2.6, 'left', '600 8.5px "Albert Sans", sans-serif', 'rgba(246,241,234,.55)');
    if (!stillMode) spaced(g, 'TAP TO FLIP', FW - 34, 440, 2.6, 'right', '600 8.5px "Albert Sans", sans-serif', 'rgba(208,167,127,.85)');
  }
  // the back's buttons, in design units as drawn (hit-testing mirrors them, because the back is seen flipped)
  var BTN = { book: [36, 292, 288, 48], rooms: [36, 350, 288, 48] };
  function drawBack() {
    var g = cvB.getContext('2d'); g.setTransform(TS, 0, 0, TS, 0, 0); g.clearRect(0, 0, FW, FH);
    var bg = g.createLinearGradient(0, 0, FW, FH); bg.addColorStop(0, '#f8f4ee'); bg.addColorStop(1, '#e8dccb');
    g.fillStyle = bg; g.fillRect(0, 0, FW, FH);
    fins(g, true);
    g.strokeStyle = 'rgba(36,18,12,.35)'; g.lineWidth = 1; rr(g, 12, 12, FW - 24, FH - 24, 20); g.stroke();
    clasp(g, true);
    spaced(g, 'EPIISOD · MACQUARIE PARK', 180, 82, 3.2, 'center', '600 9.5px "Albert Sans", sans-serif', '#896d42');
    g.textAlign = 'center'; g.fillStyle = '#24120c';
    g.font = '400 34px "Playfair Display", serif'; g.fillText('Your room', 180, 136);
    g.font = 'italic 400 34px "Playfair Display", serif'; g.fillText('is waiting.', 180, 178);
    g.font = '400 13px "Albert Sans", sans-serif'; g.fillStyle = 'rgba(36,18,12,.78)';
    g.fillText('Studios, ensuites and shared apartments,', 180, 214); g.fillText('minutes from Macquarie University.', 180, 233);
    // buttons
    var b = BTN.book; g.fillStyle = '#24120c'; rr(g, b[0], b[1], b[2], b[3], 24); g.fill();
    spaced(g, 'BOOK A TOUR  →', 180, b[1] + 29, 3, 'center', '700 11px "Albert Sans", sans-serif', '#e3cfae');
    b = BTN.rooms; g.strokeStyle = '#24120c'; g.lineWidth = 1.4; rr(g, b[0], b[1], b[2], b[3], 24); g.stroke();
    spaced(g, 'VIEW ROOMS', 180, b[1] + 29, 3, 'center', '700 11px "Albert Sans", sans-serif', '#24120c');
    spaced(g, '17 LACHLAN AVE, MACQUARIE PARK', 180, 432, 2.4, 'center', '600 8.5px "Albert Sans", sans-serif', 'rgba(36,18,12,.6)');
    spaced(g, '#EPIISODLIVING', 180, 448, 3, 'center', '600 8.5px "Albert Sans", sans-serif', '#896d42');
  }
  function drawFaces() { drawFront(); drawBack(); }
  var fontsReady = false;
  function whenFonts(cb) {
    if (!document.fonts || !document.fonts.load) { cb(); return; }
    Promise.all([document.fonts.load('500 21px "Playfair Display"'), document.fonts.load('italic 400 34px "Playfair Display"'), document.fonts.load('600 10px "Albert Sans"'), document.fonts.load('700 11px "Albert Sans"')]).then(cb, cb);
  }

  // ---- a still card when motion is reduced or WebGL is missing ----
  function still() {
    stillMode = true;
    var dpr = 2, c = document.createElement('canvas'); c.width = FW * dpr; c.height = FH * dpr;
    whenFonts(function () {
      drawFaces();
      var img = new Image(); img.alt = 'EPIISOD resident pass'; img.className = 'ep-badge_still'; img.src = cvF.toDataURL('image/png');
      stage.insertBefore(img, stage.firstChild); cv.style.display = 'none';
      stillRefresh = function () { img.src = cvF.toDataURL('image/png'); };
      if (emblem) stillRefresh();
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
  var FS_RIB = 'precision mediump float;varying vec2 vUv;uniform sampler2D uT;void main(){vec3 c=texture2D(uT,vUv).rgb;float e=abs(vUv.x-0.5)*2.0;c*=0.86+0.14*(1.0-e*e);gl_FragColor=vec4(c,1.0);}';
  function prog(fsSrc) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsSrc)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    p.aPos = gl.getAttribLocation(p, 'aPos'); p.aUv = gl.getAttribLocation(p, 'aUv');
    ['uRes', 'uD', 'uF', 'uB', 'uN', 'uAsp', 'uRad', 'uRim', 'uRimC', 'uT'].forEach(function (n) { p[n] = gl.getUniformLocation(p, n); });
    return p;
  }
  var pCard = prog(FS_CARD), pRib = prog(FS_RIB);
  if (!pCard || !pRib) { gl = null; still(); return; }
  function mkTex(source) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); return t;
  }
  var texF, texB, texR;
  function upload(which) { if (!texF) return; gl.bindTexture(gl.TEXTURE_2D, which === 0 ? texF : texB); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, which === 0 ? cvF : cvB); }
  // the ribbon's strip: sand, stitched edges, the word repeated along it (64 x 256, repeating)
  function ribbonCanvas() {
    var c = document.createElement('canvas'); c.width = 64; c.height = 256; var g = c.getContext('2d');
    g.fillStyle = '#d0a77f'; g.fillRect(0, 0, 64, 256);
    g.fillStyle = '#bd9265'; g.fillRect(0, 0, 4, 256); g.fillRect(60, 0, 4, 256);
    g.strokeStyle = 'rgba(36,18,12,.35)'; g.setLineDash([5, 4]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(8, 0); g.lineTo(8, 256); g.moveTo(56, 0); g.lineTo(56, 256); g.stroke();
    g.save(); g.translate(32, 128); g.rotate(-Math.PI / 2); g.fillStyle = 'rgba(36,18,12,.62)'; g.font = '600 15px "Albert Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var t = 'EPIISOD', x = -50; for (var i = 0; i < t.length; i++) { g.fillText(t[i], x, 0); x += 17; } g.restore();
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
    cw = Math.min(300, SW * 0.7, SH * 0.52); ch = cw * 1.4;
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
    var pts = ribbonPts(), n = Math.min(pts.length, 40), hw = Math.max(7, cw * 0.028), len = 0, o = 0;
    for (var i = 0; i < n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1, nx = -ty / tl * hw, ny = tx / tl * hw;
      if (i > 0) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      var v = len / 230;
      rib[o++] = pts[i][0] - nx; rib[o++] = pts[i][1] - ny; rib[o++] = pts[i][2] - 1; rib[o++] = 0; rib[o++] = v;
      rib[o++] = pts[i][0] + nx; rib[o++] = pts[i][1] + ny; rib[o++] = pts[i][2] - 1; rib[o++] = 1; rib[o++] = v;
    }
    gl.useProgram(pRib); bindCommon(pRib);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texR); gl.uniform1i(pRib.uT, 2);
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
    gl.uniform1f(pCard.uAsp, cw / ch); gl.uniform1f(pCard.uRad, 0.075); gl.uniform3f(pCard.uN, n[0], n[1], n[2]);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texF); gl.uniform1i(pCard.uF, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texB); gl.uniform1i(pCard.uB, 1);
    // the card's edge: a slightly larger, darker copy a hair behind, so a turned card has thickness
    setQuad(rim, 0, 1.012, -1.6, n); gl.uniform1f(pCard.uRim, 1); gl.uniform3f(pCard.uRimC, 0.26, 0.18, 0.12);
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
    texR = mkTex(ribbonCanvas());
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
