## Explanation
Cars drive towards a target on a one-lane road and cannot pass: a faster car that catches a slower one stays behind it, and they continue as one **fleet** at the slower speed. How many fleets arrive?

Look at the cars from the one **closest to the target** backwards, and compute each car's arrival time if it drove alone: `(target − position) / speed`. The car ahead is either alone or the tail of a fleet that arrives at time `T` (the top of the stack). If this car would arrive at or before `T`, it catches that fleet before the target (or exactly at it) and merges — the fleet's arrival time stays `T`. If it would arrive later, it never catches up: it starts a new, slower fleet, so push its time.

The stack's times strictly increase from bottom to top, and its size is the number of fleets.

**Invariant:** after processing the k cars closest to the target, the stack holds one arrival time per fleet among them, increasing from the front of the road to the back.

## Complexity
| | Time | Space |
|---|---|---|
| Sort + one pass | O(n log n) | O(n) |

Only the top of the stack is ever compared, so a single variable "slowest arrival time so far" also works — the stack just makes the fleets visible.

## When to use
- Objects moving in one direction that merge or block each other (cars, asteroids, people in a queue).
- When an object's fate depends only on the nearest group ahead of it — process from the front and keep groups on a stack.

## Pitfalls
- Sort by **position**, descending — not by speed or time.
- Merging uses `<=`: arriving exactly together at the target still counts as one fleet.
- Floating-point times can compare wrongly in other languages; compare `(target − p1) · s2` with `(target − p2) · s1` to stay in integers.

## Template
```python
def car_fleet(target, position, speed):
    fleets, slowest = 0, 0.0
    for p, s in sorted(zip(position, speed), reverse=True):
        t = (target - p) / s
        if t > slowest:
            fleets, slowest = fleets + 1, t
    return fleets
```
