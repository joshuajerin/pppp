import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";
import * as THREE from "https://esm.sh/three@0.160.0";
import { OBJECTS } from "./objects3d.js";
import { startLofi, setLofiMuted } from "./lofi.js";

// ---------- DOM ----------
const video = document.getElementById("video");
const overlay2d = document.getElementById("overlay");        // hand skeleton + charge rings
const overlay3d = document.getElementById("overlay3d");      // Three.js
const ctx = overlay2d.getContext("2d");
const grid = document.getElementById("grid");
const leftSlot = document.getElementById("leftSlot");
const rightSlot = document.getElementById("rightSlot");
const mergeText = document.getElementById("mergeText");
const subtitle = document.getElementById("subtitle");
const statusEl = document.getElementById("status");
const roundBadge = document.getElementById("roundBadge");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const muteBtn = document.getElementById("muteBtn");
const permissionEl = document.getElementById("permission");

// ---------- Constants ----------
const MERGE_DIST = 0.18;          // normalized hand distance to trigger merge
const FIST_HOLD_MS = 1000;        // fist-hold duration to grab a parked composite
const GRAB_RADIUS_NORM = 0.18;    // hand-to-park-slot proximity required to charge
const HELD_SCALE = 0.4;           // world-units scale of a single held object
const PARK_SCALE = 0.32;          // smaller in the background
const HELD_SPIN = 0.6;            // rad/s when held
const PARK_SPIN = 0.4;            // rad/s when parked

// Six parking slots arranged across the upper third (normalized [0,1]).
const PARK_SLOTS = [
  { x: 0.12, y: 0.18 }, { x: 0.28, y: 0.14 }, { x: 0.44, y: 0.18 },
  { x: 0.6,  y: 0.14 }, { x: 0.76, y: 0.18 }, { x: 0.88, y: 0.14 },
];

// ---------- State ----------
const state = {
  // held[side] is either:
  //   { kind: "single", obj, group } — a single picked object
  //   { kind: "composite", items, group } — a previously merged composite
  // or null.
  held: { Left: null, Right: null },
  lastSpoken: { Left: null, Right: null },
  handPos: { Left: null, Right: null },
  // Per-hand fist-charge state: { parkedRef, startedAt } or null.
  charging: { Left: null, Right: null },
  // Active animations.
  tweens: [],
  snapAnim: null,                            // { items, fromL, fromR, to, start, dur }
  // Parked composites in the background.
  parked: [],                                // [{ items, group, slotIdx, baseY, bobOffset }]
  muted: false,
  // World view dimensions (set after camera setup).
  viewW: 4, viewH: 2,
};

