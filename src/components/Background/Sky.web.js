// Céu animado no navegador. Tudo aqui é animação de CSS: quem desenha é a placa de vídeo, sem
// ocupar o JavaScript a cada quadro (os jogos de reflexo agradecem). No celular o arquivo é o Sky.native.js.
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import PlanetArt from "./PlanetArt";
import { DUST, ORBS, buildStars, seeded } from "./skyData";
import { followPointer, hasMouse } from "../../utils/pointer";

const ms = (value) => `${Math.round(value)}ms`;

// cada estrela pisca no seu próprio ritmo
function buildTwinkles(seed, count) {
  const next = seeded(seed + 1000);
  return buildStars(seed, count).map((star) => {
    const tint = next();
    return {
      ...star,
      duration: 2400 + next() * 4200,
      delay: -next() * 6000,
      tint: tint < 0.15 ? "#FFE9A8" : tint < 0.27 ? "#C4F1FF" : "#FFFFFF",
    };
  });
}

const SPARKLES = [
  { top: "14%", left: "22%", size: 14, duration: 9000, delay: 1200 },
  { top: "28%", left: "84%", size: 12, duration: 11000, delay: 4800 },
  { top: "64%", left: "9%", size: 11, duration: 13000, delay: 7600 },
  { top: "78%", left: "68%", size: 13, duration: 10000, delay: 2900 },
  { top: "44%", left: "46%", size: 10, duration: 15000, delay: 10400 },
];

const SHOOTING_STARS = [
  { top: "9%", right: "14%", duration: 9000, delay: 2400, length: 110 },
  { top: "34%", right: "38%", duration: 14000, delay: 8200, length: 80 },
];

// quanto cada camada se mexe acompanhando o mouse (efeito de profundidade):
// estrelas de longe, estrelas de perto, nebulosa (em px)
const DEPTHS = [6, 14, 26];

function Twinkles({ stars, animated }) {
  return stars.map((star) => (
    <View
      key={star.key}
      style={[
        styles.star,
        star.style,
        { backgroundColor: star.tint },
        star.size > 3.3 ? styles.starGlow : null,
        animated ? styles.twinkle : null,
        animated ? { animationDuration: ms(star.duration), animationDelay: ms(star.delay) } : null,
      ]}
    />
  ));
}

function Sparkle({ top, left, size, duration, delay }) {
  return (
    <View
      style={[
        styles.sparkle,
        { top, left, width: size, height: size },
        { animationDuration: ms(duration), animationDelay: ms(delay) },
      ]}
    >
      <View style={[styles.sparkleBar, { width: size, height: 2, top: size / 2 - 1 }]} />
      <View style={[styles.sparkleBar, { width: 2, height: size, left: size / 2 - 1 }]} />
    </View>
  );
}

function ShootingStar({ top, right, duration, delay, length }) {
  return (
    <View style={[styles.shootingStar, { top, right, animationDuration: ms(duration), animationDelay: ms(delay) }]}>
      <LinearGradient
        colors={["#FFFFFF", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: length, height: 2.5, borderRadius: 2 }}
      />
    </View>
  );
}

function Dust({ particle }) {
  return (
    <View
      style={[
        styles.dust,
        { left: particle.left },
        { animationDuration: ms(particle.duration), animationDelay: ms(-particle.start * particle.duration) },
      ]}
    >
      <View
        style={[
          styles.dustGrain,
          { width: particle.size, height: particle.size, borderRadius: particle.size },
          { backgroundColor: particle.color, opacity: particle.opacity },
          { animationDuration: ms(particle.duration / 4) },
        ]}
      />
    </View>
  );
}

