import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const PLANET_COLORS = ["#FFC56B", "#FF5FA2"];

// O desenho do planeta com anel (quem anima é o Sky de cada plataforma).
export default function PlanetArt({ size, compact }) {
  const ball = { width: size, height: size, borderRadius: size };

  return (
    <View style={{ width: size * 1.8, height: size, alignItems: "center" }}>
      <LinearGradient colors={PLANET_COLORS} style={ball} />
      <View
        style={[
          styles.ring,
          { width: size * 1.8, height: size * 0.4, top: size * 0.3, borderWidth: compact ? 3 : 5 },
        ]}
      />
      {/* a metade de cima fica na frente do anel, para ele parecer dar a volta */}
      <View style={{ position: "absolute", top: 0, width: size, height: size / 2, overflow: "hidden" }}>
        <LinearGradient colors={PLANET_COLORS} style={ball} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderRadius: 100,
    borderColor: "rgba(255,226,122,0.9)",
  },
});
