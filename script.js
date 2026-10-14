"use strict";

const ROWS = 20;
const COLS = 20;
const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // up, right, down, left

// Delay in ms between animation steps for each speed setting (1 = slowest).
const SPEEDS = {
    1: { name: "Very slow", visit: 60, path: 160 },
    2: { name: "Slow", visit: 30, path: 120 },
    3: { name: "Normal", visit: 12, path: 80 },
    4: { name: "Fast", visit: 5, path: 40 },
    5: { name: "Very fast", visit: 1, path: 15 },
};

// Every algorithm gets isOpen(row, col), start and end, and returns
// { order: cells in the order they were explored, path: start..end or null }.
// To add an algorithm, add an entry here; the picker is built from this list.
const ALGORITHMS = {
    bfs: {
        label: "BFS",
        name: "Breadth-first search",
        description: "Explores outward one step at a time, so the path it finds is always the shortest.",
        search: breadthFirst,
    },
    dfs: {
        label: "DFS",
        name: "Depth-first search",
        description: "Follows one direction as far as it can before backtracking. It finds a path, but rarely the shortest.",
        search: depthFirst,
    },
};

/* ---------- Search algorithms ---------- */

function createMatrix(value) {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(value));
}

function sameCell(a, b) {
    return a.row === b.row && a.col === b.col;
}

function neighbors(cell, isOpen) {
    const result = [];
    for (const [dr, dc] of DIRECTIONS) {
        const row = cell.row + dr;
        const col = cell.col + dc;
        if (isOpen(row, col)) {
            result.push({ row, col });
        }
    }
    return result;
}

function tracePath(prev, end) {
    const path = [];
    for (let cell = end; cell; cell = prev[cell.row][cell.col]) {
        path.push(cell);
    }
    return path.reverse();
}

function breadthFirst(isOpen, start, end) {
    const prev = createMatrix(null);
    const seen = createMatrix(false);
    const order = [];
    const queue = [start];
    seen[start.row][start.col] = true;

    for (let head = 0; head < queue.length; head++) {
        const cell = queue[head];
        order.push(cell);
        if (sameCell(cell, end)) {
            return { order, path: tracePath(prev, end) };
        }
        for (const next of neighbors(cell, isOpen)) {
            if (!seen[next.row][next.col]) {
                seen[next.row][next.col] = true;
                prev[next.row][next.col] = cell;
                queue.push(next);
            }
        }
    }
    return { order, path: null };
}

function depthFirst(isOpen, start, end) {
    const prev = createMatrix(null);
    const done = createMatrix(false);
    const order = [];
    const stack = [start];

    while (stack.length) {
        const cell = stack.pop();
        if (done[cell.row][cell.col]) {
            continue;
        }
        done[cell.row][cell.col] = true;
        order.push(cell);
        if (sameCell(cell, end)) {
            return { order, path: tracePath(prev, end) };
        }
        // Push in reverse so the first direction (up) is explored first.
        for (const next of neighbors(cell, isOpen).reverse()) {
            if (!done[next.row][next.col]) {
                prev[next.row][next.col] = cell;
                stack.push(next);
            }
        }
    }
    return { order, path: null };
}

/* ---------- State ---------- */

const state = {
    walls: createMatrix(false),
    start: { row: 0, col: 0 },
    end: { row: 15, col: 15 },
    algorithm: "bfs",
    running: false,
    hasResult: false,
    timer: null,
};

const cells = []; // cells[row][col] -> element

const el = {
    maze: document.getElementById("maze"),
    hint: document.getElementById("hint"),
    startRow: document.getElementById("startI"),
    startCol: document.getElementById("startJ"),
    endRow: document.getElementById("endI"),
    endCol: document.getElementById("endJ"),
    algoPicker: document.getElementById("algoPicker"),
    algoDescription: document.getElementById("algoDescription"),
    speed: document.getElementById("speed"),
    speedLabel: document.getElementById("speedLabel"),
    begin: document.getElementById("start"),
    clearPath: document.getElementById("clearPath"),
    reset: document.getElementById("reset"),
    status: document.getElementById("status"),
    themeToggle: document.getElementById("themeToggle"),
};

const coordinateInputs = [el.startRow, el.startCol, el.endRow, el.endCol];

function isOpen(row, col) {
    return row >= 0 && col >= 0 && row < ROWS && col < COLS && !state.walls[row][col];
}

function isEndpoint(cell) {
    return sameCell(cell, state.start) || sameCell(cell, state.end);
}

function cellAt(cell) {
    return cells[cell.row][cell.col];
}

/* ---------- Rendering ---------- */

