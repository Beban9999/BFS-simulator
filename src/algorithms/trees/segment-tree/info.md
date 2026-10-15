## Explanation
A prefix-sum array answers range sums in O(1) but needs O(n) per update. A **segment tree** balances both at O(log n). It is a binary tree over index ranges: the root covers `[0, n−1]`, each node splits its range in half for its two children, and each leaf covers a single index. Every node stores the **sum** of its range (min, max, gcd… work the same way).

- **query(l, r)**: starting at the root, a node whose range doesn't overlap `[l, r]` contributes 0; a node fully inside `[l, r]` contributes its stored sum without going deeper; a partial overlap asks both children. At most about 4 nodes per level are visited.
- **update(i, val)**: walk down to the leaf for index i, set it, and recompute the sums on the way back up — one root-to-leaf path.

Nodes are stored in an array like a heap: node k has children 2k and 2k+1 (size 4n is always enough).

**Invariant:** every node's stored value equals the sum of `nums` over its range.

## Complexity
| Operation | Time |
|---|---|
| build | O(n) |
| range query | O(log n) |
| point update | O(log n) |
| range update with lazy propagation | O(log n) |

Space O(n) (4n array). **Lazy propagation** (not animated here) postpones range updates by storing "pending adds" at covered nodes and pushing them down only when needed.

## When to use
- Many interleaved range queries and updates (sums, min/max, gcd, counts).
- Range queries over *values* (coordinate-compress, then count / max by value).
- For sums with point updates only, a Fenwick tree is shorter; for static data, prefix sums or a sparse table are simpler.

## Pitfalls
- Off-by-one in the overlap tests (`r < lo or hi < l` means no overlap).
- Allocating only 2n for the recursive layout (use 4n).
- Forgetting to recompute parent sums after an update.

## Template
```python
def query(k, lo, hi, l, r):
    if r < lo or hi < l: return 0
    if l <= lo and hi <= r: return tree[k]
    m = (lo + hi) // 2
    return query(2*k, lo, m, l, r) + query(2*k+1, m+1, hi, l, r)
```
