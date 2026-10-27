// Conexão com o Firebase do Plex (projeto plex-ccc9f):
//   Authentication  contas com e-mail e senha e visitantes (conta anônima)
//   Firestore       perfis, progresso, ranking e as salas dos jogos online
//   Analytics       métricas de uso, em services/analytics (só no site publicado)
// Esses dados de configuração são públicos de propósito; quem protege o banco são as regras do
// arquivo firestore.rules.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADuRcgZ3iZsLdkdGeqYBPNAS2DLqRzGKM",
  authDomain: "plex-ccc9f.firebaseapp.com",
  projectId: "plex-ccc9f",
  storageBucket: "plex-ccc9f.firebasestorage.app",
  messagingSenderId: "132292297180",
  appId: "1:132292297180:web:bd7c97bbe7f6eba504cf19",
  measurementId: "G-2W1NBVF00L",
};

export const app = initializeApp(firebaseConfig);

// O login fica guardado no aparelho para a pessoa continuar conectada ao voltar:
// no navegador o próprio Firebase usa o IndexedDB; no celular ele precisa do AsyncStorage.
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);

// Com EXPO_PUBLIC_EMULATOR_HOST (no .env.local) o app usa os emuladores do "npm run emulators" em vez do
// banco de verdade: dá para testar as salas online com várias abas sem sujar o Plex publicado.
// No navegador do computador é 127.0.0.1; no celular, o IP do computador na rede (ex.: 192.168.0.10).
export const emulatorHost = process.env.EXPO_PUBLIC_EMULATOR_HOST;

if (emulatorHost) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorHost, 8080);
}
