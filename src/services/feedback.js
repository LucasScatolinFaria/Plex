import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";

// "./sound" vira sound.web.js no site e sound.native.js no celular
import { noteOff, noteOn, playSound, preloadPiano as preloadNotes, preloadSounds as preload } from "./sound";
import { SOUND_FILES } from "./soundFiles";

const HAPTICS = {
  tap: "light",
  pop: "light",
  flip: "light",
  slide: "light",
  pad0: "light",
  pad1: "light",
  pad2: "light",
  pad3: "light",
  correct: "success",
  match: "success",
  win: "success",
  levelup: "success",
  goal: "success",
  whistle: "light",
  wrong: "error",
  lose: "error",
};

let soundEnabled = true;
let vibrationEnabled = true;

export function setSoundEnabled(value) {
  soundEnabled = value;
}

export function setVibrationEnabled(value) {
  vibrationEnabled = value;
}

function vibrate(kind) {
  if (kind === "success") {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  if (kind === "error") {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

// Som + vibração de um efeito. Se o aparelho não conseguir tocar, o jogo segue normalmente.
export function fx(name) {
  if (soundEnabled && SOUND_FILES[name]) {
    try {
      playSound(name);
    } catch (error) {}
  }
  if (vibrationEnabled && Platform.OS !== "web" && HAPTICS[name]) {
    try {
      vibrate(HAPTICS[name]).catch(() => {});
    } catch (error) {}
  }
}

// Teclas do piano (midi 60 = Dó central). Respeitam o botão de som, como os outros efeitos.
export function pianoOn(midi) {
  if (!soundEnabled) return;
  try {
    noteOn(midi);
  } catch (error) {}
}

export function pianoOff(midi) {
  try {
    noteOff(midi);
  } catch (error) {}
}

// Fala um texto em voz alta (usado para ensinar a pronúncia em inglês).
export function speak(text, language = "en-US") {
  if (!soundEnabled) return;
  try {
    Speech.stop();
    Speech.speak(text, { language, rate: 0.85 });
  } catch (error) {}
}

export function preloadPiano() {
  try {
    preloadNotes();
  } catch (error) {}
}

export function preloadSounds() {
  try {
    preload();
  } catch (error) {}
}
