// Drinks & vessels.
import { THREE, mesh, group, sphere, cyl, torus, v } from "./_primitives.js";

export const builders = {
  bottle: () => {
    const body = cyl(0.18, 0.2, 0.7, 0x2e7d32);
    body.position.y = -0.15;
    const shoulder = cyl(0.18, 0.08, 0.18, 0x2e7d32);
    shoulder.position.y = 0.29;
    const neck = cyl(0.07, 0.07, 0.18, 0x2e7d32);
    neck.position.y = 0.47;
    const cap = cyl(0.08, 0.08, 0.08, 0xffd54f, { metalness: 0.7, roughness: 0.3 });
    cap.position.y = 0.6;
    return group(body, shoulder, neck, cap);
  },

  cup: () => {
    const body = cyl(0.3, 0.22, 0.5, 0xffffff);
    const handle = torus(0.12, 0.04, 0xffffff);
    handle.position.set(0.32, 0, 0);
    handle.rotation.y = Math.PI / 2;
    const liquid = cyl(0.28, 0.21, 0.05, 0x6d4c41);
    liquid.position.y = 0.22;
    return group(body, handle, liquid);
  },

  teapot: () => {
    const body = sphere(0.32, 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    body.scale.y = 0.85;
    const lid = cyl(0.14, 0.14, 0.06, 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    lid.position.y = 0.3;
    const knob = sphere(0.05, 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    knob.position.y = 0.36;
    const spoutCurve = new THREE.QuadraticBezierCurve3(v(0.28, 0.05, 0), v(0.45, 0.1, 0), v(0.5, 0.25, 0));
    const spout = mesh(new THREE.TubeGeometry(spoutCurve, 16, 0.05, 8, false), 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    const handle = mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 16, Math.PI), 0xeceff1, { metalness: 0.3, roughness: 0.4 });
    handle.position.set(-0.32, 0.05, 0);
    handle.rotation.z = -Math.PI / 2;
    return group(body, lid, knob, spout, handle);
  },
};
