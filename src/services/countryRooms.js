// Salas do jogo Países do Mundo online ("batata quente dos países"), no Firestore:
//   countryRooms/{CÓDIGO}  quem está na sala, de quem é a vez, os países já ditos e as vidas.
// O código tem 4 letras fáceis de falar (ex.: BOLA). Toda mudança é uma transação: dois jogadores
// mexendo ao mesmo tempo não se atropelam. Sala abandonada há mais de 3 horas pode ser reaproveitada.
// resetUsed (o dono escolhe): quando a batata queima, os países ditos voltam a valer (true, o padrão)
// ou continuam fora até o fim da partida (false).
import { deleteField, doc, onSnapshot, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "./firebase";
import { BOT_AVATAR } from "../data/avatars";
import { RoomError, STALE, newRoomCode, nextSeat, seatsOf, stamp, trackJoin } from "./rooms";

export { RoomError, normalizeRoomCode, seatsOf } from "./rooms";

export const LIVES = 3;
export const MAX_PLAYERS = 8;

export const SPEEDS = [
  { id: 20, label: "Tranquilo", emoji: "🐢" },
  { id: 14, label: "Rápido", emoji: "🐇" },
  { id: 9, label: "Turbo", emoji: "🚀" },
];

const BOTS = [
  { id: "bot1", name: "Bip" },
  { id: "bot2", name: "Bip Jr." },
  { id: "bot3", name: "Bipinha" },
];

const LOG_SIZE = 30;

const roomRef = (code) => doc(db, "countryRooms", code);

function toRoom(snapshot) {
  if (!snapshot.exists()) return null;
  const data = snapshot.data({ serverTimestamps: "estimate" });
  return { ...data, turnAt: data.turnAt?.toMillis?.() ?? null, updatedAt: data.updatedAt?.toMillis?.() ?? null };
}

// onChange(sala ou null, aindaSóNoAparelho); devolve a função que para de escutar
export function watchRoom(code, onChange, onError) {
  return onSnapshot(
    roomRef(code),
    (snapshot) => onChange(toRoom(snapshot), snapshot.metadata.hasPendingWrites),
    onError
  );
}

// próximo jogador com vida depois de "from", na ordem das cadeiras da roda
export function nextAlive(players, from) {
  const seats = seatsOf(players);
  const index = seats.findIndex(([id]) => id === from);
  for (let step = 1; step <= seats.length; step++) {
    const [id, player] = seats[(index + step) % seats.length];
    if (player.lives > 0 && id !== from) return id;
  }
  return null;
}

const newPlayer = (user, seat) => ({
  name: user.name.slice(0, 24),
  avatar: user.avatar,
  seat,
  lives: LIVES,
  bot: false,
});

export async function createRoom(user) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = newRoomCode();
    const created = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef(code));
      const old = snapshot.exists() ? snapshot.data() : null;
      if (old && Date.now() - (old.updatedAt?.toMillis?.() ?? 0) < STALE) return false;
      transaction.set(
        roomRef(code),
        stamp({
          code,
          host: user.id,
          status: "lobby",
          speed: 14,
          resetUsed: true,
          players: { [user.id]: newPlayer(user, 0) },
          turn: null,
          turnAt: null,
          round: 0,
          game: 0,
          used: [],
          log: [],
          out: [],
          winner: null,
          lastType: "lobby",
        })
      );
      return true;
    });
    if (created) {
      trackJoin("paises", code, true);
      return code;
    }
  }
  throw new RoomError("Não deu para criar a sala agora. Tente de novo.");
}

export async function joinRoom(code, user) {
  const joined = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef(code));
    if (!snapshot.exists()) throw new RoomError("Não achei essa sala. Confira as 4 letras do código!");
    const room = snapshot.data();
    if (room.players[user.id]) return false;
    if (room.status === "playing") throw new RoomError("Essa partida já começou. Espere acabar e entre de novo!");
    if (Object.keys(room.players).length >= MAX_PLAYERS) throw new RoomError("A sala está cheia (8 jogadores).");
    transaction.update(roomRef(code), stamp({ [`players.${user.id}`]: newPlayer(user, nextSeat(room.players)) }));
    return true;
  });
  if (joined) trackJoin("paises", code, false);
}

// Sai da sala. Se o dono sai, outra pessoa vira dona; sem ninguém de verdade, a sala é apagada.
// No meio da partida a vez passa adiante (e, se sobrar um só, ele ganha).
export function leaveRoom(code, uid) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef(code));
    if (!snapshot.exists()) return;
    const room = snapshot.data();
    if (!room.players[uid]) return;
    const players = { ...room.players };
    delete players[uid];
    const humans = seatsOf(players).filter(([, player]) => !player.bot);
    if (humans.length === 0) {
      transaction.delete(roomRef(code));
      return;
    }
    const changes = { players, host: room.host === uid ? humans[0][0] : room.host };
    if (room.status === "playing") {
      const alive = Object.entries(players).filter(([, player]) => player.lives > 0);
      if (alive.length <= 1) {
        Object.assign(changes, { status: "over", winner: alive[0]?.[0] ?? null, turn: null, lastType: "over" });
      } else if (room.turn === uid) {
        Object.assign(changes, {
          turn: nextAlive(room.players, uid),
          turnAt: serverTimestamp(),
          lastType: "pass",
        });
      }
    }
    transaction.update(roomRef(code), stamp(changes));
  });
}

