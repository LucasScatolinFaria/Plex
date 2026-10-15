import { GAMES, rankedModes } from "./games";
import { bestStars, levelInfo, playsOf, totalStars } from "../utils/progress";

// check(progress, last): "last" é a partida que acabou de terminar
// { gameId, modeId, stars, score, detail }
export const ACHIEVEMENTS = [
  {
    id: "primeiro-passo",
    emoji: "🚀",
    title: "Primeiro Passo",
    description: "Jogue a sua primeira partida.",
    check: (progress) => progress.plays >= 1,
  },
  {
    id: "explorador",
    emoji: "🧭",
    title: "Explorador",
    description: "Jogue todos os jogos pelo menos uma vez.",
    check: (progress) => GAMES.every((game) => playsOf(progress, game.id) >= 1),
  },
  {
    id: "brilhante",
    emoji: "⭐",
    title: "Brilhante",
    description: "Ganhe 3 estrelas em uma partida.",
    check: (progress, last) => last.stars === 3,
  },
  {
    id: "colecionador",
    emoji: "🌟",
    title: "Colecionador",
    description: "Junte 10 estrelas.",
    check: (progress) => totalStars(progress) >= 10,
  },
  {
    id: "constelacao",
    emoji: "✨",
    title: "Constelação",
    description: "Junte 30 estrelas.",
    check: (progress) => totalStars(progress) >= 30,
  },
  {
    id: "galaxia",
    emoji: "🌌",
    title: "Galáxia",
    description: "Junte 60 estrelas.",
    check: (progress) => totalStars(progress) >= 60,
  },
  {
    id: "memoria-de-elefante",
    emoji: "🐘",
    title: "Memória de Elefante",
    description: "Ganhe 3 estrelas no Jogo da Memória no Difícil.",
    check: (progress) => bestStars(progress, "memoria", "dificil") === 3,
  },
  {
    id: "calculadora-humana",
    emoji: "🧮",
    title: "Calculadora Humana",
    description: "Acerte as 10 contas em uma partida de Matemática.",
    check: (progress, last) => last.gameId === "matematica" && last.detail.correct === 10,
  },
  {
    id: "mestre-das-palavras",
    emoji: "📖",
    title: "Mestre das Palavras",
    description: "Descubra as 5 palavras de uma partida.",
    check: (progress, last) => last.gameId === "palavras" && last.detail.solved === 5,
  },
  {
    id: "sabichao",
    emoji: "🎓",
    title: "Sabichão",
    description: "Ganhe 3 estrelas em 3 temas diferentes do Quiz.",
    check: (progress) =>
      ["ciencias", "natureza", "geografia", "portugues", "ingles", "mix"].filter(
        (mode) => bestStars(progress, "quiz", mode) === 3
      ).length >= 3,
  },
  {
    id: "pareo-para-o-bip",
    emoji: "🤖",
    title: "Páreo para o Bip",
    description: "Não perca nenhuma rodada para o Bip no Difícil.",
    check: (progress, last) =>
      last.gameId === "velha" && last.modeId === "dificil" && last.detail.losses === 0,
  },
  {
    id: "ouvido-bionico",
    emoji: "🎧",
    title: "Ouvido Biônico",
    description: "Complete 8 rodadas no Genius.",
    check: (progress, last) => last.gameId === "genius" && last.detail.rounds >= 8,
  },
  {
    id: "exterminador-de-bugs",
    emoji: "🐞",
    title: "Exterminador de Bugs",
    description: "Ganhe 3 estrelas no Caça aos Bugs sem acertar o Bip.",
    check: (progress, last) =>
      last.gameId === "bugs" && last.stars === 3 && last.detail.bipHits === 0,
  },
  {
    id: "quebra-cuca",
    emoji: "🧩",
    title: "Quebra-Cuca",
    description: "Resolva o Quebra-Cabeça 4×4.",
    check: (progress) => bestStars(progress, "puzzle", "dificil") >= 1,
  },
  {
    id: "pianista",
    emoji: "🎹",
    title: "Pianista",
    description: "Toque uma música inteira no Piano Mágico sem errar nenhuma nota.",
    check: (progress, last) => last.gameId === "piano" && last.stars === 3 && last.detail.mistakes === 0,
  },
  {
    id: "poliglota",
    emoji: "💬",
    title: "Poliglota",
    description: "Ganhe 3 estrelas no Inglês Divertido no modo Tradução.",
    check: (progress) => bestStars(progress, "ingles", "dificil") === 3,
  },
  {
    id: "dono-do-tempo",
    emoji: "⏰",
    title: "Dono do Tempo",
    description: "Ganhe 3 estrelas no Que Horas São? no modo Minutos.",
    check: (progress) => bestStars(progress, "relogio", "dificil") === 3,
  },
  {
    id: "amigo-do-planeta",
    emoji: "🌱",
    title: "Amigo do Planeta",
    description: "Separe todos os itens certos em uma partida de Recicla Tudo.",
    check: (progress, last) => last.gameId === "reciclagem" && last.detail.correct === last.detail.total,
  },
  {
    id: "recordista",
    emoji: "📈",
    title: "Recordista",
    description: "Supere o seu próprio recorde 5 vezes.",
    check: (progress) => progress.records >= 5,
  },
  {
    id: "maratonista",
    emoji: "🏃",
    title: "Maratonista",
    description: "Jogue 25 partidas.",
    check: (progress) => progress.plays >= 25,
  },
  {
    id: "em-chamas",
    emoji: "🔥",
    title: "Em Chamas",
    description: "Jogue 3 dias seguidos.",
    check: (progress) => progress.streak.count >= 3,
  },
  {
    id: "imparavel",
    emoji: "⚡",
    title: "Imparável",
    description: "Jogue 7 dias seguidos.",
    check: (progress) => progress.streak.count >= 7,
  },
  {
    id: "capitao-cometa",
    emoji: "🏅",
    title: "Capitão Cometa",
    description: "Chegue ao nível 5.",
    check: (progress) => levelInfo(progress.xp).level >= 5,
  },
  {
    id: "perfeccionista",
    emoji: "💎",
    title: "Perfeccionista",
    description: "Ganhe 3 estrelas em pelo menos um modo de cada jogo.",
    check: (progress) =>
      GAMES.every((game) =>
        rankedModes(game).some((mode) => bestStars(progress, game.id, mode.id) === 3)
      ),
  },
];