// ---------- Three.js scene ----------
const renderer = new THREE.WebGLRenderer({ canvas: overlay3d, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();

// Lighting: hemisphere for natural sky/ground fill, a key + warm fill for
// shape readability, and two colored point rims that match the brand palette
// so every object picks up a magenta + cyan edge.
scene.add(new THREE.HemisphereLight(0xc7d8ff, 0x303040, 0.65));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(2, 5, 4);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffe0b2, 0.35);
fillLight.position.set(-3, 1, 3);
scene.add(fillLight);
const rimPink = new THREE.PointLight(0xff3e88, 1.4, 7);
rimPink.position.set(2.5, -1, -1.5);
scene.add(rimPink);
const rimCyan = new THREE.PointLight(0x4ee3ff, 1.4, 7);
rimCyan.position.set(-2.5, -1, -1.5);
scene.add(rimCyan);

// Orthographic so positions in world space map cleanly to normalized hand coords.
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position.z = 5;

function resizeRenderer() {
  const w = overlay3d.clientWidth;
  const h = overlay3d.clientHeight;
  renderer.setSize(w, h, false);
  // World view: y in [-1, 1] (height = 2). x scales to canvas aspect.
  const aspect = w / h;
  camera.left = -aspect;
  camera.right = aspect;
  camera.top = 1;
  camera.bottom = -1;
  camera.updateProjectionMatrix();
  state.viewW = aspect * 2;
  state.viewH = 2;
}
window.addEventListener("resize", resizeRenderer);

// Map normalized hand position (mirrored horizontally to match the displayed
// video) to world-space coords on the z=0 plane.
function handToWorld(handPos, z = 0) {
  return new THREE.Vector3(
    (0.5 - handPos.x) * state.viewW,
    (0.5 - handPos.y) * state.viewH,
    z
  );
}

// ---------- Icon rendering for the grid ----------
// Render each builder once into a small canvas → data URL → grid card icon.
const iconRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
iconRenderer.setPixelRatio(2);
iconRenderer.setSize(96, 96, false);
iconRenderer.outputColorSpace = THREE.SRGBColorSpace;
iconRenderer.toneMapping = THREE.ACESFilmicToneMapping;
iconRenderer.toneMappingExposure = 1.05;
const iconScene = new THREE.Scene();
iconScene.add(new THREE.HemisphereLight(0xc7d8ff, 0x303040, 0.65));
const iconKey = new THREE.DirectionalLight(0xffffff, 1.4);
iconKey.position.set(2, 4, 4);
iconScene.add(iconKey);
const iconFill = new THREE.DirectionalLight(0xffe0b2, 0.4);
iconFill.position.set(-2, 1, 2);
iconScene.add(iconFill);
const iconRimPink = new THREE.PointLight(0xff3e88, 1.0, 5);
iconRimPink.position.set(2, -1, -1);
iconScene.add(iconRimPink);
const iconRimCyan = new THREE.PointLight(0x4ee3ff, 1.0, 5);
iconRimCyan.position.set(-2, -1, -1);
iconScene.add(iconRimCyan);
const iconCam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
iconCam.position.z = 2.5;
iconCam.lookAt(0, 0, 0);

function buildIconDataUrl(build) {
  const obj = build();
  obj.rotation.x = -0.25;
  obj.rotation.y = 0.5;
  iconScene.add(obj);
  iconRenderer.render(iconScene, iconCam);
  const url = iconRenderer.domElement.toDataURL();
  iconScene.remove(obj);
  return url;
}

// ---------- Object grid ----------
function renderGrid() {
  grid.innerHTML = "";
  for (const obj of OBJECTS) {
    const card = document.createElement("div");
    card.className = "obj-card";
    card.dataset.name = obj.name;
    const img = document.createElement("img");
    img.src = buildIconDataUrl(obj.build);
    img.alt = obj.name;
    const label = document.createElement("div");
    label.className = "name";
    label.textContent = obj.name;
    card.appendChild(img);
    card.appendChild(label);
    card.addEventListener("click", () => onPick(obj, card));
    grid.appendChild(card);
  }
}

function onPick(obj, card) {
  // Pick-and-go: one click → attach to first empty hand. No batching, no
  // forcing two picks before anything happens.
  if (state.held.Left && state.held.Right) return;
  const side = state.held.Left ? "Right" : "Left";
  attachToHand(side, obj);
  // Brief flash on the card so the user knows it landed.
  card.classList.add("picked");
  setTimeout(() => card.classList.remove("picked"), 280);
}

function singleLabel(held) {
  if (held.kind === "single") return held.obj.name;
  return held.items.map((i) => i.name).join(" ");
}

function attachToHand(side, obj) {
  // Replace anything already in that hand cleanly.
  if (state.held[side]) {
    scene.remove(state.held[side].group);
    disposeGroup(state.held[side].group);
  }
  const group = obj.build();
  group.scale.setScalar(HELD_SCALE);
  scene.add(group);
  state.held[side] = { kind: "single", obj, group, label: obj.name };
  // Reset speak-state so the announcer fires once when the hand appears,
  // not twice (we do NOT speak here — maybeAnnounce handles that).
  state.lastSpoken[side] = null;
  updateHeldUI();
  refreshLiveLabel();
}

function updateHeldUI() {
  for (const [side, slotEl] of [
    ["Left", leftSlot],
    ["Right", rightSlot],
  ]) {
    const held = state.held[side];
    const nameEl = slotEl.querySelector(".held-name");
    let imgEl = slotEl.querySelector("img");
    if (held) {
      const label = singleLabel(held);
      if (!imgEl) {
        imgEl = document.createElement("img");
        slotEl.insertBefore(imgEl, nameEl);
      }
      // Re-render an icon for the held thing (single or composite).
      imgEl.src = buildHeldIcon(held);
      nameEl.textContent = label;
    } else {
      if (imgEl) imgEl.remove();
      nameEl.textContent = "empty";
    }
  }
}

function buildHeldIcon(held) {
  const obj = new THREE.Group();
  if (held.kind === "single") {
    const m = held.obj.build();
    obj.add(m);
  } else {
    const items = held.items;
    const stride = 0.7;
    const startX = -((items.length - 1) * stride) / 2;
    for (let i = 0; i < items.length; i++) {
      const m = items[i].build();
      m.position.x = startX + i * stride;
      obj.add(m);
    }
    const fit = Math.min(1, 1.6 / Math.max(1, items.length));
    obj.scale.setScalar(fit);
  }
  obj.rotation.x = -0.25;
  obj.rotation.y = 0.5;
  iconScene.add(obj);
  iconRenderer.render(iconScene, iconCam);
  const url = iconRenderer.domElement.toDataURL();
  iconScene.remove(obj);
  return url;
}

// ---------- TTS ----------
function speak(text, opts = {}) {
  if (state.muted) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts.rate ?? 1.05;
  u.pitch = opts.pitch ?? 1.0;
  u.volume = 1.0;
  if (opts.interrupt !== false) speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ---------- Camera + hands ----------
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720, facingMode: "user" },
    audio: false,
  });
  video.srcObject = stream;
  await new Promise((res) => (video.onloadedmetadata = res));
  await video.play();
  overlay2d.width = video.videoWidth;
  overlay2d.height = video.videoHeight;
  resizeRenderer();
}

