/**
 * Shapes for the footer logo's emblem → wordmark morph (option B), in the wordmark's own
 * coordinates (1368 × 224.08 Figma units). Read straight from the SVG files, so the start
 * and end shapes are exactly the drawn lobes and arcs.
 */
import lobeTopSvg from '../../assets/footer/emblem-lobe-top.svg?raw';
import lobeRightSvg from '../../assets/footer/emblem-lobe-right.svg?raw';
import lobeBottomSvg from '../../assets/footer/emblem-lobe-bottom.svg?raw';
import lobeLeftSvg from '../../assets/footer/emblem-lobe-left.svg?raw';
import arc1Svg from '../../assets/footer/wordmark-01.svg?raw';
import arc2Svg from '../../assets/footer/wordmark-02.svg?raw';
import arc3Svg from '../../assets/footer/wordmark-03.svg?raw';
import arc4Svg from '../../assets/footer/wordmark-04.svg?raw';
import arc5Svg from '../../assets/footer/wordmark-05.svg?raw';

type Point = [number, number];

/** First path of an SVG file, plus its viewBox [x, y, w, h]. */
function readSvg(svg: string) {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  const viewBox = (root.getAttribute('viewBox') ?? '0 0 1 1').split(/[\s,]+/).map(Number);
  const path = root.querySelector('path')!;
  return { d: path.getAttribute('d')!, fill: path.getAttribute('fill') ?? '#24120C', viewBox };
}

/**
 * Map every point of an absolute-command path (M L H V C S Q T Z, as these files use)
 * through `map`, writing it back out with M/L/C/Q only.
 */
function mapPath(d: string, map: (p: Point) => Point) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const out: string[] = [];
  let i = 0;
  let cmd = '';
  let cur: Point = [0, 0];
  const num = () => parseFloat(tokens[i++]);
  const pt = (): Point => [num(), num()];
  const fmt = (p: Point) => {
    const [x, y] = map(p);
    return `${+x.toFixed(3)},${+y.toFixed(3)}`;
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case 'M':
      case 'L':
      case 'T':
        cur = pt();
        out.push(`${cmd === 'T' ? 'L' : cmd}${fmt(cur)}`);
        if (cmd === 'M') cmd = 'L';
        break;
      case 'H':
        cur = [num(), cur[1]];
        out.push(`L${fmt(cur)}`);
        break;
      case 'V':
        cur = [cur[0], num()];
        out.push(`L${fmt(cur)}`);
        break;
      case 'C': {
        const a = pt();
        const b = pt();
        cur = pt();
        out.push(`C${fmt(a)} ${fmt(b)} ${fmt(cur)}`);
        break;
      }
      case 'S':
      case 'Q': {
        const a = pt();
        cur = pt();
        out.push(`${cmd === 'S' ? 'Q' : 'Q'}${fmt(a)} ${fmt(cur)}`);
        break;
      }
      case 'Z':
      case 'z':
        out.push('Z');
        cmd = '';
        break;
      default:
        // Relative commands aren't used by these files; skip anything unexpected.
        i++;
    }
  }
  return out.join(' ');
}

export const WM_W = 1368;
export const WM_H = 224.0774;
const EMBLEM = 263;
const EMBLEM_X = (WM_W - EMBLEM) / 2;
const EMBLEM_Y = (WM_H - EMBLEM) / 2;

/** A lobe's outline, placed on the emblem centred over the wordmark. */
function lobeShape(svg: string) {
  const { d, fill } = readSvg(svg);
  // Lobe files are drawn in the emblem's own coordinates (see their viewBoxes).
  return { d: mapPath(d, ([x, y]) => [EMBLEM_X + x, EMBLEM_Y + y]), fill };
}

/** An arc's outline, stretched into its slot of the wordmark (top right bottom left, %). */
function arcShape(svg: string, inset: string) {
  const { d, fill, viewBox } = readSvg(svg);
  const [t, r, b, l] = inset.split(/\s+/).map((v) => parseFloat(v) / 100);
  const left = l * WM_W;
  const top = t * WM_H;
  const w = (1 - l - r) * WM_W;
  const h = (1 - t - b) * WM_H;
  const [vx, vy, vw, vh] = viewBox;
  return { d: mapPath(d, ([x, y]) => [left + ((x - vx) / vw) * w, top + ((y - vy) / vh) * h]), fill };
}

/** Wordmark arc slots, matching the WORDMARK table in Footer.tsx (arcs 0–4). */
const ARC_INSETS = [
  '0.92% 12.3% 64.45% 72.86%',
  '0% 43.42% 64.45% 41.46%',
  '0.94% 74.84% 64.45% 10.33%',
  '64.67% 27.8% -0.07% 57.1%',
  '64.67% 59.11% 0.14% 25.88%',
];
const ARCS = [arc1Svg, arc2Svg, arc3Svg, arc4Svg, arc5Svg].map((svg, i) => arcShape(svg, ARC_INSETS[i]));
const LOBE = { top: lobeShape(lobeTopSvg), right: lobeShape(lobeRightSvg), bottom: lobeShape(lobeBottomSvg), left: lobeShape(lobeLeftSvg) };

/**
 * Each morph: the lobe it starts as and the arc it becomes. Same pairing as before — the
 * left lobe becomes the left top arc, the top lobe the middle one, the right lobe the
 * right one, and the bottom lobe parts in two for the two bottom arcs.
 */
export const MORPHS = [
  { from: LOBE.left, to: ARCS[2] },
  { from: LOBE.top, to: ARCS[1] },
  { from: LOBE.right, to: ARCS[0] },
  { from: LOBE.bottom, to: ARCS[4] },
  { from: LOBE.bottom, to: ARCS[3] },
];