export const setSpeed = (code, speed) => updateDoc(roomRef(code), stamp({ speed }));

export const setResetUsed = (code, resetUsed) => updateDoc(roomRef(code), stamp({ resetUsed }));

// salas criadas antes da opção existir não têm o campo: nelas os países sempre voltavam a valer
export const resetsUsed = (room) => room.resetUsed !== false;

export const removePlayer = (code, id) => updateDoc(roomRef(code), stamp({ [`players.${id}`]: deleteField() }));

// chama um Bip para jogar (quem controla as jogadas dele é o aparelho do dono da sala)
export function addBot(code) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef(code));
    if (!snapshot.exists()) return;
    const room = snapshot.data();
    const bot = BOTS.find((item) => !room.players[item.id]);
    if (!bot || Object.keys(room.players).length >= MAX_PLAYERS)
      throw new RoomError("Não cabe mais nenhum Bip na sala.");
    transaction.update(
      roomRef(code),
      stamp({
        [`players.${bot.id}`]: {
          name: bot.name,
          avatar: BOT_AVATAR.id,
          seat: nextSeat(room.players),
          lives: LIVES,
          bot: true,
        },
      })
    );
  });
}

// começa (ou recomeça) a partida: todo mundo com 3 vidas e a batata com alguém sorteado
export function startGame(code) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef(code));
    if (!snapshot.exists()) return;
    const room = snapshot.data();
    const ids = Object.keys(room.players);
    if (ids.length < 2) throw new RoomError("Precisa de pelo menos 2 jogadores. Chame um amigo ou o Bip!");
    const players = Object.fromEntries(
      Object.entries(room.players).map(([id, player]) => [id, { ...player, lives: LIVES }])
    );
    transaction.update(
      roomRef(code),
      stamp({
        status: "playing",
        players,
        turn: ids[Math.floor(Math.random() * ids.length)],
        turnAt: serverTimestamp(),
        round: 1,
        game: (room.game || 0) + 1,
        used: [],
        log: [{ type: "start", round: 1 }],
        out: [],
        winner: null,
        lastType: "start",
      })
    );
  });
}

// Quem está com a batata disse um país. Devolve "ok", "used" (já foi dito nesta rodada) ou "late" (não é mais a vez).
export function answerTurn(code, by, countryId) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef(code));
    if (!snapshot.exists()) return "late";
    const room = snapshot.data();
    if (room.status !== "playing" || room.turn !== by) return "late";
    if (room.used.includes(countryId)) return "used";
    transaction.update(
      roomRef(code),
      stamp({
        used: [...room.used, countryId],
        log: [...room.log, { type: "ok", by, id: countryId, round: room.round }].slice(-LOG_SIZE),
        turn: nextAlive(room.players, by),
        turnAt: serverTimestamp(),
        lastType: "ok",
      })
    );
    return "ok";
  });
}

// O tempo acabou e a batata queimou na mão de quem estava com ela: perde uma vida e começa outra rodada
// (com os países liberados de novo, se a sala usa essa regra). turnAt confere que ainda é a mesma vez,
// para não queimar duas vezes.
export function burnTurn(code, turn, turnAt) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef(code));
    if (!snapshot.exists()) return false;
    const room = snapshot.data();
    if (room.status !== "playing" || room.turn !== turn || room.turnAt?.toMillis?.() !== turnAt) return false;
    const burned = { ...room.players[turn], lives: room.players[turn].lives - 1 };
    const players = { ...room.players, [turn]: burned };
    const out = burned.lives === 0 ? [...room.out, turn] : room.out;
    const log = [...room.log, { type: "burn", by: turn, round: room.round, out: burned.lives === 0 }].slice(
      -LOG_SIZE
    );
    const alive = Object.entries(players).filter(([, player]) => player.lives > 0);
    if (alive.length <= 1) {
      transaction.update(
        roomRef(code),
        stamp({ players, out, log, status: "over", winner: alive[0]?.[0] ?? null, turn: null, lastType: "burn" })
      );
    } else {
      transaction.update(
        roomRef(code),
        stamp({
          players,
          out,
          log,
          round: room.round + 1,
          used: resetsUsed(room) ? [] : room.used,
          turn: nextAlive(players, turn),
          turnAt: serverTimestamp(),
          lastType: "burn",
        })
      );
    }
    return true;
  });
}
