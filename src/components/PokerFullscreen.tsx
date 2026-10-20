import { useEffect, useState } from 'react';

export function PokerFullscreen() {
  const [active, setActive] = useState(false);
  const [notice, setNotice] = useState('Turn your phone sideways, then tap Enter full-screen table.');
  useEffect(() => {
    const sync = () => {
      const native = Boolean(document.fullscreenElement?.classList.contains('poker-playing-page'));
      const manual = Boolean(document.querySelector('.poker-playing-page')?.classList.contains('poker-fullscreen-sim'));
      setActive(native || manual);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggle = async (button: HTMLButtonElement) => {
    const table = button.closest<HTMLElement>('.poker-playing-page');
    if (!table) return;
    // Manual mode active? Exit it.
    if (table.classList.contains('poker-fullscreen-sim')) {
      table.classList.remove('poker-fullscreen-sim');
      setActive(false);
      setNotice('Turn your phone sideways, then tap Enter full-screen table.');
      return;
    }
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); return; }
      if (!table.requestFullscreen) throw new Error('unsupported');
      await table.requestFullscreen();
      try {
        const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
        await orientation?.lock?.('landscape');
      } catch { /* Orientation locking is optional; manual rotation remains available. */ }
      setNotice('Turn your phone sideways if needed. Use Exit full screen to return.');
    } catch {
      // Native fullscreen blocked (embedded preview, iOS, permissions) — fall back to an in-app full-view table.
      table.classList.add('poker-fullscreen-sim');
      setActive(true);
      setNotice('Full-view table on. Tap Exit full screen to return.');
    }
  };
  return <div className="poker-fullscreen-controls">
    <button type="button" onClick={event => void toggle(event.currentTarget)}>{active ? 'Exit full screen' : 'Enter full-screen table'}</button>
    <p role="status">{notice}</p>
  </div>;
}
