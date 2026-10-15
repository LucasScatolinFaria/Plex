import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

import GameShell from "../../../components/GameShell";
import RoundsGame, { PromptCard, PromptNote, PromptTag } from "../../../components/RoundsGame";
import { getGame } from "../../../data/games";
import { colors, fonts, nativeDriver, shadow } from "../../../theme";
import { pick, randomInt, shuffle } from "../../../utils/helpers";

const GAME = getGame("relogio");
const TOTAL = 8;
// minutos que podem aparecer em cada nível
const MINUTES = {
  facil: [0],
  medio: [0, 15, 30, 45],
  dificil: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
};

const format = (hour, minute) => `${hour}:${String(minute).padStart(2, "0")}`;

function spell(hour, minute) {
  const hours = hour === 1 ? "É 1 hora" : `São ${hour} horas`;
  if (minute === 0) return `${hours} em ponto.`;
  if (minute === 30) return `${hours} e meia.`;
  return `${hours} e ${minute} minutos.`;
}

function buildRounds(level) {
  const rounds = [];
  while (rounds.length < TOTAL) {
    const hour = randomInt(1, 12);
    const minute = pick(MINUTES[level]);
    const answer = format(hour, minute);
    if (rounds.some((round) => round.answer === answer)) continue;

    // erros comuns: trocar os ponteiros, errar a hora por 1 e errar os minutos
    const traps = shuffle([
      format(minute === 0 ? 12 : minute / 5, (hour % 12) * 5),
      format(hour === 12 ? 1 : hour + 1, minute),
      format(hour === 1 ? 12 : hour - 1, minute),
      format(hour, (minute + 30) % 60),
      format(hour, (minute + 15) % 60),
    ]);
    const options = new Set([answer]);
    traps.forEach((trap) => {
      if (options.size < 4) options.add(trap);
    });
    rounds.push({ hour, minute, answer, options: shuffle([...options]) });
  }
  return rounds;
}

// Um ponteiro é uma barrinha dentro de uma moldura do tamanho do relógio; girar a moldura gira o ponteiro pelo centro.
function Hand({ size, length, thickness, color, angle }) {
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    sweep.setValue(0);
    Animated.timing(sweep, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: nativeDriver,
    }).start();
  }, [sweep, angle]);

  const rotate = sweep.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${angle}deg`] });

  return (
    <Animated.View
      style={{ position: "absolute", width: size, height: size, alignItems: "center", transform: [{ rotate }] }}
    >
      <View
        style={{
          marginTop: size / 2 - length,
          width: thickness,
          height: length,
          borderRadius: thickness,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  );
}

function ClockFace({ size, hour, minute }) {
  const radius = size * 0.39;

  return (
    <View
      accessibilityLabel="Relógio de ponteiros"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size * 0.045,
          borderColor: GAME.colors[1],
          backgroundColor: "#FFF7ED",
        },
        shadow(6, 14, "rgba(60,20,0,0.25)"),
      ]}
    >
      <View style={{ position: "absolute", top: -size * 0.045, left: -size * 0.045, width: size, height: size }}>
        {Array.from({ length: 12 }, (_, index) => {
          const number = index + 1;
          const angle = (number * Math.PI) / 6;
          const box = size * 0.16;
          return (
            <Text
              key={number}
              allowFontScaling={false}
              style={{
                position: "absolute",
                width: box,
                height: box,
                left: size / 2 + radius * Math.sin(angle) - box / 2,
                top: size / 2 - radius * Math.cos(angle) - box / 2,
                fontFamily: fonts.title,
                fontSize: size * 0.105,
                lineHeight: box,
                textAlign: "center",
                color: colors.ink,
              }}
            >
              {number}
            </Text>
          );
        })}
        <Hand size={size} length={size * 0.22} thickness={size * 0.05} color={colors.ink} angle={(hour % 12) * 30 + minute / 2} />
        <Hand size={size} length={size * 0.33} thickness={size * 0.032} color={colors.coral} angle={minute * 6} />
        <View
          style={{
            position: "absolute",
            left: size / 2 - size * 0.04,
            top: size / 2 - size * 0.04,
            width: size * 0.08,
            height: size * 0.08,
            borderRadius: size,
            backgroundColor: colors.ink,
          }}
        />
      </View>
    </View>
  );
}

function Board({ mode, finish, area }) {
  const rounds = useMemo(() => buildRounds(mode.id), [mode.id]);
  const clockSize = Math.max(150, Math.min(250, area.height - 470, area.width - 80));

  return (
    <RoundsGame
      rounds={rounds}
      area={area}
      finish={finish}
      unit="Relógio"
      describe={(correct, total) => `Você leu ${correct} de ${total} relógios direitinho.`}
      renderPrompt={(round, { answered, right }) => (
        <PromptCard style={shadow(10, 24)}>
          <PromptTag>Que horas são?</PromptTag>
          <ClockFace size={clockSize} hour={round.hour} minute={round.minute} />
          <PromptNote $right={right}>{answered ? spell(round.hour, round.minute) : "Olhe os dois ponteiros."}</PromptNote>
        </PromptCard>
      )}
    />
  );
}

export default function Clock() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
