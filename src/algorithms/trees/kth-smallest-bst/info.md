## Explanation
Inorder traversal (left, node, right) of a binary search tree visits the values in **increasing** order. So the k-th smallest value is simply the k-th node an inorder traversal visits.

The iterative version (an explicit stack) can stop the moment it has popped k nodes. Before each pop it slides down the left spine, pushing nodes — the smallest unvisited value is always at the bottom of that spine. After a pop, it continues with the popped node's right subtree, which holds the next larger values.

**Invariant:** after the i-th pop, the popped values are the i smallest in the tree, and the stack holds the ancestors whose values are still to come.

## Complexity
| | Time | Space |
|---|---|---|
| Iterative inorder with early stop | O(h + k) | O(h) |
| Full traversal into a list | O(n) | O(n) |
| Augmented tree (subtree sizes), repeated queries | O(h) per query | O(n) extra counts |

## When to use
- Rank / order-statistic questions on a BST: k-th smallest or largest (reverse inorder), median.
- Anything that needs BST values "in sorted order" without building the whole list.

## Pitfalls
- k is 1-based.
- A recursive version needs a way to stop early (a counter + flag), or it visits all n nodes.
- For many queries on a changing tree, store subtree sizes and descend by rank instead.

## Template
```python
def kth_smallest(root, k):
    st, node = [], root
    while True:
        while node:
            st.append(node); node = node.left
        node = st.pop()
        k -= 1
        if k == 0: return node.val
        node = node.right
```
