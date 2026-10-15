## Explanation
How many rooms are needed so that no two overlapping meetings share one? Process meetings in order of **start time**, and keep the **end time of every room currently in use** in a min-heap. The heap's root is the room that frees up first.

For each meeting: if that earliest end is ≤ the meeting's start, the room is free again — pop it and reuse it. Either way, push the meeting's end time (the room it uses is busy until then). Checking only the root is enough: if even the earliest-ending room is still busy, all of them are.

Rooms are never removed except by reuse, so the heap's size never shrinks — its final size is the most rooms ever busy at once.

**Invariant:** after processing a meeting, the heap holds one end time per room opened so far, and the root is the earliest moment a room becomes free.

## Complexity
| | Time | Space |
|---|---|---|
| Sort + heap | O(n log n) | O(n) |
| Sweep line (sort starts and ends separately) | O(n log n) | O(n) |

## When to use
- Allocating identical resources to time intervals: rooms, servers, platforms, CPUs.
- "Maximum number of overlapping intervals at any moment."
- Simulations where the next event is "whichever busy thing finishes first" — Meeting Rooms III, task schedulers, car pooling.

## Pitfalls
- Sort by **start**, not end.
- `<=` vs `<`: a meeting starting exactly when another ends can reuse the room (half-open intervals) — check the problem's convention.
- Pop at most one room per meeting; popping every finished room also works for the count but changes what the heap means.

## Template
```python
import heapq
def min_rooms(intervals):
    ends = []
    for s, e in sorted(intervals):
        if ends and ends[0] <= s:
            heapq.heapreplace(ends, e)
        else:
            heapq.heappush(ends, e)
    return len(ends)
```
