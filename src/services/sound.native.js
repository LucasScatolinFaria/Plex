// Som no celular (Android/iOS) com o expo-audio. No navegador o arquivo usado é o sound.web.js.
import { createAudioPlayer } from "expo-audio";

import { SOUND_FILES } from "./soundFiles";

// uma gravação para cada tecla do piano, do Dó central (60) ao Mi da oitava de cima (76)
const PIANO_FILES = {
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

// deixa as 17 notas carregadas antes de a criança tocar, para a primeira nota não atrasar
export function preloadPiano() {
  Object.entries(PIANO_FILES).forEach(([midi, file]) => getPlayer(`piano${midi}`, file));
}

export function noteOn(midi) {
  if (PIANO_FILES[midi]) restart(getPlayer(`piano${midi}`, PIANO_FILES[midi]));
}

// a gravação já termina sozinha, como uma tecla de piano solta
export function noteOff() {}
