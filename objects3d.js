// Procedural low-poly 3D builders. Each builder returns a THREE.Group with
// real geometry + materials so it has actual depth, can rotate, and reads as
// 3D from any angle. We curate ~25 objects rather than chase hundreds —
// quality over breadth, since each gets a hand-tuned construction.
import * as THREE from "https://esm.sh/three@0.160.0";

const matCache = new Map();
function mat(color, opts = {}) {
  const key = `${color}-${opts.roughness ?? ""}-${opts.metalness ?? ""}-${opts.flat ?? ""}-${opts.emissive ?? ""}`;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.45,
    metalness: opts.metalness ?? 0.05,
    flatShading: opts.flat ?? false,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
  matCache.set(key, m);
  return m;
}

function mesh(geom, color, opts) {
  const m = new THREE.Mesh(geom, mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function group(...children) {
  const g = new THREE.Group();
  for (const c of children) g.add(c);
  return g;
}

function v(x, y, z) { return new THREE.Vector3(x, y, z); }

// Pre-built shape generators we reuse a lot. Higher poly defaults → smoother
// silhouettes when objects rotate up close to the camera.
function sphere(r, c, opts) { return mesh(new THREE.SphereGeometry(r, 40, 28), c, opts); }
function box(w, h, d, c, opts) {
  // Beveled box-feel: wider segment counts so normal interpolation looks
  // smoother under our rim lighting.
  return mesh(new THREE.BoxGeometry(w, h, d, 1, 1, 1), c, opts);
}
function cyl(rt, rb, h, c, opts, segs = 32) {
  return mesh(new THREE.CylinderGeometry(rt, rb, h, segs), c, opts);
}
function cone(r, h, c, opts, segs = 32) { return mesh(new THREE.ConeGeometry(r, h, segs), c, opts); }
function torus(r, t, c, opts) { return mesh(new THREE.TorusGeometry(r, t, 24, 48), c, opts); }
function tube(curve, r, c, opts) {
  return mesh(new THREE.TubeGeometry(curve, 48, r, 16, false), c, opts);
}

// ---------- Builders ----------
const builders = {
  apple: () => {
    const body = sphere(0.5, 0xe53935);
    body.scale.y = 0.92;
    const stem = cyl(0.04, 0.05, 0.18, 0x4e342e);
    stem.position.y = 0.5;
    const leaf = sphere(0.13, 0x4caf50);
    leaf.scale.set(1.4, 0.3, 0.7);
    leaf.position.set(0.13, 0.55, 0);
    leaf.rotation.z = -0.4;
    return group(body, stem, leaf);
  },

  pen: () => {
    const body = cyl(0.07, 0.07, 1.0, 0x1e88e5);
    const tip = cone(0.07, 0.18, 0x37474f);
    tip.position.y = -0.59;
    const cap = cyl(0.078, 0.078, 0.08, 0x0d47a1);
    cap.position.y = 0.54;
    const clip = box(0.025, 0.3, 0.06, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    clip.position.set(0.085, 0.4, 0);
    return group(body, tip, cap, clip);
  },

  pineapple: () => {
    const g = new THREE.Group();
    const body = cyl(0.4, 0.34, 0.85, 0xfdd835, { flat: true }, 12);
    g.add(body);
    // Crosshatched dimples via small cones around the body.
    for (let row = 0; row < 4; row++) {
      const y = -0.3 + row * 0.2;
      const offset = (row % 2) * 0.2618;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + offset;
        const r = 0.39;
        const dot = cone(0.06, 0.08, 0xfbc02d, { flat: true });
        dot.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        dot.rotation.z = -Math.PI / 2;
        dot.lookAt(Math.cos(a) * 2, y, Math.sin(a) * 2);
        g.add(dot);
      }
    }
    // Crown leaves.
    for (let i = 0; i < 8; i++) {
      const leaf = cone(0.09, 0.42, 0x2e7d32, { flat: true });
      const a = (i / 8) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.12, 0.6, Math.sin(a) * 0.12);
      leaf.rotation.z = -Math.cos(a) * 0.5;
      leaf.rotation.x = Math.sin(a) * 0.5;
      g.add(leaf);
    }
    const center = cone(0.08, 0.4, 0x388e3c, { flat: true });
    center.position.y = 0.62;
    g.add(center);
    return g;
  },

  banana: () => {
    const curve = new THREE.QuadraticBezierCurve3(v(-0.45, -0.05, 0), v(0, 0.32, 0), v(0.45, -0.05, 0));
    const body = tube(curve, 0.11, 0xfdd835);
    const tipA = sphere(0.1, 0x6d4c41);
    tipA.position.set(-0.45, -0.05, 0);
    tipA.scale.set(0.5, 0.5, 0.5);
    const tipB = sphere(0.08, 0x6d4c41);
    tipB.position.set(0.45, -0.05, 0);
    return group(body, tipA, tipB);
  },

  orange: () => {
    const body = sphere(0.45, 0xff9800);
    body.scale.y = 0.95;
    const stem = cyl(0.025, 0.025, 0.06, 0x4e342e);
    stem.position.y = 0.45;
    return group(body, stem);
  },

  lemon: () => {
    const body = sphere(0.4, 0xffeb3b);
    body.scale.set(0.85, 1.15, 0.85);
    const tipA = cone(0.1, 0.12, 0xfdd835);
    tipA.position.y = 0.5;
    const tipB = cone(0.1, 0.12, 0xfdd835);
    tipB.position.y = -0.5;
    tipB.rotation.x = Math.PI;
    return group(body, tipA, tipB);
  },

  watermelon: () => {
    const body = sphere(0.5, 0x2e7d32);
    const g = new THREE.Group();
    g.add(body);
    // Stripes via thin elongated boxes.
    for (let i = 0; i < 8; i++) {
      const stripe = mesh(new THREE.TorusGeometry(0.501, 0.018, 8, 64), 0x1b5e20);
      stripe.rotation.z = (i / 8) * Math.PI * 2;
      stripe.rotation.y = Math.PI / 2;
      g.add(stripe);
    }
    return g;
  },

  cherry: () => {
    const a = sphere(0.22, 0xc62828);
    a.position.set(-0.18, -0.1, 0);
    const b = sphere(0.22, 0xc62828);
    b.position.set(0.18, -0.05, 0);
    const stem1 = cyl(0.02, 0.02, 0.4, 0x4caf50);
    stem1.position.set(-0.1, 0.18, 0);
    stem1.rotation.z = 0.3;
    const stem2 = cyl(0.02, 0.02, 0.4, 0x4caf50);
    stem2.position.set(0.08, 0.2, 0);
    stem2.rotation.z = -0.2;
    return group(a, b, stem1, stem2);
  },

  carrot: () => {
    const body = cone(0.18, 0.8, 0xff7043);
    body.rotation.x = Math.PI;
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 4; i++) {
      const leaf = cone(0.05, 0.3, 0x43a047, { flat: true });
      const a = (i / 4) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.05, 0.5, Math.sin(a) * 0.05);
      leaf.rotation.x = -Math.sin(a) * 0.4;
      leaf.rotation.z = -Math.cos(a) * 0.4;
      g.add(leaf);
    }
    return g;
  },

  mushroom: () => {
    const cap = sphere(0.42, 0xd32f2f);
    cap.scale.y = 0.55;
    cap.position.y = 0.18;
    const stem = cyl(0.16, 0.18, 0.45, 0xfafafa);
    stem.position.y = -0.18;
    const g = new THREE.Group();
    g.add(cap, stem);
    // White spots on the cap.
    for (let i = 0; i < 6; i++) {
      const spot = sphere(0.06, 0xffffff);
      const a = (i / 6) * Math.PI * 2;
      const r = 0.28;
      spot.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
      g.add(spot);
    }
    return g;
  },

  donut: () => {
    const body = torus(0.3, 0.14, 0xf48fb1);
    body.rotation.x = Math.PI / 2;
    const icing = torus(0.3, 0.145, 0xec407a);
    icing.rotation.x = Math.PI / 2;
    icing.position.y = 0.04;
    icing.scale.set(1.0, 1.0, 0.6);
    const g = new THREE.Group();
    g.add(body, icing);
    // Sprinkles.
    const sprinkleColors = [0xffd54f, 0x81c784, 0x64b5f6, 0xff8a65, 0xba68c8];
    for (let i = 0; i < 14; i++) {
      const s = cyl(0.018, 0.018, 0.08, sprinkleColors[i % sprinkleColors.length]);
      const a = Math.random() * Math.PI * 2;
      const r = 0.25 + Math.random() * 0.1;
      s.position.set(Math.cos(a) * r, 0.08, Math.sin(a) * r);
      s.rotation.z = Math.random() * Math.PI;
      s.rotation.x = Math.random() * Math.PI;
      g.add(s);
    }
    return g;
  },

  cookie: () => {
    const body = cyl(0.4, 0.4, 0.12, 0xa1887f, {}, 32);
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 6; i++) {
      const chip = sphere(0.06, 0x3e2723);
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.3;
      chip.position.set(Math.cos(a) * r, 0.07, Math.sin(a) * r);
      g.add(chip);
    }
    return g;
  },

  icecream: () => {
    const c = cone(0.25, 0.6, 0xd7a86e, { flat: true });
    c.position.y = -0.2;
    c.rotation.x = Math.PI;
    const scoop = sphere(0.32, 0xf8bbd0);
    scoop.position.y = 0.2;
    const cherry = sphere(0.08, 0xc62828);
    cherry.position.y = 0.55;
    return group(c, scoop, cherry);
  },

  cake: () => {
    const base = cyl(0.42, 0.42, 0.3, 0xfff8e1);
    base.position.y = -0.1;
    const frosting = cyl(0.45, 0.4, 0.1, 0xf06292);
    frosting.position.y = 0.1;
    const candle = cyl(0.04, 0.04, 0.18, 0xfff59d);
    candle.position.y = 0.25;
    const flame = cone(0.05, 0.1, 0xff6f00, { emissive: 0xff6f00, emissiveIntensity: 0.6 });
    flame.position.y = 0.4;
    return group(base, frosting, candle, flame);
  },

  bottle: () => {
    const body = cyl(0.18, 0.2, 0.7, 0x2e7d32);
    body.position.y = -0.15;
    const shoulder = cyl(0.18, 0.08, 0.18, 0x2e7d32);
    shoulder.position.y = 0.29;
    const neck = cyl(0.07, 0.07, 0.18, 0x2e7d32);
    neck.position.y = 0.47;
    const cap = cyl(0.08, 0.08, 0.08, 0xffd54f, { metalness: 0.7, roughness: 0.3 });
    cap.position.y = 0.6;
    return group(body, shoulder, neck, cap);
  },

  cup: () => {
    const body = cyl(0.3, 0.22, 0.5, 0xffffff);
    const handle = torus(0.12, 0.04, 0xffffff);
    handle.position.set(0.32, 0, 0);
    handle.rotation.y = Math.PI / 2;
    const liquid = cyl(0.28, 0.21, 0.05, 0x6d4c41);
    liquid.position.y = 0.22;
    return group(body, handle, liquid);
  },

  hammer: () => {
    const handle = cyl(0.05, 0.06, 0.9, 0x6d4c41);
    handle.position.y = -0.15;
    const head = box(0.2, 0.2, 0.45, 0x607d8b, { metalness: 0.7, roughness: 0.3 });
    head.position.y = 0.4;
    const claw = mesh(new THREE.TorusGeometry(0.1, 0.04, 8, 16, Math.PI), 0x607d8b, { metalness: 0.7, roughness: 0.3 });
    claw.position.set(-0.18, 0.4, 0);
    claw.rotation.y = Math.PI / 2;
    return group(handle, head, claw);
  },

  key: () => {
    const shaft = cyl(0.04, 0.04, 0.6, 0xffd54f, { metalness: 0.8, roughness: 0.25 });
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = -0.05;
    const bow = torus(0.18, 0.05, 0xffd54f, { metalness: 0.8, roughness: 0.25 });
    bow.position.x = -0.42;
    bow.rotation.y = Math.PI / 2;
    const tooth1 = box(0.06, 0.1, 0.06, 0xffd54f, { metalness: 0.8, roughness: 0.25 });
    tooth1.position.set(0.18, -0.07, 0);
    const tooth2 = box(0.06, 0.14, 0.06, 0xffd54f, { metalness: 0.8, roughness: 0.25 });
    tooth2.position.set(0.08, -0.09, 0);
    return group(shaft, bow, tooth1, tooth2);
  },

  star: () => {
    const shape = new THREE.Shape();
    const pts = 5;
    const outer = 0.5, inner = 0.22;
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    geom.center();
    return mesh(geom, 0xffeb3b, { metalness: 0.4, roughness: 0.3, emissive: 0xfdd835, emissiveIntensity: 0.15 });
  },

  heart: () => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.25);
    shape.bezierCurveTo(x, y + 0.25, x - 0.08, y, x - 0.25, y);
    shape.bezierCurveTo(x - 0.55, y, x - 0.55, y + 0.35, x - 0.55, y + 0.35);
    shape.bezierCurveTo(x - 0.55, y + 0.55, x - 0.35, y + 0.77, x, y + 1.0);
    shape.bezierCurveTo(x + 0.35, y + 0.77, x + 0.55, y + 0.55, x + 0.55, y + 0.35);
    shape.bezierCurveTo(x + 0.55, y + 0.35, x + 0.55, y, x + 0.25, y);
    shape.bezierCurveTo(x + 0.08, y, x, y + 0.25, x, y + 0.25);
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 });
    geom.center();
    geom.scale(0.7, 0.7, 0.7);
    return mesh(geom, 0xe91e63, { roughness: 0.3 });
  },

  crystal: () => {
    const geom = new THREE.OctahedronGeometry(0.5, 0);
    return mesh(geom, 0xab47bc, { metalness: 0.5, roughness: 0.15, emissive: 0x6a1b9a, emissiveIntensity: 0.25, flat: true });
  },

  diamond: () => {
    const top = mesh(new THREE.ConeGeometry(0.3, 0.18, 8), 0x80deea, { metalness: 0.9, roughness: 0.05, emissive: 0x00bcd4, emissiveIntensity: 0.2, flat: true });
    top.position.y = 0.08;
    const bottom = mesh(new THREE.ConeGeometry(0.35, 0.5, 8), 0x80deea, { metalness: 0.9, roughness: 0.05, emissive: 0x00bcd4, emissiveIntensity: 0.2, flat: true });
    bottom.position.y = -0.08;
    bottom.rotation.x = Math.PI;
    return group(top, bottom);
  },

  cube: () => mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), 0x42a5f5, { flat: true }),

  pyramid: () => mesh(new THREE.ConeGeometry(0.5, 0.7, 4), 0xffa726, { flat: true }),

  ball: () => sphere(0.45, 0x66bb6a),

  rocket: () => {
    const body = cyl(0.15, 0.18, 0.7, 0xffffff);
    const nose = cone(0.18, 0.3, 0xef5350);
    nose.position.y = 0.5;
    const window = sphere(0.08, 0x29b6f6, { metalness: 0.5, roughness: 0.2, emissive: 0x0288d1, emissiveIntensity: 0.3 });
    window.position.y = 0.1;
    window.position.z = 0.18;
    const flame = cone(0.13, 0.25, 0xff9800, { emissive: 0xff6f00, emissiveIntensity: 0.7 });
    flame.position.y = -0.5;
    flame.rotation.x = Math.PI;
    const g = new THREE.Group();
    g.add(body, nose, window, flame);
    for (let i = 0; i < 3; i++) {
      const fin = box(0.04, 0.18, 0.18, 0xef5350);
      const a = (i / 3) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 0.18, -0.3, Math.sin(a) * 0.18);
      fin.rotation.y = a;
      g.add(fin);
    }
    return g;
  },

  bomb: () => {
    const body = sphere(0.4, 0x212121);
    const fuseTube = cyl(0.04, 0.04, 0.18, 0x6d4c41);
    fuseTube.position.y = 0.45;
    const spark = sphere(0.08, 0xff9800, { emissive: 0xff6f00, emissiveIntensity: 1.0 });
    spark.position.y = 0.6;
    return group(body, fuseTube, spark);
  },

  crown: () => {
    const ring = cyl(0.36, 0.36, 0.18, 0xffd700, { metalness: 0.85, roughness: 0.2 });
    const g = new THREE.Group();
    g.add(ring);
    for (let i = 0; i < 5; i++) {
      const t = cone(0.07, 0.18, 0xffd700, { metalness: 0.85, roughness: 0.2 });
      const a = (i / 5) * Math.PI * 2;
      t.position.set(Math.cos(a) * 0.36, 0.18, Math.sin(a) * 0.36);
      g.add(t);
      const gem = sphere(0.04, [0xe53935, 0x42a5f5, 0x66bb6a, 0xab47bc, 0xffeb3b][i], { metalness: 0.5, roughness: 0.2 });
      gem.position.set(Math.cos(a) * 0.36, 0.27, Math.sin(a) * 0.36);
      g.add(gem);
    }
    return g;
  },

  fish: () => {
    const body = sphere(0.4, 0x29b6f6);
    body.scale.set(1.0, 0.65, 0.5);
    const tail = cone(0.18, 0.3, 0x29b6f6, { flat: true });
    tail.position.x = -0.45;
    tail.rotation.z = Math.PI / 2;
    const eye = sphere(0.05, 0xffffff);
    eye.position.set(0.25, 0.05, 0.18);
    const pupil = sphere(0.025, 0x000000);
    pupil.position.set(0.28, 0.05, 0.21);
    const fin = cone(0.1, 0.18, 0x0288d1, { flat: true });
    fin.position.y = 0.22;
    return group(body, tail, eye, pupil, fin);
  },

  ghost: () => {
    const body = sphere(0.4, 0xeeeeee, { emissive: 0xffffff, emissiveIntensity: 0.05 });
    const skirt = cone(0.4, 0.5, 0xeeeeee, { flat: true });
    skirt.position.y = -0.3;
    skirt.rotation.x = Math.PI;
    const eye1 = sphere(0.05, 0x000000);
    eye1.position.set(-0.12, 0.05, 0.32);
    const eye2 = sphere(0.05, 0x000000);
    eye2.position.set(0.12, 0.05, 0.32);
    const mouth = sphere(0.04, 0x000000);
    mouth.position.set(0, -0.1, 0.32);
    return group(body, skirt, eye1, eye2, mouth);
  },

  balloon: () => {
    const body = sphere(0.4, 0xef5350);
    body.scale.set(1.0, 1.15, 1.0);
    const knot = cone(0.05, 0.08, 0xc62828);
    knot.position.y = -0.45;
    knot.rotation.x = Math.PI;
    const string = cyl(0.005, 0.005, 0.6, 0xeeeeee);
    string.position.y = -0.8;
    return group(body, knot, string);
  },

  gift: () => {
    const box1 = box(0.6, 0.5, 0.6, 0xe91e63);
    const ribbonH = box(0.6, 0.08, 0.62, 0xfdd835);
    const ribbonV = box(0.08, 0.5, 0.62, 0xfdd835);
    const ribbonD = box(0.62, 0.08, 0.08, 0xfdd835);
    ribbonD.position.y = 0.25;
    const knotL = sphere(0.1, 0xfdd835);
    knotL.position.set(-0.07, 0.32, 0);
    knotL.scale.set(1.4, 0.5, 0.4);
    knotL.rotation.z = -0.3;
    const knotR = sphere(0.1, 0xfdd835);
    knotR.position.set(0.07, 0.32, 0);
    knotR.scale.set(1.4, 0.5, 0.4);
    knotR.rotation.z = 0.3;
    return group(box1, ribbonH, ribbonV, ribbonD, knotL, knotR);
  },

  skull: () => {
    const head = sphere(0.45, 0xeceff1);
    head.scale.set(1.0, 1.0, 0.95);
    const jaw = box(0.5, 0.18, 0.4, 0xeceff1);
    jaw.position.y = -0.4;
    const eye1 = sphere(0.12, 0x000000);
    eye1.position.set(-0.18, 0.05, 0.35);
    const eye2 = sphere(0.12, 0x000000);
    eye2.position.set(0.18, 0.05, 0.35);
    const nose = mesh(new THREE.ConeGeometry(0.06, 0.15, 4), 0x000000, { flat: true });
    nose.position.set(0, -0.15, 0.4);
    nose.rotation.x = Math.PI;
    return group(head, jaw, eye1, eye2, nose);
  },

  pizza: () => {
    const base = cyl(0.5, 0.5, 0.06, 0xffe0b2, {}, 32);
    const sauce = cyl(0.46, 0.46, 0.04, 0xc62828, {}, 32);
    sauce.position.y = 0.05;
    const cheese = cyl(0.44, 0.44, 0.03, 0xfff59d, {}, 32);
    cheese.position.y = 0.07;
    const g = new THREE.Group();
    g.add(base, sauce, cheese);
    for (let i = 0; i < 5; i++) {
      const pep = cyl(0.07, 0.07, 0.02, 0xb71c1c, {}, 16);
      const a = (i / 5) * Math.PI * 2;
      pep.position.set(Math.cos(a) * 0.25, 0.09, Math.sin(a) * 0.25);
      g.add(pep);
    }
    return g;
  },

  burger: () => {
    const bun1 = sphere(0.4, 0xd7a86e);
    bun1.scale.y = 0.4;
    bun1.position.y = 0.3;
    const lettuce = cyl(0.42, 0.42, 0.06, 0x66bb6a, { flat: true });
    lettuce.position.y = 0.13;
    const patty = cyl(0.4, 0.4, 0.13, 0x6d4c41);
    patty.position.y = 0;
    const cheese = box(0.7, 0.04, 0.7, 0xffca28);
    cheese.position.y = 0.08;
    cheese.rotation.y = Math.PI / 4;
    const bun2 = sphere(0.4, 0xd7a86e);
    bun2.scale.set(1.0, 0.5, 1.0);
    bun2.position.y = -0.2;
    return group(bun1, lettuce, patty, cheese, bun2);
  },

  // ---------- More fruit & food ----------
  grape: () => {
    const g = new THREE.Group();
    const positions = [
      [0, 0.3, 0],
      [-0.12, 0.18, 0], [0.12, 0.18, 0],
      [-0.18, 0.04, 0], [0, 0.04, 0.1], [0.18, 0.04, 0],
      [-0.1, -0.1, 0], [0.1, -0.1, 0], [0, -0.1, -0.1],
      [-0.05, -0.25, 0], [0.05, -0.25, 0],
      [0, -0.4, 0],
    ];
    for (const [x, y, z] of positions) {
      const grape = sphere(0.1, 0x8e24aa);
      grape.position.set(x, y, z);
      g.add(grape);
    }
    const stem = cyl(0.02, 0.02, 0.15, 0x4caf50);
    stem.position.y = 0.45;
    const leaf = sphere(0.08, 0x2e7d32);
    leaf.scale.set(1.4, 0.3, 0.6);
    leaf.position.set(0.08, 0.5, 0);
    leaf.rotation.z = -0.3;
    g.add(stem, leaf);
    return g;
  },

  strawberry: () => {
    const body = cone(0.32, 0.65, 0xe53935);
    body.rotation.x = Math.PI;
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 6; i++) {
      const leaf = cone(0.06, 0.16, 0x43a047, { flat: true });
      const a = (i / 6) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.1, 0.32, Math.sin(a) * 0.1);
      leaf.rotation.x = -Math.sin(a) * 0.5;
      leaf.rotation.z = -Math.cos(a) * 0.5;
      g.add(leaf);
    }
    for (let i = 0; i < 12; i++) {
      const seed = sphere(0.018, 0xfff59d);
      const a = Math.random() * Math.PI * 2;
      const yPos = Math.random() * 0.45 - 0.25;
      const r = 0.32 * (1 - Math.abs(yPos) / 0.4);
      seed.position.set(Math.cos(a) * r, yPos, Math.sin(a) * r);
      g.add(seed);
    }
    return g;
  },

  avocado: () => {
    const body = sphere(0.42, 0x558b2f);
    body.scale.set(0.78, 1.2, 0.78);
    const stem = cyl(0.025, 0.025, 0.07, 0x4e342e);
    stem.position.y = 0.5;
    return group(body, stem);
  },

  broccoli: () => {
    const stem = cyl(0.1, 0.13, 0.32, 0xc5e1a5);
    stem.position.y = -0.2;
    const g = new THREE.Group();
    g.add(stem);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const floret = sphere(0.14, 0x2e7d32, { flat: true });
      floret.position.set(Math.cos(a) * 0.18, 0.15, Math.sin(a) * 0.18);
      g.add(floret);
    }
    const top = sphere(0.18, 0x388e3c, { flat: true });
    top.position.y = 0.24;
    g.add(top);
    return g;
  },

  corn: () => {
    const body = cyl(0.13, 0.13, 0.65, 0xfdd835, {}, 16);
    const g = new THREE.Group();
    g.add(body);
    // Kernel bumps for that cob look.
    for (let row = 0; row < 6; row++) {
      const y = -0.25 + row * 0.1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + row * 0.2;
        const k = sphere(0.027, 0xffee58);
        k.position.set(Math.cos(a) * 0.135, y, Math.sin(a) * 0.135);
        g.add(k);
      }
    }
    for (let i = 0; i < 4; i++) {
      const leaf = cone(0.08, 0.45, 0x66bb6a, { flat: true });
      const a = (i / 4) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.12, -0.45, Math.sin(a) * 0.12);
      leaf.rotation.x = -Math.cos(a) * 0.3;
      leaf.rotation.z = Math.sin(a) * 0.3;
      g.add(leaf);
    }
    return g;
  },

  egg: () => {
    const body = sphere(0.32, 0xfff8e1);
    body.scale.set(1.0, 1.4, 1.0);
    return body;
  },

  sushi: () => {
    const rice = cyl(0.3, 0.32, 0.32, 0xfafafa);
    rice.position.y = -0.13;
    const fishTop = box(0.7, 0.07, 0.4, 0xff7043);
    fishTop.position.y = 0.06;
    const nori = cyl(0.32, 0.32, 0.07, 0x1b5e20);
    nori.position.y = -0.13;
    return group(rice, fishTop, nori);
  },

  hotdog: () => {
    const bun = cyl(0.25, 0.25, 0.95, 0xd7a86e);
    bun.rotation.z = Math.PI / 2;
    const sausage = cyl(0.18, 0.18, 1.0, 0xc62828);
    sausage.rotation.z = Math.PI / 2;
    sausage.position.y = 0.06;
    const mustard = box(0.95, 0.05, 0.06, 0xffeb3b);
    mustard.position.y = 0.18;
    return group(bun, sausage, mustard);
  },

  taco: () => {
    const shell = mesh(
      new THREE.TorusGeometry(0.3, 0.09, 10, 28, Math.PI),
      0xfdd835,
      { flat: true }
    );
    shell.rotation.z = Math.PI;
    const g = new THREE.Group();
    g.add(shell);
    const lettuce = sphere(0.1, 0x66bb6a);
    lettuce.scale.set(1.2, 0.5, 1.2);
    lettuce.position.set(-0.1, 0.06, 0);
    const tomato = sphere(0.08, 0xc62828);
    tomato.scale.set(1.0, 0.5, 1.0);
    tomato.position.set(0.1, 0.06, 0);
    const ch = sphere(0.07, 0xfdd835);
    ch.position.set(0, 0.12, 0);
    g.add(lettuce, tomato, ch);
    return g;
  },

  coconut: () => {
    const body = sphere(0.42, 0x6d4c41, { flat: true });
    body.scale.y = 0.95;
    const e1 = sphere(0.05, 0x3e2723);
    e1.position.set(-0.12, 0.2, 0.32);
    const e2 = sphere(0.05, 0x3e2723);
    e2.position.set(0.12, 0.2, 0.32);
    const e3 = sphere(0.05, 0x3e2723);
    e3.position.set(0, 0.05, 0.4);
    return group(body, e1, e2, e3);
  },

  peach: () => {
    const body = sphere(0.42, 0xffab91);
    body.scale.y = 0.92;
    const stem = cyl(0.02, 0.02, 0.06, 0x4e342e);
    stem.position.y = 0.42;
    const leaf = sphere(0.1, 0x66bb6a);
    leaf.scale.set(1.2, 0.3, 0.5);
    leaf.position.set(0.1, 0.44, 0);
    leaf.rotation.z = -0.3;
    return group(body, stem, leaf);
  },

  lollipop: () => {
    const ball = sphere(0.26, 0xe91e63);
    ball.position.y = 0.25;
    const swirl = torus(0.25, 0.025, 0xffffff);
    swirl.position.y = 0.25;
    swirl.rotation.x = 0.3;
    const stick = cyl(0.025, 0.025, 0.65, 0xffffff);
    stick.position.y = -0.1;
    return group(ball, swirl, stick);
  },

  cheese: () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.4, -0.2);
    shape.lineTo(0.4, -0.2);
    shape.lineTo(0, 0.4);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 1 });
    geom.center();
    const wedge = mesh(geom, 0xfdd835);
    const g = new THREE.Group();
    g.add(wedge);
    for (let i = 0; i < 5; i++) {
      const hole = sphere(0.04, 0xfbc02d);
      hole.position.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, 0.16);
      g.add(hole);
    }
    return g;
  },

  bread: () => {
    const body = sphere(0.4, 0xd7a86e);
    body.scale.set(1.7, 0.85, 0.95);
    const top = sphere(0.36, 0xa1887f);
    top.scale.set(1.6, 0.2, 0.85);
    top.position.y = 0.16;
    return group(body, top);
  },

  // ---------- Tools / household ----------
  magnet: () => {
    const main = mesh(new THREE.TorusGeometry(0.3, 0.09, 10, 28, Math.PI), 0xc62828);
    main.rotation.z = Math.PI;
    const tipL = box(0.18, 0.12, 0.18, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipL.position.set(-0.3, 0, 0);
    const tipR = box(0.18, 0.12, 0.18, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipR.position.set(0.3, 0, 0);
    return group(main, tipL, tipR);
  },

  battery: () => {
    const body = cyl(0.18, 0.18, 0.55, 0xfdd835);
    const term = cyl(0.06, 0.06, 0.07, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    term.position.y = 0.31;
    const bot = cyl(0.18, 0.18, 0.04, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    bot.position.y = -0.27;
    const stripe = cyl(0.181, 0.181, 0.06, 0x212121);
    stripe.position.y = 0.06;
    return group(body, term, bot, stripe);
  },

  lightbulb: () => {
    const bulb = sphere(0.32, 0xfff59d, { emissive: 0xfdd835, emissiveIntensity: 0.45 });
    bulb.position.y = 0.12;
    bulb.scale.y = 1.18;
    const screw = cyl(0.13, 0.16, 0.22, 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    screw.position.y = -0.25;
    const tip = cyl(0.06, 0.06, 0.06, 0x424242);
    tip.position.y = -0.39;
    return group(bulb, screw, tip);
  },

  wrench: () => {
    const body = box(0.6, 0.13, 0.06, 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    const endL = mesh(new THREE.TorusGeometry(0.11, 0.04, 8, 18, Math.PI * 1.4), 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    endL.position.set(-0.32, 0, 0);
    endL.rotation.z = -Math.PI / 4;
    const endR = mesh(new THREE.TorusGeometry(0.11, 0.04, 8, 18, Math.PI * 1.4), 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    endR.position.set(0.32, 0, 0);
    endR.rotation.z = Math.PI - Math.PI / 4;
    return group(body, endL, endR);
  },

  axe: () => {
    const handle = cyl(0.05, 0.05, 0.85, 0x6d4c41);
    handle.position.y = -0.1;
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.22);
    shape.lineTo(0.32, -0.16);
    shape.lineTo(0.42, 0);
    shape.lineTo(0.32, 0.16);
    shape.lineTo(0, 0.22);
    shape.closePath();
    const blade = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false }), 0xeceff1, { metalness: 0.85, roughness: 0.2 });
    blade.position.set(0.05, 0.32, 0);
    return group(handle, blade);
  },

  shovel: () => {
    const handle = cyl(0.04, 0.04, 0.8, 0x6d4c41);
    handle.position.y = 0.1;
    const spade = box(0.25, 0.32, 0.05, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    spade.position.y = -0.4;
    const grip = box(0.16, 0.04, 0.06, 0x6d4c41);
    grip.position.y = 0.5;
    return group(handle, spade, grip);
  },

  // ---------- Vehicles ----------
  car: () => {
    const body = box(0.75, 0.22, 0.36, 0xef5350);
    const cabin = box(0.42, 0.2, 0.32, 0x37474f);
    cabin.position.y = 0.2;
    const wheels = [
      [-0.24, -0.15, 0.18], [0.24, -0.15, 0.18],
      [-0.24, -0.15, -0.18], [0.24, -0.15, -0.18],
    ].map(([x, y, z]) => {
      const w = cyl(0.1, 0.1, 0.05, 0x212121);
      w.rotation.x = Math.PI / 2;
      w.position.set(x, y, z);
      return w;
    });
    const hl1 = sphere(0.04, 0xfff59d, { emissive: 0xfdd835, emissiveIntensity: 0.6 });
    hl1.position.set(0.38, 0, 0.13);
    const hl2 = sphere(0.04, 0xfff59d, { emissive: 0xfdd835, emissiveIntensity: 0.6 });
    hl2.position.set(0.38, 0, -0.13);
    return group(body, cabin, ...wheels, hl1, hl2);
  },

  airplane: () => {
    const body = cyl(0.1, 0.1, 0.85, 0xeceff1);
    body.rotation.z = Math.PI / 2;
    const nose = cone(0.1, 0.22, 0xeceff1);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 0.53;
    const wings = box(0.22, 0.04, 0.75, 0xb0bec5, { metalness: 0.4, roughness: 0.4 });
    const tail = box(0.16, 0.22, 0.04, 0xb0bec5, { metalness: 0.4, roughness: 0.4 });
    tail.position.set(-0.36, 0.12, 0);
    const tailH = box(0.16, 0.04, 0.28, 0xb0bec5, { metalness: 0.4, roughness: 0.4 });
    tailH.position.set(-0.36, 0.05, 0);
    return group(body, nose, wings, tail, tailH);
  },

  boat: () => {
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-0.5, 0);
    hullShape.lineTo(-0.4, -0.22);
    hullShape.lineTo(0.4, -0.22);
    hullShape.lineTo(0.5, 0);
    hullShape.closePath();
    const hull = mesh(new THREE.ExtrudeGeometry(hullShape, { depth: 0.32, bevelEnabled: false }), 0x6d4c41);
    hull.position.z = -0.16;
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0);
    sailShape.lineTo(0, 0.65);
    sailShape.lineTo(0.42, 0);
    sailShape.closePath();
    const sail = mesh(new THREE.ExtrudeGeometry(sailShape, { depth: 0.02, bevelEnabled: false }), 0xfafafa);
    sail.position.set(-0.2, 0, 0);
    const mast = cyl(0.02, 0.02, 0.7, 0x4e342e);
    mast.position.set(-0.2, 0.32, 0);
    return group(hull, sail, mast);
  },

  // ---------- Buildings & nature ----------
  house: () => {
    const base = box(0.7, 0.5, 0.6, 0xffe0b2);
    const roof = mesh(new THREE.ConeGeometry(0.55, 0.42, 4), 0xc62828);
    roof.position.y = 0.46;
    roof.rotation.y = Math.PI / 4;
    const door = box(0.16, 0.27, 0.04, 0x4e342e);
    door.position.set(0, -0.12, 0.32);
    const win1 = box(0.13, 0.13, 0.04, 0x29b6f6, { metalness: 0.45, roughness: 0.2, emissive: 0x0288d1, emissiveIntensity: 0.35 });
    win1.position.set(-0.2, 0.08, 0.32);
    const win2 = box(0.13, 0.13, 0.04, 0x29b6f6, { metalness: 0.45, roughness: 0.2, emissive: 0x0288d1, emissiveIntensity: 0.35 });
    win2.position.set(0.2, 0.08, 0.32);
    return group(base, roof, door, win1, win2);
  },

  tree: () => {
    const trunk = cyl(0.08, 0.1, 0.42, 0x6d4c41);
    trunk.position.y = -0.22;
    const f1 = sphere(0.26, 0x2e7d32, { flat: true });
    f1.position.y = 0.1;
    const f2 = sphere(0.22, 0x388e3c, { flat: true });
    f2.position.set(-0.1, 0.27, 0.05);
    const f3 = sphere(0.2, 0x2e7d32, { flat: true });
    f3.position.set(0.12, 0.32, -0.05);
    const f4 = sphere(0.18, 0x388e3c, { flat: true });
    f4.position.y = 0.45;
    return group(trunk, f1, f2, f3, f4);
  },

  cactus: () => {
    const body = cyl(0.13, 0.15, 0.85, 0x66bb6a);
    const arm1 = cyl(0.07, 0.08, 0.32, 0x66bb6a);
    arm1.position.set(-0.18, 0.1, 0);
    arm1.rotation.z = Math.PI / 2;
    const arm1Up = cyl(0.07, 0.08, 0.22, 0x66bb6a);
    arm1Up.position.set(-0.32, 0.22, 0);
    const arm2 = cyl(0.07, 0.08, 0.27, 0x66bb6a);
    arm2.position.set(0.18, -0.05, 0);
    arm2.rotation.z = Math.PI / 2;
    const arm2Up = cyl(0.07, 0.08, 0.2, 0x66bb6a);
    arm2Up.position.set(0.3, 0.07, 0);
    const pot = cyl(0.2, 0.18, 0.22, 0xc62828);
    pot.position.y = -0.55;
    return group(body, arm1, arm1Up, arm2, arm2Up, pot);
  },

  flower: () => {
    const stem = cyl(0.025, 0.025, 0.6, 0x43a047);
    stem.position.y = -0.1;
    const center = sphere(0.1, 0xffeb3b);
    center.position.y = 0.25;
    const g = new THREE.Group();
    g.add(stem, center);
    for (let i = 0; i < 6; i++) {
      const petal = sphere(0.1, 0xe91e63);
      petal.scale.set(1.0, 0.4, 0.6);
      const a = (i / 6) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.16, 0.25, Math.sin(a) * 0.16);
      petal.rotation.y = a;
      g.add(petal);
    }
    const leaf = sphere(0.08, 0x2e7d32);
    leaf.scale.set(1.4, 0.3, 0.6);
    leaf.position.set(0.1, 0, 0);
    leaf.rotation.z = -0.5;
    g.add(leaf);
    return g;
  },

  moon: () => {
    const body = sphere(0.4, 0xfff59d, { emissive: 0xfdd835, emissiveIntensity: 0.18 });
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 5; i++) {
      const c = sphere(0.05, 0xeeeeee);
      const a = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      c.position.set(
        Math.sin(phi) * Math.cos(a) * 0.4,
        Math.cos(phi) * 0.4,
        Math.sin(phi) * Math.sin(a) * 0.4
      );
      g.add(c);
    }
    return g;
  },

  sun: () => {
    const body = sphere(0.3, 0xfdd835, { emissive: 0xff9800, emissiveIntensity: 0.6 });
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 8; i++) {
      const ray = cone(0.06, 0.22, 0xff9800, { emissive: 0xff6f00, emissiveIntensity: 0.45 });
      const a = (i / 8) * Math.PI * 2;
      ray.position.set(Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0);
      ray.rotation.z = a - Math.PI / 2;
      g.add(ray);
    }
    return g;
  },

  cloud: () => {
    const a = sphere(0.25, 0xfafafa);
    a.position.set(-0.22, 0, 0);
    const b = sphere(0.32, 0xfafafa);
    b.position.set(0, 0.05, 0);
    const c = sphere(0.25, 0xfafafa);
    c.position.set(0.22, 0, 0);
    const d = sphere(0.2, 0xfafafa);
    d.position.set(-0.1, 0.18, 0);
    const e = sphere(0.22, 0xfafafa);
    e.position.set(0.13, 0.2, 0);
    return group(a, b, c, d, e);
  },

  snowman: () => {
    const bot = sphere(0.32, 0xfafafa);
    bot.position.y = -0.4;
    const mid = sphere(0.24, 0xfafafa);
    mid.position.y = -0.05;
    const head = sphere(0.18, 0xfafafa);
    head.position.y = 0.25;
    const e1 = sphere(0.025, 0x000000);
    e1.position.set(-0.06, 0.3, 0.16);
    const e2 = sphere(0.025, 0x000000);
    e2.position.set(0.06, 0.3, 0.16);
    const noseN = cone(0.03, 0.12, 0xff7043);
    noseN.position.set(0, 0.25, 0.2);
    noseN.rotation.x = Math.PI / 2;
    const hatBrim = cyl(0.18, 0.18, 0.03, 0x212121);
    hatBrim.position.y = 0.4;
    const hatTop = cyl(0.12, 0.12, 0.18, 0x212121);
    hatTop.position.y = 0.5;
    return group(bot, mid, head, e1, e2, noseN, hatBrim, hatTop);
  },

  // ---------- Misc ----------
  robot: () => {
    const body = box(0.42, 0.5, 0.32, 0xb0bec5, { metalness: 0.5, roughness: 0.4 });
    body.position.y = -0.05;
    const head = box(0.32, 0.32, 0.32, 0xeceff1, { metalness: 0.5, roughness: 0.4 });
    head.position.y = 0.36;
    const e1 = sphere(0.05, 0x29b6f6, { emissive: 0x0288d1, emissiveIntensity: 0.7 });
    e1.position.set(-0.08, 0.38, 0.17);
    const e2 = sphere(0.05, 0x29b6f6, { emissive: 0x0288d1, emissiveIntensity: 0.7 });
    e2.position.set(0.08, 0.38, 0.17);
    const ant = cyl(0.015, 0.015, 0.16, 0xb0bec5);
    ant.position.y = 0.62;
    const antBall = sphere(0.04, 0xef5350, { emissive: 0xc62828, emissiveIntensity: 0.8 });
    antBall.position.y = 0.72;
    const armL = cyl(0.04, 0.04, 0.36, 0xb0bec5);
    armL.position.set(-0.26, -0.05, 0);
    const armR = cyl(0.04, 0.04, 0.36, 0xb0bec5);
    armR.position.set(0.26, -0.05, 0);
    return group(body, head, e1, e2, ant, antBall, armL, armR);
  },

  die: () => {
    const cube = box(0.5, 0.5, 0.5, 0xfafafa);
    const g = new THREE.Group();
    g.add(cube);
    const faces = [
      { axis: "z", sign: 1, dots: [[0, 0]] },
      { axis: "z", sign: -1, dots: [[-0.15, 0.15], [0.15, -0.15]] },
      { axis: "x", sign: 1, dots: [[-0.15, 0.15], [0, 0], [0.15, -0.15]] },
      { axis: "x", sign: -1, dots: [[-0.15, 0.15], [0.15, 0.15], [-0.15, -0.15], [0.15, -0.15]] },
      { axis: "y", sign: 1, dots: [[-0.15, 0.15], [0.15, 0.15], [0, 0], [-0.15, -0.15], [0.15, -0.15]] },
      { axis: "y", sign: -1, dots: [[-0.15, 0.15], [0.15, 0.15], [-0.15, 0], [0.15, 0], [-0.15, -0.15], [0.15, -0.15]] },
    ];
    for (const f of faces) {
      for (const [u, v] of f.dots) {
        const dot = sphere(0.04, 0x212121);
        if (f.axis === "x") dot.position.set(0.26 * f.sign, u, v);
        if (f.axis === "y") dot.position.set(u, 0.26 * f.sign, v);
        if (f.axis === "z") dot.position.set(u, v, 0.26 * f.sign);
        g.add(dot);
      }
    }
    return g;
  },

  spoon: () => {
    const bowl = sphere(0.13, 0xb0bec5, { metalness: 0.85, roughness: 0.15 });
    bowl.scale.set(1.3, 0.4, 0.85);
    bowl.position.x = 0.4;
    const handle = cyl(0.025, 0.025, 0.62, 0xb0bec5, { metalness: 0.85, roughness: 0.15 });
    handle.rotation.z = Math.PI / 2;
    return group(bowl, handle);
  },

  fork: () => {
    const handle = cyl(0.025, 0.025, 0.62, 0xb0bec5, { metalness: 0.85, roughness: 0.15 });
    handle.rotation.z = Math.PI / 2;
    const g = new THREE.Group();
    g.add(handle);
    for (let i = 0; i < 4; i++) {
      const prong = cyl(0.015, 0.015, 0.22, 0xb0bec5, { metalness: 0.85, roughness: 0.15 });
      prong.position.set(0.42, -0.075 + i * 0.05, 0);
      g.add(prong);
    }
    const baseCap = box(0.06, 0.18, 0.04, 0xb0bec5, { metalness: 0.85, roughness: 0.15 });
    baseCap.position.x = 0.31;
    g.add(baseCap);
    return g;
  },

  knife: () => {
    const handle = cyl(0.04, 0.04, 0.35, 0x4e342e);
    handle.rotation.z = Math.PI / 2;
    handle.position.x = -0.2;
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-0.05, -0.06);
    bladeShape.lineTo(0.45, 0);
    bladeShape.lineTo(-0.05, 0.06);
    bladeShape.closePath();
    const blade = mesh(new THREE.ExtrudeGeometry(bladeShape, { depth: 0.02, bevelEnabled: false }), 0xeceff1, { metalness: 0.9, roughness: 0.15 });
    return group(handle, blade);
  },

  trafficcone: () => {
    const body = cone(0.3, 0.7, 0xff6f00);
    const stripe = cyl(0.21, 0.18, 0.06, 0xfafafa);
    stripe.position.y = 0.05;
    const base = box(0.5, 0.05, 0.5, 0x212121);
    base.position.y = -0.36;
    return group(body, stripe, base);
  },

  vase: () => {
    // Lathe geometry: rotational profile.
    const pts = [];
    pts.push(new THREE.Vector2(0.0, -0.45));
    pts.push(new THREE.Vector2(0.22, -0.45));
    pts.push(new THREE.Vector2(0.28, -0.3));
    pts.push(new THREE.Vector2(0.32, -0.1));
    pts.push(new THREE.Vector2(0.18, 0.15));
    pts.push(new THREE.Vector2(0.16, 0.35));
    pts.push(new THREE.Vector2(0.22, 0.45));
    const geom = new THREE.LatheGeometry(pts, 24);
    return mesh(geom, 0x6a1b9a, { metalness: 0.4, roughness: 0.3, emissive: 0x4a148c, emissiveIntensity: 0.1 });
  },

  popcorn: () => {
    const cup = cyl(0.32, 0.28, 0.45, 0xc62828);
    cup.position.y = -0.1;
    const stripe = box(0.05, 0.45, 0.65, 0xfafafa);
    stripe.position.y = -0.1;
    const g = new THREE.Group();
    g.add(cup, stripe);
    for (let i = 0; i < 14; i++) {
      const k = sphere(0.07, 0xfff59d, { flat: true });
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.22;
      k.position.set(Math.cos(a) * r, 0.18 + Math.random() * 0.18, Math.sin(a) * r);
      g.add(k);
    }
    return g;
  },

  candle: () => {
    const wax = cyl(0.13, 0.15, 0.6, 0xfff59d);
    const wick = cyl(0.01, 0.01, 0.05, 0x212121);
    wick.position.y = 0.32;
    const flame = cone(0.05, 0.13, 0xff9800, { emissive: 0xff6f00, emissiveIntensity: 0.9 });
    flame.position.y = 0.42;
    return group(wax, wick, flame);
  },

  // ---------- Space / sky ----------
  saturn: () => {
    const planet = sphere(0.35, 0xffb74d);
    const ring = mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 48), 0xfff59d);
    ring.rotation.x = Math.PI / 2;
    ring.scale.y = 0.2;
    return group(planet, ring);
  },

  ufo: () => {
    const saucer = cyl(0.5, 0.1, 0.12, 0xb0bec5, { metalness: 0.7, roughness: 0.25 });
    const dome = sphere(0.22, 0x80deea, { metalness: 0.5, roughness: 0.2, emissive: 0x00bcd4, emissiveIntensity: 0.4 });
    dome.position.y = 0.08;
    const beam = cone(0.35, 0.4, 0xffeb3b, { emissive: 0xfdd835, emissiveIntensity: 0.6 });
    beam.position.y = -0.3;
    beam.rotation.x = Math.PI;
    beam.material = beam.material.clone();
    beam.material.transparent = true;
    beam.material.opacity = 0.4;
    return group(saucer, dome, beam);
  },

  snowflake: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const arm = box(0.05, 0.55, 0.05, 0xb3e5fc, { emissive: 0x4fc3f7, emissiveIntensity: 0.3 });
      arm.rotation.z = (i / 6) * Math.PI * 2;
      g.add(arm);
      const branchA = box(0.04, 0.18, 0.04, 0xb3e5fc, { emissive: 0x4fc3f7, emissiveIntensity: 0.3 });
      branchA.rotation.z = (i / 6) * Math.PI * 2 + 0.5;
      branchA.position.set(Math.cos((i / 6) * Math.PI * 2 + Math.PI / 2) * 0.18, Math.sin((i / 6) * Math.PI * 2 + Math.PI / 2) * 0.18, 0);
      g.add(branchA);
    }
    return g;
  },

  starfish: () => {
    const shape = new THREE.Shape();
    const pts = 5;
    const outer = 0.5, inner = 0.18;
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    geom.center();
    return mesh(geom, 0xff7043, { roughness: 0.6 });
  },

  seashell: () => {
    const g = new THREE.Group();
    // Spiral via stacked rings, increasing radius.
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const r = 0.05 + t * 0.4;
      const ring = torus(r, 0.04, 0xffccbc);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.3 + t * 0.6;
      ring.scale.y = 0.6;
      g.add(ring);
    }
    return g;
  },

  // ---------- Sports / gym ----------
  dumbbell: () => {
    const bar = cyl(0.05, 0.05, 0.6, 0x424242, { metalness: 0.7, roughness: 0.3 });
    bar.rotation.z = Math.PI / 2;
    const left = sphere(0.18, 0x212121);
    left.position.x = -0.34;
    const right = sphere(0.18, 0x212121);
    right.position.x = 0.34;
    return group(bar, left, right);
  },

  basketball2: () => {
    const ball = sphere(0.4, 0xff7043);
    const g = new THREE.Group();
    g.add(ball);
    const r = 0.401;
    // Seams.
    const seamA = torus(r, 0.012, 0x4e342e);
    seamA.rotation.x = Math.PI / 2;
    g.add(seamA);
    const seamB = torus(r, 0.012, 0x4e342e);
    g.add(seamB);
    return g;
  },

  baseball: () => {
    const ball = sphere(0.35, 0xfafafa);
    const seam = torus(0.351, 0.01, 0xc62828);
    seam.rotation.x = 0.6;
    return group(ball, seam);
  },

  football: () => {
    const ball = sphere(0.4, 0x6d4c41);
    ball.scale.set(1.5, 0.85, 0.85);
    const lace = box(0.18, 0.02, 0.04, 0xfafafa);
    lace.position.y = 0.31;
    return group(ball, lace);
  },

  tennisball: () => {
    const ball = sphere(0.35, 0xcddc39);
    const curve = torus(0.351, 0.014, 0xfafafa);
    curve.rotation.x = 0.6;
    return group(ball, curve);
  },

  // ---------- Tools / desk ----------
  pencil: () => {
    const body = cyl(0.06, 0.06, 0.85, 0xfdd835, {}, 6);
    const tip = cone(0.06, 0.16, 0xfff8e1, {}, 6);
    tip.position.y = -0.5;
    const lead = cone(0.025, 0.05, 0x212121);
    lead.position.y = -0.6;
    const ferrule = cyl(0.062, 0.062, 0.1, 0xb0bec5, { metalness: 0.6, roughness: 0.3 });
    ferrule.position.y = 0.45;
    const eraser = cyl(0.062, 0.062, 0.08, 0xef5350);
    eraser.position.y = 0.54;
    return group(body, tip, lead, ferrule, eraser);
  },

  ruler: () => {
    const body = box(0.95, 0.1, 0.04, 0xffeb3b);
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 9; i++) {
      const tick = box(0.012, 0.05, 0.05, 0x212121);
      tick.position.set(-0.4 + i * 0.1, 0.03, 0.025);
      g.add(tick);
    }
    return g;
  },

  paperclip: () => {
    // Hand-drawn rounded path approximation via two bent tubes.
    const c1 = new THREE.QuadraticBezierCurve3(v(-0.05, -0.3, 0), v(-0.25, -0.3, 0), v(-0.25, 0.0, 0));
    const c2 = new THREE.QuadraticBezierCurve3(v(-0.25, 0.0, 0), v(-0.25, 0.3, 0), v(0, 0.3, 0));
    const c3 = new THREE.QuadraticBezierCurve3(v(0, 0.3, 0), v(0.18, 0.3, 0), v(0.18, 0.05, 0));
    const c4 = new THREE.QuadraticBezierCurve3(v(0.18, 0.05, 0), v(0.18, -0.18, 0), v(-0.02, -0.18, 0));
    const merged = new THREE.CurvePath();
    [c1, c2, c3, c4].forEach((c) => merged.add(c));
    const geom = new THREE.TubeGeometry(merged, 64, 0.025, 8, false);
    return mesh(geom, 0xb0bec5, { metalness: 0.85, roughness: 0.2 });
  },

  // ---------- More food ----------
  waffle: () => {
    const g = new THREE.Group();
    const base = box(0.65, 0.12, 0.65, 0xffb74d);
    g.add(base);
    // Grid of tiny squares pressed into the surface.
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cell = box(0.13, 0.04, 0.13, 0xff9800);
        cell.position.set(-0.225 + i * 0.15, 0.075, -0.225 + j * 0.15);
        g.add(cell);
      }
    }
    const butter = box(0.18, 0.06, 0.18, 0xfff59d);
    butter.position.y = 0.13;
    g.add(butter);
    return g;
  },

  pretzel: () => {
    // A figure-8-ish pretzel made from two overlapping tube circles.
    const c1 = new THREE.EllipseCurve(-0.18, 0, 0.18, 0.18, 0, Math.PI * 2, false, 0);
    const pts1 = c1.getPoints(64).map((p) => v(p.x, p.y, 0));
    const path1 = new THREE.CatmullRomCurve3(pts1, true);
    const t1 = mesh(new THREE.TubeGeometry(path1, 64, 0.06, 10, true), 0xa1887f);
    const c2 = new THREE.EllipseCurve(0.18, 0, 0.18, 0.18, 0, Math.PI * 2, false, 0);
    const pts2 = c2.getPoints(64).map((p) => v(p.x, p.y, 0));
    const path2 = new THREE.CatmullRomCurve3(pts2, true);
    const t2 = mesh(new THREE.TubeGeometry(path2, 64, 0.06, 10, true), 0xa1887f);
    return group(t1, t2);
  },

  baguette: () => {
    const body = cyl(0.13, 0.13, 0.95, 0xd7a86e);
    body.rotation.z = Math.PI / 2;
    body.scale.set(1, 1, 0.85);
    // Diagonal slashes on top.
    const g = new THREE.Group();
    g.add(body);
    for (let i = -2; i <= 2; i++) {
      const slash = box(0.08, 0.025, 0.18, 0x8d6e63);
      slash.position.set(i * 0.16, 0.12, 0);
      slash.rotation.y = 0.4;
      g.add(slash);
    }
    return g;
  },

  pancakes: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const cake = cyl(0.36 - i * 0.02, 0.36 - i * 0.02, 0.08, 0xd7a86e);
      cake.position.y = -0.2 + i * 0.08;
      g.add(cake);
    }
    const butter = box(0.16, 0.08, 0.16, 0xfff59d);
    butter.position.y = 0.05;
    const syrup = cyl(0.32, 0.32, 0.04, 0x6d4c41, { roughness: 0.2 });
    syrup.position.y = 0.0;
    syrup.scale.set(1, 1, 1);
    g.add(butter, syrup);
    return g;
  },

  pinecone: () => {
    const body = cone(0.28, 0.7, 0x6d4c41);
    const g = new THREE.Group();
    g.add(body);
    // Scales as small cones around the body.
    for (let row = 0; row < 5; row++) {
      const y = -0.2 + row * 0.13;
      const r = 0.27 - row * 0.04;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + row * 0.2;
        const scale = sphere(0.07, 0x4e342e, { flat: true });
        scale.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        scale.scale.set(0.9, 0.5, 1.2);
        g.add(scale);
      }
    }
    return g;
  },

  acorn: () => {
    const body = sphere(0.22, 0xa1887f);
    body.scale.set(1, 1.3, 1);
    body.position.y = -0.05;
    const cap = sphere(0.24, 0x6d4c41, { flat: true });
    cap.scale.y = 0.5;
    cap.position.y = 0.18;
    const stem = cyl(0.02, 0.02, 0.08, 0x6d4c41);
    stem.position.y = 0.3;
    return group(body, cap, stem);
  },

  // ---------- Misc 2 ----------
  mailbox: () => {
    const post = cyl(0.04, 0.04, 0.7, 0x4e342e);
    post.position.y = -0.25;
    // Mailbox body — half-cylinder lying on its side.
    const body = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16, 1, false, 0, Math.PI), 0x1976d2);
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.25;
    const back = box(0.05, 0.36, 0.4, 0x1976d2);
    back.position.set(-0.2, 0.25, 0);
    const flag = box(0.02, 0.18, 0.06, 0xc62828);
    flag.position.set(0.2, 0.35, 0);
    return group(post, body, back, flag);
  },

  teapot: () => {
    const body = sphere(0.32, 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    body.scale.y = 0.85;
    const lid = cyl(0.14, 0.14, 0.06, 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    lid.position.y = 0.3;
    const knob = sphere(0.05, 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    knob.position.y = 0.36;
    const spoutCurve = new THREE.QuadraticBezierCurve3(v(0.28, 0.05, 0), v(0.45, 0.1, 0), v(0.5, 0.25, 0));
    const spout = mesh(new THREE.TubeGeometry(spoutCurve, 16, 0.05, 8, false), 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    const handle = mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 16, Math.PI), 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    handle.position.set(-0.32, 0.05, 0);
    handle.rotation.z = -Math.PI / 2;
    return group(body, lid, knob, spout, handle);
  },

  helmet: () => {
    const dome = sphere(0.4, 0xc62828, { metalness: 0.3, roughness: 0.4 });
    dome.scale.y = 1.05;
    // Cut-out the bottom half by stacking a base ring instead.
    const visor = box(0.7, 0.18, 0.05, 0x212121, { metalness: 0.5, roughness: 0.2, emissive: 0x000000 });
    visor.position.set(0, -0.1, 0.32);
    const base = cyl(0.41, 0.41, 0.06, 0xc62828);
    base.position.y = -0.34;
    return group(dome, visor, base);
  },

  sword: () => {
    const handle = cyl(0.04, 0.04, 0.18, 0x4e342e);
    handle.position.y = -0.45;
    const guard = box(0.25, 0.04, 0.06, 0xffd700, { metalness: 0.85, roughness: 0.2 });
    guard.position.y = -0.34;
    const blade = box(0.08, 0.7, 0.03, 0xeceff1, { metalness: 0.95, roughness: 0.1 });
    blade.position.y = 0.04;
    const tip = cone(0.045, 0.1, 0xeceff1, { metalness: 0.95, roughness: 0.1 });
    tip.position.y = 0.44;
    const pommel = sphere(0.05, 0xffd700, { metalness: 0.85, roughness: 0.2 });
    pommel.position.y = -0.55;
    return group(handle, guard, blade, tip, pommel);
  },

  shield: () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.35, 0.4);
    shape.bezierCurveTo(-0.45, 0.2, -0.45, -0.1, -0.3, -0.3);
    shape.bezierCurveTo(-0.15, -0.5, 0.15, -0.5, 0.3, -0.3);
    shape.bezierCurveTo(0.45, -0.1, 0.45, 0.2, 0.35, 0.4);
    shape.lineTo(-0.35, 0.4);
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 2 });
    geom.center();
    const body = mesh(geom, 0x1976d2);
    const crossH = box(0.5, 0.08, 0.13, 0xffd700, { metalness: 0.8, roughness: 0.2 });
    crossH.position.z = 0.06;
    const crossV = box(0.08, 0.7, 0.13, 0xffd700, { metalness: 0.8, roughness: 0.2 });
    crossV.position.z = 0.06;
    return group(body, crossH, crossV);
  },

  anchor: () => {
    const stem = cyl(0.05, 0.05, 0.6, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    const ring = torus(0.12, 0.04, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    ring.position.y = 0.36;
    const cross = box(0.4, 0.05, 0.06, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    cross.position.y = 0.18;
    const arc = mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 24, Math.PI), 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    arc.position.y = -0.32;
    arc.rotation.z = Math.PI;
    const tipL = cone(0.07, 0.12, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipL.position.set(-0.25, -0.32, 0);
    tipL.rotation.z = Math.PI / 4;
    const tipR = cone(0.07, 0.12, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipR.position.set(0.25, -0.32, 0);
    tipR.rotation.z = -Math.PI / 4;
    return group(stem, ring, cross, arc, tipL, tipR);
  },

  microphone: () => {
    const head = sphere(0.18, 0x424242, { metalness: 0.65, roughness: 0.25 });
    head.position.y = 0.25;
    const handle = cyl(0.07, 0.07, 0.4, 0x212121);
    handle.position.y = -0.05;
    const base = cyl(0.13, 0.15, 0.05, 0x212121);
    base.position.y = -0.27;
    const grille = mesh(new THREE.IcosahedronGeometry(0.18, 0), 0x9e9e9e, { flat: true, metalness: 0.4, roughness: 0.5 });
    grille.position.y = 0.25;
    return group(grille, handle, base);
  },

  camera3d: () => {
    const body = box(0.55, 0.32, 0.32, 0x212121);
    const lens = cyl(0.13, 0.13, 0.18, 0x424242, { metalness: 0.5, roughness: 0.3 });
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, -0.02, 0.22);
    const glass = sphere(0.1, 0x29b6f6, { metalness: 0.7, roughness: 0.1, emissive: 0x0288d1, emissiveIntensity: 0.3 });
    glass.position.set(0, -0.02, 0.32);
    const top = box(0.55, 0.06, 0.32, 0x424242);
    top.position.y = 0.18;
    const flash = box(0.12, 0.06, 0.06, 0xfafafa, { emissive: 0xfff59d, emissiveIntensity: 0.6 });
    flash.position.set(-0.18, 0.22, 0.16);
    return group(body, lens, glass, top, flash);
  },
};

// Build the public OBJECTS array. Order = display order in the grid.
export const OBJECTS = Object.entries(builders).map(([name, build]) => ({ name, build }));
