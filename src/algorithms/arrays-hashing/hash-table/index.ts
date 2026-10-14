import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { bi, ei, stringHash, type HashState } from "../../_shared/hash";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  keys: string[];
  mode: "chaining" | "probing";
  capacity: number;
}

const LOAD_LIMIT = 0.75;

function* generate({ keys, mode, capacity }: Input) {
  const t = new Tracer<HashState>();
  let buckets: string[][] = Array.from({ length: capacity }, () => []);
  let size = 0;
  let old: string[][] | undefined;
  const state = (hashLine?: string, result?: unknown): HashState => ({ mode, buckets: buckets.map((b) => b.slice()), size, hashLine, old: old?.map((b) => b.slice()), result });
  const vars = (extra: Record<string, unknown> = {}) => ({ size, capacity: buckets.length, load: Number((size / buckets.length).toFixed(2)), ...extra });

  /** Inserts one key, yielding its steps. Returns true if a resize is needed afterwards. */
  function* add(key: string, rehashing: boolean): Generator<ReturnType<typeof t.step>, boolean> {
    const h = stringHash(key);
    let i = h % buckets.length;
    t.count("hashes");
    const line = `hash("${key}") = ${h} → ${h} % ${buckets.length} = ${i}`;
    yield t.step(rehashing ? "rehash" : "hash", `${rehashing ? "Rehash" : "Insert"} "${key}": its home bucket is ${i}.`, {
      state: state(line),
      vars: vars({ key, hash: h, index: i }),
      highlights: hl("current", bi(i)),
    });
    if (mode === "chaining") {
      const chain = buckets[i];
      t.count("comparisons", chain.length);
      if (chain.includes(key)) {
        yield t.step("exists", `"${key}" is already in bucket ${i}'s chain; a set stores each key once.`, {
          state: state(line),
          vars: vars({ key, index: i }),
          highlights: [...hl("current", bi(i)), ...hl("found", ei(i, chain.indexOf(key)))],
        });
        return false;
      }
      if (chain.length) t.count("collisions");
      chain.push(key);
      size++;
      yield t.step(
        "append",
        chain.length > 1
          ? `Collision: bucket ${i} already holds ${chain.length - 1} key${chain.length > 2 ? "s" : ""}. Append "${key}" to the chain.`
          : `Bucket ${i} was empty; "${key}" starts its chain.`,
        {
          state: state(line),
          vars: vars({ key, index: i }),
          highlights: [...hl("current", bi(i)), ...hl(chain.length > 1 ? "swap" : "found", ei(i, chain.length - 1))],
        },
      );
    } else {
      while (buckets[i].length) {
        t.count("probes");
        if (buckets[i][0] === key) {
          yield t.step("exists-probe", `Slot ${i} holds "${key}" already; nothing to insert.`, {
            state: state(line),
            vars: vars({ key, index: i }),
            highlights: hl("found", bi(i), ei(i, 0)),
          });
          return false;
        }
        t.count("collisions");
        const next = (i + 1) % buckets.length;
        yield t.step("probe", `Slot ${i} is taken by "${buckets[i][0]}" — collision. Probe the next slot, ${next}.`, {
          state: state(line),
          vars: vars({ key, index: i, next }),
          highlights: [...hl("mismatch", bi(i)), ...hl("compare", bi(next))],
        });
        i = next;
      }
      buckets[i] = [key];
      size++;
      yield t.step("place", `Slot ${i} is free: place "${key}" there.`, {
        state: state(line),
        vars: vars({ key, index: i }),
        highlights: hl("found", bi(i), ei(i, 0)),
      });
    }
    if (rehashing) return false;
    const load = size / buckets.length;
    t.count("comparisons");
    yield t.step("check-load", `Load factor = ${size}/${buckets.length} = ${load.toFixed(2)}${load > LOAD_LIMIT ? ` > ${LOAD_LIMIT}: time to grow.` : ` ≤ ${LOAD_LIMIT}: fine.`}`, {
      state: state(line),
      vars: vars({ key }),
    });
    return load > LOAD_LIMIT;
  }

  yield t.step("init", `Start with ${capacity} empty bucket${capacity === 1 ? "" : "s"} using ${mode === "chaining" ? "separate chaining" : "linear probing"}.`, {
    state: state(),
    vars: vars(),
  });

  for (const key of keys) {
    const grow = yield* add(key, false);
    if (!grow) continue;
    old = buckets;
    buckets = Array.from({ length: old.length * 2 }, () => []);
    size = 0;
    yield t.step("resize", `Allocate ${buckets.length} buckets (double) and re-insert every key: index = hash % capacity changes when capacity changes.`, {
      state: state(),
      vars: vars(),
    });
    for (let b = 0; b < old.length; b++) {
      for (const k of old[b]) yield* add(k, true);
    }
    old = undefined;
    yield t.step("resize", `Rehash complete. Load factor is now ${(size / buckets.length).toFixed(2)}.`, { state: state(), vars: vars() });
  }

  yield t.step("check-load", `Inserted ${keys.length} key${keys.length === 1 ? "" : "s"}: ${size} distinct, capacity ${buckets.length}.`, {
    state: state(undefined, buckets.map((b) => b.slice())),
    vars: vars(),
  });
}

