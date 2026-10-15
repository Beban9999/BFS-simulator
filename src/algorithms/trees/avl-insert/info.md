## Explanation
A plain BST degrades to a chain on sorted input. An **AVL tree** keeps every node's **balance factor** — height(left) − height(right) — in {−1, 0, +1}, which bounds the height by about 1.44·log₂ n.

Insert as in a BST (the new key becomes a leaf). Then, on the way back up the recursion, recompute each node's height and balance factor. The first node that reaches ±2 is fixed by **rotations**, which re-hang three nodes (and their subtrees) without breaking the BST order:

- **LL** (too heavy on the left, new key went into the left child's left side): one **right rotation**.
- **RR** (mirror): one **left rotation**.
- **LR** (left-heavy, but the key went into the left child's *right* side): rotate the child left first (turning it into LL), then rotate the node right.
- **RL** (mirror): rotate the child right, then the node left.

After one fix the subtree is back to its old height, so ancestors further up stay balanced.

**Invariant:** after `insert(node, key)` returns, the returned subtree is a valid AVL tree (BST order holds and every balance factor is in {−1, 0, 1}).

## Complexity
| Operation | Time |
|---|---|
| Search / insert / delete | O(log n) worst case |
| Rotations per insert | at most 2 (one single or one double rotation) |

Space: one height per node, O(log n) recursion.

## When to use
- Ordered maps/sets with guaranteed O(log n) worst case — especially read-heavy workloads (AVL is more strictly balanced than red-black, so lookups are slightly faster).
- Understanding rotations, which every balanced BST (red-black, treaps, splay trees) uses.

## Pitfalls
- Update heights bottom-up *before* computing the balance factor.
- Telling LL from LR: compare the inserted key with the **child's** key (or check the child's balance factor).
- After a rotation, recompute the lower node's height first, then the new subtree root's.
- Forgetting to return the new subtree root so the parent re-links it.

## Template
```python
def rotate_right(y):
    x = y.left
    y.left, x.right = x.right, y
    fix_height(y); fix_height(x)
    return x
```
