## Explanation
Recursion keeps "what to come back to" on the call stack. An explicit stack does the same job without recursion limits:

- **Preorder**: pop a node, record it, push its right child then its left child. Left is on top, so it is processed first — node, left, right.
- **Inorder**: from the current node, push every node down the **left spine**. The top of the stack is now the leftmost unvisited node: pop it, record it, then continue from its right child (and slide down that subtree's left spine).
- **Postorder**: run preorder with the children swapped (node, right, left) and **reverse** the result — giving left, right, node.

**Invariant (inorder):** every node on the stack has been reached but not yet recorded, and everything in its left subtree is already recorded.

## Complexity
| | Time | Space |
|---|---|---|
| All three | O(n) | O(h) stack (postorder as shown: O(n) for the output it reverses) |

## When to use
- Very deep or skewed trees where recursion would overflow.
- Iterators that produce one node at a time (BST iterator, merging two BSTs in sorted order).
- Interviews that ask for "no recursion".

## Pitfalls
- Preorder: push the **right** child before the left one.
- Inorder: the loop condition is `cur or stack`, not just `stack`.
- The reversed-preorder trick builds the whole output before reversing; a true streaming postorder needs a "last visited" pointer.

## Template
```python
def inorder(root):
    st, cur = [], root
    while cur or st:
        while cur:
            st.append(cur); cur = cur.left
        cur = st.pop()
        yield cur.val
        cur = cur.right
```
