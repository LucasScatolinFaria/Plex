import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Bunting from "../Bunting";
import JesLogo from "../JesLogo";
import Logo from "../Logo";
import Mascot from "../Mascot";
import { TEAMS } from "../../data/jes";
import { fonts, gradients, jesGradients, nativeDriver, textShadow } from "../../theme";

const FLAG_COLORS = TEAMS.map((team) => team.color);
const STRIPES = 10;
const STARS = [
  [8, 12],
  [22, 70],
  [35, 28],
  [14, 88],
  [62, 8],
  [78, 52],
  [88, 18],
  [70, 84],
  [48, 92],
  [92, 66],
  [28, 46],
  [55, 36],
];

function Field({ width }) {
  const circle = Math.min(width * 0.6, 340);
  return (
    <>
      <View style={[StyleSheet.absoluteFill, { flexDirection: "row" }]}>
        {Array.from({ length: STRIPES }, (_, index) => (
          <View
            key={index}
            style={{ flex: 1, backgroundColor: index % 2 ? "rgba(255,255,255,0.06)" : "transparent" }}
          />
        ))}
      </View>
      <View style={styles.midline} />
      <View
        style={[
          styles.circle,
          { width: circle, height: circle, borderRadius: circle, marginLeft: -circle / 2, marginTop: -circle / 2 },
        ]}
      />
    </>
  );
}

// Cortina da troca de site: no caminho para o JES Kids sobe um gramado com a bola rolando,
// e na volta para o SESI Kids desce o céu do Bip. Quando a cortina cobre tudo, o app troca de tela por baixo.
export default function ModeCurtain({ mode, onCovered, onDone }) {
  const { width, height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const callbacks = useRef({ onCovered, onDone });
  callbacks.current = { onCovered, onDone };

  useEffect(() => {
    let reveal = null;
    const cover = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });
    cover.start(({ finished }) => {
      if (!finished) return;
      callbacks.current.onCovered();
      reveal = Animated.sequence([
        Animated.delay(480),
        Animated.timing(progress, {
          toValue: 2,
          duration: 460,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: nativeDriver,
        }),
      ]);
      reveal.start(({ finished: done }) => {
        if (done) callbacks.current.onDone();
      });
    });
    return () => {
      cover.stop();
      if (reveal) reveal.stop();
    };
  }, [progress]);

  const toJes = mode === "jes";
  const translateY = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: toJes ? [height, 0, -height] : [-height, 0, height],
  });
  // o Bip Craque entra correndo pela esquerda e a bola rola pela direita até ele
  const run = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [-width * 0.7, 0, 0] });
  const roll = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [width * 0.7, 0, 0] });
  const spin = progress.interpolate({ inputRange: [0, 1, 2], outputRange: ["720deg", "0deg", "0deg"] });
  const grow = progress.interpolate({ inputRange: [0, 0.5, 1, 2], outputRange: [0.4, 0.4, 1, 1] });
  const big = width >= 600;

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, styles.root, { transform: [{ translateY }] }]}
    >
      <LinearGradient
        colors={toJes ? jesGradients.hero : gradients.space}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {toJes ? (
        <>
          <Field width={width} />
          <Bunting colors={FLAG_COLORS} count={big ? 18 : 10} size={big ? 22 : 16} style={styles.bunting} />
          <View style={styles.kickoff}>
            <Animated.View style={{ transform: [{ translateX: run }] }}>
              <Mascot sporty size={big ? 120 : 90} mood="excited" />
            </Animated.View>
            <Animated.Text
              style={[
                styles.ball,
                { fontSize: big ? 84 : 60, lineHeight: big ? 100 : 74 },
                { transform: [{ translateX: roll }, { rotate: spin }] },
              ]}
            >
              ⚽
            </Animated.Text>
          </View>
          <Animated.View style={{ alignItems: "center", transform: [{ scale: grow }] }}>
            <JesLogo size={big ? 72 : 48} />
            <Text style={[styles.tagline, textShadow("rgba(0,30,10,0.6)", 2, 0)]}>
              Jogos Estudantis SESI · 1º ao 6º ano
            </Text>
          </Animated.View>
        </>
      ) : (
        <>
          {STARS.map(([top, left]) => (
            <View key={`${top}-${left}`} style={[styles.star, { top: `${top}%`, left: `${left}%` }]} />
          ))}
          <Animated.View style={{ alignItems: "center", transform: [{ scale: grow }] }}>
            <Mascot size={big ? 120 : 92} mood="excited" />
            <Logo size={big ? 62 : 44} />
            <Text style={[styles.tagline, textShadow("rgba(15,5,60,0.5)", 2, 0)]}>
              Hora de aprender brincando! 🚀
            </Text>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  midline: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  circle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.28)",
  },
  bunting: { position: "absolute", top: 0, left: 0, right: 0 },
  kickoff: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 6 },
  ball: { marginBottom: 4 },
  tagline: { marginTop: 10, fontFamily: fonts.title, fontSize: 18, color: "#FFFFFF", textAlign: "center" },
  star: { position: "absolute", width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" },
});
