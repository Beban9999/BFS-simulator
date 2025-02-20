bigList = [];
sPath = "";
let useBFS = true;

function toggleAlgorithm() {
    useBFS = !useBFS;
    document.getElementById("toggleAlgo").innerText = useBFS ? "Switch to DFS" : "Switch to BFS";
}

function paintEverything() {
    resetColor();
    document.getElementById("alert").innerHTML = "";
    var begI = document.getElementById("startI").value;
    var begJ = document.getElementById("startJ").value;
    var endI = document.getElementById("endI").value;
    var endJ = document.getElementById("endJ").value;
    if (begI == "" || begJ == "" || endI == "" || endJ == "") {
        document.getElementById("alert").innerHTML = "Enter all values!";
        return;
    }
    var beg = begI + " " + begJ;
    var end = endI + " " + endJ;

    document.getElementById(beg).style.background = "green";
    document.getElementById(end).style.background = "red";
}

function reset() {
    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            curr = i + " " + j;
            document.getElementById(curr).removeAttribute("style");
        }
    }
    paintEverything();
}

function resetColor() {
    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            curr = i + " " + j;
            if (!document.getElementById(curr).classList.contains("obs")) {
                document.getElementById(curr).style.background = "rgb(65, 64, 64)";
            }
        }
    }
}

function Ops(a) {
    if (!a.classList.contains("obs")) {
        a.classList.add("obs");
        a.style = "";
    } else {
        a.classList.remove("obs");
    }
}

function isValid(ii, jj, validMat) {
    if (ii < 0 || jj < 0 || ii > 19 || jj > 19) {
        return false;
    }
    if (validMat[ii][jj] == true) {
        return false;
    }
    isobs = document.getElementById(ii + " " + jj);
    if (isobs.classList.contains("obs")) {
        return false;
    }
    return true;
}

function doBfs(begI, begJ, endI, endJ) {
    var ending = endI + " " + endJ;
    var movX = [-1, 0, 1, 0];
    var movY = [0, 1, 0, -1];
    var validMat = [];
    for (var i = 0; i < 20; i++) {
        validMat[i] = [];
        for (var j = 0; j < 20; j++) {
            validMat[i].push(false);
        }
    }
    validMat[begI][begJ] = true;
    var q = [[begI, begJ, ""]];
    while (q.length) {
        var curr = q.pop();
        bigList.push(curr[0] + " " + curr[1]);
        if (curr[0] == endI && curr[1] == endJ) {
            sPath = curr[2];
            break;
        }
        for (var i = 0; i < 4; i++) {
            var ii = parseInt(curr[0]) + parseInt(movX[i]);
            var jj = parseInt(curr[1]) + parseInt(movY[i]);
            if (isValid(ii, jj, validMat)) {
                q.unshift([ii, jj, curr[2] + ii + " " + jj + "|"]);
                validMat[ii][jj] = true;
            }
        }
    }
    index = 1;
    let interval = setInterval(function () {
        if (document.getElementById(bigList[index]) == null) {
            clearInterval(interval);
            bigList = [];
            enableButtons();
            return;
        }
        document.getElementById(bigList[index]).style.background = "yellow";
        document.getElementById(bigList[index++]).style.transition = "0.2s";
        if (bigList[index - 1] == ending) {
            clearInterval(interval);
            bigList = [];
            ssPath = sPath.split("|");
            let ind = 0;
            document.getElementById(ssPath[ssPath.length - 2]).style.background = "red";
            let intPath = setInterval(function () {
                document.getElementById(ssPath[ind]).style.background = "lightblue";
                ind++;
                if (ind == ssPath.length - 2) {
                    clearInterval(intPath);
                    enableButtons();
                }
            }, 100);
        }
    }, 10);
}

function doDfs(begI, begJ, endI, endJ) {
    var ending = endI + " " + endJ;
    var movX = [-1, 0, 1, 0];
    var movY = [0, 1, 0, -1];
    var validMat = [];
    for (var i = 0; i < 20; i++) {
        validMat[i] = [];
        for (var j = 0; j < 20; j++) {
            validMat[i].push(false);
        }
    }
    validMat[begI][begJ] = true;
    var stack = [[begI, begJ, ""]];
    while (stack.length) {
        var curr = stack.pop();
        bigList.push(curr[0] + " " + curr[1]);
        if (curr[0] == endI && curr[1] == endJ) {
            sPath = curr[2];
            break;
        }
        for (var i = 0; i < 4; i++) {
            var ii = parseInt(curr[0]) + parseInt(movX[i]);
            var jj = parseInt(curr[1]) + parseInt(movY[i]);
            if (isValid(ii, jj, validMat)) {
                stack.push([ii, jj, curr[2] + ii + " " + jj + "|"]);
                validMat[ii][jj] = true;
            }
        }
    }
    index = 1;
    let interval = setInterval(function () {
        if (document.getElementById(bigList[index]) == null) {
            clearInterval(interval);
            bigList = [];
            enableButtons();
            return;
        }
        document.getElementById(bigList[index]).style.background = "yellow";
        document.getElementById(bigList[index++]).style.transition = "0.2s";
        if (bigList[index - 1] == ending) {
            clearInterval(interval);
            bigList = [];
            ssPath = sPath.split("|");
            let ind = 0;
            document.getElementById(ssPath[ssPath.length - 2]).style.background = "red";
            let intPath = setInterval(function () {
                document.getElementById(ssPath[ind]).style.background = "lightblue";
                ind++;
                if (ind == ssPath.length - 2) {
                    clearInterval(intPath);
                    enableButtons();
                }
            }, 100);
        }
    }, 10);
}

function startAlgo() {
    resetColor();
    document.getElementById("alert").innerHTML = "";
    var begI = document.getElementById("startI").value;
    var begJ = document.getElementById("startJ").value;
    var endI = document.getElementById("endI").value;
    var endJ = document.getElementById("endJ").value;
    if (begI == "" || begJ == "" || endI == "" || endJ == "") {
        document.getElementById("alert").innerHTML = "Enter all values!";
        return;
    }
    var beg = begI + " " + begJ;
    var end = endI + " " + endJ;

    document.getElementById(beg).style.background = "green";
    document.getElementById(end).style.background = "red";

    disableButtons();

    if (useBFS) {
        doBfs(begI, begJ, endI, endJ);
    } else {
        doDfs(begI, begJ, endI, endJ);
    }
}

function disableButtons() {
    document.getElementById("reset").disabled = true;
    document.getElementById("toggleAlgo").disabled = true;
}

function enableButtons() {
    document.getElementById("reset").disabled = false;
    document.getElementById("toggleAlgo").disabled = false;
}

document.addEventListener("DOMContentLoaded", function() {
    reset();
});

for (var i = 0; i < 20; i++) {
    for (var j = 0; j < 20; j++) {
        document.getElementById("maze").innerHTML += "<div class='cell' onmousedown='Ops(this)' id='" + i + ' ' + j + "'></div>";
    }
}