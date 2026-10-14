import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_META } from "../registry";
import { CATEGORIES, CATEGORY_BY_ID } from "../catalog/categories";

interface Entry {
  key: string;
  title: string;
  sub: string;
  to: string;
  haystack: string;
  /** Lower ranks sort first for equal scores. */
  rank: number;
}

function buildEntries(): Entry[] {
  const out: Entry[] = [];
  for (const m of ALL_META) {
    const cat = CATEGORY_BY_ID[m.category];
    out.push({
      key: `a:${m.id}`,
      title: m.title,
      sub: `${cat.title} · ${m.subcategory}`,
      to: `/${m.category}/${m.id}`,
      haystack: [m.title, m.subcategory, cat.title, ...(m.keywords ?? [])].join(" ").toLowerCase(),
      rank: 0,
    });
    for (const p of m.problems ?? []) {
      out.push({
        key: `p:${m.id}:${p.id}`,
        title: `${p.id}. ${p.title}`,
        sub: `Problem → ${m.title}`,
        to: `/${m.category}/${m.id}`,
        haystack: `${p.id} ${p.title} ${p.slug.replace(/-/g, " ")}`.toLowerCase(),
        rank: 1,
      });
    }
  }
  for (const c of CATEGORIES) {
    out.push({ key: `c:${c.id}`, title: c.title, sub: "Tab", to: `/${c.id}`, haystack: `${c.title} ${c.short}`.toLowerCase(), rank: 2 });
  }
  return out;
}

function score(entry: Entry, terms: string[]): number {
  let s = 0;
  const title = entry.title.toLowerCase();
  for (const t of terms) {
    if (!entry.haystack.includes(t)) return -1;
    s += title.startsWith(t) ? 3 : title.includes(t) ? 2 : 1;
  }
  return s;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const entries = useMemo(buildEntries, []);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return entries.filter((e) => e.rank === 0).slice(0, 50);
    return entries
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s || a.e.rank - b.e.rank || a.e.title.localeCompare(b.e.title))
      .slice(0, 50)
      .map((x) => x.e);
  }, [entries, query]);

  useEffect(() => {
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (e: Entry | undefined) => {
    if (!e) return;
    navigate(e.to);
    onClose();
  };

  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search">
        <input
          ref={inputRef}
          type="search"
          placeholder="Search algorithms, patterns or LeetCode problems…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `palette-${active}` : undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(results.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(results[active]);
            } else if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            }
          }}
        />
        <ul id="palette-results" role="listbox" ref={listRef}>
          {results.length === 0 && <li className="p-empty">No matches.</li>}
          {results.map((r, i) => (
            <li key={r.key} role="presentation">
              <button
                type="button"
                id={`palette-${i}`}
                role="option"
                aria-selected={i === active}
                data-index={i}
                tabIndex={-1}
                onMouseMove={() => setActive(i)}
                onClick={() => go(r)}
              >
                <span className="p-title">{r.title}</span>
                <span className="p-sub">{r.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
