import { useRef } from "react";
import { Animated, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Shine from "../Shine";
import { fx } from "../../services/feedback";
import { buttonTones, nativeDriver } from "../../theme";
import { Edge, Face, Gloss, Label } from "./style";

const SIZES = {
  lg: { height: 58, font: 22, radius: 20, depth: 7, padding: 28, icon: 24 },
  md: { height: 48, font: 18, radius: 16, depth: 6, padding: 22, icon: 20 },
  sm: { height: 40, font: 15, radius: 14, depth: 5, padding: 16, icon: 17 },
};

// Botão "3D": a frente desce sobre a borda quando é apertado.
export default function Button({
  title,
  icon,
  tone = "yellow",
  size = "md",
  onPress,
  disabled = false,
  full = false,
  sound = "tap",
  shine = size === "lg",
  style,
}) {
  const pressed = useRef(new Animated.Value(0)).current;
  const dimensions = SIZES[size];
  const palette = buttonTones[tone];

  const animateTo = (toValue) =>
    Animated.spring(pressed, { toValue, speed: 40, bounciness: 8, useNativeDriver: nativeDriver }).start();

  function handlePress() {
    if (sound) fx(sound);
    if (onPress) onPress();
  }

  const translateY = pressed.interpolate({ inputRange: [0, 1], outputRange: [0, dimensions.depth] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      style={[
        { alignSelf: full ? "stretch" : "center", opacity: disabled ? 0.5 : 1, userSelect: "none" },
        style,
      ]}
    >
      <Edge style={{ backgroundColor: palette.edge, borderRadius: dimensions.radius, paddingBottom: dimensions.depth }}>
        <Face
          style={{
            height: dimensions.height,
            borderRadius: dimensions.radius,
            paddingHorizontal: dimensions.padding,
            backgroundColor: palette.face,
            transform: [{ translateY }],
          }}
        >
          <Gloss style={{ borderRadius: dimensions.radius }} />
          {shine && !disabled ? <Shine /> : null}
          {icon ? <Ionicons name={icon} size={dimensions.icon} color={palette.text} /> : null}
          {title ? (
            <Label numberOfLines={1} style={{ fontSize: dimensions.font, color: palette.text }}>
              {title}
            </Label>
          ) : null}
        </Face>
      </Edge>
    </Pressable>
  );
}
