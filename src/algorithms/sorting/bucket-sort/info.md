## Explanation
Bucket sort divides the **value range** into `k` equal slices (buckets). Each value goes straight into the bucket for its slice — `x * k // hi` — with no comparisons. Because buckets cover increasing ranges, every value in bucket 0 is smaller than every value in bucket 1, and so on. Sorting each (small) bucket and concatenating them gives the sorted array.

It shines when values are **spread evenly**: then each bucket holds about n/k values, and sorting n tiny buckets is cheap. When the values cluster, one bucket gets almost everything and the algorithm degrades to whatever sort runs inside that bucket (try the "Clustered values" preset).

**Invariant:** after scattering, every value in bucket `b` lies in `[b·hi/k, (b+1)·hi/k)`, so buckets are ordered relative to each other.

## Complexity
| Case | Time | Space |
|---|---|---|
| Average (uniform values, k ≈ n) | O(n + k) | O(n + k) |
| Worst (all values in one bucket) | cost of the inner sort: O(n²) with insertion sort, O(n log n) with a library sort | O(n + k) |

Stable if the inner sort is stable and values are appended in input order.

## When to use
- Values are roughly uniformly distributed over a known range (e.g. floats in [0, 1)).
- **Frequency buckets**: index = how many times something occurs. Since a frequency is at most n, this gives O(n) "top-k frequent" solutions.
- "Pigeonhole" arguments: n − 1 buckets over n values guarantee an empty bucket or a gap that crosses buckets (Maximum Gap).

## Pitfalls
- The index formula must map the maximum value to bucket `k − 1`, not `k`: use an exclusive upper bound (`max + 1`) or clamp.
- Skewed data destroys the average-case guarantee.
- Too many buckets wastes memory on empty lists; too few makes each bucket large.

## Template
```python
hi = max(a) + 1
buckets = [[] for _ in range(k)]
for x in a: buckets[x * k // hi].append(x)
out = [x for b in buckets for x in sorted(b)]
```
