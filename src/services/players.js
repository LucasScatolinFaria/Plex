// Progresso e ranking dos jogadores no Firestore (contas e visitantes):
//   progress/{uid}  progresso completo (estrelas, recordes, conquistas); só o dono lê e altera
//   ranking/{uid}   o que aparece no ranking: nome, avatar, estrelas e XP. Visitante só vê visitantes e
//                   quem tem conta só vê quem tem conta (as regras do firestore.rules garantem isso).
// O aparelho guarda uma cópia do progresso para o app funcionar sem internet.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { loadJSON, saveJSON } from "./storage";
import { normalizeProgress, totalStars } from "../utils/progress";

export const RANKING_SIZE = 50;

const progressKey = (uid) => `progress:${uid}`;
const progressRef = (uid) => doc(db, "progress", uid);
const rankingRef = (uid) => doc(db, "ranking", uid);

export async function loadLocalProgress(uid) {
  return normalizeProgress(await loadJSON(progressKey(uid)));
}

// Não espera o Firestore responder: sem internet ele envia quando a conexão voltar.
export function saveProgress(uid, progress) {
  setDoc(progressRef(uid), { ...progress, updatedAt: serverTimestamp() }).catch(() => {});
  return saveJSON(progressKey(uid), progress);
}

// Confere o progresso guardado no Firestore e devolve o que deve valer: o que tiver mais XP.
// Outro aparelho pode estar na frente (a pessoa jogou em outro lugar) ou este aparelho pode ter jogado
// sem internet; nesse caso é o Firestore que recebe a cópia daqui.
export async function syncProgress(uid, local) {
  let snapshot;
  try {
    snapshot = await getDoc(progressRef(uid));
  } catch (error) {
    return local;
  }

  if (snapshot.exists()) {
    const { updatedAt, ...saved } = snapshot.data();
    const remote = normalizeProgress(saved);
    if (remote.xp >= local.xp) {
      await saveJSON(progressKey(uid), remote);
      return remote;
    }
  }
  if (local.plays > 0) saveProgress(uid, local);
  return local;
}

// o que já foi enviado ao ranking, para não repetir a mesma escrita a cada mudança de tela
const published = {};

export function publishRanking(user, progress) {
  const entry = {
    name: user.name,
    avatar: user.avatar,
    guest: !!user.guest,
    stars: totalStars(progress),
    xp: progress.xp,
  };
  const key = JSON.stringify(entry);
  if (published[user.id] === key) return;
  published[user.id] = key;
  setDoc(rankingRef(user.id), { ...entry, updatedAt: serverTimestamp() }).catch(() => {
    delete published[user.id];
  });
}

export async function fetchRanking(guest) {
  const snapshot = await getDocs(
    query(
      collection(db, "ranking"),
      where("guest", "==", guest),
      orderBy("stars", "desc"),
      orderBy("xp", "desc"),
      limit(RANKING_SIZE)
    )
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
