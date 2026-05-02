// Weapons, armor, and the anchor (close enough).
import { THREE, mesh, group, sphere, box, cyl, cone, torus } from "./_primitives.js";

export const builders = {
  bomb: () => {
    const body = sphere(0.4, 0x212121);
    const fuseTube = cyl(0.04, 0.04, 0.18, 0x6d4c41);
    fuseTube.position.y = 0.45;
    const spark = sphere(0.08, 0xff9800, { emissive: 0xff6f00, emissiveIntensity: 1.0 });
    spark.position.y = 0.6;
    return group(body, fuseTube, spark);
  },

  sword: () => {
    const handle = cyl(0.04, 0.04, 0.18, 0x4e342e);
    handle.position.y = -0.45;
    const guard = box(0.25, 0.04, 0.06, 0xffd700, { metalness: 0.85, roughness: 0.2 });
    guard.position.y = -0.34;
    const blade = box(0.08, 0.7, 0.03, 0xeceff1, { metalness: 0.95, roughness: 0.1 });
    blade.position.y = 0.04;
    const tip = cone(0.045, 0.1, 0xeceff1, { metalness: 0.95, roughness: 0.1 });
    tip.position.y = 0.44;
    const pommel = sphere(0.05, 0xffd700, { metalness: 0.85, roughness: 0.2 });
    pommel.position.y = -0.55;
    return group(handle, guard, blade, tip, pommel);
  },

  shield: () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.35, 0.4);
    shape.bezierCurveTo(-0.45, 0.2, -0.45, -0.1, -0.3, -0.3);
    shape.bezierCurveTo(-0.15, -0.5, 0.15, -0.5, 0.3, -0.3);
    shape.bezierCurveTo(0.45, -0.1, 0.45, 0.2, 0.35, 0.4);
    shape.lineTo(-0.35, 0.4);
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 2 });
    geom.center();
    const body = mesh(geom, 0x1976d2);
    const crossH = box(0.5, 0.08, 0.13, 0xffd700, { metalness: 0.8, roughness: 0.2 });
    crossH.position.z = 0.06;
    const crossV = box(0.08, 0.7, 0.13, 0xffd700, { metalness: 0.8, roughness: 0.2 });
    crossV.position.z = 0.06;
    return group(body, crossH, crossV);
  },

  helmet: () => {
    const dome = sphere(0.4, 0xc62828, { metalness: 0.3, roughness: 0.4 });
    dome.scale.y = 1.05;
    const visor = box(0.7, 0.18, 0.05, 0x212121, { metalness: 0.5, roughness: 0.2 });
    visor.position.set(0, -0.1, 0.32);
    const base = cyl(0.41, 0.41, 0.06, 0xc62828);
    base.position.y = -0.34;
    return group(dome, visor, base);
  },

  anchor: () => {
    const stem = cyl(0.05, 0.05, 0.6, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    const ring = torus(0.12, 0.04, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    ring.position.y = 0.36;
    const cross = box(0.4, 0.05, 0.06, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    cross.position.y = 0.18;
    const arc = mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 24, Math.PI), 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    arc.position.y = -0.32;
    arc.rotation.z = Math.PI;
    const tipL = cone(0.07, 0.12, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipL.position.set(-0.25, -0.32, 0);
    tipL.rotation.z = Math.PI / 4;
    const tipR = cone(0.07, 0.12, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipR.position.set(0.25, -0.32, 0);
    tipR.rotation.z = -Math.PI / 4;
    return group(stem, ring, cross, arc, tipL, tipR);
  },
};
