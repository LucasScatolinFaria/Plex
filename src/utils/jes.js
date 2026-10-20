import { DIVISIONS, HIGHLIGHTS, POINTS, SPORTS, TEAMS } from "../data/jes";
import { dayKey } from "./progress";

// esporte que não está mais em data/jes.js (o jogo continua aparecendo, com um visual neutro)
const UNKNOWN_SPORT = {
  id: "?",
  name: "Esporte",
  emoji: "🏅",
  colors: ["#94A3B8", "#475569"],
  divisions: [],
  score: { unit: "pontos", steps: [1], say: { 1: "Ponto do {team}!" }, cheer: "PONTO!" },
  about: "",
  rules: [],
  fact: "",
};

export const getDivision = (id) => DIVISIONS.find((division) => division.id === id) || DIVISIONS[0];

export const getSport = (id) => SPORTS.find((sport) => sport.id === id) || { ...UNKNOWN_SPORT, id };

// a mesma cor, misturada com branco (o escudo é um degradê das duas)
export function lighten(hex, amount = 0.5) {
  const value = parseInt(hex.slice(1), 16);
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);
  const rgb = [mix(value >> 16), mix((value >> 8) & 255), mix(value & 255)];
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

// Nome, bicho e cor que o organizador trocou (jesConfig/teams). O JesProvider atualiza isto antes de redesenhar,
// então todo getTeam do app já devolve a sala com a cara nova.
let custom = {};

export function setTeamOverrides(next) {
  custom = next || {};
}

export function getTeam(id) {
  const base = TEAMS.find((team) => team.id === id) || {
    id,
    label: id,
    division: "",
    name: "",
    emoji: "🏳️",
    color: "#64748B",
    light: "#CBD5E1",
  };
  const changes = custom[id];
  if (!changes) return base;
  return {
    ...base,
    label: changes.label || base.label,
    name: changes.name ?? base.name,
    emoji: changes.emoji || base.emoji,
    color: changes.color || base.color,
    light: changes.color ? lighten(changes.color) : base.light,
  };
}

// true quando o organizador já trocou alguma coisa nesta sala
export const teamCustomized = (id) => !!custom[id];

export const allTeams = () => TEAMS.map((team) => getTeam(team.id));

export const teamsOf = (divisionId) => allTeams().filter((team) => team.division === divisionId);

export const sportsOf = (divisionId) => SPORTS.filter((sport) => sport.divisions.includes(divisionId));

export const teamName = (team) => `${team.label} ${team.name}`.trim();

/* ---------- relógio da partida ---------- */

// Tempo de jogo em segundos: o que já correu antes da última pausa (base) + o trecho que está correndo agora.
export function clockSeconds(match, now = Date.now()) {
  const { running, base = 0, startedAt } = match.clock || {};
  if (!running || !startedAt) return base;
  return base + Math.max(0, Math.floor((now - startedAt) / 1000));
}

export const formatClock = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

// minuto do lance, como na narração do futebol: aos 12min30s é o 13º minuto
export const minuteOf = (seconds) => `${Math.floor(seconds / 60) + 1}'`;

/* ---------- datas e horários ("2026-10-20" e "14:30", no horário da escola) ---------- */

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function addDays(key, amount) {
  const [year, month, day] = key.split("-").map(Number);
  return dayKey(new Date(year, month - 1, day + amount));
}

export const shortDate = (key) => {
  const [, month, day] = key.split("-");
  return `${day}/${month}`;
};

// "Hoje", "Amanhã", "Ontem" ou "qua, 22/10"
export function dateLabel(key, today = dayKey()) {
  if (key === today) return "Hoje";
  if (key === addDays(today, 1)) return "Amanhã";
  if (key === addDays(today, -1)) return "Ontem";
  const [year, month, day] = key.split("-").map(Number);
  return `${WEEKDAYS[new Date(year, month - 1, day).getDay()]}, ${shortDate(key)}`;
}

export const timeOf = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export const validTime = (text) => /^([01]\d|2[0-3]):[0-5]\d$/.test(text);

