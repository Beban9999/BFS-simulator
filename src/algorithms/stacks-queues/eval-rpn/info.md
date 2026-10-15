## Explanation
In **Reverse Polish Notation** (postfix) every operator comes *after* its two operands: `3 4 +` means 3 + 4, and `2 1 + 3 *` means (2 + 1) × 3. The order of the tokens already encodes precedence and grouping, so no parentheses are needed.

Evaluate it with one stack of operands. A number is pushed. An operator pops the top two values — the **top is the right operand** `b`, the one below it the left operand `a` — computes `a op b`, and pushes the result, which can be an operand for a later operator. A well-formed expression leaves exactly one value: the answer.

**Invariant:** after each token, the stack holds the values of the complete sub-expressions read so far that have not yet been used by an operator.

## Complexity
| | Time | Space |
|---|---|---|
| One pass with an operand stack | O(n) | O(n) |

## When to use
- Evaluating postfix produced by a parser (the second half of a calculator / shunting-yard).
- Stack-based virtual machines and calculators (HP calculators, JVM / Python bytecode are stack machines).
- Building expression trees bottom-up from postfix.

## Pitfalls
- Operand order: for `-` and `/`, compute `a - b` / `a / b` where `b` was popped **first**.
- Python's `//` floors (`-7 // 2 == -4`); the problem wants truncation toward zero, so use `int(a / b)`.
- Negative numbers like `"-3"` are operands, not the `-` operator — compare the whole token, not its first character.
- Malformed input (too few operands) pops an empty stack.

## Template
```python
import operator
OPS = {"+": operator.add, "-": operator.sub, "*": operator.mul, "/": lambda a, b: int(a / b)}

def eval_rpn(tokens):
    st = []
    for t in tokens:
        if t in OPS:
            b, a = st.pop(), st.pop()
            st.append(OPS[t](a, b))
        else:
            st.append(int(t))
    return st[0]
```
