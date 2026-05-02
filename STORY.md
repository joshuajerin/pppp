# pppp

## Inspiration

In 2016, a 53-year-old Japanese comedian uploaded a 45-second video of himself
in a leopard-print outfit chanting **"I have a pen. I have an apple. Apple-pen!"**
PPAP became one of the most-watched videos in YouTube history.

We wanted to take that joke and weaponize it with computer vision. The bit only
works if the gestures feel real — the pen and apple have to *physically* fuse in
your hands, not just text on a screen. That's the whole project: take the
stupidest possible premise and execute it like it deserved a real engineering
budget.

## What we learned

**Hand-tracking coordinate spaces are full of traps.** MediaPipe gives
landmarks in normalized $(x, y) \in [0, 1]$ coordinates assuming the camera
input is *not* mirrored. Browsers display front-facing cameras mirrored. So a
landmark MediaPipe labels `Left` is actually the user's right hand, and we had
to swap the labels and remap

$$
x_{\text{world}} = \left(0.5 - x_{\text{landmark}}\right) \cdot W_{\text{view}}
$$

so that what the user thinks of as their "left hand" controls the left slot.

**Procedural everything beats asset pipelines for hackathons.** We tried
Twemoji SVGs, Microsoft Fluent 3D PNGs, and free GLB models — every approach
had a different licensing or CDN-uptime caveat. Building the 100+ objects from
Three.js primitives (`SphereGeometry`, `TorusGeometry`, `TubeGeometry` along
Bezier curves, `LatheGeometry` for the vase) means zero external assets, zero
licensing risk, and the entire visual style is internally consistent.

**Procedural music dodges copyright entirely.** The original PPAP soundtrack
is 100% off-limits. So we built a Tone.js loop from scratch — 130 BPM,
four-on-the-floor kick, claps on 2 & 4, plucky square lead climbing the F minor
scale over $F_m \to E\flat \to D\flat \to C$, with a metallic "ding" on every
downbeat. It captures the PPAP energy without a single sample.

**Browser autoplay policy matters.** `Tone.start()`, `getUserMedia()`, and
`speechSynthesis.speak()` all require a user gesture to fire. We chain all
three to the START button.

## How we built it

The whole thing is a single static page — no build step, no framework, no
backend. Three layers stacked over the camera feed:

```
┌─────────────────────────────────────┐
│  2D canvas: hand skeleton, charge   │ ← z-index 3
├─────────────────────────────────────┤
│  Three.js canvas: 3D models, parks  │ ← z-index 2
├─────────────────────────────────────┤
│  <video>: mirrored camera feed      │ ← z-index 1
└─────────────────────────────────────┘
```

**The game loop:**

1. **MediaPipe HandLandmarker** runs in WASM with a GPU delegate, returning 21
   landmarks per hand at ~30 fps.
2. **Object pick** — clicking a tray card immediately attaches a `THREE.Group`
   to the user's first empty hand. Each frame, we lerp the group's world
   position toward the hand's palm landmark and slow-rotate on the Y axis.
3. **Merge detection** — when both hands hold something and the normalized
   distance falls below $d_{\text{merge}} = 0.18$, both groups animate toward
   the midpoint with an ease-out cubic snap and a connecting glow line.
4. **Parking** — the merged composite tweens to one of six normalized slots
   along the upper third of the frame, scales down to $0.32$, and slow-rotates
   in place with a sinusoidal vertical bob.
5. **Fist-grab** — fist is detected by a fingertip-curl heuristic: for fingers
   2–5, if $\|\text{tip} - \text{wrist}\| < 1.1 \cdot \|\text{MCP} - \text{wrist}\|$,
   that finger is curled. ≥3 curled = fist. Hold the fist within
   $r = 0.18$ of a parked composite for 1 second → it flies to that hand.
6. **Chain forever** — pick a fresh object in one hand, fist-grab a parked
   combo in the other, merge → bigger combo. Repeat for the full
   `pen pineapple apple pen` tree.

**Lighting & rendering** — the 3D scene uses ACES-filmic tone mapping, a
hemisphere fill, a key directional light, a warm fill, and two colored point
lights (`#ff3e88` magenta + `#4ee3ff` cyan) that give every model brand-colored
rims as it rotates.

## Challenges

- **Hand-label mirroring** — described above. Took an embarrassingly long time
  to realize MediaPipe's `Left` was the visually-right hand on a mirrored feed.
- **Fist detection that actually works** — naive "all fingertips below MCPs"
  fails at non-vertical hand angles. The wrist-relative-distance ratio is
  invariant to hand orientation and ended up reliable in practice.
- **Composite scaling** — chain `apple pen orange bottle car snake` and the
  composite tries to render six full-sized models side-by-side. Solved with
  $s = \min(1, 2 / \sqrt{n})$ scaling so the merged blob stays on-screen
  without any single object becoming unreadable.
- **Icon previews for 100+ models** — rendering a separate Three.js scene per
  card would melt the GPU. We use one shared off-screen renderer that
  add/render/remove/`toDataURL`s each builder once at boot, then sets the data
  URL as the card's `<img src>`.
- **Audio that loops without being annoying** — early versions had no swing,
  a too-busy hat pattern, and a lead that overstayed its welcome. The final
  loop is 4 bars with `Transport.swing = 0.04` for slight humanization.

## Built with

**Languages**: JavaScript (vanilla, ES modules), HTML, CSS

**Computer vision**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) (HandLandmarker, WASM + GPU delegate)

**3D rendering**: [Three.js](https://threejs.org/) — orthographic camera, ACES-filmic
tone mapping, `MeshStandardMaterial` with PBR roughness/metalness, procedural
geometry (`SphereGeometry`, `TubeGeometry`, `LatheGeometry`, `ExtrudeGeometry`,
`TorusGeometry`)

**Audio**: [Tone.js](https://tonejs.github.io/) — `MembraneSynth` (kick),
`NoiseSynth` (claps + hats), `MonoSynth` (bass), `PolySynth` (lead),
`MetalSynth` (bell), `Compressor` + `Reverb` master chain

**Voice**: Web Speech API (`SpeechSynthesisUtterance`) — browser-native TTS

**Hosting**: Vercel (static deployment from GitHub)

**Tooling**: Python `http.server` for local dev, jsDelivr / esm.sh for ESM CDN
delivery — no bundler, no `node_modules`

---

**Live demo**: https://pppp-six-dun.vercel.app

**Repository**: https://github.com/joshuajerin/pppp
