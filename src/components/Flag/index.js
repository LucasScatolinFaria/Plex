import { useState } from "react";
import { Image, Text, View } from "react-native";

import { flagUrl } from "../../utils/countries";

// Bandeira de um país (imagem do flagcdn.com: no Windows os emojis de bandeira viram letras).
// Sem internet, aparece uma bandeirinha branca no lugar.
export default function Flag({ id, size = 36, style }) {
  const [failed, setFailed] = useState(false);
  const height = Math.round(size * 0.72);

  return (
    <View
      style={[
        {
          width: size,
          height,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 4,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {failed ? (
        <Text style={{ fontSize: height * 0.8, lineHeight: height }}>🏳️</Text>
      ) : (
        <Image
          source={{ uri: flagUrl(id, size > 40 ? 160 : 80) }}
          style={{ width: size, height }}
          resizeMode="contain"
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  );
}
