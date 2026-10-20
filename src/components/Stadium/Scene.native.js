// Estádio no celular (app nativo): céu, brilho dos refletores e gramado listrado, tudo parado.
// No navegador o arquivo é o Scene.web.js, com a arquibancada fazendo a ola.
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BANDS = 8;

export default function Scene({ width }) {
  const glow = width < 900 ? 260 : 420;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      <LinearGradient
        colors={["#060D2E", "#1A2C74", "#0B5A28"]}
        locations={[0, 0.42, 0.48]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.field, { flexDirection: "column" }]}>
        {Array.from({ length: BANDS }, (_, index) => (
          <View
            key={index}
            style={{
              flex: 1 + index * 0.2,
              backgroundColor: index % 2 ? "transparent" : "rgba(255,255,255,0.05)",
            }}
          />
        ))}
      </View>
      <View
        style={[styles.glow, { width: glow, height: glow, borderRadius: glow, top: -glow / 2, left: -glow / 3 }]}
      />
      <View
        style={[styles.glow, { width: glow, height: glow, borderRadius: glow, top: -glow / 2, right: -glow / 3 }]}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(2,11,6,0.28)" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { position: "absolute", top: "48%", left: 0, right: 0, bottom: 0 },
  glow: { position: "absolute", backgroundColor: "rgba(255,248,214,0.08)" },
});
