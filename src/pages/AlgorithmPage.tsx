import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { AlgorithmModule, GridField, HighlightKind } from "../engine/types";
import { buildTrace, kindsInTrace, MAX_STEPS } from "../engine/trace";
import { decodeInput, encodeInput } from "../engine/input";
import { loadAlgorithm, META_BY_ID } from "../registry";
import { CATEGORY_BY_ID } from "../catalog/categories";
import { RENDERERS } from "../renderers";
import { usePrefs } from "../store/prefs";
import { usePlayer, usePlayerKeys } from "../components/player/usePlayer";
import { PlayerControls } from "../components/player/PlayerControls";
import { CodePanel } from "../components/CodePanel";
import { CountersPanel, Legend, WatchPanel } from "../components/WatchPanel";
import { InfoTabs } from "../components/InfoTabs";
import { InputBar } from "../components/InputEditor";
import { Icon } from "../components/Icons";
import { NotFound } from "./NotFound";

export default function AlgorithmPage() {
  const { id = "" } = useParams();
  const [loaded, setLoaded] = useState<{ id: string; module: AlgorithmModule | null; error?: string } | null>(null);

  useEffect(() => {
    let alive = true;
    const p = loadAlgorithm(id);
    if (!p) {
      setLoaded({ id, module: null });
      return;
    }
    p.then(
      (module) => alive && setLoaded({ id, module }),
      (err: unknown) => alive && setLoaded({ id, module: null, error: String(err) }),
    );
    return () => {
      alive = false;
    };
  }, [id]);

  if (!META_BY_ID.has(id)) return <NotFound />;
  if (!loaded || loaded.id !== id) return <p className="loading">Loading…</p>;
  if (!loaded.module) return <p className="input-error">Could not load this page. {loaded.error}</p>;
  return <AlgorithmView key={id} module={loaded.module} />;
}

const LEGEND_ORDER: HighlightKind[] = [
  "start",
  "end",
  "wall",
  "current",
  "compare",
  "swap",
  "pivot",
  "frontier",
  "visited",
  "active",
  "window",
  "match",
  "mismatch",
  "found",
  "sorted",
  "path",
  "pruned",
  "removed",
];

function AlgorithmView({ module }: { module: AlgorithmModule }) {
  const [params, setParams] = useSearchParams();
  const [input, setInputState] = useState<unknown>(() => decodeInput(module, params.get("input")) ?? module.presets[0].input);
  const [version, setVersion] = useState(0);
  const initialStep = useMemo(() => Number(params.get("step")) || 0, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setInput = (next: unknown) => {
    setInputState(next);
    setVersion((v) => v + 1);
  };

  // Keep the URL in sync with the current input so it can be shared or bookmarked.
  useEffect(() => {
    const isDefault = JSON.stringify(input) === JSON.stringify(module.presets[0].input);
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (isDefault) next.delete("input");
        else next.set("input", encodeInput(input));
        if (version > 0) next.delete("step");
        return next;
      },
      { replace: true },
    );
  }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

  const trace = useMemo(() => buildTrace(module, input as never), [module, input]);
  const legendKinds = useMemo(() => {
    const kinds = new Set<HighlightKind>([...(module.legendExtra ?? []), ...kindsInTrace(trace.steps)]);
    return LEGEND_ORDER.filter((k) => kinds.has(k));
  }, [module, trace]);

  return (
    <>
      <PageHeader module={module} />
      <TraceView
        key={version}
        module={module}
        input={input}
        trace={trace}
        legendKinds={legendKinds}
        initialStep={version === 0 ? initialStep : 0}
        setInput={setInput}
      />
      <InfoTabs info={module.info} problems={module.problems} />
    </>
  );
}

function PageHeader({ module }: { module: AlgorithmModule }) {
  const progress = usePrefs((s) => s.progress[module.id]);
  const setProgress = usePrefs((s) => s.setProgress);
  const cat = CATEGORY_BY_ID[module.category];

  useEffect(() => {
    document.title = `${module.title} · Steplore`;
    return () => {
      document.title = "Steplore — Watch algorithms run, step by step";
    };
  }, [module.title]);

  return (
    <div className="algo-head">
      <div className="algo-head-text">
        <p className="crumbs">
          <Link to={`/${cat.id}`}>{cat.title}</Link> / {module.subcategory}
        </p>
        <h1 className="algo-title">
          {module.title}
          <span className={`diff-badge ${module.difficulty}`}>{module.difficulty}</span>
        </h1>
        <p className="algo-summary">{module.summary}</p>
      </div>
      <div className="progress-buttons" role="group" aria-label="Your progress">
        <button
          type="button"
          className={`btn btn-secondary small${progress === "learned" ? " toggled" : ""}`}
          aria-pressed={progress === "learned"}
          onClick={() => setProgress(module.id, progress === "learned" ? null : "learned")}
        >
          <Icon name="check" /> Learned
        </button>
        <button
          type="button"
          className={`btn btn-secondary small${progress === "review" ? " toggled" : ""}`}
          aria-pressed={progress === "review"}
          onClick={() => setProgress(module.id, progress === "review" ? null : "review")}
        >
          <Icon name="clock" /> Review later
        </button>
      </div>
    </div>
  );
}

