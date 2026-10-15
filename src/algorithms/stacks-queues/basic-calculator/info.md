## Explanation
Infix expressions like `3 + 4 * 2` are hard to evaluate left to right because `*` must happen before `+`. Dijkstra's **shunting-yard** algorithm rewrites them into postfix (`3 4 2 * +`), which is trivial to evaluate with a stack (see [Evaluate RPN](#/stacks-queues/eval-rpn)).

Read tokens left to right:
- a **number** goes straight to the output;
- an **operator** first moves to the output every operator on top of the stack that binds **at least as tightly** (higher precedence, or equal precedence because `+ − * /` are left-associative), then is pushed;
- `(` is pushed as a barrier; `)` pops operators to the output until the matching `(`, which is discarded.

At the end, the remaining operators are popped to the output. The output is postfix: operands appear in their original order, and each operator appears right after the operands it applies to.

**Invariant:** the operator stack never holds an operator directly above one that binds at least as tightly (inside the same pair of parentheses).

## Complexity
| | Time | Space |
|---|---|---|
| Shunting-yard + postfix evaluation | O(n) — every token pushed and popped at most once | O(n) |

## When to use
- Calculators and formula evaluators with precedence and parentheses.
- Compilers / interpreters: converting expressions for a stack machine.
- Simpler variants: with only `+`/`−` and parentheses, a running sum plus a stack of signs is enough; with no parentheses, one pass with a "last operator" variable works.

## Pitfalls
- Use `>=` for left-associative operators (`8 − 3 − 2` must be `(8 − 3) − 2`); right-associative ones like `^` use `>`.
- Never pop past a `(` while handling an operator.
- Integer division must truncate toward zero; Python's `//` floors.
- This page has no unary minus; supporting it means treating `−` after `(` or at the start as a separate operator (or inserting a 0).

## Template
```python
def to_postfix(tokens):
    out, ops = [], []
    for t in tokens:
        if t.isdigit(): out.append(t)
        elif t == "(": ops.append(t)
        elif t == ")":
            while ops[-1] != "(": out.append(ops.pop())
            ops.pop()
        else:
            while ops and ops[-1] != "(" and PREC[ops[-1]] >= PREC[t]:
                out.append(ops.pop())
            ops.append(t)
    return out + ops[::-1]
```
