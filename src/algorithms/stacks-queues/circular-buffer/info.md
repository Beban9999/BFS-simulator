## Explanation
A queue on a plain array has a problem: dequeuing from the front either shifts every item (O(n)) or leaves dead space that is never reused. A **circular buffer** treats the array as a ring: after the last slot comes slot 0 again.

Two numbers describe the queue: `head`, the index of the front item, and `count`, how many items are stored. The next free slot is `(head + count) % k`, and the rear item is at `(head + count - 1) % k`. Enqueue writes into the free slot; dequeue just moves `head` forward one step (mod k) — the old value is not erased, it simply stops being part of the queue and will be overwritten later.

Keeping `count` (instead of a separate tail index) makes "empty" (`count == 0`) and "full" (`count == k`) unambiguous; with only head and tail, both look like `head == tail`.

**Invariant:** the queue's items, front to back, are `buf[(head + i) % k]` for `i = 0 … count − 1`.

## Complexity
| Operation | Time | Space |
|---|---|---|
| enQueue / deQueue / Front / Rear | O(1) | O(k) total, allocated once |

## When to use
- Bounded FIFO buffers: streaming data, producer/consumer queues, audio/network buffers, logs that keep the last k entries.
- Sliding windows of fixed size (moving averages).
- Implementing a queue or deque in a language without a built-in one, with no per-operation allocation.

## Pitfalls
- Forgetting the modulo when computing the tail or rear index.
- Telling full from empty with only `head` and `tail` — keep a count (or leave one slot unused).
- Rear is `(head + count - 1) % k`, not `head + count`.
- In languages where `%` can be negative (Java, C, JS), use `(i - 1 + k) % k` when stepping backwards.

## Template
```python
class Ring:
    def __init__(self, k):
        self.buf, self.head, self.count = [None] * k, 0, 0
    def push(self, x):
        if self.count == len(self.buf): return False
        self.buf[(self.head + self.count) % len(self.buf)] = x
        self.count += 1; return True
    def pop(self):
        if self.count == 0: return None
        x = self.buf[self.head]
        self.head = (self.head + 1) % len(self.buf); self.count -= 1
        return x
```
