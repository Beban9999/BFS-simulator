## Explanation
For every day, how many days until a warmer one? Checking every later day is O(n²). The monotonic stack does it in one pass by keeping the days that are **still waiting** for an answer.

Those waiting days always have **non-increasing** temperatures from bottom to top: if a warmer day had come after a colder one, the colder one would already have its answer. So when day `i` arrives, compare it with the top: while the top day is colder, day `i` is the first warmer day for it — pop it and write `answer[j] = i - j`. Then push `i`, which now waits too. Days still on the stack at the end never get a warmer day, so their answer stays 0.

Each index is pushed once and popped at most once, so the nested `while` is O(n) in total.

**Invariant:** the stack holds the indexes without an answer yet, with non-increasing temperatures from bottom to top (equal days don't pop each other, because only a strictly warmer day counts).

The same idea with a **deque**, where old indexes also leave from the front, is the monotonic queue — see [Sliding Window Maximum](#/two-pointers/sliding-window-max).

## Complexity
| | Time | Space |
|---|---|---|
| Monotonic stack | O(n) amortized — ≤ n pushes and ≤ n pops | O(n) |
| Brute force | O(n²) | O(1) |

## When to use
- "Next / previous greater (or smaller) element" for every position.
- Spans and distances to the next bigger / smaller value (stock span, daily temperatures).
- Ranges where a value is the minimum or maximum: largest rectangle, sum of subarray minimums, trapping rain water.
- Decreasing stack → next *greater*; increasing stack → next *smaller*.

## Pitfalls
- Store **indexes**, not values — you need positions for distances (and values are reachable through the index).
- `<` vs `<=` decides how equal values are treated (strictly warmer vs. warmer-or-equal).
- Forgetting the elements left on the stack at the end (they keep the default answer).
- It is O(n) even though there is a loop inside a loop — count the pushes and pops to see why.

## Template
```python
def next_greater(nums):
    ans, st = [-1] * len(nums), []
    for i, x in enumerate(nums):
        while st and nums[st[-1]] < x:
            ans[st.pop()] = x
        st.append(i)
    return ans
```
