## Explanation
Each list stores a number with its digits **reversed**: `2 → 4 → 3` is 342. That is convenient, because addition starts at the ones column — exactly the heads of the lists. Walk both lists together, add the two digits plus the **carry** from the previous column, write `total % 10` into a new node and carry `total // 10` (0 or 1) into the next column.

When one list is shorter, treat its missing digits as 0. Keep looping while **either** list has digits **or** a carry is left — a final carry creates one extra node (99 + 1 = 100). A dummy head lets every digit be appended the same way.

**Invariant:** after processing k columns, the result list holds the k lowest digits of the sum and `carry` is what overflowed from column k.

## Complexity
| | Time | Space |
|---|---|---|
| Column by column | O(max(m, n)) | O(max(m, n)) for the result (O(1) extra) |

## When to use
- Arbitrary-precision arithmetic on digit lists / arrays / strings.
- Any "simulate pen-and-paper addition" problem (binary strings, array-form integers).
- Digits stored most significant first? Reverse first, or push them on stacks.

## Pitfalls
- Forgetting the final carry (`or carry` in the loop condition).
- Stopping when the **shorter** list ends instead of continuing with 0s.
- Converting to an integer and back overflows in fixed-width languages for long lists.
- The result is also least significant digit first — do not reverse it.

## Template
```python
def add(l1, l2):
    dummy = tail = ListNode()
    carry = 0
    while l1 or l2 or carry:
        s = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
        carry, d = divmod(s, 10)
        tail.next = tail = ListNode(d)
        l1 = l1 and l1.next
        l2 = l2 and l2.next
    return dummy.next
```
