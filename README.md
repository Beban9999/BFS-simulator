# BFS / DFS Simulator

An interactive visualizer for Breadth-First Search (BFS) and Depth-First Search (DFS) on a 20×20 grid. Set a start and end cell, draw walls, and watch how each algorithm explores the grid and the path it finds.

**Live demo:** https://sweet-sopapillas-d5fe17.netlify.app/

## Features

- **Draw walls** by clicking or dragging across cells (tap on touch screens).
- **Start and end** cells set by row and column, with validation for out-of-range values.
- **BFS or DFS.** BFS always finds the shortest path; DFS finds *a* path, usually a long one.
- **Adjustable speed** for the exploration and path animations.
- **Result summary** showing the path length and number of explored cells, or a message when the end can't be reached.
- **Clear path** keeps your walls; **Reset grid** clears everything.
- **Dark mode by default**, with a light mode toggle that is remembered between visits.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page layout and controls. |
| `styles.css` | Styles and theme colors (CSS variables for dark and light themes). |
| `script.js` | Grid, controls, animation and the search algorithms. |
| `netlify.toml` | Netlify config: publishes the repository root as a static site. |

## Adding an algorithm

Algorithms live in the `ALGORITHMS` registry in `script.js`. Each entry has a label, a name, a short description and a `search(isOpen, start, end)` function that returns `{ order, path }`:

- `order`: the cells in the order they were explored.
- `path`: the cells from start to end, or `null` if there is none.

The algorithm picker is built from this registry, so a new entry shows up in the UI automatically.

## Running locally

No build step is needed. Open `index.html` in a browser, or serve the folder with any static server.
