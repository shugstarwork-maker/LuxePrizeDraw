import type { ReactNode } from 'react';
export function LuxeChessFrame({ children }: { children: ReactNode }) {
  return <section className="luxe-chess-table" aria-label="Luxe Chess table">
    <header className="luxe-chess-brand"><span aria-hidden="true">♛</span><h3>LUXE CHESS</h3><p>Free-play · Strategy collection</p></header>
    <div className="luxe-chess-rail">{children}</div>
    <footer className="luxe-chess-signature" aria-hidden="true">♠ — LUXE CHESS — ♠</footer>
  </section>;
}
