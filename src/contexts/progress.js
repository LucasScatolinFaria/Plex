import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "./auth";
import { loadLocalProgress, publishRanking, saveProgress, syncProgress } from "../services/players";
import { EMPTY_PROGRESS } from "../utils/progress";
import { applyResult } from "../utils/results";

export const ProgressContext = createContext({});

function ProgressProvider({ children }) {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const [progress, setProgress] = useState(EMPTY_PROGRESS);
  // a ref guarda o valor mais novo para duas partidas seguidas não se sobrescreverem
  const latest = useRef(EMPTY_PROGRESS);
  // de quem é o progresso já conferido com o Firestore (antes disso nada vai para o ranking)
  const [syncedFor, setSyncedFor] = useState(null);

  const replace = useCallback((next) => {
    latest.current = next;
    setProgress(next);
  }, []);

  useEffect(() => {
    let active = true;
    replace(EMPTY_PROGRESS);
    setSyncedFor(null);
    if (userId) {
      // mostra na hora a cópia do aparelho e depois confere a do Firestore
      loadLocalProgress(userId).then(async (local) => {
        if (!active) return;
        replace(local);
        const synced = await syncProgress(userId, local);
        if (!active) return;
        replace(synced);
        setSyncedFor(userId);
      });
    }
    return () => {
      active = false;
    };
  }, [userId, replace]);

  // mantém a linha do jogador no ranking em dia (estrelas, XP, nome e avatar)
  useEffect(() => {
    if (user && syncedFor === user.id) publishRanking(user, progress);
  }, [user, syncedFor, progress]);

  const registerResult = useCallback(
    (gameId, modeId, result) => {
      const { progress: next, summary } = applyResult(latest.current, gameId, modeId, result);
      replace(next);
      saveProgress(userId, next);
      return summary;
    },
    [userId, replace]
  );

  const resetProgress = useCallback(async () => {
    replace(EMPTY_PROGRESS);
    await saveProgress(userId, EMPTY_PROGRESS);
  }, [userId, replace]);

  return (
    <ProgressContext.Provider value={{ progress, registerResult, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export default ProgressProvider;
