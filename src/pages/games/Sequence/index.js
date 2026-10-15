import { useMemo } from "react";
import { Text, View } from "react-native";

import GameShell from "../../../components/GameShell";
import RoundsGame, { PromptCard, PromptNote, PromptTag } from "../../../components/RoundsGame";
import { getGame } from "../../../data/games";
import { colors, fonts, shadow } from "../../../theme";
import { pick, randomInt, sample, shuffle } from "../../../utils/helpers";

const GAME = getGame("sequencia");
const TOTAL = 8;
const SYMBOLS = ["🍎", "🍌", "🍇", "🍓", "⭐", "🌙", "🐶", "🐱", "🐸", "🚀", "🎈", "⚽"];
const PATTERNS = [
  { shape: "AB", rule: "As figuras se repetem de 2 em 2." },
  { shape: "AAB", rule: "O padrão é: duas iguais e uma diferente." },
  { shape: "ABB", rule: "O padrão é: uma diferente e duas iguais." },
  { shape: "ABC", rule: "As figuras se repetem de 3 em 3." },
];

// monta a rodada escondendo um dos itens; "hole" é a posição que vira "?"
function makeRound(items, hole, rule, wrongs) {
  const answer = String(items[hole]);
  const options = new Set([answer]);
  wrongs.map(String).forEach((wrong) => {
    if (options.size < 4) options.add(wrong);
  });
  return {
    key: items.join(), // a sequência completa, para não repetir a mesma na partida
    items: items.map((item, index) => (index === hole ? "?" : String(item))),
    hole,
    answer,
    rule,
    options: shuffle([...options]),
  };
}

function emojiRound() {
  const { shape, rule } = pick(PATTERNS);
  const [a, b, c, ...rest] = sample(SYMBOLS, 6);
  const symbols = { A: a, B: b, C: c };
  const items = Array.from({ length: 7 }, (_, index) => symbols[shape[index % shape.length]]);
  return makeRound(items, 6, rule, [a, b, c, ...rest]);
}

function numberRound(level) {
  const kind = pick(level === "medio" ? ["soma", "soma", "subtrai"] : ["dobro", "cresce", "quadrado", "soma"]);
  let items;
  let rule;

  if (kind === "soma") {
    const step = pick(level === "medio" ? [1, 2, 3, 5, 10] : [4, 6, 7, 9, 11]);
    const start = randomInt(1, 20);
    items = Array.from({ length: 6 }, (_, index) => start + step * index);
    rule = `A regra é somar ${step} a cada passo.`;
  } else if (kind === "subtrai") {
    const step = pick([1, 2, 3, 5]);
    const start = randomInt(step * 6, step * 6 + 20);
    items = Array.from({ length: 6 }, (_, index) => start - step * index);
    rule = `A regra é tirar ${step} a cada passo.`;
  } else if (kind === "dobro") {
    const start = randomInt(1, 3);
    items = Array.from({ length: 6 }, (_, index) => start * 2 ** index);
    rule = "Cada número é o dobro do anterior.";
  } else if (kind === "cresce") {
    const start = randomInt(1, 5);
    items = [start];
    for (let step = 1; step < 6; step++) items.push(items[step - 1] + step);
    rule = "Os saltos crescem: +1, +2, +3, +4...";
  } else {
    items = Array.from({ length: 6 }, (_, index) => (index + 1) ** 2);
    rule = "São os quadrados: 1×1, 2×2, 3×3, 4×4...";
  }

  // no médio falta o último; no difícil pode faltar um do meio
  const hole = level === "medio" ? 5 : pick([2, 3, 4, 5]);
  const answer = items[hole];
  const gap = Math.abs(items[1] - items[0]) || 1;
  const wrongs = shuffle([answer + 1, answer - 1, answer + gap, answer - gap, answer + 2, answer + 10]).filter(
    (value) => value > 0 && value !== answer
  );
  return makeRound(items, hole, rule, wrongs);
}

function buildRounds(level) {
  const rounds = [];
  while (rounds.length < TOTAL) {
    const round = level === "facil" ? emojiRound() : numberRound(level);
    if (round.options.length === 4 && !rounds.some((item) => item.key === round.key)) rounds.push(round);
  }
  return rounds;
}

function Board({ mode, finish, area }) {
  const rounds = useMemo(() => buildRounds(mode.id), [mode.id]);
  const numbers = mode.id !== "facil";
  const bubble = Math.max(34, Math.min(numbers ? 66 : 54, Math.floor((area.width - 44 - 6 * 6) / 7)));

  return (
    <RoundsGame
      rounds={rounds}
      time={mode.id === "dificil" ? 20000 : null}
      area={area}
      finish={finish}
      unit="Desafio"
      describe={(correct, total) => `Você descobriu ${correct} de ${total} sequências.`}
      renderOption={
        numbers
          ? undefined
          : (option, { height }) => (
              <Text allowFontScaling={false} style={{ fontSize: height * 0.5, lineHeight: height * 0.66 }}>
                {option}
              </Text>
            )
      }
      renderPrompt={(round, { answered, right }) => (
        <PromptCard style={shadow(10, 24)}>
          <PromptTag>{round.hole === round.items.length - 1 ? "O que vem depois?" : "Qual está faltando?"}</PromptTag>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
            {round.items.map((item, index) => {
              const missing = index === round.hole;
              return (
                <View
                  key={index}
                  style={{
                    minWidth: bubble,
                    height: bubble,
                    paddingHorizontal: numbers ? 6 : 0,
                    borderRadius: bubble * 0.3,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: missing ? 3 : 0,
                    borderStyle: missing && !answered ? "dashed" : "solid",
                    borderColor: answered ? colors.green : GAME.colors[1],
                    backgroundColor: missing ? (answered ? "#DCFCE7" : colors.white) : colors.cloud,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: fonts.title,
                      fontSize: bubble * (numbers ? 0.42 : 0.56),
                      lineHeight: bubble * 0.8,
                      color: missing && !answered ? GAME.colors[1] : colors.ink,
                    }}
                  >
                    {missing && answered ? round.answer : item}
                  </Text>
                </View>
              );
            })}
          </View>
          <PromptNote $right={right}>{answered ? round.rule : "Descubra a regra da sequência."}</PromptNote>
        </PromptCard>
      )}
    />
  );
}

export default function Sequence() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
