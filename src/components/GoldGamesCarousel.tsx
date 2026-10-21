import { RollingCardCarousel } from './RollingCardCarousel';

export const GOLD_GAMES = [
  { id: 'chess', title: 'The Royal Chess Room', symbol: '♛', image: '/games/chess.svg', href: '/chess', detail: 'Chess · Local two-player strategy' },
  { id: 'connect4', title: 'Connect Four Club', symbol: '●', image: '/games/connect-four.svg', href: '/play?game=connect4#games', detail: 'Connect Four · Local play and private online rooms' },
  { id: 'draughts', title: 'The Draughts Salon', symbol: '♜', image: '/games/draughts.svg', href: '/play?game=draughts#games', detail: 'Draughts · Captures and crowned kings' },
];
const go = (href: string) => {
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

export function GoldGamesCarousel() {
  return <section className="gold-games" aria-labelledby="gold-games-title">
    <header><span aria-hidden="true">♛</span><p>Luxe Arcade</p><h2 id="gold-games-title">The Games Collection</h2><small>Free-play only · No cash value</small></header>
    <RollingCardCarousel items={GOLD_GAMES} getKey={game => game.id} label="Luxe game" renderItem={game => <article className="gold-games__card">
      <div className="gold-games__top"><span>Featured game</span><span>Free-play</span></div>
      <div className="gold-games__art"><img src={game.image} alt={`${game.title} illustrated game preview`} loading="lazy" /><span aria-hidden="true">{game.symbol}</span></div>
      <div className="gold-games__copy"><p className="gold-games__badge">Luxe collection</p><h3>{game.title}</h3><p>{game.detail}</p><button type="button" className="gold-games__play" onClick={() => go(game.href)}>▶ Play now</button><small>No deposits, cash wagering or cash-out.</small></div>
    </article>} />
  </section>;
}
export function initialBoardGame(search: string): 'chess' | 'connect4' | 'draughts' {
  const game = new URLSearchParams(search).get('game');
  return game === 'connect4' || game === 'draughts' ? game : 'chess';
}
