import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "@sesikids:";

export async function loadJSON(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

// devolve false quando o aparelho não deixou salvar (ex.: armazenamento cheio)
export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
    return true;
  } catch (error) {
    return false;
  }
}
