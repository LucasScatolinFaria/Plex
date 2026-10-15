// Regras do xadrez e o "cérebro" do Bip.
// O tabuleiro é uma lista de 64 casas: 0 = a8 (canto de cima à esquerda, do lado das pretas) ... 63 = h1.
// Peça = cor + tipo: "wK" é o rei branco, "bQ" a dama preta (P peão, N cavalo, B bispo, R torre, Q dama, K rei).
// Estado da partida: { board, turn, castling: { wK, wQ, bK, bQ }, ep, halfmove, fullmove }
//   ep = casa que pode ser tomada "en passant" (ou null); halfmove = lances sem peão nem captura (regra dos 50).

const FILES = "abcdefgh";
const KNIGHT_STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_STEPS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const STRAIGHTS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const SLIDES = { B: DIAGONALS, R: STRAIGHTS, Q: [...DIAGONALS, ...STRAIGHTS] };
const PROMOTIONS = ["Q", "R", "B", "N"];
// casas das torres no começo: se a torre sai dali (ou é capturada ali), aquele roque não vale mais
const ROOK_CORNERS = [[63, "wK"], [56, "wQ"], [7, "bK"], [0, "bQ"]];

export const PIECE_NAMES = { P: "Peão", N: "Cavalo", B: "Bispo", R: "Torre", Q: "Dama", K: "Rei" };

export const opponent = (color) => (color === "w" ? "b" : "w");
export const squareName = (square) => `${FILES[square % 8]}${8 - Math.floor(square / 8)}`;
const squareIndex = (name) => (8 - Number(name[1])) * 8 + FILES.indexOf(name[0]);
const at = (row, col) => (row >= 0 && row < 8 && col >= 0 && col < 8 ? row * 8 + col : -1);

const targetsOf = (steps) =>
  Array.from({ length: 64 }, (_, square) =>
    steps.map(([dr, dc]) => at(Math.floor(square / 8) + dr, (square % 8) + dc)).filter((to) => to >= 0)
  );
const KNIGHT_TARGETS = targetsOf(KNIGHT_STEPS);
const KING_TARGETS = targetsOf(KING_STEPS);

export function fromFen(fen) {
  const [placement, turn = "w", rights = "-", ep = "-", halfmove = "0", fullmove = "1"] = fen.trim().split(/\s+/);
  const board = [];
  for (const char of placement.replace(/\//g, "")) {
    if (/\d/.test(char)) board.push(...Array(Number(char)).fill(null));
    else board.push((char === char.toUpperCase() ? "w" : "b") + char.toUpperCase());
  }
  return {
    board,
    turn,
    castling: { wK: rights.includes("K"), wQ: rights.includes("Q"), bK: rights.includes("k"), bQ: rights.includes("q") },
    ep: ep === "-" ? null : squareIndex(ep),
    halfmove: Number(halfmove),
    fullmove: Number(fullmove),
  };
}

export const initialState = () => fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

// A casa "square" está sendo atacada por alguma peça da cor "by"?
export function isAttacked(board, square, by) {
  const row = Math.floor(square / 8);
  const col = square % 8;
  const pawnRow = by === "w" ? row + 1 : row - 1;
  for (const dc of [-1, 1]) {
    const from = at(pawnRow, col + dc);
    if (from >= 0 && board[from] === `${by}P`) return true;
  }
  for (const from of KNIGHT_TARGETS[square]) if (board[from] === `${by}N`) return true;
  for (const from of KING_TARGETS[square]) if (board[from] === `${by}K`) return true;
  for (const [dr, dc] of DIAGONALS) {
    for (let r = row + dr, c = col + dc; r >= 0 && r < 8 && c >= 0 && c < 8; r += dr, c += dc) {
      const piece = board[r * 8 + c];
      if (piece) {
        if (piece === `${by}B` || piece === `${by}Q`) return true;
        break;
      }
    }
  }
  for (const [dr, dc] of STRAIGHTS) {
    for (let r = row + dr, c = col + dc; r >= 0 && r < 8 && c >= 0 && c < 8; r += dr, c += dc) {
      const piece = board[r * 8 + c];
      if (piece) {
        if (piece === `${by}R` || piece === `${by}Q`) return true;
        break;
      }
    }
  }
  return false;
}

export const inCheck = (state) => isAttacked(state.board, state.board.indexOf(`${state.turn}K`), opponent(state.turn));

// Lances que as peças sabem fazer, sem conferir se deixam o próprio rei em xeque.
function pseudoMoves(state, capturesOnly) {
  const { board, turn: color, castling, ep } = state;
  const enemy = opponent(color);
  const moves = [];
  const push = (from, to, extra) => moves.push({ from, to, piece: board[from], captured: board[to], ...extra });

  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (!piece || piece[0] !== color) continue;
    const type = piece[1];
    const row = Math.floor(from / 8);
    const col = from % 8;

    if (type === "P") {
      const dir = color === "w" ? -1 : 1;
      const lastRow = color === "w" ? 0 : 7;
      const pawnMove = (to) => {
        if (Math.floor(to / 8) === lastRow) PROMOTIONS.forEach((promotion) => push(from, to, { promotion }));
        else push(from, to);
      };
      const one = at(row + dir, col);
      if (!capturesOnly && one >= 0 && !board[one]) {
        pawnMove(one);
        const two = at(row + 2 * dir, col);
        if (row === (color === "w" ? 6 : 1) && !board[two]) push(from, two, { double: true });
      }
      for (const dc of [-1, 1]) {
        const to = at(row + dir, col + dc);
        if (to < 0) continue;
        if (board[to] && board[to][0] === enemy) pawnMove(to);
        else if (to === ep) push(from, to, { captured: `${enemy}P`, enPassant: true });
      }
      continue;
    }

    if (type === "N" || type === "K") {
      for (const to of (type === "N" ? KNIGHT_TARGETS : KING_TARGETS)[from]) {
        const target = board[to];
        if (target ? target[0] === enemy : !capturesOnly) push(from, to);
      }
      // roque: rei e torre no lugar, caminho livre e o rei não passa por casa atacada
      const home = color === "w" ? 60 : 4;
      if (type === "K" && !capturesOnly && from === home && !isAttacked(board, home, enemy)) {
        if (
          castling[`${color}K`] &&
          !board[home + 1] &&
          !board[home + 2] &&
          board[home + 3] === `${color}R` &&
          !isAttacked(board, home + 1, enemy) &&
          !isAttacked(board, home + 2, enemy)
        ) {
          push(from, home + 2, { castle: "K" });
        }
        if (
          castling[`${color}Q`] &&
          !board[home - 1] &&
          !board[home - 2] &&
          !board[home - 3] &&
          board[home - 4] === `${color}R` &&
          !isAttacked(board, home - 1, enemy) &&
          !isAttacked(board, home - 2, enemy)
        ) {
          push(from, home - 2, { castle: "Q" });
        }
      }
      continue;
    }

    for (const [dr, dc] of SLIDES[type]) {
      for (let r = row + dr, c = col + dc; r >= 0 && r < 8 && c >= 0 && c < 8; r += dr, c += dc) {
        const to = r * 8 + c;
        const target = board[to];
        if (target) {
          if (target[0] === enemy) push(from, to);
          break;
        }
        if (!capturesOnly) push(from, to);
      }
    }
  }
  return moves;
}

