// Abstract / geometric shapes.
import { THREE, mesh, group, sphere } from "./_primitives.js";

export const builders = {
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
};