function TraceView({
  module,
  input,
  trace,
  legendKinds,
  initialStep,
  setInput,
}: {
  module: AlgorithmModule;
  input: unknown;
  trace: ReturnType<typeof buildTrace>;
  legendKinds: HighlightKind[];
  initialStep: number;
  setInput: (v: unknown) => void;
}) {
  const steps = trace.steps;
  const player = usePlayer(steps.length);
  usePlayerKeys(player);
  const [tool, setTool] = useState("#");

  useEffect(() => {
    if (initialStep > 0) player.setIndex(initialStep);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const step = steps[Math.min(player.index, steps.length - 1)];
  const prev = player.index > 0 ? steps[player.index - 1] : undefined;
  const highlights = useMemo(() => new Map(step?.highlights.map((h) => [h.id, h.kind])), [step]);
  const Renderer = RENDERERS[module.renderer];

  const gridField = module.inputSchema.fields.find((f): f is GridField => f.kind === "grid");
  const rec = input as Record<string, unknown>;
  const edit =
    gridField && module.renderer === "grid"
      ? {
          value: rec[gridField.key],
          tool,
          onChange: (g: string[]) => setInput({ ...rec, [gridField.key]: g }),
        }
      : undefined;

  const share = async () => {
    const url = new URL(window.location.href);
    const hash = new URL(url.hash.slice(1), "https://x");
    hash.searchParams.set("input", encodeInput(input));
    hash.searchParams.set("step", String(player.index));
    url.hash = hash.pathname + hash.search;
    try {
      await navigator.clipboard.writeText(url.toString());
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="workspace">
      <div className="stage-col">
        <section className="panel stage" aria-label="Simulation">
          <InputBar module={module} input={input} onApply={setInput} onShare={share} />
          {trace.error && <p className="input-error" style={{ margin: 12 }}>The algorithm stopped with an error: {trace.error}</p>}
          <div className="canvas">
            {step && Renderer ? (
              <Renderer step={step} highlights={highlights} options={module.rendererOptions} edit={edit} />
            ) : (
              <p className="empty-note">{Renderer ? "No steps." : `Renderer "${module.renderer}" is not built yet.`}</p>
            )}
          </div>
          {edit && gridField?.tools && (
            <div className="canvas-tools" data-no-player-keys>
              <span>Draw:</span>
              <div className="segmented" role="group" aria-label="Drawing tool">
                {gridField.tools.map((t) => (
                  <button key={t.char} type="button" aria-pressed={tool === t.char} onClick={() => setTool(t.char)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-ghost small"
                onClick={() => setInput({ ...rec, [gridField.key]: (rec[gridField.key] as string[]).map((row) => row.replace(/#/g, ".")) })}
              >
                <Icon name="trash" /> Clear walls
              </button>
              <span>Drag the start or end to move them. Editing restarts the run.</span>
            </div>
          )}
          {trace.truncated && (
            <p className="trace-warning" role="status">
              This input produced more than {MAX_STEPS.toLocaleString()} steps, so the replay stops early. Try a smaller input.
            </p>
          )}
          <div className={`narration${player.atEnd ? " done" : ""}`} aria-live={player.playing ? "off" : "polite"}>
            <span className="narration-step">
              step {player.index + 1}/{steps.length}
            </span>
            <p className="narration-text">{step?.message}</p>
          </div>
          <PlayerControls player={player} />
        </section>
      </div>
      <div className="side-col">
        <CodePanel code={module.code} marker={step?.line ?? ""} />
        {step && <WatchPanel step={step} prev={prev} />}
        <CountersPanel counters={step?.counters} />
        <Legend kinds={legendKinds} labels={module.legendLabels} />
      </div>
    </div>
  );
}
