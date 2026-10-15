import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import Bouncy from "../../../components/Bouncy";
import GameShell from "../../../components/GameShell";
import { HUD_HEIGHT, HudPill, HudRow } from "../../../components/Hud";
import Mascot from "../../../components/Mascot";
import { getGame } from "../../../data/games";
import { fx } from "../../../services/feedback";
import { nativeDriver, shadow } from "../../../theme";
import {
  PIECE_NAMES,
  VALUES,
  bipMove,
  gameStatus,
  inCheck,
  initialState,
  legalMoves,
  makeMove,
  opponent,
  positionKey,
  squareName,
} from "../../../utils/chess";
import { clamp } from "../../../utils/helpers";
import {
  Banner,
  Body,
  Captured,
  CapturedLead,
  ChoiceLabel,
  Coordinate,
  Frame,
  PromotionCard,
  PromotionChoice,
  PromotionChoices,
  PromotionOverlay,
  PromotionTitle,
  Speech,
  Squares,
} from "./style";

const GAME = getGame("xadrez");
const MULTIPLIER = { facil: 1, medio: 1.5, dificil: 2 };
// peças cheias para as duas cores (a cor vem do texto); ︎ pede o desenho de texto, não o emoji
const GLYPHS = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟︎" };
const LIGHT = "#F4E1BE";
const DARK = "#B98552";
const SIDE = { w: "brancas", b: "pretas" };
const FEMININE = { R: true, Q: true }; // a Torre, a Dama
const FILES = "abcdefgh";

const PIECE_FONT =
  Platform.OS === "web" ? "'Segoe UI Symbol', 'Noto Sans Symbols 2', 'DejaVu Sans', 'Arial Unicode MS', sans-serif" : undefined;
