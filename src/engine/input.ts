import type { AlgorithmModule, InputField } from "./types";
import { checkGraph, formatGraph, parseGraph, type GraphValue } from "./graph";

type Parsed = { value: unknown; error?: undefined } | { error: string; value?: undefined };

/* ---------- Text <-> value per field ---------- */

export function formatField(field: InputField, value: unknown): string {
  switch (field.kind) {
    case "numbers":
      return (value as number[]).join(", ");
    case "number":
      return String(value);
    case "text":
    case "select":
      return String(value);
    case "words":
      return (value as string[]).join(", ");
    case "grid":
      return (value as string[]).join("\n");
    case "matrix":
      return (value as number[][]).map((r) => r.join(" ")).join("\n");
    case "tree":
      return "[" + (value as (number | null)[]).map((v) => (v === null ? "null" : v)).join(", ") + "]";
    case "graph":
      return formatGraph(value as GraphValue);
    case "json":
      return JSON.stringify(value);
  }
}

function parseNumberList(text: string): number[] | string {
  const cleaned = text.trim().replace(/^\[|\]$/g, "").trim();
  if (cleaned === "") return [];
  const parts = cleaned.split(/[\s,]+/).filter(Boolean);
  const out: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n)) return `"${p}" is not a number.`;
    out.push(n);
  }
  return out;
}

