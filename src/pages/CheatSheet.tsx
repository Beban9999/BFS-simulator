import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { COMPLEXITY, SIGNALS, type Signal } from "../catalog/cheatsheet";
import { META_BY_ID } from "../registry";
import { usePrefs } from "../store/prefs";
import { ProgressIcon } from "../components/ProgressMark";
import { Icon } from "../components/Icons";

const GROUPS = [...new Set(SIGNALS.map((s) => s.group))];

function haystack(s: Signal): string {
  return [s.signal, s.pattern, s.hint, s.group, ...s.pages.map((id) => META_BY_ID.get(id)?.title ?? id)].join(" ").toLowerCase();
}

function PageChip({ id }: { id: string }) {
  const meta = META_BY_ID.get(id);
  const mark = usePrefs((s) => s.progress[id]);
  if (!meta) return null;
  return (
    <Link className="cs-chip" to={`/${meta.category}/${meta.id}`}>
      <ProgressIcon mark={mark} />
      {meta.title}
    </Link>
  );
}

export function CheatSheet() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const group = params.get("group") ?? "";

  useEffect(() => {
    document.title = "Pattern Cheat Sheet · Steplore";
    return () => {
      document.title = "Steplore — Watch algorithms run, step by step";
    };
  }, []);

  const update = (key: string, value: string) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const rows = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return SIGNALS.filter((s) => (!group || s.group === group) && terms.every((t) => haystack(s).includes(t)));
  }, [query, group]);

  return (
    <main className="page-main cheatsheet" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="hero">
        <h1>Pattern Cheat Sheet</h1>
        <p>
          Read the problem, spot the signal, reach for the pattern. Every row links to the pages that animate it; the Big-O
          tables below cover the data structures and algorithms on this site.
        </p>
      </div>

      <section className="panel" aria-label="Signal to pattern">
        <div className="panel-head cs-head">
          <h2 className="panel-title">Signal → pattern → page</h2>
          <label className="cs-search">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Filter: sorted, subarray, shortest path, k largest…"
              value={query}
              onChange={(e) => update("q", e.target.value)}
              aria-label="Filter the cheat sheet"
            />
          </label>
        </div>
        <div className="cs-groups" role="group" aria-label="Topic">
          <button type="button" aria-pressed={!group} onClick={() => update("group", "")}>
            All
          </button>
          {GROUPS.map((g) => (
            <button key={g} type="button" aria-pressed={group === g} onClick={() => update("group", group === g ? "" : g)}>
              {g}
            </button>
          ))}
        </div>
        <div className="note-table-wrap">
          <table className="note-table cs-table">
            <thead>
              <tr>
                <th>When you see…</th>
                <th>Reach for</th>
                <th>Pages</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.signal}>
                  <td>
                    {s.signal}
                    <span className="cs-group">{s.group}</span>
                  </td>
                  <td>
                    <b>{s.pattern}</b>
                    <div className="note-muted">{s.hint}</div>
                  </td>
                  <td>
                    <div className="cs-chips">
                      {s.pages.map((id) => (
                        <PageChip key={id} id={id} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="note-muted">
                    Nothing matches “{query}”. Try fewer words, or press Ctrl K to search pages and LeetCode problems.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="section-title">Big-O tables</h2>
      <div className="cs-tables">
        {COMPLEXITY.map((t) => (
          <section key={t.title} className="panel note-card" aria-label={t.title}>
            <div className="panel-head">
              <h2 className="panel-title">{t.title}</h2>
            </div>
            <div className="note-body">
              <div className="note-table-wrap">
                <table className="note-table">
                  <thead>
                    <tr>
                      <th />
                      {t.columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((r) => {
                      const meta = r.page ? META_BY_ID.get(r.page) : undefined;
                      return (
                        <tr key={r.name}>
                          <td>{meta ? <Link to={`/${meta.category}/${meta.id}`}>{r.name}</Link> : r.name}</td>
                          {r.cells.map((c, i) => (
                            <td key={i} className="cs-cell">
                              {c}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {t.note && <p className="note-muted" style={{ marginTop: 8 }}>{t.note}</p>}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
