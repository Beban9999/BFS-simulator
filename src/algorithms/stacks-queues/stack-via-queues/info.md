## Explanation
A queue only removes from the front, but a stack must remove the **newest** item. So make sure the newest item is always at the front: after appending `x` to the back, take every older item off the front and append it again behind `x` (`len − 1` rotations). Now the queue's order, front to back, is newest to oldest — exactly a stack read from the top down.

`pop` is then a plain `popleft`, `top` reads the front, and `empty` checks the size. All the work happens in `push`.

**Invariant:** the queue's items, front to back, are the stack's items from top to bottom.

## Complexity
| Operation | Time |
|---|---|
| push | O(n) — n − 1 rotations |
| pop / top / empty | O(1) |

The alternative (cheap push, expensive pop that rotates to expose the last item) is also O(n) per pop. Unlike queue-via-stacks, there is no amortized O(1) version.

## When to use
- Interview design questions about building one ADT from another and comparing costs.
- Rotating a queue in place is also the Josephus-style "send k−1 to the back" simulation.

## Pitfalls
- Rotating `len` times instead of `len − 1` puts `x` back at the end.
- Using `pop()` / `q[-1]` (deque operations a queue doesn't have) defeats the exercise.
- Forgetting that the cost moved to `push`: n pushes cost O(n²) in total.

## Template
```python
from collections import deque
class Stack:
    def __init__(self): self.q = deque()
    def push(self, x):
        self.q.append(x)
        self.q.rotate(-(len(self.q) - 1))   # same as len-1 popleft+append
    def pop(self): return self.q.popleft()
```
