import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "backtracking-template",
  title: "The Backtracking Template",
  category: "backtracking",
  subcategory: "Template",
  difficulty: "core",
  order: 0,
  kind: "note",
  summary: "One recursive shape solves every page in this tab: check the goal, loop over choices, prune, choose, explore, un-choose. Learn which three blanks each problem fills in.",
  keywords: ["template", "choose explore unchoose", "backtracking pattern", "decision tree", "pruning", "dfs"],
  problems: [
    { id: 46, title: "Permutations", difficulty: "Medium", slug: "permutations", note: "Choices = unused numbers; goal = path as long as the input." },
    { id: 39, title: "Combination Sum", difficulty: "Medium", slug: "combination-sum", note: "State carries the remaining target; recurse on the same index to allow reuse." },
    { id: 22, title: "Generate Parentheses", difficulty: "Medium", slug: "generate-parentheses", note: "Two choices per slot, both guarded by counts; no data structure to undo besides the string." },
    { id: 51, title: "N-Queens", difficulty: "Hard", slug: "n-queens", note: "One row per level; three sets make the validity check O(1) and must be undone on return." },
    { id: 79, title: "Word Search", difficulty: "Medium", slug: "word-search", note: "The grid itself is the state: mark a cell on the way in, restore it on the way out." },
  ],
};

export default meta;
