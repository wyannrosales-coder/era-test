import { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { Material, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { ModelView } from './amenityModel';

type Props = {
  src: string;
  /** The camera view to settle on; changing it flies the camera there. */
  view: ModelView;
  /** The model's parts to light up: any node whose name contains one of these ('' = all). */
  parts: string[];
  /** A card with a leader line to a spot on the building (model units); null for none. */
  callout?: { title: string; image: string; anchor: [number, number, number] } | null;
  onLoaded?: () => void;
  /** Whether the section is on screen (the render loop sleeps when it isn't). */
  active?: boolean;
};

type Part = { mesh: Mesh; material: MeshStandardMaterial; base: number; shown: number; name: string };

const DIM = 0.12;
const GOLD = new Color('#c9a46a');
const rad = (d: number) => (d * Math.PI) / 180;
/** Node names come back from the loader with spaces and slashes rewritten, so compare letters only. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The 3D building (three.js): the whole model with the chosen amenity's parts lit and the
 * rest faded back, the camera flying to its view. Drag to orbit; the next amenity takes
 * the camera back. The GLB loads when this mounts, so it is only imported when needed.
 */
export default function BuildingViewer({ src, view, parts, callout = null, onLoaded, active = true }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const lead = useRef<SVGSVGElement>(null);
  const live = useRef({ view, parts, active, callout });
  live.current = { view, parts, active, callout };
  const api = useRef<{ viewChanged: () => void } | null>(null);

  useEffect(() => {
    api.current?.viewChanged();
  }, [view]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.add(new HemisphereLight(0xffffff, 0x8a8278, 0.9));
    const sun = new DirectionalLight(0xfff0dc, 2.4);
    sun.position.set(40, 70, 30);
    scene.add(sun);
    const fill = new DirectionalLight(0xdfe8ff, 0.6);
    fill.position.set(-40, 30, -30);
    scene.add(fill);

    const camera = new PerspectiveCamera(30, 1, 1, 600);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    // The wheel scrolls the page (it steps through the amenities); drag is the only control
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.6;
    controls.maxPolarAngle = rad(88);
    controls.minPolarAngle = rad(8);

    let sphere = new Sphere(new Vector3(0, 17, 0), 34);
    const pieces: Part[] = [];
    let userMoved = false;
    let fitDist = 100;

    const goal = { target: new Vector3(), az: 0, el: 0, dist: 100 };
    const setGoal = () => {
      const v = live.current.view;
      goal.target.set(...v.target);
      goal.az = rad(v.azimuth);
      goal.el = rad(v.elevation);
      goal.dist = fitDist * v.distance;
    };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      const vf = rad(camera.fov) / 2;
      const hf = Math.atan(Math.tan(vf) * camera.aspect);
      fitDist = (sphere.radius / Math.sin(Math.min(vf, hf))) * 0.92;
      camera.updateProjectionMatrix();
      setGoal();
    };

    const place = (t: Vector3, az: number, el: number, dist: number) => {
      camera.position.set(
        t.x + dist * Math.cos(el) * Math.sin(az),
        t.y + dist * Math.sin(el),
        t.z + dist * Math.cos(el) * Math.cos(az),
      );
      controls.target.copy(t);
    };

    api.current = {
      viewChanged: () => {
        userMoved = false;
        setGoal();
      },
    };
    controls.addEventListener('start', () => {
      userMoved = true;
    });

    let raf = 0;
    let first = true;
    const cur = { target: new Vector3(), az: 0, el: 0, dist: 100 };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!live.current.active) return;
      const k = reduce ? 1 : 0.075;

      // Fade each part toward lit or faded
      const wanted = live.current.parts.map(norm);
      const all = wanted.includes('');
      for (const p of pieces) {
        const on = all || wanted.some((s) => p.name.includes(s));
        const to = on ? 1 : DIM;
        p.shown += (to - p.shown) * (reduce ? 1 : 0.12);
        p.material.opacity = p.base * p.shown;
        const solid = p.shown > 0.98 && p.base >= 1;
        if (p.material.transparent === solid) {
          p.material.transparent = !solid;
          p.material.needsUpdate = true;
        }
        p.material.depthWrite = p.shown > 0.5;
        p.material.emissive.copy(GOLD).multiplyScalar(!all && on ? 0.16 : 0);
      }

      if (!userMoved) {
        if (first) {
          cur.target.copy(goal.target);
          cur.az = goal.az - rad(40);
          cur.el = goal.el;
          cur.dist = goal.dist * 1.15;
          first = false;
        }
        cur.target.lerp(goal.target, k);
        cur.az += (goal.az - cur.az) * k;
        cur.el += (goal.el - cur.el) * k;
        cur.dist += (goal.dist - cur.dist) * k;
        place(cur.target, cur.az, cur.el, cur.dist);
      } else {
        // Dragged: it stays where it was left, but follows the zoom limits
        cur.target.copy(controls.target);
        const off = camera.position.clone().sub(controls.target);
        cur.dist = off.length();
        cur.az = Math.atan2(off.x, off.z);
        cur.el = Math.asin(off.y / (cur.dist || 1));
      }
      controls.update();
      renderer.render(scene, camera);
      placeCallout();
    };

    // The card and its line: the card sits to one side of the spot (above it in the lower
    // half of the view, below it in the upper half), the line runs out of the card's side
    // and turns down or up to the dot, as in a labelled diagram.
    const spot = new Vector3();
    const placeCallout = () => {
      const c = card.current;
      const svg = lead.current;
      if (!c || !svg) return;
      const co = live.current.callout;
      if (!co) {
        c.style.opacity = '0';
        svg.style.opacity = '0';
        return;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      spot.set(...co.anchor).project(camera);
      const ax = ((spot.x + 1) / 2) * w;
      const ay = ((1 - spot.y) / 2) * h;
      const cw = c.offsetWidth;
      const ch = c.offsetHeight;
      const gap = 44;
      const left = ax < w / 2;
      const cx = Math.min(Math.max(left ? ax + gap : ax - gap - cw, 12), w - cw - 12);
      const above = ay > h * 0.5;
      const cy = Math.min(Math.max(above ? ay - 70 - ch : ay + 70, 12), h - ch - 12);
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      const sx = ax < cx ? cx : cx + cw;
      const sy = cy + ch / 2;
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      const line = svg.querySelector('polyline');
      line?.setAttribute('points', `${sx},${sy} ${ax},${sy} ${ax},${ay}`);
      const dot = svg.querySelector('circle');
      dot?.setAttribute('cx', String(ax));
      dot?.setAttribute('cy', String(ay));
      c.style.opacity = '1';
      svg.style.opacity = '1';
    };

    let disposed = false;
    new GLTFLoader().load(src, (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      model.traverse((o: Object3D) => {
        const m = o as Mesh;
        if (!m.isMesh) return;
        const src = m.material as Material;
        const mat = (src as MeshStandardMaterial).clone();
        mat.envMapIntensity = 0.9;
        m.material = mat;
        pieces.push({ mesh: m, material: mat, base: mat.opacity, shown: 1, name: norm(m.name || o.parent?.name || '') });
      });
      scene.add(model);
      sphere = new Box3().setFromObject(model).getBoundingSphere(new Sphere());
      resize();
      onLoaded?.();
    });

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      for (const p of pieces) p.material.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
    // The model is loaded once; view and parts are read live
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <>
      <div ref={host} className="a3d__canvas" role="img" aria-label="3D model of the building: drag to look around" />
      <svg ref={lead} className="a3d__lead" aria-hidden>
        <polyline fill="none" />
        <circle r="6" />
      </svg>
      <div ref={card} className="a3d__card" aria-hidden>
        {callout && (
          <div key={callout.title} className="a3d__card-in">
            <img src={callout.image} alt="" />
            <span>{callout.title}</span>
          </div>
        )}
      </div>
    </>
  );
}
