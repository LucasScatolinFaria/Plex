import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import Confetti from "../Confetti";
import Mascot from "../Mascot";
import TeamCrest from "../TeamCrest";
import { fx } from "../../services/feedback";
import { colors, fonts, nativeDriver, textShadow } from "../../theme";
import { getSport, getTeam } from "../../utils/jes";

const DURATION = 3000;

// Comemoração na tela inteira quando sai um ponto num jogo ao vivo: o escudo da sala cresce,
// aparece o grito do esporte ("GOOOL!", "CESTAAA!"...), toca a buzina e cai confete. Toque para fechar.
function Party({ match, side, onDone }) {
  const { width } = useWindowDimensions();
  const pop = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const finish = useRef(onDone);
  finish.current = onDone;

  const team = getTeam(side === "A" ? match.teamA : match.teamB);
  const sport = getSport(match.sport);
  const big = width >= 600;

  useEffect(() => {
    fx("goal");
    const animation = Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 70, useNativeDriver: nativeDriver }),
      Animated.timing(burst, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nativeDriver,
      }),
    ]);
    animation.start();
    const timer = setTimeout(() => finish.current(), DURATION);
    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [pop, burst]);

  return (
    <Pressable
      onPress={() => finish.current()}
      accessibilityRole="alert"
      accessibilityLabel={`${sport.score.cheer} ${team.label} ${team.name}. Placar: ${match.scoreA} a ${match.scoreB}.`}
      style={[StyleSheet.absoluteFill, styles.root]}
    >
      <Animated.View
        style={[
          styles.burst,
          { backgroundColor: team.color },
          {
            opacity: burst.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
            transform: [{ scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.2, 4] }) }],
          },
        ]}
      />
      <Animated.View
        style={{
          alignItems: "center",
          opacity: pop.interpolate({ inputRange: [0, 0.3], outputRange: [0, 1], extrapolate: "clamp" }),
          transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: big ? 18 : 8 }}>
          <TeamCrest team={team} size={big ? 150 : 112} label />
          <Mascot sporty size={big ? 104 : 70} mood="excited" />
        </View>
        <Text
          allowFontScaling={false}
          style={[
            styles.cheer,
            { fontSize: big ? 84 : 52, lineHeight: big ? 100 : 64 },
            textShadow(team.color, 4, 0),
          ]}
        >
          {sport.score.cheer}
        </Text>
        <Text style={styles.who}>
          {sport.emoji} {team.label} {team.name}
        </Text>
        <Text style={styles.score}>
          {getTeam(match.teamA).label} {match.scoreA} x {match.scoreB} {getTeam(match.teamB).label}
        </Text>
      </Animated.View>
      <Confetti count={60} />
    </Pressable>
  );
}

// Fica de olho nos placares: quando um jogo ao vivo ganha ponto, devolve a comemoração para desenhar
// por cima da tela (null no resto do tempo). Os placares que já estavam na tela ao abrir não comemoram.
export function useCelebration(matches) {
  const seen = useRef(null);
  const [party, setParty] = useState(null);

  useEffect(() => {
    const before = seen.current;
    seen.current = Object.fromEntries(matches.map((match) => [match.id, [match.scoreA, match.scoreB]]));
    if (!before) return;
    for (const match of matches) {
      const old = before[match.id];
      const side =
        !old || match.status !== "live" ? null : match.scoreA > old[0] ? "A" : match.scoreB > old[1] ? "B" : null;
      if (side) {
        setParty({ match, side, key: `${match.id}:${match.scoreA}:${match.scoreB}` });
        break;
      }
    }
  }, [matches]);

  if (!party) return null;
  return <Party key={party.key} match={party.match} side={party.side} onDone={() => setParty(null)} />;
}

const styles = StyleSheet.create({
  root: {
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(2,12,6,0.72)",
  },
  burst: { position: "absolute", width: 320, height: 320, borderRadius: 160 },
  cheer: {
    marginTop: 14,
    fontFamily: fonts.title,
    letterSpacing: 2,
    color: colors.yellow,
    transform: [{ skewX: "-9deg" }],
  },
  who: { marginTop: 4, fontFamily: fonts.title, fontSize: 24, color: colors.white },
  score: { marginTop: 6, fontFamily: fonts.heading, fontSize: 18, color: "#C9E8D3" },
});
