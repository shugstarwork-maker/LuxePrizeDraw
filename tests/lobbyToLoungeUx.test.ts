import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const league = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
const ticker = readFileSync(new URL('../src/components/PokerTournamentTicker.tsx', import.meta.url), 'utf8');
const impact = readFileSync(new URL('../src/components/LeagueImpactScreen.tsx', import.meta.url), 'utf8');
const frame = readFileSync(new URL('../src/components/PokerHudFrame.tsx', import.meta.url), 'utf8');
const carousel = readFileSync(new URL('../src/components/LoungeGamesCarousel.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

test('three-zone HUD frame renders the four persistent corners', () => {
  assert.match(frame, /hud-zone--tl/); // table info & league standing
  assert.match(frame, /hud-zone--tr/); // menu / leaderboard / audio shortcuts
  assert.match(frame, /hud-zone--bl/); // chat & social toggle
  assert.match(frame, /hud-zone--br/); // player profile mini-card
  assert.match(frame, /aria-label="Table information"/);
  assert.match(frame, /aria-label="Your seat"/);
  assert.match(frame, /League leaderboard/);
  assert.match(css, /\.poker-playing-page \.hud-zone \{ display: block; \}/);
  assert.match(css, /\.hud-chat-pop/);
});

test('tournament ticker shows players remaining, next blind countdown and bubble', () => {
  assert.match(ticker, /players remaining/);
  assert.match(ticker, /Next|Blinds .* in/);
  assert.match(ticker, /[Bb]ubble/);
  assert.match(ticker, /role="status"/);
  assert.match(css, /\.poker-ticker \{/);
  assert.match(league, /<PokerTournamentTicker playersRemaining=\{alivePlayers\}/);
});

test('league impact screen shows points, leaderboard position and CTAs', () => {
  assert.match(impact, /Your league impact/);
  assert.match(impact, /League XP earned/);
  assert.match(impact, /weekly board/);
  assert.match(impact, /Spectate the table/);
  assert.match(impact, /Back to the lounge/);
  assert.match(impact, /no cash value/);
  assert.match(league, /<LeagueImpactScreen impact=\{impact\}/);
  // session tracked from join to leave
  assert.match(league, /sessionRef\.current = \{ hands: 0, won: 0, chipsIn: table\.buyIn, xpStart: league\.xp \}/);
  assert.match(league, /sessionRef\.current\.hands \+= 1/);
  assert.match(league, /setImpact\(\{ handsPlayed: s\.hands/);
});

test('lounge themes give each game a distinct visual identity', () => {
  assert.match(carousel, /lounge-stack__card--\$\{g\.id\}/);
  assert.match(carousel, /Professional sporting lounge/);
  assert.match(carousel, /Classic casino felt/);
  assert.match(carousel, /Pub classic · underground/);
  assert.match(carousel, /lounge-stack__theme/);
  assert.match(css, /\.lounge-stack__card--blackjack \.lounge-stack__shade/);
  assert.match(css, /\.lounge-stack__card--brag \.lounge-stack__shade/);
  assert.match(css, /\.lounge-stack__card--blackjack \.lounge-stack__play/);
});

test('flow stays welcome → lounge → table with no auto-seat', () => {
  assert.doesNotMatch(league, /autoJoined/);
  assert.match(league, /Never auto-seat/);
  assert.match(league, /onEnter=\{\(\) => \{ play\("ticketSelect"\); setLobbyTab\("play"\); setScreen\("lobby"\); \}\}/);
});
