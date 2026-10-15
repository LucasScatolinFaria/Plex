import { GAMES, rankedModes } from "../data/games";

export const EMPTY_PROGRESS = {
  xp: 0,
  plays: 0,
  records: 0,
  byGame: {}, // { [gameId]: { plays, bests: { [modeId]: { score, stars } } } }
  achievements: {}, // { [achievementId]: data em que foi conquistada }
  streak: { count: 0, last: null },
};

const LEVEL_TITLES = [
  "Cadete Espacial",
  "Piloto Júnior",
  "Explorador Lunar",
  "Navegador Estelar",
  "Capitão Cometa",
  "Comandante Solar",
  "Mestre das Galáxias",
  "Herói Cósmico",
  "Lenda Estelar",
  "Guardião do Universo",
];

const xpToNext = (level) => 80 + 40 * (level - 1);

export function levelInfo(xp) {
  let level = 1;
  let base = 0;
  while (xp >= base + xpToNext(level)) {
    base += xpToNext(level);
    level++;
  }
  const need = xpToNext(level);
  return {
    level,
    current: xp - base,
    need,
    ratio: (xp - base) / need,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
  };
}

export const bestOf = (progress, gameId, modeId) => progress.byGame[gameId]?.bests?.[modeId] || null;

export const bestStars = (progress, gameId, modeId) => bestOf(progress, gameId, modeId)?.stars || 0;

export const playsOf = (progress, gameId) => progress.byGame[gameId]?.plays || 0;

export function gameStars(progress, game) {
  return rankedModes(game).reduce((sum, mode) => sum + bestStars(progress, game.id, mode.id), 0);
}

export function totalStars(progress) {
  return GAMES.reduce((sum, game) => sum + gameStars(progress, game), 0);
}

export function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function previousDayKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return dayKey(new Date(year, month - 1, day - 1));
}

export function nextStreak(streak, today = dayKey()) {
  if (streak.last === today) return streak;
  const kept = streak.last === previousDayKey(today);
  return { count: kept ? streak.count + 1 : 1, last: today };
}

// a sequência só vale se a última partida foi hoje ou ontem
export function currentStreak(progress, today = dayKey()) {
  const { count, last } = progress.streak;
  return last === today || last === previousDayKey(today) ? count : 0;
}

export function normalizeProgress(saved) {
  return {
    ...EMPTY_PROGRESS,
    ...(saved || {}),
    streak: { ...EMPTY_PROGRESS.streak, ...(saved?.streak || {}) },
  };
}
