import { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Float from "../Float";
import useMotion from "../../hooks/useMotion";
import { glow, nativeDriver } from "../../theme";
import { followPointer, hasMouse } from "../../utils/pointer";

// no navegador os olhos deslizam até o ponto novo em vez de pular
const GAZE_EASE =
  Platform.OS === "web" ? { transitionProperty: "transform", transitionDuration: "220ms", transitionTimingFunction: "ease-out" } : null;

const SCREEN = "#1E1B4B";
const LIGHT = "#5EEAD4";

// Meio círculo só com a borda: up = "∩" (olho sorrindo), senão "∪" (sorriso)
function Arc({ width, thickness, up = false, filled = false }) {
  const radius = width / 2;
  return (
    <View style={{ width, height: radius, overflow: "hidden" }}>
      <View
        style={{
          position: "absolute",
          left: 0,
          top: up ? 0 : -radius,
          width,
          height: width,
          borderRadius: radius,
          borderWidth: filled ? 0 : thickness,
          borderColor: LIGHT,
          backgroundColor: filled ? LIGHT : "transparent",
        }}
      />
    </View>
  );
}

function Eye({ size, closed, blink }) {
  if (closed) return <Arc width={size * 1.2} thickness={size * 0.3} up />;
  return (
    <Animated.View
      style={{
        width: size,
        height: size * 1.3,
        borderRadius: size / 2,
        backgroundColor: LIGHT,
        transform: [{ scaleY: blink }],
      }}
    />
  );
}

function Mouth({ mood, unit }) {
  if (mood === "excited") return <Arc width={unit * 0.24} filled />;
  if (mood === "sad") return <Arc width={unit * 0.2} thickness={unit * 0.035} up />;
  if (mood === "thinking") {
    return <View style={{ width: unit * 0.12, height: unit * 0.035, borderRadius: unit, backgroundColor: LIGHT }} />;
  }
  return <Arc width={unit * 0.22} thickness={unit * 0.035} />;
}

// Bip, o robozinho do SESI Kids. mood = "happy" | "excited" | "sad" | "thinking" | "wink"
export default function Mascot({ size = 120, mood = "happy", style }) {
  const unit = size;
  const motion = useMotion();
  const blink = useRef(new Animated.Value(1)).current;
  const reaction = useRef(new Animated.Value(0)).current;
  const gaze = useRef(null);

  // no computador o Bip acompanha o mouse com os olhos
  useEffect(() => {
    if (!motion || !hasMouse()) return undefined;
    const stop = followPointer(({ x, y }) => {
      const node = gaze.current;
      const box = node?.getBoundingClientRect?.();
      if (!box?.width) return;
      const dx = x - (box.left + box.width / 2);
      const dy = y - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, distance / 260);
      node.style.transform = `translate(${(dx / distance) * reach * unit * 0.06}px, ${
        (dy / distance) * reach * unit * 0.04
      }px)`;
    });
    return () => {
      stop();
      if (gaze.current?.style) gaze.current.style.transform = "";
    };
  }, [motion, unit]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: nativeDriver }),
        Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: nativeDriver }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  // pula quando fica animado e balança a cabeça quando fica triste
  useEffect(() => {
    reaction.setValue(0);
    if (mood !== "excited" && mood !== "sad") return undefined;
    const animation = Animated.timing(reaction, { toValue: 1, duration: 800, useNativeDriver: nativeDriver });
    animation.start();
    return () => animation.stop();
  }, [mood, reaction]);

  const jump = reaction.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: mood === "excited" ? [0, -unit * 0.18, 0, -unit * 0.1, 0] : [0, 0, 0, 0, 0],
  });
  const tilt = reaction.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange:
      mood === "sad"
        ? ["0deg", "-9deg", "8deg", "-6deg", "4deg", "0deg"]
        : ["0deg", "0deg", "0deg", "0deg", "0deg", "0deg"],
  });

  const eye = unit * 0.11;
  const closedEyes = mood === "excited";
  const lookUp = mood === "thinking" ? -unit * 0.03 : 0;

  return (
    <Float kind="float" duration={1500} style={[{ width: unit * 1.2, alignItems: "center" }, style]}>
      <Animated.View
        style={{ width: unit * 1.2, alignItems: "center", transform: [{ translateY: jump }, { rotate: tilt }] }}
      >
        {/* antena */}
        <Float kind="beat" duration={800}>
          <View
            style={[
              {
                width: unit * 0.13,
                height: unit * 0.13,
                borderRadius: unit,
                backgroundColor: mood === "sad" ? "#94A3B8" : "#FFD23F",
              },
              mood === "sad" ? null : glow("rgba(255,210,63,0.9)", unit * 0.14),
            ]}
          />
        </Float>
        <View style={{ width: unit * 0.045, height: unit * 0.09, backgroundColor: "#C7D2FE" }} />

        {/* cabeça */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ear unit={unit} side="left" />
          <LinearGradient
            colors={["#FFFFFF", "#D9E4FF"]}
            style={{
              width: unit,
              height: unit * 0.76,
              borderRadius: unit * 0.26,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: unit * 0.78,
                height: unit * 0.52,
                borderRadius: unit * 0.18,
                backgroundColor: SCREEN,
                alignItems: "center",
                justifyContent: "center",
                gap: unit * 0.05,
              }}
            >
              <View ref={gaze} style={GAZE_EASE}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: unit * 0.2,
                    height: eye * 1.3,
                    transform: [{ translateY: lookUp }],
                  }}
                >
                  <Eye size={eye} closed={closedEyes || mood === "wink"} blink={blink} />
                  <Eye size={eye} closed={closedEyes} blink={blink} />
                </View>
              </View>
              <View style={{ height: unit * 0.12, justifyContent: "center" }}>
                <Mouth mood={mood} unit={unit} />
              </View>
              <Cheek unit={unit} side="left" />
              <Cheek unit={unit} side="right" />
            </View>
          </LinearGradient>
          <Ear unit={unit} side="right" />
        </View>

        {/* corpo */}
        <LinearGradient
          colors={["#A78BFA", "#7C3AED"]}
          style={{
            width: unit * 0.52,
            height: unit * 0.2,
            marginTop: -unit * 0.02,
            borderBottomLeftRadius: unit * 0.12,
            borderBottomRightRadius: unit * 0.12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: unit * 0.09, height: unit * 0.09, borderRadius: unit, backgroundColor: "#FFD23F" }} />
        </LinearGradient>
      </Animated.View>
    </Float>
  );
}

function Ear({ unit, side }) {
  const radius = unit * 0.04;
  return (
    <View
      style={{
        width: unit * 0.07,
        height: unit * 0.24,
        backgroundColor: "#8B5CF6",
        borderTopLeftRadius: side === "left" ? radius : 0,
        borderBottomLeftRadius: side === "left" ? radius : 0,
        borderTopRightRadius: side === "right" ? radius : 0,
        borderBottomRightRadius: side === "right" ? radius : 0,
      }}
    />
  );
}

function Cheek({ unit, side }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: unit * 0.1,
        [side]: unit * 0.07,
        width: unit * 0.1,
        height: unit * 0.06,
        borderRadius: unit,
        backgroundColor: "#FF8FB8",
        opacity: 0.8,
      }}
    />
  );
}
