## Explanation
A stack only changes at the top, so the minimum of the whole stack can only change when something is pushed or popped. That means we can **remember** it instead of recomputing it: keep a second stack `mins` whose top is always the minimum of everything currently in the main stack.

On `push(x)`: push x onto the main stack, and also onto `mins` if x is a new minimum (`x <= mins[-1]`). On `pop()`: if the value leaving equals `mins[-1]`, that minimum is leaving too, so pop `mins` as well — the previous minimum underneath becomes current again. `getMin()` is just `mins[-1]`.

Using `<=` (not `<`) matters for duplicates: pushing 2, 2 and popping one 2 must leave 2 as the minimum.

**Invariant:** `mins` is non-increasing from bottom to top, and `mins[-1]` equals `min(stack)` whenever the stack is non-empty.

## Complexity
| Operation | Time | Extra space |
|---|---|---|
| push / pop / top / getMin | O(1) | O(n) worst case for `mins` (e.g. decreasing pushes) |

An alternative stores a `(value, min_so_far)` pair per entry — same complexity, simpler code, always 2n values.

## When to use
- A stack that must answer "min" or "max" (or any aggregate that can be carried forward) in O(1).
- Undo-able aggregates: whenever the structure only changes at one end, store the aggregate per depth.
- The same idea makes a queue with O(1) min: two min-stacks (see queue via stacks).

## Pitfalls
- Using `<` when pushing to `mins` breaks with duplicate minimums.
- Comparing objects by identity instead of value (Java `Integer` with `==`) when deciding whether to pop `mins`.
- Calling `top` / `getMin` on an empty stack — the problem usually guarantees it never happens; real code should check.

## Template
```python
class MinStack:
    def __init__(self):
        self.s = []                       # (value, min so far)
    def push(self, x):
        self.s.append((x, min(x, self.s[-1][1]) if self.s else x))
    def pop(self):    self.s.pop()
    def top(self):    return self.s[-1][0]
    def getMin(self): return self.s[-1][1]
```
