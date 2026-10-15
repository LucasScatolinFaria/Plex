import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { fx } from "../../services/feedback";
import { colors, nativeDriver } from "../../theme";

function Star({ filled, size, animated, delay, emptyColor }) {
  const pop = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated || !filled) return undefined;
    const timer = setTimeout(() => fx("star"), delay);
    const animation = Animated.spring(pop, {
      toValue: 1,
      delay,
      friction: 4,
      tension: 120,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [animated, filled, delay, pop]);

  const rotate = pop.interpolate({ inputRange: [0, 1], outputRange: ["-120deg", "0deg"] });

  return (
    <View style={{ width: size, height: size }}>
      <Ionicons name="star" size={size} color={emptyColor} style={{ position: "absolute" }} />
      {filled ? (
        <Animated.View style={{ transform: [{ scale: pop }, { rotate }] }}>
          <Ionicons name="star" size={size} color={colors.yellow} />
        </Animated.View>
      ) : null}
    </View>
  );
}

// Três estrelas; com "animated" as conquistadas entram uma por vez, com som.
export default function StarRow({
  count = 0,
  size = 44,
  animated = false,
  delay = 350,
  emptyColor = "rgba(110,100,170,0.22)",
  style,
}) {
  return (
    <View
      accessibilityLabel={`${count} de 3 estrelas`}
      style={[{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: size * 0.1 }, style]}
    >
      {[0, 1, 2].map((index) => (
        <View key={index} style={{ marginBottom: index === 1 && animated ? size * 0.25 : 0 }}>
          <Star
            filled={index < count}
            size={size}
            animated={animated}
            delay={delay + index * 380}
            emptyColor={emptyColor}
          />
        </View>
      ))}
    </View>
  );
}
