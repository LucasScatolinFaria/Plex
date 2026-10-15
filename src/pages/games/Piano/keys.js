// As 61 teclas do piano estilo Roblox (o "Virtual Piano"): do Dó 2 (midi 36) ao Dó 7 (midi 96).
// Cada tecla branca tem uma letra do teclado do computador, na ordem 1 2 3 ... 0 q w e ... m, e o "t" é o
// Dó do meio. Tecla preta = Shift + a letra da branca que fica à esquerda dela (por isso aparece maiúscula
// ou como símbolo: ! @ $ % ^ * ( Q W E ...). As partituras de letras do Roblox funcionam aqui.
export const FIRST = 36;
export const LAST = 96;

const WHITE_LETTERS = "1234567890qwertyuiopasdfghjklzxcvbnm";
const BLACK_LETTERS = "!@$%^*(QWETYIOPSDGHJLZCVB";
const NOTE_NAMES = ["Dó", "Dó♯", "Ré", "Ré♯", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];
const BLACK_STEPS = [1, 3, 6, 8, 10];

// cada nota tem sempre a mesma cor, para ajudar a decorar
const COLORS = {
  Dó: "#EF4444",
  Ré: "#F97316",
  Mi: "#EAB308",
  Fá: "#22C55E",
  Sol: "#06B6D4",
  Lá: "#3B82F6",
  Si: "#8B5CF6",
};

export const WHITES = []; // { midi, index, letter, code }
export const BLACKS = []; // { midi, after, letter, code } (after = índice da branca à esquerda)
export const KEYS = {}; // midi → tecla

for (let midi = FIRST; midi <= LAST; midi++) {
  if (BLACK_STEPS.includes(midi % 12)) {
    const left = WHITES[WHITES.length - 1];
    const key = { midi, black: true, after: left.index, letter: BLACK_LETTERS[BLACKS.length], code: left.code };
    BLACKS.push(key);
    KEYS[midi] = key;
  } else {
    const letter = WHITE_LETTERS[WHITES.length];
    // a tecla física (event.code), para funcionar em qualquer teclado (no ABNT2, Shift+6 nem é "^")
    const code = /\d/.test(letter) ? `Digit${letter}` : `Key${letter.toUpperCase()}`;
    const key = { midi, black: false, index: WHITES.length, letter, code };
    WHITES.push(key);
    KEYS[midi] = key;
  }
}

// tecla física → { white, black } (a preta é com Shift)
export const CODES = {};
WHITES.forEach((key) => {
  CODES[key.code] = { white: key.midi, black: null };
});
BLACKS.forEach((key) => {
  CODES[key.code].black = key.midi;
});

export const noteName = (midi) => NOTE_NAMES[midi % 12];
export const octaveOf = (midi) => Math.floor(midi / 12) - 1; // 60 = Dó 4
export const colorOf = (midi) => COLORS[noteName(midi).replace(/[♯♭]/, "")];
export const letterOf = (midi) => KEYS[midi]?.letter ?? "?";

// posição da tecla contada em teclas brancas (a preta fica no meio de duas brancas)
export const slotOf = (midi) => (KEYS[midi].black ? KEYS[midi].after + 0.5 : KEYS[midi].index);

export const MIDDLE_C = WHITES.findIndex((key) => key.midi === 60);
