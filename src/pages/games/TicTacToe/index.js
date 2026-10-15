import { useEffect, useMemo, useState } from "react";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import GameShell from "../../../components/GameShell";
import { HUD_HEIGHT, HudPill, HudRow } from "../../../components/Hud";
import Mascot from "../../../components/Mascot";
import { getGame } from "../../../data/games";
import { fx } from "../../../services/feedback";
import { shadow } from "../../../theme";
import { pick } from "../../../utils/helpers";
import { Banner, Bar, Body, Cell, Grid, Ring, Speech } from "./style";

const GAME = getGame("velha");
const ROUNDS = 3;
const GAP = 10;
const EMPTY = Array(9).fill(null);
const MULTIPLIER = { facil: 1, medio: 1.5, dificil: 2 };
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// null enquanto a rodada continua; depois { mark: "X" | "O" | "draw", line }
function check(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { mark: board[a], line };
  }
  return board.every(Boolean) ? { mark: "draw", line: [] } : null;
}

const emptyCells = (board) => board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);

// Nota da posição para o Bip (O): positiva se ele ganha, negativa se perde. Vencer antes vale mais.
function minimax(board, mark, depth) {
  const result = check(board);
  if (result) return result.mark === "O" ? 10 - depth : result.mark === "X" ? depth - 10 : 0;

  const scores = emptyCells(board).map((index) => {
    board[index] = mark;
    const score = minimax(board, mark === "O" ? "X" : "O", depth + 1);
    board[index] = null;
    return score;
  });
  return mark === "O" ? Math.max(...scores) : Math.min(...scores);
}

function perfectMove(board) {
  const free = emptyCells(board);
  if (free.length === 9) return pick([0, 2, 4, 6, 8]);

  const copy = [...board];
  let best = -Infinity;
  let moves = [];
  for (const index of free) {
    copy[index] = "O";
    const score = minimax(copy, "X", 1);
    copy[index] = null;
    if (score > best) {
      best = score;
      moves = [index];
    } else if (score === best) {
      moves.push(index);
    }
  }
  return pick(moves);
}

// casa que completa uma linha para "mark", se existir
function finishingMove(board, mark) {
  return emptyCells(board).find((index) => {
    const copy = [...board];
    copy[index] = mark;
    return check(copy)?.mark === mark;
  });
}

function bipMove(board, level) {
  const free = emptyCells(board);
  if (level === "facil") return pick(free);

  if (level === "medio") {
    const smart = finishingMove(board, "O") ?? finishingMove(board, "X");
    if (smart !== undefined) return smart;
    return board[4] === null && Math.random() < 0.6 ? 4 : pick(free);
  }

  // no difícil ele joga perfeito, mas de vez em quando se distrai (senão seria impossível ganhar)
  return Math.random() < 0.12 ? pick(free) : perfectMove(board);
}

function Mark({ mark, size }) {
  if (mark === "X") {
    const bar = { width: size * 0.74, height: size * 0.17, borderRadius: size * 0.09 };
    return (
      <Appear from="scale" style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Bar style={[bar, { transform: [{ rotate: "45deg" }] }]} />
        <Bar style={[bar, { transform: [{ rotate: "-45deg" }] }]} />
      </Appear>
    );
  }
  return (
    <Appear from="scale">
      <Ring style={{ width: size * 0.66, height: size * 0.66, borderRadius: size, borderWidth: size * 0.15 }} />
    </Appear>
  );
}

