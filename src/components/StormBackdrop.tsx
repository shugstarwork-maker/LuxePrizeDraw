export function StormBackdrop() {
  return (
    <div className="storm-backdrop" aria-hidden="true">
      <div className="storm-backdrop__clouds" />
      <div className="storm-backdrop__flash storm-backdrop__flash--one" />
      <div className="storm-backdrop__flash storm-backdrop__flash--two" />
      <svg className="storm-backdrop__bolt storm-backdrop__bolt--left" viewBox="0 0 150 320" preserveAspectRatio="none">
        <path d="M95 0 34 118h42L42 320l75-145H76z" />
      </svg>
      <svg className="storm-backdrop__bolt storm-backdrop__bolt--right" viewBox="0 0 150 320" preserveAspectRatio="none">
        <path d="M95 0 34 118h42L42 320l75-145H76z" />
      </svg>
    </div>
  );
}
