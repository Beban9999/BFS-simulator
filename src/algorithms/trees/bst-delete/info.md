## Explanation
First find the node, walking left or right like a search. The recursive version returns the (possibly new) root of each subtree, and every parent re-attaches whatever its child call returned — that is how the tree gets re-wired without parent pointers.

Once found, there are three cases:
1. **No children (leaf)** — return `None`; the parent simply loses that child.
2. **One child** — return that child: it slides up into the deleted node's place. Everything in its subtree is still on the correct side of every ancestor.
3. **Two children** — the node can't just disappear. Its **inorder successor** (the smallest value in its right subtree: go right once, then left as far as possible) is the value that keeps the order intact if moved here. Copy the successor's value into the node, then delete the successor from the right subtree — it has no left child, so that deletion is case 1 or 2.

**Invariant:** each call returns a valid BST containing exactly the keys of its input subtree, minus `key`.

## Complexity
| | Average | Worst |
|---|---|---|
| Delete | O(log n) | O(n) (degenerate tree) |

Time O(h), space O(h) for the recursion.

## When to use
- Ordered sets / maps that need removals.
- The successor (or predecessor) trick appears in every BST variant: AVL, red-black, treaps.

## Pitfalls
- Forgetting to re-attach the returned subtree (`root.left = delete(...)`).
- In case 3, deleting the successor from the whole tree instead of the right subtree — or searching for the wrong value after copying.
- Using the predecessor (max of the left subtree) is equally valid; just be consistent.

## Template
```python
def delete(root, key):
    if not root: return None
    if key < root.val: root.left = delete(root.left, key)
    elif key > root.val: root.right = delete(root.right, key)
    else:
        if not root.left: return root.right
        if not root.right: return root.left
        s = root.right
        while s.left: s = s.left
        root.val = s.val
        root.right = delete(root.right, s.val)
    return root
```
