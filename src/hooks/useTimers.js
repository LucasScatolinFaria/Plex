import { useCallback, useEffect, useRef } from "react";

// setTimeout que se cancela sozinho quando a tela fecha. Uso: const later = useTimers(); later(fn, 500);
export default function useTimers() {
  const pending = useRef(new Set());

  useEffect(() => {
    const timers = pending.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  return useCallback((callback, delay) => {
    const id = setTimeout(() => {
      pending.current.delete(id);
      callback();
    }, delay);
    pending.current.add(id);
    return id;
  }, []);
}
