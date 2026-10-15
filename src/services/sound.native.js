// Som no celular (Android/iOS) com o expo-audio. No navegador o arquivo usado é o sound.web.js.
import { createAudioPlayer } from "expo-audio";

import { SOUND_FILES } from "./soundFiles";

// uma gravação para cada tecla do piano estilo Roblox: 61 teclas, do Dó 2 (36) ao Dó 7 (96)
const PIANO_FILES = {
  36: require("../../assets/sounds/piano/n36.wav"),
  37: require("../../assets/sounds/piano/n37.wav"),
  38: require("../../assets/sounds/piano/n38.wav"),
  39: require("../../assets/sounds/piano/n39.wav"),
  40: require("../../assets/sounds/piano/n40.wav"),
  41: require("../../assets/sounds/piano/n41.wav"),
  42: require("../../assets/sounds/piano/n42.wav"),
  43: require("../../assets/sounds/piano/n43.wav"),
  44: require("../../assets/sounds/piano/n44.wav"),
  45: require("../../assets/sounds/piano/n45.wav"),
  46: require("../../assets/sounds/piano/n46.wav"),
  47: require("../../assets/sounds/piano/n47.wav"),
  48: require("../../assets/sounds/piano/n48.wav"),
  49: require("../../assets/sounds/piano/n49.wav"),
  50: require("../../assets/sounds/piano/n50.wav"),
  51: require("../../assets/sounds/piano/n51.wav"),
  52: require("../../assets/sounds/piano/n52.wav"),
  53: require("../../assets/sounds/piano/n53.wav"),
  54: require("../../assets/sounds/piano/n54.wav"),
  55: require("../../assets/sounds/piano/n55.wav"),
  56: require("../../assets/sounds/piano/n56.wav"),
  57: require("../../assets/sounds/piano/n57.wav"),
  58: require("../../assets/sounds/piano/n58.wav"),
  59: require("../../assets/sounds/piano/n59.wav"),
  60: require("../../assets/sounds/piano/n60.wav"),
  61: require("../../assets/sounds/piano/n61.wav"),
  62: require("../../assets/sounds/piano/n62.wav"),
  63: require("../../assets/sounds/piano/n63.wav"),
  64: require("../../assets/sounds/piano/n64.wav"),
  65: require("../../assets/sounds/piano/n65.wav"),
  66: require("../../assets/sounds/piano/n66.wav"),
  67: require("../../assets/sounds/piano/n67.wav"),
  68: require("../../assets/sounds/piano/n68.wav"),
  69: require("../../assets/sounds/piano/n69.wav"),
  70: require("../../assets/sounds/piano/n70.wav"),
  71: require("../../assets/sounds/piano/n71.wav"),
  72: require("../../assets/sounds/piano/n72.wav"),
  73: require("../../assets/sounds/piano/n73.wav"),
  74: require("../../assets/sounds/piano/n74.wav"),
  75: require("../../assets/sounds/piano/n75.wav"),
  76: require("../../assets/sounds/piano/n76.wav"),
  77: require("../../assets/sounds/piano/n77.wav"),
  78: require("../../assets/sounds/piano/n78.wav"),
  79: require("../../assets/sounds/piano/n79.wav"),
  80: require("../../assets/sounds/piano/n80.wav"),
  81: require("../../assets/sounds/piano/n81.wav"),
  82: require("../../assets/sounds/piano/n82.wav"),
  83: require("../../assets/sounds/piano/n83.wav"),
  84: require("../../assets/sounds/piano/n84.wav"),
  85: require("../../assets/sounds/piano/n85.wav"),
  86: require("../../assets/sounds/piano/n86.wav"),
  87: require("../../assets/sounds/piano/n87.wav"),
  88: require("../../assets/sounds/piano/n88.wav"),
  89: require("../../assets/sounds/piano/n89.wav"),
  90: require("../../assets/sounds/piano/n90.wav"),
  91: require("../../assets/sounds/piano/n91.wav"),
  92: require("../../assets/sounds/piano/n92.wav"),
  93: require("../../assets/sounds/piano/n93.wav"),
  94: require("../../assets/sounds/piano/n94.wav"),
  95: require("../../assets/sounds/piano/n95.wav"),
  96: require("../../assets/sounds/piano/n96.wav"),
};

const players = {};

function getPlayer(key, file) {
  if (!players[key]) {
    players[key] = createAudioPlayer(file);
    players[key].volume = 0.8;
  }
  return players[key];
}

function restart(player) {
  const seeking = player.seekTo(0);
  if (seeking && seeking.catch) seeking.catch(() => {});
  player.play();
}

export function preloadSounds() {
  ["tap", "correct", "wrong", "pop"].forEach((name) => getPlayer(name, SOUND_FILES[name]));
}

export function playSound(name) {
  restart(getPlayer(name, SOUND_FILES[name]));
}

// deixa as notas carregadas antes de a criança tocar, para a primeira nota não atrasar
export function preloadPiano() {
  Object.entries(PIANO_FILES).forEach(([midi, file]) => getPlayer(`piano${midi}`, file));
}

export function noteOn(midi) {
  if (PIANO_FILES[midi]) restart(getPlayer(`piano${midi}`, PIANO_FILES[midi]));
}

// a gravação já termina sozinha, como uma tecla de piano solta
export function noteOff() {}