let handLandmarker = null;
async function initHands() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

// Mirror handedness: video is flipped, so MediaPipe's "Left" is the user's right
// hand visually. Swap so state.held.Left tracks the user's intuitive left hand.
function swapHandedness(raw) { return raw === "Left" ? "Right" : "Left"; }

// Fist detection: 4 fingers (excluding thumb) curled means fist.
function isFist(landmarks) {
  const wrist = landmarks[0];
  const tipIdx = [8, 12, 16, 20];
  const mcpIdx = [5, 9, 13, 17];
  let curled = 0;
  for (let i = 0; i < 4; i++) {
    const tip = landmarks[tipIdx[i]];
    const mcp = landmarks[mcpIdx[i]];
    const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    const mcpDist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
    if (tipDist < mcpDist * 1.1) curled++;
  }
  return curled >= 3;
}

// ---------- Frame loop ----------
let lastVideoTime = -1;
function loop() {
  const now = performance.now();
  if (video.readyState >= 2 && handLandmarker) {
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const results = handLandmarker.detectForVideo(video, now);
      processHands(results);
    }
  }
  updateAnims(now);
  updateScene(now);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

// Stash per-frame fist state so we can charge timers.
const frameFist = { Left: false, Right: false };

function processHands(results) {
  ctx.clearRect(0, 0, overlay2d.width, overlay2d.height);
  state.handPos.Left = null;
  state.handPos.Right = null;
  frameFist.Left = false;
  frameFist.Right = false;

  if (results.landmarks && results.landmarks.length) {
    for (let i = 0; i < results.landmarks.length; i++) {
      const lm = results.landmarks[i];
      const raw = results.handednesses[i]?.[0]?.categoryName || "Left";
      const side = swapHandedness(raw);
      state.handPos[side] = { x: lm[9].x, y: lm[9].y };
      frameFist[side] = isFist(lm);
      drawHandSkeleton(lm, side);
    }
  }
  updateCharge();
  checkMerge();
  maybeAnnounce();
}

