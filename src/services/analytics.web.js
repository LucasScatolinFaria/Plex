// Google Analytics do Firebase (measurementId do services/firebase.js), no site.
// Só liga no site publicado: em desenvolvimento e nos emuladores os testes não entram nas métricas.
// isSupported confere se o navegador deixa (aba anônima e bloqueadores podem não deixar).
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

import { app, emulatorHost } from "./firebase";

const analytics =
  __DEV__ || emulatorHost
    ? Promise.resolve(null)
    : isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch(() => null);

// Registra um evento. Use os nomes recomendados do Google Analytics quando existirem (level_start,
// level_end, login, sign_up, join_group...): eles já aparecem prontos nos relatórios.
export function track(name, params) {
  analytics.then((instance) => instance && logEvent(instance, name, params)).catch(() => {});
}