export function addMinutes(time, minutes) {
  const [hours, mins] = time.split(":").map(Number);
  const total = (((hours * 60 + mins + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export const kickoff = (match) => `${match.date} ${match.time}`;

export const byKickoff = (a, b) => kickoff(a).localeCompare(kickoff(b));

/* ---------- resultados e classificação ---------- */

// "A", "B" ou "draw"
export function winnerOf(match) {
  if (match.scoreA > match.scoreB) return "A";
  if (match.scoreB > match.scoreA) return "B";
  return "draw";
}

// Tabela de uma dupla de anos (ex.: 1º e 2º): só jogos encerrados contam. sportId = null soma todos os esportes.
// bonuses = pontos extras que o organizador deu (jesPoints); os de um esporte contam nele e no geral.
// Desempate: pontos, vitórias, saldo, pontos/gols marcados e, por último, a ordem das salas.
export function standings(matches, divisionId, sportId = null, bonuses = []) {
  const rows = teamsOf(divisionId).map((team, order) => ({
    team,
    order,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    scored: 0,
    conceded: 0,
    points: 0,
    extra: 0,
    form: [],
  }));
  const rowOf = (id) => rows.find((row) => row.team.id === id);

  matches
    .filter(
      (match) =>
        match.status === "finished" && match.division === divisionId && (!sportId || match.sport === sportId)
    )
    .sort(byKickoff)
    .forEach((match) => {
      const winner = winnerOf(match);
      [
        [rowOf(match.teamA), match.scoreA, match.scoreB, "A"],
        [rowOf(match.teamB), match.scoreB, match.scoreA, "B"],
      ].forEach(([row, own, other, side]) => {
        if (!row) return;
        const result = winner === "draw" ? "E" : winner === side ? "V" : "D";
        row.played += 1;
        row.scored += own;
        row.conceded += other;
        if (result === "V") row.wins += 1;
        if (result === "E") row.draws += 1;
        if (result === "D") row.losses += 1;
        row.points += result === "V" ? POINTS.win : result === "E" ? POINTS.draw : POINTS.loss;
        row.form = [...row.form, result].slice(-5);
      });
    });

  bonuses
    .filter((bonus) => bonus.division === divisionId && (!sportId || bonus.sport === sportId))
    .forEach((bonus) => {
      const row = rowOf(bonus.team);
      if (!row) return;
      row.extra += bonus.points;
      row.points += bonus.points;
    });

  return rows
    .map((row) => ({ ...row, balance: row.scored - row.conceded }))
    .sort(
      (a, b) =>
        b.points - a.points || b.wins - a.wins || b.balance - a.balance || b.scored - a.scored || a.order - b.order
    )
    .map((row, index) => ({ ...row, position: index + 1 }));
}

// Todos contra todos, em rodadas (cada sala joga uma vez por rodada). Devolve os pares [salaA, salaB].
export function roundRobin(ids) {
  const list = ids.length % 2 ? [...ids, null] : [...ids];
  const pairs = [];
  for (let round = 0; round < list.length - 1; round++) {
    for (let index = 0; index < list.length / 2; index++) {
      const home = list[index];
      const away = list[list.length - 1 - index];
      if (home && away) pairs.push(round % 2 ? [away, home] : [home, away]);
    }
    list.splice(1, 0, list.pop()); // gira todo mundo, menos o primeiro
  }
  return pairs;
}

/* ---------- lance a lance ---------- */

const withTeam = (text, team) => text.replace("{team}", team?.label ?? "");

// Texto e emoji de um lance. Os lances guardam só o tipo e o lado; a frase é montada aqui.
export function describeEvent(event, match) {
  const team = event.side ? getTeam(event.side === "A" ? match.teamA : match.teamB) : null;
  if (event.type === "score") {
    const { emoji, score } = getSport(match.sport);
    return { emoji, team, text: withTeam(score.say[event.points] || score.say[1], team) };
  }
  if (event.type === "start") return { emoji: "🟢", team, text: "Começou o jogo! Boa sorte, turma!" };
  if (event.type === "pause") return { emoji: "⏸️", team, text: "Pausa para respirar e beber água." };
  if (event.type === "resume") return { emoji: "▶️", team, text: "O jogo recomeçou!" };
  if (event.type === "end") return { emoji: "🏁", team, text: "Fim de jogo!" };
  const highlight = HIGHLIGHTS.find((item) => item.id === event.type);
  return {
    emoji: highlight?.emoji ?? "📌",
    team,
    text: highlight ? withTeam(highlight.say, team) : "Lance do jogo",
  };
}
