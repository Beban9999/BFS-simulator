/**
 * Code strings carry trailing marker comments such as `# @mark relax-edge` or
 * `// @mark relax-edge, push`. They are stripped for display and mapped to
 * 1-based line numbers so a step's `line` highlights the right line in every language.
 */
export interface ParsedCode {
  text: string;
  /** marker -> 1-based line number */
  marks: Record<string, number>;
}

const MARK_RE = /\s*(?:#|\/\/)\s*@mark\s+([\w\-, ]+?)\s*$/;

const cache = new Map<string, ParsedCode>();

export function parseCode(source: string): ParsedCode {
  const cached = cache.get(source);
  if (cached) return cached;

  const marks: Record<string, number> = {};
  const lines = source.replace(/\r\n/g, "\n").replace(/\n+$/, "").split("\n");
  const out = lines.map((line, i) => {
    const m = line.match(MARK_RE);
    if (!m) return line;
    for (const name of m[1].split(/[\s,]+/).filter(Boolean)) {
      if (!(name in marks)) marks[name] = i + 1;
    }
    return line.slice(0, m.index).replace(/\s+$/, "");
  });

  const parsed = { text: out.join("\n"), marks };
  cache.set(source, parsed);
  return parsed;
}
