// Salas do jogo Quem Chutou Longe?, no Firestore: guessRooms/{CÓDIGO}.
// Cada pergunta tem três fases:
//   answer  todo mundo chuta um número (os chutes ficam em "answers", pelo id de cada jogador)
//   vote    aparecem a resposta certa e os chutes, sem os nomes; cada um vota em quem acha que deu o
//           chute mais longe da resposta (os votos ficam em "votes")
//   reveal  mostra quem foi, quem descobriu e os pontos; o dono da sala passa para a próxima pergunta
// Pontos: cada detetive que descobre quem chutou mais longe ganha FIND_POINTS. Quem chutou mais longe
// ganha ESCAPE_POINTS se escapar (menos da metade dos detetives que votaram descobriu) e nada se for
// descoberto. Toda mudança é uma transação, como nas salas do jogo de países.
// Os chutes ficam no documento da sala, que todo mundo da sala lê: dá para esconder na tela, não de quem
// fuçar a rede (para esconder de verdade precisaria de um servidor).
import { deleteField, doc, onSnapshot, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "./firebase";
import { BOT_AVATAR } from "../data/avatars";
import { GUESS_QUESTIONS } from "../data/guessQuestions";
import { RoomError, STALE, newRoomCode, nextSeat, seatsOf, stamp } from "./rooms";

export { RoomError, normalizeRoomCode, seatsOf } from "./rooms";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;
export const ROUND_OPTIONS = [3, 5, 7];
export const ANSWER_TIME = 40000;
export const VOTE_TIME = 30000;
export const FIND_POINTS = 1;
export const ESCAPE_POINTS = 2;
export const MAX_GUESS = 999999999;

const BOTS = [
  { id: "bot1", name: "Bip" },
  { id: "bot2", name: "Bip Jr." },
  { id: "bot3", name: "Bipinha" },
];

const roomRef = (code) => doc(db, "guessRooms", code);

export const questionOf = (room) => GUESS_QUESTIONS[room.question] ?? null;

const distance = (room, id) => Math.abs(room.answers[id] - questionOf(room).answer);

// quem deu o chute mais longe (pode ser mais de um, se empatar)
export function farthest(room) {
  const ids = Object.keys(room.answers);
  if (ids.length === 0) return [];
  const max = Math.max(...ids.map((id) => distance(room, id)));
  return ids.filter((id) => distance(room, id) === max);
}

function toRoom(snapshot) {
  if (!snapshot.exists()) return null;
  const data = snapshot.data({ serverTimestamps: "estimate" });
  return { ...data, phaseAt: data.phaseAt?.toMillis?.() ?? null, updatedAt: data.updatedAt?.toMillis?.() ?? null };
}

// onChange(sala ou null, aindaSóNoAparelho); devolve a função que para de escutar
export function watchRoom(code, onChange, onError) {
  return onSnapshot(
    roomRef(code),
    (snapshot) => onChange(toRoom(snapshot), snapshot.metadata.hasPendingWrites),
    onError
  );
}

const newPlayer = (user, seat) => ({
  name: user.name.slice(0, 24),
  avatar: user.avatar,
  seat,
  score: 0,
  bot: false,
});

function pickQuestion(asked) {
  const free = GUESS_QUESTIONS.map((_, index) => index).filter((index) => !asked.includes(index));
  return free[Math.floor(Math.random() * free.length)];
}

// Muda a sala dentro de uma transação; change(sala) devolve as mudanças (ou nada, para não mexer).
// Quando várias pessoas chutam ou votam juntas, o Firestore recusa as escritas que chegaram atrasadas
// e a transação tenta de novo (mais vezes que o normal, porque a sala pode ter 8 pessoas).
function changeRoom(code, change) {
  return runTransaction(
    db,
    async (transaction) => {
      const snapshot = await transaction.get(roomRef(code));
      if (!snapshot.exists()) return false;
      const changes = change(snapshot.data());
      if (!changes) return false;
      transaction.update(roomRef(code), stamp(changes));
      return true;
    },
    { maxAttempts: 10 }
  );
}

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
          rounds: 5,
          round: 0,
          question: null,
          asked: [],
          players: { [user.id]: newPlayer(user, 0) },
          answers: {},
          votes: {},
          phaseAt: null,
          result: null,
          game: 0,
          winners: [],
        })
      );
      return true;
    });
    if (created) return code;
  }
  throw new RoomError("Não deu para criar a sala agora. Tente de novo.");
}

