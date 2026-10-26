// Account client — signup/login/logout, token persisted on this device.
// Free-play identity only: protects league integrity and syncs chips across devices.
import { useCallback, useEffect, useState } from "react";

export type AccountProfile = { id: string; email: string; name: string; chips: number; createdAt: number; lastSeenAt: number };

const TOKEN_KEY = "luxe-account-token";

export function accountToken(): string { return localStorage.getItem(TOKEN_KEY) ?? ""; }

export function useAccount() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = accountToken();
    if (!token) { setLoading(false); return; }
    fetch("/api/accounts/me", { headers: { authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (r.ok) setProfile(((await r.json()) as { profile: AccountProfile }).profile);
        else localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => { /* offline — stay signed out */ })
      .finally(() => setLoading(false));
  }, []);

  const authFetch = useCallback(async (path: string, body: unknown): Promise<boolean> => {
    setError("");
    try {
      const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json() as { profile?: AccountProfile; token?: string; error?: string };
      if (!r.ok || !data.profile || !data.token) {
        setError(data.error === "email_taken" ? "That email already has an account — sign in instead."
          : data.error === "bad_credentials" ? "Email or password not recognised."
          : data.error === "too_many_attempts" ? "Too many sign-in attempts — please wait 15 minutes and try again."
          : data.error === "password_too_short" ? "Password needs at least 8 characters."
          : data.error === "invalid_email" ? "That email doesn't look right."
          : "Account service is offline right now — you can keep playing free-play without signing in.");
        return false;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setProfile(data.profile);
      return true;
    } catch { setError("Account service is offline right now — you can keep playing free-play without signing in."); return false; }
  }, []);

  const signup = (email: string, password: string, name: string) => authFetch("/api/accounts/signup", { email, password, name });
  const login = (email: string, password: string) => authFetch("/api/accounts/login", { email, password });
  const logout = useCallback(() => {
    fetch("/api/accounts/logout", { method: "POST", headers: { authorization: `Bearer ${accountToken()}` } }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
  }, []);

  // Revokes every session for this account (all devices), then signs out here.
  const logoutEverywhere = useCallback(async (): Promise<boolean> => {
    setError("");
    try {
      const r = await fetch("/api/accounts/logout-everywhere", { method: "POST", headers: { authorization: `Bearer ${accountToken()}` } });
      if (!r.ok && r.status !== 401) { setError("Couldn't reach the account service — try again in a moment."); return false; }
    } catch { setError("Couldn't reach the account service — try again in a moment."); return false; }
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    return true;
  }, []);

  // Downloads everything the server holds about this account as a JSON file.
  const exportData = useCallback(async (): Promise<boolean> => {
    setError("");
    try {
      const r = await fetch("/api/accounts/export", { headers: { authorization: `Bearer ${accountToken()}` } });
      if (!r.ok) throw new Error(String(r.status));
      const url = URL.createObjectURL(await r.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: "luxeprizedraw-account.json" });
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch { setError("Couldn't download your data right now — try again in a moment."); return false; }
  }, []);

  const deleteAccount = useCallback(async (password: string): Promise<boolean> => {
    setError("");
    try {
      const r = await fetch("/api/accounts/delete", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${accountToken()}` }, body: JSON.stringify({ password }) });
      const data = await r.json().catch(() => ({})) as { error?: string };
      if (!r.ok) {
        setError(data.error === "bad_credentials" ? "That password isn't right."
          : data.error === "too_many_attempts" ? "Too many attempts — please wait 15 minutes and try again."
          : data.error === "not_signed_in" ? "Your session has ended — sign in again first."
          : "Couldn't reach the account service — try again in a moment.");
        return false;
      }
    } catch { setError("Couldn't reach the account service — try again in a moment."); return false; }
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    return true;
  }, []);

  /** Returns a message to show; the same message whether or not the email has an account. */
  const requestPasswordReset = useCallback(async (email: string): Promise<string> => {
    setError("");
    try {
      const r = await fetch("/api/accounts/password-reset/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await r.json().catch(() => ({})) as { error?: string };
      if (r.ok) return "If that email has an account, a reset link is on its way. It works for 30 minutes.";
      setError(data.error === "email_unavailable" ? "Password reset by email isn't switched on yet — email director@luxeprizedraw.com for help."
        : data.error === "invalid_email" ? "That email doesn't look right."
        : data.error === "too_many_attempts" ? "Too many reset requests — please try again later."
        : "Couldn't reach the account service — try again in a moment.");
    } catch { setError("Couldn't reach the account service — try again in a moment."); }
    return "";
  }, []);

  const syncChips = useCallback((chips: number) => {
    if (!accountToken()) return;
    fetch("/api/accounts/chips", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${accountToken()}` }, body: JSON.stringify({ chips }) }).catch(() => {});
  }, []);

  return { profile, loading, error, signup, login, logout, logoutEverywhere, exportData, deleteAccount, requestPasswordReset, syncChips };
}
