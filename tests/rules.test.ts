import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import { newChess, playChess } from "../src/games/chess";
import { newConnectFour, playConnectFour } from "../src/games/connectFour";
import { draughtsMoves, newDraughts, playDraughts } from "../src/games/draughts";
test("connect four detects vertical wins",()=>{let s=newConnectFour(); for(const c of [0,1,0,1,0,1,0])s=playConnectFour(s,c); assert.equal(s.status,"red_won");});
test("chess rejects illegal moves and identifies checkmate",()=>{const c=new Chess(); c.move("f3");c.move("e5");c.move("g4");c.move("Qh4#");assert.equal(c.isCheckmate(),true);assert.throws(()=>new Chess().move("e5")); let match=newChess(); for(const [from,to] of [["f2","f3"],["e7","e5"],["g2","g4"],["d8","h4"]] as const) match=playChess(match,from,to); assert.equal(match.status,"black_won");});
test("draughts opens with legal moves and enforces mandatory capture",()=>{let s=newDraughts();assert.ok(draughtsMoves(s).length); s={...s,board:Array.from({length:8},()=>Array(8).fill(null))};s.board[5][0]={color:"white",king:false};s.board[4][1]={color:"black",king:false};s.board[5][4]={color:"white",king:false};assert.deepEqual(draughtsMoves(s),[{from:[5,0],to:[3,2]}]);assert.throws(()=>playDraughts(s,{from:[5,4],to:[4,3]}));});