function buildGrid() {
    el.maze.style.setProperty("--cols", COLS);
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < ROWS; row++) {
        cells[row] = [];
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = row;
            cell.dataset.col = col;
            cells[row][col] = cell;
            fragment.appendChild(cell);
        }
    }
    el.maze.appendChild(fragment);

    el.startRow.max = el.endRow.max = ROWS - 1;
    el.startCol.max = el.endCol.max = COLS - 1;
    el.hint.textContent = `Click or drag on cells to draw walls. Rows are 0–${ROWS - 1}, columns 0–${COLS - 1}.`;
}

function buildAlgorithmPicker() {
    for (const [key, algo] of Object.entries(ALGORITHMS)) {
        const label = document.createElement("label");
        label.title = algo.name;
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "algorithm";
        input.value = key;
        input.checked = key === state.algorithm;
        const text = document.createElement("span");
        text.textContent = algo.label;
        label.append(input, text);
        el.algoPicker.appendChild(label);
    }
    el.algoPicker.addEventListener("change", (event) => {
        state.algorithm = event.target.value;
        renderAlgorithm();
        clearSearch();
        setStatus(idleMessage());
    });
    renderAlgorithm();
}

function renderAlgorithm() {
    el.algoDescription.textContent = ALGORITHMS[state.algorithm].description;
}

function paintEndpoints() {
    for (const node of el.maze.querySelectorAll(".start, .end")) {
        node.classList.remove("start", "end");
    }
    cellAt(state.start).classList.add("start");
    cellAt(state.end).classList.add("end");
}

function clearSearch() {
    for (const node of el.maze.querySelectorAll(".visited, .path")) {
        node.classList.remove("visited", "path");
    }
    state.hasResult = false;
}

function setWall(cell, on) {
    if (isEndpoint(cell) || state.walls[cell.row][cell.col] === on) {
        return;
    }
    if (state.hasResult) {
        clearSearch();
        setStatus(idleMessage());
    }
    state.walls[cell.row][cell.col] = on;
    cellAt(cell).classList.toggle("wall", on);
}

function setStatus(message, tone = "") {
    el.status.textContent = message;
    el.status.dataset.tone = tone;
}

function idleMessage() {
    return `Press Begin to run ${ALGORITHMS[state.algorithm].label}.`;
}

function setRunning(running) {
    state.running = running;
    el.begin.disabled = running;
    for (const input of coordinateInputs) {
        input.disabled = running;
    }
    for (const input of el.algoPicker.querySelectorAll("input")) {
        input.disabled = running;
    }
    el.maze.classList.toggle("is-locked", running);
}

/* ---------- Endpoint inputs ---------- */

function readCoordinate(input, max, label) {
    const raw = input.value.trim();
    const value = Number(raw);
    if (raw === "" || !Number.isInteger(value) || value < 0 || value > max) {
        return { error: `${label} must be a whole number from 0 to ${max}.` };
    }
    return { value };
}

function readEndpoints() {
    const fields = [
        [el.startRow, ROWS - 1, "Start row"],
        [el.startCol, COLS - 1, "Start column"],
        [el.endRow, ROWS - 1, "End row"],
        [el.endCol, COLS - 1, "End column"],
    ];
    const values = [];
    for (const [input, max, label] of fields) {
        const result = readCoordinate(input, max, label);
        if (result.error) {
            return { error: result.error, inputs: [input] };
        }
        values.push(result.value);
    }
    const start = { row: values[0], col: values[1] };
    const end = { row: values[2], col: values[3] };
    if (sameCell(start, end)) {
        return { error: "Start and end must be different cells.", inputs: coordinateInputs };
    }
    return { start, end };
}

// Returns true when the inputs hold valid endpoints and they were applied.
function applyEndpointInputs(showErrors) {
    for (const input of coordinateInputs) {
        input.removeAttribute("aria-invalid");
    }
    const result = readEndpoints();
    if (result.error) {
        if (showErrors) {
            for (const input of result.inputs) {
                input.setAttribute("aria-invalid", "true");
            }
            setStatus(result.error, "error");
        }
        return false;
    }

    const moved = !sameCell(result.start, state.start) || !sameCell(result.end, state.end);
    state.start = result.start;
    state.end = result.end;
    // An endpoint placed on a wall replaces the wall.
    for (const cell of [state.start, state.end]) {
        state.walls[cell.row][cell.col] = false;
        cellAt(cell).classList.remove("wall");
    }
    if (moved) {
        clearSearch();
    }
    paintEndpoints();
    if (moved || el.status.dataset.tone === "error") {
        setStatus(idleMessage());
    }
    return true;
}

/* ---------- Running ---------- */

function begin() {
    if (state.running || !applyEndpointInputs(true)) {
        return;
    }
    clearSearch();
    const algo = ALGORITHMS[state.algorithm];
    const result = algo.search(isOpen, state.start, state.end);
    setRunning(true);
    setStatus(`Running ${algo.name}…`);
    animate(result, algo);
}

