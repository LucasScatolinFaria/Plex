import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import Float from "../Float";
import { colors, fonts, jes, nativeDriver, textShadow } from "../../theme";

const KIDS = [
  { letter: "K", color: colors.yellow },
  { letter: "i", color: jes.orange },
  { letter: "d", color: jes.lime },
  { letter: "s", color: colors.cyan },
];

// "JES Kids": o irmão esportivo do logo do SESI Kids. As letras são inclinadas, como em camisa de time,
// e o "Kids" entra pulando e fica quicando como bola.
export default function JesLogo({ size = 44, animated = true, style }) {
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

  const shadow = textShadow("rgba(0,20,8,0.55)", Math.max(2, size * 0.07), 0);
  const slant = { transform: [{ skewX: "-9deg" }] };

  return (
    <View
      accessibilityRole="header"
      accessibilityLabel="JES Kids"
      style={[{ flexDirection: "row", alignItems: "center" }, style]}
    >
      <Text
        allowFontScaling={false}
        style={[
          { fontFamily: fonts.title, fontSize: size * 0.86, color: colors.white, letterSpacing: size * 0.04 },
          shadow,
          slant,
        ]}
      >
        JES
      </Text>
      <View style={[{ flexDirection: "row", marginLeft: size * 0.2 }, slant]}>
        {KIDS.map(({ letter, color }, index) => {
          const drop = entrances[index].interpolate({ inputRange: [0, 1], outputRange: [-size * 0.6, 0] });
          return (
            <Float key={letter} kind="float" duration={520} delay={index * 130} enabled={animated}>
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
