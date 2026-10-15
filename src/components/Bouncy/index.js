import { useRef } from "react";
import { Animated, Pressable } from "react-native";

import { fx } from "../../services/feedback";
import { nativeDriver } from "../../theme";

// Área tocável que afunda no toque e cresce um pouco quando o mouse passa por cima.
// onHoverChange(true/false) avisa quando o mouse entra e sai (para efeitos extras de quem usa).
export default function Bouncy({
  children,
  onPress,
  onHoverChange,
  style,
  contentStyle,
  disabled = false,
  sound = "tap",
  pressedScale = 0.94,
  hoverScale = 1.04,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) =>
    Animated.spring(scale, { toValue, friction: 5, tension: 170, useNativeDriver: nativeDriver }).start();

  function handlePress() {
    if (sound) fx(sound);
    if (onPress) onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      onPressIn={() => animateTo(pressedScale)}
      onPressOut={() => animateTo(1)}
      onHoverIn={() => {
        animateTo(hoverScale);
        if (onHoverChange) onHoverChange(true);
      }}
      onHoverOut={() => {
        animateTo(1);
        if (onHoverChange) onHoverChange(false);
      }}
      style={[{ userSelect: "none" }, style]}
      {...rest}
    >
      <Animated.View style={[contentStyle, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
