## Explanation
The product of everything except `nums[i]` splits into two parts: the product of everything **left** of `i` and the product of everything **right** of `i`. Both are running products, just like prefix sums.

The first pass walks left to right and writes the left product into `answer[i]` *before* multiplying `nums[i]` in. The second pass walks right to left with a running `right` product and multiplies it into `answer[i]`. The output array doubles as the prefix-product storage, so the only extra memory is two variables.

Division would be simpler (`total / nums[i]`), but it fails on zeros and interview versions usually forbid it.

**Invariant:** in the first pass, `left` is the product of `nums[0..i-1]`; in the second pass, `right` is the product of `nums[i+1..n-1]`.

## Complexity
| | Time | Space |
|---|---|---|
| Two passes | O(n) | O(1) extra (output not counted) |
| Separate prefix & suffix arrays | O(n) | O(n) |

## When to use
- "For each index, combine everything before it with everything after it" — products, max-so-far from both sides, counts on each side of a split.
- Whenever division is banned or zeros make it unsafe.

## Pitfalls
- Writing `answer[i] = left` must happen **before** `left *= nums[i]`, otherwise `nums[i]` includes itself.
- With one zero, every answer is 0 except at the zero's index; with two zeros, all are 0 — the two-pass method handles both without special cases.
- Integer overflow in fixed-width languages for long arrays.

## Template
```python
ans, acc = [1] * n, 1
for i in range(n):            # left products
    ans[i], acc = acc, acc * nums[i]
acc = 1
for i in reversed(range(n)):  # right products
    ans[i], acc = ans[i] * acc, acc * nums[i]
```
