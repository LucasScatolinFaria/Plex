
import { Platform, StatusBar, View } from "react-native";

import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Fredoka_500Medium } from "@expo-google-fonts/fredoka/500Medium";
import { Fredoka_600SemiBold } from "@expo-google-fonts/fredoka/600SemiBold";
import { Fredoka_700Bold } from "@expo-google-fonts/fredoka/700Bold";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";

import Routes from "./src/routes/index";
import { documentTitle, linking } from "./src/routes/linking";
import AuthProvider from "./src/contexts/auth";
import ProgressProvider from "./src/contexts/progress";
import SettingsProvider from "./src/contexts/settings";
import { colors } from "./src/theme";

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.space },
};

const FONTS = {
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  ...Ionicons.font,
};

// No site publicado as fontes são pedidas com "?v=2" no endereço. O primeiro deploy (15/10/2026) saiu sem
// elas, e quem abriu o site naquela hora ficou com uma página guardada no lugar das fontes (cache de um ano).
// Com o endereço novo esses navegadores baixam as fontes certas.
const fontSources =
  Platform.OS === "web" && !__DEV__
    ? Object.fromEntries(
        Object.entries(FONTS).map(([name, file]) => [name, `${Asset.fromModule(file).uri}?v=2`])
      )
    : FONTS;

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontSources);

  // se as fontes falharem o app abre mesmo assim, com a fonte padrão do aparelho
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.space }} />;
  }

  return (
    <NavigationContainer
      theme={theme}
      linking={Platform.OS === "web" ? linking : undefined}
      documentTitle={documentTitle}
    >
      <SettingsProvider>
        <AuthProvider>
          <ProgressProvider>
            <StatusBar barStyle="light-content" />
            <Routes />
          </ProgressProvider>
        </AuthProvider>
      </SettingsProvider>
    </NavigationContainer>
  );
}
