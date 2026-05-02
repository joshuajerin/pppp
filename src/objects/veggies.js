// Vegetable builders.
import { THREE, mesh, group, sphere, box, cyl, cone } from "./_primitives.js";

export const builders = {
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
    for (let i = 0; i < 6; i++) {
      const spot = sphere(0.06, 0xffffff);
      const a = (i / 6) * Math.PI * 2;
      const r = 0.28;
      spot.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
      g.add(spot);
    }
    return g;
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
};