function reference({ keys, mode, capacity }: Input): string[][] {
  let buckets: string[][] = Array.from({ length: capacity }, () => []);
  let size = 0;
  const add = (key: string, rehash: boolean): boolean => {
    let i = stringHash(key) % buckets.length;
    if (mode === "chaining") {
      if (buckets[i].includes(key)) return false;
      buckets[i].push(key);
    } else {
      while (buckets[i].length) {
        if (buckets[i][0] === key) return false;
        i = (i + 1) % buckets.length;
      }
      buckets[i] = [key];
    }
    size++;
    return !rehash && size / buckets.length > LOAD_LIMIT;
  };
  for (const key of keys) {
    if (add(key, false)) {
      const old = buckets;
      buckets = Array.from({ length: old.length * 2 }, () => []);
      size = 0;
      for (const b of old) for (const k of b) add(k, true);
    }
  }
  return buckets;
}

const WORDS = ["cat", "dog", "owl", "ant", "bee", "elk", "fox", "gnu", "hen", "yak", "emu", "ape", "bat", "cow", "eel", "pig"];

const algorithm: AlgorithmModule<Input, HashState> = {
  ...meta,
  renderer: "hashtable",
  inputSchema: {
    fields: [
      { key: "keys", label: "keys", kind: "words", maxLength: 14, pattern: /^[a-z]{1,8}$/, patternHint: "words must be 1–8 lowercase letters." },
      {
        key: "mode",
        label: "collision strategy",
        kind: "select",
        options: [
          { value: "chaining", label: "Separate chaining" },
          { value: "probing", label: "Open addressing (linear probing)" },
        ],
      },
      { key: "capacity", label: "initial capacity", kind: "number", integer: true, min: 1, max: 8 },
    ],
  },
  presets: [
    { name: "Chaining with a resize", input: { keys: ["cat", "dog", "owl", "ant", "bee", "elk", "fox"], mode: "chaining", capacity: 4 } },
    { name: "Linear probing with collisions", input: { keys: ["cat", "dog", "owl", "ant", "bee", "elk", "fox"], mode: "probing", capacity: 4 } },
    { name: "Duplicates are ignored", input: { keys: ["cat", "dog", "cat", "dog", "owl"], mode: "chaining", capacity: 4 } },
    { name: "Worst case: capacity 1", input: { keys: ["ape", "bat", "cow", "eel", "pig"], mode: "probing", capacity: 1 } },
  ],
  randomInput: (size, rng = Math.random) => ({
    keys: Array.from({ length: Math.max(1, Math.min(12, size)) }, () => pick(rng, WORDS)),
    mode: rng() < 0.5 ? "chaining" : "probing",
    capacity: randInt(rng, 1, 6),
  }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Home bucket", swap: "Added after a collision", found: "Stored", mismatch: "Occupied (collision)", compare: "Next probe" },
};

export default algorithm;
