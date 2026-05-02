// Fruit builders. Apples, citrus, berries — anything you'd find in a market.
import { THREE, mesh, group, sphere, box, cyl, cone, torus, tube, v } from "./_primitives.js";

export const builders = {
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

  pineapple: () => {
    const g = new THREE.Group();
    const body = cyl(0.4, 0.34, 0.85, 0xfdd835, { flat: true }, 12);
    g.add(body);
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
};
