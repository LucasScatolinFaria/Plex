import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";

import { colors, nativeDriver } from "../../theme";
import { clamp } from "../../utils/helpers";

function Track({ height, track, style, onWidth, children }) {
  return (
    <View
      onLayout={(event) => onWidth(event.nativeEvent.layout.width)}
      style={[{ height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }, style]}
    >
      {children}
    </View>
  );
}

const fill = (height, color) => ({
  width: "100%",
  height: "100%",
  borderRadius: height / 2,
  backgroundColor: color,
});

// Barra que anima até "value" (de 0 a 1).
export default function ProgressBar({
  value,
  height = 14,
  color = colors.yellow,
  track = "rgba(255,255,255,0.22)",
  style,
}) {
  const [width, setWidth] = useState(0);
  const progress = useRef(new Animated.Value(clamp(value, 0, 1))).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: clamp(value, 0, 1),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, value]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] });

  return (
    <Track height={height} track={track} style={style} onWidth={setWidth}>
      <Animated.View style={[fill(height, color), { opacity: width ? 1 : 0, transform: [{ translateX }] }]} />
    </Track>
  );
}

// Barra de tempo controlada por um Animated.Value (1 = cheia, 0 = vazia). Fica vermelha no final.
export function TimerBar({ progress, height = 14, color = colors.lime, style }) {
  const [width, setWidth] = useState(0);
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] });
  const danger = progress.interpolate({ inputRange: [0, 0.25, 0.4, 1], outputRange: [1, 1, 0, 0] });

  return (
    <Track height={height} track="rgba(255,255,255,0.22)" style={style} onWidth={setWidth}>
      <Animated.View style={{ width: "100%", height: "100%", opacity: width ? 1 : 0, transform: [{ translateX }] }}>
        <View style={fill(height, color)} />
        <Animated.View style={[fill(height, colors.coral), { position: "absolute", opacity: danger }]} />
      </Animated.View>
    </Track>
  );
}
