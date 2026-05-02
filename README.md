# pppp

Pen Pineapple Apple Pen — but with computer vision. Pick objects from the tray,
raise your hands, watch them snap together as fully-3D models, park merged
combos in the background, then fist-grab them back to chain bigger combos. All
to a procedural PPAP-style beat.

Local. No API keys. No build step. Runs in the browser.

## Running

```bash
cd pppp
python3 -m http.server 8000
# or:  npx serve .
```

Open `http://localhost:8000`, click **START**, allow camera access.

> Localhost (or HTTPS) is required for camera + Web Speech.

## How to play

1. **Click an object** in the tray → it attaches to your first empty hand and
   appears as a 3D model floating over your palm.
2. **Click another** → it goes to the other hand.
3. **Bring your hands together** → both models snap toward each other, fuse,
   and fly to a parking slot in the upper third of the frame.
4. **Make a fist** over a parked combo for ~1 second → it flies back to that
   hand. A yellow ring fills around your fist while it charges.
5. **Mix and match** — pick a fresh object in one hand, fist-grab a combo in
   the other, bring them together → bigger combo. Repeat indefinitely.

The centered white text always reflects what's currently in your hands.

## Stack

- **[MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)** — local WASM hand-tracking with GPU delegate.
- **[Three.js](https://threejs.org/)** — 100+ procedural low-poly 3D models with
  ACES-filmic tone mapping, hemisphere fill, and brand-colored rim lights.
- **[Tone.js](https://tonejs.github.io/)** — procedural 130 BPM PPAP-style beat
  (four-on-the-floor kick, claps on 2 & 4, plucky square lead over Fm → E♭ → D♭ → C,
  bell ding on the downbeat).
- **Web Speech API** — browser-native TTS announcer.
- Vanilla HTML / CSS / JS, single-page, no framework.

## Files

| File | What |
|---|---|
| `index.html` | Markup: stage (video + 2D + 3D canvases), tray, permission gate. |
| `style.css` | Glassmorphism UI — frosted chips, hairline borders, centered live label. |
| `app.js` | Camera, MediaPipe loop, Three.js scene, pick/snap/park/fist-grab logic. |
| `objects3d.js` | 100+ procedural builders. Each returns a `THREE.Group`. |
| `lofi.js` | Procedural Tone.js beat. Boots after the user gesture (autoplay-policy). |

## Tweaking

- `MERGE_DIST` (`app.js`) — how close hands must be to trigger a merge (normalized).
- `FIST_HOLD_MS` (`app.js`) — fist-charge duration to grab a parked combo.
- `HELD_SCALE` / `PARK_SCALE` — held-object vs parked-object world size.
- `PARK_SLOTS` — array of normalized x/y positions for the background parking row.

## Credits

Hackathon vibe from [PPAP by Pikotaro](https://www.youtube.com/watch?v=Ct6BUPvE2sM).
Beat is procedural — no copyrighted samples.
