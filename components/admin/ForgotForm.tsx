"use client";

import { useState, type FormEvent } from "react";
import { useBrand } from "../BrandProvider";
import { LogoMark } from "../Icons";
import PasswordInput from "./PasswordInput";
import RecoveryKeyBox from "./RecoveryKeyBox";

/** "Forgot password": username + recovery key + new password. */
export default function ForgotForm({ onBack }: { onBack: () => void }) {
  const brand = useBrand();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [newKey, setNewKey] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    if (newPassword !== form.get("confirmPassword")) return setError("The two new passwords don't match.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), recoveryKey: form.get("recoveryKey"), newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; recoveryKey?: string };
      if (!res.ok || !data.recoveryKey) {
        setError(data.error ?? "Could not reset the password.");
        return;
      }
      setNewKey(data.recoveryKey);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adm-login">
      <form className="adm-login-card" method="post" onSubmit={onSubmit}>
        <div className="adm-login-brand">
          <LogoMark className="logo-mark" />
          <span>{brand}</span>
        </div>
        {newKey ? (
          <>
            <h1>Password changed</h1>
            <p className="adm-muted">
              You can sign in with your new password now. Your old recovery key has been used up, so here is a new one:
            </p>
            <RecoveryKeyBox recoveryKey={newKey} />
            <button type="button" className="btn btn-dark btn-block" onClick={onBack}>
              Go to sign in
            </button>
          </>
        ) : (
          <>
            <h1>Forgot password</h1>
            <p className="adm-muted">Enter your recovery key (you got it from the Account page) and choose a new password.</p>
            <label className="adm-field">
              <span>Username</span>
              <input name="username" autoComplete="username" required autoFocus />
            </label>
            <label className="adm-field">
              <span>Recovery key</span>
              <input name="recoveryKey" autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" required />
            </label>
            <label className="adm-field">
              <span>New password</span>
              <PasswordInput name="newPassword" autoComplete="new-password" minLength={10} required />
            </label>
            <label className="adm-field">
              <span>Confirm new password</span>
              <PasswordInput name="confirmPassword" autoComplete="new-password" minLength={10} required />
            </label>
            <p className="adm-muted">At least 10 characters.</p>
            {error && (
              <p className="adm-alert adm-alert-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-dark btn-block" disabled={busy}>
              {busy ? "Saving…" : "Set new password"}
            </button>
            <button type="button" className="adm-link adm-login-link" onClick={onBack}>
              Back to sign in
            </button>
          </>
        )}
      </form>
    </main>
  );
}
