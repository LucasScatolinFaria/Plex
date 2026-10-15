// Céu animado no celular (Animated com o driver nativo). No navegador o arquivo usado é o Sky.web.js.
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import PlanetArt from "./PlanetArt";
import useLoop from "../../hooks/useLoop";
import { nativeDriver } from "../../theme";
import { DUST, ORBS, buildStars } from "./skyData";

function StarLayer({ seed, count, duration, delay, animated }) {
  const pulse = useLoop(duration, { delay, enabled: animated });
  const stars = useMemo(() => buildStars(seed, count), [seed, count]);
  const opacity = animated ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) : 0.8;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
      {stars.map((star) => (
        <View key={star.key} style={[styles.star, star.style]} />
      ))}
    </Animated.View>
  );
}

function Orb({ color, size, position, duration, animated }) {
  const float = useLoop(duration, { enabled: animated });
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -34] });
  const translateX = float.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });

  return (
    <Animated.View
      style={[
        styles.orb,
        position,
        { width: size, height: size, borderRadius: size, backgroundColor: color },
        { transform: [{ translateX }, { translateY }] },
      ]}
    />
  );
}

// no celular o planeta fica menor e encostado no canto, para não brigar com o conteúdo
function Planet({ animated, compact }) {
  const float = useLoop(5200, { enabled: animated });
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });

  return (
    <Animated.View
      style={[
        styles.planet,
        compact ? { top: "2%", right: -22 } : { top: "12%", right: "3%" },
        { transform: [{ translateY }, { rotate: "-18deg" }] },
      ]}
    >
      <PlanetArt size={compact ? 54 : 104} compact={compact} />
    </Animated.View>
  );
}

// grãozinhos de poeira estelar subindo bem devagar
function Dust({ particle }) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rise.setValue(particle.start);
    const first = Animated.timing(rise, {
      toValue: 1,
      duration: particle.duration * (1 - particle.start),
      easing: Easing.linear,
      useNativeDriver: nativeDriver,
    });
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(rise, { toValue: 0, duration: 0, useNativeDriver: nativeDriver }),
        Animated.timing(rise, {
          toValue: 1,
          duration: particle.duration,
          easing: Easing.linear,
          useNativeDriver: nativeDriver,
        }),
      ])
    );
    const animation = Animated.sequence([first, loop]);
    animation.start();
    return () => animation.stop();
  }, [rise, particle]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -900] });
  const translateX = rise.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, particle.sway, 0, -particle.sway, 0],
  });
  const opacity = rise.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, particle.opacity, particle.opacity, 0] });

  return (
    <Animated.View
      style={[
        styles.dust,
        { left: particle.left, width: particle.size, height: particle.size, borderRadius: particle.size },
        { backgroundColor: particle.color, opacity, transform: [{ translateX }, { translateY }] },
      ]}
    />
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

export default function Sky({ animated, calm, planet, compact }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.decor]}>
      {ORBS.map((orb) => (
        <Orb key={orb.color} {...orb} duration={orb.duration / 2} animated={animated} />
      ))}
      <StarLayer seed={7} count={26} duration={1700} delay={0} animated={animated} />
      <StarLayer seed={41} count={22} duration={2300} delay={500} animated={animated} />
      <StarLayer seed={93} count={18} duration={2900} delay={1100} animated={animated} />
      {!calm && animated ? DUST.map((particle) => <Dust key={particle.key} particle={particle} />) : null}
      {planet ? <Planet animated={animated} compact={compact} /> : null}
      {!calm && animated ? <ShootingStar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { pointerEvents: "none" },
  star: { position: "absolute", backgroundColor: "#FFFFFF" },
  orb: { position: "absolute", opacity: 0.2 },
  planet: { position: "absolute", opacity: 0.85 },
  dust: { position: "absolute", bottom: -8 },
  shootingStar: { position: "absolute", top: "10%", right: "16%" },
});
