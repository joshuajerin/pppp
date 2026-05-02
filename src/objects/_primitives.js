// Shared primitives + material cache for every procedural builder.
//
// Materials are memoized by visual signature (color + roughness/metalness/
// emissive/flat) so 100+ builders that all use the same red sphere material
// don't allocate 100+ identical MeshStandardMaterials on the GPU.
import * as THREE from "https://esm.sh/three@0.160.0";

const matCache = new Map();

export function mat(color, opts = {}) {
  const key = `${color}-${opts.roughness ?? ""}-${opts.metalness ?? ""}-${opts.flat ?? ""}-${opts.emissive ?? ""}-${opts.emissiveIntensity ?? ""}`;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.45,
    metalness: opts.metalness ?? 0.05,
    flatShading: opts.flat ?? false,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
  matCache.set(key, m);
  return m;
}

export function mesh(geom, color, opts) {
  const m = new THREE.Mesh(geom, mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function group(...children) {
  const g = new THREE.Group();
  for (const c of children) g.add(c);
  return g;
}

export function v(x, y, z) { return new THREE.Vector3(x, y, z); }

// Higher poly defaults — silhouettes stay smooth as objects rotate close to
// the camera. The bump from 32→40 segments costs almost nothing and looks
// noticeably cleaner under the rim lighting.
export function sphere(r, c, opts) {
  return mesh(new THREE.SphereGeometry(r, 40, 28), c, opts);
}

export function box(w, h, d, c, opts) {
  return mesh(new THREE.BoxGeometry(w, h, d), c, opts);
}

export function cyl(rt, rb, h, c, opts, segs = 32) {
  return mesh(new THREE.CylinderGeometry(rt, rb, h, segs), c, opts);
}

export function cone(r, h, c, opts, segs = 32) {
  return mesh(new THREE.ConeGeometry(r, h, segs), c, opts);
}

export function torus(r, t, c, opts) {
  return mesh(new THREE.TorusGeometry(r, t, 24, 48), c, opts);
}

export function tube(curve, r, c, opts) {
  return mesh(new THREE.TubeGeometry(curve, 48, r, 16, false), c, opts);
}

// Re-export THREE for builders that need direct access to specialized
// geometry types (Shape, ExtrudeGeometry, LatheGeometry, etc.).
export { THREE };
