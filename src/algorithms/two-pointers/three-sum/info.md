## Explanation
3Sum asks for every **unique** triplet summing to zero. Sorting unlocks two tricks at once: the two-pointer pair search (Two Sum II) and easy duplicate skipping, because equal values sit next to each other.

Fix the first element `nums[i]`, then search the suffix for pairs that sum to `−nums[i]` with `left`/`right` pointers. Skip an `i` whose value equals the previous one (it would produce the same triplets), and after recording a triplet skip `left` past repeated values.

**Invariant:** for a fixed `i`, every pair outside `[left, right]` has been considered (or proven useless) and all triplets found so far are distinct.

## Complexity
| | Time | Space |
|---|---|---|
| Sort + two pointers | O(n²) | O(1)–O(n) for the sort |
| Hash set per `i` | O(n²) | O(n) |
| Brute force | O(n³) | O(1) |

## When to use
- k-Sum style questions: sort, fix `k − 2` elements, two-pointer the last two.
- Any "unique combinations" problem on sorted data: skip equal neighbours to avoid duplicates.
- Early exit: once `nums[i] > 0`, no triplet starting there can sum to zero.

## Pitfalls
- Forgetting either duplicate skip yields repeated triplets.
- Skipping duplicates with `nums[i] == nums[i + 1]` (looking forward) loses triplets like `[-1, -1, 2]`.
- Returning indexes instead of values — this problem wants values.

## Template
```python
nums.sort()
for i in range(n - 2):
    if i and nums[i] == nums[i - 1]: continue
    l, r = i + 1, n - 1
    while l < r:
        s = nums[i] + nums[l] + nums[r]
        if s < 0: l += 1
        elif s > 0: r -= 1
        else:
            out.append((nums[i], nums[l], nums[r])); l += 1; r -= 1
            while l < r and nums[l] == nums[l - 1]: l += 1
```
