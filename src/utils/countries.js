import { AMBIGUOUS, CONTINENTS, COUNTRIES } from "../data/countries";

const BY_ID = Object.fromEntries(COUNTRIES.map((country) => [country.id, country]));
const CONTINENT_BY_ID = Object.fromEntries(CONTINENTS.map((continent) => [continent.id, continent]));

export const getCountry = (id) => BY_ID[id];

export const continentOf = (id) => CONTINENT_BY_ID[BY_ID[id]?.continent];

export const countriesIn = (continentId) => COUNTRIES.filter((country) => country.continent === continentId);

// "Guiné-Bissau" vira "guine bissau": sem acento, sem maiúscula, sem pontuação e sem "o/a" na frente
export function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^(o|a|os|as) /, "");
}

// a comparação também ignora os espaços: "costadomarfim" vale
const squash = (text) => normalize(text).replace(/ /g, "");

const INDEX = new Map();
COUNTRIES.forEach((country) => {
  [country.name, ...country.alts].forEach((name) => INDEX.set(squash(name), country.id));
});

// Quantas letras precisam mudar para uma palavra virar a outra; trocar duas letras de lugar conta 1.
// Para assim que passa de "max" (só interessa saber se é pertinho).
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before = null;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      if (before && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, before[j - 2] + 1);
      }
      current.push(value);
      best = Math.min(best, value);
    }
    if (best > max) return max + 1;
    before = previous;
    previous = current;
  }
  return previous[b.length];
}

// Acha o país que a criança digitou.
// Devolve { id, typo } (typo = estava escrito um pouquinho errado), { ambiguous: "mensagem" } ou null.
// Erro de digitação só vale em nome comprido e quando um único país chega perto (senão é melhor recusar).
export function findCountry(text) {
  const key = squash(text);
  if (!key) return null;
  if (AMBIGUOUS[key]) return { ambiguous: AMBIGUOUS[key] };
  const exact = INDEX.get(key);
  if (exact) return { id: exact, typo: false };
  if (key.length < 5) return null;

  const max = key.length >= 9 ? 2 : 1;
  const close = new Set();
  INDEX.forEach((id, name) => {
    if (distance(key, name, max) <= max) close.add(id);
  });
  return close.size === 1 ? { id: [...close][0], typo: true } : null;
}

// endereço da bandeira (flagcdn.com, imagens livres); width = 80 ou 160 pixels
export const flagUrl = (id, width = 80) => `https://flagcdn.com/w${width}/${id}.png`;
