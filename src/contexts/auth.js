import { createContext, useEffect, useState } from "react";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  linkWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as signOutOfFirebase,
} from "firebase/auth";
import { disableNetwork, doc, enableNetwork, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { AVATARS, GUEST_AVATAR } from "../data/avatars";
import { auth, db } from "../services/firebase";
import { loadJSON, saveJSON } from "../services/storage";

export const AuthContext = createContext({});

// As contas ficam no Firebase: o Authentication cuida do login e o Firestore guarda o perfil de cada
// jogador em users/{uid}. O visitante também entra no Firebase, como conta anônima (sem e-mail e presa
// a este aparelho), com nome e avatar para aparecer no ranking dos visitantes.
const AUTH_ERRORS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail.",
  "auth/credential-already-in-use": "Já existe uma conta com esse e-mail.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Espere um pouquinho e tente de novo.",
  "auth/network-request-failed": "Sem conexão com a internet. Confira e tente de novo.",
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const profileRef = (uid) => doc(db, "users", uid);

const toUser = (account, { name, avatar }) => ({
  id: account.uid,
  name,
  email: account.email,
  avatar,
  guest: account.isAnonymous,
});

// troca os códigos de erro do Firebase por mensagens que dá para mostrar na tela
async function withAuthErrors(request) {
  try {
    return await request;
  } catch (error) {
    throw new Error(AUTH_ERRORS[error.code] || "Não deu certo agora. Tente de novo.");
  }
}

// cria o perfil em users/{uid} ou atualiza o que já existe (o visitante que vira conta já tem um)
async function writeProfile(account, { name, avatar }) {
  const ref = profileRef(account.uid);
  if ((await getDoc(ref)).exists()) {
    await updateDoc(ref, { name, email: account.email, avatar });
  } else {
    await setDoc(ref, { name, email: account.email, avatar, createdAt: serverTimestamp() });
  }
}

// Cópia dos perfis que já entraram neste aparelho, para o app abrir mesmo sem internet.
async function rememberProfile({ id, name, avatar }) {
  const profiles = await loadJSON("profiles", {});
  await saveJSON("profiles", { ...profiles, [id]: { id, name, avatar } });
}

// Perfil vindo do Firestore. Sem internet, fica a cópia deste aparelho; se a conta ainda não tem
// perfil (ex.: foi criada direto no console do Firebase), nasce um perfil básico.
async function loadProfile(account) {
  const saved = (await loadJSON("profiles", {}))[account.uid];
  let profile =
    saved ||
    (account.isAnonymous
      ? { name: "Visitante", avatar: GUEST_AVATAR.id }
      : { name: account.email.split("@")[0].slice(0, 30), avatar: AVATARS[0].id });
  try {
    const snapshot = await getDoc(profileRef(account.uid));
    if (snapshot.exists()) profile = snapshot.data();
    else await writeProfile(account, profile);
  } catch (error) {}

  const user = toUser(account, profile);
  await rememberProfile(user);
  return user;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      // o Firebase lembra quem estava conectado neste aparelho (conta ou visitante)
      await auth.authStateReady();
      if (auth.currentUser) setUser(await loadProfile(auth.currentUser));
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function signIn(email, password) {
    const { user: account } = await withAuthErrors(
      signInWithEmailAndPassword(auth, normalizeEmail(email), password)
    );
    setUser(await loadProfile(account));
  }

  // Quem está jogando como visitante e cria a conta continua com o mesmo id: o e-mail e a senha são
  // ligados à conta anônima, e o progresso e a linha do ranking vão junto.
  async function signUp({ name, email, password, avatar }) {
    const visitor = auth.currentUser?.isAnonymous ? auth.currentUser : null;
    const { user: account } = await withAuthErrors(
      visitor
        ? linkWithCredential(visitor, EmailAuthProvider.credential(normalizeEmail(email), password))
        : createUserWithEmailAndPassword(auth, normalizeEmail(email), password)
    );

    if (visitor) {
      // as conexões abertas do Firestore ainda usam o token de visitante (sem e-mail):
      // reconecta para as regras já enxergarem a conta nova
      await account.getIdToken(true);
      await disableNetwork(db);
      await enableNetwork(db);
    }

    const profile = toUser(account, { name: name.trim(), avatar });
    try {
      await writeProfile(account, profile);
    } catch (error) {
      // conta nova sem perfil fica pela metade: desfaz para dar para tentar de novo com o mesmo e-mail
      if (!visitor) await deleteUser(account).catch(() => signOutOfFirebase(auth));
      throw new Error("Não foi possível salvar a conta agora. Tente de novo.");
    }

    await rememberProfile(profile);
    setUser(profile);
  }

  async function signInAsGuest({ name, avatar }) {
    const { user: account } = await withAuthErrors(signInAnonymously(auth));
    const profile = toUser(account, { name: name.trim(), avatar });
    await withAuthErrors(writeProfile(account, profile));
    await rememberProfile(profile);
    setUser(profile);
  }

  async function signOut() {
    await signOutOfFirebase(auth);
    setUser(null);
  }

  async function updateProfile(changes) {
    if (!user || user.guest) return;
    const next = { ...user, ...changes };
    setUser(next);
    await rememberProfile(next);
    // não espera a resposta do Firestore: sem internet ele envia a mudança quando a conexão voltar
    updateDoc(profileRef(user.id), changes).catch(() => {});
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
