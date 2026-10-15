/* Wellness ring: after "Live well, study better" fills the screen, scrolling on shrinks that video onto the front panel of
   a ring of the wellness amenities, seen from outside (the pictures sit on the ring's outer face), while the backdrop
   turns white. From then on the ring is a normal section: back / next chevrons (and swipes, and the arrow keys) turn it,
   and the page scroll simply carries on past it. Each panel is an amenity photo with a slow Ken Burns drift; any panel
   can switch to a video by giving it a `video` path. Drawn with WebGL so the panels curve smoothly. */
(function () {
  var RV = window.__epRv;
  if (!RV || !RV.ring) return;
  var sec = RV.sec, pin = sec.querySelector('.ep-rv_pin'), html = document.documentElement;
  var PANELS = [
    { img: '/assets/amenities/gym.webp', h: 'Fitness Gym', p: 'A bright, fully equipped gym with floor-to-ceiling windows and skyline views, to keep you training your way.' },
    { img: '/assets/amenities/sauna.webp', h: 'Sauna', p: 'Warm timber and soft light: a quiet place to recharge after study and training.' },
    { img: '/assets/amenities/ice-bath.webp', h: 'Ice Bath', p: 'Cold-plunge recovery to reset your body and mind after a workout.' },
    { img: '/assets/amenities/studio.webp', h: 'Yoga Studio', p: 'A light-filled yoga studio with mats, balls and rollers for stretching, mobility and calm.' },
    { img: '/assets/amenities/pool.webp', h: 'Rooftop Pool & Terrace', p: 'A rooftop pool with sun loungers, striped umbrellas and open city views: made for long afternoons and evenings with friends.' }
  ];
  var N = PANELS.length, STEP = 2 * Math.PI / N, GAP = 0.09, R = 1;
  var ARC = STEP - GAP, PH = (ARC * R) / 1.62;                 // each panel roughly 16:10 along its curve
  var TRANS = RV.ring - 0.25;                                  // scroll (in screens) spent shrinking the video onto the ring

  // ---- stage + copy + controls ----------------------------------------------------------------------------------------
  var chev = function (d) { return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5') + '" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
  var stage = document.createElement('div');
  stage.className = 'ep-ring';
  stage.innerHTML = '<div class="ep-ring_bg"></div><canvas class="ep-ring_cv" aria-hidden="true"></canvas>' +
    '<div class="ep-ring_side"><p class="ep-ring_kicker">Wellness amenities</p><div class="ep-ring_copy"></div>' +
    '<div class="ep-ring_nav"><button type="button" class="ep-ring_btn" data-go="-1" aria-label="Previous amenity">' + chev(-1) + '</button>' +
    '<span class="ep-ring_count" aria-live="polite"></span>' +
    '<button type="button" class="ep-ring_btn" data-go="1" aria-label="Next amenity">' + chev(1) + '</button></div></div>';
  pin.appendChild(stage);
  // the "Live well, study better" words ride on top of the ring (a copy, so the original stays under it) and fade as the
  // video pulls back; scrolling back up brings them in again over the returning video
  var rvCopy = sec.querySelector('.ep-rv_copy'), words = null;
  if (rvCopy) {
    words = rvCopy.cloneNode(true); words.setAttribute('aria-hidden', 'true'); words.style.pointerEvents = 'none';
    [].forEach.call(words.querySelectorAll('a, button'), function (n) { n.setAttribute('tabindex', '-1'); n.style.pointerEvents = 'none'; });
    stage.insertBefore(words, stage.querySelector('.ep-ring_side'));
  }
  var cv = stage.querySelector('canvas'), bgEl = stage.querySelector('.ep-ring_bg'), side = stage.querySelector('.ep-ring_side');
  var copyEl = stage.querySelector('.ep-ring_copy'), countEl = stage.querySelector('.ep-ring_count');
  copyEl.innerHTML = PANELS.map(function (p, i) {
    return '<div class="ep-ring_t" data-i="' + i + '"><h3 class="ep-ring_h">' + p.h + '</h3><p class="ep-ring_p">' + p.p + '</p></div>';
  }).join('');
  var copies = [].slice.call(copyEl.children);
  var gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true }) || cv.getContext('experimental-webgl');
  if (!gl) { stage.remove(); return; }

  // ---- media: photos now, videos later (set p.video) ------------------------------------------------------------------
  var revealVideo = sec.querySelector('[data-rv-video]');
  var armed = false;
  function arm() {
    if (armed) return; armed = true;
    PANELS.forEach(function (p) {
      if (p.video) {
        var v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.src = p.video; p.el = v;
      } else { var im = new Image(); im.decoding = 'async'; im.src = p.img; p.el = im; }
    });
  }
  new IntersectionObserver(function (es) { if (es[0].isIntersecting) arm(); }, { rootMargin: '150% 0px' }).observe(sec);

  // ---- GL ---------------------------------------------------------------------------------------------------------------
  var VS = 'attribute vec3 p;attribute vec2 uv;uniform mat4 m;varying vec2 v;void main(){v=uv;gl_Position=m*vec4(p,1.);}';
  var FS = 'precision mediump float;varying vec2 v;uniform sampler2D t,t2;uniform float lit,has,mx,zoom;uniform vec2 pan;' +
    'void main(){vec2 q=vec2(v.x,1.-v.y);vec2 k=(q-.5)/zoom+.5+pan;' +
    'vec3 a=has>.5?texture2D(t,k).rgb:vec3(.86,.83,.8);vec3 b=texture2D(t2,q).rgb;vec3 c=mix(a,b,mx);' +
    'if(gl_FrontFacing){gl_FragColor=vec4(c*lit,1.);}else{vec2 k2=(vec2(1.-v.x,1.-v.y)-.5)/zoom+.5+pan;vec3 d=has>.5?texture2D(t,k2).rgb:vec3(.8);gl_FragColor=vec4(mix(d*.28,vec3(1.),.12),1.);}}';
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { stage.remove(); return; }
  gl.useProgram(prog);
  var aP = gl.getAttribLocation(prog, 'p'), aUV = gl.getAttribLocation(prog, 'uv');
  var U = {}; ['m', 'lit', 'has', 'mx', 'zoom', 'pan', 't', 't2'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform1i(U.t, 0); gl.uniform1i(U.t2, 1);
  function tex() {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([200, 190, 180]));
    return t;
  }
  var revealTex = tex();
  // panels sit on the OUTER face: panel i is centred at angle i*STEP (angle 0 faces the camera on +z); triangles wind
  // anticlockwise as seen from outside, so the front face is the picture side
  var SEG = 30;
  PANELS.forEach(function (p, i) {
    var a0 = i * STEP - ARC / 2, d = [];
    function pt(a, y, u) { return [Math.sin(a) * R, y, Math.cos(a) * R, u, y > 0 ? 1 : 0]; }
    for (var s = 0; s < SEG; s++) {
      var t0 = a0 + ARC * s / SEG, t1 = a0 + ARC * (s + 1) / SEG, u0 = s / SEG, u1 = (s + 1) / SEG;
      var lb = pt(t0, -PH / 2, u0), rb = pt(t1, -PH / 2, u1), lt = pt(t0, PH / 2, u0), rt = pt(t1, PH / 2, u1);
      d.push.apply(d, lb.concat(rb, lt, rb, rt, lt));
    }
    p.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, p.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(d), gl.STATIC_DRAW);
    p.count = d.length / 5; p.tex = tex(); p.has = false;
    p.kb = { t0: i * 2.7, dir: i % 2 ? 1 : -1 };
  });
  gl.enable(gl.DEPTH_TEST);

  // ---- matrices ---------------------------------------------------------------------------------------------------------
  function persp(fov, asp, n, f) { var t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; }
  function look(e, c) {
    var z = norm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = norm(cross([0, 1, 0], z)), y = cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
  }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; }
  function mul(a, b) { var o = new Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sm(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerp3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

  // ---- cameras: CLOSE fills the screen with the front panel (to take over from the full-screen video); REST is the
  // section's framing: the front panel large (right of centre on wide screens, upper part on phones), its neighbours
  // curving away into the white
  function camClose(asp) {
    var fov = 0.5, half = Math.tan(fov / 2), need = Math.min((PH / 2) / half, (Math.sin(ARC / 2) * R) / (half * asp));
    return { e: [0, 0, R + need * 0.9], c: [0, 0, 0], fov: fov };
  }
  function camRest(asp) {
    // phones: far enough back that the neighbouring panels curve in at both edges, so it reads as a ring
    if (asp < 0.9) return { e: [0, -0.56, 4.8], c: [0, -0.32, 0], fov: 0.9 };
    return { e: [-0.5, 0.04, 3.7], c: [-0.5, 0, 0], fov: 0.5 };
  }

  // ---- turning: drag to turn the ring (mouse or finger), it follows the pointer, coasts on release and settles on the
  // nearest panel; chevrons, arrow keys and swipes do the same one panel at a time ------------------------------------
  var cur = 0, ang = 0, tw = null, drag = null, vel = 0;
  var tilt = { p: 0, l: 0, tp: 0, tl: 0, hx: 0, hy: 0, speed: 0 };   // pitch / lean now and as targets; hover offset; recent drag speed
  function nearest(a) { var k = Math.round(-a / STEP) % N; return (k + N) % N; }
  function sync() {
    countEl.textContent = '0' + (cur + 1) + ' / 0' + N;
    copies.forEach(function (c, i) { c.classList.toggle('is-on', i === cur); c.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); });
  }
  function settle(to, dur) { tw = { from: ang, to: to, t0: performance.now(), dur: dur }; }
  function go(k) {
    k = ((k % N) + N) % N;
    var d = k - nearest(ang); if (d > N / 2) d -= N; if (d < -N / 2) d += N;
    if (!d) return;
    settle(Math.round(ang / STEP) * STEP - d * STEP, 950);
  }
  sync();
  stage.querySelector('.ep-ring_nav').addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) go(nearest(ang) + +b.getAttribute('data-go')); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (!stage.classList.contains('is-rest')) return;
    var r = sec.getBoundingClientRect(); if (r.bottom < window.innerHeight * 0.7) return;
    go(nearest(ang) + (e.key === 'ArrowRight' ? 1 : -1));
  });
  // dragging: one front-panel width of pointer travel turns the ring one step, so the picture under the finger follows it
  function pxPerStep() { return vw * (vw / vh < 0.9 ? 0.85 : 0.4); }
  stage.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button') || !stage.classList.contains('is-rest')) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, a0: ang, on: false, last: e.clientX, lt: performance.now(), v: 0, touch: e.pointerType !== 'mouse' };
  });
  window.addEventListener('pointermove', function (e) {
    var now = performance.now();
    if (cur$ && e.pointerType === 'mouse') { cursorMove(e); }
    if (e.pointerType === 'mouse' && stage.classList.contains('is-rest')) {      // hover: the ring leans a little towards the pointer
      var rr = pin.getBoundingClientRect(); tilt.hx = ((e.clientX - rr.left) / rr.width - 0.5) * 2; tilt.hy = ((e.clientY - rr.top) / rr.height - 0.5) * 2;
    }
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dx) < 6 || (drag.touch && Math.abs(dx) < Math.abs(dy) * 1.1)) { if (drag.touch && Math.abs(dy) > 14) drag = null; return; }
      drag.on = true; tw = null; stage.classList.add('is-drag'); try { stage.setPointerCapture(e.pointerId); } catch (x) {}
    }
    ang = drag.a0 + dx / pxPerStep() * STEP;
    // tilt: pulling up / down tips the ring towards or away from you; sideways speed makes it lean into the turn
    if (!drag.touch) tilt.tp = Math.max(-1, Math.min(1, dy / (vh * 0.55))) * 0.34;
    var dt = Math.max(1, now - drag.lt); drag.v = 0.8 * drag.v + 0.2 * ((e.clientX - drag.last) / pxPerStep() * STEP) / (dt / 1000); drag.last = e.clientX; drag.lt = now;
    tilt.tl = Math.max(-0.3, Math.min(0.3, drag.v * 0.07));
    var k = nearest(ang); if (k !== cur) { cur = k; sync(); }
  });
  function release(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var d = drag; drag = null; stage.classList.remove('is-drag'); tilt.tp = 0; tilt.tl = 0;
    if (!d.on) return;
    var v = Math.max(-6, Math.min(6, d.v)), to = Math.round((ang + v * 0.22) / STEP) * STEP;   // coast a little, then settle
    var steps = Math.abs(to - ang) / STEP;
    cur = nearest(to); sync();
    settle(to, 420 + 360 * Math.min(2, steps));
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  // a ring-shaped cursor with "Drag" while the pointer is over the ring (desktop)
  var cur$ = null;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cur$ = document.createElement('div'); cur$.className = 'ep-ring_cur'; cur$.innerHTML = '<span>Drag</span>'; document.body.appendChild(cur$);
    stage.addEventListener('pointerleave', function () { cur$.classList.remove('is-on'); tilt.hx = 0; tilt.hy = 0; });
  }
  function cursorMove(e) {
    var over = stage.classList.contains('is-rest') && stage.contains(e.target) && !e.target.closest('button');
    cur$.classList.toggle('is-on', over); cur$.classList.toggle('is-down', !!(drag && drag.on));
    cur$.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
  }

  // ---- render -----------------------------------------------------------------------------------------------------------
  var vw = 0, vh = 0;
  // phones and tablets: the hand-off follows the finger through a smoothing glide with a speed limit (the whole thing
  // takes at least 0.7 s however hard the flick), so it tracks the scroll without jumping
  var TOUCH = sec.classList.contains('ep-rv--touch'), tA = { v: 0, last: 0 };
  var lastSW = 0;
  function size() {
    if (TOUCH && lastSW && pin.clientWidth === lastSW) return;    // the address bar moving is not a resize worth a redraw
    lastSW = pin.clientWidth;
    vw = pin.clientWidth; vh = pin.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, vw / vh < 0.9 ? 1.5 : 1.75);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  }
  size(); window.addEventListener('resize', size);

  function frame(now) {
    var rect = sec.getBoundingClientRect();
    var pr = (-rect.top) / vh - RV.hold;
    var on = pr > -0.02 && rect.bottom > 0;
    var t;
    if (TOUCH) {
      var dtt = Math.min(0.05, Math.max(0.001, (now - (tA.last || now)) / 1000 || 0.016)); tA.last = now;
      var stp = (clamp(pr / TRANS) - tA.v) * (1 - Math.exp(-dtt / 0.1)), capT = dtt / 0.7;
      tA.v += Math.max(-capT, Math.min(capT, stp));
      on = (pr > -0.02 || tA.v > 0.001) && rect.bottom > 0;
      sec.classList.toggle('rv-covered', tA.v > 0.985);
      sec.classList.toggle('rv-ringing', tA.v > 0.01);           // the ring's own copy of the words takes over from the originals
    }
    stage.classList.toggle('is-on', on);
    html.classList.toggle('ep-in-ring', on && rect.bottom > vh * 0.4);
    if (!on) return;
    // phones: two steps, in this order going down and mirrored coming back up. First (0-28%) the full-screen video and
    // the front panel cross-fade at full size; then (28-100%) the panel shrinks back into its place on the ring
    var XF = 0.28;
    t = TOUCH ? sm(clamp((tA.v - XF) / (1 - XF))) : sm(clamp(pr / TRANS)); var asp = vw / vh;
    stage.classList.toggle('is-rest', t > 0.97);
    // phones: the ring layer stays up for the whole timed hand-off in both directions (the front panel widens back to the
    // full-screen video and dissolves into it), and only lets go once that has finished
    stage.style.opacity = (TOUCH ? sm(clamp(tA.v / 0.03)) : sm(clamp(pr / 0.06))).toFixed(3);
    bgEl.style.opacity = sm(clamp((t - 0.1) / 0.5)).toFixed(3);           // the backdrop whitens as the video pulls back
    if (words) words.style.opacity = (TOUCH ? 1 - sm(clamp(tA.v / XF)) : 1 - sm(clamp(t / 0.3))).toFixed(3);
    side.style.setProperty('--in', sm(clamp((t - 0.72) / 0.28)).toFixed(3));
    var A = camClose(asp), B = camRest(asp);
    var cam = { e: lerp3(A.e, B.e, t), c: lerp3(A.c, B.c, t), fov: lerp(A.fov, B.fov, t) };
    if (tw) {
      var u = clamp((now - tw.t0) / tw.dur), e3 = 1 - Math.pow(1 - u, 3);       // eases out, so a flick coasts to rest
      ang = lerp(tw.from, tw.to, e3); if (u >= 1) { ang = tw.to; tw = null; }
      var nk = nearest(ang); if (nk !== cur) { cur = nk; sync(); }
    }
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var dtf = Math.min(0.05, Math.max(0.001, (now - (frame.__t || now)) / 1000)); frame.__t = now;
    var kf = 1 - Math.exp(-dtf / (drag && drag.on ? 0.08 : 0.35));                // quick while dragging, a slow settle after
    var G = window.__epGyro, gx = G && G.on ? G.gx : 0, gy = G && G.on ? G.gy : 0;                  // phone tilt (gyro), when allowed
    var pitchT = (drag && drag.on ? tilt.tp : 0) + (drag ? 0 : -tilt.hy * 0.09) + gy * 0.17, leanT = (drag && drag.on ? tilt.tl : 0) + (drag ? 0 : tilt.hx * 0.14) + gx * 0.17;
    tilt.p += (pitchT - tilt.p) * kf; tilt.l += (leanT - tilt.l) * kf;
    var t3 = sm(clamp((t - 0.8) / 0.2));                                            // no tilt while the video is still arriving
    var ce = [cam.e[0] + gx * 0.2 * t3, cam.e[1] - gy * 0.12 * t3, cam.e[2]];                  // parallax: the camera drifts with the phone
    gl.uniformMatrix4fv(U.m, false, new Float32Array(mul(mul(mul(persp(cam.fov, asp, 0.05, 30), look(ce, cam.c)), rotX(tilt.p * t3)), rotY(ang + tilt.l * t3))));
    // the reveal's video rides on the front panel while it shrinks, then gives way to that panel's own picture
    var mixFront = TOUCH ? 1 - sm(clamp(tA.v / XF)) : 1 - sm(clamp((t - 0.3) / 0.68));                       // a long, slow cross-dissolve between the video and the panel
    if (mixFront > 0 && revealVideo && revealVideo.readyState >= 2) {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, revealTex);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, revealVideo); } catch (e) {}
    }
    PANELS.forEach(function (p, i) {
      var src = p.el;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, p.tex);
      var isVid = src && src.tagName === 'VIDEO';
      var ready = src && (isVid ? src.readyState >= 2 : src.complete && src.naturalWidth);
      if (ready && (!p.has || isVid)) { try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src); p.has = true; } catch (e) {} }
      // Ken Burns on photos: a slow zoom with a slight drift, different for each panel
      var k = ((now / 1000 + p.kb.t0) % 16) / 16, z = isVid ? 1 : 1.05 + 0.1 * (0.5 - 0.5 * Math.cos(2 * Math.PI * k));
      gl.uniform1f(U.zoom, z); gl.uniform2f(U.pan, p.kb.dir * 0.022 * Math.sin(2 * Math.PI * k), 0.01 * Math.cos(2 * Math.PI * k));
      // the panel at the front is full brightness, the others a touch softer
      var a = ((i * STEP + ang) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      gl.uniform1f(U.lit, lerp(1, 0.22, sm(Math.abs(a) / (STEP * 0.85))));   // the panel in front stays bright; every other one falls into shadow
      gl.uniform1f(U.has, p.has ? 1 : 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, revealTex);
      gl.uniform1f(U.mx, i === cur ? mixFront : 0);                          // whichever panel is in front hands over to / from the video
      gl.bindBuffer(gl.ARRAY_BUFFER, p.buf);
      gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(aUV); gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 20, 12);
      gl.drawArrays(gl.TRIANGLES, 0, p.count);
      if (isVid && src.paused) { var q = src.play(); if (q && q.catch) q.catch(function () {}); }
    });
  }
  var running = false;
  function loop(now) { if (!running) return; frame(now); requestAnimationFrame(loop); }
  new IntersectionObserver(function (es) {
    var vis = es[0].isIntersecting;
    if (vis && !running) { running = true; requestAnimationFrame(loop); }
    else if (!vis) { running = false; html.classList.remove('ep-in-ring'); PANELS.forEach(function (p) { if (p.el && p.el.tagName === 'VIDEO') p.el.pause(); }); }
  }, { rootMargin: '20% 0px' }).observe(sec);
  window.__epRing = { go: go, t: function () { return tA.v; } };
})();
