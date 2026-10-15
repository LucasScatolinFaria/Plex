import { Platform } from "react-native";

// No navegador o onPressIn espera 50 ms (e pode nem chegar em toques muito rápidos).
// Nos jogos de reflexo o toque precisa valer na hora: use <Pressable {...instantPress} onPressIn={...} />
export const instantPress = Platform.OS === "web" ? { delayPressIn: 0 } : null;
