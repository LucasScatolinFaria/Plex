import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { fonts, nativeDriver, textShadow } from "../../theme";
import { Pill, PillIcon, PillLabel, PillValue, Row } from "./style";

export const HUD_HEIGHT = 62;

// Linha de informações no topo do jogo (pontos, tempo, vidas...).
export function HudRow({ children }) {
  return <Row>{children}</Row>;
}

export function HudPill({ icon, value, label }) {
  return (
    <Pill accessibilityLabel={`${label}: ${value}`}>
      <PillIcon>{icon}</PillIcon>
      <View>
        <PillValue>{value}</PillValue>
        <PillLabel>{label}</PillLabel>
      </View>
    </Pill>
  );
}

function Floater({ text, color = "#FFFFFF", x, y, size = 30, onDone }) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(rise, { toValue: 1, duration: 900, useNativeDriver: nativeDriver });
    animation.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => animation.stop();
  }, [rise, onDone]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -70] });
  const opacity = rise.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const scale = rise.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.2, 1] });
  // sem x/y o texto aparece centralizado, perto do topo
  const position = x === undefined ? { top: y ?? 96, left: 0, right: 0, textAlign: "center" } : { top: y, left: x };

  return (
    <Animated.Text
      style={[
        { position: "absolute", fontFamily: fonts.title, fontSize: size, color },
        textShadow("rgba(15,5,60,0.6)", 2, 4),
        position,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

// Textos que sobem e somem ("+10", "Combo!"). Uso:
//   const [floaters, float] = useFloaters();
//   float("+10", { color: "#A3E635", x: 40, y: 120 });  ...  {floaters}
export function useFloaters() {
  const [items, setItems] = useState([]);
  const nextId = useRef(0);

  const float = useCallback((text, options = {}) => {
    nextId.current += 1;
    const id = nextId.current;
    const onDone = () => setItems((current) => current.filter((item) => item.id !== id));
    setItems((current) => [...current, { id, text, onDone, ...options }]);
  }, []);

  const layer = (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      {items.map((item) => (
        <Floater key={item.id} {...item} />
      ))}
    </View>
  );

  return [layer, float];
}
