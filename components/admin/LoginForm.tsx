"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";
import { LogoMark } from "../Icons";
import ForgotForm from "./ForgotForm";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not log in.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (forgot) return <ForgotForm onBack={() => setForgot(false)} />;

  return (
    <main className="adm-login">
      <form className="adm-login-card" method="post" onSubmit={onSubmit}>
        <div className="adm-login-brand">
          <LogoMark className="logo-mark" />
          <span>{SITE.brand}</span>
        </div>
        <h1>Owner login</h1>
        <p className="adm-muted">Only the website owner can sign in here.</p>
        <label className="adm-field">
          <span>Username</span>
          <input name="username" autoComplete="username" required autoFocus />
        </label>
        <label className="adm-field">
          <span>Password</span>
          <PasswordInput name="password" autoComplete="current-password" required />
        </label>
        {error && (
          <p className="adm-alert adm-alert-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-dark btn-block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <button type="button" className="adm-link adm-login-link" onClick={() => setForgot(true)}>
          Forgot password?
        </button>
      </form>
    </main>
  );
}
