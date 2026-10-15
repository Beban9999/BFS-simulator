## Explanation
Union-Find keeps a collection of disjoint sets and answers "are `a` and `b` in the same set?" while sets keep merging. Every set is stored as a tree of `parent` pointers, and its **root** (a node that is its own parent) is the set's name.

- **find(x)** follows parents up to the root. **Path compression** then points every node on that path directly at the root, so later finds are almost free. Watch the forest flatten after a deep `find`.
- **union(a, b)** finds both roots. If they are equal, `a` and `b` were already connected, so the edge is redundant (dashed). Otherwise the root of the **lower-rank** tree is attached under the other root (**union by rank**). The rank is an upper bound on the tree's height and grows only when two equal ranks merge.

Each successful union merges two components into one, so the number of components drops by one.

**Invariant:** two nodes are in the same set exactly when they have the same root, and every root's rank is at least the height of its tree.

## Complexity
| Operation | With both optimisations | Without |
|---|---|---|
| find / union | O(α(n)) amortised | O(n) worst case (a long chain) |
| Space | O(n) | O(n) |

α is the inverse Ackermann function: at most 4 for any input that fits in memory.

## When to use
- Connectivity that only **grows** (edges added, never removed): components, redundant edges, "are these two connected yet?".
- Kruskal's MST (keep an edge only if it joins two different sets).
- Grouping by an equivalence: accounts sharing emails, equal variables, similar strings.
- Offline problems where you can sort queries and add edges in order.

## Pitfalls
- Compare **roots** (`find(a) == find(b)`), never `parent[a] == parent[b]`.
- Union by rank compares the ranks of the **roots**, not of `a` and `b`.
- Deleting edges is not supported; reverse the process (add edges backwards) if the problem allows.
- Recursive `find` can be deep before the first compression; an iterative two-pass find avoids recursion limits.

## Template
```python
parent = list(range(n))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # path halving
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb:
        return False
    parent[rb] = ra
    return True
```