// Faz o lance e devolve um estado novo (o antigo não muda).
export function makeMove(state, move) {
  const board = state.board.slice();
  const color = move.piece[0];
  board[move.from] = null;
  board[move.to] = move.promotion ? color + move.promotion : move.piece;
  if (move.enPassant) board[move.to + (color === "w" ? 8 : -8)] = null;
  if (move.castle === "K") {
    board[move.to - 1] = board[move.to + 1];
    board[move.to + 1] = null;
  } else if (move.castle === "Q") {
    board[move.to + 1] = board[move.to - 2];
    board[move.to - 2] = null;
  }

  let { castling } = state;
  if (castling.wK || castling.wQ || castling.bK || castling.bQ) {
    castling = { ...castling };
    if (move.piece[1] === "K") {
      castling[`${color}K`] = false;
      castling[`${color}Q`] = false;
    }
    for (const [corner, right] of ROOK_CORNERS) {
      if (move.from === corner || move.to === corner) castling[right] = false;
    }
  }

  return {
    board,
    turn: opponent(color),
    castling,
    ep: move.double ? (move.from + move.to) / 2 : null,
    halfmove: move.piece[1] === "P" || move.captured ? 0 : state.halfmove + 1,
    fullmove: state.fullmove + (color === "b" ? 1 : 0),
  };
}

// Lances permitidos de verdade: nenhum pode deixar o próprio rei em xeque.
export function legalMoves(state, capturesOnly = false) {
  const color = state.turn;
  const enemy = opponent(color);
  return pseudoMoves(state, capturesOnly).filter((move) => {
    const next = makeMove(state, move);
    const king = move.piece[1] === "K" ? move.to : next.board.indexOf(`${color}K`);
    return !isAttacked(next.board, king, enemy);
  });
}

// Ninguém consegue dar xeque-mate: só os reis, ou rei com um bispo ou um cavalo contra rei.
export function insufficientMaterial(board) {
  const others = board.filter((piece) => piece && piece[1] !== "K");
  if (others.length === 0) return true;
  return others.length === 1 && (others[0][1] === "B" || others[0][1] === "N");
}

// Identifica a posição para contar repetições (mesmas peças, mesma vez e mesmos direitos).
export function positionKey(state) {
  const { wK, wQ, bK, bQ } = state.castling;
  return `${state.board.map((piece) => piece || ".").join("")}${state.turn}${+wK}${+wQ}${+bK}${+bQ}${state.ep ?? "-"}`;
}

