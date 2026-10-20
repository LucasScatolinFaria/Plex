import { useEffect, useState } from "react";

// Hora atual que se atualiza sozinha (para relógios de partida). enabled = false congela.
export default function useNow(every = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(timer);
  }, [every, enabled]);

  return now;
}
