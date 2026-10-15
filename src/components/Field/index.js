import { useState } from "react";
import { Platform, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { colors } from "../../theme";
import { AreaInput, Input } from "./style";

const noOutline = Platform.OS === "web" ? { outlineStyle: "none" } : null;

// Campo de texto com ícone. Com "secure" vira campo de senha com botão de mostrar/esconder.
export default function Field({ icon, secure = false, invalid = false, style, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <AreaInput $focused={focused} $invalid={invalid} style={style}>
      <Ionicons name={icon} size={22} color={focused ? colors.purple : colors.muted} />
      <Input
        placeholderTextColor={colors.muted}
        secureTextEntry={hidden}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={noOutline}
        {...inputProps}
      />
      {secure ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? "Mostrar senha" : "Esconder senha"}
          hitSlop={10}
          onPress={() => setHidden(!hidden)}
        >
          <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={22} color={colors.muted} />
        </Pressable>
      ) : null}
    </AreaInput>
  );
}
