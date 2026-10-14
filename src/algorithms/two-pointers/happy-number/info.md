## Explanation
Start from `n` and keep replacing it with the sum of the squares of its digits. A **happy** number eventually reaches 1 (and stays there); an unhappy one falls into a loop that never contains 1 (for base 10 it is always the loop through 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4).

The sequence is an **implicit linked list**: each number points to its successor. Detecting "reaches 1" vs "cycles" is cycle detection, so Floyd's fast & slow pointers solve it with O(1) memory — no set of seen numbers needed. `fast` advances two steps per round, `slow` one; either `fast` hits 1 or the two collide inside the loop.

**Invariant:** after `k` rounds, `slow` is `k` steps along the sequence and `fast` is `2k + 1` steps along.

## Complexity
| | Time | Space |
|---|---|---|
| Fast & slow | O(log n) per step; the sequence quickly drops below 243 | O(1) |
| Hash set of seen values | same | O(number of distinct values) |

## When to use
- Any process `x → f(x)` that must either terminate at a fixed point or repeat: detect the repeat without storing history.
- Recognise "will this loop forever?" questions as cycle detection.

## Pitfalls
- Starting `fast` equal to `slow` and checking `slow != fast` immediately exits the loop — start fast one step ahead (or use do-while).
- Forgetting that 1 maps to itself: once `fast` reaches 1 you can stop.
- Digits of 0 contribute nothing; `n = 0` is not a valid input for the original problem.

## Template
```python
slow, fast = x, f(x)
while fast != target and slow != fast:
    slow, fast = f(slow), f(f(fast))
return fast == target
```
