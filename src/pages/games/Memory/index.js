import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text } from "react-native";

import GameShell from "../../../components/GameShell";
import { HUD_HEIGHT, HudPill, HudRow } from "../../../components/Hud";
import { getGame } from "../../../data/games";
import useShake from "../../../hooks/useShake";
import useTimers from "../../../hooks/useTimers";
import { fx } from "../../../services/feedback";
import { nativeDriver, shadow } from "../../../theme";
import { formatTime, pick, sample, shuffle } from "../../../utils/helpers";
import { Back, BackMark, Face, Front, Grid, Table } from "./style";

const GAME = getGame("memoria");
const PAIRS = { facil: 6, medio: 8, dificil: 10 };
const GAP = 10;
const CARD_RATIO = 1.15; // altura ÷ largura
const PEEK_TIME = 1800;

const THEMES = [
  ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐧", "🦉", "🦄", "🐝", "🐢", "🐙", "🐬"],
  ["🍎", "🍌", "🍇", "🍓", "🍉", "🍍", "🍒", "🍑", "🥝", "🍋", "🍊", "🥥", "🥕", "🌽", "🍕", "🍩", "🍪", "🍦", "🧀", "🍿"],
  ["🚀", "🛸", "🌙", "⭐", "🌍", "🌈", "⚡", "🔥", "🚗", "🚲", "🚂", "⛵", "🚁", "⚽", "🏀", "🎸", "🎨", "🎲", "🎁", "🎈"],
];

function buildDeck(pairs) {
  const emojis = sample(pick(THEMES), pairs);
  return shuffle([...emojis, ...emojis]);
}

// Testa os jeitos de arrumar as cartas e fica com o que deixa cada carta maior.
function bestGrid(count, width, height) {
  let best = null;
  for (let columns = 3; columns <= 6; columns++) {
    if (count % columns !== 0) continue;
    const rows = count / columns;
    const cardWidth = Math.floor(
      Math.min((width - GAP * (columns - 1)) / columns, (height - GAP * (rows - 1)) / rows / CARD_RATIO, 124)
    );
    if (!best || cardWidth > best.cardWidth) best = { columns, cardWidth };
  }
  return best;
}

function Card({ emoji, width, faceUp, matched, wrong, onPress }) {
  const flip = useRef(new Animated.Value(faceUp ? 1 : 0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const [shakeStyle, shake] = useShake();

  useEffect(() => {
    Animated.spring(flip, {
      toValue: faceUp ? 1 : 0,
      friction: 8,
      tension: 70,
      useNativeDriver: nativeDriver,
    }).start();
  }, [flip, faceUp]);

  useEffect(() => {
    if (!matched) return;
    Animated.sequence([
      Animated.timing(pop, { toValue: 1.14, duration: 140, useNativeDriver: nativeDriver }),
      Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: nativeDriver }),
    ]).start();
  }, [pop, matched]);

  useEffect(() => {
    if (wrong) shake();
  }, [wrong, shake]);

  // cada lado gira meia volta; a opacidade troca no meio do giro
  const spin = (from, to) => flip.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  const fade = (from, to) =>
    flip.interpolate({ inputRange: [0.49, 0.51], outputRange: [from, to], extrapolate: "clamp" });
  const radius = { borderRadius: width * 0.18 };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={faceUp ? `Carta ${emoji}` : "Carta virada para baixo"}
      onPress={onPress}
      style={{ width, height: width * CARD_RATIO }}
    >
      <Animated.View style={[{ flex: 1 }, shakeStyle]}>
        <Animated.View style={[{ flex: 1 }, radius, shadow(4, 10, "rgba(10,3,40,0.35)"), { transform: [{ scale: pop }] }]}>
          <Face style={{ opacity: fade(1, 0), transform: [{ perspective: 800 }, { rotateY: spin("0deg", "180deg") }] }}>
            <Back colors={GAME.colors} style={radius}>
              <BackMark style={{ fontSize: width * 0.42 }}>?</BackMark>
            </Back>
          </Face>
          <Face style={{ opacity: fade(0, 1), transform: [{ perspective: 800 }, { rotateY: spin("180deg", "360deg") }] }}>
            <Front $matched={matched} style={radius}>
              <Text allowFontScaling={false} style={{ fontSize: width * 0.48, lineHeight: width * 0.62 }}>
                {emoji}
              </Text>
            </Front>
          </Face>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function Board({ mode, finish, area }) {
  const pairs = PAIRS[mode.id];
  const deck = useMemo(() => buildDeck(pairs), [pairs]);
  const [open, setOpen] = useState([]); // posições das cartas viradas agora (no máximo 2)
  const [found, setFound] = useState([]); // figuras que já formaram par
  const [wrong, setWrong] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [peeking, setPeeking] = useState(true);
  const locked = useRef(false);
  const later = useTimers();

  const done = found.length === pairs;

  // no começo todas as cartas ficam abertas por um instante
  useEffect(() => {
    const timer = setTimeout(() => setPeeking(false), PEEK_TIME);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (peeking || done) return undefined;
    const clock = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(clock);
  }, [peeking, done]);

  useEffect(() => {
    if (!done) return undefined;
    const perMove = moves / pairs;
    const timer = setTimeout(() => {
      finish({
        stars: perMove <= 1.6 ? 3 : perMove <= 2.3 ? 2 : 1,
        score: Math.max(pairs * 20, pairs * 100 - (moves - pairs) * 15 - seconds * 2),
        message: `Você achou os ${pairs} pares em ${moves} jogadas!`,
        stats: [
          { label: "Jogadas", value: moves },
          { label: "Tempo", value: formatTime(seconds) },
        ],
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [done, finish, moves, pairs, seconds]);

  function handlePress(position) {
    if (peeking || locked.current || open.includes(position) || found.includes(deck[position])) return;
    fx("flip");

    if (open.length === 0) {
      setOpen([position]);
      return;
    }

    const first = open[0];
    setOpen([first, position]);
    setMoves(moves + 1);
    locked.current = true;

    if (deck[first] === deck[position]) {
      later(() => {
        fx("match");
        setFound([...found, deck[position]]);
        setOpen([]);
        locked.current = false;
      }, 450);
    } else {
      later(() => {
        fx("wrong");
        setWrong([first, position]);
      }, 500);
      later(() => {
        setOpen([]);
        setWrong([]);
        locked.current = false;
      }, 1150);
    }
  }

  const grid = bestGrid(deck.length, area.width, area.height - HUD_HEIGHT);

  return (
    <>
      <HudRow>
        <HudPill icon="👆" value={moves} label="Jogadas" />
        <HudPill icon="⏱️" value={formatTime(seconds)} label="Tempo" />
        <HudPill icon="🃏" value={`${found.length}/${pairs}`} label="Pares" />
      </HudRow>
      <Table>
        <Grid style={{ gap: GAP, width: grid.columns * grid.cardWidth + GAP * (grid.columns - 1) }}>
          {deck.map((emoji, position) => (
            <Card
              key={position}
              emoji={emoji}
              width={grid.cardWidth}
              faceUp={peeking || open.includes(position) || found.includes(emoji)}
              matched={found.includes(emoji)}
              wrong={wrong.includes(position)}
              onPress={() => handlePress(position)}
            />
          ))}
        </Grid>
      </Table>
    </>
  );
}

export default function Memory() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
