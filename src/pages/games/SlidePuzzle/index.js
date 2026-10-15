import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, View } from "react-native";

import GameShell from "../../../components/GameShell";
import { HUD_HEIGHT, HudPill, HudRow } from "../../../components/Hud";
import { getGame } from "../../../data/games";
import useKeyboard from "../../../hooks/useKeyboard";
import { fx } from "../../../services/feedback";
import { nativeDriver, shadow, textShadow } from "../../../theme";
import { formatTime, pick } from "../../../utils/helpers";
import { Body, Frame, Hint, TileFace, TileNumber } from "./style";

const GAME = getGame("puzzle");
const GAP = 8;
const PADDING = 10;
const PLACED = ["#4ADE80", "#16A34A"]; // cor da peça que já está no lugar certo
// shuffles = quantas jogadas ao contrário embaralham o tabuleiro; three/two = limite de movimentos para 3 e 2 estrelas
const CONFIG = {
  facil: { size: 3, shuffles: 14, base: 300, three: 24, two: 44 },
  medio: { size: 3, shuffles: 60, base: 600, three: 70, two: 130 },
  dificil: { size: 4, shuffles: 120, base: 1000, three: 180, two: 320 },
};

// o 0 representa o espaço vazio; resolvido = 1, 2, 3 ... e o vazio no fim
const isSolved = (tiles) => tiles.every((value, index) => value === (index + 1) % tiles.length);

function neighbors(index, size) {
  const row = Math.floor(index / size);
  const column = index % size;
  const list = [];
  if (row > 0) list.push(index - size);
  if (row < size - 1) list.push(index + size);
  if (column > 0) list.push(index - 1);
  if (column < size - 1) list.push(index + 1);
  return list;
}

// Embaralha fazendo jogadas de verdade a partir do tabuleiro pronto: assim sempre tem solução.
function shuffled(size, moves) {
  const tiles = Array.from({ length: size * size }, (_, index) => (index + 1) % (size * size));
  let blank = tiles.length - 1;
  let previous = -1;
  for (let count = 0; count < moves; count++) {
    const target = pick(neighbors(blank, size).filter((index) => index !== previous));
    tiles[blank] = tiles[target];
    tiles[target] = 0;
    previous = blank;
    blank = target;
  }
  return isSolved(tiles) ? shuffled(size, moves) : tiles;
}

// Desliza a peça tocada (e as que estiverem no caminho) na direção do espaço vazio.
function slide(tiles, index, size) {
  const blank = tiles.indexOf(0);
  const sameRow = Math.floor(index / size) === Math.floor(blank / size);
  const sameColumn = index % size === blank % size;
  if (index === blank || (!sameRow && !sameColumn)) return null;

  const step = Math.sign(index - blank) * (sameRow ? 1 : size);
  const next = [...tiles];
  let moved = 0;
  for (let position = blank; position !== index; position += step) {
    next[position] = next[position + step];
    moved++;
  }
  next[index] = 0;
  return { tiles: next, moved };
}

function Tile({ value, cell, row, column, placed, onPress }) {
  const x = column * (cell + GAP);
  const y = row * (cell + GAP);
  const position = useRef(new Animated.ValueXY({ x, y })).current;

  useEffect(() => {
    Animated.spring(position, {
      toValue: { x, y },
      friction: 9,
      tension: 120,
      useNativeDriver: nativeDriver,
    }).start();
  }, [position, x, y]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: cell,
        height: cell,
        transform: position.getTranslateTransform(),
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Peça ${value}`}
        onPress={onPress}
        style={[{ flex: 1, borderRadius: cell * 0.18 }, shadow(3, 8, "rgba(3,20,35,0.4)")]}
      >
        <TileFace colors={placed ? PLACED : GAME.colors} style={{ borderRadius: cell * 0.18 }}>
          <TileNumber style={[{ fontSize: cell * 0.46 }, textShadow("rgba(0,0,0,0.25)", 2, 3)]}>{value}</TileNumber>
        </TileFace>
      </Pressable>
    </Animated.View>
  );
}

function Board({ mode, finish, area }) {
  const config = CONFIG[mode.id];
  const { size } = config;
  const [tiles, setTiles] = useState(() => shuffled(size, config.shuffles));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const solved = isSolved(tiles);
  const started = moves > 0;
  const placed = tiles.filter((value, index) => value !== 0 && value === index + 1).length;

  function tap(index) {
    if (solved) return;
    const result = slide(tiles, index, size);
    if (!result) return;
    fx("slide");
    setTiles(result.tiles);
    setMoves(moves + result.moved);
  }

  // setas do teclado: empurram uma peça para dentro do espaço vazio
  useKeyboard((key, event) => {
    if (!key.startsWith("Arrow")) return;
    event.preventDefault();
    const blank = tiles.indexOf(0);
    const row = Math.floor(blank / size);
    const column = blank % size;
    if (key === "ArrowUp" && row < size - 1) tap(blank + size);
    if (key === "ArrowDown" && row > 0) tap(blank - size);
    if (key === "ArrowLeft" && column < size - 1) tap(blank + 1);
    if (key === "ArrowRight" && column > 0) tap(blank - 1);
  });

  // o cronômetro começa no primeiro movimento
  useEffect(() => {
    if (!started || solved) return undefined;
    const clock = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(clock);
  }, [started, solved]);

  useEffect(() => {
    if (!solved) return undefined;
    fx("match");
    const timer = setTimeout(() => {
      finish({
        score: Math.max(50, config.base - moves * 3 - seconds),
        stars: moves <= config.three ? 3 : moves <= config.two ? 2 : 1,
        message: `Você organizou tudo em ${moves} movimentos!`,
        stats: [
          { label: "Movimentos", value: moves },
          { label: "Tempo", value: formatTime(seconds) },
        ],
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [solved, finish, config, moves, seconds]);

  const frame = Math.max(220, Math.min(area.width, area.height - HUD_HEIGHT - 60, 460));
  const cell = Math.floor((frame - PADDING * 2 - GAP * (size - 1)) / size);
  const inner = cell * size + GAP * (size - 1);

  return (
    <>
      <HudRow>
        <HudPill icon="👣" value={moves} label="Movimentos" />
        <HudPill icon="⏱️" value={formatTime(seconds)} label="Tempo" />
        <HudPill icon="🎯" value={`${placed}/${tiles.length - 1}`} label="No lugar" />
      </HudRow>

      <Body>
        <Frame style={[{ padding: PADDING }, shadow(12, 28)]}>
          <View style={{ width: inner, height: inner }}>
            {tiles.map((value, index) =>
              value === 0 ? null : (
                <Tile
                  key={value}
                  value={value}
                  cell={cell}
                  row={Math.floor(index / size)}
                  column={index % size}
                  placed={value === index + 1}
                  onPress={() => tap(index)}
                />
              )
            )}
          </View>
        </Frame>
        <Hint>
          {Platform.OS === "web"
            ? "Toque em uma peça ou use as setas do teclado ⌨️"
            : "Toque em uma peça ao lado do espaço vazio"}
        </Hint>
      </Body>
    </>
  );
}

export default function SlidePuzzle() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
