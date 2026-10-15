import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import Float from "../Float";
import { colors, fonts, nativeDriver, textShadow } from "../../theme";

const KIDS = [
  { letter: "K", color: colors.yellow },
  { letter: "i", color: colors.pink },
  { letter: "d", color: colors.cyan },
  { letter: "s", color: colors.lime },
];

// "SESI Kids": as letras coloridas entram pulando e depois ficam dançando, uma atrás da outra (onda).
export default function Logo({ size = 44, animated = true, style }) {
  const entrances = useRef(KIDS.map(() => new Animated.Value(animated ? 0 : 1))).current;

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
          const drop = entrances[index].interpolate({ inputRange: [0, 1], outputRange: [-size * 0.6, 0] });
          return (
            <Float key={letter} kind="float" duration={700} delay={index * 170} enabled={animated}>
              <Animated.Text
                allowFontScaling={false}
                style={[
                  { fontFamily: fonts.title, fontSize: size, color, opacity: entrances[index] },
                  shadow,
                  { transform: [{ translateY: drop }, { scale: entrances[index] }] },
                ]}
              >
                {letter}
              </Animated.Text>
            </Float>
          );
        })}
      </View>
    </View>
  );
}
