// Conexão com o Firebase (projeto sesi-kids0): o Authentication guarda o e-mail e a senha das contas
// e o Firestore guarda o perfil de cada jogador. Esses dados de configuração são públicos de propósito;
// quem protege o banco são as regras do arquivo firestore.rules.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoIBV-5YeFJLKegY16VELjfGSqyyJo6mk",
  authDomain: "sesi-kids0.firebaseapp.com",
  projectId: "sesi-kids0",
  storageBucket: "sesi-kids0.firebasestorage.app",
  messagingSenderId: "1079025650779",
  appId: "1:1079025650779:web:26b5197ed13ea2098c437e",
  measurementId: "G-QVHWN5LVBC",
};

const app = initializeApp(firebaseConfig);

// O login fica guardado no aparelho para a pessoa continuar conectada ao voltar:
// no navegador o próprio Firebase usa o IndexedDB; no celular ele precisa do AsyncStorage.
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);
