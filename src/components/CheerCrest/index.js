import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

import Bouncy from "../Bouncy";
import TeamCrest from "../TeamCrest";
import { colors, fonts, nativeDriver } from "../../theme";

// Escudo que dá para tocar: a sala grita "Vai, Leões!" num balãozinho e o escudo dá um pulo.
export default function CheerCrest({ team, size = 32, label = false }) {
  const [cheering, setCheering] = useState(0);
  const pop = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function cheer() {
    setCheering((count) => count + 1);
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: nativeDriver }).start();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCheering(0), 1400);
  }

  return (
    <Bouncy
      onPress={cheer}
      sound="pop"
      pressedScale={0.85}
      hoverScale={1.12}
      accessibilityLabel={`Torcer pelo ${team.label}`}
    >
      <View>
        <TeamCrest team={team} size={size} label={label} />
        {cheering ? (
          <Animated.View
            style={{
              position: "absolute",
              bottom: size + 4,
              left: -40,
              right: -40,
              alignItems: "center",
              opacity: pop,
              transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                overflow: "hidden",
                fontFamily: fonts.title,
                fontSize: 13,
                color: "#3B2300",
                backgroundColor: colors.yellow,
              }}
            >
              Vai, {team.name || team.label}! {team.emoji}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </Bouncy>
  );
}
