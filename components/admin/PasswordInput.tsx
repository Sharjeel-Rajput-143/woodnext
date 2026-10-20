"use client";

import { useState, type InputHTMLAttributes } from "react";
import AdmIcon from "./AdmIcons";

/** Password box with a show / hide button. */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <span className="adm-pass">
      <input {...props} type={show ? "text" : "password"} />
      <button
        type="button"
        className="adm-pass-toggle"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        onClick={() => setShow((v) => !v)}
      >
        <AdmIcon name={show ? "eyeOff" : "eye"} />
      </button>
    </span>
  );
}
