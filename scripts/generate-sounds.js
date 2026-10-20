// Gera os efeitos sonoros do SESI Kids em assets/sounds (sem precisar baixar nada).
// Uso: npm run sounds                  (tudo)
//      npm run sounds -- piano         (só as notas do piano; os outros sons ficam como estão)
//      npm run sounds -- whistle goal  (só os sons com esses nomes)
const fs = require("fs");
const path = require("path");

const RATE = 22050;
const OUT = path.join(__dirname, "..", "assets", "sounds");

const NOTE = {
  C4: 261.63, E4: 329.63, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, E6: 1318.51, G6: 1567.98, B6: 1975.53,
  Cs5: 554.37,
};

function wave(type, phase) {
  switch (type) {
    case "triangle":
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case "square":
      return Math.tanh(3 * Math.sin(phase));
    case "bell":
      return (Math.sin(phase) + 0.45 * Math.sin(2 * phase) + 0.2 * Math.sin(3 * phase)) / 1.65;
    case "noise":
      return Math.random() * 2 - 1;
    default:
      return Math.sin(phase);
  }
}

// voice: { freq, to, start, dur, type, gain, attack, curve, vibrato }
// vibrato = [vezes por segundo, quantos Hz a nota sobe e desce] (o trinado do apito do juiz)
function render(voices) {
  const total = Math.max(...voices.map((v) => (v.start || 0) + v.dur)) + 0.02;
  const samples = new Float32Array(Math.ceil(total * RATE));

  for (const voice of voices) {
    const { freq = 440, to = freq, start = 0, dur, type = "sine", gain = 0.5, attack = 0.006, curve = 2, vibrato } = voice;
    const begin = Math.floor(start * RATE);
    const length = Math.floor(dur * RATE);
    let phase = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const wobble = vibrato ? vibrato[1] * Math.sin((2 * Math.PI * vibrato[0] * i) / RATE) : 0;
      phase += (2 * Math.PI * (freq + (to - freq) * t + wobble)) / RATE;
      const envelope = Math.min(1, i / (attack * RATE)) * Math.pow(1 - t, curve);
      samples[begin + i] += wave(type, phase) * envelope * gain;
    }
  }
  return samples;
}

function toWav(samples) {
  const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0) || 1;
  const scale = Math.min(1, 0.85 / peak);
  const buffer = Buffer.alloc(44 + samples.length * 2);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);

  samples.forEach((value, index) => {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value * scale)) * 32767), 44 + index * 2);
  });
  return buffer;
}

const arpeggio = (notes, step, dur, extra = {}) =>
  notes.map((freq, index) => ({ freq, start: index * step, dur, type: "bell", gain: 0.4, ...extra }));

