// Notas em número midi: 60 = Dó central, 62 = Ré, 64 = Mi, 65 = Fá, 67 = Sol, 69 = Lá, 71 = Si, 72 = Dó.
// Cada nota é [midi, tempos]: 1 = um tempo, 2 = nota mais longa. beat = duração de um tempo em ms.
const C = 60, D = 62, E = 64, F = 65, G = 67, Gs = 68, A = 69, Bb = 70, B = 71;
const C5 = 72, D5 = 74, Ds5 = 75, E5 = 76;

export const SONGS = {
  brilha: {
    title: "Brilha, Brilha, Estrelinha",
    beat: 420,
    notes: [
      [C, 1], [C, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2],
      [F, 1], [F, 1], [E, 1], [E, 1], [D, 1], [D, 1], [C, 2],
      [G, 1], [G, 1], [F, 1], [F, 1], [E, 1], [E, 1], [D, 2],
      [G, 1], [G, 1], [F, 1], [F, 1], [E, 1], [E, 1], [D, 2],
      [C, 1], [C, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2],
      [F, 1], [F, 1], [E, 1], [E, 1], [D, 1], [D, 1], [C, 2],
    ],
  },
  alegria: {
    title: "Ode à Alegria",
    beat: 400,
    notes: [
      [E, 1], [E, 1], [F, 1], [G, 1], [G, 1], [F, 1], [E, 1], [D, 1],
      [C, 1], [C, 1], [D, 1], [E, 1], [E, 1.5], [D, 0.5], [D, 2],
      [E, 1], [E, 1], [F, 1], [G, 1], [G, 1], [F, 1], [E, 1], [D, 1],
      [C, 1], [C, 1], [D, 1], [E, 1], [D, 1.5], [C, 0.5], [C, 2],
    ],
  },
  parabens: {
    title: "Parabéns pra Você",
    beat: 430,
    notes: [
      [C, 0.75], [C, 0.25], [D, 1], [C, 1], [F, 1], [E, 2],
      [C, 0.75], [C, 0.25], [D, 1], [C, 1], [G, 1], [F, 2],
      [C, 0.75], [C, 0.25], [C5, 1], [A, 1], [F, 1], [E, 1], [D, 2],
      [Bb, 0.75], [Bb, 0.25], [A, 1], [F, 1], [G, 1], [F, 2],
    ],
  },
  // Beethoven: a famosa dos pianos do Roblox (usa teclas pretas!)
  elise: {
    title: "Für Elise",
    beat: 300,
    notes: [
      [E5, 1], [Ds5, 1], [E5, 1], [Ds5, 1], [E5, 1], [B, 1], [D5, 1], [C5, 1], [A, 2],
      [C, 1], [E, 1], [A, 1], [B, 2],
      [E, 1], [Gs, 1], [B, 1], [C5, 2],
      [E, 1], [E5, 1], [Ds5, 1], [E5, 1], [Ds5, 1], [E5, 1], [B, 1], [D5, 1], [C5, 1], [A, 2],
      [C, 1], [E, 1], [A, 1], [B, 2],
      [E, 1], [C5, 1], [B, 1], [A, 3],
    ],
  },
  jingle: {
    title: "Jingle Bells",
    beat: 330,
    notes: [
      [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2],
      [E, 1], [G, 1], [C, 1.5], [D, 0.5], [E, 3],
      [F, 1], [F, 1], [F, 1.5], [F, 0.5], [F, 1], [E, 1], [E, 1], [E, 0.5], [E, 0.5],
      [E, 1], [D, 1], [D, 1], [E, 1], [D, 2], [G, 2],
      [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2],
      [E, 1], [G, 1], [C, 1.5], [D, 0.5], [E, 3],
      [F, 1], [F, 1], [F, 1.5], [F, 0.5], [F, 1], [E, 1], [E, 1], [E, 0.5], [E, 0.5],
      [G, 1], [G, 1], [F, 1], [D, 1], [C, 3],
    ],
  },
};
