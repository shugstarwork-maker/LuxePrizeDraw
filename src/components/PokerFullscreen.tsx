import { useEffect, useState } from 'react';

export function PokerFullscreen() {
  const [active, setActive] = useState(false);
  const [notice, setNotice] = useState('Turn your phone sideways, then tap Enter full-screen table.');
  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement?.classList.contains('poker-playing-page')));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggle = async (button: HTMLButtonElement) => {
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); return; }
      const table = button.closest<HTMLElement>('.poker-playing-page');
      if (!table?.requestFullscreen) { setNotice('Fullscreen is unavailable in this browser. Turn your phone sideways for the expanded table.'); return; }
      await table.requestFullscreen();
      try {
        const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
        await orientation?.lock?.('landscape');
      } catch { /* Orientation locking is optional; manual rotation remains available. */ }
      setNotice('Turn your phone sideways if needed. Use Exit full screen to return.');
    } catch { setNotice('Fullscreen was not permitted. You can still play—turn your phone sideways for a larger table.'); }
  };
  return <div className="poker-fullscreen-controls">
    <button type="button" onClick={event => void toggle(event.currentTarget)}>{active ? 'Exit full screen' : 'Enter full-screen table'}</button>
    <p role="status">{notice}</p>
  </div>;
}
