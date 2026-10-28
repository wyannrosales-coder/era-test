/* Rooms magazine. Desktop: a book whose pages turn on click. Phones and tablets: the cover, then a full-screen flipbook that
   folds each page across the middle of the screen. Content comes from epiisod.com (Macquarie Park room pages). */
(function () {
  var sec = document.getElementById('rooms');
  if (!sec) return;
  var pin = sec.querySelector('[data-rooms-pin]');
  if (!pin) return;
  var BASE = 'https://epiisod.com/sydney/epiisod-macquarie-park/';
  var IMG = '/assets/rooms/mag/';
  var COMMON = ['Air con', 'WiFi', 'Storage', 'Microwave', 'Study desk & chair', 'Fridge', 'Cooktop', 'Range hood', 'Television', 'Kettle', 'Rice cooker & toaster', 'Smart door access'];

  var R = [
    { slug: 'quad-4-bedroom-ensuite', img: 'quad', name: 'Quad', full: 'Quad 4 Bedroom Ensuite', kind: 'Shared Apartment', price: '615', unit: 'per person / week',
      sqm: '11.8', sqm2: '84.5', bed: 'King Single', views: 'Four ensuite bedrooms', extra: ['Dishwasher'],
      desc: 'The Quad is a shared apartment in Sydney Macquarie Park, featuring four individually secure ensuite bedrooms connected by a well-appointed shared kitchen and living area, thoughtfully designed for study, dining, and relaxation.',
      quote: 'The perfect balance of privacy and camaraderie.' },
    { slug: 'quint-5-bedroom-ensuite', img: 'quint', name: 'Quint', full: 'Quint 5 Bedroom Ensuite', kind: 'Shared Apartment', price: '615', unit: 'per person / week',
      sqm: '11.8', sqm2: '100.9', bed: 'King Single', views: 'Five ensuite bedrooms', extra: ['Dishwasher'],
      desc: 'The Quint is a shared apartment in Macquarie Park, Sydney, offering five ensuite bedrooms arranged around a spacious, stylishly designed common area with a modern kitchen and living hall.',
      quote: 'Five ensuite bedrooms arranged around a spacious, stylishly designed common area.' },
    { slug: 'signature-studio', img: 'sig', name: 'Signature Studio', full: 'Signature Studio', kind: 'Studio', price: '725', unit: 'per week',
      sqm: '15.8', bed: 'Double bed', views: 'Garden · Urban · Pool · City', viewsNote: 'Levels 1–9, outward-facing urban landscape views.', extra: [],
      desc: 'The Signature Studio is the cornerstone of the EPIISOD collection, our most sought-after room type, offering well-planned private space with elegant simplicity. Featuring refined finishes, ample storage, and a large window, for those who value a space designed to support their lifestyle and academic focus.',
      quote: 'Well-planned private space with elegant simplicity.' },
    { slug: 'signature-studio-flex', img: 'flex', name: 'Signature Studio Flex', full: 'Signature Studio Flex', kind: 'Studio', price: '727', unit: 'per week',
      sqm: '15.5', bed: 'Double bed', views: 'One bedroom studio', extra: [],
      desc: 'A variation of our classic Signature Studio, offering a more traditional square layout with a large window, tastefully furnished to meet your personal needs while leaving you the flexibility to style it.',
      quote: 'Ready to add personalised touches to make the space their own.' },
    { slug: 'aspect-studio', img: 'aspect', name: 'Aspect Studio', full: 'Aspect Studio', kind: 'Corner Studio', price: '745', unit: 'per week',
      sqm: '18.0', bed: 'Double bed', views: 'Garden · Urban · Pool · City', viewsNote: 'Levels 1–9, outward-facing urban landscape views.', extra: [],
      desc: 'Exclusively located at the corners of each floor, the Aspect Studio offers exceptional natural light and cross-ventilation, with refined finishes, ample storage and a large window for those who value privacy and elevation.',
      quote: 'Exceptional natural light and cross-ventilation.' },
    { slug: 'aspect-studio-e', img: 'aspecte', name: 'Aspect Studio E', full: 'Aspect Studio E', kind: 'Studio', price: '840', unit: 'per week',
      sqm: '20.5', bed: 'Double bed', views: 'Garden · Pool', viewsNote: 'Levels 1–9, inward-facing central garden views.', extra: [],
      desc: 'The Aspect Studio E combines modern aesthetics with thoughtful, inclusive design, offering generous space for accessibility and comfort: a personal retreat for students who want room to breathe.',
      quote: 'Modern aesthetics with thoughtful, inclusive design.' },
    { slug: 'empowered-studio', img: 'emp', name: 'Empowered Studio', full: 'Empowered Studio', kind: 'Empowered Collection', price: '873', unit: 'per week',
      sqm: '25.6', bed: 'Double bed', views: 'Inward garden views', extra: [], second: 'A second occupant is an additional $60 per week (student with a valid student ID).',
      desc: 'The Empowered Studio offers one of the widest floor plans, with generous living space, enabled accessibility, and refined comfort to meet your every need. Framed by inward garden views, settle into a holistic balance of openness and quietude.',
      quote: 'Live independently without limitation, with a sophisticated, inspirational outlook.' },
    { slug: 'premier-empowered-studio', img: 'prem', name: 'Premier Empowered Studio', full: 'Premier Empowered Studio', kind: 'Empowered Collection', price: '893', unit: 'per week',
      sqm: '31.1', bed: 'Double bed', views: 'DDA compliant', extra: [], second: 'A second occupant is an additional $60 per week (student with a valid student ID).',
      desc: 'Reserved for the discerning few who value privacy, spaciousness, and understated comfort in every detail. A class of its own, with exceptional finishes, bespoke furnishings, an expansive layout for movement and mobility needs, and a larger bathroom with accessibility aids.',
      quote: 'Reserved for the discerning few.' }
  ];
  R.forEach(function (r, i) {
    r.i = i; r.no = ('0' + (i + 1)).slice(-2);
    r.feat = [r.bed].concat(COMMON, r.extra || []);
    r.url = BASE + r.slug;
  });

  function pad(n) { return ('0' + n).slice(-2); }
  function ph(r, n, st, cls) { return '<figure class="mg-ph ' + (cls || '') + '" style="' + st + '"><img src="' + IMG + r.img + '-' + n + '.webp?v=4" alt="' + r.full + '" draggable="false"></figure>'; }
  function pq(t, sz) { return '<blockquote class="mg-pq hd" style="font-size:' + (sz || 5) + 'cqw">' + t + '</blockquote>'; }
  function fo(no, side, cls) { return '<div class="mg-fo ' + side + ' ' + (cls || '') + '"><span>' + pad(no) + '</span><span>EPIISOD · Rooms</span></div>'; }
  function lk(r) { return '<a class="mg-lk" href="' + r.url + '" target="_blank" rel="noopener" draggable="false">Explore room <i>→</i></a>'; }
  function pr(r, sz) { return '<div class="mg-pr"><small>From</small><b class="hd" style="font-size:' + (sz || 6) + 'cqw">AU$' + r.price + '</b><small>' + r.unit + '</small></div>'; }
  function sp(num, lab, sz) { return '<div class="mg-sp"><b class="hd" style="font-size:' + (sz || 5.4) + 'cqw">' + num + '</b><small>' + lab + '</small></div>'; }
  function ft(list, cols) { return '<ul class="mg-ft" style="column-count:' + (cols || 2) + '">' + list.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>'; }
  var OFFER = 'Up to $40/week transport allowance · Pay in full, save $500 · Up to 2 weeks free on 52-week contracts';

  // ---- page layouts: one pair (left page, right page) per room, each spread composed differently ----
  var T = [
    // 01 Quad: photograph left, classic title page right
    function (r, pl, pr_) {
      return {
        L: ['t-choc', ph(r, 1, 'inset:0') + '<div class="mg-grad"></div>' + ph(r, 2, 'right:7cqw;top:8cqw;width:28cqw;height:36cqw;border:1.2cqw solid #f4f2f0;box-shadow:0 2cqw 5cqw rgba(0,0,0,.25)') + '<div class="hd mg-num" style="left:6cqw;top:6cqw;font-size:40cqw;color:#f4f2f0">' + r.no + '</div>' +
          '<div class="mg-cap" style="left:8cqw;bottom:13cqw;width:70cqw"><span class="eb">' + r.kind + '</span><p class="hd" style="font-size:4.6cqw;line-height:1.2;margin:2cqw 0 0;font-style:italic">' + r.quote + '</p></div>' + fo(pl, 'l', 'on-ph')],
        R: ['t-pearl', '<div class="mg-col"><span class="eb">' + r.kind + ' · 4 bedrooms</span><h3 class="hd" style="font-size:30cqw;margin:5cqw 0 0;letter-spacing:-.03em">' + r.name + '</h3>' +
          '<div class="hd" style="font-size:5.2cqw;font-style:italic;margin:1cqw 0 0">4 Bedroom Ensuite</div><hr class="mg-hr"><p class="tx mg-drop">' + r.desc + '</p>' +
          '<div class="mg-row" style="margin-top:4cqw;gap:2cqw;flex:none">' + ph(r, 3, 'position:relative;flex:1;height:15cqw') + ph(r, 4, 'position:relative;flex:1;height:15cqw') + '</div>' +
          '<div class="mg-row" style="margin-top:auto;padding-top:3cqw">' + sp(r.sqm, 'sqm · room') + sp(r.sqm2, 'sqm · apartment') + sp('King', 'single bed') + '</div>' +
          '<div class="mg-row mg-end" style="margin-top:6cqw">' + pr(r) + lk(r) + '</div></div>' + fo(pr_, 'r')]
      };
    },
    // 02 Quint: sand typographic page, photo mosaic right
    function (r, pl, pr_) {
      return {
        L: ['t-sand', '<div class="hd mg-vert" style="font-size:24cqw;left:5cqw;top:6cqw;color:#24120c">' + r.name + '</div>' +
          '<div class="mg-col" style="padding-left:34cqw;padding-right:7cqw"><span class="eb">' + r.kind + ' · ' + r.no + '</span>' + pq(r.quote, 5) + '<hr class="mg-hr" style="margin:5cqw 0">' +
          '<span class="eb" style="margin-bottom:2.5cqw;display:block">In the room</span>' + ft(r.feat, 2) + '</div>' + fo(pl, 'l')],
        R: ['t-pearl', ph(r, 1, 'left:0;right:0;top:0;height:54%') + ph(r, 2, 'left:0;width:32.4%;top:54.8%;height:26%') + ph(r, 3, 'left:33.8%;width:32.4%;top:54.8%;height:26%') + ph(r, 4, 'right:0;width:32.4%;top:54.8%;height:26%') +
          '<div class="mg-row mg-end" style="position:absolute;left:8cqw;right:8cqw;bottom:11cqw"><div><b class="hd" style="font-size:5cqw;font-weight:400">' + r.full + '</b><small class="mg-sub">Five ensuite bedrooms · 11.8 sqm room · 100.9 sqm apartment</small></div>' + lk(r) + '</div>' + fo(pr_, 'r')]
      };
    },
    // 03 Signature: collage left, chocolate editorial right
    function (r, pl, pr_) {
      return {
        L: ['t-pearl', ph(r, 1, 'left:9cqw;top:9cqw;width:60cqw;height:80cqw') + ph(r, 2, 'right:7cqw;bottom:14cqw;width:44cqw;height:56cqw;border:1.6cqw solid #f4f2f0;box-shadow:0 2cqw 5cqw rgba(36,18,12,.18)') + ph(r, 3, 'right:7cqw;top:9cqw;width:21cqw;height:27cqw;border:1.2cqw solid #f4f2f0;box-shadow:0 2cqw 5cqw rgba(36,18,12,.15)') +
          '<div class="hd mg-num" style="left:8cqw;bottom:6cqw;font-size:22cqw;line-height:.7;-webkit-text-stroke:.25cqw #24120c;color:transparent">' + r.no + '</div>' +
          '<p class="eb" style="position:absolute;left:9cqw;top:92cqw;width:50cqw;line-height:1.8">The cornerstone of the collection</p>' + fo(pl, 'l')],
        R: ['t-choc', '<div class="mg-col"><span class="eb" style="color:#d0a77f">' + r.views + '</span><h3 class="hd" style="font-size:14cqw;margin:8cqw 0 0;letter-spacing:-.02em">Signature<br><i>Studio</i></h3>' +
          '<p class="tx" style="margin-top:7cqw">' + r.desc + '</p>' + ph(r, 4, 'position:relative;width:100%;height:14cqw;flex:none;margin-top:4cqw', 'f-sig4') +
          '<div class="mg-row" style="margin-top:auto">' + sp(r.sqm, 'sqm') + sp('Double', 'bed') + sp('1–9', 'levels') + '</div>' +
          '<div class="mg-row mg-end" style="margin-top:7cqw">' + pr(r, 7.4) + lk(r) + '</div></div>' + fo(pr_, 'r')]
      };
    },
    // 04 Flex: spec sheet left (giant numerals), full photograph right
    function (r, pl, pr_) {
      return {
        L: ['t-choc', '<div class="mg-col"><span class="eb" style="color:#d0a77f">Specification · ' + r.no + '</span><div class="hd" style="font-size:44cqw;line-height:.8;margin:5cqw 0 0;color:#d0a77f;letter-spacing:-.04em">' + r.sqm + '</div>' +
          '<div class="eb" style="margin:1cqw 0 6cqw">square metres</div><hr class="mg-hr light"><h3 class="hd" style="font-size:7cqw;margin:4cqw 0 4cqw;font-style:italic">' + r.full + '</h3>' + ft(r.feat, 2) + '</div>' + fo(pl, 'l')],
        R: ['t-pearl', ph(r, 1, 'inset:0') + ph(r, 2, 'right:7cqw;top:7cqw;width:22cqw;height:20cqw;border:1.2cqw solid #f4f2f0') + ph(r, 3, 'right:7cqw;top:29cqw;width:22cqw;height:20cqw;border:1.2cqw solid #f4f2f0') + ph(r, 4, 'right:7cqw;top:51cqw;width:22cqw;height:20cqw;border:1.2cqw solid #f4f2f0') + '<div class="mg-grad b"></div>' +
          '<div class="mg-card">' + pq(r.quote, 4.2) + '<div class="mg-row mg-end" style="margin-top:4cqw">' + pr(r, 5) + lk(r) + '</div></div>' + fo(pr_, 'r', 'on-ph')]
      };
    },
    // 05 Aspect: full-bleed left with pull quote, structured page right
    function (r, pl, pr_) {
      return {
        L: ['t-choc', ph(r, 1, 'inset:0') + '<div class="mg-grad b"></div><div class="mg-cap" style="left:8cqw;right:8cqw;bottom:14cqw"><span class="eb">Every corner, every floor</span>' +
          '<p class="hd" style="font-size:8.4cqw;line-height:1.05;margin:3cqw 0 0">' + r.quote + '</p></div><div class="hd mg-num" style="right:7cqw;top:6cqw;font-size:12cqw">' + r.no + '</div>' + fo(pl, 'l', 'on-ph')],
        R: ['t-pearl', '<div class="mg-col" style="padding-bottom:12cqw"><div class="mg-row mg-end"><span class="eb">' + r.kind + '</span><span class="eb">' + r.sqm + ' sqm</span></div><h3 class="hd" style="font-size:14cqw;margin:5cqw 0 5cqw;letter-spacing:-.02em">Aspect<br><i>Studio</i></h3>' +
          '<div class="mg-row" style="gap:2cqw;flex:none">' + ph(r, 2, 'position:relative;flex:2;height:30cqw') + ph(r, 3, 'position:relative;flex:1;height:30cqw') + ph(r, 4, 'position:relative;flex:1;height:30cqw') + '</div>' + '<p class="tx" style="margin:5cqw 0 0;column-count:2;column-gap:5cqw;font-size:2.05cqw">' + r.desc + '</p>' +
          '<div class="mg-row" style="margin-top:auto;padding-top:5cqw">' + sp(r.sqm, 'sqm', 4.6) + sp('Double', 'bed', 4.6) + sp('Garden · City', 'preferred view', 3.4) + '</div>' +
          '<div class="mg-row mg-end" style="margin-top:5cqw">' + pr(r, 5.2) + lk(r) + '</div></div>' + fo(pr_, 'r')]
      };
    },
    // 06 Aspect E: oversize letter on golden sand, three-photo mosaic right
    function (r, pl, pr_) {
      return {
        L: ['t-sand', '<div class="hd mg-big" style="left:-10cqw;top:-4cqw;font-size:128cqw;font-style:italic;color:#24120c;opacity:.1;line-height:.9">E</div>' +
          ph(r, 4, 'right:8cqw;top:8cqw;width:30cqw;height:42cqw;border:1.2cqw solid #f4f2f0;box-shadow:0 2cqw 5cqw rgba(36,18,12,.18)', 'f-ae4') + '<div class="mg-col"><span class="eb">' + r.kind + ' · ' + r.no + '</span><h3 class="hd" style="font-size:12.4cqw;margin:50cqw 0 0;line-height:.98">Aspect<br>Studio <i>E</i></h3>' +
          '<p class="tx" style="margin:5cqw 0 0;max-width:78cqw">' + r.desc + '</p>' +
          '<div style="margin-top:auto"><span class="eb" style="display:block">' + r.views + '</span><small class="mg-sub">' + r.viewsNote + '</small></div></div>' + fo(pl, 'l')],
        R: ['t-pearl', ph(r, 1, 'left:0;top:0;width:58%;height:72%') + ph(r, 2, 'right:0;top:0;width:41.4%;height:36%') + ph(r, 3, 'right:0;top:36.8%;width:41.4%;height:35.2%', 'f-ae3') +
          '<div class="mg-col" style="top:73%;padding-top:6cqw;padding-bottom:10cqw"><div class="mg-row">' + sp(r.sqm, 'sqm', 4.8) + sp('Double', 'bed', 4.8) + sp('1–9', 'levels', 4.8) + '</div><div class="mg-row mg-end" style="margin-top:auto">' + pr(r, 5.2) + lk(r) + '</div></div>' + fo(pr_, 'r')]
      };
    },
    // 07 Empowered: arched photograph left, big quote on chocolate right
    function (r, pl, pr_) {
      return {
        L: ['t-pearl', ph(r, 1, 'left:14cqw;top:10cqw;width:72cqw;height:84cqw;border-radius:36cqw 36cqw 0 0', 'f-arch') +
          '<div class="mg-spill" aria-hidden="true"><img src="' + IMG + r.img + '-1.webp?v=4" alt="" draggable="false" style="clip-path:polygon(89.00% 58.98%,89.45% 56.64%,90.23% 54.98%,91.54% 53.37%,93.16% 52.05%,95.12% 51.17%,97.40% 51.17%,100.00% 52.25%,100.00% 100.00%,88.93% 100.00%,88.93% 70.70%,88.61% 66.80%,88.87% 62.89%)"></div>' +
          '<div class="mg-row mg-end" style="position:absolute;left:14cqw;right:14cqw;top:99cqw"><span class="hd" style="font-size:9cqw;line-height:1">' + r.no + '</span><span class="eb" style="text-align:right;line-height:1.7">' + r.views + '<br>' + r.sqm + ' sqm</span></div>' + fo(pl, 'l')],
        R: ['t-choc', '<div class="mg-col"><span class="eb" style="color:#d0a77f">' + r.kind + '</span>' + pq(r.quote, 6.6) + '' +
          '<p class="tx" style="margin:5cqw 0 0;font-size:2.05cqw">' + r.desc + '</p>' + '<div class="mg-row" style="gap:2cqw;margin-top:4cqw;flex:none">' + ph(r, 2, 'position:relative;flex:1;height:17cqw') + ph(r, 3, 'position:relative;flex:1;height:17cqw') + ph(r, 4, 'position:relative;flex:1;height:17cqw') + '</div>' +
          '<div class="mg-row" style="margin-top:auto"><div><b class="hd" style="font-size:4.4cqw;font-weight:400">' + r.full + '</b><small class="mg-sub">' + r.second + '</small></div></div>' +
          '<div class="mg-row mg-end" style="margin-top:5cqw">' + pr(r, 6.6) + lk(r) + '</div></div>' + fo(pr_, 'r')]
      };
    },
    // 08 Premier: photograph left, closing page right
    function (r, pl, pr_) {
      return {
        L: ['t-choc', ph(r, 1, 'inset:0') + '<div class="mg-grad b"></div><div class="mg-chip">DDA compliant</div>' +
          '<div class="mg-cap" style="left:8cqw;bottom:13cqw"><div class="hd" style="font-size:30cqw;line-height:.8;letter-spacing:-.03em">' + r.sqm + '</div><span class="eb">square metres of understated comfort</span></div>' + fo(pl, 'l', 'on-ph')],
        R: ['t-pearl', '<div class="mg-col"><span class="eb">' + r.kind + ' · ' + r.no + '</span><h3 class="hd" style="font-size:10.6cqw;margin:4cqw 0 0;line-height:.98">Premier<br>Empowered<br><i>Studio</i></h3><p class="tx" style="margin:4cqw 0 0;font-size:1.95cqw;line-height:1.6">' + r.desc + '</p>' +
          '<div class="mg-row" style="margin-top:4cqw;gap:2cqw">' + ph(r, 2, 'position:relative;flex:1;height:22cqw') + ph(r, 3, 'position:relative;flex:1;height:22cqw') + ph(r, 4, 'position:relative;flex:1;height:22cqw') + '</div>' +
          '<div class="mg-row mg-end" style="margin-top:auto;padding-top:4cqw">' + pr(r, 5) + lk(r) + '</div>' +
          '<div class="mg-closer"><span>Pay in full, save $500 · Up to 2 weeks free on 52-week contracts</span><a class="mg-lk" href="https://epiisod.com/en-au" target="_blank" rel="noopener" draggable="false">All rooms <i>→</i></a></div></div>' + fo(pr_, 'r')]
      };
    }
  ];

  // cover lines for the phone and tablet cover (the desktop cover sets its own below)
  var CV_LINES = [['01', 'Quad & Quint', 'Shared apartments with four or five ensuite bedrooms'], ['03', 'Signature Studio', 'The cornerstone of the collection'], ['07', 'Empowered Studio', 'Live independently, without limitation']];
  // the cover: a classic interiors-magazine front (full-bleed photograph, big serif masthead, a few large cover lines),
  // every word sized and shaded so it reads over the picture
  function cover() {
    return ['t-choc cvx', '<figure class="mg-ph cvx-ph" style="inset:0"><img src="' + IMG + 'cover.webp?v=4" alt="A warm oak desk nook with a vase of dried flowers" draggable="false"></figure>' +
      '<div class="cvx-shade"></div>' +
      '<div class="cvx-top cv-rv" style="--i:0"><span>EPIISOD · Macquarie Park</span><span>Vol. 01 · 2026</span></div>' +
      '<h2 class="hd cvx-mast cv-rv" style="--i:1">Rooms</h2>' +
      '<p class="hd cvx-sub cv-rv" style="--i:2">The Residence Edit</p>' +
      '<div class="cvx-feat cv-rv" style="--i:3"><span class="cvx-kick">Studios &amp; shared living</span>' +
        '<p class="hd">Eight ways<br><i>to live well.</i></p></div>' +
      '<div class="cvx-tag cv-rv" style="--i:4"><small>From</small><b class="hd">AU$615</b><small>per week</small></div>' +
      '<div class="cvx-open cv-rv" style="--i:5">Open the magazine <i>→</i></div>'];
  }


  // ---- build the book ----
  var leaves = [];            // { el, front, back }
  var N = R.length + 1;       // leaf 0 is the cover; leaf k carries room k on its front, room k-1... see below
  var stage = document.createElement('div');
  stage.className = 'ep-mag';
  stage.innerHTML = '<div class="ep-mag_in"><div class="ep-mag_book" data-mag-book><div class="ep-mag_edge ep-mag_edgeL"></div><div class="ep-mag_edge ep-mag_edgeR"></div>' +
    '<div class="ep-mag_cast ep-mag_castL"></div><div class="ep-mag_cast ep-mag_castR"></div></div></div>' +
    '<div class="ep-mag_idx" data-mag-idx></div>';
  var book = stage.querySelector('[data-mag-book]');
  var castL = stage.querySelector('.ep-mag_castL'), castR = stage.querySelector('.ep-mag_castR');
  var edgeL = stage.querySelector('.ep-mag_edgeL'), edgeR = stage.querySelector('.ep-mag_edgeR');
  var idx = stage.querySelector('[data-mag-idx]');

  // spread s (1..8) shows the back of leaf s-1 on the left and the front of leaf s on the right
  var fronts = [cover()], backs = [];
  R.forEach(function (r, i) {
    var t = T[i](r, 2 * (i + 1), 2 * (i + 1) + 1);
    backs[i] = t.L; fronts[i + 1] = t.R;
  });
  for (var k = 0; k < N; k++) {
    var leaf = document.createElement('div');
    leaf.className = 'ep-mag_leaf';
    var f = fronts[k], b = backs[k];
    leaf.innerHTML = '<div class="ep-mag_pg mg ' + f[0] + '" data-face="f">' + f[1] + '<i class="mg-shade"></i></div>' +
      (b ? '<div class="ep-mag_pg ep-mag_pg--back mg ' + b[0] + '" data-face="b">' + b[1] + '<i class="mg-shade"></i></div>' : '');
    book.appendChild(leaf);
    leaves.push({ el: leaf, front: leaf.querySelector('[data-face="f"]'), back: leaf.querySelector('[data-face="b"]'), t: -1 });
  }
  var head = document.createElement('div');
  head.className = 'ep-mag_head';
  head.innerHTML = '<span class="ep-mag_eb">The residence edit</span><h2>Flip through the rooms</h2><p>Eight ways to live well. Click the page to turn it.</p>';
  stage.appendChild(head);
  pin.appendChild(stage);
  // desktop sizing: closed, the heading sits just above the cover; opened, the book grows to nearly the full height of
  // the screen (as wide as fits) and centres itself, then shrinks back as it closes (book CSS reads --S and --dy, eased
  // by --c, which render() sets from the page turn)
  function sizeBook() {
    if (!window.matchMedia('(min-width: 992px)').matches) return;
    var top = 0, el = book;
    while (el && el !== stage) { top += el.offsetTop; el = el.offsetParent; }
    if (el !== stage) return;
    var vh = stage.clientHeight, vw = stage.clientWidth, ph = book.offsetHeight, w2 = book.offsetWidth;
    var S = Math.max(1, Math.min(0.86 * vh / ph, 0.94 * vw / w2));
    var dy = 0.47 * vh - (top + ph / 2);
    book.style.setProperty('--S', S.toFixed(4));
    book.style.setProperty('--dy', dy.toFixed(1) + 'px');
    head.style.top = Math.max(12, top - head.offsetHeight - 22) + 'px';
  }
  sizeBook();
  window.addEventListener('resize', sizeBook);
  window.addEventListener('load', sizeBook);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeBook);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { stage.classList.toggle('is-in', e.intersectionRatio > 0.35); }); }, { threshold: [0, 0.2, 0.35, 0.5] }).observe(sec);

  var ticks = R.map(function (r, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ep-mag_tick'; b.setAttribute('aria-label', 'Go to ' + r.full);
    b.innerHTML = '<span>' + r.no + '</span><em>' + r.full + '</em>';
    b.addEventListener('click', function () { setCur(i + 1); });
    idx.appendChild(b);
    return b;
  });

  // ---- desktop: pages turn on click (or the arrow keys); scrolling just passes the section ----
  var mq = window.matchMedia('(min-width: 992px)');
  var TURNS = N - 1, cur = 0, cs = 0, raf = 0, lastT = 0, spread = -1, peek = 0, dragging = false;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function setCur(s) { cur = Math.max(0, Math.min(TURNS, s)); kick(); }
  function kick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(now) {
    raf = 0;
    if (dragging) { render(); return; }                     // a finger / mouse is turning the page by hand
    var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    var d = cur - cs;
    if (Math.abs(d) > 0.0005) {
      var m = 1.15 * Math.max(1, Math.abs(d) / 1.5) * dt;
      cs += Math.abs(d) <= m ? d : (d > 0 ? m : -m);
      raf = requestAnimationFrame(frame);
    } else cs = cur;
    render();
    if (!raf) refreshCur();
  }
  function render() {
    var turned = 0, peak = 0;
    leaves.forEach(function (lf, k) {
      var t = k < TURNS ? ease(clamp(cs - k)) : 0;
      if (k === 0 && cs < 0.002 && peek > 0) t = peek;        // the idle "peek": the closed cover lifts a little
      if (t < 0.002) t = 0; else if (t > 0.998) t = 1;
      if (t >= 0.5) turned++;
      var s = Math.sin(Math.PI * t);
      if (s > peak) peak = s;
      if (t !== lf.t) {
        lf.t = t;
        lf.el.style.transform = 'translateZ(' + (s * 36).toFixed(1) + 'px) rotateY(' + (-180 * t).toFixed(2) + 'deg)';
        lf.el.style.zIndex = (t > 0 && t < 1) ? 100 : t >= 0.5 ? 10 + k : 10 + N - k;
        lf.front.style.setProperty('--sh', (s * 0.5).toFixed(3));
        if (lf.back) lf.back.style.setProperty('--sh', (s * 0.5).toFixed(3));
      }
    });
    // closed book rests on its right-hand side until the cover is opened
    book.style.setProperty('--c', (1 - ease(clamp(cs))).toFixed(3));
    edgeR.style.width = Math.max(0, Math.min(N - turned - 1, 8)) * 2 + 'px';
    edgeL.style.width = Math.max(0, Math.min(turned, 8)) * 2 + 'px';
    castL.style.opacity = (peak * 0.55).toFixed(3);
    castR.style.opacity = (peak * 0.55).toFixed(3);
    if (cur !== spread) {
      spread = cur;
      leaves.forEach(function (lf, k) {
        setInert(lf.front, k !== cur);
        if (lf.back) setInert(lf.back, k !== cur - 1);
      });
      ticks.forEach(function (t, i) { t.classList.toggle('is-on', i + 1 === cur); });
      idx.classList.toggle('is-cover', cur === 0);
      stage.classList.toggle('is-cover', cur === 0);
      stage.classList.toggle('is-end', cur === TURNS);
    }
  }
  function setInert(el, on) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }

  // cursor: a chevron with "Next" / "Back" underneath, following the pointer over the book
  var cursor = document.createElement('div');
  cursor.className = 'ep-mag_cur'; cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<svg viewBox="0 0 24 40" width="22" height="36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M6 4l14 16L6 36"/></svg><span></span>';
  document.body.appendChild(cursor);
  var cLabel = cursor.querySelector('span'), cSvg = cursor.querySelector('svg');
  var pt = null;
  function sideAt(x) {
    var r = book.getBoundingClientRect(), right = x > r.left + r.width / 2;
    if (right) return cur < TURNS ? 'next' : null;
    return cur > 0 ? 'back' : null;
  }
  function refreshCur() {
    var side = pt && mq.matches && !pt.link ? sideAt(pt.x) : null;
    book.classList.toggle('has-cur', !!side);
    if (!side) { cursor.classList.remove('is-on'); return; }
    cursor.classList.add('is-on');
    cursor.classList.toggle('is-back', side === 'back');
    cLabel.textContent = side === 'back' ? 'Back' : cur === 0 ? 'View rooms' : 'Next';
    cursor.style.transform = 'translate3d(' + pt.x + 'px,' + pt.y + 'px,0)';
  }
  book.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    pt = { x: e.clientX, y: e.clientY, link: !!e.target.closest('a') };
    refreshCur();
  });
  book.addEventListener('pointerleave', function () { pt = null; refreshCur(); });
  book.addEventListener('click', function (e) {
    if (!mq.matches || e.target.closest('a') || (book.__swiped && performance.now() - book.__swiped < 400)) return;
    var side = sideAt(e.clientX);
    if (side === 'next') setCur(cur + 1); else if (side === 'back') setCur(cur - 1);
  });
  window.addEventListener('keydown', function (e) {
    if (!mq.matches || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    var r = sec.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top > vh * 0.5 || r.bottom < vh * 0.5) return;
    setCur(cur + (e.key === 'ArrowRight' ? 1 : -1));
  });
  window.addEventListener('scroll', function () { if (pt) { pt = null; refreshCur(); } }, { passive: true });

  // tablets (book layout, no hover): a visible "Open the rooms magazine" button on the cover, then back / next arrows
  // either side of the page numbers, and swipe on the book itself
  var chev = function (d) { return '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5') + '" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
  var tPrev = document.createElement('button'), tNext = document.createElement('button'), tOpen = document.createElement('button');
  tPrev.type = tNext.type = tOpen.type = 'button';
  tPrev.className = 'ep-mag_tbtn ep-mag_tprev'; tPrev.setAttribute('aria-label', 'Previous page'); tPrev.innerHTML = chev(-1);
  tNext.className = 'ep-mag_tbtn ep-mag_tnext'; tNext.setAttribute('aria-label', 'Next page'); tNext.innerHTML = chev(1);
  tOpen.className = 'ep-mag_topen'; tOpen.innerHTML = '<span>View the rooms</span>' + chev(1);
  idx.parentNode.insertBefore(tPrev, idx); idx.parentNode.insertBefore(tNext, idx.nextSibling); idx.parentNode.insertBefore(tOpen, idx);
  tPrev.addEventListener('click', function () { setCur(cur - 1); });
  tNext.addEventListener('click', function () { setCur(cur + 1); });
  tOpen.addEventListener('click', function () { setCur(1); });
  // hold and drag the page to turn it (mouse, finger or stylus): the page follows your hand, and lets go either way
  var dr = null;
  book.addEventListener('pointerdown', function (e) {
    if (!mq.matches || e.button > 0 || (e.target.closest && e.target.closest('a, button'))) return;
    var now = performance.now();
    dr = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false, dir: 0, p: 0, lx: e.clientX, lt: now, v: 0 };
  });
  book.addEventListener('pointermove', function (e) {
    if (!dr || e.pointerId !== dr.id) return;
    var dx = e.clientX - dr.x, dy = e.clientY - dr.y;
    if (!dr.on) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) { if (e.pointerType !== 'mouse' && Math.abs(dy) > 12) dr = null; return; }
      dr.dir = dx < 0 ? 1 : -1;                              // drag left to go forward, right to go back
      if ((dr.dir > 0 && cur >= TURNS) || (dr.dir < 0 && cur <= 0)) { dr = null; return; }
      dr.on = true; dragging = true; peekReset();
      try { book.setPointerCapture(dr.id); } catch (err) {}
      book.classList.add('is-drag'); cursor.classList.remove('is-on');
    }
    var w = Math.max(220, book.getBoundingClientRect().width * 0.5);          // half the book's width turns a whole page
    var p = clamp((dr.dir > 0 ? -dx : dx) / w);
    cs = cur + dr.dir * p; dr.p = p;
    var now = performance.now(), dt = Math.max(1, now - dr.lt);
    dr.v = dr.v * 0.6 + ((e.clientX - dr.lx) / dt * 1000) * 0.4; dr.lx = e.clientX; dr.lt = now;
    render();
  });
  function endDrag(e) {
    if (!dr || (e && dr.id !== e.pointerId)) return;
    var d = dr; dr = null;
    if (!d.on) return;
    dragging = false; book.classList.remove('is-drag'); book.__swiped = performance.now();
    var fast = d.dir > 0 ? d.v < -500 : d.v > 500;                              // a quick flick turns it too
    setCur(cur + (d.p > 0.3 || fast ? d.dir : 0));                              // otherwise it settles back
  }
  book.addEventListener('pointerup', endDrag); book.addEventListener('pointercancel', endDrag);

  // idle hint: while the cover is closed and nobody is touching it, it lifts and settles a couple of times, every few seconds
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches, peekRaf = 0, peekTimer = 0;
  function peekCan() { return mq.matches && !REDUCED && cur === 0 && cs < 0.002 && !dragging && !pt && !document.hidden && stage.classList.contains('is-in'); }
  function peekReset() { cancelAnimationFrame(peekRaf); peekRaf = 0; if (peek) { peek = 0; render(); } }
  var PEEK = [[0, 0], [0.2, 0.085], [0.4, 0.014], [0.6, 0.052], [0.8, 0], [1, 0]];
  function peekRun() {
    var t0 = performance.now(), D = 2400;
    stage.classList.add('is-peeking');                       // the "View the rooms" button and its arrow join in
    (function step(now) {
      var u = (now - t0) / D;
      if (!peekCan()) { peek *= 0.72; if (peek < 0.002) { peek = 0; peekRaf = 0; stage.classList.remove('is-peeking'); render(); peekNext(); return; } render(); peekRaf = requestAnimationFrame(step); return; }
      if (u >= 1) { peek = 0; peekRaf = 0; stage.classList.remove('is-peeking'); render(); peekNext(); return; }
      for (var i = 1; i < PEEK.length; i++) if (u <= PEEK[i][0]) { var a = PEEK[i - 1], b = PEEK[i], q = ease((u - a[0]) / (b[0] - a[0])); peek = a[1] + (b[1] - a[1]) * q; break; }
      render(); peekRaf = requestAnimationFrame(step);
    })(t0);
  }
  function peekNext() { clearTimeout(peekTimer); peekTimer = setTimeout(function () { if (peekCan() && !peekRaf) peekRun(); else peekNext(); }, 3400); }
  peekTimer = setTimeout(function () { if (peekCan() && !peekRaf) peekRun(); else peekNext(); }, 2200);
  if (mq.addEventListener) mq.addEventListener('change', function () { refreshCur(); });
  render();

  // ====================== phones and tablets: cover + full-screen flipbook ======================
  var mobCover = document.createElement('div');
  mobCover.className = 'ep-mcover';
  mobCover.setAttribute('role', 'button'); mobCover.setAttribute('tabindex', '0'); mobCover.setAttribute('aria-label', 'Open the rooms magazine');
  mobCover.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fbOpen(1); } });
  pin.appendChild(mobCover);

  function mph(r, n, cls, st) { return '<figure class="mp-ph ' + (cls || '') + '"' + (st ? ' style="' + st + '"' : '') + '><img src="' + IMG + r.img + '-' + n + '.webp?v=4" alt="' + r.full + '" draggable="false"></figure>'; }
  function mlk(r) { return '<a class="mp-lk" href="' + r.url + '" target="_blank" rel="noopener" draggable="false">Explore room <i>→</i></a>'; }
  function mpr(r) { return '<div class="mp-pr"><small>From</small><b class="hd">AU$' + r.price + '</b><small>' + r.unit + '</small></div>'; }
  function msp(a, b) { return '<div class="mp-sp"><b class="hd">' + a + '</b><small>' + b + '</small></div>'; }
  function mft(list) { return '<ul class="mp-ft">' + list.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>'; }
  var SPEC3 = ['apt', 'apt', 'lv', 'bd', 'lv', 'lv', 'sec', 'sec'];
  function spec3(r) {
    switch (SPEC3[r.i]) {
      case 'apt': return msp(r.sqm2, 'sqm · apartment');
      case 'bd': return msp('1', 'bedroom');
      case 'sec': return msp('+$60', '2nd occupant / wk');
      default: return msp('1–9', 'levels');
    }
  }
  // phones and tablets use the same cover as desktop; only the prompt at the foot changes
  function mCover(withBtn) {
    var c = cover()[1].replace('Open the magazine <i>→</i>', withBtn ? 'Tap to open the magazine <i>→</i>' : 'Swipe up to turn the page <i>↑</i>');
    return ['t-choc cvx', c];
  }

  // one page per room: a photo carousel in the top half, the room's details in the bottom half (the fold runs between them)
  function mRoom(r) {
    var tone = ['t-pearl', 't-sand', 't-choc'][r.i % 3];
    var slides = [1, 2, 3, 4].map(function (n) { return '<div class="rp-sl">' + mph(r, n) + '</div>'; }).join('');
    var dots = [0, 1, 2, 3].map(function (i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('');
    return [tone, '<div class="rp-car" data-i="0"><div class="rp-trk">' + slides + '</div><div class="rp-top"><span class="mp-eb">' + r.kind + '</span><span class="hd mp-no">' + r.no + '</span></div><div class="rp-dots">' + dots + '</div></div>' +
      '<div class="rp-body"><h3 class="hd rp-name">' + r.full + '</h3><div class="rp-meta"><span>' + r.sqm + ' sqm</span><span>' + r.bed + '</span><span>' + r.views + '</span></div>' +
      '<p class="rp-tx">' + r.desc + '</p><p class="rp-ft">' + r.feat.slice(0, 7).join(' · ') + '</p><div class="rp-foot">' + mpr(r) + mlk(r) + '</div></div>'];
  }
  var MP = [mCover(false)];
  R.forEach(function (r) { MP.push(mRoom(r)); });
  var MN = MP.length, MT = ['Rooms'].concat(R.map(function (r) { return r.full; }));
  var cv = mCover(true);
  mobCover.innerHTML = '<div class="ep-mcover_head"><span>The residence edit</span><h2>Flip through the rooms</h2><p>Eight ways to live well. Tap the cover to open it.</p></div><div class="ep-mcover_card"><div class="mp ' + cv[0] + '">' + cv[1] + '</div></div><span class="ep-mcover_tap"><span>View the rooms</span><svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { mobCover.classList.toggle('is-in', e.intersectionRatio > 0.3); }); }, { threshold: [0, 0.15, 0.3, 0.5] }).observe(mobCover);

  var fb = null, fbn = 0, fbRaf = 0, fbDrag = null, fbBusy = false, fbPool = {}, slots = {}, fbT = 0, fbK = 0, fbOpener = null;
  function fbBuild() {
    fb = document.createElement('div');
    fb.className = 'ep-fb'; fb.setAttribute('role', 'dialog'); fb.setAttribute('aria-modal', 'true'); fb.setAttribute('aria-label', 'Rooms flipbook');
    fb.innerHTML = '<div class="ep-fb_bar"><button type="button" class="ep-fb_x" aria-label="Close rooms">×</button><span class="ep-fb_t"></span><span class="ep-fb_ct"></span></div>' +
      '<div class="ep-fb_stage"><div class="fb-s fb-top"></div><div class="fb-s fb-bot"></div><div class="fb-cast"></div>' +
      '<div class="fb-flap"><div class="fb-face fb-ff"></div><div class="fb-face fb-fbk"></div></div></div>';
    var hn = document.createElement('div'); hn.className = 'ep-fb_hint'; hn.setAttribute('aria-hidden', 'true'); hn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l5-5 5 5"/></svg><span>Swipe up to turn the page</span>';
    fb.querySelector('.ep-fb_stage').appendChild(hn);
    document.body.appendChild(fb);
    slots = { top: fb.querySelector('.fb-top'), bot: fb.querySelector('.fb-bot'), ff: fb.querySelector('.fb-ff'), fbk: fb.querySelector('.fb-fbk') };
    fb.querySelector('.ep-fb_x').addEventListener('click', fbClose);
    var st = fb.querySelector('.ep-fb_stage');
    st.addEventListener('pointerdown', fbDown);
    window.addEventListener('pointermove', fbMove);
    window.addEventListener('pointerup', fbUp);
    window.addEventListener('pointercancel', fbUp);
  }
  // one half of a page: 'top' shows the upper half, 'bot' the lower half
  function half(i, which) {
    var key = i + which;
    if (!fbPool[key]) {
      var p = MP[i], el = document.createElement('div');
      el.className = 'fb-hf ' + which;
      el.innerHTML = '<div class="fb-pg mp ' + p[0] + '">' + p[1] + '</div><i class="fb-sh"></i>';
      if (which === 'bot') [].forEach.call(el.querySelectorAll('a, button'), function () {});
      fbPool[key] = el;
    }
    return fbPool[key];
  }
  function fbLayers(k) {                 // transition from page k to page k+1
    var nx = Math.min(MN - 1, k + 1);
    fbK = k;
    slots.top.replaceChildren(half(k, 'top'));
    slots.ff.replaceChildren(half(k, 'bot'));
    slots.fbk.replaceChildren(nx === k ? half(nx, 'top').cloneNode(true) : half(nx, 'top'));
    slots.bot.replaceChildren(nx === k ? half(nx, 'bot').cloneNode(true) : half(nx, 'bot'));
    [].forEach.call(fb.querySelectorAll('.fb-hf'), function (h) { h.removeAttribute('inert'); });
    slots.bot.firstChild.setAttribute('inert', ''); slots.fbk.firstChild.setAttribute('inert', '');
  }
  function fbSet(t) {
    fbT = t;
    fb.querySelector('.fb-flap').style.transform = 'rotateX(' + (180 * t).toFixed(2) + 'deg)';
    var s = Math.sin(Math.PI * t);
    var s1 = slots.ff.firstChild && slots.ff.firstChild.querySelector('.fb-sh'), s2 = slots.fbk.firstChild && slots.fbk.firstChild.querySelector('.fb-sh');
    if (s1) s1.style.opacity = (t < 0.5 ? t * 2 * 0.6 : 0).toFixed(3);
    if (s2) s2.style.opacity = (t > 0.5 ? (1 - t) * 2 * 0.6 : 0).toFixed(3);
    fb.querySelector('.fb-cast').style.opacity = (s * 0.7).toFixed(3);
    fb.querySelector('.fb-flap').style.zIndex = t > 0 && t < 1 ? 5 : 3;
  }
  var fbUsed = false;
  function fbShow(n) {
    fbn = Math.max(0, Math.min(MN - 1, n));
    if (fbn > 1) fbUsed = true;
    fb.classList.toggle('is-used', fbUsed);
    fbLayers(fbn);
    fbSet(0);
    fb.querySelector('.ep-fb_ct').textContent = pad(fbn + 1) + ' / ' + pad(MN);
    fb.querySelector('.ep-fb_t').textContent = MT[fbn];
    // keep the neighbours decoded
    [fbn - 1, fbn + 1, fbn + 2].forEach(function (i) { if (i >= 0 && i < MN) { half(i, 'top'); half(i, 'bot'); } });
  }
  function fbAnim(to, dir, done) {
    var from = fbT, t0 = performance.now(), dur = 120 + 440 * Math.abs(to - from);
    fbBusy = true;
    (function step(now) {
      var u = Math.min(1, (now - t0) / dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      fbSet(from + (to - from) * e);
      if (u < 1) requestAnimationFrame(step); else { fbBusy = false; done(); }
    })(t0);
  }
  function fbGo(dir) {                   // dir 1: next page, -1: previous
    if (fbBusy) return;
    if (dir === 1 && fbn < MN - 1) { fbLayers(fbn); fbSet(0); fbAnim(1, 1, function () { fbShow(fbn + 1); }); }
    else if (dir === -1 && fbn > 0) { fbLayers(fbn - 1); fbSet(1); fbAnim(0, -1, function () { fbShow(fbn - 1); }); }
  }
  var carDrag = null;
  function carShow(car, i, px, anim) {
    var trk = car.querySelector('.rp-trk');
    trk.style.transition = anim ? 'transform .38s cubic-bezier(.2,.7,.2,1)' : 'none';
    trk.style.transform = 'translate3d(calc(' + (-i * 100) + '% + ' + (px || 0) + 'px),0,0)';
    car.setAttribute('data-i', i);
    [].forEach.call(car.querySelectorAll('.rp-dots i'), function (d, k) { d.classList.toggle('on', k === i); });
  }
  function fbDown(e) {
    if (fbBusy) return;
    var car = e.target.closest('.rp-car');
    fbDrag = { y: e.clientY, x: e.clientX, dir: 0, t: 0, v: 0, ly: e.clientY, lt: performance.now(), link: !!e.target.closest('a, button'), h: fb.querySelector('.ep-fb_stage').offsetHeight, car: car, ci: car ? +car.getAttribute('data-i') || 0 : 0, cw: car ? car.offsetWidth : 0, hz: false };
  }
  function fbMove(e) {
    if (!fbDrag) return;
    var dy = e.clientY - fbDrag.y, dx = e.clientX - fbDrag.x;
    if (fbDrag.hz) { carShow(fbDrag.car, fbDrag.ci, dx, false); return; }
    if (!fbDrag.dir) {
      if (Math.abs(dx) < 9 && Math.abs(dy) < 9) return;
      if (Math.abs(dx) > Math.abs(dy)) {            // sideways: the photo carousel, if the finger started on it
        if (fbDrag.car) { fbDrag.hz = true; carShow(fbDrag.car, fbDrag.ci, dx, false); }
        return;
      }
      var dir = dy < 0 ? 1 : -1;
      if ((dir === 1 && fbn >= MN - 1) || (dir === -1 && fbn <= 0)) return;
      fbDrag.dir = dir; fbUsed = true; fb.classList.add('is-used');
      if (dir === 1) { fbLayers(fbn); } else { fbLayers(fbn - 1); }
    }
    var span = fbDrag.h * 0.6, t = fbDrag.dir === 1 ? clamp(-dy / span) : clamp(1 - dy / span);
    var now = performance.now();
    fbDrag.v = (e.clientY - fbDrag.ly) / Math.max(1, now - fbDrag.lt); fbDrag.ly = e.clientY; fbDrag.lt = now;
    fbSet(t);
  }
  function fbUp(e) {
    if (!fbDrag) return;
    var d = fbDrag; fbDrag = null;
    if (d.hz) {
      var dx = e.clientX - d.x, n = d.car.querySelectorAll('.rp-sl').length, i = d.ci;
      if (dx < -d.cw * 0.18) i = Math.min(n - 1, i + 1); else if (dx > d.cw * 0.18) i = Math.max(0, i - 1);
      carShow(d.car, i, 0, true);
      return;
    }
    if (!d.dir) {                        // a tap: top half goes back, bottom half goes forward
      if (d.link || e.type === 'pointercancel' || Math.hypot(e.clientY - d.y, e.clientX - d.x) > 9) return;
      var r = fb.querySelector('.ep-fb_stage').getBoundingClientRect();
      fbGo(e.clientY > r.top + r.height / 2 ? 1 : -1);
      return;
    }
    if (d.dir === 1) {
      var go = fbT > 0.28 || d.v < -0.5;
      fbAnim(go ? 1 : 0, 1, function () { fbShow(go ? fbn + 1 : fbn); });
    } else {
      var back = fbT < 0.72 || d.v > 0.5;
      fbAnim(back ? 0 : 1, -1, function () { fbShow(back ? fbn - 1 : fbn); });
    }
  }
  function fbOpen(n) {
    if (!fb) fbBuild();
    fbOpener = document.activeElement;
    fb.classList.add('is-on');
    document.documentElement.classList.add('ep-fb-open');
    if (window.__lenis && window.__lenis.stop) window.__lenis.stop();
    fbShow(n || 0);
    fb.querySelector('.ep-fb_x').focus({ preventScroll: true });
  }
  function fbClose() {
    if (!fb) return;
    fb.classList.remove('is-on');
    document.documentElement.classList.remove('ep-fb-open');
    if (window.__lenis && window.__lenis.start) window.__lenis.start();
    if (fbOpener && fbOpener.focus) fbOpener.focus({ preventScroll: true });
  }
  mobCover.addEventListener('click', function (e) { if (e.target.closest('[data-fb-open], .ep-mcover_card')) fbOpen(1); });
  window.addEventListener('keydown', function (e) {
    if (!fb || !fb.classList.contains('is-on')) return;
    if (e.key === 'Escape') fbClose();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') fbGo(1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') fbGo(-1);
  });
  if (mq.addEventListener) mq.addEventListener('change', function () { if (mq.matches) fbClose(); });
})();
