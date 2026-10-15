import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import useLoop from "../../hooks/useLoop";
import { colors, fonts, nativeDriver, textShadow } from "../../theme";

const KIDS = [
  { letter: "K", color: colors.yellow },
  { letter: "i", color: colors.pink },
  { letter: "d", color: colors.cyan },
  { letter: "s", color: colors.lime },
];

// "SESI Kids": as letras coloridas entram pulando e depois ficam dançando.
export default function Logo({ size = 44, animated = true, style }) {
  const entrances = useRef(KIDS.map(() => new Animated.Value(animated ? 0 : 1))).current;
  const wave = useLoop(900, { enabled: animated });

  useEffect(() => {
    if (!animated) return undefined;
    const animation = Animated.stagger(
      110,
      entrances.map((value) =>
        Animated.spring(value, { toValue: 1, friction: 4, tension: 90, useNativeDriver: nativeDriver })
      )
    );
    animation.start();
    return () => animation.stop();
  }, [animated, entrances]);

  const shadow = textShadow("rgba(15,5,60,0.45)", Math.max(2, size * 0.07), 0);

  return (
    <View
      accessibilityRole="header"
      accessibilityLabel="SESI Kids"
      style={[{ flexDirection: "row", alignItems: "center" }, style]}
    >
      <Text
        allowFontScaling={false}
        style={[
          { fontFamily: fonts.title, fontSize: size * 0.82, color: colors.white, letterSpacing: size * 0.03 },
          shadow,
        ]}
      >
        SESI
      </Text>
      <View style={{ flexDirection: "row", marginLeft: size * 0.18 }}>
        {KIDS.map(({ letter, color }, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          const dance = wave.interpolate({
            inputRange: [0, 1],
            outputRange: [direction * size * 0.05, -direction * size * 0.05],
          });
          const drop = entrances[index].interpolate({ inputRange: [0, 1], outputRange: [-size * 0.6, 0] });
          return (
            <Animated.Text
              key={letter}
              allowFontScaling={false}
              style={[
                { fontFamily: fonts.title, fontSize: size, color, opacity: entrances[index] },
                shadow,
                { transform: [{ translateY: Animated.add(drop, dance) }, { scale: entrances[index] }] },
              ]}
            >
              {letter}
            </Animated.Text>
          );
        })}
      </View>
    </View>
  );
}
