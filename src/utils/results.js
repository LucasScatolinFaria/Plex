import { ACHIEVEMENTS } from "../data/achievements";
import { clamp } from "./helpers";
import { bestOf, dayKey, levelInfo, nextStreak } from "./progress";

const ACHIEVEMENT_XP = 20;

// Junta o resultado de uma partida ao progresso do jogador (sem alterar o objeto antigo).
// result: { score, stars, casual, detail }
export function applyResult(previous, gameId, modeId, result, today = dayKey()) {
  const casual = !!result.casual;
  const stars = casual ? 0 : clamp(Math.round(result.stars || 0), 0, 3);
  const score = Math.max(0, Math.round(result.score || 0));

  const game = previous.byGame[gameId] || { plays: 0, bests: {} };
  const best = bestOf(previous, gameId, modeId);
  const newRecord = !casual && score > (best?.score || 0);
  const beatOwnRecord = newRecord && !!best;

  const bests = casual
    ? game.bests
    : {
        ...game.bests,
        [modeId]: {
          score: Math.max(score, best?.score || 0),
          stars: Math.max(stars, best?.stars || 0),
        },
      };

  let xpGained = casual ? 8 : 10 + stars * 15 + (beatOwnRecord ? 10 : 0);

  const progress = {
    ...previous,
    xp: previous.xp + xpGained,
    plays: previous.plays + 1,
    records: previous.records + (beatOwnRecord ? 1 : 0),
    byGame: { ...previous.byGame, [gameId]: { plays: game.plays + 1, bests } },
    streak: nextStreak(previous.streak, today),
  };

  const last = { gameId, modeId, stars, score, detail: result.detail || {} };
  const unlocked = ACHIEVEMENTS.filter(
    (achievement) => !previous.achievements[achievement.id] && achievement.check(progress, last)
  );

  if (unlocked.length > 0) {
    const now = new Date().toISOString();
    progress.achievements = { ...previous.achievements };
    unlocked.forEach((achievement) => {
      progress.achievements[achievement.id] = now;
    });
    progress.xp += unlocked.length * ACHIEVEMENT_XP;
    xpGained += unlocked.length * ACHIEVEMENT_XP;
  }

  return {
    progress,
    summary: {
      xpGained,
      newRecord,
      previousBest: best?.score ?? null,
      before: levelInfo(previous.xp),
      after: levelInfo(progress.xp),
      unlocked,
    },
  };
}