export function joinRoom(code, user) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef(code));
    if (!snapshot.exists()) throw new RoomError("Não achei essa sala. Confira as 4 letras do código!");
    const room = snapshot.data();
    if (room.players[user.id]) return;
    if (!["lobby", "over"].includes(room.status))
      throw new RoomError("Essa partida já começou. Espere acabar e entre de novo!");
    if (Object.keys(room.players).length >= MAX_PLAYERS) throw new RoomError("A sala está cheia (8 jogadores).");
    transaction.update(roomRef(code), stamp({ [`players.${user.id}`]: newPlayer(user, nextSeat(room.players)) }));
  });
}

// Sai da sala. Se o dono sai, outra pessoa vira dona; sem ninguém de verdade, a sala é apagada.
// No meio da partida o chute e o voto de quem saiu somem (e, se sobrar uma pessoa só, a partida acaba).
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
    const answers = { ...room.answers };
    const votes = { ...room.votes };
    delete answers[uid];
    delete votes[uid];
    const changes = { players, answers, votes, host: room.host === uid ? humans[0][0] : room.host };
    const rest = { ...room, ...changes };
    if (["answer", "vote", "reveal"].includes(room.status) && Object.keys(players).length < 2) {
      Object.assign(changes, finishGame(players));
    } else if (room.status === "answer" && everyone(rest, "answers")) {
      // quem saiu era o único que faltava chutar (ou votar): a partida segue sem esperar o tempo
      Object.assign(changes, closeAnswers(rest));
    } else if (room.status === "vote" && everyone(rest, "votes")) {
      Object.assign(changes, closeVotes(rest));
    }
    transaction.update(roomRef(code), stamp(changes));
  });
}

export const setRounds = (code, rounds) => updateDoc(roomRef(code), stamp({ rounds }));

export const removePlayer = (code, id) => updateDoc(roomRef(code), stamp({ [`players.${id}`]: deleteField() }));

// chama um Bip para jogar (quem chuta e vota por ele é o aparelho do dono da sala)
export function addBot(code) {
  return changeRoom(code, (room) => {
    const bot = BOTS.find((item) => !room.players[item.id]);
    if (!bot || Object.keys(room.players).length >= MAX_PLAYERS)
      throw new RoomError("Não cabe mais nenhum Bip na sala.");
    return {
      [`players.${bot.id}`]: {
        name: bot.name,
        avatar: BOT_AVATAR.id,
        seat: nextSeat(room.players),
        score: 0,
        bot: true,
      },
    };
  });
}

const askQuestion = (asked) => {
  const question = pickQuestion(asked);
  return {
    status: "answer",
    question,
    asked: [...asked, question],
    answers: {},
    votes: {},
    result: null,
    phaseAt: serverTimestamp(),
  };
};

function finishGame(players) {
  const best = Math.max(...Object.values(players).map((player) => player.score));
  return {
    status: "over",
    phaseAt: null,
    winners: Object.keys(players).filter((id) => players[id].score === best),
  };
}

// começa (ou recomeça) a partida: todo mundo com 0 pontos e a primeira pergunta sorteada
export function startGame(code) {
  return changeRoom(code, (room) => {
    if (Object.keys(room.players).length < MIN_PLAYERS)
      throw new RoomError("Precisa de pelo menos 3 jogadores. Chame os amigos ou os Bips!");
    const players = Object.fromEntries(
      Object.entries(room.players).map(([id, player]) => [id, { ...player, score: 0 }])
    );
    return { ...askQuestion([]), players, round: 1, game: (room.game || 0) + 1, winners: [] };
  });
}

