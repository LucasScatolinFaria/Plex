import { Text, View } from "react-native";

import Float from "../Float";
import { fonts, jes } from "../../theme";

const LOOKS = {
  live: { label: "AO VIVO", background: jes.live, color: "#FFFFFF" },
  paused: { label: "PAUSA", background: "#F59E0B", color: "#3B2300" },
  scheduled: { label: "EM BREVE", background: "rgba(255,255,255,0.16)", color: "#FFFFFF" },
  finished: { label: "ENCERRADO", background: "rgba(163,230,53,0.2)", color: jes.lime },
};

// Selo da situação do jogo. Ao vivo tem a bolinha pulsando; com o relógio parado vira "PAUSA".
export default function StatusBadge({ match, size = "md", style }) {
  const paused = match.status === "live" && !match.clock.running;
  const look = LOOKS[paused ? "paused" : match.status] || LOOKS.scheduled;
  const small = size === "sm";

  return (
    <View
      accessibilityLabel={look.label.toLowerCase()}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: small ? 8 : 10,
          paddingVertical: small ? 3 : 4,
          borderRadius: 12,
          backgroundColor: look.background,
        },
        style,
      ]}
    >
      {match.status === "live" && !paused ? (
        <Float kind="beat" duration={600}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" }} />
        </Float>
      ) : null}
      <Text
        style={{ fontFamily: fonts.title, fontSize: small ? 11 : 12, letterSpacing: 0.8, color: look.color }}
        allowFontScaling={false}
      >
        {look.label}
      </Text>
    </View>
  );
}
