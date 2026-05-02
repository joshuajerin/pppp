// Cooked food, sweets, baked goods.
import { THREE, mesh, group, sphere, box, cyl, cone, torus, v } from "./_primitives.js";

export const builders = {
  donut: () => {
    const body = torus(0.3, 0.14, 0xf48fb1);
    body.rotation.x = Math.PI / 2;
    const icing = torus(0.3, 0.145, 0xec407a);
    icing.rotation.x = Math.PI / 2;
    icing.position.y = 0.04;
    icing.scale.set(1.0, 1.0, 0.6);
    const g = new THREE.Group();
    g.add(body, icing);
    const sprinkleColors = [0xffd54f, 0x81c784, 0x64b5f6, 0xff8a65, 0xba68c8];
    for (let i = 0; i < 14; i++) {
      const s = cyl(0.018, 0.018, 0.08, sprinkleColors[i % sprinkleColors.length]);
      const a = Math.random() * Math.PI * 2;
      const r = 0.25 + Math.random() * 0.1;
      s.position.set(Math.cos(a) * r, 0.08, Math.sin(a) * r);
      s.rotation.z = Math.random() * Math.PI;
      s.rotation.x = Math.random() * Math.PI;
      g.add(s);
    }
    return g;
  },

  cookie: () => {
    const body = cyl(0.4, 0.4, 0.12, 0xa1887f, {}, 32);
    const g = new THREE.Group();
    g.add(body);
    for (let i = 0; i < 6; i++) {
      const chip = sphere(0.06, 0x3e2723);
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.3;
      chip.position.set(Math.cos(a) * r, 0.07, Math.sin(a) * r);
      g.add(chip);
    }
    return g;
  },

  icecream: () => {
    const c = cone(0.25, 0.6, 0xd7a86e, { flat: true });
    c.position.y = -0.2;
    c.rotation.x = Math.PI;
    const scoop = sphere(0.32, 0xf8bbd0);
    scoop.position.y = 0.2;
    const cherry = sphere(0.08, 0xc62828);
    cherry.position.y = 0.55;
    return group(c, scoop, cherry);
  },

  cake: () => {
    const base = cyl(0.42, 0.42, 0.3, 0xfff8e1);
    base.position.y = -0.1;
    const frosting = cyl(0.45, 0.4, 0.1, 0xf06292);
    frosting.position.y = 0.1;
    const candle = cyl(0.04, 0.04, 0.18, 0xfff59d);
    candle.position.y = 0.25;
    const flame = cone(0.05, 0.1, 0xff6f00, { emissive: 0xff6f00, emissiveIntensity: 0.6 });
    flame.position.y = 0.4;
    return group(base, frosting, candle, flame);
  },

  pizza: () => {
    const base = cyl(0.5, 0.5, 0.06, 0xffe0b2, {}, 32);
    const sauce = cyl(0.46, 0.46, 0.04, 0xc62828, {}, 32);
    sauce.position.y = 0.05;
    const cheese = cyl(0.44, 0.44, 0.03, 0xfff59d, {}, 32);
    cheese.position.y = 0.07;
    const g = new THREE.Group();
    g.add(base, sauce, cheese);
    for (let i = 0; i < 5; i++) {
      const pep = cyl(0.07, 0.07, 0.02, 0xb71c1c, {}, 16);
      const a = (i / 5) * Math.PI * 2;
      pep.position.set(Math.cos(a) * 0.25, 0.09, Math.sin(a) * 0.25);
      g.add(pep);
    }
    return g;
  },

  burger: () => {
    const bun1 = sphere(0.4, 0xd7a86e);
    bun1.scale.y = 0.4;
    bun1.position.y = 0.3;
    const lettuce = cyl(0.42, 0.42, 0.06, 0x66bb6a, { flat: true });
    lettuce.position.y = 0.13;
    const patty = cyl(0.4, 0.4, 0.13, 0x6d4c41);
    patty.position.y = 0;
    const cheese = box(0.7, 0.04, 0.7, 0xffca28);
    cheese.position.y = 0.08;
    cheese.rotation.y = Math.PI / 4;
    const bun2 = sphere(0.4, 0xd7a86e);
    bun2.scale.set(1.0, 0.5, 1.0);
    bun2.position.y = -0.2;
    return group(bun1, lettuce, patty, cheese, bun2);
  },

  egg: () => {
    const body = sphere(0.32, 0xfff8e1);
    body.scale.set(1.0, 1.4, 1.0);
    return body;
  },

  sushi: () => {
    const rice = cyl(0.3, 0.32, 0.32, 0xfafafa);
    rice.position.y = -0.13;
    const fishTop = box(0.7, 0.07, 0.4, 0xff7043);
    fishTop.position.y = 0.06;
    const nori = cyl(0.32, 0.32, 0.07, 0x1b5e20);
    nori.position.y = -0.13;
    return group(rice, fishTop, nori);
  },

  hotdog: () => {
    const bun = cyl(0.25, 0.25, 0.95, 0xd7a86e);
    bun.rotation.z = Math.PI / 2;
    const sausage = cyl(0.18, 0.18, 1.0, 0xc62828);
    sausage.rotation.z = Math.PI / 2;
    sausage.position.y = 0.06;
    const mustard = box(0.95, 0.05, 0.06, 0xffeb3b);
    mustard.position.y = 0.18;
    return group(bun, sausage, mustard);
  },

  taco: () => {
    const shell = mesh(new THREE.TorusGeometry(0.3, 0.09, 10, 28, Math.PI), 0xfdd835, { flat: true });
    shell.rotation.z = Math.PI;
    const g = new THREE.Group();
    g.add(shell);
    const lettuce = sphere(0.1, 0x66bb6a);
    lettuce.scale.set(1.2, 0.5, 1.2);
    lettuce.position.set(-0.1, 0.06, 0);
    const tomato = sphere(0.08, 0xc62828);
    tomato.scale.set(1.0, 0.5, 1.0);
    tomato.position.set(0.1, 0.06, 0);
    const ch = sphere(0.07, 0xfdd835);
    ch.position.set(0, 0.12, 0);
    g.add(lettuce, tomato, ch);
    return g;
  },

  lollipop: () => {
    const ball = sphere(0.26, 0xe91e63);
    ball.position.y = 0.25;
    const swirl = torus(0.25, 0.025, 0xffffff);
    swirl.position.y = 0.25;
    swirl.rotation.x = 0.3;
    const stick = cyl(0.025, 0.025, 0.65, 0xffffff);
    stick.position.y = -0.1;
    return group(ball, swirl, stick);
  },

  cheese: () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.4, -0.2);
    shape.lineTo(0.4, -0.2);
    shape.lineTo(0, 0.4);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 1 });
    geom.center();
    const wedge = mesh(geom, 0xfdd835);
    const g = new THREE.Group();
    g.add(wedge);
    for (let i = 0; i < 5; i++) {
      const hole = sphere(0.04, 0xfbc02d);
      hole.position.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, 0.16);
      g.add(hole);
    }
    return g;
  },

  bread: () => {
    const body = sphere(0.4, 0xd7a86e);
    body.scale.set(1.7, 0.85, 0.95);
    const top = sphere(0.36, 0xa1887f);
    top.scale.set(1.6, 0.2, 0.85);
    top.position.y = 0.16;
    return group(body, top);
  },

  popcorn: () => {
    const cup = cyl(0.32, 0.28, 0.45, 0xc62828);
    cup.position.y = -0.1;
    const stripe = box(0.05, 0.45, 0.65, 0xfafafa);
    stripe.position.y = -0.1;
    const g = new THREE.Group();
    g.add(cup, stripe);
    for (let i = 0; i < 14; i++) {
      const k = sphere(0.07, 0xfff59d, { flat: true });
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.22;
      k.position.set(Math.cos(a) * r, 0.18 + Math.random() * 0.18, Math.sin(a) * r);
      g.add(k);
    }
    return g;
  },

  waffle: () => {
    const g = new THREE.Group();
    const base = box(0.65, 0.12, 0.65, 0xffb74d);
    g.add(base);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cell = box(0.13, 0.04, 0.13, 0xff9800);
        cell.position.set(-0.225 + i * 0.15, 0.075, -0.225 + j * 0.15);
        g.add(cell);
      }
    }
    const butter = box(0.18, 0.06, 0.18, 0xfff59d);
    butter.position.y = 0.13;
    g.add(butter);
    return g;
  },

  pretzel: () => {
    const c1 = new THREE.EllipseCurve(-0.18, 0, 0.18, 0.18, 0, Math.PI * 2, false, 0);
    const pts1 = c1.getPoints(64).map((p) => v(p.x, p.y, 0));
    const path1 = new THREE.CatmullRomCurve3(pts1, true);
    const t1 = mesh(new THREE.TubeGeometry(path1, 64, 0.06, 10, true), 0xa1887f);
    const c2 = new THREE.EllipseCurve(0.18, 0, 0.18, 0.18, 0, Math.PI * 2, false, 0);
    const pts2 = c2.getPoints(64).map((p) => v(p.x, p.y, 0));
    const path2 = new THREE.CatmullRomCurve3(pts2, true);
    const t2 = mesh(new THREE.TubeGeometry(path2, 64, 0.06, 10, true), 0xa1887f);
    return group(t1, t2);
  },

  baguette: () => {
    const body = cyl(0.13, 0.13, 0.95, 0xd7a86e);
    body.rotation.z = Math.PI / 2;
    body.scale.set(1, 1, 0.85);
    const g = new THREE.Group();
    g.add(body);
    for (let i = -2; i <= 2; i++) {
      const slash = box(0.08, 0.025, 0.18, 0x8d6e63);
      slash.position.set(i * 0.16, 0.12, 0);
      slash.rotation.y = 0.4;
      g.add(slash);
    }
    return g;
  },

  pancakes: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const cake = cyl(0.36 - i * 0.02, 0.36 - i * 0.02, 0.08, 0xd7a86e);
      cake.position.y = -0.2 + i * 0.08;
      g.add(cake);
    }
    const butter = box(0.16, 0.08, 0.16, 0xfff59d);
    butter.position.y = 0.05;
    const syrup = cyl(0.32, 0.32, 0.04, 0x6d4c41, { roughness: 0.2 });
    syrup.position.y = 0.0;
    g.add(butter, syrup);
    return g;
  },
};
