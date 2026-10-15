import { useEffect, useRef } from "react";
import { Animated } from "react-native";

import { nativeDriver } from "../../theme";

// Faz o conteúdo "chegar" na tela: from = "bottom" | "top" | "left" | "right" | "scale"
export default function Appear({ children, delay = 0, from = "bottom", distance = 26, style }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: 1,
      delay,
      friction: 7,
      tension: 70,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay]);

  const slide = (start) => progress.interpolate({ inputRange: [0, 1], outputRange: [start, 0] });
  const transforms = {
    bottom: [{ translateY: slide(distance) }],
    top: [{ translateY: slide(-distance) }],
    left: [{ translateX: slide(-distance) }],
    right: [{ translateX: slide(distance) }],
    scale: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
  };
  const opacity = progress.interpolate({ inputRange: [0, 0.6], outputRange: [0, 1], extrapolate: "clamp" });

  return <Animated.View style={[style, { opacity, transform: transforms[from] }]}>{children}</Animated.View>;
}