const SOUNDS = {
  tap: [{ freq: 520, to: 340, dur: 0.07, gain: 0.5 }],
  pop: [{ freq: 280, to: 880, dur: 0.09, gain: 0.6, curve: 1.5 }],
  flip: [
    { type: "noise", dur: 0.05, gain: 0.18, curve: 3 },
    { freq: 900, to: 1400, dur: 0.06, gain: 0.25 },
  ],
  slide: [{ freq: 220, to: 150, dur: 0.09, gain: 0.55, type: "triangle" }],
  tick: [{ freq: 1100, dur: 0.04, gain: 0.4 }],
  correct: [
    { freq: NOTE.E5, dur: 0.14, type: "bell", gain: 0.45 },
    { freq: NOTE.B5, start: 0.1, dur: 0.32, type: "bell", gain: 0.45 },
  ],
  wrong: [
    { freq: 196, to: 150, dur: 0.18, type: "square", gain: 0.22 },
    { freq: 147, to: 110, start: 0.16, dur: 0.28, type: "square", gain: 0.22 },
  ],
  match: [
    { freq: NOTE.G5, dur: 0.35, type: "bell", gain: 0.4 },
    { freq: NOTE.C6, start: 0.07, dur: 0.4, type: "bell", gain: 0.4 },
  ],
  star: [
    { freq: NOTE.E6, dur: 0.35, type: "bell", gain: 0.4 },
    { freq: NOTE.B6, start: 0.05, dur: 0.35, gain: 0.22 },
  ],
  win: [
    ...arpeggio([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 0.11, 0.22),
    ...[NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].map((freq) => ({
      freq, start: 0.46, dur: 0.75, type: "bell", gain: 0.24, curve: 1.6,
    })),
  ],
  lose: [
    { freq: NOTE.G4, dur: 0.22, type: "triangle", gain: 0.45 },
    { freq: NOTE.E4, start: 0.2, dur: 0.22, type: "triangle", gain: 0.45 },
    { freq: NOTE.C4, to: 240, start: 0.4, dur: 0.5, type: "triangle", gain: 0.45, curve: 1.5 },
  ],
  levelup: [
    ...arpeggio([NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6], 0.07, 0.16),
    ...[NOTE.C6, NOTE.E6, NOTE.G6].map((freq) => ({
      freq, start: 0.44, dur: 0.7, type: "bell", gain: 0.22, curve: 1.6,
    })),
  ],
  pad0: [{ freq: NOTE.E4, dur: 0.34, type: "bell", gain: 0.5, curve: 0.8 }],
  pad1: [{ freq: NOTE.A4, dur: 0.34, type: "bell", gain: 0.5, curve: 0.8 }],
  pad2: [{ freq: NOTE.Cs5, dur: 0.34, type: "bell", gain: 0.5, curve: 0.8 }],
  pad3: [{ freq: NOTE.E5, dur: 0.34, type: "bell", gain: 0.5, curve: 0.8 }],
  // JES Kids: apito do juiz (fi-fiiii) ao entrar no modo esportes
  whistle: [
    { freq: 2650, dur: 0.15, gain: 0.32, attack: 0.008, curve: 0.5, vibrato: [32, 150] },
    { freq: 2650, start: 0.21, dur: 0.5, gain: 0.32, attack: 0.01, curve: 0.9, vibrato: [32, 150] },
    { type: "noise", dur: 0.15, gain: 0.03, curve: 1 },
    { type: "noise", start: 0.21, dur: 0.48, gain: 0.03, curve: 1.2 },
  ],
  // JES Kids: buzina de estádio + fanfarra quando sai ponto num jogo ao vivo
  goal: [
    { freq: 233.08, dur: 0.95, type: "square", gain: 0.16, attack: 0.05, curve: 0.8 },
    { freq: 293.66, dur: 0.95, type: "square", gain: 0.13, attack: 0.05, curve: 0.8 },
    { freq: 349.23, dur: 0.95, type: "square", gain: 0.12, attack: 0.05, curve: 0.8 },
    ...[NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].map((freq, index) => ({
      freq, start: 0.55 + index * 0.09, dur: 0.3, type: "bell", gain: 0.32,
    })),
    { freq: NOTE.C6, start: 0.9, dur: 0.7, type: "bell", gain: 0.26, curve: 1.4 },
    { freq: NOTE.G5, start: 0.9, dur: 0.7, type: "bell", gain: 0.2, curve: 1.4 },
  ],
};

// Notas do piano (usadas no celular; no site as notas são sintetizadas na hora).
// midi 60 = Dó central. São as 61 teclas do piano estilo Roblox: do Dó 2 (36) ao Dó 7 (96).
// Cada nota tem a fundamental e alguns harmônicos que somem aos poucos.
const PIANO_FIRST = 36;
const PIANO_LAST = 96;
const pianoVoices = (midi) => {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  return [
    { freq, dur: 1.0, type: "triangle", gain: 0.55, attack: 0.004, curve: 2.6 },
    { freq: freq * 2, dur: 0.8, gain: 0.2, attack: 0.004, curve: 3 },
    { freq: freq * 3, dur: 0.5, gain: 0.08, attack: 0.004, curve: 3.5 },
  ];
};

// sem nomes gera tudo; com nomes, só eles ("piano" = as notas do piano)
const ONLY = process.argv.slice(2);
const wanted = (name) => ONLY.length === 0 || ONLY.includes(name);

fs.mkdirSync(OUT, { recursive: true });
if (wanted("piano")) {
  fs.mkdirSync(path.join(OUT, "piano"), { recursive: true });
  for (let midi = PIANO_FIRST; midi <= PIANO_LAST; midi++) {
    fs.writeFileSync(path.join(OUT, "piano", `n${midi}.wav`), toWav(render(pianoVoices(midi))));
  }
  console.log(`piano: ${PIANO_LAST - PIANO_FIRST + 1} notas`);
}

for (const [name, voices] of Object.entries(SOUNDS).filter(([name]) => wanted(name))) {
  const file = path.join(OUT, `${name}.wav`);
  fs.writeFileSync(file, toWav(render(voices)));
  console.log(`${name}.wav`);
}
