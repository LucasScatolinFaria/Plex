import { useMemo } from "react";
import { Text, View } from "react-native";

import GameShell from "../../../components/GameShell";
import RoundsGame, { PromptCard, PromptNote, PromptTag } from "../../../components/RoundsGame";
import { getGame } from "../../../data/games";
import { colors, fonts, shadow } from "../../../theme";
import { pick, randomInt } from "../../../utils/helpers";

const GAME = getGame("comparar");
const TOTAL = 10;
const SIGNS = ["<", "=", ">"];
const NAMES = { "<": "menor que", "=": "igual a", ">": "maior que" };
const TIME = { facil: 12000, medio: 11000, dificil: 10000 };

const number = (value) => ({ text: String(value), value });

// um lado da comparação: um número sozinho ou uma continha
function makeSide(level) {
  if (level === "facil") return number(randomInt(0, 20));

  const kind = pick(level === "medio" ? ["numero", "numero", "soma"] : ["soma", "subtrai", "vezes", "numero"]);
  if (kind === "soma") {
    const a = randomInt(2, level === "medio" ? 12 : 40);
    const b = randomInt(2, level === "medio" ? 12 : 40);
    return { text: `${a} + ${b}`, value: a + b };
  }
  if (kind === "subtrai") {
    const a = randomInt(20, 90);
    const b = randomInt(2, 19);
    return { text: `${a} − ${b}`, value: a - b };
  }
  if (kind === "vezes") {
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    return { text: `${a} × ${b}`, value: a * b };
  }
  return number(randomInt(0, level === "medio" ? 999 : 90));
}

function buildRounds(level) {
  return Array.from({ length: TOTAL }, (_, index) => {
    const left = makeSide(level);
    // de vez em quando os dois lados valem a mesma coisa
    const right = index % 5 === 3 ? number(left.value) : makeSide(level);
    const answer = left.value < right.value ? "<" : left.value > right.value ? ">" : "=";
    return { left, right, answer, options: SIGNS };
  });
}

function Side({ side, size, width }) {
  return (
    <View
      style={{
        flex: 1,
        height: size,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.cloud,
      }}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={{
          fontFamily: fonts.title,
          // a conta inteira precisa caber na largura do cartão
          fontSize: Math.min(size * 0.44, width / (side.text.length * 0.62)),
          color: colors.ink,
        }}
      >
        {side.text}
      </Text>
    </View>
  );
}

function Board({ mode, finish, area }) {
  const rounds = useMemo(() => buildRounds(mode.id), [mode.id]);
  const size = Math.max(84, Math.min(130, area.height - 520));
  const sideWidth = (area.width - 32 - 58 - 20) / 2 - 12;

  return (
    <RoundsGame
      rounds={rounds}
      time={TIME[mode.id]}
      area={area}
      finish={finish}
      columns={3}
      unit="Comparação"
      optionLabel={(sign) => `${sign} ${NAMES[sign]}`}
      describe={(correct, total) => `Você acertou ${correct} de ${total} comparações.`}
      renderOption={(sign, { height }) => (
        <>
          <Text allowFontScaling={false} style={{ fontFamily: fonts.title, fontSize: height * 0.42, color: colors.white }}>
            {sign}
          </Text>
          <Text allowFontScaling={false} style={{ fontFamily: fonts.body, fontSize: 12, color: colors.white }}>
            {NAMES[sign].split(" ")[0]}
          </Text>
        </>
      )}
      renderPrompt={(round, { answered, right }) => (
        <PromptCard style={shadow(10, 24)}>
          <PromptTag>Qual sinal completa?</PromptTag>
          <View style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Side side={round.left} size={size} width={sideWidth} />
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: answered ? colors.green : GAME.colors[1],
              }}
            >
              <Text allowFontScaling={false} style={{ fontFamily: fonts.title, fontSize: 32, color: colors.white }}>
                {answered ? round.answer : "?"}
              </Text>
            </View>
            <Side side={round.right} size={size} width={sideWidth} />
          </View>
          <PromptNote $right={right}>
            {answered
              ? `${round.left.value} é ${NAMES[round.answer]} ${round.right.value}.`
              : "🐊 A boca do jacaré abre para o maior!"}
          </PromptNote>
        </PromptCard>
      )}
    />
  );
}

export default function Compare() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