function drawHandSkeleton(landmarks, side) {
  // Note: 2D canvas is NOT mirrored via CSS, so we mirror x manually here.
  const W = overlay2d.width, H = overlay2d.height;
  ctx.strokeStyle = side === "Left" ? "#ff3e88" : "#4ee3ff";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.4;
  const fingers = [
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [0, 9, 10, 11, 12],
    [0, 13, 14, 15, 16],
    [0, 17, 18, 19, 20],
  ];
  for (const f of fingers) {
    ctx.beginPath();
    for (let i = 0; i < f.length; i++) {
      const p = landmarks[f[i]];
      const x = (1 - p.x) * W;
      const y = p.y * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// Draw a charge ring around a fist while it's grabbing a parked composite.
function drawChargeRing(side, progress) {
  const pos = state.handPos[side];
  if (!pos) return;
  const W = overlay2d.width, H = overlay2d.height;
  const x = (1 - pos.x) * W;
  const y = pos.y * H;
  const r = Math.min(W, H) * 0.12;
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255, 216, 78, 0.25)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#ffd84e";
  ctx.shadowColor = "#ffd84e";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ---------- Charge / fist-grab ----------
function updateCharge() {
  for (const side of ["Left", "Right"]) {
    const pos = state.handPos[side];
    const fist = frameFist[side];
    const held = state.held[side];

    // Cancel charge if hand vanishes, opens, or already holding something.
    if (!pos || !fist || held) {
      state.charging[side] = null;
      continue;
    }

    // Find the closest parked composite to this fist.
    let nearest = null;
    let nearestDist = Infinity;
    for (const p of state.parked) {
      const slot = PARK_SLOTS[p.slotIdx];
      const d = Math.hypot(slot.x - pos.x, slot.y - pos.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = p;
      }
    }

    if (!nearest || nearestDist > GRAB_RADIUS_NORM) {
      state.charging[side] = null;
      continue;
    }

    // Continue or start the charge.
    if (state.charging[side]?.parkedRef !== nearest) {
      state.charging[side] = { parkedRef: nearest, startedAt: performance.now() };
    }
    const elapsed = performance.now() - state.charging[side].startedAt;
    const progress = Math.min(1, elapsed / FIST_HOLD_MS);
    drawChargeRing(side, progress);
    if (progress >= 1) {
      grabParked(side, nearest);
      state.charging[side] = null;
    }
  }
}

function grabParked(side, parked) {
  state.parked = state.parked.filter((p) => p !== parked);
  // Promote into a held composite. Reuse the parked group as the held group.
  parked.group.scale.setScalar(HELD_SCALE);
  if (state.held[side]) {
    scene.remove(state.held[side].group);
    disposeGroup(state.held[side].group);
  }
  state.held[side] = {
    kind: "composite",
    items: parked.items,
    group: parked.group,
    label: parked.items.map((i) => i.name).join(" "),
  };
  state.lastSpoken[side] = null;       // let maybeAnnounce say it once
  updateHeldUI();
  refreshLiveLabel();
}

// ---------- Merge ----------
function checkMerge() {
  if (state.snapAnim) return;
  const L = state.handPos.Left;
  const R = state.handPos.Right;
  const hL = state.held.Left;
  const hR = state.held.Right;
  if (!L || !R || !hL || !hR) return;
  const d = Math.hypot(L.x - R.x, L.y - R.y);
  if (d < MERGE_DIST) startSnap();
}

function startSnap() {
  const L = state.handPos.Left;
  const R = state.handPos.Right;
  const mid = { x: (L.x + R.x) / 2, y: (L.y + R.y) / 2 };
  state.snapAnim = {
    start: performance.now(),
    dur: 380,
    fromL: { ...L },
    fromR: { ...R },
    to: mid,
    leftHeld: state.held.Left,
    rightHeld: state.held.Right,
  };
  // Wipe so the per-frame held update stops moving them with the hands.
  state.held.Left = null;
  state.held.Right = null;
  state.lastSpoken.Left = null;
  state.lastSpoken.Right = null;
  updateHeldUI();
  // Don't refreshLiveLabel here — finishSnap will pulse with the merged label.
}

function flattenHeldItems(held) {
  return held.kind === "single" ? [held.obj] : held.items;
}

function finishSnap() {
  const a = state.snapAnim;
  state.snapAnim = null;

  // Combine the two held things into a single composite, ordered L then R.
  const items = [...flattenHeldItems(a.leftHeld), ...flattenHeldItems(a.rightHeld)];
  // Tear down the original groups; we'll rebuild a clean composite group.
  scene.remove(a.leftHeld.group);
  scene.remove(a.rightHeld.group);
  disposeGroup(a.leftHeld.group);
  disposeGroup(a.rightHeld.group);

  const compositeGroup = buildCompositeGroup(items);
  compositeGroup.scale.setScalar(HELD_SCALE);
  // Place at the midpoint where the snap finished.
  const start = handToWorld(a.to, 0);
  compositeGroup.position.copy(start);
  scene.add(compositeGroup);

  const label = items.map((i) => i.name).join(" ");
  pulseLabel(label);
  speak(label, { rate: 0.95, pitch: 1.1 });

  // Park it: pick the first free slot and tween it into place.
  const slotIdx = pickFreeParkingSlot();
  const target = PARK_SLOTS[slotIdx] ?? { x: 0.5, y: 0.18 };
  const parkPos = handToWorld(target, -0.5);
  const parked = {
    items,
    group: compositeGroup,
    slotIdx,
    bobOffset: Math.random() * Math.PI * 2,
  };
  state.parked.push(parked);
  bumpRound();
  tweenScale(compositeGroup, PARK_SCALE, 700);
  tweenPosition(compositeGroup, parkPos, 700, () => {
    // After the merge celebration ends, drop back to the live label (now
    // empty since both hands cleared at startSnap).
    setTimeout(refreshLiveLabel, 600);
  });
}

function pickFreeParkingSlot() {
  const used = new Set(state.parked.map((p) => p.slotIdx));
  for (let i = 0; i < PARK_SLOTS.length; i++) if (!used.has(i)) return i;
  // Recycle: replace the oldest parked item if we've run out of slots.
  const old = state.parked.shift();
  if (old) {
    scene.remove(old.group);
    disposeGroup(old.group);
    return old.slotIdx;
  }
  return 0;
}

// Build a horizontal composite by stacking item builder results side-by-side.
function buildCompositeGroup(items) {
  const g = new THREE.Group();
  const stride = 1.0;
  const startX = -((items.length - 1) * stride) / 2;
  for (let i = 0; i < items.length; i++) {
    const m = items[i].build();
    m.position.x = startX + i * stride;
    g.add(m);
  }
  // Slight squash so longer chains don't blow off-screen even after the
  // group's outer scale is applied.
  const fit = Math.min(1, 2.0 / Math.max(1, items.length));
  g.scale.setScalar(fit);
  return g;
}

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      // Materials are cached + shared in objects3d; don't dispose them here.
    }
  });
}

