import { useEffect, useState } from "react";
import { Animated, Easing, Text } from "react-native";

// Número que sobe de 0 até "to", como um placar.
export default function CountUp({ to, duration = 900, delay = 0, style }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const counter = new Animated.Value(0);
    const listener = counter.addListener(({ value }) => setShown(Math.round(value)));
    const animation = Animated.timing(counter, {
      toValue: to,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      animation.stop();
      counter.removeListener(listener);
    };
  }, [to, duration, delay]);

  return <Text style={style}>{shown}</Text>;
}
