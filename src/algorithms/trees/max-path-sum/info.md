## Explanation
A path may start and end anywhere, and node values can be negative. Like the diameter, every path has a highest node where it **bends**, using a downward arm into the left subtree, the node itself, and a downward arm into the right subtree.

Let `gain(x)` be the best sum of a path that starts at x and goes **down** (through at most one child). Then:
- each child's gain is clamped at 0 — if an arm only loses value, don't take it;
- the best path bending at x is `x.val + left + right` → update the global best;
- x reports `x.val + max(left, right)` to its parent, because a path continuing upward can't take both arms.

The global best starts at −∞ so a tree of only negative numbers returns its largest single value.

**Invariant:** `gain(x)` is the maximum sum of a downward path starting at x (at least x itself), and `best` covers every path whose top is in an already-finished subtree.

## Complexity
| | Time | Space |
|---|---|---|
| One postorder pass | O(n) | O(h) |

## When to use
- Best-scoring path anywhere in a tree, with values that can be negative.
- Any "answer bends at a node, parent gets one arm" problem (diameter, univalue path, longest special path).

## Pitfalls
- Initialising `best` to 0 gives a wrong answer when all values are negative.
- Clamping the arms (`max(gain, 0)`), not the node value: a negative node is still part of any path through it.
- Returning `node.val + left + right` to the parent creates a path that forks.

## Template
```python
def max_path_sum(root):
    best = float("-inf")
    def gain(n):
        nonlocal best
        if not n: return 0
        l, r = max(gain(n.left), 0), max(gain(n.right), 0)
        best = max(best, n.val + l + r)
        return n.val + max(l, r)
    gain(root)
    return best
```
