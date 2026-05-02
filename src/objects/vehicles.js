// Cars, planes, boats, rockets — things that move.
import { THREE, mesh, group, sphere, box, cyl, cone } from "./_primitives.js";

export const builders = {
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
};
