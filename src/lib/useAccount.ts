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

  const syncChips = useCallback((chips: number) => {
    if (!accountToken()) return;
    fetch("/api/accounts/chips", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${accountToken()}` }, body: JSON.stringify({ chips }) }).catch(() => {});
  }, []);

  return { profile, loading, error, signup, login, logout, syncChips };
}
