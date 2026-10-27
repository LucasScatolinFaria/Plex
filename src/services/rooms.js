// Peças comuns das salas online (Países do Mundo e Quem Chutou Longe?): código de 4 letras fáceis de
// falar (ex.: BOLA), erro com mensagem para a tela, a ordem das cadeiras e os prazos da sala.
import { Timestamp, serverTimestamp } from "firebase/firestore";

import { track } from "./analytics";

// sala parada há mais tempo que isso pode ser reaproveitada com o mesmo código (as regras do Firestore
// usam o mesmo prazo em staleRoom)
export const STALE = 3 * 60 * 60 * 1000;

// Sala sem nenhuma mudança por um dia some sozinha: a política de TTL do Firestore (fieldOverrides do
// firestore.indexes.json) apaga o documento depois do expiresAt, e o banco não acumula salas abandonadas.
// O apagamento não é na hora (o Firestore leva até um dia), por isso o STALE continua valendo.
const ROOM_TTL = 24 * 60 * 60 * 1000;

// Quando só o dono da sala pode agir (ex.: passar para a próxima pergunta) e ele não age nesse tempo, a
// sala considera que ele sumiu (fechou o app, ficou sem internet) e outra pessoa pode seguir no lugar dele.
export const HOST_AWAY = 30000;

const CONSONANTS = "BCDFGJLMNPRSTVZ";
const VOWELS = "AEIOU";
const letter = (letters) => letters[Math.floor(Math.random() * letters.length)];

export const newRoomCode = () => letter(CONSONANTS) + letter(VOWELS) + letter(CONSONANTS) + letter(VOWELS);

// toda escrita na sala passa por aqui: marca a hora (do servidor) e empurra o prazo do TTL
export const stamp = (changes) => ({
  ...changes,
  updatedAt: serverTimestamp(),
  expiresAt: Timestamp.fromMillis(Date.now() + ROOM_TTL),
});

// erro com mensagem para mostrar na tela
export class RoomError extends Error {}

export const normalizeRoomCode = (text) =>
  text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 4);

export const seatsOf = (players) => Object.entries(players).sort((a, b) => a[1].seat - b[1].seat);

export const nextSeat = (players) => Math.max(-1, ...Object.values(players).map((player) => player.seat)) + 1;

// métrica de entrada nas salas (join_group é o evento recomendado do Google Analytics para grupos)
export const trackJoin = (game, code, created) => track("join_group", { group_id: code, game, created });
