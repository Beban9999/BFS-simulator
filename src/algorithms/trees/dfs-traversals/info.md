## Explanation
A depth-first traversal visits a node and its two subtrees. The three classic orders are the *same* recursion; they differ only in **when** the node itself is recorded:

- **Preorder** — node, left subtree, right subtree. Parents come before children: copying / serializing a tree, prefix expressions.
- **Inorder** — left subtree, node, right subtree. On a binary search tree this lists the values in **sorted** order.
- **Postorder** — left subtree, right subtree, node. Children come before parents: deleting a tree, evaluating expression trees, any bottom-up computation (height, sizes, sums).

Every call waits on the call stack while its children are explored, so the stack depth equals the depth of the current node. Calls on `None` return immediately — they are the base case.

**Invariant:** when `dfs(node)` returns, every node in its subtree has been recorded exactly once, in the chosen order.

## Complexity
| | Time | Space |
|---|---|---|
| Recursive DFS | O(n) — every node once (+ one call per missing child) | O(h) call stack, h = height (O(n) for a degenerate chain, O(log n) when balanced) |

## When to use
- Pre: build/copy/serialize a tree top-down; pass information from parent to child (paths, depths).
- In: anything about sorted order in a BST (validate, k-th smallest, successor).
- Post: compute a value for each subtree from its children (height, diameter, balanced, sums).

## Pitfalls
- Forgetting the `None` base case.
- Deep, skewed trees can overflow the recursion limit (Python ≈ 1000) — use the iterative versions.
- Appending to a shared list is fine; building new lists in every call (`dfs(l) + [v] + dfs(r)`) is O(n²) on a chain.

## Template
```python
def dfs(node):
    if not node:
        return
    # preorder work
    dfs(node.left)
    # inorder work
    dfs(node.right)
    # postorder work
```
