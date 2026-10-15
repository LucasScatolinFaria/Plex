import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import useMotion from "../../hooks/useMotion";
import { nativeDriver } from "../../theme";

// Faixa de brilho que atravessa o elemento de tempos em tempos.
// Coloque dentro de um componente com overflow: "hidden".
export default function Shine({ every = 2600, delay = 900 }) {
  const sweep = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const motion = useMotion();

  useEffect(() => {
    if (!motion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(sweep, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: nativeDriver }),
        Animated.delay(every),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sweep, every, delay, motion]);

  const translateX = sweep.interpolate({ inputRange: [0, 1], outputRange: [-90, width + 40] });

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[StyleSheet.absoluteFill, styles.clip]}
    >
      <Animated.View style={[styles.band, { opacity: width ? 1 : 0, transform: [{ translateX }, { rotate: "18deg" }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden", pointerEvents: "none" },
  band: {
    position: "absolute",
    top: -30,
    bottom: -30,
    left: 0,
    width: 46,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
