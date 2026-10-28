#!/usr/bin/env python3
"""Hand-drawn ink layer for the "Life beyond the classroom" section.

Writes three SVGs into dist/assets/ink/ : ink-d.svg (landscape), ink-m.svg (portrait) and secret.svg (a sticky note that
fades in once enough photos have been dragged away). Everything is drawn from a tiny single-stroke handwriting font and a
handful of doodles, with a seeded wobble so each line looks pen-drawn. Re-run after editing the layouts:

    python3 tools/make-ink.py
"""
import math, os, random

INK = '#15110e'
OUT = os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets', 'ink')

# ---- single-stroke handwriting font: baseline y=0, x-height 10, ascender 18, descender 7 (y down) ----
G = {
 'a': [[(8,-9),(5,-10),(2,-8),(1,-5),(2,-2),(5,0),(8,-2)], [(8,-10),(8,-1),(10,0)]],
 'b': [[(1,-18),(1,0)], [(1,-6),(3,-9),(6,-10),(8,-8),(8,-3),(6,0),(3,0),(1,-3)]],
 'c': [[(8,-8),(6,-10),(3,-10),(1,-7),(1,-3),(3,0),(6,0),(8,-2)]],
 'd': [[(8,-9),(5,-10),(2,-8),(1,-5),(2,-2),(5,0),(8,-2)], [(8,-18),(8,-1),(10,0)]],
 'e': [[(1,-5),(8,-5),(8,-8),(5,-10),(2,-9),(1,-5),(1,-2),(3,0),(6,0),(8,-2)]],
 'f': [[(9,-17),(6,-18),(4,-16),(4,0)], [(1,-10),(8,-10)]],
 'g': [[(8,-9),(5,-10),(2,-8),(1,-5),(2,-2),(5,0),(8,-2)], [(8,-10),(8,4),(6,7),(2,6)]],
 'h': [[(1,-18),(1,0)], [(1,-6),(3,-9),(6,-10),(8,-7),(8,0)]],
 'i': [[(2,-10),(2,0)], [(2,-14),(2,-14.6)]],
 'j': [[(3,-10),(3,4),(1,7),(-1,6)], [(3,-14),(3,-14.6)]],
 'k': [[(1,-18),(1,0)], [(8,-10),(1,-4)], [(3,-6),(8,0)]],
 'l': [[(2,-18),(2,-1),(4,0)]],
 'm': [[(1,-10),(1,0)], [(1,-7),(3,-10),(5,-9),(6,-6),(6,0)], [(6,-6),(8,-10),(10,-9),(11,-6),(11,0)]],
 'n': [[(1,-10),(1,0)], [(1,-7),(3,-10),(6,-10),(8,-7),(8,0)]],
 'o': [[(5,-10),(2,-8),(1,-5),(2,-2),(5,0),(8,-2),(9,-5),(8,-8),(5,-10)]],
 'p': [[(1,-10),(1,7)], [(1,-6),(3,-9),(6,-10),(8,-8),(8,-3),(6,0),(3,0),(1,-3)]],
 'q': [[(8,-9),(5,-10),(2,-8),(1,-5),(2,-2),(5,0),(8,-2)], [(8,-10),(8,7)]],
 'r': [[(1,-10),(1,0)], [(1,-6),(3,-9),(6,-10),(8,-9)]],
 's': [[(8,-9),(5,-10),(2,-9),(2,-6),(5,-5),(8,-3),(8,-1),(5,0),(1,-1)]],
 't': [[(3,-16),(3,-2),(5,0),(7,0)], [(0,-10),(7,-10)]],
 'u': [[(1,-10),(1,-3),(3,0),(6,0),(8,-3)], [(8,-10),(8,0)]],
 'v': [[(1,-10),(4.5,0),(8,-10)]],
 'w': [[(1,-10),(3,0),(6,-8),(9,0),(11,-10)]],
 'x': [[(1,-10),(8,0)], [(8,-10),(1,0)]],
 'y': [[(1,-10),(4,0)], [(8,-10),(4,0),(2,7),(0,7)]],
 'z': [[(1,-10),(8,-10),(1,0),(8,0)]],
 '0': [[(5,-16),(2,-13),(1,-8),(2,-3),(5,0),(8,-3),(9,-8),(8,-13),(5,-16)]],
 '1': [[(2,-14),(4,-16),(4,0)]],
 '2': [[(1,-13),(3,-16),(6,-16),(8,-13),(7,-9),(1,0),(9,0)]],
 '3': [[(1,-15),(4,-16),(8,-14),(8,-11),(4,-9),(8,-7),(8,-2),(4,0),(1,-1)]],
 '4': [[(7,0),(7,-16),(1,-5),(10,-5)]],
 '5': [[(8,-16),(2,-16),(1,-9),(5,-10),(8,-8),(8,-3),(5,0),(1,-1)]],
 '6': [[(8,-16),(3,-12),(1,-6),(2,-1),(5,0),(8,-2),(8,-6),(5,-8),(2,-6)]],
 '7': [[(1,-16),(9,-16),(4,0)]],
 '8': [[(5,-9),(2,-11),(2,-15),(5,-16),(8,-15),(8,-11),(5,-9),(1,-6),(1,-2),(5,0),(9,-2),(9,-6),(5,-9)]],
 '9': [[(8,-9),(5,-10),(2,-9),(1,-13),(3,-16),(6,-16),(8,-13),(8,-8),(6,-2),(2,0)]],
 '?': [[(1,-14),(2,-17),(5,-17),(7,-14),(4,-9),(4,-6)], [(4,-1),(4,-0.5)]],
 '!': [[(3,-18),(3,-5)], [(3,-1),(3,-0.5)]],
 '.': [[(2,-1),(2,-0.4)]],
 ',': [[(2,-1),(2,1),(1,3)]],
 ':': [[(2,-9),(2,-8.5)], [(2,-1),(2,-0.4)]],
 "'": [[(2,-17),(2,-12)]],
 '-': [[(1,-6),(6,-6)]],
 '/': [[(1,2),(7,-16)]],
 '&': [[(9,0),(3,-9),(3,-13),(6,-14),(7,-11),(1,-5),(1,-2),(4,0),(7,-1),(9,-5)]],
 '$': [[(8,-13),(5,-15),(2,-13),(2,-10),(5,-8),(8,-6),(8,-3),(5,-1),(1,-3)], [(5,-18),(5,1)]],
 '(': [[(5,-18),(2,-12),(2,-4),(5,2)]],
 ')': [[(1,-18),(4,-12),(4,-4),(1,2)]],
 '+': [[(1,-8),(9,-8)], [(5,-12),(5,-4)]],
 '=': [[(1,-10),(9,-10)], [(1,-5),(9,-5)]],
 '@': [[(7,-4),(7,-9),(4,-10),(2,-7),(3,-4),(7,-4)], [(7,-4),(8,-2),(10,-4),(11,-9),(8,-13),(4,-13),(1,-9),(1,-4),(4,-1),(9,-1)]],
}
UPPER = {  # a few capitals used for words that should shout
 'I': [[(3,-18),(3,0)], [(0,-18),(6,-18)], [(0,0),(6,0)]],
 'A': [[(1,0),(6,-18),(11,0)], [(3,-7),(9,-7)]],
 'B': [[(1,-18),(1,0)], [(1,-18),(7,-17),(8,-13),(6,-10),(1,-9)], [(1,-9),(8,-8),(9,-4),(7,-1),(1,0)]],
 'C': [[(10,-15),(7,-18),(3,-17),(1,-11),(1,-6),(3,-1),(7,0),(10,-3)]],
 'D': [[(1,-18),(1,0)], [(1,-18),(6,-17),(9,-12),(9,-6),(6,-1),(1,0)]],
 'E': [[(9,-18),(1,-18),(1,0),(9,0)], [(1,-9),(7,-9)]],
 'F': [[(9,-18),(1,-18),(1,0)], [(1,-9),(7,-9)]],
 'G': [[(10,-15),(7,-18),(3,-17),(1,-11),(1,-6),(3,-1),(7,0),(10,-3),(10,-8),(6,-8)]],
 'H': [[(1,-18),(1,0)], [(9,-18),(9,0)], [(1,-9),(9,-9)]],
 'L': [[(1,-18),(1,0),(9,0)]],
 'M': [[(1,0),(1,-18),(6,-6),(11,-18),(11,0)]],
 'N': [[(1,0),(1,-18),(10,0),(10,-18)]],
 'O': [[(6,-18),(2,-15),(1,-9),(2,-3),(6,0),(10,-3),(11,-9),(10,-15),(6,-18)]],
 'P': [[(1,-18),(1,0)], [(1,-18),(7,-17),(9,-13),(7,-9),(1,-8)]],
 'R': [[(1,-18),(1,0)], [(1,-18),(7,-17),(9,-13),(7,-9),(1,-8)], [(5,-8),(10,0)]],
 'S': [[(10,-15),(7,-18),(3,-17),(2,-13),(5,-9),(9,-6),(9,-2),(6,0),(1,-2)]],
 'T': [[(0,-18),(10,-18)], [(5,-18),(5,0)]],
 'U': [[(1,-18),(1,-4),(3,0),(8,0),(10,-4),(10,-18)]],
 'W': [[(1,-18),(3,0),(6,-12),(9,0),(11,-18)]],
 'Y': [[(1,-18),(5,-9),(9,-18)], [(5,-9),(5,0)]],
}
G.update(UPPER)

