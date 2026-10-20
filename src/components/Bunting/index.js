import { View } from "react-native";

import Float from "../Float";

// Bandeirinhas de festa penduradas num fio, nas cores das salas.
export default function Bunting({ colors, count = 16, size = 18, style }) {
  return (
    <View style={[{ pointerEvents: "none" }, style]}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: "rgba(255,255,255,0.45)",
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: size / 2 }}>
        {Array.from({ length: count }, (_, index) => (
          <Float key={index} kind="bob" duration={1300 + (index % 4) * 260} delay={index * 90}>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: size / 2,
                borderRightWidth: size / 2,
                borderTopWidth: size * 1.15,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: colors[index % colors.length],
              }}
            />
          </Float>
        ))}
      </View>
    </View>
  );
}
