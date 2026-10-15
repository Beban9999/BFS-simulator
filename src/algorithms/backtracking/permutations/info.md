## Explanation
A permutation fills positions one at a time. At depth `d`, any element that is not yet in the path may take position `d`, so the loop runs over **all** indexes (not from a `start` index, as in subsets), and a `used[]` array remembers what is taken. When the path holds all n elements, it is a complete permutation and is recorded. The tree has n choices at the first level, n − 1 at the next, and so on: n! leaves.

**Duplicates.** With `[1, 1, 2]` the two 1s are interchangeable, so swapping them would produce every permutation twice. After sorting, the rule "skip `nums[i]` if it equals `nums[i-1]` and `nums[i-1]` is **not** in use" forces equal values to be used in their original left-to-right order. Only one of the equivalent branches survives; the others are drawn greyed out.

**Invariant:** `used[i]` is true exactly for the indexes in `path`, and among equal values only a prefix (leftmost first) is ever in use.

## Complexity
| | Time | Space |
|---|---|---|
| n distinct elements | O(n · n!) | O(n) recursion + used (output excluded) |

## When to use
- "All orderings / arrangements / schedules" with small n (≤ 8–10).
- Search with constraints on positions (beautiful arrangement, N-Queens is a permutation of columns).
- The next-permutation algorithm is better if you only need to step through them in order.

## Pitfalls
- Record a **copy** of `path`.
- The duplicate rule needs sorted input; the condition is `not used[i-1]` (the other choice, `used[i-1]`, also works but prunes much later).
- Swapping-in-place versions are shorter but don't keep lexicographic order and need a set per level for duplicates.
- n! grows fast: 10! = 3.6 million.

## Template
```python
def permute(nums):
    nums.sort()
    res, path, used = [], [], [False] * len(nums)
    def bt():
        if len(path) == len(nums):
            res.append(path[:]); return
        for i, x in enumerate(nums):
            if used[i] or (i and x == nums[i - 1] and not used[i - 1]):
                continue
            used[i] = True; path.append(x)
            bt()
            path.pop(); used[i] = False
    bt()
    return res
```
