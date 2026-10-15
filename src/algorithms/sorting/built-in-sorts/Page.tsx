import { useState } from "react";
import { Choice, NoteCard, NoteGrid, PageLink } from "../../../components/note/Note";

interface Lang {
  id: string;
  name: string;
  calls: string;
  algorithm: string;
  stable: string;
  gotchas: string[];
  snippet: string;
}

/** Facts checked against the official docs on 2026-10-15 (see info.md "Sources"). */
const LANGS: Lang[] = [
  {
    id: "py",
    name: "Python",
    calls: "list.sort(key=…, reverse=…), sorted(iterable, …)",
    algorithm: "Timsort: natural runs + binary insertion sort, merged with galloping; since 3.11 the merge order follows the “powersort” policy.",
    stable: "Guaranteed stable (documented).",
    gotchas: [
      "key and reverse are keyword-only; there is no cmp argument — wrap a comparator with functools.cmp_to_key.",
      "The key is computed once per element, so an expensive key is fine.",
      "list.sort() sorts in place and returns None.",
    ],
    snippet: `people.sort(key=lambda p: (p.age, p.name))      # multi-key
people.sort(key=lambda p: p.age, reverse=True)  # descending, still stable
nums.sort(key=lambda x: (-x[1], x[0]))          # mixed directions
sorted(words, key=cmp_to_key(compare))          # old-style comparator`,
  },
  {
    id: "js",
    name: "JavaScript",
    calls: "arr.sort(compareFn), arr.toSorted(compareFn)",
    algorithm: "Engine-specific. V8 (Chrome, Node) uses Timsort since V8 7.0.",
    stable: "Stable — required by the spec since ES2019.",
    gotchas: [
      "Without compareFn elements are compared as strings: [10, 9, 1].sort() gives [1, 10, 9].",
      "compareFn must return a number (negative / 0 / positive), not a boolean.",
      "sort() mutates and returns the same array; toSorted() returns a copy.",
    ],
    snippet: `nums.sort((a, b) => a - b);                     // numeric ascending
people.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name));
const sorted = nums.toSorted((a, b) => b - a);  // copy, descending`,
  },
  {
    id: "java",
    name: "Java",
    calls: "Arrays.sort(a), Arrays.sort(objs, cmp), list.sort(cmp), Collections.sort(list)",
    algorithm: "Primitive arrays: Dual-Pivot Quicksort. Object arrays and lists: TimSort (adapted from Python's).",
    stable: "Objects: guaranteed stable. Primitives: not specified (equal ints are indistinguishable anyway).",
    gotchas: [
      "Comparator (a, b) -> a - b can overflow; use Integer.compare or Comparator.comparingInt.",
      "To sort an int[] descending you need Integer[] or sort then reverse.",
      "A comparator that breaks the contract can throw “Comparison method violates its general contract!”.",
    ],
    snippet: `Arrays.sort(nums);                                   // int[]
people.sort(Comparator.comparingInt(Person::age).thenComparing(Person::name));
Arrays.sort(boxed, Collections.reverseOrder());      // Integer[] descending`,
  },
  {
    id: "cpp",
    name: "C++",
    calls: "std::sort, std::stable_sort, std::partial_sort, std::nth_element",
    algorithm: "std::sort is usually introsort (quicksort → heapsort when recursion gets too deep, insertion sort for small ranges).",
    stable: "std::sort is not stable; std::stable_sort is (merge sort, uses a buffer when it can).",
    gotchas: [
      "O(n log n) worst case is required since LWG 713 (libc++ only met it from LLVM 14).",
      "The comparator must be a strict weak ordering: use <, never <=.",
      "nth_element gives a quickselect in O(n) average — see Quickselect.",
    ],
    snippet: `std::sort(v.begin(), v.end());
std::sort(v.begin(), v.end(), std::greater<>());        // descending
std::stable_sort(p.begin(), p.end(), [](auto& a, auto& b) { return a.age < b.age; });`,
  },
  {
    id: "cs",
    name: "C#",
    calls: "Array.Sort, List<T>.Sort, Enumerable.OrderBy",
    algorithm: "Array.Sort / List.Sort: introsort (insertion sort ≤ 16 elements, heapsort past 2·log n partitions, quicksort otherwise).",
    stable: "Array.Sort and List.Sort are unstable; LINQ OrderBy / ThenBy is stable.",
    gotchas: [
      "Use OrderBy(...).ThenBy(...) when ties must keep their order.",
      "Comparison<T> must return 0 for equal items, or the sort may throw or misbehave.",
    ],
    snippet: `Array.Sort(nums);
people.Sort((a, b) => a.Age.CompareTo(b.Age));
var byAgeThenName = people.OrderBy(p => p.Age).ThenBy(p => p.Name).ToList();`,
  },
  {
    id: "go",
    name: "Go",
    calls: "slices.Sort, slices.SortFunc, slices.SortStableFunc, sort.Slice, sort.Stable",
    algorithm: "Pattern-defeating quicksort (pdqsort) since Go 1.19.",
    stable: "sort.Sort / sort.Slice / slices.Sort are not stable; sort.Stable, sort.SliceStable and slices.SortStableFunc are.",
    gotchas: [
      "The sort package docs point to the newer slices package as more ergonomic and faster.",
      "sort.Slice takes a less(i, j) on indexes; slices.SortFunc takes cmp(a, b) on values.",
    ],
    snippet: `slices.Sort(nums)
slices.SortFunc(people, func(a, b Person) int { return cmp.Compare(a.Age, b.Age) })
slices.SortStableFunc(people, func(a, b Person) int { return strings.Compare(a.Name, b.Name) })`,
  },
  {
    id: "rust",
    name: "Rust",
    calls: "slice.sort(), sort_by, sort_by_key, sort_unstable*, select_nth_unstable",
    algorithm: "sort: driftsort (stable merge-based hybrid). sort_unstable: ipnsort (quicksort-based, in place). Both since Rust 1.81.",
    stable: "sort* is stable; sort_unstable* is not.",
    gotchas: [
      "Floats are not Ord: use sort_by(|a, b| a.total_cmp(b)).",
      "Since 1.81 an inconsistent Ord implementation may panic instead of giving a scrambled order.",
    ],
    snippet: `v.sort_unstable();                               // fastest for plain numbers
people.sort_by_key(|p| (p.age, p.name.clone()));
floats.sort_by(|a, b| a.total_cmp(b));`,
  },
];

