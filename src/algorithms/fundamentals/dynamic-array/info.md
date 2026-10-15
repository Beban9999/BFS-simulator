## Explanation
A dynamic array (Python `list`, JavaScript `Array`, Java `ArrayList`, C++ `vector`) keeps its elements in one
contiguous block with some spare capacity. Most appends just write into a free slot. When the block is full, the
array allocates a bigger block, copies every element over and frees the old one — an O(n) step. Growing by a
**factor** (× 2, × 1.5) makes those expensive steps rare: after copying n elements you get about n free slots, so the
copy cost spread over the following appends stays constant.

**Invariant:** `size ≤ capacity`, elements live in slots `0 … size − 1`, and with doubling the total number of copies
after n appends is less than 2n (1 + 2 + 4 + … + 2ᵏ = 2ᵏ⁺¹ − 1, and 2ᵏ < n).

## Complexity
| Growth | Single append, worst | n appends total | Per append (amortized) | Wasted space |
|---|---|---|---|---|
| × 2 | O(n) | O(n) — under 3n moves | O(1) | up to ~n |
| × 1.5 | O(n) | O(n) — under 4n moves | O(1) | up to ~n/2 |
| + constant k | O(n) | O(n² / k) | O(n) | at most k |

Access by index is O(1) in all cases; inserting or deleting in the middle is O(n) because elements shift.

## When to use
- Appending at the end and indexing by position: the default list in almost every language.
- When you hear "amortized O(1)": a rare expensive step paid for by many cheap ones (also hash-table resize,
  queue made of two stacks, union-find).
- Pre-size the array (`[None] * n`, `reserve(n)`) when the final size is known to skip the copies entirely.

## Pitfalls
- Amortized ≠ worst case: one append can still take O(n) — matters for real-time systems.
- Inserting at the front (`list.insert(0, x)`, `arr.unshift(x)`) is O(n) every time; use a deque.
- Shrinking at half-full and growing at full can thrash on alternating push/pop; shrink at a quarter instead.
- Keeping a reference/pointer into the old block after a resize (C++ iterator invalidation).

## Template
```python
def append(self, x):
    if self.size == self.cap:
        self._resize(2 * self.cap)      # O(n), but rare
    self.data[self.size] = x            # O(1)
    self.size += 1
```
