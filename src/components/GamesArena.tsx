import React, { useMemo, useState } from "react";
import { BadgeCheck, Crown, Gamepad2, RotateCcw, ShieldCheck, Swords, Trophy, Users, Zap, TrendingUp } from "lucide-react";

type GameId = "chess" | "draughts" | "connect-4";
type PlayerColor = "white" | "black";
type Cell = [number, number];

type ChessPiece = {
  color: PlayerColor;
  kind: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
};

type DraughtsPiece = {
  color: PlayerColor;
  king: boolean;
};

type ChessState = {
  board: Array<Array<ChessPiece | null>>;
  current: PlayerColor;
  selected: Cell | null;
  winner: PlayerColor | null;
  message: string;
};

type DraughtsState = {
  board: Array<Array<DraughtsPiece | null>>;
  current: PlayerColor;
  selected: Cell | null;
  winner: PlayerColor | null;
  message: string;
};

type Connect4Disc = "red" | "yellow";

type Connect4State = {
  board: Array<Array<Connect4Disc | null>>;
  current: Connect4Disc;
  winner: Connect4Disc | "draw" | null;
  message: string;
};

const GAMES: Array<{ id: GameId; name: string; description: string; badge: string; image: string }> = [
  { id: "chess", name: "Chess", description: "Classic timed 1v1 matches with ranked divisions.", badge: "Strategist", image: "/games/chess.svg" },
  { id: "draughts", name: "Draughts", description: "Quick tactical 1v1 challenges for every skill level.", badge: "Board Master", image: "/games/draughts.svg" },
  { id: "connect-4", name: "Connect 4", description: "The classic UK red-and-yellow four-in-a-row game.", badge: "Four in a Row", image: "/games/connect-four.svg" },
];

const STAKES = [25, 100, 250] as const;

type DemoOpponent = {
  name: string;
  initials: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  accent: string;
};

const DEMO_OPPONENTS: Record<GameId, DemoOpponent[]> = {
  chess: [
    { name: "Amelia Knight", initials: "AK", rating: 1482, wins: 42, losses: 18, streak: 4, accent: "from-violet-500 to-indigo-700" },
    { name: "Marcus Bishop", initials: "MB", rating: 1537, wins: 51, losses: 24, streak: 2, accent: "from-sky-500 to-blue-700" },
  ],
  draughts: [
    { name: "Ruby Clarke", initials: "RC", rating: 1396, wins: 37, losses: 16, streak: 5, accent: "from-rose-500 to-red-700" },
    { name: "Theo Mills", initials: "TM", rating: 1441, wins: 44, losses: 21, streak: 3, accent: "from-orange-500 to-amber-700" },
  ],
  "connect-4": [
    { name: "Mia Carter", initials: "MC", rating: 1328, wins: 29, losses: 14, streak: 3, accent: "from-red-500 to-rose-700" },
    { name: "Leo Foster", initials: "LF", rating: 1362, wins: 35, losses: 19, streak: 6, accent: "from-yellow-500 to-orange-700" },
  ],
};

const chessBackRank: ChessPiece["kind"][] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

function createInitialChessBoard(): Array<Array<ChessPiece | null>> {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => {
      if (row === 0) return { color: "black", kind: chessBackRank[col] };
      if (row === 1) return { color: "black", kind: "pawn" };
      if (row === 6) return { color: "white", kind: "pawn" };
      if (row === 7) return { color: "white", kind: chessBackRank[col] };
      return null;
    }),
  );
}

function createInitialDraughtsBoard(): Array<Array<DraughtsPiece | null>> {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => {
      if ((row + col) % 2 === 0) return null;
      if (row < 3) return { color: "black", king: false };
      if (row > 4) return { color: "white", king: false };
      return null;
    }),
  );
}

function createInitialConnect4Board(): Array<Array<Connect4Disc | null>> {
  return Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => null));
}

function createChessState(): ChessState {
  return {
    board: createInitialChessBoard(),
    current: "white",
    selected: null,
    winner: null,
    message: "White to move. Select a piece to start the demo match.",
  };
}

function createDraughtsState(): DraughtsState {
  return {
    board: createInitialDraughtsBoard(),
    current: "white",
    selected: null,
    winner: null,
    message: "White to move. Capture chains continue automatically in this demo.",
  };
}

function createConnect4State(): Connect4State {
  return {
    board: createInitialConnect4Board(),
    current: "red",
    winner: null,
    message: "Red to move. Drop a disc into any column.",
  };
}

