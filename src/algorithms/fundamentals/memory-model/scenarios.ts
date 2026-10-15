/** Hand-written snapshots for the memory-model note: which name points to which object after each line. */

export type Cell = number | { ref: string };

export interface Obj {
  id: string;
  kind: "int" | "list";
  value: number | Cell[];
}

export interface Snapshot {
  /** Line index in the Python and the JavaScript listing. */
  py: number;
  js: number;
  /** name → object id, in display order. */
  names: [string, string][];
  objects: Obj[];
  note: string;
}

export interface Scenario {
  id: string;
  title: string;
  python: string[];
  javascript: string[];
  steps: Snapshot[];
}

const int = (id: string, v: number): Obj => ({ id, kind: "int", value: v });
const list = (id: string, ...v: Cell[]): Obj => ({ id, kind: "list", value: v });

export const SCENARIOS: Scenario[] = [
  {
    id: "alias",
    title: "Two names, one list",
    python: ["a = [1, 2]", "b = a", "b.append(3)", "print(a)   # [1, 2, 3]"],
    javascript: ["const a = [1, 2];", "const b = a;", "b.push(3);", "console.log(a); // [1, 2, 3]"],
    steps: [
      { py: 0, js: 0, names: [["a", "L"]], objects: [list("L", 1, 2)], note: "Creating a list makes one object; the name a refers to it." },
      { py: 1, js: 1, names: [["a", "L"], ["b", "L"]], objects: [list("L", 1, 2)], note: "Assignment copies the reference, not the list: a and b now name the same object." },
      { py: 2, js: 2, names: [["a", "L"], ["b", "L"]], objects: [list("L", 1, 2, 3)], note: "Mutating through b changes the one shared object…" },
      { py: 3, js: 3, names: [["a", "L"], ["b", "L"]], objects: [list("L", 1, 2, 3)], note: "…so a sees the 3 as well. This is aliasing." },
    ],
  },
  {
    id: "copy",
    title: "Copy before you change",
    python: ["a = [1, 2]", "b = a[:]    # or list(a), a.copy()", "b.append(3)", "print(a)   # [1, 2]"],
    javascript: ["const a = [1, 2];", "const b = [...a];  // or a.slice()", "b.push(3);", "console.log(a); // [1, 2]"],
    steps: [
      { py: 0, js: 0, names: [["a", "L"]], objects: [list("L", 1, 2)], note: "One list, named a." },
      { py: 1, js: 1, names: [["a", "L"], ["b", "M"]], objects: [list("L", 1, 2), list("M", 1, 2)], note: "A copy is a new list object with the same items (O(n) time and memory)." },
      { py: 2, js: 2, names: [["a", "L"], ["b", "M"]], objects: [list("L", 1, 2), list("M", 1, 2, 3)], note: "Changing the copy leaves the original alone." },
      { py: 3, js: 3, names: [["a", "L"], ["b", "M"]], objects: [list("L", 1, 2), list("M", 1, 2, 3)], note: "This is why backtracking records path[:] / [...path], not path." },
    ],
  },
  {
    id: "int",
    title: "Numbers can't be changed in place",
    python: ["a = 5", "b = a", "b += 1", "print(a)   # 5"],
    javascript: ["let a = 5;", "let b = a;", "b += 1;", "console.log(a); // 5"],
    steps: [
      { py: 0, js: 0, names: [["a", "i5"]], objects: [int("i5", 5)], note: "a refers to the number 5. (In JS, numbers are stored as plain values — the outcome is the same.)" },
      { py: 1, js: 1, names: [["a", "i5"], ["b", "i5"]], objects: [int("i5", 5)], note: "b refers to the same 5." },
      { py: 2, js: 2, names: [["a", "i5"], ["b", "i6"]], objects: [int("i5", 5), int("i6", 6)], note: "Numbers (and strings, tuples) are immutable: b += 1 makes a new value 6 and points b at it." },
      { py: 3, js: 3, names: [["a", "i5"], ["b", "i6"]], objects: [int("i5", 5), int("i6", 6)], note: "a is untouched. Only mutable objects (lists, dicts, sets, objects) can be changed through another name." },
    ],
  },
  {
    id: "args",
    title: "Passing a list to a function",
    python: ["def f(lst):", "    lst.append(9)", "    lst = [0]", "", "nums = [1]", "f(nums)", "print(nums)   # [1, 9]"],
    javascript: ["function f(lst) {", "  lst.push(9);", "  lst = [0];", "}", "const nums = [1];", "f(nums);", "console.log(nums); // [1, 9]"],
    steps: [
      { py: 4, js: 4, names: [["nums", "L"]], objects: [list("L", 1)], note: "nums refers to a one-element list." },
      { py: 5, js: 5, names: [["nums", "L"], ["lst (in f)", "L"]], objects: [list("L", 1)], note: "Calling f(nums) binds the parameter lst to the same object — the reference is passed by value." },
      { py: 1, js: 1, names: [["nums", "L"], ["lst (in f)", "L"]], objects: [list("L", 1, 9)], note: "Mutating through lst is visible to the caller." },
      { py: 2, js: 2, names: [["nums", "L"], ["lst (in f)", "Z"]], objects: [list("L", 1, 9), list("Z", 0)], note: "Reassigning lst only re-points the local name; nums still refers to the old list." },
      { py: 6, js: 6, names: [["nums", "L"]], objects: [list("L", 1, 9)], note: "f returned, its local name is gone, and [0] is garbage. nums is [1, 9]." },
    ],
  },
  {
    id: "nested",
    title: "The [row] * n trap",
    python: ["row = [0, 0]", "grid = [row] * 2", "grid[0][0] = 1", "print(grid)   # [[1, 0], [1, 0]]", "grid = [[0] * 2 for _ in range(2)]"],
    javascript: ["const row = [0, 0];", "let grid = Array(2).fill(row);", "grid[0][0] = 1;", "console.log(grid); // [[1,0],[1,0]]", "grid = Array.from({ length: 2 }, () => [0, 0]);"],
    steps: [
      { py: 0, js: 0, names: [["row", "R"]], objects: [list("R", 0, 0)], note: "One row object." },
      { py: 1, js: 1, names: [["row", "R"], ["grid", "G"]], objects: [list("G", { ref: "R" }, { ref: "R" }), list("R", 0, 0)], note: "Repeating a list copies the reference twice: both slots of grid point to the same row." },
      { py: 2, js: 2, names: [["row", "R"], ["grid", "G"]], objects: [list("G", { ref: "R" }, { ref: "R" }), list("R", 1, 0)], note: "Writing grid[0][0] changes the shared row…" },
      { py: 3, js: 3, names: [["row", "R"], ["grid", "G"]], objects: [list("G", { ref: "R" }, { ref: "R" }), list("R", 1, 0)], note: "…so grid[1][0] is 1 too. A classic bug when building a DP table." },
      { py: 4, js: 4, names: [["row", "R"], ["grid", "H"]], objects: [list("H", { ref: "A" }, { ref: "B" }), list("A", 0, 0), list("B", 0, 0), list("R", 1, 0)], note: "Build each row separately (a comprehension or Array.from with a function) to get independent rows." },
    ],
  },
];
