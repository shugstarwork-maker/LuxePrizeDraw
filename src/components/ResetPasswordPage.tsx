// Landing page for password-reset emails: /reset-password?token=…
import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";

const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/accounts/password-reset/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await r.json().catch(() => ({})) as { error?: string };
      if (r.ok) { setDone(true); return; }
      setError(data.error === "invalid_reset_link" ? "This reset link has expired or already been used. Request a new one from the sign-in panel."
        : data.error === "password_too_short" ? "Password needs at least 8 characters."
        : "Couldn't reach the account service — try again in a moment.");
    } catch { setError("Couldn't reach the account service — try again in a moment."); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-[#090a11] px-4 py-8 text-white sm:py-12"><div className="mx-auto max-w-md">
    <button onClick={() => navigate("/")} className="inline-flex min-h-6 items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200"><ArrowLeft className="h-4 w-4" />Home</button>
    <section className="mt-6 rounded-[2rem] border border-sky-200/25 bg-black/35 p-7">
      <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-sky-200"><KeyRound className="h-4 w-4" />Free-play account</p>
      <h1 className="mt-4 text-3xl font-black">Choose a new password</h1>
      {done ? <>
        <p role="status" className="mt-4 text-sm text-white/70">Your password has been changed and you've been signed out on every device. Sign in again with your new password.</p>
        <button onClick={() => navigate("/poker")} className="mt-5 w-full rounded-xl bg-gradient-to-b from-sky-300 to-sky-500 px-4 py-2.5 text-sm font-black text-black">Go to sign in</button>
      </> : !token ? (
        <p role="alert" className="mt-4 text-sm text-rose-200">This link is missing its reset code. Open the link from your email again, or request a new one from the sign-in panel.</p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-2">
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="New password (8+ characters)" aria-label="New password" className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" autoComplete="new-password" placeholder="Type it again" aria-label="Confirm new password" className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30" />
          <button disabled={busy || password.length < 8 || !confirm} className="w-full rounded-xl bg-gradient-to-b from-sky-300 to-sky-500 px-4 py-2.5 text-sm font-black text-black disabled:opacity-40">{busy ? "One moment…" : "Set new password"}</button>
          {error && <p role="alert" className="text-[11px] text-rose-200">{error}</p>}
        </form>
      )}
    </section>
  </div></main>;
}
