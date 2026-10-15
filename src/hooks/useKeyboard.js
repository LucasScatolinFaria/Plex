import { useEffect, useRef } from "react";
import { Platform } from "react-native";

// Teclado físico (só existe no site): chama onKey(tecla, evento) a cada tecla apertada.
export default function useKeyboard(onKey) {
  const handler = useRef(onKey);
  handler.current = onKey;

  useEffect(() => {
    if (Platform.OS !== "web") return undefined;
    const listener = (event) => handler.current(event.key, event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
}
