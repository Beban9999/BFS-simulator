import { describe, expect, it } from "vitest";
import { isNote, type AlgorithmMeta, type PageModule, type Problem } from "../engine/types";
import { parseCode } from "../engine/markers";
import { buildTrace, MAX_STEPS } from "../engine/trace";
import { validateInput } from "../engine/input";
import { seeded } from "../engine/random";

const modules = import.meta.glob<PageModule>("./*/*/index.ts", { eager: true, import: "default" });
const metas = import.meta.glob<AlgorithmMeta>("./*/*/meta.ts", { eager: true, import: "default" });

const RANDOM_RUNS = 200;

function checkProblems(problems: Problem[] | undefined) {
  const ids = (problems ?? []).map((p) => p.id);
  expect(new Set(ids).size, "duplicate problem numbers").toBe(ids.length);
  for (const p of problems ?? []) {
    expect(Number.isInteger(p.id) && p.id > 0, `problem id ${p.id}`).toBe(true);
    expect(p.title.trim().length, `#${p.id} title`).toBeGreaterThan(0);
    expect(p.slug, `#${p.id} slug`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(["Easy", "Medium", "Hard"], `#${p.id} difficulty`).toContain(p.difficulty);
    expect(p.note.trim().length, `#${p.id} note`).toBeGreaterThan(0);
  }
}

for (const [path, mod] of Object.entries(modules)) {
  describe(mod.id, () => {
    const meta = metas[path.replace("index.ts", "meta.ts")];

    it("folder matches category and id, and has meta.ts", () => {
      expect(path).toBe(`./${mod.category}/${mod.id}/index.ts`);
      expect(meta?.id).toBe(mod.id);
      expect(meta?.kind ?? "simulation", "meta.kind and the module kind differ").toBe(mod.kind ?? "simulation");
      expect(meta?.summary.trim().length).toBeGreaterThan(0);
    });

    it("practice problems are well-formed", () => checkProblems(mod.problems));

    if (isNote(mod)) {
      // Note pages have no simulation: only their component and optional info tabs are checked.
      it("note page exports a Page component and non-empty info sections", () => {
        expect(typeof mod.Page).toBe("function");
        for (const section of mod.info.replace(/\r\n/g, "\n").split(/^## /m).slice(1)) {
          const [title, ...body] = section.split("\n");
          expect(body.join("\n").trim().length, `empty section "${title}"`).toBeGreaterThan(0);
        }
      });
      return;
    }

    it("has at least 3 valid presets", () => {
      expect(mod.presets.length).toBeGreaterThanOrEqual(3);
      for (const p of mod.presets) expect(validateInput(mod, p.input), p.name).toBeNull();
    });

    it("has python and javascript code and info sections", () => {
      expect(mod.code.python.length).toBeGreaterThan(0);
      expect(mod.code.javascript.length).toBeGreaterThan(0);
      for (const section of ["## Explanation", "## Complexity", "## When to use", "## Pitfalls"]) {
        expect(mod.info, section).toContain(section);
      }
    });

    it("never uses the same @mark name twice in one code file", () => {
      for (const [lang, src] of Object.entries(mod.code)) {
        const names = [...(src as string).matchAll(/@mark\s+([\w\-, ]+?)\s*$/gm)].flatMap((m) => m[1].split(/[\s,]+/).filter(Boolean));
        const dupes = names.filter((n, i) => names.indexOf(n) !== i);
        expect(dupes, `${lang} repeats markers`).toEqual([]);
      }
    });

    const inputs = [
      ...mod.presets.map((p) => ({ name: `preset "${p.name}"`, input: p.input })),
      ...Array.from({ length: RANDOM_RUNS }, (_, i) => {
        const rng = seeded(1000 + i);
        return { name: `random #${i}`, input: mod.randomInput(1 + (i % 12), rng) };
      }),
    ];

    it("every step's line marker exists in every language", () => {
      const used = new Set<string>();
      for (const { input } of inputs.slice(0, mod.presets.length + 20)) {
        for (const s of buildTrace(mod, input).steps) used.add(s.line);
      }
      for (const [lang, src] of Object.entries(mod.code)) {
        const { marks } = parseCode(src as string);
        for (const line of used) expect(marks, `${lang} is missing @mark ${line}`).toHaveProperty(line);
      }
    });

    it(`matches the reference on presets and ${RANDOM_RUNS} random inputs`, () => {
      for (const { name, input } of inputs) {
        expect(validateInput(mod, input), `${name} is invalid`).toBeNull();
        const trace = buildTrace(mod, input);
        expect(trace.error, name).toBeUndefined();
        expect(trace.truncated, `${name} exceeded ${MAX_STEPS} steps`).toBe(false);
        expect(trace.steps.length, name).toBeGreaterThan(0);
        for (const s of trace.steps) expect(s.message.trim().length, `${name}: empty message`).toBeGreaterThan(0);
        const last = trace.steps[trace.steps.length - 1];
        expect(mod.outputOf(last.state, last), name).toEqual(mod.reference(input));
      }
    });
  });
}
