// Local autosave for the ops console.
// Persists the full AppState to localStorage so a refresh / crash recovers state.

import type { AppState } from "./types";

const KEY = "vrz-ops:state:v1";
const META_KEY = "vrz-ops:meta:v1";

export interface SaveMeta {
  savedAt: number; // epoch ms
  version: number;
}

export function loadSavedState(): { state: AppState | null; meta: SaveMeta | null } {
  try {
    const raw = localStorage.getItem(KEY);
    const rawMeta = localStorage.getItem(META_KEY);
    const state = raw ? (JSON.parse(raw) as AppState) : null;
    const meta = rawMeta ? (JSON.parse(rawMeta) as SaveMeta) : null;
    return { state, meta };
  } catch {
    return { state: null, meta: null };
  }
}

export function saveState(state: AppState): SaveMeta {
  const meta: SaveMeta = { savedAt: Date.now(), version: 1 };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // Storage full / blocked — no-op
  }
  return meta;
}

export function clearSavedState() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(META_KEY);
  } catch {
    // no-op
  }
}

export function formatSavedAt(ms: number | undefined): string {
  if (!ms) return "never";
  const d = new Date(ms);
  const diff = Math.max(0, Date.now() - ms);
  if (diff < 5000) return "just now";
  if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  return d.toLocaleTimeString("en-US", { hour12: false });
}
