import { Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { getAvatar } from "../../data/avatars";

export default function Avatar({ id, size = 56, ring = true, style }) {
  const avatar = getAvatar(id);

  return (
    <LinearGradient
      colors={avatar.colors}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: ring ? Math.max(2, Math.round(size * 0.05)) : 0,
          borderColor: "#FFFFFF",
        },
        style,
      ]}
    >
      <Text allowFontScaling={false} style={{ fontSize: size * 0.5, lineHeight: size * 0.64 }}>
        {avatar.emoji}
      </Text>
    </LinearGradient>
  );
}
