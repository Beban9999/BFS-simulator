## Explanation
A plain preorder list doesn't determine a tree's shape — `[1, 2]` could have 2 as the left or the right child. Writing an explicit marker (`#`) for every **missing child** fixes that: now every node is followed by exactly the tokens of its left subtree and then its right subtree.

**Serialize**: preorder walk; write the value for a node, `#` for `None`.
**Deserialize**: read tokens in the same order with a recursive builder. A `#` means "no subtree here, return None". A number creates a node, then the builder recursively reads its left subtree and then its right subtree — consuming exactly the tokens the serializer wrote for them.

A tree with n nodes produces n values and n + 1 markers (one per empty child slot).

**Invariant:** when `build()` is called, the next unread token is the first token of the subtree it must return.

## Complexity
| | Time | Space |
|---|---|---|
| Serialize / deserialize | O(n) | O(n) string + O(h) recursion |

## When to use
- Storing or sending trees (files, network, caches), deep-copying them, or using them as hash keys.
- Comparing subtrees by shape and values (duplicate subtrees, subtree of another tree).
- Level order with "null" (LeetCode's own format) works the same way with a queue instead of recursion.

## Pitfalls
- Omitting the null markers: the shape is lost.
- Reading with the wrong traversal (e.g. serializing preorder, deserializing level order).
- Multi-digit and negative numbers need a separator (`,`) — don't serialize as one character per node.
- Very deep trees can overflow the recursion; an explicit stack or level order avoids it.

## Template
```python
def ser(root):
    return "#" if not root else f"{root.val},{ser(root.left)},{ser(root.right)}"

def de(data):
    it = iter(data.split(","))
    def b():
        t = next(it)
        return None if t == "#" else TreeNode(int(t), b(), b())
    return b()
```
