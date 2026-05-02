## Inspiration

In 2016 a 53-year-old man in a leopard-print outfit went on YouTube and said
**"I have a pen. I have an apple. Apple-pen."** It got a billion views. I woke
up one day and decided this needed computer vision. Nobody asked me to do this.
I did it anyway.

The whole bit only lands if the pen and apple actually *fuse* in your hands —
not as text, not as an emoji, but as real 3D objects that snap together like
they're magnetic. So that's what I built. Stupid premise, real engineering.

## What it does

You open the page. There's 102 little 3D objects in a tray at the bottom. You
click one — it materializes in your hand on camera as a fully-3D rotating
model. Click another — it shows up in the other hand. Bring your hands
together: **they fuse** with a punchy snap animation, the combined name flashes
center-screen in big white letters ("apple pen"), and the merged combo flies
into the background like it has somewhere to be.

Want it back? Make a fist where it's parked. A yellow ring fills around your
fist for a second. *Boom* — it flies into whichever hand you fisted with. Now
pick a fresh object in the other hand, smash them together, and you've got
"apple pen pineapple". Keep going forever. The whole time there's a 130 BPM
PPAP-coded beat looping in the background that I wrote from scratch because
I am not getting copyright-struck on a hackathon submission.

It's stupid. It is also unreasonably satisfying.

## How we built it

Single static webpage. No backend. No build step. No framework. I am not
*that* serious.

- **Hand tracking**: MediaPipe Tasks Vision running in WASM with a GPU
  delegate. 21 landmarks per hand at 30fps, fully local, your face never
  touches a server.
- **3D objects**: 102 procedural builders in Three.js. Every apple, pen,
  rocket, robot, and figure-8 pretzel is made out of `SphereGeometry`,
  `TubeGeometry`, `LatheGeometry`, etc. with PBR materials. Zero external
  assets. ACES-filmic tone mapping + hemisphere fill + magenta & cyan rim
  lights so every object glows like it's being interrogated.
- **The beat**: Tone.js. Four-on-the-floor kick, snappy clap on 2 & 4, 16th
  hi-hats, plucky square lead bouncing through \\(F_m \to E\flat \to D\flat \to C\\),
  metallic "ding" on every downbeat. Procedural — no samples, no copyright
  smoke.
- **The merge**: when both hands hold something and the normalized hand
  distance drops below

  $$d_{\text{merge}} = 0.18$$

  the two 3D groups lerp toward the midpoint with an ease-out cubic, a yellow
  connecting beam pulses between them, and they get re-parented into one
  composite group that tweens into a parking slot. Pure vibes.
- **Fist detection**: for each non-thumb finger I check

  $$\|\text{tip} - \text{wrist}\| < 1.1 \cdot \|\text{MCP} - \text{wrist}\|$$

  meaning the tip is closer to the wrist than the knuckle is, i.e. it's
  curled. ≥3 of 4 fingers curled = fist. This is invariant to hand rotation
  which is honestly the only reason it works.

Hosted on Vercel from a GitHub repo. ~1500 lines of vanilla JS total.

## Challenges we ran into

- **MediaPipe handedness lied to me.** It returns "Left" / "Right" assuming an
  unmirrored camera, but browsers display front-cams mirrored. I was
  controlling my left hand with my right hand for an embarrassing amount of
  time before I realized.
- **Fist detection wanted to die.** The naive "fingertip below MCP" check
  totally falls apart at any hand angle that isn't dead vertical. I had to
  re-derive it as a wrist-relative-distance ratio (above) before it stopped
  hallucinating fists.
- **Long chains were popping out of frame.** Merge `apple pen orange bottle
  car snake` and you've got six full-sized models trying to live in one row.
  Solved it with \\(s = \min(1, 2 / \sqrt{n})\\) — the composite shrinks
  inversely-square with item count, so it always fits no matter how cursed it
  gets.
- **102 icon thumbnails** would melt the GPU if rendered as 102 live mini
  scenes. I share one off-screen Three.js renderer, add → render → toDataURL
  → remove for each builder once at boot. Done.
- **Audio autoplay policy.** `Tone.start()`, `getUserMedia`, and
  `speechSynthesis.speak` all need a user gesture. I chain them all to one
  START button click and hope for the best.

