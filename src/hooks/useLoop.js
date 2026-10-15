import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

import { nativeDriver } from "../theme";

// Valor animado que vai de 0 a 1 e volta, para sempre (flutuar, pulsar, piscar...).
export default function useLoop(duration, { delay = 0, enabled = true } = {}) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    const step = (toValue, wait) =>
      Animated.timing(value, {
        toValue,
        duration,
        delay: wait,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: nativeDriver,
      });
    const loop = Animated.loop(Animated.sequence([step(1, delay), step(0, 0)]));
    loop.start();
    return () => loop.stop();
  }, [value, duration, delay, enabled]);

  return value;
}
