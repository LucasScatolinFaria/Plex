import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Stadium from "../Stadium";
import useLayout from "../../hooks/useLayout";

// Moldura das telas do JES Kids: fundo de estádio, rolagem e conteúdo centralizado (como o Screen do SESI Kids).
// overlay fica por cima da tela inteira, fora da rolagem (ex.: a comemoração de gol).
export default function JesScreen({ children, maxWidth = 1120, overlay = null }) {
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();

  return (
    <Stadium>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: isWide ? 26 : insets.top + 16,
          // no celular a barra de abas flutua por cima do conteúdo
          paddingBottom: isWide ? 48 : insets.bottom + 124,
        }}
      >
        <View style={{ width: "100%", maxWidth }}>{children}</View>
      </ScrollView>
      {overlay}
    </Stadium>
  );
}
