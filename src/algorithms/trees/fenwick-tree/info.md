## Explanation
A Fenwick tree supports the same two operations as a sum segment tree — prefix/range sums and point updates in O(log n) — with one array and a few lines of code.

The trick is `lowbit(i) = i & -i`, the value of i's lowest set bit (1-based i). `tree[i]` stores the sum of the **block** of `lowbit(i)` elements ending at i: `tree[6]` covers positions 5–6, `tree[8]` covers 1–8, `tree[7]` covers just 7.

- **prefix(i)**: add `tree[i]`, then jump to `i − lowbit(i)` — the block just before it — until reaching 0. Each jump removes one set bit, so at most log₂ n jumps. In the drawing, each node's parent is `i − lowbit(i)`, so a prefix query is a walk up to the root.
- **add(i, δ)**: every block containing i must change: start at i and jump to `i + lowbit(i)` (the next larger block that also covers i) until past n.
- **range(l, r)** = prefix(r) − prefix(l − 1).

**Invariant:** `tree[i] = nums[i − lowbit(i) + 1] + … + nums[i]` (1-based), for every i.

## Complexity
| Operation | Time |
|---|---|
| add (point update) | O(log n) |
| prefix / range sum | O(log n) |
| build by n adds | O(n log n) (an O(n) build exists) |

Space: n + 1 numbers.

## When to use
- Prefix sums with updates; counting inversions or "how many smaller seen so far" over compressed values.
- When a segment tree would work but you only need sums (or another invertible operation) — less code, smaller constant.
- Not for range min/max with arbitrary updates (min isn't invertible) — use a segment tree.

## Pitfalls
- Fenwick trees are **1-indexed** inside; shift indexes by one.
- Mixing up the two jumps: update goes **up** (`i += i & -i`), query goes **down** (`i -= i & -i`).
- `add` takes a delta; to *set* a value, add `new − old`.

## Template
```python
def add(i, d):
    i += 1
    while i <= n: tree[i] += d; i += i & -i
def prefix(i):
    i += 1; s = 0
    while i > 0: s += tree[i]; i -= i & -i
    return s
```
