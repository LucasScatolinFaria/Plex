// Peças comuns das salas online (Países do Mundo e Quem Chutou Longe?): código de 4 letras fáceis de
// falar (ex.: BOLA), erro com mensagem para a tela e a ordem das cadeiras.
import { serverTimestamp } from "firebase/firestore";

// sala parada há mais tempo que isso pode ser reaproveitada com o mesmo código (as regras do Firestore
// usam o mesmo prazo em staleRoom)
export const STALE = 3 * 60 * 60 * 1000;

const CONSONANTS = "BCDFGJLMNPRSTVZ";
const VOWELS = "AEIOU";
const letter = (letters) => letters[Math.floor(Math.random() * letters.length)];

export const newRoomCode = () => letter(CONSONANTS) + letter(VOWELS) + letter(CONSONANTS) + letter(VOWELS);

export const stamp = (changes) => ({ ...changes, updatedAt: serverTimestamp() });

// erro com mensagem para mostrar na tela
export class RoomError extends Error {}

export const normalizeRoomCode = (text) =>
  text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 4);

export const seatsOf = (players) => Object.entries(players).sort((a, b) => a[1].seat - b[1].seat);

export const nextSeat = (players) => Math.max(-1, ...Object.values(players).map((player) => player.seat)) + 1;
