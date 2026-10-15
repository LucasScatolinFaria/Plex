import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import useLoop from "../../hooks/useLoop";
import useMotion from "../../hooks/useMotion";
import { gradients, nativeDriver } from "../../theme";

// Sorteio com semente: o céu fica igual toda vez que a tela é desenhada.
function buildStars(seed, count) {
  let value = seed;
  const next = () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
  return Array.from({ length: count }, (_, index) => {
    const size = 1.5 + next() * 2.5;
    return {
      key: index,
      style: {
        position: "absolute",
        left: `${next() * 100}%`,
        top: `${next() * 100}%`,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: "#FFFFFF",
        opacity: 0.5 + next() * 0.5,
      },
    };
  });
}

function StarLayer({ seed, count, duration, delay, animated }) {
  const pulse = useLoop(duration, { delay, enabled: animated });
  const stars = useMemo(() => buildStars(seed, count), [seed, count]);
  const opacity = animated ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) : 0.8;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
      {stars.map((star) => (
        <View key={star.key} style={star.style} />
      ))}
    </Animated.View>
  );
}

const blur = Platform.OS === "web" ? { filter: "blur(38px)" } : null;

function Orb({ color, size, position, duration, animated }) {
  const float = useLoop(duration, { enabled: animated });
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -34] });
  const translateX = float.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });

  return (
    <Animated.View
      style={[
        styles.orb,
        position,
        blur,
        { width: size, height: size, borderRadius: size, backgroundColor: color },
        { transform: [{ translateX }, { translateY }] },
      ]}
    />
  );
}

// no celular o planeta fica menor e encostado no canto, para não brigar com o conteúdo
function Planet({ animated, compact }) {
  const size = compact ? 54 : 104;
  const float = useLoop(5200, { enabled: animated });
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const ball = { width: size, height: size, borderRadius: size };

  return (
    <Animated.View
      style={[
        styles.planet,
        compact ? { top: "2%", right: -22 } : { top: "12%", right: "3%" },
        { transform: [{ translateY }, { rotate: "-18deg" }] },
      ]}
    >
      <View style={{ width: size * 1.8, height: size, alignItems: "center" }}>
        <LinearGradient colors={["#FFC56B", "#FF5FA2"]} style={ball} />
        <View
          style={[
            styles.ring,
            { width: size * 1.8, height: size * 0.4, top: size * 0.3, borderWidth: compact ? 3 : 5 },
          ]}
        />
        {/* a metade de cima fica na frente do anel, para ele parecer dar a volta */}
        <View style={{ position: "absolute", top: 0, width: size, height: size / 2, overflow: "hidden" }}>
          <LinearGradient colors={["#FFC56B", "#FF5FA2"]} style={ball} />
        </View>
      </View>
    </Animated.View>
  );
}

function ShootingStar() {
  const flight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(5200),
        Animated.timing(flight, {
          toValue: 1,
          duration: 1100,
          easing: Easing.in(Easing.quad),
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(flight, { toValue: 0, duration: 0, useNativeDriver: nativeDriver }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flight]);

  const translateX = flight.interpolate({ inputRange: [0, 1], outputRange: [0, -420] });
  const translateY = flight.interpolate({ inputRange: [0, 1], outputRange: [0, 260] });
  const opacity = flight.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View
      style={[styles.shootingStar, { opacity, transform: [{ translateX }, { translateY }, { rotate: "-32deg" }] }]}
    >
      <LinearGradient
        colors={["#FFFFFF", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: 96, height: 3, borderRadius: 2 }}
      />
    </Animated.View>
  );
}

// "calm" tira o planeta e a estrela cadente (usado dentro dos jogos, para não distrair).
// "planet={false}" tira só o planeta (telas cheias de conteúdo, como as abas).
export default function Background({ children, colors = gradients.space, calm = false, planet = true, style }) {
  const animated = useMotion();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.decor]}>
        <Orb color="#FF5FA2" size={260} position={{ top: "8%", left: -90 }} duration={6200} animated={animated} />
        <Orb color="#22D3EE" size={300} position={{ bottom: "6%", right: -110 }} duration={7400} animated={animated} />
        <Orb color="#FFD23F" size={180} position={{ top: "46%", left: "58%" }} duration={5400} animated={animated} />
        <StarLayer seed={7} count={26} duration={1700} delay={0} animated={animated} />
        <StarLayer seed={41} count={22} duration={2300} delay={500} animated={animated} />
        <StarLayer seed={93} count={18} duration={2900} delay={1100} animated={animated} />
        {!calm && planet && <Planet animated={animated} compact={width < 900} />}
        {!calm && animated && <ShootingStar />}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1B0E52", overflow: "hidden" },
  decor: { pointerEvents: "none" },
  orb: { position: "absolute", opacity: 0.2 },
  planet: { position: "absolute", opacity: 0.85 },
  ring: {
    position: "absolute",
    borderRadius: 100,
    borderColor: "rgba(255,226,122,0.9)",
  },
  shootingStar: { position: "absolute", top: "10%", right: "16%" },
});
