import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "sort-stability",
  title: "Stable vs Unstable Sorting",
  category: "sorting",
  subcategory: "In practice",
  difficulty: "core",
  order: 1,
  kind: "note",
  summary: "Sort records with equal keys using a stable and an unstable algorithm side by side, and see why stability makes multi-key sorting work.",
  keywords: ["stability", "stable sort", "equal keys", "multi-key sort", "sort by two columns", "tie order"],
  problems: [
    { id: 937, title: "Reorder Data in Log Files", difficulty: "Medium", slug: "reorder-data-in-log-files", note: "Digit logs must keep their input order: a stable sort (or an index tiebreak) does it for free." },
    { id: 1636, title: "Sort Array by Increasing Frequency", difficulty: "Easy", slug: "sort-array-by-increasing-frequency", note: "Two keys at once: frequency up, then value down — a composite sort key." },
    { id: 1366, title: "Rank Teams by Votes", difficulty: "Medium", slug: "rank-teams-by-votes", note: "Compare vote counts position by position, falling back to the letter on full ties." },
    { id: 2418, title: "Sort the People", difficulty: "Easy", slug: "sort-the-people", note: "Sort names by a parallel key array — sort indices or (key, name) pairs." },
  ],
};

export default meta;