export default function Sky({ animated, calm, planet, compact }) {
  const far = useRef(null);
  const near = useRef(null);
  const nebula = useRef(null);
  const farStars = useMemo(() => buildTwinkles(7, 34), []);
  const nearStars = useMemo(() => buildTwinkles(93, 26), []);

  // o céu acompanha o mouse só em telas com mouse, fora dos jogos e com os efeitos ligados
  useEffect(() => {
    const layers = [far, near, nebula];
    if (!animated || calm || !hasMouse()) return undefined;
    const stop = followPointer((pointer) => {
      const x = pointer.x / window.innerWidth - 0.5;
      const y = pointer.y / window.innerHeight - 0.5;
      layers.forEach((layer, index) => {
        if (layer.current) {
          layer.current.style.transform = `translate3d(${-x * DEPTHS[index]}px, ${-y * DEPTHS[index]}px, 0)`;
        }
      });
    });
    return () => {
      stop();
      layers.forEach((layer) => {
        if (layer.current) layer.current.style.transform = "";
      });
    };
  }, [animated, calm]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.decor]}>
      <View ref={nebula} style={[StyleSheet.absoluteFill, styles.parallax]}>
        {ORBS.map((orb) => (
          <View
            key={orb.color}
            style={[
              styles.orb,
              orb.position,
              { width: orb.size, height: orb.size, borderRadius: orb.size, backgroundColor: orb.color },
              animated ? styles.drift : null,
              animated ? { animationDuration: ms(orb.duration / 2) } : null,
            ]}
          />
        ))}
      </View>

      <View ref={far} style={[StyleSheet.absoluteFill, styles.parallax]}>
        <Twinkles stars={farStars} animated={animated} />
      </View>

      <View ref={near} style={[StyleSheet.absoluteFill, styles.parallax]}>
        <Twinkles stars={nearStars} animated={animated} />
        {!calm && animated ? SPARKLES.map((sparkle) => <Sparkle key={sparkle.top} {...sparkle} />) : null}
      </View>

      {!calm && animated ? DUST.map((particle) => <Dust key={particle.key} particle={particle} />) : null}

      {planet ? (
        <View
          style={[
            styles.planet,
            compact ? { top: "2%", right: -22 } : { top: "12%", right: "3%" },
            animated ? styles.planetFloat : { transform: [{ rotate: "-18deg" }] },
          ]}
        >
          <PlanetArt size={compact ? 54 : 104} compact={compact} />
        </View>
      ) : null}

      {!calm && animated ? SHOOTING_STARS.map((star) => <ShootingStar key={star.top} {...star} />) : null}
    </View>
  );
}

const loop = { animationIterationCount: "infinite" };

const styles = StyleSheet.create({
  decor: { pointerEvents: "none", overflow: "hidden" },
  parallax: {
    transitionProperty: "transform",
    transitionDuration: "900ms",
    transitionTimingFunction: "cubic-bezier(0.2, 0.7, 0.3, 1)",
  },
  star: { position: "absolute" },
  starGlow: { boxShadow: "0px 0px 6px rgba(255,255,255,0.85)" },
  twinkle: {
    ...loop,
    animationTimingFunction: "ease-in-out",
    animationKeyframes: {
      "0%": { opacity: 0.2, transform: [{ scale: 0.7 }] },
      "50%": { opacity: 1, transform: [{ scale: 1 }] },
      "100%": { opacity: 0.2, transform: [{ scale: 0.7 }] },
    },
  },
  orb: { position: "absolute", opacity: 0.2, filter: "blur(38px)" },
  drift: {
    ...loop,
    animationDirection: "alternate",
    animationTimingFunction: "ease-in-out",
    animationKeyframes: {
      "0%": { transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] },
      "100%": { transform: [{ translateX: 22 }, { translateY: -38 }, { scale: 1.1 }] },
    },
  },
  sparkle: {
    position: "absolute",
    opacity: 0,
    ...loop,
    animationTimingFunction: "ease-out",
    animationKeyframes: {
      "0%": { opacity: 0, transform: [{ scale: 0 }, { rotate: "0deg" }] },
      "5%": { opacity: 0.9, transform: [{ scale: 1 }, { rotate: "45deg" }] },
      "11%": { opacity: 0, transform: [{ scale: 0 }, { rotate: "90deg" }] },
      "100%": { opacity: 0, transform: [{ scale: 0 }, { rotate: "90deg" }] },
    },
  },
  sparkleBar: {
    position: "absolute",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 0px 6px rgba(255,255,255,0.9)",
  },
  dust: {
    position: "absolute",
    bottom: -10,
    opacity: 0,
    ...loop,
    animationTimingFunction: "linear",
    animationKeyframes: {
      "0%": { opacity: 0, transform: [{ translateY: 0 }] },
      "12%": { opacity: 1 },
      "85%": { opacity: 1 },
      "100%": { opacity: 0, transform: [{ translateY: "-105vh" }] },
    },
  },
  dustGrain: {
    ...loop,
    animationDirection: "alternate",
    animationTimingFunction: "ease-in-out",
    animationKeyframes: {
      "0%": { transform: [{ translateX: -10 }] },
      "100%": { transform: [{ translateX: 10 }] },
    },
  },
  planet: { position: "absolute", opacity: 0.85 },
  planetFloat: {
    ...loop,
    animationDuration: "5200ms",
    animationDirection: "alternate",
    animationTimingFunction: "ease-in-out",
    animationKeyframes: {
      "0%": { transform: [{ translateY: 0 }, { rotate: "-18deg" }] },
      "100%": { transform: [{ translateY: -14 }, { rotate: "-14deg" }] },
    },
  },
  shootingStar: {
    position: "absolute",
    opacity: 0,
    ...loop,
    animationTimingFunction: "ease-in",
    animationKeyframes: {
      "0%": { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: "-32deg" }] },
      "1%": { opacity: 1 },
      "8%": { opacity: 0, transform: [{ translateX: -420 }, { translateY: 260 }, { rotate: "-32deg" }] },
      "100%": { opacity: 0, transform: [{ translateX: -420 }, { translateY: 260 }, { rotate: "-32deg" }] },
    },
  },
});
