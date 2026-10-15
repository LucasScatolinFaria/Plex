import { useEffect, useMemo, useState } from "react";
import { Animated, Text } from "react-native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import GameShell from "../../../components/GameShell";
import { HudPill, HudRow } from "../../../components/Hud";
import { getGame } from "../../../data/games";
import { SYLLABLES } from "../../../data/syllables";
import useLoop from "../../../hooks/useLoop";
import useShake from "../../../hooks/useShake";
import useTimers from "../../../hooks/useTimers";
import { fx } from "../../../services/feedback";
import { shadow } from "../../../theme";
import { sample, shuffle } from "../../../utils/helpers";
import { Body, Clue, Piece, PieceText, Row, Slot, Status } from "./style";

const GAME = getGame("silabas");
const ROUNDS = 6;
const MAX_TRIES = 3;
const GAP = 8;
// sílabas "intrusas" misturadas com as certas, para dificultar
const EXTRAS = { facil: 1, medio: 2, dificil: 2 };

// As peças da rodada: as sílabas da palavra + algumas de outras palavras, embaralhadas.
function buildPieces(word, level) {
  const others = SYLLABLES[level]
    .flatMap((item) => item.syllables)
    .filter((syllable) => !word.syllables.includes(syllable));
  return shuffle([...word.syllables, ...sample([...new Set(others)], EXTRAS[level])]);
}

function Board({ mode, finish, area }) {
  const words = useMemo(() => sample(SYLLABLES[mode.id], ROUNDS), [mode.id]);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState([]); // posições das peças escolhidas, na ordem
  const [tries, setTries] = useState(0);
  const [state, setState] = useState("playing"); // playing → right | wrong | revealed
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [perfect, setPerfect] = useState(0); // palavras montadas de primeira
  const later = useTimers();
  const [shakeStyle, shake] = useShake();
  const bob = useLoop(1200);

  const over = round >= ROUNDS;
  const word = words[Math.min(round, ROUNDS - 1)];
  const pieces = useMemo(() => buildPieces(word, mode.id), [word, mode.id]);
  const size = word.syllables.length;

  function nextRound() {
    setPicked([]);
    setTries(0);
    setState("playing");
    setRound(round + 1);
  }

  function check(choice) {
    const built = choice.map((position) => pieces[position]).join("");
    if (built === word.syllables.join("")) {
      fx("match");
      setState("right");
      setScore(score + Math.max(10, 50 - tries * 15));
      setSolved(solved + 1);
      if (tries === 0) setPerfect(perfect + 1);
      later(nextRound, 1700);
      return;
    }

    fx("wrong");
    shake();
    if (tries + 1 >= MAX_TRIES) {
      // depois de 3 tentativas o jogo mostra a resposta e segue em frente
      setState("revealed");
      later(nextRound, 2600);
      return;
    }
    setState("wrong");
    setTries(tries + 1);
    later(() => {
      setPicked([]);
      setState("playing");
    }, 900);
  }

  function pick(position) {
    if (state !== "playing" || picked.includes(position)) return;
    fx("pop");
    const choice = [...picked, position];
    setPicked(choice);
    if (choice.length === size) check(choice);
  }

  function unpick(slot) {
    if (state !== "playing" || slot >= picked.length) return;
    fx("tap");
    setPicked(picked.filter((_, index) => index !== slot));
  }

  useEffect(() => {
    if (!over) return;
    finish({
      score,
      stars: perfect === ROUNDS ? 3 : perfect >= ROUNDS - 2 ? 2 : solved >= 3 ? 1 : 0,
      message: `Você montou ${solved} de ${ROUNDS} palavras.`,
      stats: [
        { label: "Montadas", value: `${solved}/${ROUNDS}` },
        { label: "De primeira", value: perfect },
      ],
      detail: { solved, perfect },
    });
  }, [over, finish, score, solved, perfect]);

  const longest = Math.max(...pieces.map((piece) => piece.length));
  const fit = (count) => Math.floor((area.width - GAP * (count - 1)) / count);
  const pieceWidth = Math.min(96, fit(Math.min(pieces.length, 4)), 30 + longest * 22);
  const slotWidth = Math.min(96, fit(size));
  const float = bob.interpolate({ inputRange: [0, 1], outputRange: [4, -6] });

  const status = {
    playing: tries > 0 ? `Tente de novo! Restam ${MAX_TRIES - tries} tentativas.` : "Toque nas sílabas na ordem certa.",
    right: `Isso! ${word.syllables.join("-")} 🎉`,
    wrong: "Quase! Essa ordem não forma a palavra.",
    revealed: `A palavra era ${word.syllables.join("-")}.`,
  }[state];

  return (
    <>
      <HudRow>
        <HudPill icon="📝" value={`${Math.min(round + 1, ROUNDS)}/${ROUNDS}`} label="Palavra" />
        <HudPill icon="⭐" value={score} label="Pontos" />
        <HudPill icon="🎯" value={perfect} label="De primeira" />
      </HudRow>

      <Body>
        <Appear key={round} from="scale" style={{ flex: 1, alignSelf: "stretch", maxHeight: 200 }}>
          <Clue style={shadow(10, 24)}>
            <Animated.View style={{ transform: [{ translateY: float }] }}>
              <Text allowFontScaling={false} style={{ fontSize: 72, lineHeight: 90 }}>
                {word.emoji}
              </Text>
            </Animated.View>
          </Clue>
        </Appear>

        <Animated.View style={shakeStyle}>
          <Row style={{ gap: GAP }} accessibilityLabel="Palavra em montagem">
            {word.syllables.map((syllable, slot) => {
              const shown = state === "revealed" ? syllable : pieces[picked[slot]];
              const look = state === "right" || state === "revealed" ? "right" : state === "wrong" ? "wrong" : "idle";
              return (
                <Bouncy
                  key={`${round}-${slot}`}
                  sound={null}
                  onPress={() => unpick(slot)}
                  accessibilityLabel={shown ? `Tirar a sílaba ${shown}` : `Espaço ${slot + 1} vazio`}
                >
                  <Slot $filled={!!shown} $state={shown ? look : "idle"} style={{ width: slotWidth, height: 64 }}>
                    {shown ? <PieceText style={{ fontSize: Math.min(26, slotWidth / (shown.length * 0.75)) }}>{shown}</PieceText> : null}
                  </Slot>
                </Bouncy>
              );
            })}
          </Row>
        </Animated.View>

        <Status numberOfLines={2}>{status}</Status>

        <Row style={{ gap: GAP }}>
          {pieces.map((piece, position) => {
            const used = picked.includes(position);
            return (
              <Bouncy
                key={`${round}-${position}`}
                disabled={used || state !== "playing"}
                sound={null}
                onPress={() => pick(position)}
                accessibilityLabel={`Sílaba ${piece}`}
              >
                <Piece $used={used} style={{ width: pieceWidth, height: 66 }}>
                  <PieceText style={{ fontSize: Math.min(28, pieceWidth / (piece.length * 0.72)) }}>{piece}</PieceText>
                </Piece>
              </Bouncy>
            );
          })}
        </Row>
      </Body>
    </>
  );
}

export default function Syllables() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
