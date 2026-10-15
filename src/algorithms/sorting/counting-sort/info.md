## Explanation
When the values are small non-negative integers (say 0..k−1), you don't need to compare them at all. Counting sort works in three passes:

1. **Count** — build a histogram: `count[v]` = how many times `v` occurs.
2. **Prefix sum** — turn counts into positions: afterwards `count[v]` = how many values are ≤ `v`, i.e. one past the last slot where a `v` belongs in the output.
3. **Place** — walk the input **from right to left**; for each `x`, decrement `count[x]` and write `x` there.

Walking right to left fills each value's slots from the back, so equal values keep their original relative order — the sort is **stable**. That stability is what makes counting sort usable as the per-digit step of radix sort.

(If you only need the sorted numbers and not stability, you can simply emit each value `count[v]` times after step 1.)

**Invariant:** during placement, `count[v]` is the index just past the slots still free for value `v`.

## Complexity
| | Time | Space |
|---|---|---|
| All cases | O(n + k) | O(n + k) |

`k` is the size of the value range. It beats O(n log n) sorts when `k` is O(n); it is useless when the range is huge (e.g. 32-bit integers) — use radix sort instead.

## When to use
- Values are integers from a small known range: ages, grades, heights, letters (`k = 26`), digits.
- "How many elements are smaller than x?" — that's exactly the prefix-sum array.
- As the stable inner loop of radix sort.

## Pitfalls
- Negative numbers: shift by the minimum (`count[x − min]`).
- Placing left to right (or decrementing after writing) breaks stability or shifts every value by one.
- Memory grows with the value range, not the number of elements.

## Template
```python
count = [0] * k
for x in a: count[x] += 1
for v in range(1, k): count[v] += count[v - 1]
out = [0] * len(a)
for x in reversed(a):
    count[x] -= 1; out[count[x]] = x
```
