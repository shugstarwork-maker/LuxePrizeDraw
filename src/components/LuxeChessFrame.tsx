import { useState, type ReactNode } from 'react';
export function LuxeChessFrame({ children }: { children: ReactNode }) {
  const [flat, setFlat] = useState(false);
  return <section className={`luxe-chess-table${flat ? " luxe-chess-table--flat" : " luxe-chess-table--3d"}`} aria-label="Luxe Chess table">
    <header className="luxe-chess-brand"><span aria-hidden="true">♛</span><h3>LUXE CHESS</h3><p>Free-play · Strategy collection</p></header>
    <button type="button" className="luxe-chess-view-toggle" aria-pressed={flat} onClick={() => setFlat(value => !value)}>{flat ? "3D view" : "Flat view"}</button><div className="luxe-chess-perspective"><div className="luxe-chess-rail">{children}</div></div>
    <footer className="luxe-chess-signature" aria-hidden="true">♠ — LUXE CHESS — ♠</footer>
  </section>;
}
