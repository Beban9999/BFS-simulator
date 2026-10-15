## Explanation
LSD (least-significant-digit) radix sort sorts integers **one digit at a time, starting from the ones digit**. Each pass drops every number into one of ten buckets by its current digit and then reads the buckets back in order 0…9.

Why does sorting by the *least* important digit first work? Because every pass is **stable**: numbers with the same current digit stay in the order the previous passes left them. After the tens pass, numbers are ordered by tens digit, and ties (same tens digit) are still ordered by ones digit — so they are sorted by their last two digits. After `d` passes they are sorted by all `d` digits.

**Invariant:** after the pass for digit position `p`, the numbers are sorted by their last `p + 1` digits.

## Complexity
| | Time | Space |
|---|---|---|
| All cases | O(d · (n + b)) | O(n + b) |

`d` = number of digits of the largest value, `b` = base (10 here). For fixed-width keys such as 32-bit integers (processed in base 256 = 4 passes) it is effectively linear.

## When to use
- Many integers (or fixed-length strings) with a bounded number of digits, where linear time matters (e.g. "Maximum Gap" requires O(n)).
- Sorting strings by fixed-length keys (dates as YYYYMMDD, IDs, IP addresses).
- When the value range is too large for counting sort but the digit count is small.

## Pitfalls
- Each pass **must** be stable; an unstable pass destroys the work of the previous digits.
- Negative numbers need special handling (offset them, or sort negatives separately and reverse).
- The number of passes depends on the largest value — a single huge value makes every pass process all n numbers.
- MSD (most-significant-digit first) radix sort is a different, recursive algorithm.

## Template
```python
exp = 1
while max(a) // exp:
    buckets = [[] for _ in range(10)]
    for x in a: buckets[x // exp % 10].append(x)
    a = [x for b in buckets for x in b]
    exp *= 10
```
