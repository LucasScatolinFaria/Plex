import { StyleSheet, View, useWindowDimensions } from "react-native";

import Scene from "./Scene";
import useMotion from "../../hooks/useMotion";

// Fundo do JES Kids: um estádio à noite (o desenho fica em Scene.web.js e Scene.native.js).
// "calm" deixa a cena parada (telas de controle, onde o movimento atrapalha).
export default function Stadium({ children, calm = false, style }) {
  const animated = useMotion() && !calm;
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.root, style]}>
      <Scene animated={animated} width={width} height={height} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060D2E", overflow: "hidden" },
});
