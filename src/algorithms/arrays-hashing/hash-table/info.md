## Explanation
A hash table stores keys in an array of **buckets**. A hash function turns a key into a big integer; `hash % capacity` picks the bucket. Lookups jump straight to that bucket instead of scanning everything.

Different keys can land in the same bucket — a **collision**. Two classic fixes:

- **Separate chaining:** each bucket holds a small list; colliding keys are appended. Lookups scan only that list.
- **Open addressing (linear probing):** each slot holds at most one key. On a collision, try the next slot (`i + 1`, wrapping around) until a free one appears. Lookups follow the same probe sequence. Deleting needs *tombstones* so later probes don't stop early.

The **load factor** `size / capacity` controls speed. When it passes a threshold (0.75 here), allocate a table twice as big and **rehash** every key — their indexes change because the capacity changed. Doubling keeps the *amortized* cost of insertion O(1).

**Invariant (probing):** a key is always found by starting at its home slot and walking forward with no empty slot in between.

## Complexity
| Operation | Average | Worst case |
|---|---|---|
| Insert / lookup / delete | O(1) | O(n) (everything collides) |
| Resize | O(n), amortized O(1) per insert | — |
| Space | O(n) | — |

## When to use
- Membership tests, counting, de-duplication, caches, "have I seen this before?" — the most used structure in interviews.
- Design questions (Design HashMap/HashSet) ask you to build exactly this.
- Choose chaining for simplicity and easy deletes; probing for cache-friendly memory and no per-node allocations.

## Pitfalls
- A poor hash function (e.g. summing characters) makes anagrams collide; use a polynomial or library hash.
- Mutable keys (lists in Python) can't be hashed — their hash would change after insertion.
- Linear probing suffers from **clustering**: long runs of occupied slots slow everything down as the load factor approaches 1.
- Forgetting to rehash on resize: keys stay at indexes computed for the old capacity and become unfindable.

## Template
```python
class MyHashMap:
    def __init__(self):
        self.buckets = [[] for _ in range(1024)]
    def _chain(self, key):
        return self.buckets[hash(key) % len(self.buckets)]
    def put(self, key, value):
        chain = self._chain(key)
        for pair in chain:
            if pair[0] == key:
                pair[1] = value
                return
        chain.append([key, value])
    def get(self, key):
        for k, v in self._chain(key):
            if k == key:
                return v
        return -1
```
