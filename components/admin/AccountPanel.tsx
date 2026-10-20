"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { StorageMode } from "@/lib/catalog";
import PasswordInput from "./PasswordInput";
import RecoveryKeyBox from "./RecoveryKeyBox";

type Info = { username: string; hasRecoveryKey: boolean; canChange: boolean };
type Notify = (toast: { kind: "ok" | "error"; text: string } | null) => void;

/** Owner account: change the password and manage the recovery key used by "Forgot password" on the login page. */
export default function AccountPanel({ mode, onSignedOut, notify }: { mode: StorageMode; onSignedOut: () => void; notify: Notify }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState<"password" | "key" | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [keyError, setKeyError] = useState("");
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/account")
      .then(async (res) => {
        if (res.status === 401) return onSignedOut();
        const data = (await res.json()) as Info;
        if (alive) setInfo(data);
      })
      .catch(() => alive && setLoadError("Could not load your account. Please reload the page."));
    return () => {
      alive = false;
    };
  }, [onSignedOut]);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      onSignedOut();
      return { ok: false as const, error: "" };
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string; recoveryKey?: string };
    return res.ok ? { ok: true as const, data } : { ok: false as const, error: data.error ?? "Something went wrong. Please try again." };
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = String(data.get("newPassword") ?? "");
    if (next !== data.get("confirmPassword")) return setPasswordError("The two new passwords don't match.");
    setBusy("password");
    setPasswordError("");
    try {
      const result = await post("/api/admin/password", { currentPassword: data.get("currentPassword"), newPassword: next });
      if (!result.ok) return setPasswordError(result.error);
      form.reset();
      notify({ kind: "ok", text: "Password changed. Other devices have been signed out." });
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy("key");
    setKeyError("");
    try {
      const result = await post("/api/admin/recovery-key", { password: new FormData(form).get("password") });
      if (!result.ok) return setKeyError(result.error);
      form.reset();
      setNewKey(result.data.recoveryKey ?? "");
      setInfo((current) => (current ? { ...current, hasRecoveryKey: true } : current));
    } catch {
      setKeyError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (loadError) return <p className="adm-alert adm-alert-error">{loadError}</p>;
  if (!info) return <p className="adm-muted">Loading…</p>;
  const locked = !info.canChange;

  return (
    <div className="adm-account">
      {locked && (
        <p className="adm-alert adm-alert-warn">
          The password can&rsquo;t be changed on this host yet{mode === "readonly" ? ": add GITHUB_TOKEN in the hosting settings to turn it on" : ""}.
        </p>
      )}

      <section className="adm-card">
        <h2 className="adm-card-title">Change password</h2>
        <p className="adm-muted">
          You are signed in as <strong>{info.username}</strong>. After you change the password, other devices are signed out.
        </p>
        <form className="adm-form" onSubmit={changePassword}>
          <label className="adm-field">
            <span>Current password</span>
            <PasswordInput name="currentPassword" autoComplete="current-password" required disabled={locked} />
          </label>
          <label className="adm-field">
            <span>New password</span>
            <PasswordInput name="newPassword" autoComplete="new-password" minLength={10} required disabled={locked} />
          </label>
          <label className="adm-field">
            <span>Confirm new password</span>
            <PasswordInput name="confirmPassword" autoComplete="new-password" minLength={10} required disabled={locked} />
          </label>
          <p className="adm-muted">At least 10 characters. A few random words are easy to remember and hard to guess.</p>
          {passwordError && (
            <p className="adm-alert adm-alert-error" role="alert">
              {passwordError}
            </p>
          )}
          <div className="adm-form-actions">
            <button type="submit" className="adm-btn adm-btn-primary" disabled={locked || busy === "password"}>
              {busy === "password" ? "Saving…" : "Change password"}
            </button>
          </div>
        </form>
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">Recovery key</h2>
        <p className="adm-muted">
          If you ever forget your password, choose <strong>Forgot password?</strong> on the login page and enter this key to set a new
          one. {info.hasRecoveryKey ? "A recovery key is set. Creating a new one makes the old one stop working." : "You have not created a recovery key yet."}
        </p>
        {!info.hasRecoveryKey && !newKey && (
          <p className="adm-alert adm-alert-warn">Without a recovery key, a forgotten password can only be reset by whoever manages your hosting.</p>
        )}
        {newKey ? (
          <RecoveryKeyBox recoveryKey={newKey} />
        ) : (
          <form className="adm-form" onSubmit={createKey}>
            <label className="adm-field">
              <span>Your password (to confirm it&rsquo;s you)</span>
              <PasswordInput name="password" autoComplete="current-password" required disabled={locked} />
            </label>
            {keyError && (
              <p className="adm-alert adm-alert-error" role="alert">
                {keyError}
              </p>
            )}
            <div className="adm-form-actions">
              <button type="submit" className="adm-btn adm-btn-primary" disabled={locked || busy === "key"}>
                {busy === "key" ? "Creating…" : info.hasRecoveryKey ? "Create a new recovery key" : "Create recovery key"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
