import { useMemo, useState } from "react";
import { Choice, NoteCard, NoteGrid, PageLink } from "../../../components/note/Note";
import { DATASETS } from "./data";
import { brokenKeys, sortRecords, SORT_LABEL, type Rec, type SortName } from "./sorts";

function RecordList({ title, recs, broken, verdict }: { title: string; recs: Rec[]; broken?: Set<number>; verdict?: React.ReactNode }) {
  const keys = [...new Set(recs.map((r) => r.key))].sort((a, b) => a - b);
  return (
    <div className="rec-col">
      <h3 className="rec-title">{title}</h3>
      <ol className="rec-list">
        {recs.map((r) => (
          <li key={r.pos} className={broken?.has(r.key) ? "bad" : undefined}>
            <span className="rec-key" style={{ "--k": `var(--grp-${keys.indexOf(r.key) % 6})` } as React.CSSProperties}>
              {r.keyText}
            </span>
            <span className="rec-label">
              {r.label}
              <sub title="original position">{r.pos}</sub>
            </span>
          </li>
        ))}
      </ol>
      {verdict && <p className="rec-verdict">{verdict}</p>}
    </div>
  );
}

function verdictFor(recs: Rec[], keyName: string) {
  const broken = brokenKeys(recs);
  if (broken.size === 0) return <span className="tag-ok">✓ equal {keyName}s kept their input order</span>;
  const texts = [...new Set(recs.filter((r) => broken.has(r.key)).map((r) => r.keyText))];
  return (
    <span className="tag-bad">
      ✗ order changed within {keyName} {texts.join(", ")}
    </span>
  );
}

const STABLE_ROWS: [string, string, string][] = [
  ["insertion-sort", "yes", "shifts only past strictly larger keys"],
  ["merge-sort", "yes", "takes from the left half on ties (<=)"],
  ["bubble-sort", "yes", "swaps neighbours only when strictly out of order"],
  ["counting-sort", "yes", "fills the output from the right with prefix sums"],
  ["radix-sort", "yes", "needs a stable pass per digit — that's why it works"],
  ["selection-sort", "no", "the long swap jumps an element over its equals"],
  ["heap-sort", "no", "moving the max to the end scrambles equal keys"],
  ["quick-sort-lomuto", "no", "partition swaps move equal keys past each other"],
  ["shell-sort", "no", "gapped insertion moves elements over their equals"],
];

export default function SortStability() {
  const [di, setDi] = useState("0");
  const [stable, setStable] = useState<SortName>("merge");
  const [unstable, setUnstable] = useState<SortName>("selection");
  const data = DATASETS[Number(di)];
  const a = useMemo(() => sortRecords(data.records, stable), [data, stable]);
  const b = useMemo(() => sortRecords(data.records, unstable), [data, unstable]);

  // Two-key demo on the students: sort by name first, then by grade.
  const students = DATASETS[0].records;
  const byName = useMemo(() => students.slice().sort((x, y) => x.label.localeCompare(y.label)).map((r, pos) => ({ ...r, pos })), [students]);
  const twoStable = useMemo(() => sortRecords(byName, "merge"), [byName]);
  const twoUnstable = useMemo(() => sortRecords(byName, unstable), [byName, unstable]);

  return (
    <>
      <NoteCard title="Same input, two sorts">
        <p>
          A sort is <b>stable</b> when records with equal keys come out in the same relative order they went in. Both
          columns below are correctly sorted by {data.keyName}; only the order <i>inside</i> each colour differs. The small
          number is each record's original position.
        </p>
        <div className="note-controls">
          <Choice label="Data" value={di} onChange={setDi} options={DATASETS.map((d, i) => [String(i), d.name])} />
          <label>
            stable
            <select value={stable} onChange={(e) => setStable(e.target.value as SortName)}>
              <option value="merge">{SORT_LABEL.merge}</option>
              <option value="insertion">{SORT_LABEL.insertion}</option>
            </select>
          </label>
          <label>
            unstable
            <select value={unstable} onChange={(e) => setUnstable(e.target.value as SortName)}>
              <option value="selection">{SORT_LABEL.selection}</option>
              <option value="heap">{SORT_LABEL.heap}</option>
              <option value="quick">{SORT_LABEL.quick}</option>
            </select>
          </label>
        </div>
        <div className="rec-columns">
          <RecordList title="Input" recs={data.records} />
          <RecordList title={SORT_LABEL[stable]} recs={a} verdict={verdictFor(a, data.keyName)} />
          <RecordList title={SORT_LABEL[unstable]} recs={b} broken={brokenKeys(b)} verdict={verdictFor(b, data.keyName)} />
        </div>
      </NoteCard>

      <NoteGrid>
        <NoteCard title="Why it matters: sorting by two keys">
          <p>
            Sort by the <b>secondary</b> key first (name), then by the <b>primary</b> key (grade) with a stable sort: ties on
            grade keep the alphabetical order from the first pass. This is how spreadsheet "sort by column" clicks and
            multi-pass radix sort work.
          </p>
          <div className="rec-columns">
            <RecordList title="1. by name" recs={byName} />
            <RecordList title={`2. by grade, ${SORT_LABEL.merge}`} recs={twoStable} verdict={verdictFor(twoStable, "grade")} />
            <RecordList title={`2. by grade, ${SORT_LABEL[unstable]}`} recs={twoUnstable} broken={brokenKeys(twoUnstable)} verdict={verdictFor(twoUnstable, "grade")} />
          </div>
          <p className="note-muted">
            One pass with a composite key does the same without relying on stability: <code>sort(key=lambda s: (s.grade, s.name))</code>.
          </p>
        </NoteCard>
        <NoteCard title="Which sorts are stable?">
          <div className="note-table-wrap">
            <table className="note-table">
              <thead>
                <tr>
                  <th>Sort</th>
                  <th>Stable</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {STABLE_ROWS.map(([id, ok, why]) => (
                  <tr key={id}>
                    <td>
                      <PageLink id={id} />
                    </td>
                    <td className={ok === "yes" ? "tag-ok" : "tag-bad"}>{ok}</td>
                    <td>{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note-muted" style={{ marginTop: 10 }}>
            Any sort can be made stable by sorting <code>(key, original index)</code> pairs, at the cost of O(n) extra memory.
          </p>
        </NoteCard>
      </NoteGrid>
    </>
  );
}