def rng(seed): return random.Random(seed)

def smooth(pts, tension=0.5):
    """Catmull-Rom -> cubic bezier path data."""
    if len(pts) == 1: return 'M%.1f %.1f' % pts[0] + 'l0.1 0.1'
    if len(pts) == 2: return 'M%.1f %.1f L%.1f %.1f' % (pts[0] + pts[1])
    d = 'M%.1f %.1f' % pts[0]
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[i + 2] if i + 2 < len(pts) else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) * tension / 3 * 2 / 2, p1[1] + (p2[1] - p0[1]) * tension / 3 * 2 / 2)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension / 3 * 2 / 2, p2[1] - (p3[1] - p1[1]) * tension / 3 * 2 / 2)
        d += ' C%.1f %.1f %.1f %.1f %.1f %.1f' % (c1 + c2 + p2)
    return d

class Page:
    def __init__(self, w, h, seed):
        self.w, self.h, self.r, self.parts, self.boxes = w, h, rng(seed), [], []
    def path(self, pts, sw=2.6, op=0.92, closed=False):
        if closed: pts = pts + [pts[0]]
        self.parts.append('<path d="%s" stroke-width="%.2f" opacity="%.2f"/>' % (smooth(pts), sw, op))
    def wob(self, pts, a):
        r = self.r
        return [(x + r.uniform(-a, a), y + r.uniform(-a, a)) for x, y in pts]
    def xf(self, pts, x, y, s, rot=0, slant=0.0, flip=1):
        c, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot)); out = []
        for px, py in pts:
            px, py = px * s * flip, py * s
            px += -py * slant
            out.append((x + px * c - py * sn, y + px * sn + py * c))
        return out
    # --- lettering ---
    def text(self, s, x, y, size=3.4, rot=0, slant=0.16, sw=None, ulinesw=None, underline=False, op=0.92):
        r = self.r; sw = sw or 1.0 * size; cx = 0.0; base_wob = r.uniform(0, 6)
        for i, ch in enumerate(s):
            if ch == ' ': cx += 6 + r.uniform(-1, 1); continue
            glyph = G.get(ch)
            if glyph is None: cx += 8; continue
            ww = max(px for st in glyph for px, _ in st) + 2.6
            lift = math.sin(i * 0.9 + base_wob) * 0.9 + r.uniform(-0.5, 0.5)
            ls = r.uniform(0.94, 1.08)
            for st in glyph:
                pts = [(px * ls + cx, py * ls + lift) for px, py in st]
                pts = self.wob(pts, 0.28)
                pts = self.xf(pts, x, y, size, rot, slant)
                self.path(pts, sw, op)
            cx += ww * ls + r.uniform(-0.2, 0.5)
        width = cx * size
        c0, s0 = math.cos(math.radians(rot)), math.sin(math.radians(rot))
        self.boxes.append((s, x, y - 18 * size, x + width * c0, y + 7 * size + width * abs(s0)))
        if underline:
            self.squiggle(x - 4, y + 7 * size * 0.5, width + 8, rot, amp=1.6, sw=sw * 0.9)
        return width
    def width(self, s, size=3.4):
        cx = 0.0
        for ch in s:
            if ch == ' ': cx += 6; continue
            g = G.get(ch)
            cx += (max(px for st in g for px, _ in st) + 2.6) if g else 8
        return cx * size
    # --- bits and bobs ---
    def squiggle(self, x, y, w, rot=0, amp=2.2, sw=2.2):
        n = max(3, int(w / 22)); pts = []
        for i in range(n + 1):
            pts.append((i * w / n, (amp if i % 2 else -amp) + self.r.uniform(-.7, .7)))
        self.path(self.xf(pts, x, y, 1, rot), sw)
    def arrow(self, p0, p1, bend=30, sw=2.6, head=13):
        mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]; L = math.hypot(dx, dy) or 1
        c = (mx - dy / L * bend, my + dx / L * bend)
        pts = [p0, ((p0[0] + c[0]) / 2 + 0, (p0[1] + c[1]) / 2), c, ((c[0] + p1[0]) / 2, (c[1] + p1[1]) / 2), p1]
        self.path(self.wob(pts, 1.0), sw)
        ang = math.atan2(p1[1] - c[1], p1[0] - c[0])
        for da in (2.6, -2.6):
            a = ang + math.pi + da * 0.22
            self.path([p1, (p1[0] + head * math.cos(a), p1[1] + head * math.sin(a))], sw)
    def circle(self, cx, cy, rx, ry=None, sw=2.4, turns=1.15, rot=0):
        ry = ry or rx; pts = []; n = 22; a0 = self.r.uniform(0, 6.28)
        for i in range(int(n * turns) + 1):
            a = a0 + i / n * 2 * math.pi; k = 1 + 0.05 * (i / n)
            pts.append((cx + rx * k * math.cos(a) + self.r.uniform(-1, 1), cy + ry * k * math.sin(a) + self.r.uniform(-1, 1)))
        self.path(pts, sw)
    def poly(self, pts, x, y, s, rot=0, sw=2.4, a=0.5, closed=False, flip=1):
        self.path(self.wob(self.xf(pts, x, y, s, rot, 0, flip), a), sw, closed=closed)
    # --- doodles (local origin at 0,0, ~40 units across) ---
    def star(self, x, y, s=1, rot=0, sw=2.4):
        pts = [(math.cos(math.radians(90 + k * 144)) * 18, -math.sin(math.radians(90 + k * 144)) * 18) for k in range(6)]
        self.poly(pts, x, y, s, rot, sw, 0.7)
    def spark(self, x, y, s=1, rot=0, sw=2.2):
        self.poly([(0, -14), (0, 14)], x, y, s, rot, sw, .3); self.poly([(-14, 0), (14, 0)], x, y, s, rot, sw, .3)
        self.poly([(-8, -8), (8, 8)], x, y, s, rot, sw, .3); self.poly([(8, -8), (-8, 8)], x, y, s, rot, sw, .3)
    def heart(self, x, y, s=1, rot=0, sw=2.4):
        pts = []
        for i in range(0, 25):
            t = i / 24 * 2 * math.pi
            pts.append((16 * math.sin(t) ** 3 * .9, -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)) * .9))
        self.poly(pts, x, y, s, rot, sw, .5)
    def spiral(self, x, y, s=1, rot=0, sw=2.2):
        pts = [(math.cos(t) * (1.2 + t * 1.6), math.sin(t) * (1.2 + t * 1.6)) for t in [i * 0.35 for i in range(0, 36)]]
        self.poly(pts, x, y, s, rot, sw, .4)
    def plane(self, x, y, s=1, rot=0, sw=2.4):
        self.poly([(0, 10), (46, -14), (20, 16), (16, 8), (46, -14)], x, y, s, rot, sw, .6)
        self.poly([(16, 8), (10, 22), (20, 16)], x, y, s, rot, sw, .6)
        self.poly([(-26, 20), (-12, 14)], x, y, s, rot, sw, .8); self.poly([(-38, 12), (-26, 8)], x, y, s, rot, sw, .8)
    def cup(self, x, y, s=1, rot=0, sw=2.4):
        self.poly([(0, 0), (4, 26), (26, 26), (30, 0), (0, 0)], x, y, s, rot, sw, .6)
        self.poly([(30, 6), (40, 6), (40, 18), (28, 18)], x, y, s, rot, sw, .6)
        self.poly([(8, -4), (4, -12), (10, -18)], x, y, s, rot, sw, .6); self.poly([(18, -4), (14, -12), (20, -18)], x, y, s, rot, sw, .6)
        self.poly([(-4, 31), (34, 31)], x, y, s, rot, sw, .5)
    def ball(self, x, y, s=1, rot=0, sw=2.4):
        pts = [(math.cos(i / 20 * 6.4) * 17, math.sin(i / 20 * 6.4) * 17) for i in range(21)]
        self.poly(pts, x, y, s, rot, sw, .6)
        pen = [(math.cos(math.radians(-90 + k * 72)) * 6.5, math.sin(math.radians(-90 + k * 72)) * 6.5) for k in range(6)]
        self.poly(pen, x, y, s, rot, sw * .9, .3)
        for k in range(5):
            a = math.radians(-90 + k * 72); self.poly([(math.cos(a) * 6.5, math.sin(a) * 6.5), (math.cos(a) * 17, math.sin(a) * 17)], x, y, s, rot, sw * .9, .3)
    def notes(self, x, y, s=1, rot=0, sw=2.4):
        self.poly([(10, 0), (10, -28), (24, -22), (24, 2)], x, y, s, rot, sw, .5)
        for ox in (0, 14): self.poly([(ox + 4, 3), (ox + 1, 0), (ox + 4, -3), (ox + 9, -1), (ox + 8, 3), (ox + 4, 3)], x, y, s, rot, sw, .3)
    def bulb(self, x, y, s=1, rot=0, sw=2.4):
        pts = [(math.cos(t) * 13, math.sin(t) * 13 - 4) for t in [(-0.9 + i * 0.28) for i in range(0, 20)]]
        self.poly(pts, x, y, s, rot, sw, .5); self.poly([(-6, 13), (6, 13)], x, y, s, rot, sw, .3); self.poly([(-5, 18), (5, 18)], x, y, s, rot, sw, .3)
        for a in (-70, -35, 0, 35, 70):
            ra = math.radians(a - 90); self.poly([(math.cos(ra) * 20, math.sin(ra) * 20 - 4), (math.cos(ra) * 27, math.sin(ra) * 27 - 4)], x, y, s, rot, sw * .9, .3)
    def smile(self, x, y, s=1, rot=0, sw=2.4):
        pts = [(math.cos(i / 20 * 6.4) * 15, math.sin(i / 20 * 6.4) * 15) for i in range(21)]
        self.poly(pts, x, y, s, rot, sw, .6)
        self.poly([(-5, -4), (-5, -3)], x, y, s, rot, sw * 1.2, .1); self.poly([(5, -4), (5, -3)], x, y, s, rot, sw * 1.2, .1)
        self.poly([(-7, 4), (-3, 8), (3, 8), (7, 4)], x, y, s, rot, sw, .3)
    def cat(self, x, y, s=1, rot=0, sw=2.4):
        pts = [(math.cos(i / 22 * 6.4) * 15, math.sin(i / 22 * 6.4) * 13) for i in range(23)]
        self.poly(pts, x, y, s, rot, sw, .5)
        self.poly([(-14, -6), (-14, -20), (-5, -12)], x, y, s, rot, sw, .4); self.poly([(14, -6), (14, -20), (5, -12)], x, y, s, rot, sw, .4)
        self.poly([(-5, -2), (-5, -1)], x, y, s, rot, sw * 1.2, .1); self.poly([(5, -2), (5, -1)], x, y, s, rot, sw * 1.2, .1)
        self.poly([(-2, 3), (2, 3), (0, 5), (-2, 3)], x, y, s, rot, sw * .8, .1)
        for oy in (-1, 2): self.poly([(-9, 3 + oy), (-24, 1 + oy * 2)], x, y, s, rot, sw * .8, .3); self.poly([(9, 3 + oy), (24, 1 + oy * 2)], x, y, s, rot, sw * .8, .3)
    def sun(self, x, y, s=1, rot=0, sw=2.4):
        pts = [(math.cos(i / 16 * 6.4) * 9, math.sin(i / 16 * 6.4) * 9) for i in range(17)]
        self.poly(pts, x, y, s, rot, sw, .4)
        for k in range(8):
            a = math.radians(k * 45); self.poly([(math.cos(a) * 14, math.sin(a) * 14), (math.cos(a) * 22, math.sin(a) * 22)], x, y, s, rot, sw, .4)
    def train(self, x, y, s=1, rot=0, sw=2.4):
        self.poly([(0, 0), (74, 0), (80, 10), (80, 30), (0, 30), (0, 0)], x, y, s, rot, sw, .8)
        for k in range(3): self.poly([(8 + k * 22, 6), (24 + k * 22, 6), (24 + k * 22, 16), (8 + k * 22, 16), (8 + k * 22, 6)], x, y, s, rot, sw * .8, .5)
        self.poly([(0, 24), (80, 24)], x, y, s, rot, sw * .8, .5)
        for ox in (14, 62): self.poly([(math.cos(i / 12 * 6.4) * 5 + ox, math.sin(i / 12 * 6.4) * 5 + 35) for i in range(13)], x, y, s, rot, sw * .9, .3)
        self.poly([(-10, 41), (92, 41)], x, y, s, rot, sw * .8, .6)
        for k in range(7): self.poly([(k * 14, 41), (k * 14 - 4, 47)], x, y, s, rot, sw * .6, .4)
    def tree(self, x, y, s=1, rot=0, sw=2.4):
        self.poly([(0, 0), (0, 30)], x, y, s, rot, sw, .5); self.poly([(-9, 30), (9, 30)], x, y, s, rot, sw, .4)
        cl = []
        for i in range(0, 25):
            t = i / 24 * 2 * math.pi
            rr = 22 + 5 * math.sin(t * 5)
            cl.append((math.cos(t) * rr, math.sin(t) * rr * 0.9 - 24))
        self.poly(cl, x, y, s, rot, sw, .6)
    def mall(self, x, y, s=1, rot=0, sw=2.4):
        self.poly([(0, 36), (0, 6), (14, 6), (14, 0), (70, 0), (70, 36), (0, 36)], x, y, s, rot, sw, .7)
        self.poly([(18, 8), (66, 8)], x, y, s, rot, sw * .8, .4)
        for k in range(4): self.poly([(22 + k * 11, 14), (28 + k * 11, 14), (28 + k * 11, 22), (22 + k * 11, 22), (22 + k * 11, 14)], x, y, s, rot, sw * .7, .3)
        self.poly([(8, 36), (8, 20), (3, 20)], x, y, s, rot, sw * .7, .3)
    def bike(self, x, y, s=1, rot=0, sw=2.4):
        for ox in (0, 36): self.poly([(math.cos(i / 16 * 6.4) * 11 + ox, math.sin(i / 16 * 6.4) * 11) for i in range(17)], x, y, s, rot, sw, .5)
        self.poly([(0, 0), (14, -17), (36, 0)], x, y, s, rot, sw, .4); self.poly([(14, -17), (27, -17), (36, 0)], x, y, s, rot, sw, .4)
        self.poly([(27, -17), (31, -26), (38, -26)], x, y, s, rot, sw, .4); self.poly([(9, -20), (19, -20)], x, y, s, rot, sw, .4)
    def tally(self, x, y, n=5, s=1, rot=0, sw=2.4):
        for k in range(min(4, n)): self.poly([(k * 7, 0), (k * 7 + r_(self), 22)], x, y, s, rot, sw, .5)
        if n >= 5: self.poly([(-5, 17), (4 * 7 + 3, 4)], x, y, s, rot, sw, .5)
    def xmark(self, x, y, s=1, rot=0, sw=2.6):
        self.poly([(-9, -9), (9, 9)], x, y, s, rot, sw, .6); self.poly([(9, -9), (-9, 9)], x, y, s, rot, sw, .6)
    def box(self, x, y, w, h, rot=0, sw=2.2):
        self.poly([(0, 0), (w, 0), (w, h), (0, h), (0, 0)], x, y, 1, rot, sw, 1.2)
    def check(self, x, y, s=1, rot=0, sw=2.6):
        self.poly([(-9, 0), (-3, 8), (11, -10)], x, y, s, rot, sw, .5)
    def svg(self, extra=''):
        return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" fill="none" stroke="%s" stroke-linecap="round" stroke-linejoin="round">%s%s</svg>'
                % (self.w, self.h, INK, extra, ''.join(self.parts)))