function cloneChessBoard(board: Array<Array<ChessPiece | null>>): Array<Array<ChessPiece | null>> {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function cloneDraughtsBoard(board: Array<Array<DraughtsPiece | null>>): Array<Array<DraughtsPiece | null>> {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isPathClear(board: Array<Array<ChessPiece | null>>, from: Cell, to: Cell): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);
  let row = fromRow + rowStep;
  let col = fromCol + colStep;

  while (row !== toRow || col !== toCol) {
    if (board[row][col]) return false;
    row += rowStep;
    col += colStep;
  }

  return true;
}

function isValidChessMove(board: Array<Array<ChessPiece | null>>, from: Cell, to: Cell, current: PlayerColor): boolean {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = board[fromRow][fromCol];
  const target = board[toRow][toCol];

  if (!piece || piece.color !== current) return false;
  if (fromRow === toRow && fromCol === toCol) return false;
  if (target?.color === current) return false;

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);
  const direction = piece.color === "white" ? -1 : 1;

  switch (piece.kind) {
    case "pawn": {
      const startRow = piece.color === "white" ? 6 : 1;
      if (colDiff === 0 && !target) {
        if (rowDiff === direction) return true;
        if (fromRow === startRow && rowDiff === direction * 2) {
          return !board[fromRow + direction][fromCol];
        }
      }
      return absColDiff === 1 && rowDiff === direction && !!target && target.color !== piece.color;
    }
    case "rook":
      return (fromRow === toRow || fromCol === toCol) && isPathClear(board, from, to);
    case "knight":
      return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
    case "bishop":
      return absRowDiff === absColDiff && isPathClear(board, from, to);
    case "queen":
      return ((fromRow === toRow || fromCol === toCol) || absRowDiff === absColDiff) && isPathClear(board, from, to);
    case "king":
      return absRowDiff <= 1 && absColDiff <= 1;
    default:
      return false;
  }
}

function getChessSymbol(piece: ChessPiece): string {
  const symbols: Record<PlayerColor, Record<ChessPiece["kind"], string>> = {
    white: {
      pawn: "♙",
      rook: "♖",
      knight: "♘",
      bishop: "♗",
      queen: "♕",
      king: "♔",
    },
    black: {
      pawn: "♟",
      rook: "♜",
      knight: "♞",
      bishop: "♝",
      queen: "♛",
      king: "♚",
    },
  };

  return symbols[piece.color][piece.kind];
}

function getDraughtsDirections(piece: DraughtsPiece): Cell[] {
  if (piece.king) return [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  return piece.color === "white" ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]];
}

function hasAvailableDraughtsCapture(board: Array<Array<DraughtsPiece | null>>, row: number, col: number): boolean {
  const piece = board[row][col];
  if (!piece) return false;

  return getDraughtsDirections(piece).some(([rowStep, colStep]) => {
    const midRow = row + rowStep;
    const midCol = col + colStep;
    const landingRow = row + rowStep * 2;
    const landingCol = col + colStep * 2;

    if (!inBounds(landingRow, landingCol) || !inBounds(midRow, midCol)) return false;

    const middle = board[midRow][midCol];
    return !!middle && middle.color !== piece.color && !board[landingRow][landingCol];
  });
}

function getDraughtsPieceCount(board: Array<Array<DraughtsPiece | null>>, color: PlayerColor): number {
  return board.flat().filter((piece) => piece?.color === color).length;
}

function getConnect4Winner(board: Array<Array<Connect4Disc | null>>, row: number, col: number, disc: Connect4Disc): boolean {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  return directions.some(([rowStep, colStep]) => {
    let count = 1;

    for (const multiplier of [1, -1]) {
      let nextRow = row + rowStep * multiplier;
      let nextCol = col + colStep * multiplier;

      while (nextRow >= 0 && nextRow < 6 && nextCol >= 0 && nextCol < 7 && board[nextRow][nextCol] === disc) {
        count += 1;
        nextRow += rowStep * multiplier;
        nextCol += colStep * multiplier;
      }
    }

    return count >= 4;
  });
}

