## Explanation
The BST rule is about whole subtrees, not just parents and children: *every* value in a node's left subtree must be smaller than the node, and *every* value in its right subtree larger. A node can be fine relative to its parent and still break the rule for its grandparent — e.g. a 6 in the left subtree of a 5, placed as the right child of a 3.

So each call carries the open interval `(low, high)` its value must fall into. The root may be anything: (−∞, ∞). Going left, the node's value becomes the new upper bound; going right, it becomes the new lower bound. The numbers under the nodes show each node's allowed range.

An equivalent check: an inorder traversal of a valid BST is strictly increasing.

**Invariant:** `valid(node, low, high)` is True exactly when the subtree at node is a BST whose values all lie strictly between low and high.

## Complexity
| | Time | Space |
|---|---|---|
| Bounds recursion | O(n) | O(h) |
| Inorder, compare with previous | O(n) | O(h) |

## When to use
- Verifying the BST property, or any constraint inherited from all ancestors (ranges, depths, budgets).
- Subproblems that need "the bounds of the subtree I'm in" (construct BST from preorder in O(n)).

## Pitfalls
- Only comparing with the direct parent.
- Using `<=` / `>=` when the problem forbids duplicates (or vice versa).
- Sentinels like `INT_MIN` / `INT_MAX` fail when node values can equal them — use `None` or ±∞.

## Template
```python
def valid(node, lo=float("-inf"), hi=float("inf")):
    if not node: return True
    if not lo < node.val < hi: return False
    return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)
```