// ---------- Per-frame scene update ----------
function updateScene(now) {
  // Held: snap each held group to its hand position, with auto-rotate.
  for (const side of ["Left", "Right"]) {
    const held = state.held[side];
    const pos = state.handPos[side];
    if (!held || !pos) continue;
    const target = handToWorld(pos, 0);
    held.group.position.lerp(target, 0.4);
    held.group.rotation.y += HELD_SPIN / 60;
    held.group.rotation.x = -0.15;
  }

  // Snap animation: lerp both held groups to midpoint with a punchy ease.
  if (state.snapAnim) {
    const a = state.snapAnim;
    const t = Math.min(1, (now - a.start) / a.dur);
    const e = 1 - Math.pow(1 - t, 3);
    const targetL = handToWorld(a.to, 0);
    targetL.x -= 0.35;
    const targetR = handToWorld(a.to, 0);
    targetR.x += 0.35;
    const fromL = handToWorld(a.fromL, 0);
    const fromR = handToWorld(a.fromR, 0);
    a.leftHeld.group.position.lerpVectors(fromL, targetL, e);
    a.rightHeld.group.position.lerpVectors(fromR, targetR, e);
    const grow = 1 + 0.1 * Math.sin(e * Math.PI);
    a.leftHeld.group.scale.setScalar(HELD_SCALE * grow);
    a.rightHeld.group.scale.setScalar(HELD_SCALE * grow);
    a.leftHeld.group.rotation.y += HELD_SPIN * 2 / 60;
    a.rightHeld.group.rotation.y += HELD_SPIN * 2 / 60;
    if (t >= 1) finishSnap();
  }

  // Parked: keep at slot, slow rotate, gentle vertical bob.
  for (const p of state.parked) {
    const slot = PARK_SLOTS[p.slotIdx];
    const target = handToWorld(slot, -0.5);
    target.y += Math.sin(now / 800 + p.bobOffset) * 0.04;
    p.group.position.lerp(target, 0.08);
    p.group.rotation.y += PARK_SPIN / 60;
    p.group.rotation.x = -0.1;
  }
}

// ---------- Tween helpers ----------
function tweenPosition(group, toVec, dur, onDone) {
  state.tweens.push({
    type: "pos",
    group,
    from: group.position.clone(),
    to: toVec.clone(),
    start: performance.now(),
    dur,
    onDone,
  });
}