export function parseField(field: InputField, text: string): Parsed {
  switch (field.kind) {
    case "numbers": {
      const r = parseNumberList(text);
      if (typeof r === "string") return { error: `${field.label}: ${r}` };
      return checkField(field, r);
    }
    case "number": {
      const n = Number(text.trim());
      if (text.trim() === "" || !Number.isFinite(n)) return { error: `${field.label} must be a number.` };
      return checkField(field, n);
    }
    case "text":
      return checkField(field, text);
    case "select":
      return checkField(field, text);
    case "words": {
      const words = text
        .trim()
        .replace(/^\[|\]$/g, "")
        .split(/[\s,]+/)
        .map((w) => w.replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      return checkField(field, words);
    }
    case "grid": {
      const rows = text
        .replace(/\r/g, "")
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      return checkField(field, rows);
    }
    case "matrix": {
      let rows: number[][];
      const t = text.trim();
      if (t.startsWith("[[")) {
        try {
          rows = JSON.parse(t);
        } catch {
          return { error: `${field.label}: invalid JSON.` };
        }
      } else {
        rows = [];
        for (const line of t.split(/\n|;/).map((l) => l.trim()).filter(Boolean)) {
          const r = parseNumberList(line);
          if (typeof r === "string") return { error: `${field.label}: ${r}` };
          rows.push(r);
        }
      }
      return checkField(field, rows);
    }
    case "tree": {
      const cleaned = text.trim().replace(/^\[|\]$/g, "").trim();
      const values: (number | null)[] = [];
      if (cleaned !== "") {
        for (const p of cleaned.split(/[\s,]+/).filter(Boolean)) {
          if (p === "null" || p === "#") values.push(null);
          else {
            const n = Number(p);
            if (!Number.isFinite(n)) return { error: `${field.label}: "${p}" is not a number or null.` };
            values.push(n);
          }
        }
      }
      return checkField(field, values);
    }
    case "graph": {
      const g = parseGraph(text, field);
      if (typeof g === "string") return { error: `${field.label}: ${g}` };
      return checkField(field, g);
    }
    case "json": {
      try {
        return { value: JSON.parse(text) };
      } catch {
        return { error: `${field.label}: invalid JSON.` };
      }
    }
  }
}

/* ---------- Validation of an already-parsed value ---------- */

export function checkField(field: InputField, value: unknown): Parsed {
  const fail = (msg: string): Parsed => ({ error: `${field.label} ${msg}` });
  switch (field.kind) {
    case "numbers": {
      if (!Array.isArray(value) || value.some((v) => typeof v !== "number" || !Number.isFinite(v)))
        return fail("must be a list of numbers.");
      const arr = value as number[];
      if (field.minLength !== undefined && arr.length < field.minLength)
        return fail(`needs at least ${field.minLength} number${field.minLength === 1 ? "" : "s"}.`);
      if (field.maxLength !== undefined && arr.length > field.maxLength)
        return fail(`can have at most ${field.maxLength} numbers.`);
      if (field.integer && arr.some((v) => !Number.isInteger(v))) return fail("must contain whole numbers only.");
      if (field.min !== undefined && arr.some((v) => v < field.min!)) return fail(`values must be ≥ ${field.min}.`);
      if (field.max !== undefined && arr.some((v) => v > field.max!)) return fail(`values must be ≤ ${field.max}.`);
      if (field.sorted && arr.some((v, i) => i > 0 && v < arr[i - 1])) return fail("must be sorted ascending.");
      return { value: arr };
    }
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) return fail("must be a number.");
      if (field.integer && !Number.isInteger(value)) return fail("must be a whole number.");
      if (field.min !== undefined && value < field.min) return fail(`must be ≥ ${field.min}.`);
      if (field.max !== undefined && value > field.max) return fail(`must be ≤ ${field.max}.`);
      return { value };
    }
    case "text": {
      if (typeof value !== "string") return fail("must be text.");
      if (field.minLength !== undefined && value.length < field.minLength)
        return fail(`needs at least ${field.minLength} character${field.minLength === 1 ? "" : "s"}.`);
      if (field.maxLength !== undefined && value.length > field.maxLength)
        return fail(`can have at most ${field.maxLength} characters.`);
      if (field.pattern && !field.pattern.test(value)) return fail(field.patternHint ?? "has invalid characters.");
      return { value };
    }
    case "words": {
      if (!Array.isArray(value) || value.some((w) => typeof w !== "string")) return fail("must be a list of words.");
      if (field.maxLength !== undefined && value.length > field.maxLength)
        return fail(`can have at most ${field.maxLength} words.`);
      if (field.pattern && value.some((w) => !field.pattern!.test(w))) return fail(field.patternHint ?? "has invalid words.");
      return { value };
    }
    case "select": {
      if (!field.options.some((o) => o.value === value)) return fail("has an unknown option.");
      return { value };
    }
    case "grid": {
      if (!Array.isArray(value) || value.length === 0 || value.some((r) => typeof r !== "string"))
        return fail("must have at least one row.");
      const rows = value as string[];
      const width = rows[0].length;
      if (width === 0) return fail("rows cannot be empty.");
      if (rows.some((r) => r.length !== width)) return fail("rows must all have the same length.");
      if (rows.length > field.maxRows) return fail(`can have at most ${field.maxRows} rows.`);
      if (width > field.maxCols) return fail(`can have at most ${field.maxCols} columns.`);
      for (const r of rows)
        for (const ch of r)
          if (!field.alphabet.includes(ch)) return fail(`can only contain the characters "${field.alphabet}" (found "${ch}").`);
      for (const ch of field.unique ?? "") {
        const n = rows.join("").split(ch).length - 1;
        if (n !== 1) return fail(`must contain exactly one "${ch}".`);
      }
      return { value: rows };
    }
    case "matrix": {
      if (!Array.isArray(value) || value.some((r) => !Array.isArray(r) || r.some((v: unknown) => typeof v !== "number")))
        return fail("must be rows of numbers.");
      const rows = value as number[][];
      if (rows.length > field.maxRows) return fail(`can have at most ${field.maxRows} rows.`);
      if (rows.some((r) => r.length > field.maxCols)) return fail(`can have at most ${field.maxCols} columns.`);
      if (field.rectangular !== false && rows.some((r) => r.length !== rows[0].length))
        return fail("rows must all have the same length.");
      if (field.min !== undefined && rows.some((r) => r.some((v) => v < field.min!))) return fail(`values must be ≥ ${field.min}.`);
      if (field.max !== undefined && rows.some((r) => r.some((v) => v > field.max!))) return fail(`values must be ≤ ${field.max}.`);
      return { value: rows };
    }
    case "tree": {
      if (!Array.isArray(value) || value.some((v) => v !== null && typeof v !== "number"))
        return fail("must be a level-order list of numbers and nulls.");
      const nodes = value.filter((v) => v !== null).length;
      if (nodes > field.maxNodes) return fail(`can have at most ${field.maxNodes} nodes.`);
      if (value.length > 0 && value[0] === null) return fail("root cannot be null (use [] for an empty tree).");
      if (field.min !== undefined && value.some((v) => v !== null && v < field.min!)) return fail(`values must be ≥ ${field.min}.`);
      if (field.max !== undefined && value.some((v) => v !== null && v > field.max!)) return fail(`values must be ≤ ${field.max}.`);
      return { value };
    }
    case "graph": {
      const err = checkGraph(value, field);
      return err ? fail(err) : { value };
    }
    case "json":
      return { value };
  }
}

/** Validate a whole input object; returns an error message or null. */
export function validateInput<I>(module: AlgorithmModule<I>, input: unknown): string | null {
  if (!input || typeof input !== "object") return "Input must be an object.";
  const rec = input as Record<string, unknown>;
  for (const field of module.inputSchema.fields) {
    if (!(field.key in rec)) return `Missing "${field.label}".`;
    const r = checkField(field, rec[field.key]);
    if (r.error) return r.error;
  }
  return module.inputSchema.validate?.(input as I) ?? null;
}

/* ---------- Deep links ---------- */

export function encodeInput(input: unknown): string {
  return JSON.stringify(input);
}

export function decodeInput<I>(module: AlgorithmModule<I>, raw: string | null): I | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return validateInput(module, value) === null ? (value as I) : null;
  } catch {
    return null;
  }
}