/* ---------- Crescent model ----------
 * Every lobe and arc is a crescent: an outer and an inner circular edge, joined at the
 * ends (in a point for the lobes, by a short flat cut for the arcs). A crescent is
 * described by each edge's two end points and its signed bulge (sagitta). Interpolating
 * those numbers and redrawing gives a true crescent at every step — it travels, turns,
 * widens and flattens, but never warps the way a point-by-point morph does.
 */

type Edge = { a: Point; b: Point; bulge: number };
export type Crescent = { outer: Edge; inner: Edge };

const sub = (p: Point, q: Point): Point => [p[0] - q[0], p[1] - q[1]];
const dist = (p: Point, q: Point) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/** Signed distance of `p` from the line a→b (positive to the left of travel, on screen). */
const side = (p: Point, a: Point, b: Point) => {
  const [dx, dy] = sub(b, a);
  const len = Math.hypot(dx, dy) || 1;
  return ((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len;
};

/** Points along a path's outline, measured by the browser. */
function sample(d: string, n = 600): Point[] {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
  document.body.appendChild(svg);
  const len = path.getTotalLength();
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const p = path.getPointAtLength((len * i) / n);
    pts.push([p.x, p.y]);
  }
  svg.remove();
  return pts;
}

/**
 * Fit a crescent to a path. The tips are the two outline points farthest apart; they split
 * the outline into two chains, the outer edge (bulging more) and the inner one. Where the
 * crescent ends in a flat cut, the inner edge's ends are where its chain leaves the line
 * through the tips.
 */
function fit(d: string): Crescent {
  const pts = sample(d);
  let ia = 0;
  let ib = 0;
  let best = 0;
  for (let i = 0; i < pts.length; i += 2)
    for (let j = i + 1; j < pts.length; j += 2) {
      const dd = dist(pts[i], pts[j]);
      if (dd > best) {
        best = dd;
        ia = i;
        ib = j;
      }
    }
  const a = pts[ia];
  const b = pts[ib];
  const chainA = pts.slice(ia, ib + 1);
  const chainB = [...pts.slice(ib), ...pts.slice(0, ia + 1)].reverse(); // also a → b
  const bulgeOf = (chain: Point[]) =>
    chain.reduce((m, p) => (Math.abs(side(p, a, b)) > Math.abs(m) ? side(p, a, b) : m), 0);
  const [outerChain, innerChain] =
    Math.abs(bulgeOf(chainA)) >= Math.abs(bulgeOf(chainB)) ? [chainA, chainB] : [chainB, chainA];
  // Inner edge ends: the last points still on the tips' line at each end (flat cuts)
  const onLine = (p: Point) => Math.abs(side(p, a, b)) < 0.6;
  let s = 0;
  while (s < innerChain.length - 2 && onLine(innerChain[s + 1])) s++;
  let e = innerChain.length - 1;
  while (e > s + 1 && onLine(innerChain[e - 1])) e--;
  const ia2 = innerChain[s];
  const ib2 = innerChain[e];
  const innerBulge = innerChain
    .slice(s, e + 1)
    .reduce((m, p) => (Math.abs(side(p, ia2, ib2)) > Math.abs(m) ? side(p, ia2, ib2) : m), 0);
  return { outer: { a, b, bulge: bulgeOf(outerChain) }, inner: { a: ia2, b: ib2, bulge: innerBulge } };
}

/** Reverse a crescent's direction (a ↔ b), flipping its bulges to match. */
const flip = (c: Crescent): Crescent => ({
  outer: { a: c.outer.b, b: c.outer.a, bulge: -c.outer.bulge },
  inner: { a: c.inner.b, b: c.inner.a, bulge: -c.inner.bulge },
});

/**
 * Start and end crescents for each morph, with the end oriented to match the start (the
 * bulge on the same side of travel), so the shape turns rather than turning inside out.
 */
export function fitMorphs() {
  return MORPHS.map((m) => {
    const from = fit(m.from.d);
    let to = fit(m.to.d);
    if (Math.sign(to.outer.bulge) !== Math.sign(from.outer.bulge)) to = flip(to);
    return { from, to };
  });
}

const lerp = (x: number, y: number, t: number) => x + (y - x) * t;
const lerpP = (p: Point, q: Point, t: number): Point => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const lerpEdge = (e: Edge, f: Edge, t: number): Edge => ({
  a: lerpP(e.a, f.a, t),
  b: lerpP(e.b, f.b, t),
  bulge: lerp(e.bulge, f.bulge, t),
});

/** SVG arc command along a circular edge from its a to its b with the given bulge. */
function arcTo(e: Edge, reverse = false) {
  const [from, to, bulge] = reverse ? [e.b, e.a, -e.bulge] : [e.a, e.b, e.bulge];
  const c = dist(from, to) || 0.001;
  const h = Math.abs(bulge) || 0.001;
  const r = (c * c) / (8 * h) + h / 2;
  const large = h > c / 2 ? 1 : 0;
  // side() is positive to the left of travel on screen (y down); bowing that way from
  // a to b is a clockwise sweep, which SVG writes as sweep-flag 1
  const sweep = bulge > 0 ? 1 : 0;
  return `A${r.toFixed(3)} ${r.toFixed(3)} 0 ${large} ${sweep} ${to[0].toFixed(3)} ${to[1].toFixed(3)}`;
}

/** The crescent part-way between two, as a path. */
export function crescentAt(from: Crescent, to: Crescent, t: number) {
  const o = lerpEdge(from.outer, to.outer, t);
  const i = lerpEdge(from.inner, to.inner, t);
  const f = (p: Point) => `${p[0].toFixed(3)} ${p[1].toFixed(3)}`;
  return `M${f(o.a)} ${arcTo(o)} L${f(i.b)} ${arcTo(i, true)} Z`;
}
