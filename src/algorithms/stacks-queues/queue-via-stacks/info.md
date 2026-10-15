## Explanation
A stack hands items back in reverse order. Reverse them **twice** and they come back in the original order — that is a queue.

Keep two stacks. `push` always goes onto the **inbox**. To `pop` or `peek`, use the **outbox**: if it is empty, move every item from the inbox to the outbox (popping the inbox reverses it, so the oldest item ends up on top of the outbox). Then pop or read the outbox's top.

The key detail: refill **only when the outbox is empty**. Items already in the outbox are older than anything in the inbox, so they must leave first. Moving items early would mix the two orders.

**Invariant:** reading the outbox from top to bottom, then the inbox from bottom to top, lists the queue from front to back.

## Complexity
| Operation | Worst case | Amortized |
|---|---|---|
| push | O(1) | O(1) |
| pop / peek | O(n) (when a refill happens) | O(1) — each item moves from inbox to outbox at most once |
| empty | O(1) | O(1) |

## When to use
- Interview design questions: build one structure from another and argue amortized cost.
- Functional / immutable queues (two lists, front and reversed back) use the same idea.
- With two min-stacks instead of plain stacks, you get a queue that reports its minimum in O(1).

## Pitfalls
- Refilling the outbox while it still has items breaks FIFO order.
- Moving items back from outbox to inbox after every operation makes every operation O(n).
- Forgetting that `peek` also needs the refill.

## Template
```python
class Queue:
    def __init__(self): self.i, self.o = [], []
    def push(self, x): self.i.append(x)
    def pop(self):
        if not self.o:
            while self.i: self.o.append(self.i.pop())
        return self.o.pop()
```