function speed() {
    return SPEEDS[el.speed.value] || SPEEDS[3];
}

function animate(result, algo) {
    const explored = result.order.filter((cell) => !isEndpoint(cell));
    const route = result.path ? result.path.filter((cell) => !isEndpoint(cell)) : [];
    let i = 0;
    let j = 0;

    function visitStep() {
        if (i < explored.length) {
            cellAt(explored[i++]).classList.add("visited");
            state.timer = setTimeout(visitStep, speed().visit);
        } else {
            pathStep();
        }
    }

    function pathStep() {
        if (j < route.length) {
            const node = cellAt(route[j++]);
            node.classList.remove("visited");
            node.classList.add("path");
            state.timer = setTimeout(pathStep, speed().path);
        } else {
            finish(result, algo);
        }
    }

    state.hasResult = true;
    visitStep();
}

function finish(result, algo) {
    state.timer = null;
    setRunning(false);
    const explored = result.order.length;
    if (result.path) {
        const steps = result.path.length - 1;
        setStatus(`${algo.label} found a path of ${steps} step${steps === 1 ? "" : "s"} after exploring ${explored} cells.`, "success");
    } else {
        setStatus(`No path: ${algo.label} explored all ${explored} reachable cells without reaching the end.`, "warning");
    }
}

function cancelRun() {
    clearTimeout(state.timer);
    state.timer = null;
    setRunning(false);
}

function clearPath() {
    cancelRun();
    clearSearch();
    if (applyEndpointInputs(true)) {
        setStatus(idleMessage());
    }
}

function resetGrid() {
    cancelRun();
    clearSearch();
    state.walls = createMatrix(false);
    for (const node of el.maze.querySelectorAll(".wall")) {
        node.classList.remove("wall");
    }
    if (applyEndpointInputs(true)) {
        setStatus(idleMessage());
    }
}

/* ---------- Drawing walls ---------- */

// true while drawing walls, false while erasing, null when not drawing.
let paintMode = null;
let lastPointerType = "mouse";

function cellFromEvent(event) {
    const node = event.target.closest(".cell");
    return node ? { row: Number(node.dataset.row), col: Number(node.dataset.col) } : null;
}

function initWallDrawing() {
    el.maze.addEventListener("pointerdown", (event) => {
        lastPointerType = event.pointerType;
        // Touch toggles on tap (see click below) so the page can still scroll.
        if (event.pointerType === "touch" || event.button !== 0 || state.running) {
            return;
        }
        const cell = cellFromEvent(event);
        if (!cell || isEndpoint(cell)) {
            return;
        }
        event.preventDefault();
        // Pen input captures the pointer implicitly; release it so other cells get pointerover.
        if (event.target.hasPointerCapture(event.pointerId)) {
            event.target.releasePointerCapture(event.pointerId);
        }
        paintMode = !state.walls[cell.row][cell.col];
        setWall(cell, paintMode);
    });

    el.maze.addEventListener("pointerover", (event) => {
        if (paintMode === null) {
            return;
        }
        const cell = cellFromEvent(event);
        if (cell) {
            setWall(cell, paintMode);
        }
    });

    el.maze.addEventListener("click", (event) => {
        if (lastPointerType !== "touch" || state.running) {
            return;
        }
        const cell = cellFromEvent(event);
        if (cell) {
            setWall(cell, !state.walls[cell.row][cell.col]);
        }
    });

    const stopPainting = () => { paintMode = null; };
    window.addEventListener("pointerup", stopPainting);
    window.addEventListener("pointercancel", stopPainting);
    window.addEventListener("blur", stopPainting);
}

/* ---------- Theme ---------- */

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    el.themeToggle.setAttribute("aria-label", label);
    el.themeToggle.title = label;
    document.querySelector('meta[name="theme-color"]')
        .setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
}

function initTheme() {
    applyTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    el.themeToggle.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
            localStorage.setItem("theme", next);
        } catch (e) { /* storage unavailable: the choice lasts for this visit only */ }
    });
}

/* ---------- Setup ---------- */

function renderSpeed() {
    el.speedLabel.textContent = speed().name;
}

function init() {
    initTheme();
    buildGrid();
    buildAlgorithmPicker();
    initWallDrawing();

    for (const input of coordinateInputs) {
        input.addEventListener("input", () => applyEndpointInputs(false));
        input.addEventListener("change", () => applyEndpointInputs(true));
    }
    el.speed.addEventListener("input", renderSpeed);
    el.begin.addEventListener("click", begin);
    el.clearPath.addEventListener("click", clearPath);
    el.reset.addEventListener("click", resetGrid);

    renderSpeed();
    applyEndpointInputs(true);
    setStatus(idleMessage());
}

init();
