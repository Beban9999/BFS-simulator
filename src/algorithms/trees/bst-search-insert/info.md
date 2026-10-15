## Explanation
A **binary search tree** keeps everything smaller than a node in its left subtree and everything larger in its right subtree — at every node. That makes searching a walk, not a traversal: compare the target with the current node; if equal you're done, if smaller go left, if larger go right. Each step discards an entire subtree, like binary search on a sorted array.

**Insert** walks exactly the same way until the next step would leave the tree. That empty spot is the only place where the new value keeps the ordering rule, so the new node is attached there as a leaf. Nothing else moves.

**Invariant:** the target (or the new value) can only be in the subtree of the current node; everything already discarded is on the wrong side of some ancestor.

## Complexity
| | Average (random inserts) | Worst (sorted inserts → chain) |
|---|---|---|
| Search / insert | O(log n) | O(n) |

Time is O(h), h = height. Self-balancing trees (AVL, red-black) keep h = O(log n) always. Space: O(1) iterative, O(h) recursive.

## When to use
- Ordered sets / maps where you also need floor, ceiling, successor or range queries (Python `sortedcontainers`, Java `TreeMap`, C++ `std::map`).
- Any problem that hands you a BST: use the ordering to prune instead of visiting every node.

## Pitfalls
- Inserting already-sorted data builds a chain: every operation becomes O(n).
- Decide where duplicates go (here: to the right) and be consistent.
- Search returns the **node** (or its subtree), not just a boolean, in most APIs.

## Template
```python
def insert(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root
```
