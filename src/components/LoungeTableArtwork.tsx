/** Original decorative CSS artwork, not game state or an interactive table. */
export function LoungeTableArtwork() {
  return <div className="lounge-table-art" aria-hidden="true">
    <div className="lounge-table-art__cards">{['♠', '♥', '♦', '♣'].map((suit, index) => <span key={suit} className={`lounge-table-art__ace lounge-table-art__ace--${index}`}><b>A</b><small>{suit}</small></span>)}</div>
    <div className="lounge-table-art__chips lounge-table-art__chips--left"><i /><i /><i /></div>
    <div className="lounge-table-art__chips lounge-table-art__chips--right"><i /><i /><i /></div>
    <div className="lounge-table-art__felt"><span>♠</span></div>
  </div>;
}
