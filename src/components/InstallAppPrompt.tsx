import { useEffect, useState } from "react";
import { Crown, Share, SquarePlus, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "luxe-install-dismissed";
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;

/** Gentle, dismissible prompt to add LuxePrizeDraw to the home screen. */
export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent); setHidden(false); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (isIOS()) { setShowIos(true); setHidden(false); }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;
  const dismiss = () => { localStorage.setItem(DISMISS_KEY, "1"); setHidden(true); };

  return <div role="dialog" aria-label="Install the LuxePrizeDraw app" className="fixed inset-x-3 bottom-20 z-[60] mx-auto max-w-sm rounded-2xl border border-amber-200/40 bg-[#0d0a05]/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,.7)] backdrop-blur-md">
    <button aria-label="Not now" onClick={dismiss} className="absolute right-2 top-2 rounded-lg p-1.5 text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
    <div className="flex items-center gap-3">
      <img src="/icons/icon-96.png" alt="LuxePrizeDraw app icon" className="h-12 w-12 rounded-xl border border-amber-200/30" />
      <div>
        <p className="flex items-center gap-1.5 text-sm font-black text-amber-100"><Crown className="h-4 w-4 text-amber-300" /> Put LuxePrize on your phone</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/55">Installs like a normal app — home-screen icon, full screen, no browser bars.</p>
      </div>
    </div>
    {deferred && <button onClick={() => { void deferred.prompt(); deferred.userChoice.finally(() => setHidden(true)); }} className="mt-3 w-full rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-2.5 text-xs font-black text-black shadow-lg active:scale-95">Add to home screen</button>}
    {showIos && !deferred && <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-center text-[11px] text-white/70">Tap <Share className="h-3.5 w-3.5 text-amber-200" /> Share, then <SquarePlus className="h-3.5 w-3.5 text-amber-200" /> <b>Add to Home Screen</b></p>}
  </div>;
}
