import { useCallback, useEffect, useRef, useState } from "react";
import { SPEEDS, usePrefs } from "../../store/prefs";

/** Milliseconds per step at 1× speed. */
const BASE_DELAY = 600;
/** Never schedule faster than roughly one frame; skip steps instead. */
const MIN_DELAY = 16;

export interface Player {
  index: number;
  total: number;
  playing: boolean;
  atEnd: boolean;
  speed: number;
  setIndex: (i: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  forward: () => void;
  back: () => void;
  first: () => void;
  last: () => void;
  faster: () => void;
  slower: () => void;
}

/**
 * Replays a precomputed trace. `pauseAt` lets callers (quiz mode) stop before particular steps.
 */
export function usePlayer(total: number, pauseAt?: (index: number) => boolean): Player {
  const [index, setIndexRaw] = useState(0);
  const [playing, setPlaying] = useState(false);
  const speedIndex = usePrefs((s) => s.speedIndex);
  const setSpeedIndex = usePrefs((s) => s.setSpeedIndex);
  const speed = SPEEDS[speedIndex] ?? 1;
  const pauseAtRef = useRef(pauseAt);
  pauseAtRef.current = pauseAt;

  const clamp = useCallback((i: number) => Math.max(0, Math.min(total - 1, i)), [total]);
  const setIndex = useCallback((i: number) => setIndexRaw(clamp(i)), [clamp]);

  useEffect(() => {
    if (!playing) return;
    if (index >= total - 1) {
      setPlaying(false);
      return;
    }
    const ideal = BASE_DELAY / speed;
    const delay = Math.max(MIN_DELAY, ideal);
    const stride = Math.max(1, Math.round(MIN_DELAY / ideal));
    const timer = window.setTimeout(() => {
      let next = Math.min(total - 1, index + stride);
      // Never skip past a step the caller wants to stop at.
      for (let i = index + 1; i <= next; i++) {
        if (pauseAtRef.current?.(i)) {
          next = i;
          setPlaying(false);
          break;
        }
      }
      setIndexRaw(next);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [playing, index, total, speed]);

  const atEnd = index >= total - 1;

  return {
    index,
    total,
    playing,
    atEnd,
    speed,
    setIndex: (i) => {
      setPlaying(false);
      setIndex(i);
    },
    play: () => {
      if (atEnd) setIndexRaw(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    toggle: () => {
      if (playing) setPlaying(false);
      else {
        if (atEnd) setIndexRaw(0);
        setPlaying(true);
      }
    },
    forward: () => {
      setPlaying(false);
      setIndex(index + 1);
    },
    back: () => {
      setPlaying(false);
      setIndex(index - 1);
    },
    first: () => {
      setPlaying(false);
      setIndex(0);
    },
    last: () => {
      setPlaying(false);
      setIndex(total - 1);
    },
    faster: () => setSpeedIndex(speedIndex + 1),
    slower: () => setSpeedIndex(speedIndex - 1),
  };
}

/** Space / arrows / Home / End / +/- shortcuts, ignored while typing in a form field. */
export function usePlayerKeys(player: Player, enabled = true) {
  const ref = useRef(player);
  ref.current = player;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
        if (!(el instanceof HTMLInputElement && el.type === "range")) return;
      }
      if (el?.closest?.("[data-no-player-keys]")) return;
      const p = ref.current;
      switch (e.key) {
        case " ":
          if (el && el.tagName === "BUTTON") return; // let buttons handle Space themselves
          e.preventDefault();
          p.toggle();
          break;
        case "ArrowRight":
          e.preventDefault();
          p.forward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          p.back();
          break;
        case "Home":
          e.preventDefault();
          p.first();
          break;
        case "End":
          e.preventDefault();
          p.last();
          break;
        case "+":
        case "=":
          p.faster();
          break;
        case "-":
        case "_":
          p.slower();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