def r_(p): return p.r.uniform(-2, 2)

# ---------------------------------------------------------------- layout helpers
def hit(a, b, pad=4):
    return a[0] - pad < b[2] and b[0] - pad < a[2] and a[1] - pad < b[3] and b[1] - pad < a[3]

def place(p, kind, arg, size, rot=0, underline=False, avoid=(), tries=500, region=None):
    """Drop a note or doodle at a random free spot; first candidate wins."""
    r = p.r; x0, y0, x1, y1 = region or (30, 40, p.w - 30, p.h - 30)
    for _ in range(tries):
        x, y = r.uniform(x0, x1), r.uniform(y0, y1)
        if kind == 'text':
            w = p.width(arg, size); box = (x - 4, y - 19 * size - (w * abs(math.sin(math.radians(rot))) if rot < 0 else 0), x + w + 4, y + 8 * size + (w * abs(math.sin(math.radians(rot))) if rot > 0 else 0))
        else:
            box = (x - 22 * size, y - 28 * size, x + 46 * size, y + 38 * size)
        if box[2] > p.w - 8 or box[3] > p.h - 8 or box[0] < 8 or box[1] < 8: continue
        if any(hit(box, o) for o in p.boxes2) or any(hit(box, o, 0) for o in avoid): continue
        p.boxes2.append(box)
        if kind == 'text': p.text(arg, x, y, size, rot, underline=underline)
        else: getattr(p, arg)(x, y, size, rot)
        return (x, y, box)
    print('could not place', arg); return None

