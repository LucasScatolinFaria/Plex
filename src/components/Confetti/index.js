import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from "react-native";

import useMotion from "../../hooks/useMotion";
import { colors, nativeDriver } from "../../theme";
import { pick } from "../../utils/helpers";

const PALETTE = [colors.yellow, colors.pink, colors.cyan, colors.lime, colors.orange, colors.violet, "#FFFFFF"];

function Piece({ width, height }) {
  const fall = useRef(new Animated.Value(0)).current;

  const piece = useMemo(() => {
    const size = 8 + Math.random() * 9;
    return {
      x: Math.random() * width,
      sway: 20 + Math.random() * 50,
      turns: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 4),
      duration: 2200 + Math.random() * 1800,
      delay: Math.random() * 1300,
      shape: {
        width: size,
        height: Math.random() < 0.35 ? size : size * 0.5,
        borderRadius: Math.random() < 0.35 ? size : 2,
        backgroundColor: pick(PALETTE),
      },
    };
  }, [width]);

  useEffect(() => {
    const animation = Animated.timing(fall, {
      toValue: 1,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.in(Easing.quad),
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [fall, piece]);

  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-30, height + 30] });
  const translateX = fall.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [piece.x, piece.x + piece.sway, piece.x - piece.sway * 0.6, piece.x + piece.sway * 0.8, piece.x],
  });
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${piece.turns * 360}deg`] });

  return (
    <Animated.View
      style={[styles.piece, piece.shape, { transform: [{ translateX }, { translateY }, { rotate }] }]}
    />
  );
}

// Chuva de confete que cai uma vez. Monte o componente para disparar.
export default function Confetti({ count = 48 }) {
  const { width, height } = useWindowDimensions();
  const motion = useMotion();

  if (!motion) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.layer]}>
      {Array.from({ length: count }, (_, index) => (
        <Piece key={index} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { pointerEvents: "none", overflow: "hidden" },
  piece: { position: "absolute", top: 0, left: 0 },
});
