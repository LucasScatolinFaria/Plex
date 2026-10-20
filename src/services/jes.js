// JES Kids no Firestore:
//   jesMatches/{id}  os jogos: salas, esporte, horário, placar, relógio e o lance a lance.
//                    Qualquer pessoa lê (até sem conta); só organizador escreve.
//   jesStaff/{uid}   quem é organizador. Para virar, a pessoa digita o código do organizador
//                    (as regras do firestore.rules conferem o código; ele não fica guardado em lugar público).
//   jesConfig/teams  nome, bicho e cor que o organizador escolheu para cada sala (por cima de data/jes.js).
//   jesPoints/{id}   pontos extras que o organizador deu a uma sala (fair play, torcida...).
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";
import { clockSeconds } from "../utils/jes";

// o lance a lance de cada jogo guarda no máximo isto (o placar continua contando depois)
export const MAX_EVENTS = 120;

const matchesRef = collection(db, "jesMatches");
const matchRef = (id) => doc(db, "jesMatches", id);
const staffRef = (uid) => doc(db, "jesStaff", uid);
const teamsRef = doc(db, "jesConfig", "teams");
const pointsRef = collection(db, "jesPoints");

// o código vale com ou sem traços, em maiúsculas ou minúsculas
export const normalizeCode = (code) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

function toMatch(snapshot) {
  // "estimate": enquanto o servidor não confirma a hora, usa a do aparelho (o relógio já sai andando)
  const data = snapshot.data({ serverTimestamps: "estimate" });
  return {
    id: snapshot.id,
    division: data.division,
    sport: data.sport,
    teamA: data.teamA,
    teamB: data.teamB,
    date: data.date,
    time: data.time,
    place: data.place,
    status: data.status,
    scoreA: data.scoreA || 0,
    scoreB: data.scoreB || 0,
    clock: {
      running: !!data.clock?.running,
      base: data.clock?.base || 0,
      startedAt: data.clock?.startedAt?.toMillis?.() ?? null,
    },
    events: data.events || [],
  };
}

// devolve a função que para de escutar
export function watchMatches(onChange, onError) {
  return onSnapshot(matchesRef, (snapshot) => onChange(snapshot.docs.map(toMatch)), onError);
}

const STOPPED = { running: false, base: 0, startedAt: null };

function details({ division, sport, teamA, teamB, date, time, place }) {
  return { division, sport, teamA, teamB, date, time, place };
}

export function createMatches(list) {
  const batch = writeBatch(db);
  list.forEach((match) =>
    batch.set(doc(matchesRef), {
      ...details(match),
      status: "scheduled",
      scoreA: 0,
      scoreB: 0,
      clock: STOPPED,
      events: [],
      updatedAt: serverTimestamp(),
    })
  );
  return batch.commit();
}

export const editMatch = (id, match) =>
  updateDoc(matchRef(id), { ...details(match), updatedAt: serverTimestamp() });

export const deleteMatch = (id) => deleteDoc(matchRef(id));

const update = (match, changes) => updateDoc(matchRef(match.id), { ...changes, updatedAt: serverTimestamp() });

function newEvent(match, type, extra = {}) {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return { id, type, at: clockSeconds(match), ...extra };
}

// lance novo só entra se ainda couber (passar do limite faria o banco recusar a mudança inteira)
const withEvent = (match, event) => (match.events.length < MAX_EVENTS ? { events: arrayUnion(event) } : {});

export const startMatch = (match) =>
  update(match, {
    status: "live",
    clock: { running: true, base: match.clock.base, startedAt: serverTimestamp() },
    ...withEvent(match, newEvent(match, match.clock.base > 0 ? "resume" : "start")),
  });

export const pauseMatch = (match) =>
  update(match, {
    clock: { running: false, base: clockSeconds(match), startedAt: null },
    ...withEvent(match, newEvent(match, "pause")),
  });

export const resumeMatch = (match) =>
  update(match, {
    clock: { running: true, base: match.clock.base, startedAt: serverTimestamp() },
    ...withEvent(match, newEvent(match, "resume")),
  });

export const finishMatch = (match) =>
  update(match, {
    status: "finished",
    clock: { running: false, base: clockSeconds(match), startedAt: null },
    ...withEvent(match, newEvent(match, "end")),
  });

// o increment e o arrayUnion juntam as mudanças no servidor: dois organizadores marcando ao mesmo tempo não se atropelam
export const addScore = (match, side, points) =>
  update(match, {
    [`score${side}`]: increment(points),
    ...withEvent(match, newEvent(match, "score", { side, points })),
  });

// desfaz o último ponto daquele lado (e tira o lance dele da lista)
export function undoScore(match, side) {
  const last = [...match.events].reverse().find((event) => event.type === "score" && event.side === side);
  const points = Math.min(last?.points ?? 1, match[`score${side}`]);
  if (points <= 0) return Promise.resolve();
  return update(match, {
    [`score${side}`]: increment(-points),
    ...(last ? { events: arrayRemove(last) } : {}),
  });
}

export const addHighlight = (match, side, type) =>
  update(match, withEvent(match, newEvent(match, type, { side })));

/* ---------- salas e pontos extras ---------- */

// devolve a função que para de escutar; onChange recebe { "1A": { label, name, emoji, color }, ... }
export function watchTeams(onChange) {
  return onSnapshot(
    teamsRef,
    (snapshot) => onChange(snapshot.data()?.teams || {}),
    () => {}
  );
}

export const saveTeam = (id, { label, name, emoji, color }) =>
  setDoc(
    teamsRef,
    { teams: { [id]: { label, name, emoji, color } }, updatedAt: serverTimestamp() },
    { merge: true }
  );

// volta a sala para o nome, o bicho e a cor de data/jes.js
export const resetTeam = (id) =>
  updateDoc(teamsRef, { [`teams.${id}`]: deleteField(), updatedAt: serverTimestamp() });

export function watchBonuses(onChange) {
  return onSnapshot(
    pointsRef,
    (snapshot) =>
      onChange(
        snapshot.docs.map((item) => {
          const data = item.data({ serverTimestamps: "estimate" });
          return { id: item.id, ...data, createdAt: data.createdAt?.toMillis?.() ?? 0 };
        })
      ),
    () => {}
  );
}

export const addBonus = ({ division, team, points, reason, sport }) =>
  addDoc(pointsRef, { division, team, points, reason, sport, createdAt: serverTimestamp() });

export const deleteBonus = (id) => deleteDoc(doc(db, "jesPoints", id));

/* ---------- organizadores ---------- */

export async function isStaff(uid) {
  try {
    return (await getDoc(staffRef(uid))).exists();
  } catch (error) {
    return false;
  }
}

export const joinStaff = (uid, name, code) =>
  setDoc(staffRef(uid), { name, code: normalizeCode(code), since: serverTimestamp() });

export const leaveStaff = (uid) => deleteDoc(staffRef(uid));