function tweenScale(group, toScalar, dur, onDone) {
  state.tweens.push({
    type: "scale",
    group,
    from: group.scale.x,
    to: toScalar,
    start: performance.now(),
    dur,
    onDone,
  });
}

function updateAnims(now) {
  for (let i = state.tweens.length - 1; i >= 0; i--) {
    const t = state.tweens[i];
    const p = Math.min(1, (now - t.start) / t.dur);
    const e = 1 - Math.pow(1 - p, 3);
    if (t.type === "pos") {
      t.group.position.lerpVectors(t.from, t.to, e);
    } else if (t.type === "scale") {
      t.group.scale.setScalar(t.from + (t.to - t.from) * e);
    }
    if (p >= 1) {
      state.tweens.splice(i, 1);
      t.onDone?.();
    }
  }
}

// ---------- Announce held items (one-shot per attach) ----------
function maybeAnnounce() {
  for (const side of ["Left", "Right"]) {
    const held = state.held[side];
    const pos = state.handPos[side];
    if (!held || !pos) {
      if (!pos) state.lastSpoken[side] = null;
      continue;
    }
    const label = held.label;
    if (state.lastSpoken[side] !== label) {
      speak(label, { interrupt: false });
      state.lastSpoken[side] = label;
    }
  }
}

// ---------- HUD text ----------
// Live label: shows what the user currently has in their hands. Updates the
// moment something is picked, grabbed, or cleared. The merge moment briefly
// hijacks it with a punchy pulse animation.
function refreshLiveLabel() {
  const parts = [];
  if (state.held.Left)  parts.push(state.held.Left.label);
  if (state.held.Right) parts.push(state.held.Right.label);
  const text = parts.join(" ");
  if (text) {
    mergeText.textContent = text;
    mergeText.classList.remove("pulse");
    mergeText.classList.add("show");
  } else {
    mergeText.classList.remove("show");
  }
}

function pulseLabel(text) {
  mergeText.textContent = text;
  mergeText.classList.add("show");
  mergeText.classList.remove("pulse");
  // Force reflow so the animation re-triggers cleanly.
  void mergeText.offsetWidth;
  mergeText.classList.add("pulse");
}

function showSubtitle(text) { subtitle.textContent = text; subtitle.classList.add("show"); }

function bumpRound() {
  const merges = state.parked.length + (state.held.Left?.kind === "composite" ? 1 : 0) + (state.held.Right?.kind === "composite" ? 1 : 0);
  const size = Math.pow(2, Math.max(0, merges));
  roundBadge.textContent = `MERGES ${merges} — ${size} OBJ`;
}

function fullReset() {
  for (const side of ["Left", "Right"]) {
    if (state.held[side]) {
      scene.remove(state.held[side].group);
      disposeGroup(state.held[side].group);
    }
    state.held[side] = null;
    state.lastSpoken[side] = null;
    state.charging[side] = null;
  }
  for (const p of state.parked) {
    scene.remove(p.group);
    disposeGroup(p.group);
  }
  state.parked = [];
  state.snapAnim = null;
  state.tweens = [];
  updateHeldUI();
  refreshLiveLabel();
  subtitle.classList.remove("show");
  roundBadge.textContent = "MERGES 0 — 1 OBJ";
}

// ---------- Boot ----------
renderGrid();

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  startBtn.textContent = "loading…";
  try {
    statusEl.textContent = "requesting camera…";
    await startCamera();
    statusEl.textContent = "loading hand model…";
    await initHands();
    statusEl.textContent = "warming up the lofi…";
    startLofi().catch((e) => console.warn("lofi failed:", e));
    statusEl.textContent = "ready · pick 2 · merge · fist over a parked combo to grab it back";
    permissionEl.classList.add("hidden");
    requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    statusEl.textContent = `error: ${err.message}`;
    startBtn.disabled = false;
    startBtn.textContent = "RETRY";
  }
});

resetBtn.addEventListener("click", fullReset);

muteBtn.addEventListener("click", () => {
  state.muted = !state.muted;
  muteBtn.textContent = state.muted ? "🔇" : "🔊";
  if (state.muted) speechSynthesis.cancel();
  setLofiMuted(state.muted);
});
