import { StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Sky from "./Sky";
import useMotion from "../../hooks/useMotion";
import { gradients } from "../../theme";

// Fundo espacial: degradê + céu com estrelas piscando, nebulosas, poeira estelar e estrelas cadentes.
// "calm" deixa só as estrelas e as nebulosas (usado dentro dos jogos, para não distrair).
// "planet={false}" tira só o planeta (telas cheias de conteúdo, como as abas).
export default function Background({ children, colors = gradients.space, calm = false, planet = true, style }) {
  const animated = useMotion();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      <Sky animated={animated} calm={calm} planet={!calm && planet} compact={width < 900} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1B0E52", overflow: "hidden" },
});
