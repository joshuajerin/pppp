// Sports balls and gym equipment.
import { THREE, group, sphere, box, cyl, torus } from "./_primitives.js";

export const builders = {
  dumbbell: () => {
    const bar = cyl(0.05, 0.05, 0.6, 0x424242, { metalness: 0.7, roughness: 0.3 });
    bar.rotation.z = Math.PI / 2;
    const left = sphere(0.18, 0x212121);
    left.position.x = -0.34;
    const right = sphere(0.18, 0x212121);
    right.position.x = 0.34;
    return group(bar, left, right);
  },

  basketball: () => {
    const ball = sphere(0.4, 0xff7043);
    const g = new THREE.Group();
    g.add(ball);
    const r = 0.401;
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
};
