const birds = Array.from({ length: 7 }, (_, index) => index + 1);

export function StormBackdrop() {
  return (
    <div className="sunny-backdrop" aria-hidden="true">
      <div className="sunny-backdrop__sky" />
      <div className="sunny-backdrop__sun" />
      <div className="sunny-backdrop__haze" />
      <div className="sunny-backdrop__birds">
        {birds.map((bird) => <span className={`sunny-backdrop__bird sunny-backdrop__bird--${bird}`} key={bird}>⌄</span>)}
      </div>
    </div>
  );
}
