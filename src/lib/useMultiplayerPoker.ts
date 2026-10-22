// Multiplayer poker client channel — connects to /ws/poker, keeps the latest
// server view, and sends join/action/next-hand messages. The server is the only
// source of truth; this hook just relays.
import { useEffect, useRef, useState } from "react";

export type MpView = {
  tableId: string;
  name: string;
  blinds: string;
  buyIn: number;
  seats: { id: string; name: string; seatIndex: number; connected: boolean }[];
  handNumber: number;
  state: {
    players: { id: string; name: string; initials: string; isBot: boolean; chips: number; bet: number; handBet: number; cards: ({ rank: string; suit: string } | null)[]; folded: boolean; allIn: boolean; sittingOut: boolean; hasActed: boolean }[];
    board: { rank: string; suit: string }[];
    pot: number;
    stage: string;
    dealerIndex: number;
    turnIndex: number;
    currentBet: number;
    minRaise: number;
    smallBlind: number;
    bigBlind: number;
    handOver: boolean;
    winners: { id: string; amount: number; label: string }[];
    lastAction: string;
    handNumber: number;
  };
  commitment: string | null;
  reveal: { hand: number; secret: string; deck: string[] } | null;
  yourTurn: boolean;
};

export type MpTableInfo = { id: string; name: string; blinds: string; buyIn: number; seats: number; maxSeats: number; playing: boolean };

export function useMultiplayerPoker(playerId: string, playerName: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [view, setView] = useState<MpView | null>(null);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const leave = () => { wsRef.current?.close(); wsRef.current = null; setView(null); setConnected(false); };

  useEffect(() => () => { wsRef.current?.close(); }, []);

  const connect = (tableId: string, seated: boolean) => {
    leave();
    setError("");
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}/ws/poker`);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: seated ? "join" : "spectate", tableId, playerId, name: playerName }));
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "joined" || msg.type === "state") setView(msg.view);
        if (msg.type === "error") setError(String(msg.error ?? "error"));
      } catch { /* ignore */ }
    };
    ws.onclose = () => { setConnected(false); };
  };

  const join = (tableId: string) => connect(tableId, true);
  const spectate = (tableId: string) => connect(tableId, false);
  const takeSeat = () => {
    const tableId = view?.tableId;
    if (tableId) wsRef.current?.send(JSON.stringify({ type: "join", tableId, playerId, name: playerName }));
  };

  const act = (action: "fold" | "check" | "call" | "raise", raiseTo = 0) => {
    wsRef.current?.send(JSON.stringify({ type: "action", action, raiseTo }));
  };
  const nextHand = () => wsRef.current?.send(JSON.stringify({ type: "next-hand" }));

  return { view, error, connected, join, spectate, takeSeat, act, nextHand, leave };
}
