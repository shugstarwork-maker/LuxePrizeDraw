import { Chess, type Move, type Square } from "chess.js";
export type ChessMatch = { fen: string; history: string[]; status: "playing" | "white_won" | "black_won" | "draw"; positions?: string[]; lastMove?: { from: string; to: string } };
// Position key for repetition: board, side to move, castling and en-passant — not the move counters.
const positionKey = (fen: string) => fen.split(" ").slice(0, 4).join(" ");
export const newChess = (): ChessMatch => { const fen = new Chess().fen(); return { fen, history: [], status: "playing", positions: [positionKey(fen)] }; };
export function playChess(match: ChessMatch, from: Square, to: Square, promotion: "q" | "r" | "b" | "n" = "q"): ChessMatch {
  if (match.status !== "playing") throw new Error("Match is complete."); const chess = new Chess(match.fen); let move: Move; try { move = chess.move({ from, to, promotion }); } catch { throw new Error("Illegal chess move."); }
  // A Chess built from a FEN has no move history, so threefold repetition is counted here.
  const key = positionKey(chess.fen());
  const positions = [...(match.positions ?? [positionKey(match.fen)]), key];
  const repeated = positions.filter((p) => p === key).length >= 3;
  const status = chess.isCheckmate() ? chess.turn() === "w" ? "black_won" : "white_won" : chess.isStalemate() || repeated || chess.isInsufficientMaterial() || chess.isDrawByFiftyMoves() ? "draw" : "playing";
  return { fen: chess.fen(), history: [...match.history, move.san], status, positions, lastMove: { from: move.from, to: move.to } };
}
export const chessLegalMoves = (match: ChessMatch, square?: Square) => { const chess = new Chess(match.fen); return square ? chess.moves({ square, verbose: true }) : chess.moves({ verbose: true }); };
