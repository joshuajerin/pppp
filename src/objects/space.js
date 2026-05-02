// Celestial bodies and atmospheric stuff.
import { THREE, mesh, group, sphere, cyl, cone } from "./_primitives.js";

export const builders = {
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
};
