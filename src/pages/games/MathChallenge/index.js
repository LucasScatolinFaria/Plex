import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import GameShell from "../../../components/GameShell";
import { HudPill, HudRow, useFloaters } from "../../../components/Hud";
import { TimerBar } from "../../../components/ProgressBar";
import { getGame } from "../../../data/games";
import useShake from "../../../hooks/useShake";
import useTimers from "../../../hooks/useTimers";
import { fx } from "../../../services/feedback";
import { colors, nativeDriver, shadow } from "../../../theme";
import { pick, randomInt, shuffle } from "../../../utils/helpers";
import { Body, Equation, Option, OptionText, Options, Slate, SlateHint } from "./style";

const GAME = getGame("matematica");
const TOTAL = 10;
const TIME = { facil: 15000, medio: 12000, dificil: 10000 };
const OPERATIONS = { facil: ["+", "−"], medio: ["+", "−", "×"], dificil: ["+", "−", "×", "÷"] };

const TILES = [
  { face: "#38BDF8", edge: "#0B7FC2" },
  { face: "#FF5FA2", edge: "#C9306F" },
  { face: "#FFB020", edge: "#C27A00" },
  { face: "#8B5CF6", edge: "#5B21B6" },
];
const RIGHT = { face: "#22C55E", edge: "#15803D" };
const WRONG = { face: "#EF4444", edge: "#B91C1C" };

function makeOperation(level) {
  const operation = pick(OPERATIONS[level]);

  if (operation === "+") {
    const [a, b] = {
      facil: [randomInt(1, 10), randomInt(1, 10)],
      medio: [randomInt(5, 50), randomInt(5, 40)],
      dificil: [randomInt(20, 99), randomInt(11, 99)],
    }[level];
    return { text: `${a} + ${b}`, answer: a + b };
  }

  if (operation === "−") {
    const a = { facil: randomInt(2, 12), medio: randomInt(12, 70), dificil: randomInt(40, 150) }[level];
    const b = { facil: randomInt(1, a - 1), medio: randomInt(3, a - 2), dificil: randomInt(11, a - 5) }[level];
    return { text: `${a} − ${b}`, answer: a - b };
  }

  if (operation === "×") {
    const a = level === "medio" ? randomInt(2, 5) : randomInt(3, 10);
    const b = level === "medio" ? randomInt(2, 10) : randomInt(3, 10);
    return { text: `${a} × ${b}`, answer: a * b };
  }

  // divisão sempre exata: sorteia o resultado e monta a conta de trás para frente
  const divisor = randomInt(2, 10);
  const answer = randomInt(2, 10);
  return { text: `${divisor * answer} ÷ ${divisor}`, answer };
}

// três respostas erradas perto da certa, para a criança ter que pensar
function makeOptions(answer) {
  const options = new Set([answer]);
  for (const offset of shuffle([1, -1, 2, -2, 3, 5, 10, -10])) {
    if (options.size === 4) break;
    if (answer + offset >= 0) options.add(answer + offset);
  }
  return shuffle([...options]);
}

function buildQuestions(level) {
  const questions = [];
  while (questions.length < TOTAL) {
    const operation = makeOperation(level);
    if (questions.some((question) => question.text === operation.text)) continue;
    questions.push({ ...operation, options: makeOptions(operation.answer) });
  }
  return questions;
}

function Board({ mode, finish, area }) {
  const questions = useMemo(() => buildQuestions(mode.id), [mode.id]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null); // resposta tocada, ou "tempo" se o relógio zerou
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const clock = useRef(new Animated.Value(1)).current;
  const locked = useRef(false); // evita responder duas vezes a mesma conta
  const later = useTimers();
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
    // o valor do relógio (de 1 a 0) vira bônus de rapidez
    clock.stopAnimation((timeLeft) => {
      if (!right) return;
      const gained = 10 + Math.round(timeLeft * 10) + Math.min(combo, 5) * 2;
      setScore((current) => current + gained);
      float(`+${gained}`, { color: colors.lime });
    });

    if (right) {
      fx("correct");
      setCorrect(correct + 1);
      setCombo(combo + 1);
      setBestCombo(Math.max(bestCombo, combo + 1));
    } else {
      fx("wrong");
      shake();
      setCombo(0);
    }

    later(() => {
      locked.current = false;
      setChosen(null);
      setIndex(index + 1);
    }, right ? 950 : 1700);
  }

  // relógio da pergunta atual
  useEffect(() => {
    if (over) return undefined;
    clock.setValue(1);
    const countdown = Animated.timing(clock, {
      toValue: 0,
      duration: TIME[mode.id],
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
      stars: correct >= 9 ? 3 : correct >= 7 ? 2 : correct >= 4 ? 1 : 0,
      message: `Você acertou ${correct} de ${TOTAL} contas.`,
      stats: [
        { label: "Acertos", value: `${correct}/${TOTAL}` },
        { label: "Maior combo", value: bestCombo },
      ],
      detail: { correct },
    });
  }, [over, finish, score, correct, bestCombo]);

  const tileWidth = (area.width - 12) / 2;
  const tileHeight = Math.max(64, Math.min(104, (area.height - 330) / 2));
  // a conta inteira (já com a resposta) precisa caber em uma linha do quadro
  const characters = `${question.text} = ${question.answer}`.length;
  const equationSize = Math.min(64, Math.floor((area.width - 48) / (characters * 0.56)));
  const tileTone = (option, position) => {
    if (!answered) return TILES[position];
    if (option === question.answer) return RIGHT;
    return option === chosen ? WRONG : TILES[position];
  };

  return (
    <>
      <HudRow>
        <HudPill icon="⭐" value={score} label="Pontos" />
        <HudPill icon="🔥" value={combo} label="Combo" />
        <HudPill icon="📝" value={`${Math.min(index + 1, TOTAL)}/${TOTAL}`} label="Conta" />
      </HudRow>
      <TimerBar progress={clock} />

      <Body>
        <Animated.View style={shakeStyle}>
          <Appear key={index} from="scale">
            <Slate style={shadow(10, 24)}>
              <SlateHint>{chosen === "tempo" ? "Acabou o tempo!" : "Quanto é?"}</SlateHint>
              <Equation numberOfLines={1} style={{ fontSize: equationSize, lineHeight: equationSize * 1.25 }}>
                {question.text} = {answered ? question.answer : "?"}
              </Equation>
            </Slate>
          </Appear>
        </Animated.View>

        <Options>
          {question.options.map((option, position) => {
            const tone = tileTone(option, position);
            return (
              <Bouncy
                key={`${index}-${option}`}
                disabled={answered}
                sound={null}
                onPress={() => answer(option)}
                accessibilityLabel={`Resposta ${option}`}
              >
                <Option
                  $face={tone.face}
                  $edge={tone.edge}
                  $dim={answered && tone !== RIGHT && tone !== WRONG}
                  style={{ width: tileWidth, height: tileHeight }}
                >
                  <OptionText style={{ fontSize: tileHeight * 0.46 }}>{option}</OptionText>
                </Option>
              </Bouncy>
            );
          })}
        </Options>
      </Body>
      {floaters}
    </>
  );
}

export default function MathChallenge() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
