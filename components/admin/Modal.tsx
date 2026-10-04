"use client";

import { useEffect, type ReactNode } from "react";
import AdmIcon from "./AdmIcons";

/** Centered pop-up (add/edit forms, delete confirmation). Closes with Esc or a click outside. */
export default function Modal({
  title,
  onClose,
  children,
  size = "lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "lg";
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="adm-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`adm-modal adm-modal-${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="adm-modal-head">
          <h2>{title}</h2>
          <button type="button" className="adm-iconbtn" aria-label="Close" onClick={onClose}>
            <AdmIcon name="close" />
          </button>
        </header>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  );
}
