export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const sample = (list, count) => shuffle(list).slice(0, count);

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export const firstName = (name = "") => name.trim().split(/\s+/)[0] || "";
