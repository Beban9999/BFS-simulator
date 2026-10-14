## Explanation
The array has `n + 1` values in `1..n`, so at least one repeats. Read each value as a pointer: from index `i` go to index `nums[i]`. Starting at index 0 and following pointers forms a path that must eventually loop (there are only `n + 1` indexes). Two different indexes point at the duplicate value, so the duplicate is exactly the **entrance of the cycle**.

**Floyd's tortoise and hare** finds it in O(1) space:

1. `slow` takes one step, `fast` takes two. Inside the cycle, fast gains one step per move, so they must meet.
2. Put `slow` back at the start and move both one step at a time. They meet at the cycle entrance. (If the tail before the cycle has length `a` and they met `b` steps into a cycle of length `c`, then `a ≡ c − b (mod c)`: walking `a` steps from the start and from the meeting point lands both on the entrance.)

**Invariant (phase 2):** `slow` and `fast` are always the same number of steps away from the cycle entrance.

## Complexity
| | Time | Space |
|---|---|---|
| Floyd | O(n) | O(1), array untouched |
| Hash set | O(n) | O(n) |
| Sort | O(n log n) | modifies the array |

## When to use
- Cycle detection in linked lists or any **function iteration** `x → f(x)` (happy number, pseudo-random sequences).
- Finding a cycle's start or length, the middle of a list (fast moves 2, slow moves 1), or the k-th node from the end (gap pointers).

## Pitfalls
- Starting slow and fast at different positions breaks the phase-2 math.
- Checking `slow == fast` before the first move (they're equal at the start).
- This trick needs the "values in 1..n and n + 1 of them" guarantee; with values outside the range the pointers walk off the array.

## Template
```python
slow = fast = start
while True:
    slow, fast = f(slow), f(f(fast))
    if slow == fast: break
slow = start
while slow != fast:
    slow, fast = f(slow), f(fast)
entrance = slow
```
