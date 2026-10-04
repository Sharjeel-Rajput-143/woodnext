"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Tiny localStorage-backed "saved designs" store (the heart button on each product).
const KEY = "woodnext:saved";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function useSavedIds() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const ids = useMemo(() => parse(raw), [raw]);

  const toggle = useCallback((id: string) => {
    const current = parse(read());
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      return; // storage unavailable (private mode): nothing to persist
    }
    listeners.forEach((l) => l());
  }, []);

  return { ids, toggle };
}
