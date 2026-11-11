/**
 * A real-time 3D coin (three.js): a lathe-turned body with a rounded edge and raised rim,
 * a physically based metal lit by a studio environment so it reflects as it turns, and
 * the logo embossed into both faces from an SVG height map. Loaded on demand.
 */
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CircleGeometry,
  Color,
  DirectionalLight,
  Group,
  LatheGeometry,
  LinearSRGBColorSpace,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type CoinOptions = {
  /** URL of the logo SVG to emboss on both faces. */
  markUrl: string;
  /** Metal colour, e.g. '#d9d9d9' silver, '#c98a5e' bronze. */
  color: string;
  /** The coin's on-screen diameter is this fraction of the canvas (the rest is margin
   *  so the edge and perspective never clip as it turns). */
  fill?: number;
};

export type Coin = {
  /** Spin about the vertical axis, in radians. */
  setAngle: (radians: number) => void;
  /** Tilt toward/away from the viewer, in radians (small values). */
  setTilt: (radians: number) => void;
  render: () => void;
  resize: () => void;
  dispose: () => void;
};

// Coin proportions (radius = 1).
const R = 1;
const THICKNESS = 0.16;
const LIP_WIDTH = 0.1; // raised rim around each face
const LIP_HEIGHT = 0.025;
const EDGE_ROUND = 0.045;
const FIELD_R = R - LIP_WIDTH - 0.015;

