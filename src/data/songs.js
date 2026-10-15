// Notas em número midi: 60 = Dó central, 62 = Ré, 64 = Mi, 65 = Fá, 67 = Sol, 69 = Lá, 71 = Si, 72 = Dó.
// Cada nota é [midi, tempos]: 1 = um tempo, 2 = nota mais longa.
const C = 60, D = 62, E = 64, F = 65, G = 67, A = 69, Bb = 70, C5 = 72;

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
};
