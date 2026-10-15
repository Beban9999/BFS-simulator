## Explanation
Recursive and stack-based inorder traversals need O(h) memory to remember the way back up. Morris traversal stores that "way back" **inside the tree**, in right pointers that are null anyway.

At node `cur`:
- If it has **no left subtree**, visit it and move right.
- Otherwise find its **inorder predecessor** `pred` — the rightmost node of the left subtree, the node visited just before `cur`.
  - If `pred.right` is null, this is the first time here: set `pred.right = cur` (a **thread**) and go left. Later, after the left subtree is finished, following `pred.right` lands back on `cur`.
  - If `pred.right` already points to `cur`, we just came back up through the thread: the left subtree is done. Remove the thread (restoring the tree), visit `cur`, and move right.

Every thread is created once and removed once, so the tree is unchanged at the end.

**Invariant:** each node with a left subtree is reached exactly twice — first to create its predecessor's thread, then via that thread to visit it.

## Complexity
| | Time | Extra space |
|---|---|---|
| Morris | O(n) — each edge walked at most a few times while searching predecessors | O(1) |
| Recursive / stack | O(n) | O(h) |

## When to use
- Inorder traversal with strictly O(1) extra memory (an interview follow-up).
- Streaming over a huge BST where an O(h) stack is not acceptable.

## Pitfalls
- The predecessor loop must stop at `pred.right is cur`, or it runs around the thread forever.
- Forgetting to remove threads leaves the tree modified (and cyclic).
- Not safe if other threads read the tree concurrently — it is temporarily changed.

## Template
```python
def morris(root):
    cur = root
    while cur:
        if not cur.left:
            yield cur.val; cur = cur.right
        else:
            p = cur.left
            while p.right and p.right is not cur: p = p.right
            if not p.right: p.right, cur = cur, cur.left
            else: p.right = None; yield cur.val; cur = cur.right
```