// contorno nas peças para elas aparecerem em qualquer casa
const OUTLINE = {
  w:
    Platform.OS === "web"
      ? {
          textShadow:
            "1px 1px 0 #2A1607, -1px -1px 0 #2A1607, 1px -1px 0 #2A1607, -1px 1px 0 #2A1607, 0 0 2px #2A1607, 0 3px 4px rgba(20,8,0,0.45)",
        }
      : { textShadowColor: "#2A1607", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  b:
    Platform.OS === "web"
      ? { textShadow: "0 0 2px rgba(255,255,255,0.85), 0 3px 4px rgba(20,8,0,0.35)" }
      : { textShadowColor: "rgba(255,255,255,0.85)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
};

const REASONS = {
  mate: "Xeque-mate: o rei não tinha mais para onde fugir.",
  stalemate: "Afogamento: quem tinha a vez não podia mexer nenhuma peça, mas não estava em xeque.",
  material: "Não sobraram peças suficientes para dar xeque-mate.",
  fifty: "Foram 50 lances seguidos sem captura e sem mexer peão.",
  repetition: "A mesma posição apareceu três vezes.",
};

const article = (type) => (FEMININE[type] ? "a" : "o");
const nameOf = (type) => PIECE_NAMES[type].toLowerCase();
const points = (pieces) => pieces.reduce((sum, piece) => sum + VALUES[piece[1]] / 100, 0);

function startPosition() {
  const chess = initialState();
  return {
    chess,
    ids: chess.board.map((piece, square) => (piece ? square : null)), // cada peça tem um número fixo (para animar)
    last: null,
    captured: { w: [], b: [] }, // peças que cada cor já pegou
    plies: 0,
  };
}

function applyMove(game, move) {
  const ids = game.ids.slice();
  const color = move.piece[0];
  if (move.enPassant) ids[move.to + (color === "w" ? 8 : -8)] = null;
  ids[move.to] = ids[move.from];
  ids[move.from] = null;
  if (move.castle === "K") {
    ids[move.to - 1] = ids[move.to + 1];
    ids[move.to + 1] = null;
  } else if (move.castle === "Q") {
    ids[move.to + 1] = ids[move.to - 2];
    ids[move.to - 2] = null;
  }
  return {
    chess: makeMove(game.chess, move),
    ids,
    last: move,
    captured: move.captured ? { ...game.captured, [color]: [...game.captured[color], move.captured] } : game.captured,
    plies: game.plies + 1,
  };
}

function Glyph({ type, color, size, style }) {
  return (
    <Text
      allowFontScaling={false}
      style={[
        { fontFamily: PIECE_FONT, fontSize: size, lineHeight: size * 1.15, color: color === "w" ? "#FFFFFF" : "#2A1607" },
        OUTLINE[color],
        style,
      ]}
    >
      {GLYPHS[type]}
    </Text>
  );
}

// A peça desliza da casa antiga até a nova sempre que muda de lugar (o roque leva a torre junto).
function Piece({ piece, square, size, lifted }) {
  const x = (square % 8) * size;
  const y = Math.floor(square / 8) * size;
  const position = useRef(new Animated.ValueXY({ x, y })).current;

  useEffect(() => {
    const animation = Animated.timing(position, {
      toValue: { x, y },
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [position, x, y]);

  return (
    <Animated.View
      style={[
        styles.piece,
        { width: size, height: size, transform: [...position.getTranslateTransform(), { scale: lifted ? 1.14 : 1 }] },
      ]}
    >
      <Glyph type={piece[1]} color={piece[0]} size={size * 0.78} />
    </Animated.View>
  );
}

function Square({ square, size, piece, marks, enabled, onPress }) {
  const row = Math.floor(square / 8);
  const col = square % 8;
  const light = (row + col) % 2 === 0;
  const label = `${squareName(square)}: ${
    piece ? `${PIECE_NAMES[piece[1]]} ${piece[0] === "w" ? (FEMININE[piece[1]] ? "branca" : "branco") : FEMININE[piece[1]] ? "preta" : "preto"}` : "vazia"
  }`;

  return (
    <Pressable
      onPress={() => onPress(square)}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center", backgroundColor: light ? LIGHT : DARK }}
    >
      {({ hovered }) => (
        <>
          {marks.last ? <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,210,63,0.55)" }]} /> : null}
          {marks.selected ? <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(34,211,238,0.6)" }]} /> : null}
          {marks.check ? (
            <View style={[StyleSheet.absoluteFill, { margin: size * 0.06, borderRadius: size, backgroundColor: "rgba(239,68,68,0.8)" }]} />
          ) : null}
          {hovered && marks.active ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.22)" }]} />
          ) : null}
          {marks.target ? (
            piece ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { margin: size * 0.05, borderRadius: size, borderWidth: size * 0.08, borderColor: "rgba(239,68,68,0.9)" },
                ]}
              />
            ) : (
              <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size, backgroundColor: "rgba(22,163,74,0.8)" }} />
            )
          ) : null}
          {col === 0 ? (
            <Coordinate $light={light} style={{ top: 2, left: 3 }}>
              {8 - row}
            </Coordinate>
          ) : null}
          {row === 7 ? (
            <Coordinate $light={light} style={{ bottom: 1, right: 4 }}>
              {FILES[col]}
            </Coordinate>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

function CapturedRow({ pieces, lead }) {
  const sorted = [...pieces].sort((a, b) => VALUES[b[1]] - VALUES[a[1]]);
  return (
    <Captured accessibilityLabel={`${pieces.length} peças capturadas`}>
      {sorted.map((piece, index) => (
        <Glyph key={`${piece}${index}`} type={piece[1]} color={piece[0]} size={18} />
      ))}
      {lead > 0 ? <CapturedLead>+{lead}</CapturedLead> : null}
    </Captured>
  );
}

// O que o Bip fala a cada momento (e com que cara).
function chat({ game, status, selected, promotion, versusBip, playerWon }) {
  const { chess, last } = game;
  const turn = chess.turn;

  if (status) {
    if (status.reason !== "mate") return { text: `Empate! ${REASONS[status.reason]}`, mood: "happy" };
    if (!versusBip) return { text: `Xeque-mate! As ${SIDE[status.winner]} venceram! 🏆`, mood: "excited" };
    return playerWon
      ? { text: "Xeque-mate! Você me venceu! 🏆", mood: "sad" }
      : { text: "Xeque-mate! Desta vez eu ganhei. 😎", mood: "excited" };
  }
  if (promotion) return { text: "O peão chegou do outro lado! Escolha a peça nova. ✨", mood: "excited" };

  const selectedPiece = selected !== null ? chess.board[selected] : null;
  if (selectedPiece) {
    const type = selectedPiece[1];
    return {
      text: `${article(type) === "a" ? "A" : "O"} ${nameOf(type)}: as bolinhas verdes mostram para onde ${
        FEMININE[type] ? "ela" : "ele"
      } pode ir.`,
      mood: "happy",
    };
  }

  const check = inCheck(chess);
  if (versusBip) {
    if (turn === "b") {
      if (last?.captured) {
        const type = last.captured[1];
        return { text: `Ai! Você pegou ${FEMININE[type] ? "minha" : "meu"} ${nameOf(type)}! 😮`, mood: "sad" };
      }
      return { text: "Hmm, deixa eu pensar... 🤔", mood: "thinking" };
    }
    if (check) return { text: "Xeque! Proteja o seu rei! 😱", mood: "excited" };
    if (!last) return { text: "Você joga com as brancas. Faça o primeiro lance! ♟️", mood: "happy" };
    if (last.captured) {
      const type = last.captured[1];
      return { text: `Peguei ${FEMININE[type] ? "sua" : "seu"} ${nameOf(type)}! 😜 Sua vez.`, mood: "wink" };
    }
    if (last.castle) return { text: "Fiz o roque para proteger meu rei. Sua vez!", mood: "happy" };
    return { text: `Movi ${article(last.piece[1])} ${nameOf(last.piece[1])} para ${squareName(last.to)}. Sua vez!`, mood: "happy" };
  }

  if (check) return { text: `Xeque nas ${SIDE[turn]}! Protejam o rei! 😱`, mood: "excited" };
  if (last?.captured) {
    const type = last.captured[1];
    return {
      text: `As ${SIDE[opponent(turn)]} pegaram ${FEMININE[type] ? "uma" : "um"} ${nameOf(type)}! Vez das ${SIDE[turn]}.`,
      mood: "wink",
    };
  }
  return { text: `Vez das ${SIDE[turn]} ${turn === "w" ? "⚪" : "⚫"}`, mood: "happy" };
}

function Board({ mode, finish, area }) {
  const versusBip = !mode.casual;
  const [game, setGame] = useState(startPosition);
  const [selected, setSelected] = useState(null);
  const [promotion, setPromotion] = useState(null); // { from, to } enquanto a criança escolhe a peça nova
  const [status, setStatus] = useState(null);
  const seen = useRef(new Map([[positionKey(game.chess), 1]])); // posições repetidas

  const moves = useMemo(() => (status ? [] : legalMoves(game.chess)), [game.chess, status]);
  const turn = game.chess.turn;
  const humanTurn = !status && !promotion && (!versusBip || turn === "w");
  const targets = selected === null ? [] : moves.filter((move) => move.from === selected);
  const checkedKing = !status || status.reason === "mate" ? (inCheck(game.chess) ? game.chess.board.indexOf(`${turn}K`) : -1) : -1;
  const playerWon = status?.winner === "w";

  function play(move) {
    const next = applyMove(game, move);
    const key = positionKey(next.chess);
    const count = (seen.current.get(key) || 0) + 1;
    seen.current.set(key, count);
    fx(inCheck(next.chess) ? "tick" : move.captured ? "pop" : "slide");
    setGame(next);
    setSelected(null);
    setPromotion(null);
    setStatus(gameStatus(next.chess, count));
  }

  function press(square) {
    if (!humanTurn) return;
    const move = targets.find((item) => item.to === square);
    if (move) {
      if (move.promotion) setPromotion({ from: move.from, to: square });
      else play(move);
      return;
    }
    const piece = game.chess.board[square];
    if (piece && piece[0] === turn) {
      fx("tap");
      setSelected(square === selected ? null : square);
    } else {
      setSelected(null);
    }
  }

  // vez do Bip: ele "pensa" um pouquinho antes de mexer (e a tela mostra isso antes de ele calcular)
  useEffect(() => {
    if (!versusBip || status || turn !== "b") return undefined;
    const timer = setTimeout(() => {
      const move = bipMove(game.chess, mode.id);
      if (move) play(move);
    }, 700);
    return () => clearTimeout(timer);
  }, [versusBip, status, turn, game, mode.id]); // "play" usa o "game" deste mesmo desenho

  // fim da partida: mostra o tabuleiro final um tempinho e abre o resultado
  useEffect(() => {
    if (!status) return undefined;
    if (status.reason === "mate" && (!versusBip || status.winner === "w")) fx("match");
    const timer = setTimeout(() => {
      const moveCount = Math.ceil(game.plies / 2);
      if (!versusBip) {
        finish({
          headline: status.winner ? `As ${SIDE[status.winner]} venceram!` : "Empate!",
          message: REASONS[status.reason],
          stats: [{ label: "Lances", value: moveCount }],
        });
        return;
      }
      const outcome = status.winner === "w" ? "win" : status.winner === "b" ? "loss" : "draw";
      const multiplier = MULTIPLIER[mode.id];
      finish({
        score:
          outcome === "win"
            ? Math.round(Math.max(400, 1500 - moveCount * 15) * multiplier)
            : outcome === "draw"
            ? Math.round(400 * multiplier)
            : Math.round(points(game.captured.w) * 10 * multiplier),
        stars: outcome === "win" ? 3 : outcome === "draw" ? 1 : 0,
        headline: outcome === "win" ? "Você venceu o Bip! 🏆" : outcome === "draw" ? "Empate com o Bip!" : "O Bip venceu desta vez!",
        message: REASONS[status.reason],
        stats: [
          { label: "Lances", value: moveCount },
          { label: "Capturas", value: game.captured.w.length },
          { label: "Perdidas", value: game.captured.b.length },
        ],
        detail: { result: outcome, reason: status.reason, moves: moveCount },
      });
    }, 2600);
    return () => clearTimeout(timer);
  }, [status, finish, game, versusBip, mode.id]);

  const speech = chat({ game, status, selected, promotion, versusBip, playerWon });
  const boardSize = clamp(Math.min(area.width - 22, area.height - HUD_HEIGHT - 70 - 52 - 40), 232, 560);
  const size = Math.floor(boardSize / 8);
  const inner = size * 8;
  const lead = points(game.captured.w) - points(game.captured.b);
  const choiceWidth = Math.min(62, Math.floor((inner - 60) / 4));

  const pieces = [];
  game.chess.board.forEach((piece, square) => {
    if (piece) pieces.push({ id: game.ids[square], piece, square });
  });

  return (
    <>
      <HudRow>
        <HudPill icon="⚪" value={game.captured.w.length} label={versusBip ? "Suas capturas" : "Brancas"} />
        <HudPill icon="♟️" value={game.chess.fullmove} label="Lance" />
        <HudPill icon="⚫" value={game.captured.b.length} label={versusBip ? "Do Bip" : "Pretas"} />
      </HudRow>

      <Body>
        <Banner>
          <Mascot size={50} mood={speech.mood} />
          <Speech accessibilityLiveRegion="polite">{speech.text}</Speech>
        </Banner>

        <CapturedRow pieces={game.captured.b} lead={-lead} />

        <Frame style={shadow(12, 28, "rgba(20,8,0,0.5)")}>
          <View style={{ width: inner, height: inner }}>
            <Squares style={{ width: inner, height: inner }}>
              {game.chess.board.map((piece, square) => (
                <Square
                  key={square}
                  square={square}
                  size={size}
                  piece={piece}
                  onPress={press}
                  enabled={humanTurn}
                  marks={{
                    active: humanTurn && ((piece && piece[0] === turn) || targets.some((move) => move.to === square)),
                    selected: square === selected,
                    target: targets.some((move) => move.to === square),
                    last: !!game.last && (game.last.from === square || game.last.to === square),
                    check: square === checkedKing,
                  }}
                />
              ))}
            </Squares>

            <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
              {pieces.map(({ id, piece, square }) => (
                <Piece key={id} piece={piece} square={square} size={size} lifted={square === selected} />
              ))}
            </View>

            {promotion ? (
              <PromotionOverlay style={{ borderRadius: 12 }}>
                <PromotionCard style={shadow(10, 24)}>
                  <PromotionTitle>Escolha a peça nova ✨</PromotionTitle>
                  <PromotionChoices>
                    {["Q", "R", "B", "N"].map((type) => (
                      <Bouncy
                        key={type}
                        sound="star"
                        accessibilityLabel={PIECE_NAMES[type]}
                        onPress={() =>
                          play(moves.find((move) => move.from === promotion.from && move.to === promotion.to && move.promotion === type))
                        }
                      >
                        <PromotionChoice style={{ width: choiceWidth, height: choiceWidth + 10 }}>
                          <Glyph type={type} color={turn} size={choiceWidth * 0.62} />
                          <ChoiceLabel>{PIECE_NAMES[type]}</ChoiceLabel>
                        </PromotionChoice>
                      </Bouncy>
                    ))}
                  </PromotionChoices>
                  <Bouncy accessibilityLabel="Cancelar" onPress={() => setPromotion(null)}>
                    <ChoiceLabel>Cancelar</ChoiceLabel>
                  </Bouncy>
                </PromotionCard>
              </PromotionOverlay>
            ) : null}
          </View>
        </Frame>

        <CapturedRow pieces={game.captured.w} lead={lead} />
      </Body>
    </>
  );
}

export default function Chess() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}

const styles = StyleSheet.create({
  piece: { position: "absolute", left: 0, top: 0, alignItems: "center", justifyContent: "center" },
});
