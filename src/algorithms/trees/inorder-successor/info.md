## Explanation
The inorder successor of p is the smallest value in the tree that is strictly greater than p — the value an inorder traversal visits right after p. You don't need a traversal to find it: walk down from the root like a search.

- If `node.val > p`, this node could be the successor, but a smaller candidate may exist in its left subtree. Remember it and go **left**.
- Otherwise (`node.val <= p`), this node and its whole left subtree are too small. Go **right**.

When the walk falls off the tree, the last remembered candidate is the answer (or None if p is the largest value). The same idea finds the predecessor (largest value < p), and floor / ceiling of any query value — p doesn't even have to be in the tree.

**Invariant:** `succ` is the smallest value > p among the nodes visited so far, and the true successor is either `succ` or inside the current node's subtree.

## Complexity
| | Time | Space |
|---|---|---|
| Walk from the root | O(h) | O(1) |
| Full inorder traversal | O(n) | O(h) |

## When to use
- Next / previous key, ceiling / floor, "smallest value ≥ x" on a BST or ordered map.
- Range queries: start at the ceiling of the lower bound and follow successors.

## Pitfalls
- Going left when `node.val == p` — an equal value is not a successor.
- Returning `node` after the loop (it is None) instead of the remembered candidate.
- With parent pointers the usual recipe is different: leftmost node of p's right subtree, else the first ancestor reached from a left child.

## Template
```python
def ceiling_strict(root, p):
    best = None
    while root:
        if root.val > p:
            best, root = root, root.left
        else:
            root = root.right
    return best
```
