# Architecture

`pppp` is a single-page, fully-client-side web app. No backend. No build step.
No framework. Browser ESM resolves everything from local files and a couple of
public CDNs.

## Stack at a glance

| Layer            | Tech                                          |
| ---------------- | --------------------------------------------- |
| Hand tracking    | MediaPipe Tasks Vision (WASM, GPU delegate)   |
| 3D rendering     | Three.js (procedural geometry, PBR materials) |
| Audio            | Tone.js (Web Audio synthesis)                 |
| Voice            | Web Speech API (`SpeechSynthesisUtterance`)   |
| Camera           | MediaDevices `getUserMedia`                   |
| Hosting          | Vercel (static, edge-cached)                  |

## Render layer stack (top → bottom)

```
┌─────────────────────────────────────────┐
│  HUD DOM (chip badges, live label)      │  z-index 10–20
├─────────────────────────────────────────┤
│  2D canvas    (hand bones, charge ring) │  z-index 3
├─────────────────────────────────────────┤
│  Three.js     (3D held + parked + snap) │  z-index 2
├─────────────────────────────────────────┤
│  <video>      (mirrored camera feed)    │  z-index 1
└─────────────────────────────────────────┘
```

The `<video>` is CSS-mirrored. The two overlay canvases are not — they mirror
in JS by computing `(1 - x)` where appropriate, so geometry drawn on them
isn't reversed by the CSS flip below.

## Data flow per frame

```
                   ┌──────────────┐
                   │ <video> tag  │ camera frame
                   └──────┬───────┘
                          ▼
            ┌──────────────────────────┐
            │ MediaPipe HandLandmarker │  21 landmarks × ≤2 hands
            └──────┬───────────────────┘
                   ▼
       ┌──────────────────────┐
       │ swapHandedness +     │  remap "Left"/"Right" to user-intuitive sides
       │ project landmark[9]  │  → state.handPos[side] = { x, y }
       │ + isFist heuristic   │  → frameFist[side]
       └─┬───────────┬────────┘
         │           │
         ▼           ▼
   ┌────────┐   ┌──────────────┐
   │skeleton│   │ updateCharge │  fist-over-parked → ring → grabParked
   │overlay │   └──────────────┘
   └────────┘         │
                      ▼
              ┌────────────────┐
              │ checkMerge     │  hands close + both held → startSnap
              └─┬──────────────┘
                ▼
          ┌──────────────┐
          │ updateScene  │  lerp held to hand pos, advance snap anim,
          └─┬────────────┘   bob parked composites
            ▼
      ┌────────────────────────────────┐
      │ renderer.render(scene, camera) │
      └────────────────────────────────┘
```

## File map

| Path                          | Responsibility                                         |
| ----------------------------- | ------------------------------------------------------ |
| `index.html`                  | Markup + script entry. Loads ESM `app.js`.             |
| `app.js`                      | Game logic: scene, hands, picker, merge, parking, grab |
| `lofi.js`                     | Procedural Tone.js beat (drums, bass, lead, bell)      |
| `style.css`                   | Glassmorphism UI, centered live label                  |
| `objects3d.js`                | Thin re-export from `src/objects/index.js`             |
| `src/objects/_primitives.js`  | Shared mat/mesh/sphere/cyl/etc. helpers + cache        |
| `src/objects/index.js`        | Combines all category builders into the `OBJECTS` array |
| `src/objects/{category}.js`   | One file per category — fruit, food, tools, etc.       |
| `src/objects/numbers.js`      | 7-segment LED-style digits (6 and 7)                   |
| `docs/`                       | Architecture, coordinate spaces, audio notes           |

The catalog is split across 16 category files (`fruits.js`, `veggies.js`,
`food.js`, `drinks.js`, `shapes.js`, `characters.js`, `vehicles.js`,
`space.js`, `nature.js`, `tools.js`, `weapons.js`, `sports.js`,
`tableware.js`, `tech.js`, `misc.js`, `numbers.js`). Each exports a
`builders` object keyed by name; `index.js` flattens them into a single
ordered array consumed by the picker.

## Key invariants

- **State is centralized.** All mutable game state lives in a single `state`
  object inside `app.js`. No reducers — this is real-time camera code, locality
  of mutation matters.
- **Materials are cached and shared.** `objects/_primitives.js#mat()`
  memoizes by color + roughness/metalness/flat/emissive. Disposal of a group
  only releases geometries — materials stay alive for reuse.
- **Coordinates have one source of truth.** `handToWorld` in `app.js` is the
  only place normalized hand positions are projected to Three.js world space.

## See also

- [`COORDINATES.md`](./COORDINATES.md) — the four coordinate spaces and how
  they relate.
- [`AUDIO.md`](./AUDIO.md) — beat structure, synth chain, and pattern grids.