## Accomplishments that we're proud of

- **102 procedural 3D models.** Apple, pen, pineapple, banana, taco, UFO,
  Saturn-with-rings, figure-8 pretzel, the whole bestiary. Zero external
  assets means zero licensing risk and the entire visual style is internally
  consistent.
- **A custom PPAP-coded beat** that captures the energy without sampling
  anything. F minor scale, 4-bar progression, metallic bell ding on the 1.
  Not on copyright probation.
- **It runs fully local.** Camera frames never leave the device. Hand tracking
  is in-browser WASM. The TTS is built into your OS. The music is synthesized
  live. I could deploy this to a USB stick.
- **The snap-merge animation goes hard.** Both hands lerp toward the midpoint,
  a yellow beam connects them, the merged thing scales-bounce-tweens into the
  parking lot. Watching it land for the first time was the whole reason I
  finished the project.
- **The UI doesn't suck.** Glassmorphism over the camera, hairline borders,
  no gradients, dead-center white live label that updates the moment you grab
  something. Looks like an actual product, despite being stupid.

## What we learned

- **Procedural everything > asset pipelines, in a hackathon.** I tried
  Twemoji, then Microsoft Fluent 3D PNGs, then GLBs from Poly Pizza. Every
  approach had a different licensing or CDN-uptime caveat. Building from
  primitives ended every problem at once.
- **Coordinate spaces are a hazing ritual.** Mirrored video + unmirrored
  landmarks + a separate orthographic Three.js camera + a 2D overlay canvas =
  four coordinate systems you can fumble. I fumbled all of them. I learned.
- **Procedural audio is way easier than you'd expect.** Tone.js gives you
  `MembraneSynth`, `NoiseSynth`, `PolySynth`, `MetalSynth`, a `Sequence`
  primitive, swing, and a master compressor in like 200 lines of config. I
  went from "I want a beat" to "I have a beat" in an afternoon.
- **Ship the dumbest version first.** v1 used flat emojis and the merge was
  just "show big text." Getting that working in 30 minutes is what gave me the
  confidence to keep upgrading until I had real 3D models, real parking slots,
  and real fist gestures.

## What's next for pppp

- **Multiplayer**: two webcams, two players, your composites can collide with
  theirs. The lobby is just sharing a URL.
- **Particle bursts** on every merge so it feels even more deranged.
- **A speedrun mode**: how fast can you build "pen pineapple apple pen" from
  cold start? Leaderboard with localStorage. Or Supabase if I feel ambitious.
- **Voice picking**: say "pen" → it attaches to whichever hand you raise next.
  Already have the speech synth — just need recognition.
- **PPAP karaoke mode**: the beat ducks and the original lyrics scroll at the
  bottom while you act it out for the camera. The dumbest possible Just Dance.

---

## Built with

**Languages**: JavaScript (vanilla, ES modules), HTML, CSS

**Frameworks & libraries**: Three.js (3D rendering, procedural geometry,
ACES-filmic tone mapping, PBR materials), Tone.js (Web Audio synthesis —
drums, bass, lead, bell, master FX), MediaPipe Tasks Vision (`HandLandmarker`
in WASM with GPU delegate)

**Browser APIs**: WebGL 2, Web Audio API, Web Speech API
(`SpeechSynthesisUtterance`), MediaDevices `getUserMedia`, Canvas 2D,
`requestAnimationFrame`

**Cloud / platforms**: Vercel (static hosting, global CDN, SSL), GitHub
(source control), jsDelivr (CDN for MediaPipe WASM), esm.sh (ESM CDN for
Three.js + Tone.js)

**Databases**: none — fully client-side, no backend, no persisted state

**Dev tooling**: Python `http.server` (local dev), `gh` CLI, `vercel` CLI

**Tag-list for the form**:

```
javascript, html, css, three.js, tone.js, mediapipe, webgl, web-audio-api, web-speech-api, getusermedia, canvas, vercel, github, jsdelivr
```

---

**Live demo**: https://pppp-six-dun.vercel.app

**Repo**: https://github.com/joshuajerin/pppp
