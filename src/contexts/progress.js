import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "./auth";
import { loadJSON, removeKey, saveJSON } from "../services/storage";
import { EMPTY_PROGRESS, normalizeProgress } from "../utils/progress";
import { applyResult } from "../utils/results";

export const ProgressContext = createContext({});

function ProgressProvider({ children }) {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const [progress, setProgress] = useState(EMPTY_PROGRESS);
  // a ref guarda o valor mais novo para duas partidas seguidas não se sobrescreverem
  const latest = useRef(EMPTY_PROGRESS);

  const replace = useCallback((next) => {
    latest.current = next;
    setProgress(next);
  }, []);

  useEffect(() => {
    let active = true;
    replace(EMPTY_PROGRESS);
    if (userId) {
      loadJSON(`progress:${userId}`).then((saved) => {
        if (active) replace(normalizeProgress(saved));
      });
    }
    return () => {
      active = false;
    };
  }, [userId, replace]);

  const registerResult = useCallback(
    (gameId, modeId, result) => {
      const { progress: next, summary } = applyResult(latest.current, gameId, modeId, result);
      replace(next);
      saveJSON(`progress:${userId}`, next);
      return summary;
    },
    [userId, replace]
  );

  const resetProgress = useCallback(async () => {
    replace(EMPTY_PROGRESS);
    await removeKey(`progress:${userId}`);
  }, [userId, replace]);

  return (
    <ProgressContext.Provider value={{ progress, registerResult, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export default ProgressProvider;