// null enquanto a partida continua; no fim, { reason, winner } (winner = null no empate)
//   reason: "mate" | "stalemate" (afogamento) | "material" | "fifty" | "repetition"
export function gameStatus(state, repetitions = 1) {
  if (legalMoves(state).length === 0) {
    return inCheck(state) ? { reason: "mate", winner: opponent(state.turn) } : { reason: "stalemate", winner: null };
  }
  if (insufficientMaterial(state.board)) return { reason: "material", winner: null };
  if (state.halfmove >= 100) return { reason: "fifty", winner: null };
  if (repetitions >= 3) return { reason: "repetition", winner: null };
  return null;
}

/* ---------- o Bip pensando ---------- */

export const VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 0 };

// Quanto vale cada peça em cada casa, do ponto de vista das brancas (linha de cima = 8ª fileira).
// Tabelas do "Simplified Evaluation Function" (Tomasz Michniewski).
const TABLES = {
  P: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  N: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  B: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  R: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],
  Q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  K: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
  // no final o rei precisa ir para o meio e ajudar
  KEnd: [
    -50, -40, -30, -20, -20, -30, -40, -50,
    -30, -20, -10, 0, 0, -10, -20, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -30, 0, 0, 0, 0, -30, -30,
    -50, -30, -30, -30, -30, -30, -30, -50,
  ],
};

// Nota da posição: positiva = melhor para as brancas (em centésimos de peão).
export function evaluate(board) {
  let pieces = 0;
  for (const piece of board) if (piece && piece[1] !== "P" && piece[1] !== "K") pieces += VALUES[piece[1]];
  const endgame = pieces <= 1600;

  let score = 0;
  const kings = {};
  for (let square = 0; square < 64; square++) {
    const piece = board[square];
    if (!piece) continue;
    const color = piece[0];
    const type = piece[1];
    // as tabelas são das brancas: para as pretas o tabuleiro é espelhado de cima para baixo
    const index = color === "w" ? square : (7 - Math.floor(square / 8)) * 8 + (square % 8);
    const table = type === "K" ? (endgame ? TABLES.KEnd : TABLES.K) : TABLES[type];
    const value = VALUES[type] + table[index];
    score += color === "w" ? value : -value;
    if (type === "K") kings[color] = square;
  }

  // no final, quem está ganhando empurra o rei adversário para a borda e chega perto dele (para dar o mate)
  if (endgame && Math.abs(score) > 200 && kings.w !== undefined && kings.b !== undefined) {
    const winner = score > 0 ? kings.w : kings.b;
    const loser = score > 0 ? kings.b : kings.w;
    const row = Math.floor(loser / 8);
    const col = loser % 8;
    const fromCenter = Math.max(3 - row, row - 4) + Math.max(3 - col, col - 4);
    const between = Math.abs(row - Math.floor(winner / 8)) + Math.abs(col - (winner % 8));
    const bonus = fromCenter * 10 + (14 - between) * 4;
    score += score > 0 ? bonus : -bonus;
  }
  return score;
}

const MATE = 100000;
const scoreFor = (state) => evaluate(state.board) * (state.turn === "w" ? 1 : -1);

// capturas primeiro (vítima valiosa com atacante barato), depois promoções
function ordered(moves) {
  const weight = (move) =>
    (move.captured ? 10 * VALUES[move.captured[1]] - VALUES[move.piece[1]] + 1000 : 0) +
    (move.promotion ? VALUES[move.promotion] : 0);
  return moves.sort((a, b) => weight(b) - weight(a));
}

// No fim da busca continua olhando as trocas, para não parar no meio de uma (e entregar uma peça).
function quiesce(state, alpha, beta, depth) {
  const stand = scoreFor(state);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (depth === 0) return alpha;
  for (const move of ordered(legalMoves(state, true))) {
    const score = -quiesce(makeMove(state, move), -beta, -alpha, depth - 1);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

// Minimax com poda alfa-beta: devolve a nota da posição para quem tem a vez.
function search(state, depth, alpha, beta, ply, quiet) {
  if (depth === 0) return quiet ? quiesce(state, alpha, beta, 4) : scoreFor(state);
  const moves = legalMoves(state);
  if (moves.length === 0) return inCheck(state) ? -MATE + ply : 0;
  for (const move of ordered(moves)) {
    const score = -search(makeMove(state, move), depth - 1, -beta, -alpha, ply + 1, quiet);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

// Fácil: olha só um lance, erra de propósito às vezes. Médio: pensa 2 lances. Difícil: 3 lances e as trocas.
const LEVELS = {
  facil: { depth: 1, quiet: false, noise: 150, blunder: 0.25 },
  medio: { depth: 2, quiet: true, noise: 40, blunder: 0.05 },
  dificil: { depth: 3, quiet: true, noise: 8, blunder: 0 },
};

export function bipMove(state, level = "medio", random = Math.random) {
  const settings = LEVELS[level] || LEVELS.medio;
  const moves = ordered(legalMoves(state));
  if (moves.length === 0) return null;
  if (random() < settings.blunder) return moves[Math.floor(random() * moves.length)];

  let best = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const score =
      -search(makeMove(state, move), settings.depth - 1, -MATE - 1, MATE + 1, 1, settings.quiet) +
      (random() * 2 - 1) * settings.noise;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}
