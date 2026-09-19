export type DraughtsColor = "white" | "black";
export type DraughtsPiece = { color: DraughtsColor; king: boolean };
export type DraughtsBoard = Array<Array<DraughtsPiece | null>>;
export type DraughtsMove = { from: [number, number]; to: [number, number] };
export type DraughtsStatus = "playing" | "white_won" | "black_won" | "draw";
export type DraughtsState = { board: DraughtsBoard; turn: DraughtsColor; forcedFrom?: [number, number]; status: DraughtsStatus; halfMoves: number };
export const newDraughts = (): DraughtsState => ({ board: Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r + c) % 2 === 0 ? null : r < 3 ? { color: "black", king: false } : r > 4 ? { color: "white", king: false } : null)), turn: "white", status: "playing", halfMoves: 0 });
const inside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const dirs = (p: DraughtsPiece): Array<[number, number]> => p.king ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : p.color === "white" ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]];
export function draughtsMoves(state: DraughtsState, from?: [number, number]): DraughtsMove[] {
  const moves: DraughtsMove[] = [];
  const add = (r: number, c: number) => { const piece = state.board[r][c]; if (!piece || piece.color !== state.turn) return; for (const [dr, dc] of dirs(piece)) { const mid = state.board[r + dr]?.[c + dc]; const targetRow = r + dr * 2; const targetCol = c + dc * 2; if (inside(targetRow, targetCol) && mid && mid.color !== piece.color && !state.board[targetRow][targetCol]) moves.push({ from: [r, c], to: [targetRow, targetCol] }); else if (!state.forcedFrom && inside(r + dr, c + dc) && !state.board[r + dr][c + dc]) moves.push({ from: [r, c], to: [r + dr, c + dc] }); } };
  if (from) add(...from); else for (let r = 0; r < 8; r += 1) for (let c = 0; c < 8; c += 1) add(r, c);
  const captures = moves.filter((move) => Math.abs(move.to[0] - move.from[0]) === 2); return captures.length ? captures : moves;
}
export function playDraughts(state: DraughtsState, move: DraughtsMove): DraughtsState {
  if (state.status !== "playing") throw new Error("Match is complete."); const legal = draughtsMoves(state, state.forcedFrom); if (!legal.some((candidate) => candidate.from[0] === move.from[0] && candidate.from[1] === move.from[1] && candidate.to[0] === move.to[0] && candidate.to[1] === move.to[1])) throw new Error("Illegal draughts move.");
  const board = state.board.map((row) => row.map((piece) => piece && ({ ...piece }))); let piece = board[move.from[0]][move.from[1]]!; board[move.from[0]][move.from[1]] = null; const capture = Math.abs(move.to[0] - move.from[0]) === 2;
  if (capture) board[(move.from[0] + move.to[0]) / 2][(move.from[1] + move.to[1]) / 2] = null;
  if ((piece.color === "white" && move.to[0] === 0) || (piece.color === "black" && move.to[0] === 7)) piece = { ...piece, king: true }; board[move.to[0]][move.to[1]] = piece;
  const opponent: DraughtsColor = piece.color === "white" ? "black" : "white"; const chainState: DraughtsState = { ...state, board, forcedFrom: capture ? [move.to[0], move.to[1]] : undefined }; const continued = capture && draughtsMoves(chainState, chainState.forcedFrom).some((candidate) => Math.abs(candidate.to[0] - candidate.from[0]) === 2);
  const remaining = board.flat().filter((candidate) => candidate?.color === opponent).length; let status: DraughtsStatus = remaining ? "playing" : `${piece.color}_won` as DraughtsStatus; const next: DraughtsState = { board, turn: continued ? piece.color : opponent, forcedFrom: continued ? [move.to[0], move.to[1]] : undefined, status, halfMoves: capture ? 0 : state.halfMoves + 1 };
  if (next.status === "playing" && !draughtsMoves(next).length) status = `${piece.color}_won` as DraughtsStatus; return { ...next, status };
}