function Board({ mode, finish, area }) {
  const versusBip = !mode.casual;
  const [board, setBoard] = useState(EMPTY);
  const [turn, setTurn] = useState("X");
  const [round, setRound] = useState(1);
  const [tally, setTally] = useState({ X: 0, O: 0, draw: 0 });
  const [over, setOver] = useState(false);
  const outcome = useMemo(() => check(board), [board]);

  function play(position, mark) {
    if (board[position] || outcome) return;
    fx(mark === "X" ? "pop" : "tap");
    setBoard(board.map((cell, index) => (index === position ? mark : cell)));
    setTurn(mark === "X" ? "O" : "X");
  }

  // vez do Bip: ele "pensa" um pouquinho antes de jogar
  useEffect(() => {
    if (!versusBip || turn !== "O" || outcome || over) return undefined;
    const timer = setTimeout(() => play(bipMove(board, mode.id), "O"), 800);
    return () => clearTimeout(timer);
  }, [versusBip, turn, outcome, over, board, mode.id]);

  // fim de rodada: marca o ponto e prepara a próxima (quem começa vai alternando)
  useEffect(() => {
    if (!outcome) return undefined;
    const kidWon = outcome.mark === "X" || (!versusBip && outcome.mark === "O");
    fx(outcome.mark === "draw" ? "tick" : kidWon ? "match" : "wrong");
    setTally((current) => ({ ...current, [outcome.mark]: current[outcome.mark] + 1 }));

    const timer = setTimeout(() => {
      if (round === ROUNDS) {
        setOver(true);
        return;
      }
      setBoard(EMPTY);
      setTurn(round % 2 === 1 ? "O" : "X");
      setRound(round + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [outcome, round, versusBip]);

  useEffect(() => {
    if (!over) return;
    const { X: wins, O: losses, draw: draws } = tally;

    if (!versusBip) {
      finish({
        headline: wins > losses ? "Jogador X venceu!" : losses > wins ? "Jogador O venceu!" : "Empate!",
        message: `Placar final: X ${wins} × ${losses} O`,
      });
      return;
    }

    const points = wins * 2 + draws;
    finish({
      score: Math.round((wins * 100 + draws * 40) * MULTIPLIER[mode.id]),
      stars: points >= 4 ? 3 : points === 3 ? 2 : points === 2 ? 1 : 0,
      headline: wins > losses ? "Você venceu o Bip!" : wins === losses ? "Empate com o Bip!" : "O Bip venceu desta vez!",
      message: `Placar final: você ${wins} × ${losses} Bip`,
      stats: [
        { label: "Vitórias", value: wins },
        { label: "Empates", value: draws },
        { label: "Derrotas", value: losses },
      ],
      detail: { wins, losses, draws },
    });
  }, [over, finish, tally, versusBip, mode.id]);

  let speech;
  let mood = "happy";
  if (outcome?.mark === "draw") {
    speech = "Deu velha! Ninguém ganhou. 🤝";
  } else if (outcome) {
    const bipWon = versusBip && outcome.mark === "O";
    speech = bipWon
      ? "Ganhei esta rodada! Vamos de novo?"
      : versusBip
      ? "Você ganhou a rodada! 🎉"
      : `Jogador ${outcome.mark} ganhou a rodada! 🎉`;
    mood = bipWon ? "excited" : "wink";
  } else if (versusBip) {
    speech = turn === "X" ? "Sua vez! Você é o X." : "Hmm, deixa eu pensar...";
    mood = turn === "X" ? "happy" : "thinking";
  } else {
    speech = `Vez do jogador ${turn}`;
  }

  const boardSize = Math.max(210, Math.min(area.width, area.height - HUD_HEIGHT - 110, 440));
  const cellSize = Math.floor((boardSize - 20 - GAP * 2) / 3);
  const waitingBip = versusBip && turn === "O";

  return (
    <>
      <HudRow>
        <HudPill icon="❌" value={tally.X} label={versusBip ? "Você" : "Jogador X"} />
        <HudPill icon="🏁" value={`${round}/${ROUNDS}`} label="Rodada" />
        <HudPill icon="⭕" value={tally.O} label={versusBip ? "Bip" : "Jogador O"} />
      </HudRow>

      <Body>
        <Banner>
          <Mascot size={54} mood={mood} />
          <Speech accessibilityLiveRegion="polite">{speech}</Speech>
        </Banner>

        <Grid style={[{ gap: GAP, width: cellSize * 3 + GAP * 2 + 20 }, shadow(12, 28)]}>
          {board.map((mark, position) => (
            <Bouncy
              key={position}
              disabled={!!mark || !!outcome || waitingBip}
              sound={null}
              hoverScale={1.05}
              onPress={() => play(position, turn)}
              accessibilityLabel={`Casa ${position + 1}: ${mark || "vazia"}`}
            >
              <Cell $winner={outcome?.line.includes(position)} style={{ width: cellSize, height: cellSize }}>
                {mark ? <Mark mark={mark} size={cellSize} /> : null}
              </Cell>
            </Bouncy>
          ))}
        </Grid>
      </Body>
    </>
  );
}

export default function TicTacToe() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
