import { useContext } from "react";

import { SettingsContext } from "../contexts/settings";

// true quando os efeitos animados (confete, estrelas piscando, brilhos) estão ligados em Perfil → Configurações.
// A escolha é do próprio app: muitos computadores de escola deixam as animações do sistema desligadas.
export default function useMotion() {
  return useContext(SettingsContext).effects !== false;
}
