import { useEffect, useState } from "react";
import type { AlgorithmModule, GridField, InputField } from "../engine/types";
import { formatField, parseField, validateInput } from "../engine/input";
import { Icon } from "./Icons";

interface Props {
  module: AlgorithmModule;
  input: unknown;
  onApply: (input: unknown) => void;
  onShare: () => Promise<boolean>;
}

const SIZE_DEFAULT = 8;

export function InputBar({ module, input, onApply, onShare }: Props) {
  const [editing, setEditing] = useState(false);
  const [size, setSize] = useState(SIZE_DEFAULT);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const currentJson = JSON.stringify(input);
  const presetIndex = module.presets.findIndex((p) => JSON.stringify(p.input) === currentJson);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <>
      <div className="input-bar">
        <label className="visually-hidden" htmlFor="preset">
          Example input
        </label>
        <select
          id="preset"
          value={presetIndex}
          onChange={(e) => {
            const i = Number(e.target.value);
            if (i >= 0) onApply(module.presets[i].input);
          }}
        >
          {presetIndex < 0 && <option value={-1}>Custom input</option>}
          {module.presets.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-secondary small"
          onClick={() => onApply(module.randomInput(size))}
          title="Generate a random input of the chosen size"
        >
          <Icon name="dice" /> Random
        </button>
        <label className="speed" title="Size of random inputs">
          n
          <input
            type="number"
            min={1}
            max={30}
            value={size}
            onChange={(e) => setSize(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
            style={{ width: 58 }}
            aria-label="Random input size"
          />
        </label>
        <span className="grow" />
        <button
          type="button"
          className={`btn btn-ghost small${editing ? " toggled" : ""}`}
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
        >
          <Icon name="edit" /> Edit input
        </button>
        <button
          type="button"
          className="btn btn-ghost small"
          onClick={async () => setCopied((await onShare()) ? "ok" : "fail")}
          title="Copy a link to this input and step"
        >
          <Icon name="link" /> {copied === "ok" ? "Link copied" : copied === "fail" ? "Copy failed" : "Share"}
        </button>
      </div>
      {editing && (
        <InputForm
          key={currentJson}
          module={module}
          input={input}
          onApply={(v) => {
            onApply(v);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function InputForm({
  module,
  input,
  onApply,
  onClose,
}: {
  module: AlgorithmModule;
  input: unknown;
  onApply: (v: unknown) => void;
  onClose: () => void;
}) {
  const fields = module.inputSchema.fields;
  const rec = input as Record<string, unknown>;
  const [mode, setMode] = useState<"form" | "json">("form");
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, formatField(f, rec[f.key])])),
  );
  const [json, setJson] = useState(() => JSON.stringify(input, null, 1));
  const [error, setError] = useState<{ msg: string; key?: string } | null>(null);

  const apply = () => {
    let value: Record<string, unknown>;
    if (mode === "json") {
      try {
        value = JSON.parse(json);
      } catch {
        setError({ msg: "That is not valid JSON." });
        return;
      }
    } else {
      value = {};
      for (const f of fields) {
        const r = parseField(f, drafts[f.key] ?? "");
        if (r.error !== undefined) {
          setError({ msg: r.error, key: f.key });
          return;
        }
        value[f.key] = r.value;
      }
    }
    const err = validateInput(module, value);
    if (err) {
      setError({ msg: err });
      return;
    }
    setError(null);
    onApply(value);
  };

  return (
    <form
      className="input-editor"
      data-no-player-keys
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="segmented" role="tablist" aria-label="Input format">
          <button type="button" role="tab" aria-selected={mode === "form"} onClick={() => setMode("form")}>
            Fields
          </button>
          <button type="button" role="tab" aria-selected={mode === "json"} onClick={() => setMode("json")}>
            JSON
          </button>
        </div>
        <button type="button" className="icon-btn small" onClick={onClose} aria-label="Close input editor">
          <Icon name="close" />
        </button>
      </div>
      {mode === "form" ? (
        fields.map((f) => (
          <FieldEditor
            key={f.key}
            field={f}
            value={drafts[f.key] ?? ""}
            invalid={error?.key === f.key}
            onChange={(v) => setDrafts((d) => ({ ...d, [f.key]: v }))}
          />
        ))
      ) : (
        <div className="input-field">
          <label htmlFor="json-input">Input as JSON</label>
          <textarea id="json-input" rows={8} value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
        </div>
      )}
      {error && (
        <p className="input-error" role="alert">
          {error.msg}
        </p>
      )}
      <div className="input-actions">
        <button type="submit" className="btn btn-primary small">
          Apply
        </button>
      </div>
    </form>
  );
}

function FieldEditor({
  field,
  value,
  invalid,
  onChange,
}: {
  field: InputField;
  value: string;
  invalid: boolean;
  onChange: (v: string) => void;
}) {
  const id = `field-${field.key}`;
  const help = fieldHelp(field);
  let control: React.ReactNode;
  if (field.kind === "select") {
    control = (
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (field.kind === "grid" || field.kind === "matrix" || field.kind === "json") {
    const rows = field.kind === "grid" || field.kind === "matrix" ? Math.min(14, Math.max(3, value.split("\n").length)) : 6;
    control = (
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        spellCheck={false}
      />
    );
  } else {
    control = (
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        spellCheck={false}
        autoComplete="off"
      />
    );
  }
  return (
    <div className="input-field">
      <label htmlFor={id}>{field.label}</label>
      {control}
      {help && <p className="help">{help}</p>}
    </div>
  );
}

function fieldHelp(f: InputField): string | undefined {
  if (f.help) return f.help;
  switch (f.kind) {
    case "numbers": {
      const parts = ["Comma- or space-separated numbers"];
      if (f.maxLength) parts.push(`up to ${f.maxLength} values`);
      if (f.min !== undefined && f.max !== undefined) parts.push(`each ${f.min}…${f.max}`);
      if (f.sorted) parts.push("sorted ascending");
      return parts.join(", ") + ".";
    }
    case "tree":
      return "Level order with null for missing children, e.g. [3, 9, 20, null, null, 15, 7].";
    case "matrix":
      return "One row per line, numbers separated by spaces (or JSON [[...]]).";
    case "words":
      return "Comma- or space-separated words.";
    case "grid":
      return `One row per line using the characters "${(f as GridField).alphabet}".`;
    default:
      return undefined;
  }
}
