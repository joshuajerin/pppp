// Creatures, robots, mascots — anything with a face.
import { THREE, mesh, group, sphere, box, cyl, cone } from "./_primitives.js";

export const builders = {
  fish: () => {
    const body = sphere(0.4, 0x29b6f6);
    body.scale.set(1.0, 0.65, 0.5);
    const tail = cone(0.18, 0.3, 0x29b6f6, { flat: true });
    tail.position.x = -0.45;
    tail.rotation.z = Math.PI / 2;
    const eye = sphere(0.05, 0xffffff);
    eye.position.set(0.25, 0.05, 0.18);
    const pupil = sphere(0.025, 0x000000);
    pupil.position.set(0.28, 0.05, 0.21);
    const fin = cone(0.1, 0.18, 0x0288d1, { flat: true });
    fin.position.y = 0.22;
    return group(body, tail, eye, pupil, fin);
  },

  ghost: () => {
    const body = sphere(0.4, 0xeeeeee, { emissive: 0xffffff, emissiveIntensity: 0.05 });
    const skirt = cone(0.4, 0.5, 0xeeeeee, { flat: true });
    skirt.position.y = -0.3;
    skirt.rotation.x = Math.PI;
    const eye1 = sphere(0.05, 0x000000);
    eye1.position.set(-0.12, 0.05, 0.32);
    const eye2 = sphere(0.05, 0x000000);
    eye2.position.set(0.12, 0.05, 0.32);
    const mouth = sphere(0.04, 0x000000);
    mouth.position.set(0, -0.1, 0.32);
    return group(body, skirt, eye1, eye2, mouth);
  },

  snowman: () => {
    const bot = sphere(0.32, 0xfafafa);
    bot.position.y = -0.4;
    const mid = sphere(0.24, 0xfafafa);
    mid.position.y = -0.05;
    const head = sphere(0.18, 0xfafafa);
    head.position.y = 0.25;
    const e1 = sphere(0.025, 0x000000);
    e1.position.set(-0.06, 0.3, 0.16);
    const e2 = sphere(0.025, 0x000000);
    e2.position.set(0.06, 0.3, 0.16);
    const noseN = cone(0.03, 0.12, 0xff7043);
    noseN.position.set(0, 0.25, 0.2);
    noseN.rotation.x = Math.PI / 2;
    const hatBrim = cyl(0.18, 0.18, 0.03, 0x212121);
    hatBrim.position.y = 0.4;
    const hatTop = cyl(0.12, 0.12, 0.18, 0x212121);
    hatTop.position.y = 0.5;
    return group(bot, mid, head, e1, e2, noseN, hatBrim, hatTop);
  },

  robot: () => {
    const body = box(0.42, 0.5, 0.32, 0xb0bec5, { metalness: 0.5, roughness: 0.4 });
    body.position.y = -0.05;
    const head = box(0.32, 0.32, 0.32, 0xeceff1, { metalness: 0.5, roughness: 0.4 });
    head.position.y = 0.36;
    const e1 = sphere(0.05, 0x29b6f6, { emissive: 0x0288d1, emissiveIntensity: 0.7 });
    e1.position.set(-0.08, 0.38, 0.17);
    const e2 = sphere(0.05, 0x29b6f6, { emissive: 0x0288d1, emissiveIntensity: 0.7 });
    e2.position.set(0.08, 0.38, 0.17);
    const ant = cyl(0.015, 0.015, 0.16, 0xb0bec5);
    ant.position.y = 0.62;
    const antBall = sphere(0.04, 0xef5350, { emissive: 0xc62828, emissiveIntensity: 0.8 });
    antBall.position.y = 0.72;
    const armL = cyl(0.04, 0.04, 0.36, 0xb0bec5);
    armL.position.set(-0.26, -0.05, 0);
    const armR = cyl(0.04, 0.04, 0.36, 0xb0bec5);
    armR.position.set(0.26, -0.05, 0);
    return group(body, head, e1, e2, ant, antBall, armL, armR);
  },

  skull: () => {
    const head = sphere(0.45, 0xeceff1);
    head.scale.set(1.0, 1.0, 0.95);
    const jaw = box(0.5, 0.18, 0.4, 0xeceff1);
    jaw.position.y = -0.4;
    const eye1 = sphere(0.12, 0x000000);
    eye1.position.set(-0.18, 0.05, 0.35);
    const eye2 = sphere(0.12, 0x000000);
    eye2.position.set(0.18, 0.05, 0.35);
    const noseHole = mesh(new THREE.ConeGeometry(0.06, 0.15, 4), 0x000000, { flat: true });
    noseHole.position.set(0, -0.15, 0.4);
    noseHole.rotation.x = Math.PI;
    return group(head, jaw, eye1, eye2, noseHole);
  },
};
