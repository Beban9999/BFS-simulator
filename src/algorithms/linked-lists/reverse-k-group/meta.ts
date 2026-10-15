import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "reverse-k-group",
  title: "Reverse Nodes in k-Group",
  category: "linked-lists",
  subcategory: "Reversal",
  difficulty: "advanced",
  order: 3,
  summary: "Reverse the list k nodes at a time with a dummy head and a group_prev anchor; a short tail stays as it is.",
  keywords: ["reverse k group", "dummy node", "group reversal", "sublist reversal"],
  problems: [
    { id: 25, title: "Reverse Nodes in k-Group", difficulty: "Hard", slug: "reverse-nodes-in-k-group", note: "Exactly this: count k ahead, reverse the block, stitch it back, repeat." },
    { id: 24, title: "Swap Nodes in Pairs", difficulty: "Medium", slug: "swap-nodes-in-pairs", note: "The k = 2 special case." },
    { id: 92, title: "Reverse Linked List II", difficulty: "Medium", slug: "reverse-linked-list-ii", note: "A single group between two positions, stitched with the same anchor trick." },
    { id: 2074, title: "Reverse Nodes in Even Length Groups", difficulty: "Medium", slug: "reverse-nodes-in-even-length-groups", note: "Group sizes grow 1, 2, 3…; reverse only the groups whose actual length is even." },
  ],
};

export default meta;
