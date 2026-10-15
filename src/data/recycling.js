// Cores da coleta seletiva no Brasil: azul = papel, vermelho = plástico,
// verde = vidro, amarelo = metal e marrom = orgânico.
export const BINS = {
  papel: {
    label: "Papel",
    emoji: "📄",
    face: "#3B82F6",
    edge: "#1D4ED8",
    tip: "Papel limpo e seco vai na lixeira azul.",
  },
  plastico: {
    label: "Plástico",
    emoji: "🧴",
    face: "#EF4444",
    edge: "#B91C1C",
    tip: "Plástico vai na lixeira vermelha.",
  },
  vidro: {
    label: "Vidro",
    emoji: "🍾",
    face: "#22C55E",
    edge: "#15803D",
    tip: "Vidro vai na lixeira verde e pode ser reciclado muitas vezes.",
  },
  metal: {
    label: "Metal",
    emoji: "🥫",
    face: "#EAB308",
    edge: "#A16207",
    tip: "Metal vai na lixeira amarela. Latinhas viram latinhas novas!",
  },
  organico: {
    label: "Orgânico",
    emoji: "🍂",
    face: "#92400E",
    edge: "#5B2606",
    tip: "Restos de comida vão no orgânico e podem virar adubo.",
  },
};

const item = (emoji, name, bin) => ({ emoji, name, bin });

export const TRASH = [
  item("📰", "Jornal velho", "papel"),
  item("📦", "Caixa de papelão", "papel"),
  item("📄", "Folha de papel", "papel"),
  item("📚", "Revistas velhas", "papel"),
  item("📒", "Caderno usado", "papel"),
  item("🧴", "Frasco de xampu", "plastico"),
  item("🥤", "Copo de plástico", "plastico"),
  item("🍼", "Mamadeira de plástico", "plastico"),
  item("🍾", "Garrafa de vidro", "vidro"),
  item("🍷", "Taça de vidro", "vidro"),
  item("🍯", "Pote de vidro", "vidro"),
  item("🥛", "Copo de vidro", "vidro"),
  item("🥫", "Lata de molho", "metal"),
  item("🔩", "Parafusos", "metal"),
  item("🔑", "Chave velha", "metal"),
  item("📎", "Clipes de metal", "metal"),
  item("🍌", "Casca de banana", "organico"),
  item("🍎", "Resto de maçã", "organico"),
  item("🥚", "Casca de ovo", "organico"),
  item("🍃", "Folhas secas", "organico"),
  item("🍊", "Casca de laranja", "organico"),
  item("🥬", "Folhas de alface", "organico"),
];

// lixeiras de cada nível: começa com três e vai aumentando
export const BINS_BY_LEVEL = {
  facil: ["papel", "plastico", "organico"],
  medio: ["papel", "plastico", "vidro", "organico"],
  dificil: ["papel", "plastico", "vidro", "metal", "organico"],
};
