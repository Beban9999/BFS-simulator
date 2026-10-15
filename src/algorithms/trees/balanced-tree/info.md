## Explanation
A binary tree is **height-balanced** when, at every node, the heights of the left and right subtrees differ by at most 1. Checking that separately at each node and recomputing heights each time costs O(n²) on a skewed tree.

Instead, compute heights bottom-up once, and let the height function return a **sentinel** `-1` meaning "this subtree is already unbalanced". A node returns -1 if either child returned -1 or if its two heights differ by more than 1; otherwise it returns its real height. The -1 travels straight up to the root, and the left check even skips exploring the right subtree.

**Invariant:** `height(x)` returns the height of x's subtree if that subtree is balanced, and -1 otherwise.

## Complexity
| | Time | Space |
|---|---|---|
| Single pass with sentinel | O(n) | O(h) |
| Height recomputed per node | O(n²) worst, O(n log n) balanced | O(h) |

## When to use
- Validating a property that must hold at **every** node and depends on child summaries.
- Returning "value or failure" from a recursion without extra fields (sentinel, `None`, or a tuple).
- AVL trees keep exactly this invariant after every insert/delete (see AVL rotations).

## Pitfalls
- Checking only the root's children — imbalance can hide deeper down.
- Forgetting to propagate -1 from the **right** child too.
- Balanced ≠ complete ≠ full: a balanced tree can have gaps.

## Template
```python
def balanced(root):
    def h(n):
        if not n: return 0
        l = h(n.left)
        if l < 0: return -1
        r = h(n.right)
        if r < 0 or abs(l - r) > 1: return -1
        return 1 + max(l, r)
    return h(root) >= 0
```
