## Explanation
The **lowest common ancestor** of p and q is the deepest node that has both of them in its subtree (a node counts as its own ancestor).

**In a BST**, the values steer you. Starting at the root: if p and q are both smaller than the node, both live in the left subtree — go left. If both are bigger, go right. Otherwise they are on different sides (or one of them *is* the node), so this is the split point: the LCA. O(h), no recursion needed.

**In a general binary tree** there is no ordering, so ask the subtrees. `lca(node)` returns p or q if it finds one of them, or None. A node that is p or q returns itself immediately. Otherwise, if the left and right calls *both* found something, p and q are on different sides and this node is the LCA; if only one side found something, pass that result up.

**Invariant (binary tree):** `lca(node)` returns the LCA if both p and q are in node's subtree, the one that is present if only one is, and None if neither.

## Complexity
| | Time | Space |
|---|---|---|
| BST walk | O(h) | O(1) |
| Binary tree recursion | O(n) | O(h) |
| Many queries (binary lifting / Euler tour + RMQ) | O(log n) or O(1) per query after O(n log n) prep | O(n log n) |

## When to use
- Distances between nodes (`depth(p) + depth(q) − 2·depth(lca)`), paths between two nodes.
- Merging / grouping hierarchies (org charts, file systems, taxonomies).

## Pitfalls
- In BST mode, checking only one value — you need both on the same side to keep walking.
- Binary-tree mode assumes both nodes exist; if they might not, count how many were actually found.
- A node is an ancestor of itself: if p is above q, the answer is p.

## Template
```python
def lca(root, p, q):
    if not root or root in (p, q): return root
    l, r = lca(root.left, p, q), lca(root.right, p, q)
    return root if l and r else l or r
```
