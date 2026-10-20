import { createContext, useCallback, useRef, useState } from "react";
import { View } from "react-native";

import ModeCurtain from "../components/ModeCurtain";
import useMotion from "../hooks/useMotion";
import { fx } from "../services/feedback";

export const ModeContext = createContext({ switchMode: (mode, go) => go() });

// Troca entre o SESI Kids (jogos) e o JES Kids (esportes) com uma cortina animada por cima de tudo.
// switchMode("jes" | "sesi", go): toca o som, cobre a tela, chama go() (que navega) e descobre o site novo.
// Com os efeitos animados desligados a troca é na hora.
function ModeProvider({ children }) {
  const motion = useMotion();
  const [curtain, setCurtain] = useState(null);
  const busy = useRef(false);

  const switchMode = useCallback(
    (mode, go) => {
      if (busy.current) return;
      fx(mode === "jes" ? "whistle" : "match");
      if (!motion) {
        go();
        return;
      }
      busy.current = true;
      setCurtain({ mode, go, key: Date.now() });
    },
    [motion]
  );

  function finish() {
    busy.current = false;
    setCurtain(null);
  }

  return (
    <ModeContext.Provider value={{ switchMode }}>
      <View style={{ flex: 1 }}>
        {children}
        {curtain ? (
          <ModeCurtain key={curtain.key} mode={curtain.mode} onCovered={curtain.go} onDone={finish} />
        ) : null}
      </View>
    </ModeContext.Provider>
  );
}

export default ModeProvider;
