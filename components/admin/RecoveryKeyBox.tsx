"use client";

import { useState } from "react";

/** Shows a recovery key once, with a copy button. The key is never stored in readable form, so it can't be shown again. */
export default function RecoveryKeyBox({ recoveryKey }: { recoveryKey: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
    } catch {
      // Clipboard blocked: the key is selectable text, so it can still be copied by hand.
    }
  }

  return (
    <div className="adm-key-box">
      <p className="adm-key" aria-label="Recovery key">
        {recoveryKey}
      </p>
      <button type="button" className="adm-btn" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <p className="adm-muted adm-key-note">
        Write it down or save it somewhere safe, such as a password manager. It is shown only this once. Anyone with this key can
        reset your password.
      </p>
    </div>
  );
}
