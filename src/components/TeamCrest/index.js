import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { fonts, shadow } from "../../theme";
import { getTeam } from "../../utils/jes";

// Escudo de uma sala do JES Kids: anel nas cores da sala e o bicho dela num miolo claro
// (o miolo claro garante que o golfinho azul aparece no escudo azul, o dino verde no verde...).
// label = true mostra a faixa com o nome da sala ("1ºA") por cima da borda de baixo.
export default function TeamCrest({ team, size = 56, label = false, style }) {
  const info = typeof team === "string" ? getTeam(team) : team;
  const border = Math.max(1.5, size * 0.035);

  return (
    <View style={[{ alignItems: "center" }, style]}>
      <LinearGradient
        colors={[info.light, info.color]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            padding: size * 0.1,
            borderWidth: border,
            borderColor: "#FFFFFF",
          },
          shadow(Math.round(size * 0.08), Math.round(size * 0.22), "rgba(0,0,0,0.35)"),
        ]}
      >
        <LinearGradient
          colors={["#FFFFFF", info.light]}
          start={{ x: 0.5, y: 0.2 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1, borderRadius: size, alignItems: "center", justifyContent: "center" }}
        >
          <Text allowFontScaling={false} style={{ fontSize: size * 0.4, lineHeight: size * 0.52 }}>
            {info.emoji}
          </Text>
        </LinearGradient>
      </LinearGradient>
      {label ? (
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            marginTop: -size * 0.16,
            paddingHorizontal: Math.max(6, size * 0.12),
            paddingVertical: 1,
            borderRadius: 10,
            overflow: "hidden",
            borderWidth: 1.5,
            borderColor: info.color,
            backgroundColor: "rgba(3,20,11,0.92)",
            fontFamily: fonts.title,
            fontSize: Math.max(11, size * 0.2),
            color: "#FFFFFF",
          }}
        >
          {info.label}
        </Text>
      ) : null}
    </View>
  );
}
