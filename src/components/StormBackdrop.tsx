const notes = Array.from({ length: 18 }, (_, index) => index);

export function StormBackdrop() {
  return (
    <div className="storm-backdrop" aria-hidden="true">
      <div className="storm-backdrop__clouds" />
      <div className="storm-backdrop__money-rain">
        {notes.map((note) => <span className={`storm-backdrop__note storm-backdrop__note--${note + 1}`} key={note}>$</span>)}
      </div>
      <div className="storm-backdrop__flash storm-backdrop__flash--one" />
      <div className="storm-backdrop__flash storm-backdrop__flash--two" />
      <svg className="storm-backdrop__bolt storm-backdrop__bolt--left" viewBox="0 0 220 430" preserveAspectRatio="none">
        <path className="storm-backdrop__bolt-core" d="M101 0 75 70l27 12-43 86 34 9-57 137 68-83-25-12 60-105-32-14Z" />
        <path className="storm-backdrop__bolt-branch" d="m62 165-51 54 44-13M78 216 137 255l-39-7" />
      </svg>
      <svg className="storm-backdrop__bolt storm-backdrop__bolt--right" viewBox="0 0 220 430" preserveAspectRatio="none">
        <path className="storm-backdrop__bolt-core" d="M101 0 75 70l27 12-43 86 34 9-57 137 68-83-25-12 60-105-32-14Z" />
        <path className="storm-backdrop__bolt-branch" d="m62 165-51 54 44-13M78 216 137 255l-39-7" />
      </svg>
    </div>
  );
}
