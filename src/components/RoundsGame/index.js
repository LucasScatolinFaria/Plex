import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../Appear";
import Bouncy from "../Bouncy";
import { HudPill, HudRow, useFloaters } from "../Hud";
import { TimerBar } from "../ProgressBar";
import useShake from "../../hooks/useShake";
import useTimers from "../../hooks/useTimers";
import { fx } from "../../services/feedback";
import { colors, nativeDriver } from "../../theme";
import { Badge, Body, Options, Tile, TileText } from "./style";

export { PromptCard, PromptNote, PromptTag, PromptTitle } from "./style";

const GAP = 12;
const TIMEOUT = "__tempo__";
const TONES = [
  { face: "#38BDF8", edge: "#0B7FC2" },
  { face: "#FF5FA2", edge: "#C9306F" },
  { face: "#FFB020", edge: "#C27A00" },
  { face: "#8B5CF6", edge: "#5B21B6" },
  { face: "#2DD4BF", edge: "#0F766E" },
];
const RIGHT = { face: "#22C55E", edge: "#15803D" };
const WRONG = { face: "#EF4444", edge: "#B91C1C" };

// Motor dos jogos de "pergunta + alternativas". Cada jogo só cuida das perguntas e do desenho.
//   rounds        → lista de { answer, options, ...o que o jogo quiser }
//   time          → tempo de cada pergunta em ms (sem isso, não tem relógio)
//   renderPrompt  → (round, { answered, right, timedOut }) => a pergunta
//   renderOption  → (option, { size }) => o conteúdo da alternativa (padrão: o texto dela)
//   tones         → (option) => { face, edge } para alternativas com cor própria (ex.: lixeiras)
export default function RoundsGame({
  rounds,
  time,
  area,
  finish,
  renderPrompt,
  renderOption,
  tones,
  optionLabel = String,
  columns = 2,
  unit = "Pergunta",
  describe = (correct, total) => `Você acertou ${correct} de ${total}.`,
  onAnswer,
}) {
  const total = rounds.length;
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const clock = useRef(new Animated.Value(1)).current;
  const locked = useRef(false); // evita responder duas vezes a mesma pergunta
  const later = useTimers();
  const [floaters, float] = useFloaters();
  const [shakeStyle, shake] = useShake();

  const over = index >= total;
  const round = rounds[Math.min(index, total - 1)];
  const answered = chosen !== null;

  function answer(option) {
    if (locked.current) return;
    locked.current = true;
    const right = option === round.answer;
    setChosen(option);

    // quem responde rápido e em sequência ganha mais pontos
    const award = (timeLeft) => {
      const gained = 10 + Math.round(timeLeft * 10) + Math.min(combo, 5) * 2;
      setScore((current) => current + gained);
      float(`+${gained}`, { color: colors.lime });
    };
    if (time) clock.stopAnimation((timeLeft) => right && award(timeLeft));
    else if (right) award(0.5);

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
    if (onAnswer) onAnswer(round, right);

    later(() => {
      locked.current = false;
      setChosen(null);
      setIndex(index + 1);
    }, right ? 1200 : 2400);
  }

  useEffect(() => {
    if (over || !time) return undefined;
    clock.setValue(1);
    const countdown = Animated.timing(clock, {
      toValue: 0,
      duration: time,
      easing: Easing.linear,
      useNativeDriver: nativeDriver,
    });
    countdown.start(({ finished }) => {
      if (finished) answer(TIMEOUT);
    });
    return () => countdown.stop();
  }, [index, over, time]);

  useEffect(() => {
    if (!over) return;
    const ratio = correct / total;
    finish({
      score,
      stars: ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0,
      message: describe(correct, total),
      stats: [
        { label: "Acertos", value: `${correct}/${total}` },
        { label: "Maior combo", value: bestCombo },
      ],
      detail: { correct, total },
    });
  }, [over, finish, score, correct, total, bestCombo]);

  const rows = Math.ceil(round.options.length / columns);
  const width = Math.floor((area.width - GAP * (columns - 1)) / columns);
  const height = Math.max(58, Math.min(96, Math.floor((area.height - 400) / rows)));

  return (
    <>
      <HudRow>
        <HudPill icon="⭐" value={score} label="Pontos" />
        <HudPill icon="🔥" value={combo} label="Combo" />
        <HudPill icon="📝" value={`${Math.min(index + 1, total)}/${total}`} label={unit} />
      </HudRow>
      {time ? <TimerBar progress={clock} /> : null}

      <Body>
        <Animated.View style={[{ flex: 1, justifyContent: "center" }, shakeStyle]}>
          <Appear key={index} from="scale">
            {renderPrompt(round, {
              answered,
              right: chosen === round.answer,
              timedOut: chosen === TIMEOUT,
            })}
          </Appear>
        </Animated.View>

        <Options style={{ gap: GAP }}>
          {round.options.map((option, position) => {
            const isRight = answered && option === round.answer;
            const isWrong = answered && option === chosen && !isRight;
            const base = tones ? tones(option) : TONES[position % TONES.length];
            const tone = tones ? base : isRight ? RIGHT : isWrong ? WRONG : base;
            const label = optionLabel(option);
            return (
              <Bouncy
                key={`${index}-${position}`}
                disabled={answered}
                sound={null}
                onPress={() => answer(option)}
                accessibilityLabel={`Opção ${label}`}
              >
                <Tile
                  $face={tone.face}
                  $edge={tone.edge}
                  $dim={answered && !isRight && !isWrong}
                  style={{ width, height }}
                >
                  {renderOption ? (
                    renderOption(option, { width, height })
                  ) : (
                    <TileText
                      numberOfLines={2}
                      style={{ fontSize: Math.min(height * 0.42, (width - 16) / (label.length * 0.58)) }}
                    >
                      {label}
                    </TileText>
                  )}
                  {isRight || isWrong ? (
                    <Badge $right={isRight}>
                      <Ionicons name={isRight ? "checkmark" : "close"} size={18} color={colors.white} />
                    </Badge>
                  ) : null}
                </Tile>
              </Bouncy>
            );
          })}
        </Options>
      </Body>
      {floaters}
    </>
  );
}
