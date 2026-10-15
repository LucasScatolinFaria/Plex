import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut as signOutOfFirebase,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { AVATARS, GUEST_AVATAR } from "../data/avatars";
import { auth, db } from "../services/firebase";
import { loadJSON, removeKey, saveJSON } from "../services/storage";

export const AuthContext = createContext({});

// As contas ficam no Firebase: o Authentication cuida do e-mail e da senha, e o Firestore guarda o perfil
// de cada jogador em users/{uid}. O visitante continua existindo só neste aparelho.
const GUEST = { id: "guest", name: "Visitante", email: null, avatar: GUEST_AVATAR.id, guest: true };

const AUTH_ERRORS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Espere um pouquinho e tente de novo.",
  "auth/network-request-failed": "Sem conexão com a internet. Confira e tente de novo.",
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const profileRef = (uid) => doc(db, "users", uid);

const profileData = (account, { name, avatar }) => ({
  name,
  email: account.email,
  avatar,
  createdAt: serverTimestamp(),
});

// troca os códigos de erro do Firebase por mensagens que dá para mostrar na tela
async function withAuthErrors(request) {
  try {
    return await request;
  } catch (error) {
    throw new Error(AUTH_ERRORS[error.code] || "Não deu certo agora. Tente de novo.");
  }
}

// Cópia dos perfis que já entraram neste aparelho: alimenta o ranking e deixa o app abrir sem internet.
async function rememberProfile({ id, name, avatar }) {
  const profiles = await loadJSON("profiles", {});
  await saveJSON("profiles", { ...profiles, [id]: { id, name, avatar } });
}

// Perfil vindo do Firestore. Sem internet, fica a cópia deste aparelho; se a conta ainda não tem
// perfil (ex.: foi criada direto no console do Firebase), nasce um perfil básico.
async function loadProfile(account) {
  const saved = (await loadJSON("profiles", {}))[account.uid];
  let profile = saved || { name: account.email.split("@")[0].slice(0, 30), avatar: AVATARS[0].id };
  try {
    const snapshot = await getDoc(profileRef(account.uid));
    if (snapshot.exists()) profile = snapshot.data();
    else await setDoc(profileRef(account.uid), profileData(account, profile));
  } catch (error) {}

  const user = { id: account.uid, name: profile.name, email: account.email, avatar: profile.avatar };
  await rememberProfile(user);
  return user;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // true quando o visitante pediu para criar uma conta e levar o progresso junto
  const [guestUpgrade, setGuestUpgrade] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      if ((await loadJSON("session")) === GUEST.id) {
        setUser(GUEST);
      } else {
        // o Firebase lembra quem estava conectado neste aparelho
        await auth.authStateReady();
        if (auth.currentUser) setUser(await loadProfile(auth.currentUser));
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function signIn(email, password) {
    const { user: account } = await withAuthErrors(
      signInWithEmailAndPassword(auth, normalizeEmail(email), password)
    );
    setGuestUpgrade(false);
    setUser(await loadProfile(account));
  }

  async function signUp({ name, email, password, avatar }) {
    const { user: account } = await withAuthErrors(
      createUserWithEmailAndPassword(auth, normalizeEmail(email), password)
    );
    const profile = { id: account.uid, name: name.trim(), email: account.email, avatar };

    try {
      await setDoc(profileRef(account.uid), profileData(account, profile));
    } catch (error) {
      // conta sem perfil fica pela metade: desfaz para dar para tentar de novo com o mesmo e-mail
      await deleteUser(account).catch(() => signOutOfFirebase(auth));
      throw new Error("Não foi possível salvar a conta agora. Tente de novo.");
    }

    if (guestUpgrade) {
      const guestProgress = await loadJSON(`progress:${GUEST.id}`);
      if (guestProgress) {
        await saveJSON(`progress:${account.uid}`, guestProgress);
        await removeKey(`progress:${GUEST.id}`);
      }
    }

    await rememberProfile(profile);
    setGuestUpgrade(false);
    setUser(profile);
  }

  async function signInAsGuest() {
    await saveJSON("session", GUEST.id);
    setUser(GUEST);
  }

  async function signOut() {
    await removeKey("session");
    await signOutOfFirebase(auth);
    setUser(null);
  }

  async function upgradeGuest() {
    setGuestUpgrade(true);
    await signOut();
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
        guestUpgrade,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        upgradeGuest,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
