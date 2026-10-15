import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, ScrollView } from "react-native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import GameShell from "../../../components/GameShell";
import { HudPill, HudRow, useFloaters } from "../../../components/Hud";
import { TimerBar } from "../../../components/ProgressBar";
import { getGame } from "../../../data/games";
import { QUIZ, QUIZ_ALL } from "../../../data/quiz";
import useShake from "../../../hooks/useShake";
import { fx } from "../../../services/feedback";
import { colors, nativeDriver, shadow } from "../../../theme";
import { sample, shuffle } from "../../../utils/helpers";
import {
  Fact,
  FactText,
  FactTitle,
  Option,
  OptionLetter,
  OptionText,
  Options,
  QuestionCard,
  QuestionTag,
  QuestionText,
} from "./style";

const GAME = getGame("quiz");
const TOTAL = 8;
const TIME = 20000;
const LETTERS = ["A", "B", "C", "D"];
const LETTER_COLORS = ["#38BDF8", "#FF5FA2", "#FFB020", "#8B5CF6"];

// Sorteia as perguntas do tema e embaralha as alternativas (no arquivo a certa é sempre a primeira).
function buildRound(theme) {
  const pool = theme === "mix" ? QUIZ_ALL : QUIZ[theme];
  return sample(pool, TOTAL).map((item) => ({
    ...item,
    answer: item.options[0],
    options: shuffle(item.options),
  }));
}

function Board({ mode, finish }) {
  const questions = useMemo(() => buildRound(mode.id), [mode.id]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null); // alternativa tocada, ou "tempo" se o relógio zerou
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const clock = useRef(new Animated.Value(1)).current;
  const locked = useRef(false);
  const [floaters, float] = useFloaters();
  const [shakeStyle, shake] = useShake();

  const over = index >= TOTAL;
  const question = questions[Math.min(index, TOTAL - 1)];
  const answered = chosen !== null;

  function answer(option) {
    if (locked.current) return;
    locked.current = true;
    const right = option === question.answer;
    setChosen(option);
    clock.stopAnimation((timeLeft) => {
      if (!right) return;
      const gained = 10 + Math.round(timeLeft * 5);
      setScore((current) => current + gained);
      float(`+${gained}`, { color: colors.lime });
    });

    if (right) {
      fx("correct");
      setCorrect(correct + 1);
    } else {
      fx("wrong");
      shake();
    }
  }

  function next() {
    locked.current = false;
    setChosen(null);
    setIndex(index + 1);
  }

  useEffect(() => {
    if (over) return undefined;
    clock.setValue(1);
    const countdown = Animated.timing(clock, {
      toValue: 0,
      duration: TIME,
      easing: Easing.linear,
      useNativeDriver: nativeDriver,
    });
    countdown.start(({ finished }) => {
      if (finished) answer("tempo");
    });
    return () => countdown.stop();
  }, [index, over]);

  useEffect(() => {
    if (!over) return;
    finish({
      score,
      stars: correct >= 7 ? 3 : correct >= 5 ? 2 : correct >= 3 ? 1 : 0,
      message: `Você acertou ${correct} de ${TOTAL} perguntas.`,
      stats: [{ label: "Acertos", value: `${correct}/${TOTAL}` }],
      detail: { correct },
    });
  }, [over, finish, score, correct]);

  function optionState(option) {
    if (!answered) return "idle";
    if (option === question.answer) return "right";
    return option === chosen ? "wrong" : "dim";
  }

  return (
    <>
      <HudRow>
        <HudPill icon="❓" value={`${Math.min(index + 1, TOTAL)}/${TOTAL}`} label="Pergunta" />
        <HudPill icon="⭐" value={score} label="Pontos" />
        <HudPill icon="✅" value={correct} label="Acertos" />
      </HudRow>
      <TimerBar progress={clock} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 14 }}
      >
        <Animated.View style={shakeStyle}>
          <Appear key={index} from="scale">
            <QuestionCard style={shadow(10, 24)}>
              <QuestionTag>
                {chosen === "tempo" ? "Acabou o tempo!" : `${mode.emoji} ${mode.label}`}
              </QuestionTag>
              <QuestionText accessibilityRole="header">{question.question}</QuestionText>
            </QuestionCard>
          </Appear>
        </Animated.View>

        <Options>
          {question.options.map((option, position) => (
            <Appear key={`${index}-${option}`} from="left" delay={120 + position * 70}>
              <Bouncy
                disabled={answered}
                sound={null}
                pressedScale={0.97}
                hoverScale={1.02}
                onPress={() => answer(option)}
                accessibilityLabel={`Alternativa ${LETTERS[position]}: ${option}`}
              >
                <Option $state={optionState(option)}>
                  <OptionLetter $color={LETTER_COLORS[position]}>{LETTERS[position]}</OptionLetter>
                  <OptionText>{option}</OptionText>
                </Option>
              </Bouncy>
            </Appear>
          ))}
        </Options>

        {answered ? (
          <Appear>
            <Fact>
              <FactTitle>💡 Você sabia?</FactTitle>
              <FactText>{question.fact}</FactText>
            </Fact>
            <Button
              title={index + 1 === TOTAL ? "Ver resultado" : "Próxima"}
              icon="arrow-forward"
              full
              onPress={next}
              style={{ marginTop: 14 }}
            />
          </Appear>
        ) : null}
      </ScrollView>
      {floaters}
    </>
  );
}

export default function Quiz() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
