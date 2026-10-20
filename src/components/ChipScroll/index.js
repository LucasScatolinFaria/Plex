import { ScrollView, View } from "react-native";

import useLayout from "../../hooks/useLayout";

// Fileira de chips (filtros): no celular rola para o lado; em telas maiores quebra em várias linhas,
// porque com mouse ninguém descobre que dá para rolar para o lado.
// bleed = quanto a rolagem avança sobre a margem da tela, para os chips sumirem na borda.
export default function ChipScroll({ children, bleed = 16, style }) {
  const { isTablet } = useLayout();

  if (isTablet) {
    return <View style={[{ flexDirection: "row", flexWrap: "wrap", gap: 8 }, style]}>{children}</View>;
  }

  return (
    <View style={[{ marginHorizontal: -bleed }, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: bleed, paddingVertical: 2 }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
