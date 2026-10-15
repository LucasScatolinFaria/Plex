// Desafio do dia: muda à meia-noite e é o mesmo para todo mundo no mesmo dia
// (o sorteio usa a data como semente, então a turma inteira pode disputar o mesmo desafio).
import { GAMES } from "./games";
import { dayKey } from "../utils/progress";

export const DAILY_XP = 50;

// o Xadrez fica de fora dos desafios de um jogo só: lá estrela é só vencendo o Bip, e as partidas são longas
const STAR_GAMES = GAMES.filter((game) => game.id !== "xadrez");

// sorteio com semente (mulberry32): a mesma data sempre dá o mesmo desafio
function randomFor(text) {
  let seed = 2166136261;
  for (let index = 0; index < text.length; index++) seed = Math.imul(seed ^ text.charCodeAt(index), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const choose = (random, list) => list[Math.floor(random() * list.length)];

// Cada tipo de desafio diz o objetivo e como cada partida conta.
// count(state, last): state = { value, games } do dia; last = a partida que acabou { gameId, stars, ... }
const KINDS = [
  (random) => {
    const game = choose(random, STAR_GAMES);
    return {
      emoji: game.emoji,
      gameId: game.id,
      text: `Ganhe 2 estrelas ou mais em uma partida de ${game.title}.`,
      goal: 1,
      count: ({ value }, last) => value + (last.gameId === game.id && last.stars >= 2 ? 1 : 0),
    };
  },
  (random) => {
    const game = choose(random, STAR_GAMES);
    const goal = choose(random, [2, 3]);
    return {
      emoji: game.emoji,
      gameId: game.id,
      text: `Jogue ${goal} partidas de ${game.title}.`,
      goal,
      count: ({ value }, last) => value + (last.gameId === game.id ? 1 : 0),
    };
  },
  (random) => {
    const goal = choose(random, [3, 4]);
    return {
      emoji: "🧭",
      gameId: null,
      text: `Jogue ${goal} jogos diferentes hoje.`,
      goal,
      count: ({ games }) => games.length,
    };
  },
  (random) => {
    const goal = choose(random, [4, 5, 6]);
    return {
      emoji: "⭐",
      gameId: null,
      text: `Junte ${goal} estrelas hoje, em qualquer jogo.`,
      goal,
      count: ({ value }, last) => value + last.stars,
    };
  },
  () => ({
    emoji: "🌟",
    gameId: null,
    text: "Ganhe 3 estrelas em uma partida de qualquer jogo.",
    goal: 1,
    count: ({ value }, last) => value + (last.stars === 3 ? 1 : 0),
  }),
];

// número do dia contado desde 1970 (a data local, a mesma do dayKey)
function dayNumber(day) {
  const [year, month, date] = day.split("-").map(Number);
  return Math.round(Date.UTC(year, month - 1, date) / 86400000);
}

// O tipo de desafio vai girando (nunca repete o de ontem); o jogo e a meta saem do sorteio do dia.
export function dailyChallenge(day = dayKey()) {
  const random = randomFor(`sesikids-${day}`);
  const kind = KINDS[dayNumber(day) % KINDS.length];
  return { day, ...kind(random) };
}

const freshDay = (day, total = 0) => ({ day, value: 0, games: [], done: false, total });

// Situação do desafio de hoje para mostrar na tela: { challenge, value, done }
export function dailyStatus(progress, day = dayKey()) {
  const challenge = dailyChallenge(day);
  const today = progress.daily?.day === day ? progress.daily : freshDay(day);
  return { challenge, value: Math.min(today.value, challenge.goal), done: today.done };
}

// Conta a partida que acabou no desafio do dia. completed = true só na partida que completou o desafio.
export function advanceDaily(previous, last, day = dayKey()) {
  const challenge = dailyChallenge(day);
  const base = previous?.day === day ? previous : freshDay(day, previous?.total || 0);
  if (base.done) return { daily: base, completed: false };

  const games = base.games.includes(last.gameId) ? base.games : [...base.games, last.gameId];
  const value = Math.min(challenge.count({ value: base.value, games }, last), challenge.goal);
  const done = value >= challenge.goal;
  return {
    daily: { ...base, games, value, done, total: base.total + (done ? 1 : 0) },
    completed: done,
  };
}
