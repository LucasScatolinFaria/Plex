// Som no navegador com a Web Audio API: toca na hora, sem a espera do <audio>.
// (No celular o arquivo usado é o sound.native.js.)
import { Asset } from "expo-asset";

import { SOUND_FILES } from "./soundFiles";

let context = null;
let master = null;
const raw = {}; // nome → arquivo .wav já baixado
const buffers = {}; // nome → som pronto para tocar
const voices = {}; // nota do piano → osciladores que estão soando

// O navegador só libera o áudio depois de um toque ou tecla; por isso o contexto nasce na primeira vez que algo toca.
function getContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass({ latencyHint: "interactive" });
    // o compressor evita estalos quando várias notas tocam juntas
    master = context.createDynamicsCompressor();
    master.connect(context.destination);
  }
  if (context.state === "suspended") context.resume().catch(() => {});
  return context;
}

// Nossos .wav são simples (PCM 16 bits, mono): dá para ler direto, sem esperar o decodificador.
function readWav(data) {
  const view = new DataView(data);
  const sampleRate = view.getUint32(24, true);
  const length = (data.byteLength - 44) / 2;
  const buffer = context.createBuffer(1, length, sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index++) {
    samples[index] = view.getInt16(44 + index * 2, true) / 32768;
  }
  return buffer;
}

export function preloadSounds() {
  Object.entries(SOUND_FILES).forEach(([name, file]) => {
    fetch(Asset.fromModule(file).uri)
      .then((response) => response.arrayBuffer())
      .then((data) => {
        raw[name] = data;
      })
      .catch(() => {});
  });
}

export function playSound(name) {
  const audio = getContext();
  if (!audio) return;
  if (!buffers[name]) {
    if (!raw[name]) return; // ainda baixando
    buffers[name] = readWav(raw[name]);
  }
  const source = audio.createBufferSource();
  const volume = audio.createGain();
  source.buffer = buffers[name];
  volume.gain.value = 0.8;
  source.connect(volume);
  volume.connect(master);
  source.start();
}

/* ---------- piano: cada nota é criada na hora em que a tecla desce ---------- */

const HARMONICS = [
  { multiple: 1, type: "triangle", level: 1 },
  { multiple: 2, type: "sine", level: 0.32 },
  { multiple: 3, type: "sine", level: 0.12 },
  { multiple: 4, type: "sine", level: 0.05 },
];

function release(voice, now, time) {
  const { gain } = voice.envelope;
  if (gain.cancelAndHoldAtTime) {
    gain.cancelAndHoldAtTime(now);
  } else {
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(gain.value, 0.0001), now);
  }
  gain.exponentialRampToValueAtTime(0.0001, now + time);
  voice.oscillators.forEach((oscillator) => oscillator.stop(now + time + 0.02));
}

// no site não há nada para carregar: as notas são sintetizadas
export function preloadPiano() {}

// midi 60 = Dó central, 61 = Dó sustenido, 62 = Ré...
export function noteOn(midi) {
  const audio = getContext();
  if (!audio) return;
  const now = audio.currentTime;
  if (voices[midi]) release(voices[midi], now, 0.03);

  const frequency = 440 * Math.pow(2, (midi - 69) / 12);
  const envelope = audio.createGain();
  // sobe quase na hora e depois vai sumindo, como a corda de um piano
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.42, now + 0.006);
  envelope.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
  envelope.connect(master);

  const oscillators = HARMONICS.map(({ multiple, type, level }) => {
    const oscillator = audio.createOscillator();
    const amount = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency * multiple;
    amount.gain.value = level;
    oscillator.connect(amount);
    amount.connect(envelope);
    oscillator.start(now);
    oscillator.stop(now + 2.5);
    return oscillator;
  });

  voices[midi] = { envelope, oscillators };
}

export function noteOff(midi) {
  const voice = voices[midi];
  if (!voice || !context) return;
  delete voices[midi];
  release(voice, context.currentTime, 0.22);
}