def build(p, items, avoid):
    items = sorted(items, key=lambda it: 0 if it[0] == 'text' else 1)
    for it in items:
        kind, arg, size, rot = it[:4]; opt = it[4] if len(it) > 4 else {}
        place(p, kind, arg, size, rot, avoid=avoid, **opt)

# ---------------------------------------------------------------- desktop (1600 x 900)
def desktop():
    p = Page(1600, 900, 11); p.boxes2 = []
    avoid = [(480, 320, 1120, 580)]                    # the headline sits here
    T = lambda s, z, r_, **o: ('text', s, z, r_, o)
    D = lambda f, z, r_: ('doodle', f, z, r_)
    items = [
        T('study group 3pm', 2.6, -4, underline=True), T('pool day??', 3.0, 4), T('coffee run', 3.0, -3), T('movie night fri!', 2.7, 3, underline=True),
        T("don't forget: laundry!", 2.4, -3), T('4 min walk to uni', 2.5, 2), T('gym 6am (lol no)', 2.5, -2), T('exam week = survival mode', 2.3, 1.5, underline=True),
        T('rooftop sunset?', 3.0, -6), T('ask mum for $$', 2.7, 5), T('flatmates: 5', 2.5, -2), T('gelato after?', 2.8, -4), T('who has the aux cord', 2.3, 3),
        T('b-day on sat!!', 2.9, -7), T('trivia tues', 2.9, -4), T('book club?', 2.7, 4), T('4 mins', 2.5, -3), T('shops!', 2.7, -3), T('8 min ride', 2.4, -5),
        T('roomie wanted lol', 2.3, 3), T('pasta night', 2.7, -5), T('library > everything', 2.3, 2), T('late night maccas', 2.6, -3),
        D('train', 1.3, -3), D('tree', 1.6, 3), D('mall', 1.4, -3), D('bike', 1.3, -6), D('cup', 1.3, -6), D('sun', 1.6, 0), D('sun', 1.2, 0),
        D('star', 1.3, 12), D('star', 0.9, -10), D('star', 1.2, 8), D('heart', 1.1, -8), D('heart', 1.3, 10), D('heart', 1.0, -12),
        D('spiral', 1.5, 0), D('spiral', 1.3, 0), D('spiral', 1.1, 0), D('plane', 1.2, -15), D('plane', 1.3, 14), D('ball', 1.4, 10), D('notes', 1.4, 6),
        D('bulb', 1.3, -5), D('smile', 1.4, 6), D('cat', 1.4, -4), D('spark', 1.1, 0), D('spark', 0.9, 20), D('spark', 1.2, 0), D('spark', 1.0, 0),
        D('xmark', 1.0, 0), D('xmark', 1.1, 20), D('check', 1.1, 0), D('check', 1.0, 0),
    ]
    build(p, items, avoid)
    return p

