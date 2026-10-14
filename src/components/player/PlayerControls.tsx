import { Icon } from "../Icons";
import type { Player } from "./usePlayer";
import { SPEEDS, usePrefs } from "../../store/prefs";

function fmtSpeed(s: number) {
  return s < 1 ? `${s}×` : `${s}×`;
}

export function PlayerControls({ player }: { player: Player }) {
  const speedIndex = usePrefs((s) => s.speedIndex);
  const { index, total, playing } = player;

  return (
    <div className="player" role="group" aria-label="Playback controls">
      <div className="player-buttons">
        <button type="button" className="icon-btn square" onClick={player.first} disabled={index === 0} aria-label="Jump to start (Home)" title="Jump to start (Home)">
          <Icon name="first" />
        </button>
        <button type="button" className="icon-btn square" onClick={player.back} disabled={index === 0} aria-label="Step back (←)" title="Step back (←)">
          <Icon name="stepBack" />
        </button>
        <button
          type="button"
          className="icon-btn play-btn"
          onClick={player.toggle}
          aria-label={playing ? "Pause (Space)" : "Play (Space)"}
          title={playing ? "Pause (Space)" : "Play (Space)"}
          disabled={total <= 1}
        >
          <Icon name={playing ? "pause" : "play"} />
        </button>
        <button type="button" className="icon-btn square" onClick={player.forward} disabled={player.atEnd} aria-label="Step forward (→)" title="Step forward (→)">
          <Icon name="stepForward" />
        </button>
        <button type="button" className="icon-btn square" onClick={player.last} disabled={player.atEnd} aria-label="Jump to end (End)" title="Jump to end (End)">
          <Icon name="last" />
        </button>
      </div>

      <div className="scrubber">
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(e) => player.setIndex(Number(e.target.value))}
          aria-label="Timeline"
          aria-valuetext={`Step ${index + 1} of ${total}`}
        />
        <span className="step-count">
          {index + 1}/{total}
        </span>
      </div>

      <div className="speed" role="group" aria-label="Speed">
        <button type="button" className="icon-btn small" onClick={player.slower} disabled={speedIndex === 0} aria-label="Slower (-)" title="Slower (-)">
          <Icon name="minus" />
        </button>
        <output aria-live="polite" aria-label="Playback speed">
          {fmtSpeed(SPEEDS[speedIndex])}
        </output>
        <button
          type="button"
          className="icon-btn small"
          onClick={player.faster}
          disabled={speedIndex === SPEEDS.length - 1}
          aria-label="Faster (+)"
          title="Faster (+)"
        >
          <Icon name="plus" />
        </button>
      </div>
      <p className="kbd-hint">
        <kbd>Space</kbd> play/pause · <kbd>←</kbd>/<kbd>→</kbd> step · <kbd>Home</kbd>/<kbd>End</kbd> · <kbd>+</kbd>/<kbd>-</kbd> speed
      </p>
    </div>
  );
}
