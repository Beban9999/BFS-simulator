import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language } from "../engine/types";

export type Theme = "dark" | "light";
export type ProgressMark = "learned" | "review";

export interface PopupGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Prefs {
  theme: Theme;
  language: Language;
  /** Index into SPEEDS. */
  speedIndex: number;
  progress: Record<string, ProgressMark>;
  codeDetached: boolean;
  popup: PopupGeometry;
  quiz: boolean;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setSpeedIndex: (i: number) => void;
  setProgress: (id: string, mark: ProgressMark | null) => void;
  setCodeDetached: (v: boolean) => void;
  setPopup: (g: PopupGeometry) => void;
  setQuiz: (v: boolean) => void;
}

export const SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16, 32, 64];
export const DEFAULT_SPEED_INDEX = 3;

/** localStorage can throw (private mode, blocked storage); fall back to memory. */
const safeStorage = createJSONStorage(() => {
  try {
    const probe = "__steplore_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
});

function initialTheme(): Theme {
  try {
    // Keep the choice made in the original BFS/DFS simulator.
    if (localStorage.getItem("theme") === "light") return "light";
  } catch {
    /* ignore */
  }
  return "dark";
}

export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      theme: initialTheme(),
      language: "python",
      speedIndex: DEFAULT_SPEED_INDEX,
      progress: {},
      codeDetached: false,
      popup: { x: -1, y: -1, w: 460, h: 420 },
      quiz: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSpeedIndex: (speedIndex) => set({ speedIndex: Math.max(0, Math.min(SPEEDS.length - 1, speedIndex)) }),
      setProgress: (id, mark) =>
        set((s) => {
          const progress = { ...s.progress };
          if (mark) progress[id] = mark;
          else delete progress[id];
          return { progress };
        }),
      setCodeDetached: (codeDetached) => set({ codeDetached }),
      setPopup: (popup) => set({ popup }),
      setQuiz: (quiz) => set({ quiz }),
    }),
    { name: "steplore-prefs", storage: safeStorage, version: 1 },
  ),
);
