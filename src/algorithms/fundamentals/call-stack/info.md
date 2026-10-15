## Explanation
Every function call gets a **frame** on the call stack holding its arguments, local variables and where to resume.
A recursive call pauses the current frame and pushes a new one on top; only the top frame runs. `fact(n)` therefore
builds n waiting frames on the way down and does all its multiplications on the way back up, as each frame receives
its child's result. The stack is small and fixed (Python stops at 1000 frames by default, JavaScript after roughly
ten thousand), so a recursion that is deep enough fails with a stack overflow even if it would be correct.

**Invariant:** the frames on the stack, bottom to top, are exactly the calls that have started but not yet returned.

## Complexity
| Version | Time | Extra space (stack) |
|---|---|---|
| Recursive `n * fact(n − 1)` | O(n) | O(n) frames |
| Tail-recursive `fact(n − 1, acc · n)` | O(n) | O(n) in Python / JS, O(1) with tail-call optimisation |
| Loop | O(n) | O(1) |

## When to use
- Recursion fits naturally when the problem is defined in terms of smaller copies of itself (trees, divide & conquer, backtracking).
- Check the maximum depth: tree height, list length, n. Depths in the thousands need a loop or an explicit stack in Python.
- **Tail recursion** (the recursive call is the very last action) can be rewritten as a loop mechanically: the
  arguments become loop variables. Scheme and some compilers do this automatically; CPython never does, and among
  JavaScript engines only Safari's JavaScriptCore implements the ES2015 proper tail calls.

## Pitfalls
- A missing or unreachable base case recurses until the stack overflows.
- `sys.setrecursionlimit` only raises Python's counter — the real C stack can still crash the interpreter.
- Recursion depth is space: an "O(1) extra space" claim is wrong for a recursive solution with O(n) depth.
- Recursive DFS on a 1000 × 1000 grid can reach a million frames; use an explicit stack or BFS.

## Template
```python
def solve(x):
    if is_base(x):            # always first: stops the descent
        return base_value(x)
    sub = solve(smaller(x))   # trust the recursive call
    return combine(x, sub)    # work done on the way back up
```
