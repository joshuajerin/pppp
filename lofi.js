// PPAP-style beat: 130 BPM four-on-the-floor, snappy claps on 2 & 4, 16th
// hi-hats, bouncy saw bass, plucky square lead over Fm → Eb → Db → C, plus a
// signature bell "ding" on every bar-1. Procedural — no copyrighted samples.
import * as Tone from "https://esm.sh/tone@14.8.49";

let started = false;

export async function startLofi() {
  if (started) return;
  await Tone.start();
  Tone.Transport.bpm.value = 130;

  // -------- Master --------
  const master = new Tone.Gain(0.62).toDestination();
  const compressor = new Tone.Compressor({ threshold: -14, ratio: 4, attack: 0.005, release: 0.1 }).connect(master);
  const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.18 }).connect(compressor);

  // -------- Drums --------
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.5 },
  });
  kick.volume.value = -2;
  kick.connect(compressor);

  const clap = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  });
  clap.volume.value = -10;
  const clapFilter = new Tone.Filter(1500, "highpass").connect(reverb);
  clap.connect(clapFilter);

  const hat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
  });
  hat.volume.value = -22;
  const hatFilter = new Tone.Filter(8500, "highpass").connect(compressor);
  hat.connect(hatFilter);

  const openHat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  });
  openHat.volume.value = -26;
  openHat.connect(hatFilter);

  // -------- Bass (bouncy saw with filter envelope = pluck) --------
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.18, sustain: 0.35, release: 0.2 },
    filter: { Q: 4, type: "lowpass" },
    filterEnvelope: { attack: 0.005, decay: 0.12, sustain: 0.25, baseFrequency: 220, octaves: 2.4 },
  });
  bass.volume.value = -7;
  bass.connect(compressor);

  // -------- Lead (plucky square with short release) --------
  const lead = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: { attack: 0.005, decay: 0.18, sustain: 0.0, release: 0.18 },
  });
  lead.volume.value = -12;
  const leadFilter = new Tone.Filter(4500, "lowpass").connect(reverb);
  lead.connect(leadFilter);

  // -------- Bell "ding" --------
  const bell = new Tone.MetalSynth({
    frequency: 600,
    envelope: { attack: 0.001, decay: 0.6, release: 0.3 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4500,
    octaves: 1.2,
  });
  bell.volume.value = -18;
  bell.connect(reverb);

  // ============== Patterns ==============
  // Kick: every quarter (4-on-the-floor).
  const kickSeq = new Tone.Sequence(
    (time) => kick.triggerAttackRelease("C1", "8n", time),
    [0, 0, 0, 0],
    "4n"
  );

  // Clap: beats 2 & 4.
  const clapSeq = new Tone.Sequence(
    (time, hit) => { if (hit) clap.triggerAttackRelease("16n", time, 0.9); },
    [null, "x", null, "x"],
    "4n"
  );

  // Hi-hat: every 16th, alternating velocities.
  const hatSeq = new Tone.Sequence(
    (time, v) => hat.triggerAttackRelease("32n", time, v),
    [0.7, 0.3, 0.55, 0.3, 0.7, 0.3, 0.55, 0.3, 0.7, 0.3, 0.55, 0.3, 0.7, 0.3, 0.55, 0.3],
    "16n"
  );

  // Open hat on the "&" of beats 2 and 4 — light shimmer.
  const openHatSeq = new Tone.Sequence(
    (time, hit) => { if (hit) openHat.triggerAttackRelease("16n", time, 0.5); },
    [null, null, null, null, null, "x", null, null, null, null, null, null, null, "x", null, null],
    "16n"
  );

  // Bass: bouncy 8th notes per chord, rest on the "&" of beat 1 for groove.
  // 4-bar progression: Fm | Eb | Db | C  →  32 8ths total.
  const bassNotes = [
    // bar 1: F minor
    "F2", null, "F2", "F2", "F2", null, "F2", "F2",
    // bar 2: Eb major
    "Eb2", null, "Eb2", "Eb2", "Eb2", null, "Eb2", "Eb2",
    // bar 3: Db major
    "Db2", null, "Db2", "Db2", "Db2", null, "Db2", "Db2",
    // bar 4: C major
    "C2",  null, "C2",  "C2",  "C2",  null, "C2",  "C2",
  ];
  const bassSeq = new Tone.Sequence(
    (time, n) => { if (n) bass.triggerAttackRelease(n, "8n", time, 0.85); },
    bassNotes,
    "8n"
  );

  // Lead motif — quarter notes, 4 bars (16 quarters). Cheeky, bouncy, F-minor scale.
  const leadNotes = [
    // bar 1 over Fm
    "F4", "Ab4", "C5", "Eb5",
    // bar 2 over Eb
    "G4", "Bb4", "D5", "F5",
    // bar 3 over Db
    "F4", "Ab4", "C5", "Db5",
    // bar 4 over C
    "Eb4", "G4", "Bb4", "C5",
  ];
  const leadSeq = new Tone.Sequence(
    (time, n) => lead.triggerAttackRelease(n, "8n", time, 0.7),
    leadNotes,
    "4n"
  );

  // Bell "ding" on beat 1 of every bar (4 dings per 4-bar loop).
  const bellSeq = new Tone.Sequence(
    (time, hit) => { if (hit) bell.triggerAttackRelease("16n", time, 0.55); },
    ["x", null, null, null, "x", null, null, null, "x", null, null, null, "x", null, null, null],
    "4n"
  );

  // Slight humanization.
  Tone.Transport.swing = 0.04;
  Tone.Transport.swingSubdivision = "16n";

  kickSeq.start(0);
  clapSeq.start(0);
  hatSeq.start(0);
  openHatSeq.start(0);
  bassSeq.start(0);
  leadSeq.start(0);
  bellSeq.start(0);
  Tone.Transport.start();

  started = true;
}

export function setLofiMuted(muted) {
  Tone.Destination.mute = muted;
}
