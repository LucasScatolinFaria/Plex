import { useEffect, useMemo, useState } from "react";
import { Animated, Text } from "react-native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import GameShell from "../../../components/GameShell";
import { HudPill, HudRow } from "../../../components/Hud";
import { getGame } from "../../../data/games";
import { WORDS } from "../../../data/words";
import useKeyboard from "../../../hooks/useKeyboard";
import useLoop from "../../../hooks/useLoop";
import useShake from "../../../hooks/useShake";
import useTimers from "../../../hooks/useTimers";
import { fx } from "../../../services/feedback";
import { shadow } from "../../../theme";
import { pick, sample } from "../../../utils/helpers";
import {
  Body,
  Clue,
  ClueTag,
  Heart,
  Hearts,
  Key,
  KeyRow,
  KeyText,
  Keyboard,
  Slot,
  SlotLetter,
  Slots,
  Status,
} from "./style";

const GAME = getGame("palavras");
const ROUNDS = 5;
const LIVES = 6;
const KEY_ROWS = ["ABCDEFGHI", "JKLMNOPQR", "STUVWXYZ"].map((row) => row.split(""));
const KEY_GAP = 5;

function Board({ mode, finish, area }) {
  const words = useMemo(() => sample(WORDS[mode.id], ROUNDS), [mode.id]);
  const [round, setRound] = useState(0);
  const [tried, setTried] = useState([]); // letras já usadas nesta palavra
  const [hints, setHints] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const later = useTimers();
  const [shakeStyle, shake] = useShake();
  const bob = useLoop(1200);

  const over = round >= ROUNDS;
  const { word, hint, category } = words[Math.min(round, ROUNDS - 1)];
  const letters = word.split("");
  const misses = tried.filter((letter) => !word.includes(letter)).length;
  const lives = LIVES - misses - hints;
  const won = letters.every((letter) => tried.includes(letter));
  const lost = !won && lives <= 0;
  const roundOver = won || lost;

  function nextRound() {
    setTried([]);
    setHints(0);
    setRound(round + 1);
  }

  // cost = corações gastos: 0 quando a criança escolhe a letra, 1 quando pede uma dica
  function reveal(letter, cost = 0) {
    if (over || roundOver || tried.includes(letter)) return;
    const nextTried = [...tried, letter];
    const hit = word.includes(letter);
    const livesAfter = lives - cost - (hit ? 0 : 1);
    setTried(nextTried);
    setHints(hints + cost);

    if (letters.every((item) => nextTried.includes(item))) {
      fx("match");
      setScore(score + 50 + livesAfter * 10);
      setSolved(solved + 1);
      later(nextRound, 1700);
    } else if (livesAfter <= 0) {
      fx("lose");
      shake();
      later(nextRound, 2400);
    } else if (hit) {
      fx("correct");
    } else {
      fx("wrong");
      shake();
    }
  }

  function giveHint() {
    const missing = letters.filter((letter) => !tried.includes(letter));
    if (lives > 1 && missing.length > 0) reveal(pick(missing), 1);
  }

  useKeyboard((key) => {
    const letter = key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) reveal(letter);
  });

  useEffect(() => {
    if (!over) return;
    finish({
      score,
      stars: solved === ROUNDS ? 3 : solved === ROUNDS - 1 ? 2 : solved >= 2 ? 1 : 0,
      message: `Você descobriu ${solved} de ${ROUNDS} palavras.`,
      stats: [{ label: "Palavras", value: `${solved}/${ROUNDS}` }],
      detail: { solved },
    });
  }, [over, finish, score, solved]);

  const slotGap = letters.length > 8 ? 4 : 6;
  const slotSize = Math.min(46, Math.floor((area.width - slotGap * (letters.length - 1)) / letters.length));
  const keySize = Math.min(52, Math.floor((area.width - KEY_GAP * 8) / 9));
  const float = bob.interpolate({ inputRange: [0, 1], outputRange: [4, -6] });

  const status = won
    ? "Isso mesmo! 🎉"
    : lost
    ? `Era ${word}. Na próxima você consegue!`
    : `Dica: ${category.toLowerCase()} com ${letters.length} letras`;

  return (
    <>
      <HudRow>
        <HudPill icon="📝" value={`${Math.min(round + 1, ROUNDS)}/${ROUNDS}`} label="Palavra" />
        <HudPill icon="⭐" value={score} label="Pontos" />
        <HudPill icon="✅" value={solved} label="Certas" />
      </HudRow>

      <Body>
        <Appear key={round} from="scale" style={{ flex: 1, alignSelf: "stretch", maxHeight: 190 }}>
          <Clue style={shadow(10, 24)}>
            <ClueTag>{category}</ClueTag>
            <Animated.View style={{ transform: [{ translateY: float }] }}>
              <Text allowFontScaling={false} style={{ fontSize: 64, lineHeight: 80 }}>
                {hint}
              </Text>
            </Animated.View>
          </Clue>
        </Appear>

        <Hearts accessibilityLabel={`${Math.max(lives, 0)} corações`}>
          {Array.from({ length: LIVES }, (_, index) => (
            <Heart key={index} $lost={index >= lives}>
              ❤️
            </Heart>
          ))}
        </Hearts>

        <Animated.View style={shakeStyle}>
          <Slots style={{ gap: slotGap }} accessibilityLabel="Palavra secreta">
            {letters.map((letter, index) => {
              const shown = tried.includes(letter);
              return (
                <Slot
                  key={`${round}-${index}`}
                  $missed={lost && !shown}
                  style={{ width: slotSize, height: slotSize * 1.2 }}
                >
                  {shown || lost ? (
                    <Appear from="scale">
                      <SlotLetter $missed={!shown} style={{ fontSize: slotSize * 0.66 }}>
                        {letter}
                      </SlotLetter>
                    </Appear>
                  ) : null}
                </Slot>
              );
            })}
          </Slots>
        </Animated.View>

        <Status numberOfLines={1}>{status}</Status>

        <Keyboard style={{ gap: KEY_GAP }}>
          {KEY_ROWS.map((row) => (
            <KeyRow key={row[0]} style={{ gap: KEY_GAP }}>
              {row.map((letter) => {
                const state = !tried.includes(letter) ? "idle" : word.includes(letter) ? "hit" : "miss";
                return (
                  <Bouncy
                    key={letter}
                    disabled={state !== "idle" || roundOver}
                    sound={null}
                    hoverScale={1.1}
                    onPress={() => reveal(letter)}
                    accessibilityLabel={`Letra ${letter}`}
                  >
                    <Key $state={state} style={{ width: keySize, height: keySize * 1.08 }}>
                      <KeyText $state={state} style={{ fontSize: keySize * 0.5 }}>
                        {letter}
                      </KeyText>
                    </Key>
                  </Bouncy>
                );
              })}
            </KeyRow>
          ))}
        </Keyboard>

        <Button
          title="Dica (custa 1 ❤️)"
          icon="bulb"
          tone="blue"
          size="sm"
          disabled={roundOver || lives <= 1}
          onPress={giveHint}
        />
      </Body>
    </>
  );
}

export default function SecretWord() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
