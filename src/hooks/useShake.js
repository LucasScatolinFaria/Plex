import { useCallback, useRef } from "react";
import { Animated } from "react-native";

import { nativeDriver } from "../theme";

// Devolve [estilo, tremer]: aplique o estilo em um Animated.View e chame tremer() no erro.
export default function useShake() {
  const offset = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    offset.setValue(0);
    Animated.sequence(
      [10, -10, 8, -8, 4, 0].map((toValue) =>
        Animated.timing(offset, { toValue, duration: 55, useNativeDriver: nativeDriver })
      )
    ).start();
  }, [offset]);

  return [{ transform: [{ translateX: offset }] }, shake];
}
