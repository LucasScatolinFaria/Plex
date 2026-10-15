import { useMemo } from "react";
import { Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Bouncy from "../../../components/Bouncy";
import GameShell from "../../../components/GameShell";
import RoundsGame, { PromptCard, PromptNote, PromptTag, PromptTitle } from "../../../components/RoundsGame";
import { ENGLISH } from "../../../data/english";
import { getGame } from "../../../data/games";
import { speak } from "../../../services/feedback";
import { colors, shadow } from "../../../theme";
import { sample, shuffle } from "../../../utils/helpers";

const GAME = getGame("ingles");
const TOTAL = 10;

// fácil: vê a figura e escolhe a palavra · médio: lê a palavra e escolhe a figura · difícil: traduz do português
const SETUP = {
  facil: { pool: ENGLISH.basic, ask: "emoji", reply: "en" },
  medio: { pool: [...ENGLISH.basic, ...ENGLISH.extra], ask: "en", reply: "emoji" },
  dificil: { pool: [...ENGLISH.basic, ...ENGLISH.extra], ask: "pt", reply: "en" },
};

function buildRounds(level) {
  const { pool, reply } = SETUP[level];
  return sample(pool, TOTAL).map((word) => {
    const others = sample(pool.filter((item) => item !== word), 3);
    return { word, answer: word[reply], options: shuffle([word, ...others].map((item) => item[reply])) };
  });
}

function Board({ mode, finish, area }) {
  const { ask, reply } = SETUP[mode.id];
  const rounds = useMemo(() => buildRounds(mode.id), [mode.id]);
  const question = { emoji: "Como se diz em inglês?", en: "Qual é a figura?", pt: "Como se diz em inglês?" }[ask];

  return (
    <RoundsGame
      rounds={rounds}
      time={mode.id === "facil" ? null : 14000}
      area={area}
      finish={finish}
      unit="Palavra"
      describe={(correct, total) => `Você acertou ${correct} de ${total} palavras em inglês.`}
      // depois de responder, o Bip fala a palavra em inglês
      onAnswer={(round) => speak(round.word.en)}
      renderOption={
        reply === "emoji"
          ? (option, { height }) => (
              <Text allowFontScaling={false} style={{ fontSize: height * 0.5, lineHeight: height * 0.66 }}>
                {option}
              </Text>
            )
          : undefined
      }
      renderPrompt={(round, { answered, right }) => (
        <PromptCard style={shadow(10, 24)}>
          <PromptTag>{question}</PromptTag>
          {ask === "emoji" ? (
            <Text allowFontScaling={false} style={{ fontSize: 84, lineHeight: 104 }}>
              {round.word.emoji}
            </Text>
          ) : (
            <PromptTitle style={{ fontSize: 40, lineHeight: 50 }}>{round.word[ask]}</PromptTitle>
          )}
          {ask === "en" ? (
            <Bouncy onPress={() => speak(round.word.en)} sound={null} accessibilityLabel="Ouvir a palavra">
              <Ionicons name="volume-high" size={30} color={colors.purple} />
            </Bouncy>
          ) : null}
          <PromptNote $right={right}>
            {answered ? `${round.word.emoji} ${round.word.en} = ${round.word.pt}` : " "}
          </PromptNote>
        </PromptCard>
      )}
    />
  );
}

export default function English() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
