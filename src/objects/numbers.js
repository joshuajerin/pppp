// 7-segment LED-style digits. Just 6 and 7 — the only two we actually need.
//
//      AAA
//     F   B
//      GGG
//     E   C
//      DDD
//
// "6" lights A F G E C D (no B). "7" lights A B C (just the top + right column).
import { THREE, group, box } from "./_primitives.js";

// Cranked up to roughly 2× visual size — these read as the dominant element
// in any composite they're part of.
const SEG_W = 1.0;
const SEG_H = 0.84;
const SEG_T = 0.2;
const COLOR = 0xffd54e;
const EMISSIVE = 0xff9800;
const MAT_OPTS = {
  emissive: EMISSIVE,
  emissiveIntensity: 0.55,
  metalness: 0.3,
  roughness: 0.35,
};

const SEGMENTS = {
  A: { pos: [0,     1.1, 0], orient: "h" },
  B: { pos: [0.56,  0.56, 0], orient: "v" },
  C: { pos: [0.56, -0.56, 0], orient: "v" },
  D: { pos: [0,    -1.1, 0], orient: "h" },
  E: { pos: [-0.56, -0.56, 0], orient: "v" },
  F: { pos: [-0.56,  0.56, 0], orient: "v" },
  G: { pos: [0,     0,    0], orient: "h" },
};

const DIGIT_SEGMENTS = {
  6: ["A", "F", "G", "E", "C", "D"],
  7: ["A", "B", "C"],
};

function makeSegment(orient) {
  const w = orient === "h" ? SEG_W : SEG_T;
  const h = orient === "h" ? SEG_T : SEG_H;
  return box(w, h, SEG_T, COLOR, MAT_OPTS);
}

function makeDigit(d) {
  const g = new THREE.Group();
  for (const segName of DIGIT_SEGMENTS[d]) {
    const def = SEGMENTS[segName];
    const seg = makeSegment(def.orient);
    seg.position.set(def.pos[0], def.pos[1], def.pos[2]);
    g.add(seg);
  }
  return g;
}

export const builders = {
  "6": () => makeDigit(6),
  "7": () => makeDigit(7),
};