# ---------------------------------------------------------------- phone (600 x 1000)
def phone():
    p = Page(600, 1000, 23); p.boxes2 = []
    avoid = [(40, 380, 560, 640)]
    T = lambda s, z, r_, **o: ('text', s, z, r_, o)
    D = lambda f, z, r_: ('doodle', f, z, r_)
    items = [
        T('study group 3pm', 1.9, -4, underline=True), T('pool day??', 2.2, 5), T('coffee run', 2.2, -3), T('movie night fri!', 2.0, 3, underline=True),
        T("don't forget: laundry!", 1.8, -3), T('4 min walk to uni', 1.8, 2), T('exam week = survival mode', 1.6, 1.5), T('rooftop sunset?', 2.1, -6),
        T('gelato after?', 2.0, -4), T('b-day on sat!!', 2.1, -6), T('pasta night', 2.0, -5), T('ask mum for $$', 1.9, 5),
        D('train', 0.85, -3), D('tree', 0.95, 4), D('mall', 0.9, -3), D('bike', 0.9, -5), D('cup', 0.9, -5), D('sun', 0.95, 0),
        D('star', 0.8, 12), D('heart', 0.85, -8), D('heart', 0.9, 10), D('spiral', 0.9, 0), D('plane', 0.85, -12), D('ball', 0.9, 8),
        D('notes', 0.9, 6), D('bulb', 0.8, 0), D('smile', 0.9, 0), D('cat', 0.9, -4), D('spark', 0.8, 0), D('xmark', 0.8, 0),
    ]
    build(p, items, avoid)
    return p

