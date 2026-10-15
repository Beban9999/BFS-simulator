## Explanation
Every node has a `next` and a `random` pointer (to any node or null). Copying `next` is easy, but a copy's `random` must point to the **copy** of the original target — and that copy may not exist yet. Both approaches solve "where is the copy of node X?":

**Hash map (two passes).** Pass 1 creates a copy of every node and stores `old → new` in a map. Pass 2 wires each copy: `copy.next = map[old.next]`, `copy.random = map[old.random]`. Mapping `None → None` removes null checks.

**Weaving (O(1) extra space).** Insert each copy directly **after** its original: `A → A' → B → B' → …`. Now the copy of any node X is simply `X.next`, so `X'.random = X.random.next`. Finally un-weave the list into the restored original and the copy.

**Invariant (weaving):** between phases 1 and 3, every original X is followed by its copy X', so `X.next` is always "the copy of X".

## Complexity
| Approach | Time | Extra space |
|---|---|---|
| Hash map | O(n) | O(n) map |
| Weaving | O(n) — three passes | O(1) (besides the copy itself) |

## When to use
- Deep copies of linked structures with extra pointers (lists, graphs, trees).
- The map version generalises to any graph: create on first sight, wire later (or recursively).
- The weaving trick is the go-to answer for the "O(1) extra space" follow-up.

## Pitfalls
- Pointing a copy's `random` at the **original** node — the result must not share any nodes with the input.
- Weaving: advance with `curr.next.next`, otherwise you walk onto the copies.
- Weaving: restore the original list's `next` pointers while splitting; the input must be unchanged afterwards.
- Map version: remember the `None → None` entry (or check for null) before looking up `random`.

## Template
```python
def copy_random_list(head):
    m = {None: None}
    c = head
    while c:
        m[c] = Node(c.val); c = c.next
    c = head
    while c:
        m[c].next, m[c].random = m[c.next], m[c.random]; c = c.next
    return m[head]
```
