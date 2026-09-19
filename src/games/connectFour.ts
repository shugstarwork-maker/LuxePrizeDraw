export type ConnectFourPiece = "red" | "yellow";
export type ConnectFourBoard = Array<Array<ConnectFourPiece | null>>;
export type ConnectFourState = { board: ConnectFourBoard; turn: ConnectFourPiece; status: "playing" | "draw" | "red_won" | "yellow_won"; moves: number[] };
export const newConnectFour = (): ConnectFourState => ({ board: Array.from({ length: 6 }, () => Array<ConnectFourPiece | null>(7).fill(null)), turn: "red", status: "playing", moves: [] });
const winner = (board: ConnectFourBoard, row: number, col: number, piece: ConnectFourPiece) => [[1, 0], [0, 1], [1, 1], [1, -1]].some(([dr, dc]) => { let total = 1; for (const sign of [-1, 1]) for (let r = row + dr * sign, c = col + dc * sign; r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === piece; r += dr * sign, c += dc * sign) total += 1; return total >= 4; });
export function playConnectFour(state: ConnectFourState, column: number): ConnectFourState {
  if (!Number.isInteger(column) || column < 0 || column > 6 || state.status !== "playing") throw new Error("Illegal Connect Four move.");
  const row = 5 - [...state.board].reverse().findIndex((line) => !line[column]);
  if (row < 0) throw new Error("Column is full.");
  const board = state.board.map((line) => [...line]); const piece = state.turn; board[row][column] = piece;
  const status = winner(board, row, column, piece) ? `${piece}_won` as const : board.every((line) => line.every(Boolean)) ? "draw" : "playing";
  return { board, turn: piece === "red" ? "yellow" : "red", status, moves: [...state.moves, column] };
}
