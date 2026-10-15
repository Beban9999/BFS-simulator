## Explanation
Two traversals of the same tree (with distinct values) pin it down exactly:
- **Preorder** lists a root before everything in its subtrees — so the first value is the root.
- **Inorder** lists the left subtree, then the root, then the right subtree — so once you know the root's position `mid`, everything left of it is the left subtree and everything right of it is the right subtree.

`build(lo, hi)` builds the subtree whose values are `inorder[lo..hi]`. It takes the next preorder value as the root, looks up its inorder position with a hash map, and recurses on `[lo, mid−1]` and then `[mid+1, hi]`. Building the left subtree first matters: preorder lists the whole left subtree before the right one, so a single shared preorder pointer hands out roots in exactly the right order.

**Invariant:** when `build(lo, hi)` starts, the next preorder value is the root of the subtree made of `inorder[lo..hi]`.

## Complexity
| | Time | Space |
|---|---|---|
| Hash map for positions | O(n) | O(n) map + O(h) recursion |
| Linear search for mid | O(n²) worst | O(h) |

## When to use
- Rebuilding a tree from traversals (serialization formats, compiler parse trees).
- Divide and conquer where one sequence gives the splitting element and another gives the split position.

## Pitfalls
- Values must be distinct, or the inorder position is ambiguous.
- Recursing on the right half before the left breaks the shared preorder pointer.
- Slicing arrays in every call (`preorder[1:mid+1]`) works but costs O(n²) time and memory.
- Preorder + postorder alone does not determine a tree uniquely.

## Template
```python
def build(pre, ino):
    idx = {v: i for i, v in enumerate(ino)}
    it = iter(pre)
    def go(lo, hi):
        if lo > hi: return None
        v = next(it); m = idx[v]
        return TreeNode(v, go(lo, m - 1), go(m + 1, hi))
    return go(0, len(ino) - 1)
```
