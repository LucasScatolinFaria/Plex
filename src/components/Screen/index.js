import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Background from "../Background";
import useLayout from "../../hooks/useLayout";

// Moldura das telas com abas: fundo espacial, rolagem e conteúdo centralizado.
export default function Screen({ children, maxWidth = 1120 }) {
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();

  return (
    <Background planet={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: isWide ? 28 : insets.top + 16,
          // no celular a barra de abas flutua por cima do conteúdo
          paddingBottom: isWide ? 48 : insets.bottom + 120,
        }}
      >
        <View style={{ width: "100%", maxWidth }}>{children}</View>
      </ScrollView>
    </Background>
  );
}
