// Tech / electronics.
import { THREE, mesh, group, sphere, box, cyl } from "./_primitives.js";

export const builders = {
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

  camera: () => {
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