// Fim dos chutes: vai para a votação. Sem graça votar quando quase ninguém chutou ou quando todo mundo
// ficou à mesma distância: nesses casos a pergunta já vai direto para o resultado.
function closeAnswers(room) {
  const answered = Object.keys(room.answers);
  const far = farthest(room);
  if (answered.length < 2) {
    return {
      status: "reveal",
      phaseAt: null,
      result: { right: questionOf(room).answer, skipped: "few", far: [], gains: {} },
    };
  }
  if (far.length === answered.length) {
    // todos acertaram em cheio ganham ponto; todos igualmente longe, ninguém ganha
    const exact = distance(room, far[0]) === 0;
    const gains = exact ? Object.fromEntries(answered.map((id) => [id, FIND_POINTS])) : {};
    return {
      status: "reveal",
      phaseAt: null,
      players: addGains(room.players, gains),
      result: { right: questionOf(room).answer, skipped: exact ? "exact" : "tie", far: [], gains },
    };
  }
  return { status: "vote", votes: {}, phaseAt: serverTimestamp() };
}

const addGains = (players, gains) =>
  Object.fromEntries(
    Object.entries(players).map(([id, player]) => [id, { ...player, score: player.score + (gains[id] || 0) }])
  );

// Fim da votação: confere quem descobriu e se quem chutou mais longe escapou.
function closeVotes(room) {
  const far = farthest(room);
  const detectives = Object.keys(room.players).filter((id) => !far.includes(id));
  const voted = detectives.filter((id) => room.votes[id]);
  const gains = {};
  voted.forEach((id) => {
    if (far.includes(room.votes[id])) gains[id] = FIND_POINTS;
  });
  const found = {};
  const escaped = [];
  far.forEach((id) => {
    found[id] = voted.filter((voter) => room.votes[voter] === id).length;
    if (found[id] * 2 < Math.max(voted.length, 1)) {
      escaped.push(id);
      gains[id] = ESCAPE_POINTS;
    }
  });
  return {
    status: "reveal",
    phaseAt: null,
    players: addGains(room.players, gains),
    result: { right: questionOf(room).answer, far, found, escaped, voters: voted.length, gains },
  };
}

const everyone = (room, field) => Object.keys(room.players).every((id) => room[field][id] !== undefined);

// Chute de um jogador (ou de um Bip, mandado pelo dono da sala). Quando o último chuta, já abre a votação.
export function submitAnswer(code, by, value) {
  return changeRoom(code, (room) => {
    if (room.status !== "answer" || !room.players[by] || room.answers[by] !== undefined) return null;
    const next = { ...room, answers: { ...room.answers, [by]: value } };
    return everyone(next, "answers") ? { answers: next.answers, ...closeAnswers(next) } : { [`answers.${by}`]: value };
  });
}

// Voto de um jogador: em quem ele acha que deu o chute mais longe. Quando o último vota, mostra o resultado.
export function submitVote(code, by, target) {
  return changeRoom(code, (room) => {
    if (room.status !== "vote" || !room.players[by] || room.votes[by] || target === by) return null;
    if (room.answers[target] === undefined) return null;
    const next = { ...room, votes: { ...room.votes, [by]: target } };
    return everyone(next, "votes") ? { votes: next.votes, ...closeVotes(next) } : { [`votes.${by}`]: target };
  });
}

// O tempo da fase acabou. phaseAt confere que ainda é a mesma fase, para não fechar duas vezes.
export function closePhase(code, status, phaseAt) {
  return changeRoom(code, (room) => {
    if (room.status !== status || room.phaseAt?.toMillis?.() !== phaseAt) return null;
    return status === "answer" ? closeAnswers(room) : closeVotes(room);
  });
}

// o dono da sala passa para a próxima pergunta (ou para o placar final, depois da última)
export function nextRound(code) {
  return changeRoom(code, (room) => {
    if (room.status !== "reveal") return null;
    if (room.round >= room.rounds) return finishGame(room.players);
    return { ...askQuestion(room.asked), round: room.round + 1 };
  });
}

// ---------- os Bips ----------

// chute do Bip: quase sempre perto da resposta, mas de vez em quando ele viaja
export function botGuess(answer) {
  const factor = Math.random() < 0.25 ? 0.1 + Math.random() * 4 : 0.75 + Math.random() * 0.5;
  return Math.min(MAX_GUESS, Math.max(0, Math.round(answer * factor)));
}

// voto do Bip: muitas vezes ele descobre quem chutou mais longe; se foi ele mesmo, disfarça
export function botVote(room, bot) {
  const far = farthest(room);
  const options = Object.keys(room.answers).filter((id) => id !== bot);
  const smart = !far.includes(bot) && Math.random() < 0.6;
  const choices = smart ? far : options;
  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}
