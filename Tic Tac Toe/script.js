const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let humanMark = "";
let aiMark = "";
let gameOver = false;
let aiBusy = false;
let aiTimer = null;
let aiScore = 0;
let yourScore = 0;

function findText(text) {
  const nodes = document.querySelectorAll("body *");
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    const isLeaf = el.children.length === 0;
    const content = (el.textContent || "").trim();
    if (isLeaf && content === text) {
      return el;
    }
  }
  return null;
}

function findScoreEl(prefix) {
  const nodes = document.querySelectorAll("body *");
  for (let i = nodes.length - 1; i >= 0; i--) {
    const el = nodes[i];
    const isLeaf = el.children.length === 0;
    const content = (el.textContent || "").trim();
    if (isLeaf && content.startsWith(prefix)) {
      return el;
    }
  }
  return null;
}

const chooseXBtn = document.getElementById("choose-x") || findText("X");
const chooseOBtn = document.getElementById("choose-o") || findText("O");
const restartBtn = document.getElementById("restart-btn") || findText("Restart");
const statusEl = document.getElementById("status") || findText("Draw!") || findText("Choose");
const aiScoreEl = document.getElementById("ai-score") || findScoreEl("AI Score");
const yourScoreEl = document.getElementById("your-score") || findScoreEl("Your Score");

let cells = Array.from(document.querySelectorAll(".cell, .box"));
if (cells.length !== 9) {
  cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map((num) => findText(String(num)))
    .filter(Boolean);
}

function updateScores() {
  if (aiScoreEl) aiScoreEl.textContent = "AI Score : " + aiScore;
  if (yourScoreEl) yourScoreEl.textContent = "Your Score : " + yourScore;
}

function setStatus(msg) {
  if (statusEl) {
    statusEl.textContent = msg;
  }
}

function selectSide(chosen) {
  clearTimeout(aiTimer);
  humanMark = chosen;
  aiMark = chosen === "X" ? "O" : "X";
  gameOver = false;
  aiBusy = false;

  for (let i = 0; i < cells.length; i++) {
    cells[i].textContent = "";
  }

  setStatus("Your turn (" + humanMark + ")");
}

function checkWinner(mark) {
  for (let i = 0; i < winPatterns.length; i++) {
    const [a, b, c] = winPatterns[i];
    const v1 = cells[a].textContent.trim();
    const v2 = cells[b].textContent.trim();
    const v3 = cells[c].textContent.trim();
    if (v1 === mark && v2 === mark && v3 === mark) {
      return true;
    }
  }
  return false;
}

function isBoardFull() {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].textContent.trim() === "") {
      return false;
    }
  }
  return true;
}

function handleRoundEnd(winner) {
  gameOver = true;
  aiBusy = false;

  if (winner === "human") {
    yourScore += 1;
    updateScores();
    setStatus("You win!");
  } else if (winner === "ai") {
    aiScore += 1;
    updateScores();
    setStatus("AI wins!");
  } else {
    setStatus("Draw!");
  }
}

function makeAiMove() {
  if (gameOver || !aiMark) return;

  const emptyCells = [];
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].textContent.trim() === "") {
      emptyCells.push(cells[i]);
    }
  }

  if (emptyCells.length === 0) {
    handleRoundEnd("draw");
    return;
  }

  const pickIndex = Math.floor(Math.random() * emptyCells.length);
  emptyCells[pickIndex].textContent = aiMark;

  if (checkWinner(aiMark)) {
    handleRoundEnd("ai");
    return;
  }

  if (isBoardFull()) {
    handleRoundEnd("draw");
    return;
  }

  aiBusy = false;
  setStatus("Your turn (" + humanMark + ")");
}

function onCellClick(cell) {
  if (!humanMark || gameOver || aiBusy) return;
  if (cell.textContent.trim() !== "") return;

  cell.textContent = humanMark;

  if (checkWinner(humanMark)) {
    handleRoundEnd("human");
    return;
  }

  if (isBoardFull()) {
    handleRoundEnd("draw");
    return;
  }

  aiBusy = true;
  setStatus("AI thinking...");
  aiTimer = setTimeout(makeAiMove, 350);
}

function restartRound() {
  clearTimeout(aiTimer);
  gameOver = false;
  aiBusy = false;

  for (let i = 0; i < cells.length; i++) {
    cells[i].textContent = "";
  }

  if (humanMark) {
    setStatus("Your turn (" + humanMark + ")");
  } else {
    setStatus("Choose X or O");
  }
}

for (let i = 0; i < cells.length; i++) {
  cells[i].addEventListener("click", function () {
    onCellClick(cells[i]);
  });
}

if (chooseXBtn) {
  chooseXBtn.addEventListener("click", function () {
    selectSide("X");
  });
}

if (chooseOBtn) {
  chooseOBtn.addEventListener("click", function () {
    selectSide("O");
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", restartRound);
}