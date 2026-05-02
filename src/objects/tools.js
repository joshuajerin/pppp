// Tools, hardware, household items, and desk accessories.
import { THREE, mesh, group, sphere, box, cyl, cone, v } from "./_primitives.js";

export const builders = {
  hammer: () => {
    const handle = cyl(0.05, 0.06, 0.9, 0x6d4c41);
    handle.position.y = -0.15;
    const head = box(0.2, 0.2, 0.45, 0x607d8b, { metalness: 0.7, roughness: 0.3 });
    head.position.y = 0.4;
    const claw = mesh(new THREE.TorusGeometry(0.1, 0.04, 8, 16, Math.PI), 0x607d8b, { metalness: 0.7, roughness: 0.3 });
    claw.position.set(-0.18, 0.4, 0);
    claw.rotation.y = Math.PI / 2;
    return group(handle, head, claw);
  },

  wrench: () => {
    const body = box(0.6, 0.13, 0.06, 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    const endL = mesh(new THREE.TorusGeometry(0.11, 0.04, 8, 18, Math.PI * 1.4), 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    endL.position.set(-0.32, 0, 0);
    endL.rotation.z = -Math.PI / 4;
    const endR = mesh(new THREE.TorusGeometry(0.11, 0.04, 8, 18, Math.PI * 1.4), 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    endR.position.set(0.32, 0, 0);
    endR.rotation.z = Math.PI - Math.PI / 4;
    return group(body, endL, endR);
  },

  axe: () => {
    const handle = cyl(0.05, 0.05, 0.85, 0x6d4c41);
    handle.position.y = -0.1;
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.22);
    shape.lineTo(0.32, -0.16);
    shape.lineTo(0.42, 0);
    shape.lineTo(0.32, 0.16);
    shape.lineTo(0, 0.22);
    shape.closePath();
    const blade = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false }), 0xeceff1, { metalness: 0.85, roughness: 0.2 });
    blade.position.set(0.05, 0.32, 0);
    return group(handle, blade);
  },

  shovel: () => {
    const handle = cyl(0.04, 0.04, 0.8, 0x6d4c41);
    handle.position.y = 0.1;
    const spade = box(0.25, 0.32, 0.05, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    spade.position.y = -0.4;
    const grip = box(0.16, 0.04, 0.06, 0x6d4c41);
    grip.position.y = 0.5;
    return group(handle, spade, grip);
  },

  pencil: () => {
    const body = cyl(0.06, 0.06, 0.85, 0xfdd835, {}, 6);
    const tip = cone(0.06, 0.16, 0xfff8e1, {}, 6);
    tip.position.y = -0.5;
    const lead = cone(0.025, 0.05, 0x212121);
    lead.position.y = -0.6;
    const ferrule = cyl(0.062, 0.062, 0.1, 0xb0bec5, { metalness: 0.6, roughness: 0.3 });
    ferrule.position.y = 0.45;
    const eraser = cyl(0.062, 0.062, 0.08, 0xef5350);
    eraser.position.y = 0.54;
    return group(body, tip, lead, ferrule, eraser);
  },

  ruler: () => {
    const body = box(0.95, 0.1, 0.04, 0xffeb3b);
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 9; i++) {
      const tick = box(0.012, 0.05, 0.05, 0x212121);
      tick.position.set(-0.4 + i * 0.1, 0.03, 0.025);
      g.add(tick);
    }
    return g;
  },

  paperclip: () => {
    const c1 = new THREE.QuadraticBezierCurve3(v(-0.05, -0.3, 0), v(-0.25, -0.3, 0), v(-0.25, 0.0, 0));
    const c2 = new THREE.QuadraticBezierCurve3(v(-0.25, 0.0, 0), v(-0.25, 0.3, 0), v(0, 0.3, 0));
    const c3 = new THREE.QuadraticBezierCurve3(v(0, 0.3, 0), v(0.18, 0.3, 0), v(0.18, 0.05, 0));
    const c4 = new THREE.QuadraticBezierCurve3(v(0.18, 0.05, 0), v(0.18, -0.18, 0), v(-0.02, -0.18, 0));
    const merged = new THREE.CurvePath();
    [c1, c2, c3, c4].forEach((c) => merged.add(c));
    const geom = new THREE.TubeGeometry(merged, 64, 0.025, 8, false);
    return mesh(geom, 0xb0bec5, { metalness: 0.85, roughness: 0.2 });
  },

  candle: () => {
    const wax = cyl(0.13, 0.15, 0.6, 0xfff59d);
    const wick = cyl(0.01, 0.01, 0.05, 0x212121);
    wick.position.y = 0.32;
    const flame = cone(0.05, 0.13, 0xff9800, { emissive: 0xff6f00, emissiveIntensity: 0.9 });
    flame.position.y = 0.42;
    return group(wax, wick, flame);
  },

  magnet: () => {
    const main = mesh(new THREE.TorusGeometry(0.3, 0.09, 10, 28, Math.PI), 0xc62828);
    main.rotation.z = Math.PI;
    const tipL = box(0.18, 0.12, 0.18, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipL.position.set(-0.3, 0, 0);
    const tipR = box(0.18, 0.12, 0.18, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    tipR.position.set(0.3, 0, 0);
    return group(main, tipL, tipR);
  },

  lightbulb: () => {
    const bulb = sphere(0.32, 0xfff59d, { emissive: 0xfdd835, emissiveIntensity: 0.45 });
    bulb.position.y = 0.12;
    bulb.scale.y = 1.18;
    const screw = cyl(0.13, 0.16, 0.22, 0xb0bec5, { metalness: 0.75, roughness: 0.25 });
    screw.position.y = -0.25;
    const tip = cyl(0.06, 0.06, 0.06, 0x424242);
    tip.position.y = -0.39;
    return group(bulb, screw, tip);
  },

  battery: () => {
    const body = cyl(0.18, 0.18, 0.55, 0xfdd835);
    const term = cyl(0.06, 0.06, 0.07, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    term.position.y = 0.31;
    const bot = cyl(0.18, 0.18, 0.04, 0xb0bec5, { metalness: 0.7, roughness: 0.3 });
    bot.position.y = -0.27;
    const stripe = cyl(0.181, 0.181, 0.06, 0x212121);
    stripe.position.y = 0.06;
    return group(body, term, bot, stripe);
  },
};
