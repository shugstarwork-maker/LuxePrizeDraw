import { ChevronRight, MapPin, Users, Star, Coins } from 'lucide-react';
import { RollingCardCarousel } from './RollingCardCarousel';

export const GOLD_GAMES = [
  { id: 'chess', title: 'The Royal Chess Room', image: '/games/chess.svg', href: '/chess', rating: '9.8', match: '97%', chips: 'Free', facts: [['Two-player strategy', MapPin], ['Local play', Users], ['Full rules engine', Star]] },
  { id: 'connect4', title: 'Connect Four Club', image: '/games/connect-four.svg', href: '/play?game=connect4#games', rating: '9.6', match: '95%', chips: 'Free', facts: [['Classic four-in-a-row', MapPin], ['Private rooms', Users], ['Free-play', Coins]] },
  { id: 'draughts', title: 'The Draughts Salon', image: '/games/draughts.svg', href: '/play?game=draughts#games', rating: '9.5', match: '94%', chips: 'Free', facts: [['Crowned kings', MapPin], ['Local play', Users], ['Free-play', Coins]] },
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
      <img className="gold-games__bg" src={game.image} alt={`${game.title} illustrated game preview`} loading="lazy" />
      <div className="gold-games__shade" aria-hidden="true" />
      <span className="gold-games__vertical" aria-hidden="true">{game.title}</span>
      <div className="gold-games__panel">
        {game.facts.map(([label, Icon]) => <p key={label as string}><Icon className="h-3.5 w-3.5" aria-hidden="true" /><span>{label as string}</span></p>)}
      </div>
      <div className="gold-games__bottom">
        <div className="gold-games__stats">
          <span><b>{game.rating}</b><small>Game rating</small></span>
          <span><b>{game.match}</b><small>Player match</small></span>
          <span><b>{game.chips}</b><small>Cost</small></span>
        </div>
        <button type="button" className="gold-games__play" onClick={() => go(game.href)}>Play now <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </article>} />
    <p className="gold-games__limits">Free-play social games · No deposits, cash wagering or cash-out</p>
  </section>;
}
export function initialBoardGame(search: string): 'chess' | 'connect4' | 'draughts' {
  const game = new URLSearchParams(search).get('game');
  return game === 'connect4' || game === 'draughts' ? game : 'chess';
}
