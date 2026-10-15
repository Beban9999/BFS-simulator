## Explanation
A recursion tree draws every call as a node and every call it makes as a child. The total running time is the number
of nodes times the work done per node, and the maximum stack depth is the height of the tree. Its **shape** comes
straight from the code: how many recursive calls each call makes (the branching factor) and how fast the argument
shrinks (by 1 or by half). Two calls that each shrink by 1 give a bushy tree with exponentially many nodes; one call
shrinking by 1 gives a chain of n; one call that halves gives a chain of log n.

**Invariant:** a node's value (shown as `n:value`) is computed only from its children's return values, so it appears
only after all of its children have returned.

## Complexity
| Function | Calls per node | Argument shrinks | Nodes (time) | Depth (stack) |
|---|---|---|---|---|
| `fib(n)` | 2 | by 1 and 2 | O(φⁿ) ≈ O(1.618ⁿ) | O(n) |
| `power(x, n)` | 1 | by 1 | O(n) | O(n) |
| `fast_power(x, n)` | 1 | by half | O(log n) | O(log n) |
| `merge_sort(n)` | 2 | by half | O(n) nodes, O(n log n) work | O(log n) |

## When to use
- Estimate any recursive solution: count branches per call and levels, then multiply by the work per call.
- Repeated labels in the tree (the orange counts) mean overlapping subproblems — memoise or switch to DP.
- Large exponents (n up to 10⁹ or more, often modulo a prime): exponentiation by squaring.

## Pitfalls
- In `fast_power`, writing `fast_power(x, n // 2) * fast_power(x, n // 2)` makes **two** calls per node and
  brings back O(n) calls — compute the half once and square it.
- Negative exponents and n = −2³¹ in Pow(x, n): use `1 / x` and a wider integer for −n.
- "Depth" and "number of calls" are different: fib(n) has an exponential number of calls but only depth n.

## Template
```python
def fast_power(x, n, mod=None):
    if n == 0:
        return 1
    half = fast_power(x, n // 2, mod)
    res = half * half * (x if n % 2 else 1)
    return res % mod if mod else res
```
