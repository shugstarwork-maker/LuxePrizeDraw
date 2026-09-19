import { Chess, type Move, type Square } from "chess.js";
export type ChessMatch = { fen: string; history: string[]; status: "playing" | "white_won" | "black_won" | "draw" };
export const newChess = (): ChessMatch => ({ fen: new Chess().fen(), history: [], status: "playing" });
export function playChess(match: ChessMatch, from: Square, to: Square, promotion: "q" | "r" | "b" | "n" = "q"): ChessMatch {
  if (match.status !== "playing") throw new Error("Match is complete."); const chess = new Chess(match.fen); let move: Move; try { move = chess.move({ from, to, promotion }); } catch { throw new Error("Illegal chess move."); }
  const status = chess.isCheckmate() ? chess.turn() === "w" ? "black_won" : "white_won" : chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial() || chess.isDrawByFiftyMoves() ? "draw" : "playing";
  return { fen: chess.fen(), history: [...match.history, move.san], status };
}
export const chessLegalMoves = (match: ChessMatch, square?: Square) => { const chess = new Chess(match.fen); return square ? chess.moves({ square, verbose: true }) : chess.moves({ verbose: true }); };