const HYBRIDS: [string, string, string][] = [
  ["Timsort / powersort", "Find already-sorted runs (reversing descending ones), extend short runs with binary insertion sort, then merge runs in a balanced order; galloping skips ahead when one run keeps winning.", "merge-sort"],
  ["Introsort", "Quicksort, but if recursion goes deeper than about 2·log n switch to heapsort (no O(n²) worst case); finish small ranges with insertion sort.", "quick-sort-lomuto"],
  ["pdqsort / ipnsort", "Introsort plus pattern detection: already sorted or reversed input is handled in O(n), many equal keys are grouped, and bad pivots trigger a shuffle.", "heap-sort"],
  ["Dual-pivot quicksort", "Partition around two pivots into three parts (< p, between, > q); fewer memory passes than one-pivot quicksort on typical data.", "quick-sort-hoare"],
];

export default function BuiltInSorts() {
  const [id, setId] = useState("py");
  const lang = LANGS.find((l) => l.id === id)!;

  return (
    <>
      <NoteCard title="What your language's sort really does" actions={<Choice label="Language" value={id} onChange={setId} options={LANGS.map((l) => [l.id, l.name])} />}>
        <NoteGrid>
          <div>
            <p>
              <b>Calls:</b> <code>{lang.calls}</code>
            </p>
            <p>
              <b>Algorithm:</b> {lang.algorithm}
            </p>
            <p>
              <b>Stable?</b> {lang.stable}
            </p>
            <ul>
              {lang.gotchas.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
          <pre className="note-pre">
            <code>{lang.snippet}</code>
          </pre>
        </NoteGrid>
      </NoteCard>

      <NoteCard title="At a glance">
        <div className="note-table-wrap">
          <table className="note-table">
            <thead>
              <tr>
                <th>Language</th>
                <th>Default algorithm</th>
                <th>Stable</th>
              </tr>
            </thead>
            <tbody>
              {LANGS.map((l) => (
                <tr key={l.id} className={l.id === id ? "hl" : undefined} onClick={() => setId(l.id)} style={{ cursor: "pointer" }}>
                  <td>{l.name}</td>
                  <td>{l.algorithm}</td>
                  <td>{l.stable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note-muted" style={{ marginTop: 10 }}>
          Every library sort above is O(n log n) in the worst case and adaptive to some degree. In an interview, calling the
          built-in sort is O(n log n) time; mention O(n) extra space for the merge-based ones (Python, Java objects, JS in V8).
        </p>
      </NoteCard>

      <NoteCard title="The hybrids, in one line each">
        <div className="note-table-wrap">
          <table className="note-table">
            <thead>
              <tr>
                <th>Hybrid</th>
                <th>Idea</th>
                <th>Related page</th>
              </tr>
            </thead>
            <tbody>
              {HYBRIDS.map(([name, idea, page]) => (
                <tr key={name}>
                  <td style={{ whiteSpace: "nowrap" }}>{name}</td>
                  <td>{idea}</td>
                  <td>
                    <PageLink id={page} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note-muted" style={{ marginTop: 10 }}>
          Why stability matters and which textbook sorts have it: <PageLink id="sort-stability" />. Insertion sort is the
          small-range finisher inside all of them: <PageLink id="insertion-sort" />.
        </p>
      </NoteCard>
    </>
  );
}
