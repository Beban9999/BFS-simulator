## Explanation
Linear search looks at each element from left to right and stops at the first match. It needs no preparation and works on any sequence — sorted or not, array or linked list.

It is the baseline: whenever you write a linear scan inside another loop, ask whether sorting + binary search, a hash set, or two pointers could replace it.

**Invariant:** before checking index `i`, the target does not occur in `nums[0..i-1]`.

## Complexity
| Case | Time | Space |
|---|---|---|
| Best (target first) | O(1) | O(1) |
| Average / worst (absent or last) | O(n) | O(1) |

## When to use
- Small or unsorted data that you search once.
- Data you can only walk sequentially (linked lists, streams).
- When a single pass also computes other things you need (counts, min, max).

## Pitfalls
- Repeated linear searches inside a loop make an O(n²) algorithm — precompute a set or sort once.
- Returning on the **first** match when the problem asks for the last (or all) matches.

## Template
```python
def find(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1
```
