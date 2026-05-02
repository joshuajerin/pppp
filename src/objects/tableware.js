// Cutlery — spoon, fork, knife.
import { THREE, mesh, group, sphere, box, cyl } from "./_primitives.js";

export const builders = {
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
};
