## Explanation
Big-O describes how an algorithm's cost grows as the input grows, ignoring constant factors and smaller terms. It
answers "what happens when n gets ten times bigger?": O(n) does ten times the work, O(n²) a hundred times, O(log n)
only a few more steps, and O(2ⁿ) becomes hopeless. That is why the class matters far more than micro-optimisations
once inputs get large.

**Key idea:** compare growth, not values — for small n an O(n²) algorithm with a tiny constant can beat an O(n log n)
one, but past some n the better class always wins.

## Complexity
| Class | n = 10 | n = 1,000 | n = 10⁶ |
|---|---|---|---|
| O(1) | 1 | 1 | 1 |
| O(log n) | ≈ 3 | ≈ 10 | ≈ 20 |
| O(n) | 10 | 1,000 | 10⁶ |
| O(n log n) | ≈ 33 | ≈ 10⁴ | ≈ 2 × 10⁷ |
| O(n²) | 100 | 10⁶ | 10¹² |
| O(2ⁿ) | 1,024 | ≈ 10³⁰¹ | — |
| O(n!) | 3.6 × 10⁶ | ≈ 10²⁵⁶⁷ | — |

## When to use
- Read the constraints first: n ≤ 20 hints at O(2ⁿ), n ≤ 5,000 at O(n²), n ≤ 10⁵–10⁶ at O(n log n) or O(n).
- State time **and** space for every solution you present, including the recursion stack.
- Say which case you mean (worst / average / amortized) when they differ.

## Pitfalls
- Hidden loops: `x in list`, `list.index`, slicing and string concatenation in a loop are O(n) each.
- Two inputs need two variables: a loop over n with an inner loop over m is O(n · m), not O(n²).
- O(log n) means the problem shrinks by a constant **factor** each step, not by a constant amount.
- Average-case O(1) hash operations can degrade to O(n) with many collisions.