/** Half-profile (x = radius, y = height) from the top-face centre round the edge to the bottom. */
function coinProfile(): Vector2[] {
  const top = THICKNESS / 2;
  const field = top - LIP_HEIGHT;
  const pts: Vector2[] = [];
  pts.push(new Vector2(0, field), new Vector2(FIELD_R, field));
  // soft step up onto the lip
  for (let i = 1; i <= 4; i++) {
    const t = i / 4;
    pts.push(new Vector2(FIELD_R + 0.015 * t, field + LIP_HEIGHT * (0.5 - 0.5 * Math.cos(Math.PI * t))));
  }
  pts.push(new Vector2(R - EDGE_ROUND, top));
  // rounded outer edge, top half → bottom half
  for (let i = 1; i <= 10; i++) {
    const a = (Math.PI / 2) * (1 - i / 10);
    pts.push(new Vector2(R - EDGE_ROUND + EDGE_ROUND * Math.cos(a), top - EDGE_ROUND + EDGE_ROUND * Math.sin(a)));
  }
  for (let i = 0; i <= 10; i++) {
    const a = -(Math.PI / 2) * (i / 10);
    pts.push(new Vector2(R - EDGE_ROUND + EDGE_ROUND * Math.cos(a), -top + EDGE_ROUND + EDGE_ROUND * Math.sin(a)));
  }
  pts.push(new Vector2(R - EDGE_ROUND, -top));
  for (let i = 3; i >= 0; i--) {
    const t = i / 4;
    pts.push(new Vector2(FIELD_R + 0.015 * t, -field - LIP_HEIGHT * (0.5 - 0.5 * Math.cos(Math.PI * t))));
  }
  pts.push(new Vector2(FIELD_R, -field), new Vector2(0, -field));
  return pts;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Face maps drawn on canvases: a height map (logo raised, softly bevelled) and a
 * roughness map (satin field with fine lathe rings; the polished logo reflects more).
 */
async function faceMaps(markUrl: string) {
  const SIZE = 1024;
  const img = await loadImage(markUrl);

  // Logo as a white silhouette, sized like the Figma token (72 of 154 → of the field).
  const logo = document.createElement('canvas');
  logo.width = logo.height = SIZE;
  const lc = logo.getContext('2d')!;
  const logoSize = SIZE * (72 / 154) * (R / FIELD_R);
  lc.drawImage(img, (SIZE - logoSize) / 2, (SIZE - logoSize) / 2, logoSize, logoSize);
  lc.globalCompositeOperation = 'source-in';
  lc.fillStyle = '#fff';
  lc.fillRect(0, 0, SIZE, SIZE);

  // Height: black field, logo white with a soft bevel (blur).
  const height = document.createElement('canvas');
  height.width = height.height = SIZE;
  const hc = height.getContext('2d')!;
  hc.fillStyle = '#000';
  hc.fillRect(0, 0, SIZE, SIZE);
  hc.filter = 'blur(3px)';
  hc.drawImage(logo, 0, 0);
  hc.filter = 'none';
  hc.drawImage(logo, 0, 0);

  // Roughness: satin field with concentric lathe rings; logo polished.
  const rough = document.createElement('canvas');
  rough.width = rough.height = SIZE;
  const rc = rough.getContext('2d')!;
  rc.fillStyle = 'rgb(78,78,78)';
  rc.fillRect(0, 0, SIZE, SIZE);
  for (let r = 2; r < SIZE / 2; r += 2) {
    const v = 78 + Math.round((Math.random() - 0.5) * 30);
    rc.strokeStyle = `rgb(${v},${v},${v})`;
    rc.lineWidth = 1.2;
    rc.beginPath();
    rc.arc(SIZE / 2, SIZE / 2, r, 0, Math.PI * 2);
    rc.stroke();
  }
  rc.globalAlpha = 0.85;
  rc.filter = 'brightness(0) invert(0.25)';
  rc.drawImage(logo, 0, 0);
  rc.filter = 'none';
  rc.globalAlpha = 1;

  const heightTex = new CanvasTexture(height);
  heightTex.colorSpace = LinearSRGBColorSpace;
  const roughTex = new CanvasTexture(rough);
  roughTex.colorSpace = LinearSRGBColorSpace;
  return { heightTex, roughTex };
}

export async function createCoin(container: HTMLElement, opts: CoinOptions): Promise<Coin> {
  const fill = opts.fill ?? 0.74;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(-2.5, 3, 4);
  scene.add(key);

  // Camera framed so the coin's diameter is `fill` of the canvas height.
  const FOV = 22;
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, R / fill / Math.tan(((FOV / 2) * Math.PI) / 180));

  const metal = new Color(opts.color);
  const body = new MeshPhysicalMaterial({ color: metal, metalness: 1, roughness: 0.26, clearcoat: 0.25, clearcoatRoughness: 0.2 });

  const { heightTex, roughTex } = await faceMaps(opts.markUrl);
  const faceMat = new MeshPhysicalMaterial({
    color: metal,
    metalness: 1,
    roughness: 1,
    roughnessMap: roughTex,
    bumpMap: heightTex,
    bumpScale: 3.5,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
  });

  // Lathe turns the profile about Y; rotate so the coin faces the camera (+Z).
  const lathe = new LatheGeometry(coinProfile(), 128);
  lathe.rotateX(Math.PI / 2);

  const coin = new Group();
  coin.add(new Mesh(lathe, body));

  const faceZ = THICKNESS / 2 - LIP_HEIGHT + 0.0008;
  const front = new Mesh(new CircleGeometry(FIELD_R, 128), faceMat);
  front.position.z = faceZ;
  coin.add(front);
  const back = new Mesh(new CircleGeometry(FIELD_R, 128), faceMat);
  back.rotation.y = Math.PI;
  back.position.z = -faceZ;
  coin.add(back);

  const tilt = new Group(); // small forward tilt so the face catches the key light
  tilt.add(coin);
  scene.add(tilt);

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  return {
    setAngle: (a) => {
      coin.rotation.y = a;
    },
    setTilt: (t) => {
      tilt.rotation.x = t;
    },
    render: () => renderer.render(scene, camera),
    resize,
    dispose: () => {
      lathe.dispose();
      front.geometry.dispose();
      back.geometry.dispose();
      body.dispose();
      faceMat.dispose();
      heightTex.dispose();
      roughTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