export const GamesArena: React.FC = () => {
  const [tokens, setTokens] = useState(1000);
  const [selectedGame, setSelectedGame] = useState<GameId>("chess");
  const [selectedStake, setSelectedStake] = useState<(typeof STAKES)[number]>(100);
  const [notice, setNotice] = useState("Choose a game and challenge another player.");
  const [opponent, setOpponent] = useState<DemoOpponent | null>(null);
  const [chessState, setChessState] = useState<ChessState>(createChessState);
  const [draughtsState, setDraughtsState] = useState<DraughtsState>(createDraughtsState);
  const [connect4State, setConnect4State] = useState<Connect4State>(createConnect4State);

  const game = useMemo(() => GAMES.find((item) => item.id === selectedGame)!, [selectedGame]);

  const createChallenge = () => {
    if (tokens < selectedStake) {
      setNotice("You need more demo tokens to enter this challenge.");
      return;
    }
    const opponents = DEMO_OPPONENTS[selectedGame];
    const selectedOpponent = opponents[Math.floor(Math.random() * opponents.length)];
    setTokens((value) => value - selectedStake);
    setOpponent(selectedOpponent);
    setNotice(`${selectedOpponent.name} accepted your ${game.name} demo challenge for ${selectedStake} tokens.`);
  };

  const handleChessCellClick = (row: number, col: number) => {
    setChessState((currentState) => {
      const piece = currentState.board[row][col];

      if (currentState.winner) {
        return { ...currentState, message: `${currentState.winner === "white" ? "White" : "Black"} already won. Reset to play again.` };
      }

      if (!currentState.selected) {
        if (!piece || piece.color !== currentState.current) {
          return { ...currentState, message: `Select a ${currentState.current} piece to move.` };
        }
        return { ...currentState, selected: [row, col], message: `${piece.color === "white" ? "White" : "Black"} ${piece.kind} selected.` };
      }

      const [selectedRow, selectedCol] = currentState.selected;
      const selectedPiece = currentState.board[selectedRow][selectedCol];

      if (!selectedPiece) {
        return { ...currentState, selected: null, message: "Select a piece again." };
      }

      if (selectedRow === row && selectedCol === col) {
        return { ...currentState, selected: null, message: "Selection cleared." };
      }

      if (piece?.color === currentState.current) {
        return { ...currentState, selected: [row, col], message: `${piece.color === "white" ? "White" : "Black"} ${piece.kind} selected.` };
      }

      if (!isValidChessMove(currentState.board, [selectedRow, selectedCol], [row, col], currentState.current)) {
        return { ...currentState, message: "That move is not available in the demo chess board." };
      }

      const board = cloneChessBoard(currentState.board);
      const captured = board[row][col];
      board[row][col] = board[selectedRow][selectedCol];
      board[selectedRow][selectedCol] = null;

      const movedPiece = board[row][col];
      if (movedPiece?.kind === "pawn" && (row === 0 || row === 7)) {
        board[row][col] = { ...movedPiece, kind: "queen" };
      }

      const winner = captured?.kind === "king" ? currentState.current : null;
      const nextPlayer = currentState.current === "white" ? "black" : "white";

      return {
        board,
        current: winner ? currentState.current : nextPlayer,
        selected: null,
        winner,
        message: winner
          ? `${winner === "white" ? "White" : "Black"} wins the demo board.`
          : `${nextPlayer === "white" ? "White" : "Black"} to move.`,
      };
    });
  };

  const handleDraughtsCellClick = (row: number, col: number) => {
    setDraughtsState((currentState) => {
      const piece = currentState.board[row][col];

      if (currentState.winner) {
        return { ...currentState, message: `${currentState.winner === "white" ? "White" : "Black"} already won. Reset to play again.` };
      }

      if (!currentState.selected) {
        if (!piece || piece.color !== currentState.current) {
          return { ...currentState, message: `Select a ${currentState.current} draughts piece.` };
        }
        return { ...currentState, selected: [row, col], message: `${piece.color === "white" ? "White" : "Black"} piece selected.` };
      }

      const [selectedRow, selectedCol] = currentState.selected;
      const selectedPiece = currentState.board[selectedRow][selectedCol];

      if (!selectedPiece) {
        return { ...currentState, selected: null, message: "Select a piece again." };
      }

      if (selectedRow === row && selectedCol === col) {
        return { ...currentState, selected: null, message: "Selection cleared." };
      }

      if (piece?.color === currentState.current) {
        return { ...currentState, selected: [row, col], message: `${piece.color === "white" ? "White" : "Black"} piece selected.` };
      }

      if (piece) {
        return { ...currentState, message: "Pick an open dark square for the move." };
      }

      const rowDiff = row - selectedRow;
      const colDiff = col - selectedCol;
      const absRowDiff = Math.abs(rowDiff);
      const absColDiff = Math.abs(colDiff);
      const directions = getDraughtsDirections(selectedPiece);
      const isForwardStep = directions.some(([rowStep, colStep]) => rowDiff === rowStep && colDiff === colStep);
      const isCaptureStep = directions.some(([rowStep, colStep]) => rowDiff === rowStep * 2 && colDiff === colStep * 2);

      if (absColDiff !== absRowDiff || (absRowDiff !== 1 && absRowDiff !== 2)) {
        return { ...currentState, message: "Draughts moves must stay on diagonal dark squares." };
      }

      const board = cloneDraughtsBoard(currentState.board);
      let captured = false;

      if (absRowDiff === 1) {
        if (!isForwardStep) {
          return { ...currentState, message: "That draughts piece cannot move that direction." };
        }
      } else if (absRowDiff === 2) {
        if (!isCaptureStep) {
          return { ...currentState, message: "That capture path is not valid." };
        }

        const jumpedRow = selectedRow + rowDiff / 2;
        const jumpedCol = selectedCol + colDiff / 2;
        const jumpedPiece = board[jumpedRow][jumpedCol];

        if (!jumpedPiece || jumpedPiece.color === selectedPiece.color) {
          return { ...currentState, message: "A capture requires jumping over an opposing piece." };
        }

        board[jumpedRow][jumpedCol] = null;
        captured = true;
      }

      board[row][col] = board[selectedRow][selectedCol];
      board[selectedRow][selectedCol] = null;

      const movedPiece = board[row][col];
      if (movedPiece && !movedPiece.king && ((movedPiece.color === "white" && row === 0) || (movedPiece.color === "black" && row === 7))) {
        board[row][col] = { ...movedPiece, king: true };
      }

      const opposingColor: PlayerColor = currentState.current === "white" ? "black" : "white";
      if (getDraughtsPieceCount(board, opposingColor) === 0) {
        return {
          board,
          current: currentState.current,
          selected: null,
          winner: currentState.current,
          message: `${currentState.current === "white" ? "White" : "Black"} wins the draughts demo.`,
        };
      }

      if (captured && hasAvailableDraughtsCapture(board, row, col)) {
        return {
          board,
          current: currentState.current,
          selected: [row, col],
          winner: null,
          message: "Capture again with the same piece to continue the chain.",
        };
      }

      return {
        board,
        current: opposingColor,
        selected: null,
        winner: null,
        message: `${opposingColor === "white" ? "White" : "Black"} to move.`,
      };
    });
  };

  const handleConnect4Drop = (column: number) => {
    setConnect4State((currentState) => {
      if (currentState.winner) {
        return { ...currentState, message: "Reset the board to start a new Connect 4 round." };
      }

      const row = [...currentState.board].reverse().findIndex((boardRow) => !boardRow[column]);
      if (row === -1) {
        return { ...currentState, message: "That column is full. Choose another one." };
      }

      const actualRow = currentState.board.length - 1 - row;
      const board = currentState.board.map((boardRow) => [...boardRow]);
      board[actualRow][column] = currentState.current;

      if (getConnect4Winner(board, actualRow, column, currentState.current)) {
        return {
          board,
          current: currentState.current,
          winner: currentState.current,
          message: `${currentState.current === "red" ? "Red" : "Yellow"} connects four and wins.`,
        };
      }

      const isDraw = board.every((boardRow) => boardRow.every(Boolean));
      if (isDraw) {
        return {
          board,
          current: currentState.current,
          winner: "draw",
          message: "The board is full. This round ends in a draw.",
        };
      }

      const nextPlayer: Connect4Disc = currentState.current === "red" ? "yellow" : "red";
      return {
        board,
        current: nextPlayer,
        winner: null,
        message: `${nextPlayer === "red" ? "Red" : "Yellow"} to move.`,
      };
    });
  };

  const renderChessBoard = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-white">Playable chess demo</h4>
          <p className="text-sm text-white/55">Standard piece movement with instant queen promotion and king capture win condition.</p>
        </div>
        <button
          onClick={() => setChessState(createChessState())}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset board
        </button>
      </div>
      <div className="grid grid-cols-8 gap-1 rounded-3xl bg-[#221707] p-3 shadow-inner shadow-black/40">
        {chessState.board.map((boardRow, rowIndex) =>
          boardRow.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1;
            const isSelected = chessState.selected?.[0] === rowIndex && chessState.selected?.[1] === colIndex;
            return (
              <button
                key={`chess-${rowIndex}-${colIndex}`}
                onClick={() => handleChessCellClick(rowIndex, colIndex)}
                className={`aspect-square rounded-xl text-2xl transition-all sm:text-3xl ${isDark ? "bg-slate-900/90 text-white" : "bg-[#f0d9b5] text-black"} ${isSelected ? "ring-2 ring-[#D4AF37] scale-[1.03]" : "hover:scale-[1.02]"}`}
                aria-label={`Chess ${rowIndex}-${colIndex}`}
              >
                {piece ? getChessSymbol(piece) : ""}
              </button>
            );
          }),
        )}
      </div>
      <p className="text-sm text-emerald-300">{chessState.message}</p>
    </div>
  );

  const renderDraughtsBoard = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-white">Playable draughts demo</h4>
          <p className="text-sm text-white/55">Diagonal movement, jump captures, king promotion, and chained captures are enabled.</p>
        </div>
        <button
          onClick={() => setDraughtsState(createDraughtsState())}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset board
        </button>
      </div>
      <div className="grid grid-cols-8 gap-1 rounded-3xl bg-[#140f06] p-3 shadow-inner shadow-black/40">
        {draughtsState.board.map((boardRow, rowIndex) =>
          boardRow.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1;
            const isSelected = draughtsState.selected?.[0] === rowIndex && draughtsState.selected?.[1] === colIndex;

            return (
              <button
                key={`draughts-${rowIndex}-${colIndex}`}
                onClick={() => handleDraughtsCellClick(rowIndex, colIndex)}
                className={`aspect-square rounded-xl transition-all ${isDark ? "bg-[#3b2710]" : "bg-[#e8d4ae]/90"} ${isSelected ? "ring-2 ring-[#D4AF37] scale-[1.03]" : "hover:scale-[1.02]"}`}
                aria-label={`Draughts ${rowIndex}-${colIndex}`}
              >
                {piece ? (
                  <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-black sm:h-10 sm:w-10 ${piece.color === "white" ? "bg-white text-black" : "bg-slate-950 text-white"} ${piece.king ? "ring-2 ring-[#D4AF37]" : ""}`}>
                    {piece.king ? "K" : ""}
                  </span>
                ) : null}
              </button>
            );
          }),
        )}
      </div>
      <p className="text-sm text-emerald-300">{draughtsState.message}</p>
    </div>
  );

  const renderConnect4Board = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-white">Playable Connect 4 demo</h4>
          <p className="text-sm text-white/55">Click any column to drop a disc and race to connect four in a row.</p>
        </div>
        <button
          onClick={() => setConnect4State(createConnect4State())}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset board
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 rounded-3xl bg-[#0758cc] p-4 shadow-inner shadow-black/40">
        {Array.from({ length: 7 }, (_, column) => (
          <button
            key={`connect4-column-${column}`}
            onClick={() => handleConnect4Drop(column)}
            className="rounded-2xl bg-[#043f9d] p-2 transition hover:bg-[#074bb3]"
            aria-label={`Connect 4 column ${column + 1}`}
          >
            <div className="space-y-2">
              {connect4State.board.map((boardRow, rowIndex) => (
                <div
                  key={`connect4-cell-${rowIndex}-${column}`}
                  className={`mx-auto h-9 w-9 rounded-full border border-white/10 sm:h-11 sm:w-11 ${
                    boardRow[column] === "red" ? "bg-[#e5252a]" : boardRow[column] === "yellow" ? "bg-[#ffd21e]" : "bg-[#f7f0d2]"
                  }`}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
      <p className="text-sm text-emerald-300">{connect4State.message}</p>
    </div>
  );

  const renderPlayableDemo = () => {
    switch (selectedGame) {
      case "chess":
        return renderChessBoard();
      case "draughts":
        return renderDraughtsBoard();
      case "connect-4":
        return renderConnect4Board();
      default:
        return null;
    }
  };

  return (
    <section id="games" className="py-20 sm:py-28 border-y border-white/10 bg-gradient-to-b from-slate-950 via-[#0b1020] to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-200 text-[10px] uppercase tracking-[0.2em] font-bold">
              <Gamepad2 className="w-3.5 h-3.5" />
              Games & Challenges
            </div>
            <h2 className="mt-4 text-3xl sm:text-5xl font-light text-white tracking-tight">Head-to-head <span className="font-bold text-[#D4AF37]">skill games</span></h2>
            <p className="mt-3 text-white/60">Play 1v1 Chess, Draughts, and Connect 4 in the demo arena. Tokens are non-redeemable, have no cash value, and cannot be bought or withdrawn.</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-[#D4AF37]/30 px-5 py-4 min-w-56">
            <div className="text-[10px] uppercase tracking-widest text-white/45">Demo token balance</div>
            <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-[#D4AF37]"><Crown className="w-5 h-5" /> {tokens.toLocaleString()} tokens</div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-slate-950 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-400/15 text-violet-200"><TrendingUp className="h-6 w-6" /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-white">Free prediction markets</h3><span className="rounded-full border border-violet-300/40 bg-violet-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-100">Coming soon</span></div><p className="mt-1 max-w-xl text-sm text-white/60">Make predictions, earn virtual points, and climb community leaderboards. Free-play only: no deposits, withdrawals, or cash prizes.</p></div></div>
            <span className="w-fit rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/50">Preview feature</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {GAMES.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedGame(item.id);
                setOpponent(null);
                setNotice(`Selected ${item.name}. Choose a demo-token stake or start the live board preview below.`);
              }}
              className={`text-left rounded-3xl p-6 border transition-all ${selectedGame === item.id ? "border-[#D4AF37] bg-white/10 shadow-xl shadow-amber-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}
            >
              <img src={item.image} alt="" className="h-40 w-full rounded-2xl border border-white/10 object-cover shadow-lg" />
              <div className="mt-5 flex items-start justify-between gap-3"><h3 className="text-xl font-bold text-white">{item.name}</h3><span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/70">1v1</span></div>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">{item.description}</p>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-emerald-300"><Users className="w-3.5 h-3.5" /> Live demo board</span><span className="flex items-center gap-1.5 text-[#D4AF37]"><BadgeCheck className="w-3.5 h-3.5" /> {item.badge}</span></div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-widest font-bold"><Trophy className="w-4 h-4" /> Weekly demo tournament</div>
            <h3 className="mt-3 text-2xl font-bold text-white">{game.name} 1v1 challenge</h3>
            <p className="mt-2 text-sm text-white/55">Select a demo-token entry amount. The flow is a non-monetary preview only; no payment, prize, cash-out, or account balance is created.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {STAKES.map((stake) => <button key={stake} onClick={() => setSelectedStake(stake)} className={`px-5 py-3 rounded-xl text-sm font-bold border ${selectedStake === stake ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}>{stake} tokens</button>)}
            </div>
            <button onClick={createChallenge} className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-sm uppercase tracking-wider transition-colors"><Swords className="w-4 h-4" /> Find demo opponent</button>
            <p aria-live="polite" className="mt-4 text-sm text-emerald-300">{notice}</p>
            {opponent && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-white/10 to-white/[0.03]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                  <span>Demo opponent found</span><span className="text-white/50">Local preview</span>
                </div>
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${opponent.accent} text-lg font-black text-white shadow-lg`}>{opponent.initials}</div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-lg font-bold text-white">{opponent.name}</h4><span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300">Ready</span></div><p className="mt-1 text-sm text-white/55">Matched for {game.name} · Demo-only 1v1</p></div>
                  <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[220px]"><div><div className="text-lg font-black text-white">{opponent.rating}</div><div className="text-[9px] uppercase tracking-wider text-white/45">ELO</div></div><div><div className="text-lg font-black text-white">{opponent.wins}-{opponent.losses}</div><div className="text-[9px] uppercase tracking-wider text-white/45">Record</div></div><div><div className="flex items-center justify-center gap-1 text-lg font-black text-[#D4AF37]"><Zap className="h-3.5 w-3.5" />{opponent.streak}</div><div className="text-[9px] uppercase tracking-wider text-white/45">Streak</div></div></div>
                </div>
                <div className="border-t border-white/10 bg-black/20 px-5 py-3 text-xs text-white/60">Expected rating change: <span className="font-bold text-emerald-300">+18 win</span><span className="mx-2 text-white/25">/</span><span className="font-bold text-rose-300">−12 loss</span></div>
              </div>
            )}
          </div>
          <aside className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 text-white font-bold"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Demo safeguards</div>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>Non-redeemable demo tokens only</li>
              <li>No deposits, payments, cash-out, or prizes</li>
              <li>Playable local demo boards for every featured game</li>
              <li>Game badge previews and matchmaking mock flow</li>
            </ul>
          </aside>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {renderPlayableDemo()}
        </div>
      </div>
    </section>
  );
};
