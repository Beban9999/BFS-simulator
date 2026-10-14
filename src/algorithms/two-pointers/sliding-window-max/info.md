## Explanation
A running sum can be slid with one addition and one subtraction, but a running **maximum** can't: when the max leaves the window you'd need the second-largest, then the third… A **monotonic deque** stores exactly the candidates that could still become the maximum.

Keep indexes in the deque with **decreasing** values:

- Before pushing index `i`, pop from the back every index whose value is `≤ nums[i]`. Those elements are older *and* not larger, so while `i` is in the window they can never be the max.
- If the front index has slid out of the window (`≤ i − k`), pop it from the front.
- The front now holds the index of the window's maximum.

Each index is pushed once and popped at most once, so the whole pass is O(n).

**Invariant:** the deque's indexes are increasing, their values strictly decreasing, and all lie inside the current window.

## Complexity
| | Time | Space |
|---|---|---|
| Monotonic deque | O(n) amortised | O(k) |
| Max-heap with lazy deletion | O(n log n) | O(n) |
| Rescan each window | O(n · k) | O(1) |

## When to use
- Max / min over every window of a fixed or moving range.
- DP transitions of the form `dp[i] = best(dp[i−k..i−1]) + …` (Jump Game VI, constrained subsequence sum).
- Any "next greater / previous smaller" structure that also needs expiry by position (otherwise a monotonic stack is enough).

## Pitfalls
- Store **indexes**, not values — you need them to detect expired elements.
- Using `<` instead of `<=` when popping keeps duplicates; still correct, but the deque grows.
- In JavaScript, `Array.prototype.shift()` is O(n); use a head index or a real deque.

## Template
```python
dq = deque()
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x: dq.pop()
    dq.append(i)
    if dq[0] <= i - k: dq.popleft()
    if i >= k - 1: out.append(a[dq[0]])
```
