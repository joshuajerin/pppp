// Plants, sea life, weather elements.
import { THREE, mesh, group, sphere, box, cyl, cone, torus } from "./_primitives.js";

export const builders = {
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

  snowflake: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const arm = box(0.05, 0.55, 0.05, 0xb3e5fc, { emissive: 0x4fc3f7, emissiveIntensity: 0.3 });
      arm.rotation.z = (i / 6) * Math.PI * 2;
      g.add(arm);
      const branchA = box(0.04, 0.18, 0.04, 0xb3e5fc, { emissive: 0x4fc3f7, emissiveIntensity: 0.3 });
      branchA.rotation.z = (i / 6) * Math.PI * 2 + 0.5;
      branchA.position.set(
        Math.cos((i / 6) * Math.PI * 2 + Math.PI / 2) * 0.18,
        Math.sin((i / 6) * Math.PI * 2 + Math.PI / 2) * 0.18,
        0
      );
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

  pinecone: () => {
    const body = cone(0.28, 0.7, 0x6d4c41);
    const g = new THREE.Group();
    g.add(body);
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
};