# ---------------------------------------------------------------- the sticky note (revealed by moving enough photos)
def secret():
    p = Page(560, 300, 5)
    note = ('<g transform="rotate(-3 280 150)"><rect x="14" y="14" width="532" height="272" rx="3" fill="#f7e9a8" stroke="none"/>'
            '<rect x="14" y="14" width="532" height="272" rx="3" fill="none" stroke="#c9b76a" stroke-width="1.4" opacity=".6"/>'
            '<path d="M200 6 L360 6 L352 40 L206 40 Z" fill="#fff" opacity=".55" stroke="none"/></g>')
    fit = lambda t, maxw=420: min(3.6, maxw / p.width(t, 1))
    t1, t2, t3 = 'psst... you found', 'the secret spot', 'tag us @epiisod.au'
    p.text(t1, 62, 112, fit(t1), -3, sw=fit(t1) * 0.9)
    p.text(t2, 62, 176, fit(t2), -3, sw=fit(t2) * 0.9)
    p.text(t3, 66, 244, fit(t3, 340), -3, sw=fit(t3, 340) * 0.9, underline=True)
    p.star(486, 232, 1.4, 12, 2.8)
    return p, note

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'ink-d.svg'), 'w').write(desktop().svg())
    open(os.path.join(OUT, 'ink-m.svg'), 'w').write(phone().svg())
    sp, note = secret()
    open(os.path.join(OUT, 'secret.svg'), 'w').write(sp.svg(note))
    for n in ('ink-d.svg', 'ink-m.svg', 'secret.svg'):
        print(n, os.path.getsize(os.path.join(OUT, n)) // 1024, 'KB')
