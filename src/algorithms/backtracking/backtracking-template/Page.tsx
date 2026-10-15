import { useState } from "react";
import { CodeBlock } from "../../../components/CodePanel";
import { NoteCard, NoteGrid, PageLink } from "../../../components/note/Note";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";

const PARTS: { mark: string; name: string; text: string }[] = [
  { mark: "goal", name: "Goal check", text: "Is the partial solution complete? Record a copy (the path keeps changing) and return." },
  { mark: "loop", name: "Choices", text: "Everything you could do next from this state: the next element, a digit for this cell, a neighbour…" },
  { mark: "prune", name: "Prune", text: "Skip a choice that can never lead to a solution. This is where all the speed comes from." },
  { mark: "choose", name: "Choose", text: "Apply the choice to the shared state (append to path, mark used, place a queen)." },
  { mark: "explore", name: "Explore", text: "Recurse one level deeper with the updated state." },
  { mark: "unchoose", name: "Un-choose", text: "Undo exactly what Choose did, so the next sibling starts from the same state." },
];

interface Row {
  id: string;
  state: string;
  choices: string;
  goal: string;
  prune: string;
}

const ROWS: Row[] = [
  { id: "subsets", state: "path, start index", choices: "nums[i] for i ≥ start", goal: "every node (record, no return)", prune: "sorted: skip a value equal to its left sibling" },
  { id: "permutations", state: "path, used[]", choices: "any unused index", goal: "len(path) == n", prune: "duplicates: equal values only in order" },
  { id: "combinations", state: "path, start", choices: "start … n", goal: "len(path) == k", prune: "too few numbers left to reach k" },
  { id: "combination-sum", state: "path, start, remaining", choices: "candidates[i] for i ≥ start", goal: "remaining == 0", prune: "sorted: candidate > remaining ends the loop" },
  { id: "letter-combinations", state: "path, digit index", choices: "letters on the next key", goal: "index == len(digits)", prune: "none — every leaf is an answer" },
  { id: "generate-parentheses", state: "string, open, close", choices: "'(' or ')'", goal: "length == 2n", prune: "open < n for '(', close < open for ')'" },
  { id: "palindrome-partitioning", state: "pieces, start", choices: "s[start:end] for every end", goal: "start == len(s)", prune: "piece is not a palindrome" },
  { id: "n-queens", state: "row, cols / diag sets", choices: "a column in this row", goal: "row == n", prune: "column or diagonal already attacked" },
  { id: "sudoku", state: "board, next empty cell", choices: "digits 1–9", goal: "no empty cell left (stop at first)", prune: "digit already in row, column or box" },
  { id: "word-search", state: "cell, letter index, visited", choices: "4 neighbours", goal: "index == len(word) (stop at first)", prune: "off grid, visited, or wrong letter" },
];

export default function BacktrackingTemplate() {
  const [mark, setMark] = useState("choose");

  return (
    <>
      <NoteGrid>
        <CodeBlock code={{ python, javascript }} marker={mark} title="Template" />
        <NoteCard title="The six parts — click one">
          <ol className="note-steps">
            {PARTS.map((p) => (
              <li key={p.mark}>
                <button type="button" aria-pressed={mark === p.mark} onClick={() => setMark(p.mark)}>
                  <b>{p.name}.</b> {p.text}
                </button>
              </li>
            ))}
          </ol>
          <p className="note-muted" style={{ marginTop: 12 }}>
            Every call is one node of the decision tree you see on the other pages of this tab: Choose + Explore walks down
            an edge, Un-choose walks back up. Pruning cuts a whole subtree before it is built.
          </p>
        </NoteCard>
      </NoteGrid>

      <NoteCard title="Fill in the blanks: how each page uses the template">
        <p>
          For a new problem answer three questions: <b>what is the state</b> (what you carry down), <b>what are the
          choices</b> at a node, and <b>when is a path a solution</b> — then add pruning to cut dead branches early.
        </p>
        <div className="note-table-wrap">
          <table className="note-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>State</th>
                <th>Choices</th>
                <th>Goal</th>
                <th>Prune</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td>
                    <PageLink id={r.id} />
                  </td>
                  <td>{r.state}</td>
                  <td>{r.choices}</td>
                  <td>{r.goal}</td>
                  <td>{r.prune}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NoteCard>

      <NoteGrid>
        <NoteCard title="Three ways to avoid repeats">
          <p>
            <b>Start index</b> (subsets, combinations): only choose elements after the last one, so {"{1, 2}"} and {"{2, 1}"} are
            the same branch. Recurse with <code>i + 1</code>, or with <code>i</code> when an element may be reused
            (combination sum).
          </p>
          <p>
            <b>used[] array</b> (permutations): order matters, so any unused element is a choice; mark it on Choose and clear
            it on Un-choose.
          </p>
          <p>
            <b>Sort + skip equal siblings</b> (inputs with duplicates): at one depth, a value equal to the previous sibling
            would grow an identical subtree — <code>if i &gt; start and nums[i] == nums[i - 1]: continue</code>.
          </p>
        </NoteCard>
        <NoteCard title="Find all vs find one">
          <p>
            <b>All solutions</b> (subsets, N-Queens count): record and keep going; the function returns nothing.
          </p>
          <p>
            <b>One solution / yes-no</b> (sudoku, word search): make <code>backtrack</code> return a boolean and stop as soon
            as a call returns <code>True</code> — <code>if backtrack(...): return True</code> — so the search ends at the
            first success instead of exploring the rest of the tree.
          </p>
          <p>
            <b>Best solution</b>: keep a global best and prune branches that cannot beat it (branch and bound).
          </p>
        </NoteCard>
      </NoteGrid>
    </>
  );
}
