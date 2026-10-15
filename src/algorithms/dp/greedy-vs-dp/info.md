## Explanation
A greedy algorithm commits to the choice that looks best right now and never revisits it; DP tries every choice for one
step and keeps the best, reusing answers to smaller subproblems. Greedy is faster and simpler, but only correct when
the problem has the **greedy-choice property**: some optimal solution always contains the locally best choice. Coin
change with coins {1, 3, 4} breaks it — taking the 4 for amount 6 forces 4 + 1 + 1, while 3 + 3 is better.

**Rule of thumb:** prove greedy with an exchange argument, or find a counter-example by brute force on small inputs.

## Complexity
| Approach | Coin change time | Space |
|---|---|---|
| Greedy (largest first) | O(k log k + k) for k coins | O(1) |
| DP over amounts | O(amount · k) | O(amount) |

The DP is pseudo-polynomial: fine for amounts up to ~10⁴–10⁵.

## When to use
- Greedy: interval scheduling by end time, fractional knapsack, Huffman coding, jump game reachability, canonical coin systems.
- DP: "minimum / maximum / number of ways" where a local choice can block a better global answer (0/1 knapsack, arbitrary coins, weighted intervals).
- Unsure? Write both for small inputs and compare, like the strip on this page.

## Pitfalls
- "It worked on the examples" is not a proof: sample inputs often use canonical coins.
- A greedy that fixes the wrong sort key (start time instead of end time) fails on simple cases.
- DP on huge values (amount 10⁹) is too slow — look for a math or greedy argument instead.
