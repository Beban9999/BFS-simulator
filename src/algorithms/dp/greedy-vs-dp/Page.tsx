import { useMemo, useState } from "react";
import { CodeBlock } from "../../../components/CodePanel";
import { NoteCard, NoteGrid, PageLink } from "../../../components/note/Note";
import { compare, dpCoins, greedyCoins, parseCoins, PRESETS, type Verdict } from "./coins";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";

const SCAN = 40;

const VERDICT_TEXT: Record<Verdict, string> = {
  same: "Greedy found an optimal answer.",
  worse: "Greedy used more coins than necessary.",
  stuck: "Greedy got stuck with a remainder, although the amount can be made.",
  impossible: "No combination makes this amount.",
};

function Coins({ list }: { list: number[] | null }) {
  if (!list) return <span className="tag-bad">no answer</span>;
  if (!list.length) return <span className="note-muted">no coins needed</span>;
  return (
    <span className="coin-row">
      {list.map((c, i) => (
        <span key={i} className="coin">
          {c}
        </span>
      ))}
      <span className="note-muted"> = {list.length} coin{list.length === 1 ? "" : "s"}</span>
    </span>
  );
}

const CASES: { problem: string; rule: string; ok: boolean; why: string; page?: string }[] = [
  { problem: "Coin change, arbitrary coins", rule: "largest coin first", ok: false, why: "{1, 3, 4} and 6: greedy 4+1+1, best 3+3", page: "coin-change" },
  { problem: "0/1 knapsack", rule: "best value per weight first", ok: false, why: "capacity 50, items (10 kg, $60), (20, $100), (30, $120): greedy $160, best $220", page: "knapsack" },
  { problem: "Fractional knapsack", rule: "best value per weight first", ok: true, why: "you may take part of an item, so the best ratio never wastes room" },
  { problem: "Activity selection", rule: "earliest finish time first", ok: true, why: "exchange argument: the earliest finisher leaves the most room" },
  { problem: "Weighted interval scheduling", rule: "earliest finish / highest weight", ok: false, why: "one long valuable interval can beat several short ones — needs DP" },
  { problem: "House robber", rule: "take the largest house", ok: false, why: "[2, 3, 2]: greedy 3, best 2+2 = 4", page: "house-robber" },
  { problem: "Longest increasing subsequence", rule: "extend whenever possible", ok: false, why: "[1, 5, 2, 3]: greedy 1, 5; best 1, 2, 3", page: "lis" },
  { problem: "Jump Game (reachability)", rule: "track the farthest reachable index", ok: true, why: "reaching i means every index before i is reachable too" },
];

export default function GreedyVsDp() {
  const [text, setText] = useState(PRESETS[0].coins.join(", "));
  const [amount, setAmount] = useState(PRESETS[0].amount);
  const parsed = parseCoins(text);
  const coins = typeof parsed === "string" ? null : parsed;

  const g = useMemo(() => (coins ? greedyCoins(coins, amount) : null), [coins?.join(), amount]); // eslint-disable-line react-hooks/exhaustive-deps
  const d = useMemo(() => (coins ? dpCoins(coins, amount) : null), [coins?.join(), amount]); // eslint-disable-line react-hooks/exhaustive-deps
  const scan = useMemo(() => (coins ? Array.from({ length: SCAN }, (_, i) => compare(coins, i + 1)) : []), [coins?.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const verdict = coins ? compare(coins, amount) : null;
  const firstBad = scan.findIndex((v) => v === "worse" || v === "stuck");

  return (
    <>
      <NoteCard title="Coin change: greedy vs DP">
        <div className="note-controls">
          <label>
            coins
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} aria-label="Coin values" style={{ width: 140 }} />
          </label>
          <label>
            amount
            <input type="range" min={0} max={99} value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label="Amount" />
            <b>{amount}</b>
          </label>
          <div className="preset-chips">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="btn btn-secondary small"
                onClick={() => {
                  setText(p.coins.join(", "));
                  setAmount(p.amount);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        {typeof parsed === "string" ? (
          <p className="tag-bad">{parsed}</p>
        ) : (
          <>
            <div className="note-table-wrap">
              <table className="note-table">
                <tbody>
                  <tr>
                    <th>Greedy (largest first)</th>
                    <td>
                      <Coins list={g} />
                    </td>
                  </tr>
                  <tr>
                    <th>DP (fewest coins)</th>
                    <td>
                      <Coins list={d} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={verdict === "same" ? "tag-ok" : verdict === "impossible" ? "note-muted" : "tag-bad"} style={{ marginTop: 10 }}>
              {verdict && VERDICT_TEXT[verdict]}
            </p>
            <h3 className="rec-title" style={{ marginTop: 14 }}>
              Every amount from 1 to {SCAN} with these coins
            </h3>
            <div className="scan-strip" role="list">
              {scan.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  role="listitem"
                  className={`scan-cell ${v}${i + 1 === amount ? " current" : ""}`}
                  title={`${i + 1}: ${VERDICT_TEXT[v]}`}
                  onClick={() => setAmount(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="note-muted" style={{ marginTop: 8 }}>
              <span className="scan-key same" /> greedy optimal · <span className="scan-key worse" /> greedy uses more coins ·{" "}
              <span className="scan-key stuck" /> greedy stuck · <span className="scan-key impossible" /> impossible.{" "}
              {firstBad >= 0 ? `Smallest counter-example: ${firstBad + 1}.` : `Greedy is optimal for every amount up to ${SCAN}.`}
            </p>
          </>
        )}
      </NoteCard>

      <NoteGrid>
        <CodeBlock code={{ python, javascript }} title="Greedy vs table" />
        <NoteCard title="How to tell before you code">
          <p>
            Greedy is correct only when the locally best choice is always part of <i>some</i> optimal solution (the
            greedy-choice property). Prove it with an <b>exchange argument</b>: take any optimal answer, swap in the greedy
            choice, and show it gets no worse.
          </p>
          <p>
            If you can't prove it, <b>brute-force small cases</b> like the strip above: a counter-example usually shows up
            within the first few dozen inputs. When one does, the problem needs DP — try all choices for the last step and
            reuse the answers of smaller subproblems (<PageLink id="coin-change" />).
          </p>
          <p className="note-muted">
            Coin systems where greedy is always optimal are called <i>canonical</i>; most real currencies are designed to be.
          </p>
        </NoteCard>
      </NoteGrid>

      <NoteCard title="Greedy works here, fails there">
        <div className="note-table-wrap">
          <table className="note-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Greedy rule</th>
                <th>Optimal?</th>
                <th>Why / counter-example</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((c) => (
                <tr key={c.problem}>
                  <td>{c.page ? <PageLink id={c.page}>{c.problem}</PageLink> : c.problem}</td>
                  <td>{c.rule}</td>
                  <td className={c.ok ? "tag-ok" : "tag-bad"}>{c.ok ? "yes" : "no"}</td>
                  <td>{c.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NoteCard>
    </>
  );
}
