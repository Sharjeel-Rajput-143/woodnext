"use client";

import { useEffect, useState } from "react";
import AdmIcon, { type AdmIconName } from "./AdmIcons";
import type { View } from "./DashboardPanel";

type Item = { id: View; label: string; icon: AdmIconName };

/**
 * Phone navigation for the owner panel: a fixed bottom bar with the four main sections and a "More" sheet
 * (settings, view website, log out). Hidden on larger screens, where the sidebar is used.
 */
export default function AdminBottomNav({
  main,
  more,
  view,
  onOpen,
  onLogout,
}: {
  main: Item[];
  more: Item[];
  view: View;
  onOpen: (view: View) => void;
  onLogout: () => void;
}) {
  const [sheet, setSheet] = useState(false);
  const inMore = more.some((item) => item.id === view);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <>
      {sheet && (
        <>
          <button type="button" className="bsheet-scrim" aria-label="Close menu" onClick={() => setSheet(false)} />
          <div className="bsheet" role="dialog" aria-modal="true" aria-label="More">
            <p className="bsheet-title">More</p>
            <ul className="bsheet-list">
              {more.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`bsheet-item${view === item.id ? " is-active" : ""}`}
                    onClick={() => {
                      setSheet(false);
                      onOpen(item.id);
                    }}
                  >
                    <AdmIcon name={item.icon} className="bsheet-icon" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <a className="bsheet-item" href="/" target="_blank" rel="noopener noreferrer" onClick={() => setSheet(false)}>
                  <AdmIcon name="external" className="bsheet-icon" />
                  <span>View website</span>
                </a>
              </li>
              <li>
                <button type="button" className="bsheet-item" onClick={onLogout}>
                  <AdmIcon name="logout" className="bsheet-icon" />
                  <span>Log out</span>
                </button>
              </li>
            </ul>
          </div>
        </>
      )}

      <nav className="bnav" aria-label="Sections">
        {main.map((item) => {
          const active = !sheet && view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`bnav-item${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                setSheet(false);
                onOpen(item.id);
              }}
            >
              <AdmIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button type="button" className={`bnav-item${sheet || inMore ? " is-active" : ""}`} aria-expanded={sheet} onClick={() => setSheet((v) => !v)}>
          <AdmIcon name="more" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
