/* Motion sensing for touch devices: tilting the phone moves the "Live well, study better" circle and the wellness ring
   in 3D. This module only reads the sensors and publishes the result as window.__epGyro = { gx, gy, on } (each -1..1,
   smoothed, relative to how the phone was held) and as the CSS variables --gx / --gy on <html>. Android sends sensor
   events freely; iPhone needs one tap on the "Enable 3D motion" pill (Apple's permission prompt), after which it is
   remembered for the visit. */
(function () {
  if (!matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('DeviceOrientationEvent' in window)) return;
  var html = document.documentElement;
  var G = window.__epGyro = { gx: 0, gy: 0, on: false };
  var raw = { b: null, g: null }, base = { b: null, g: null }, sm = { x: 0, y: 0 }, last = 0, running = false;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  function onOrient(e) {
    if (e.beta == null || e.gamma == null) return;
    var b = e.beta, g = e.gamma, a = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    if (a === 90 || a === -270) { var t = b; b = -g; g = t; } else if (a === 270 || a === -90) { var t2 = b; b = g; g = -t2; }
    if (raw.b == null) { try { sessionStorage.setItem('epGyro', '1'); } catch (x) {} }            // events really flow: remember it for the visit
    raw.b = b; raw.g = g;
    if (base.b == null) { base.b = b; base.g = g; }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  function loop(now) {
    if (document.hidden) { running = false; return; }
    var dt = Math.min(0.1, Math.max(0.001, (now - (last || now)) / 1000)); last = now;
    // the neutral pose follows the phone slowly, so how it is held doesn't matter, only movement does
    var k0 = 1 - Math.exp(-dt / 6);
    base.b += (raw.b - base.b) * k0; base.g += (raw.g - base.g) * k0;
    var tx = clamp((raw.g - base.g) / 26, -1, 1), ty = clamp((raw.b - base.b) / 26, -1, 1);
    var k = 1 - Math.exp(-dt / 0.12);
    sm.x += (tx - sm.x) * k; sm.y += (ty - sm.y) * k;
    G.gx = sm.x; G.gy = sm.y; G.on = true;
    html.style.setProperty('--gx', sm.x.toFixed(3)); html.style.setProperty('--gy', sm.y.toFixed(3));
    requestAnimationFrame(loop);
  }
  var listening = false;
  function listen() { if (!listening) { listening = true; window.addEventListener('deviceorientation', onOrient, true); } }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && raw.b != null && !running) { running = true; last = 0; requestAnimationFrame(loop); } });

  // listen straight away: Android (and desktop Chrome with a sensor) deliver events with no prompt. If nothing arrives and the
  // browser offers requestPermission (iPhone), show the "Enable" pill instead.
  var hasAsk = typeof DeviceOrientationEvent.requestPermission === 'function';
  var granted = false; try { granted = sessionStorage.getItem('epGyro') === '1'; } catch (e) {}
  listen();
  if (hasAsk && granted) { DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') listen(); }).catch(function () {}); }
  if (!hasAsk) return;
  setTimeout(function () {
    if (raw.b != null) return;                                   // events are flowing: no permission step needed
    var pill = document.createElement('button');
    pill.type = 'button'; pill.className = 'ep-gyro_pill'; pill.hidden = true;
    pill.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4.5" y="1.5" width="7" height="13" rx="1.6" stroke="currentColor" stroke-width="1.2"/><path d="M2 5.5v5M14 5.5v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg><span>Tilt your phone in 3D</span><b>Enable</b>';
    document.body.appendChild(pill);
    pill.addEventListener('click', function () {
      DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') listen(); pill.hidden = true; pill.__done = true; }).catch(function () { pill.hidden = true; pill.__done = true; });
    });
    var near = document.querySelector('#reveal');
    if (near && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { if (!pill.__done) pill.hidden = !es[0].isIntersecting; }, { threshold: 0.2 }).observe(near);
  }, 1500);
})();
