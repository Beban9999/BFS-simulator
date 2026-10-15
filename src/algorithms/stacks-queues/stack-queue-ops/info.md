## Explanation
All three structures hold a sequence and only let you work at the **ends** — that restriction is what makes their operations O(1) and their behaviour easy to reason about.

- **Stack (LIFO)** — push and pop at the same end, the *top*. The last item in is the first out: undo history, call stacks, bracket matching, DFS.
- **Queue (FIFO)** — push at the *back*, pop at the *front*. Items leave in arrival order: BFS, task scheduling, buffering.
- **Deque** — push and pop at **both** ends. It can act as either of the above, and powers monotonic queues and 0-1 BFS.

`peek` returns the item that the next pop would remove, without removing it. Popping or peeking an empty structure has nothing to return — real code must check first (this page records `None`).

**Invariant:** a stack's items leave in the reverse of their arrival order; a queue's items leave in exactly their arrival order.

## Complexity
| Operation | Stack (Python list / JS array) | Queue (`collections.deque`) | Deque |
|---|---|---|---|
| push / append | O(1) amortized | O(1) | O(1) at either end |
| pop | O(1) | O(1) popleft | O(1) at either end |
| peek | O(1) | O(1) | O(1) |
| search / index | O(n) | O(n) | O(n) |

Python's `list.pop(0)` and JS `array.shift()` are O(n); use `collections.deque`, a head index, or a ring buffer for queues.

## When to use
- "Most recent first" (matching, undo, backtracking, DFS) → stack.
- "In arrival order" (BFS, level order, streaming windows, schedulers) → queue.
- Need to add or drop at both ends (sliding window max/min, 0-1 BFS, palindromes) → deque.

## Pitfalls
- Popping an empty stack / queue raises an error (Python `IndexError`) or returns `undefined` (JS).
- Using a list as a queue with `pop(0)` turns an O(n) algorithm into O(n²).
- Mixing up which end is the top / front when converting between languages.

## Template
```python
from collections import deque
stack = []; stack.append(x); top = stack[-1]; stack.pop()
queue = deque(); queue.append(x); front = queue[0]; queue.popleft()
```
