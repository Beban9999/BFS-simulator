## Explanation
In Python and for JavaScript/Java objects, a variable does not contain the object — it **refers** to it. Assignment
and argument passing copy the reference, so two names can share one mutable object (aliasing), and a change made
through either name is seen through both. Immutable values (numbers, strings, tuples) can't be changed in place, so
"changing" them always makes a new value. Separately, how data sits in memory matters for speed: an array is one
contiguous block (index arithmetic, cache-friendly), a linked list is nodes scattered across the heap joined by pointers.

**Rule:** `=` never copies a list or object; only an explicit copy does — and a shallow copy shares everything nested inside.

## Complexity
| Operation | Cost |
|---|---|
| Assign / pass a reference | O(1) |
| Shallow copy of n items (`a[:]`, `[...a]`) | O(n) time and memory |
| Deep copy | O(total size of everything reachable) |
| Array: read index i | O(1) — one address computation |
| Linked list: reach index i | O(i) — follow i pointers |

## When to use
- Copy before you mutate a list you don't own (inputs, values stored in a result).
- Pass big structures by reference on purpose (visited sets, memo dicts) to avoid O(n) copies per call.
- Prefer arrays for indexing and scanning; linked lists when you insert/delete at nodes you already hold (LRU cache).

## Pitfalls
- `[[0] * m] * n` builds n references to one row; use a comprehension.
- Mutable default arguments (`def f(seen=set())`) are created once and shared across calls.
- `is` / `===` compare identity, `==` compares contents — two equal lists are not the same object.
- A shallow copy of a 2D grid still shares its rows.
