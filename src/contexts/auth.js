import { createContext, useEffect, useState } from "react";

import { GUEST_AVATAR } from "../data/avatars";
import { randomSalt, sha256 } from "../services/hash";
import { loadJSON, removeKey, saveJSON } from "../services/storage";

export const AuthContext = createContext({});

// As contas ficam salvas só neste aparelho (não existe servidor).
const GUEST = { id: "guest", name: "Visitante", email: null, avatar: GUEST_AVATAR.id, guest: true };

const normalizeEmail = (email) => email.trim().toLowerCase();

const publicUser = ({ id, name, email, avatar, createdAt }) => ({ id, name, email, avatar, createdAt });

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // true quando o visitante pediu para criar uma conta e levar o progresso junto
  const [guestUpgrade, setGuestUpgrade] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const sessionId = await loadJSON("session");
      if (sessionId === GUEST.id) {
        setUser(GUEST);
      } else if (sessionId) {
        const users = await loadJSON("users", {});
        if (users[sessionId]) setUser(publicUser(users[sessionId]));
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function signIn(email, password) {
    const users = await loadJSON("users", {});
    const account = Object.values(users).find((item) => item.email === normalizeEmail(email));
    if (!account || sha256(account.salt + password) !== account.passwordHash) {
      throw new Error("E-mail ou senha incorretos.");
    }
    await saveJSON("session", account.id);
    setGuestUpgrade(false);
    setUser(publicUser(account));
  }

  async function signUp({ name, email, password, avatar }) {
    const users = await loadJSON("users", {});
    const cleanEmail = normalizeEmail(email);
    if (Object.values(users).some((item) => item.email === cleanEmail)) {
      throw new Error("Já existe uma conta com esse e-mail.");
    }

    const id = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    const salt = randomSalt();
    const account = {
      id,
      name: name.trim(),
      email: cleanEmail,
      avatar,
      salt,
      passwordHash: sha256(salt + password),
      createdAt: new Date().toISOString(),
    };

    const saved = await saveJSON("users", { ...users, [id]: account });
    if (!saved) throw new Error("Não foi possível salvar a conta neste aparelho.");

    if (guestUpgrade) {
      const guestProgress = await loadJSON(`progress:${GUEST.id}`);
      if (guestProgress) {
        await saveJSON(`progress:${id}`, guestProgress);
        await removeKey(`progress:${GUEST.id}`);
      }
    }

    await saveJSON("session", id);
    setGuestUpgrade(false);
    setUser(publicUser(account));
  }

  async function signInAsGuest() {
    await saveJSON("session", GUEST.id);
    setUser(GUEST);
  }

  async function signOut() {
    await removeKey("session");
    setUser(null);
  }

  async function upgradeGuest() {
    setGuestUpgrade(true);
    await signOut();
  }

  async function updateProfile(changes) {
    const users = await loadJSON("users", {});
    if (!users[user.id]) return;
    const account = { ...users[user.id], ...changes };
    await saveJSON("users", { ...users, [user.id]: account });
    setUser(publicUser(account));
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
