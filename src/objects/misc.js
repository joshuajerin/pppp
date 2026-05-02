// Anything that doesn't fit a clean category.
import { THREE, mesh, group, sphere, box, cyl, cone, torus } from "./_primitives.js";

export const builders = {
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

  vase: () => {
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

  mailbox: () => {
    const post = cyl(0.04, 0.04, 0.7, 0x4e342e);
    post.position.y = -0.25;
    const body = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16, 1, false, 0, Math.PI), 0x1976d2);
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.25;
    const back = box(0.05, 0.36, 0.4, 0x1976d2);
    back.position.set(-0.2, 0.25, 0);
    const flag = box(0.02, 0.18, 0.06, 0xc62828);
    flag.position.set(0.2, 0.35, 0);
    return group(post, body, back, flag);
  },

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

  trafficcone: () => {
    const body = cone(0.3, 0.7, 0xff6f00);
    const stripe = cyl(0.21, 0.18, 0.06, 0xfafafa);
    stripe.position.y = 0.05;
    const base = box(0.5, 0.05, 0.5, 0x212121);
    base.position.y = -0.36;
    return group(body, stripe, base);
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
      for (const [u, w] of f.dots) {
        const dot = sphere(0.04, 0x212121);
        if (f.axis === "x") dot.position.set(0.26 * f.sign, u, w);
        if (f.axis === "y") dot.position.set(u, 0.26 * f.sign, w);
        if (f.axis === "z") dot.position.set(u, w, 0.26 * f.sign);
        g.add(dot);
      }
    }
    return g;
  },
};
