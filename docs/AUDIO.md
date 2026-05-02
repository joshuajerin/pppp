# Audio

`pppp` has zero audio samples. Every sound is synthesized live in the
browser by [Tone.js](https://tonejs.github.io/) — kicks, claps, hi-hats,
bass, lead, bell, and the master FX chain.

## Tempo & key

- **130 BPM**, four-on-the-floor — driving, hackathon-energy.
- **F minor** key. Progression: $F_m \to E\flat \to D\flat \to C$, one chord
  per bar, looping every 4 bars.
- Slight humanization: `Tone.Transport.swing = 0.04`, `swingSubdivision = "16n"`.

## Master chain

```
[ all instruments ]
       │
       ▼
   Compressor (-14 dB threshold, 4:1 ratio, 5ms attack, 100ms release)
       │
       ▼
   Reverb (decay 1.2s, wet 0.18)
       │
       ▼
   Master Gain (0.62)
       │
       ▼
   Tone.Destination
```

Light, snappy, contemporary club-pop sound — not bedroom-lofi.

## Drums

| Voice    | Synth                                       | Pattern (16th grid)                    |
| -------- | ------------------------------------------- | -------------------------------------- |
| Kick     | `MembraneSynth` (pitch decay 0.04, oct 6)   | every quarter (4-on-the-floor)         |
| Clap     | `NoiseSynth` (white) → 1.5kHz HPF           | beats 2 & 4                            |
| Hi-hat   | `NoiseSynth` (white) → 8.5kHz HPF           | every 16th, alt velocities (0.7 / 0.3) |
| Open hat | `NoiseSynth` (white) → 8.5kHz HPF (longer release) | "&" of beats 2 & 4                |

## Bass

`MonoSynth` with sawtooth oscillator and a filter envelope for that classic
plucky synth-bass attack:

```
oscillator: sawtooth
envelope:        attack 5ms, decay 180ms, sustain 0.35, release 200ms
filterEnvelope:  attack 5ms, decay 120ms, sustain 0.25, base 220Hz, +2.4 oct
filter Q: 4
```

Pattern is 32 8th notes (= 4 bars), playing the root of each chord with a
"rest on the &" feel:

| Beat | Note     |
| ---- | -------- |
| 1    | F2       |
| 1.5  | (rest)   |
| 2    | F2       |
| 2.5  | F2       |
| 3    | F2       |
| 3.5  | (rest)   |
| 4    | F2       |
| 4.5  | F2       |

…repeats per chord with the root descending: F2 → E♭2 → D♭2 → C2.

## Lead

`PolySynth(Synth)` with square oscillator, short envelope, filtered through
a 4.5 kHz lowpass into the reverb send. Plays a 16-note motif over 4 bars,
quarter-note pacing:

```
F4  Ab4  C5  Eb5    | over Fm
G4  Bb4  D5  F5     | over Eb
F4  Ab4  C5  Db5    | over Db
Eb4 G4   Bb4 C5     | over C
```

It outlines each chord's tonic triad with one passing tone — busy enough
to carry the melody, sparse enough to leave room for the bass.

## Bell ("ding")

`MetalSynth` with high modulation index and resonance, hits beat 1 of every
bar. This is the signature PPAP-coded element — the moment of comedic
punctuation that ties the whole loop together.

```
harmonicity: 5.1
modulationIndex: 32
resonance: 4500 Hz
octaves: 1.2
```

## Why no samples?

1. **Copyright.** PPAP itself is on YouTube; the original song is firmly
   off-limits for any submission. Procedural means we own everything.
2. **Bundle size.** Drum samples alone would balloon the repo. Tone.js is
   ~100 KB gzipped via CDN and renders all of this from raw oscillators
   and noise.
3. **Hot-reload.** Tweaking a velocity or BPM is a one-line edit, no
   re-rendering audio assets.
4. **It works offline after first load.** No sample CDN to depend on.
