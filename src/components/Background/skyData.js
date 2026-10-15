// Sorteio com semente: o céu fica igual toda vez que a tela é desenhada.
export function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function buildStars(seed, count) {
  const next = seeded(seed);
  return Array.from({ length: count }, (_, index) => {
    const size = 1.5 + next() * 2.5;
    return {
      key: index,
      size,
      style: {
        left: `${next() * 100}%`,
        top: `${next() * 100}%`,
        width: size,
        height: size,
        borderRadius: size,
        opacity: 0.5 + next() * 0.5,
      },
    };
  });
}

// manchas de nebulosa bem desfocadas (duration = uma ida e volta, em ms)
export const ORBS = [
  { color: "#FF5FA2", size: 260, position: { top: "8%", left: -90 }, duration: 12400 },
  { color: "#22D3EE", size: 300, position: { bottom: "6%", right: -110 }, duration: 14800 },
  { color: "#FFD23F", size: 180, position: { top: "46%", left: "58%" }, duration: 10800 },
];

const DUST_COLORS = ["#FFFFFF", "#C4B5FD", "#FFE9A8", "#A5F3FC"];

// poeira estelar: grãozinhos que sobem devagar; start = em que ponto da subida cada um começa
export const DUST = (() => {
  const next = seeded(311);
  return Array.from({ length: 12 }, (_, index) => ({
    key: index,
    left: `${4 + next() * 92}%`,
    size: 2 + next() * 2.5,
    color: DUST_COLORS[index % DUST_COLORS.length],
    opacity: 0.25 + next() * 0.3,
    duration: 22000 + next() * 16000,
    start: next(),
    sway: 6 + next() * 10,
  }));
})();
