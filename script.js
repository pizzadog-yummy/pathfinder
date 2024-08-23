let cWidth = 0;
let cHeight = 0;

let isDragging = false;
let isMouseDown = false;

function cellAt(x, y) {
  const tile = document.querySelector(`.x-${x}.y-${y}`);
  return tile;
}

function cfc(className) {
  const all = document.getElementsByClassName(className);
  list = [];
  for (let i = 0; i < all.length; i++) {
    list.push(all[i].classList);
  }
}

function generate() {
  const width = parseInt(document.getElementById("width").value, 10);
  const height = parseInt(document.getElementById("height").value, 10);
  cWidth = width;
  cHeight = height;
  const maze = document.getElementById("maze");

  if (
    isNaN(width) ||
    isNaN(height) ||
    width < 1 ||
    height < 1 ||
    width > 20 ||
    height > 20
  ) {
    alert("Error! Width and height must be integers between 1 and 20.");
    return;
  }

  maze.style.gridTemplateColumns = `repeat(${width}, 30px)`;
  maze.style.gridTemplateRows = `repeat(${height}, 30px)`;

  // Clear existing grid
  maze.innerHTML = "";

  // Generate new grid
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement("div");
    cell.classList.add(
      "cell",
      "value0",
      `x-${i % width}`,
      `y-${Math.floor(i / width)}`
    );
    cell.dataset.value = "0";
    cell.addEventListener("mousedown", handleMouseDown);
    cell.addEventListener("mouseover", handleMouseOver);
    maze.appendChild(cell);
  }

  maze.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("cell")) {
      isDragging = true;
      isMouseDown = true;
      handleMouseDown.call(e.target, e);
    }
  });

  maze.addEventListener("mouseup", () => {
    isDragging = false;
    isMouseDown = false;
  });

  maze.addEventListener("mouseleave", () => {
    isDragging = false;
  });
}

function handleMouseDown(e) {
  e.preventDefault();
  if (!isMouseDown) return;
  const currentValue = parseInt(this.dataset.value, 10);
  const newValue = (currentValue + 1) % 2;
  this.dataset.value = newValue;
  // Update class names
  const baseClasses = "cell value" + newValue;
  const xClass = Array.from(this.classList).find((cls) => cls.startsWith("x-"));
  const yClass = Array.from(this.classList).find((cls) => cls.startsWith("y-"));
  this.className = `${baseClasses} ${xClass} ${yClass}`;
}

function handleMouseOver(e) {
  if (isDragging && e.target.classList.contains("cell")) {
    handleMouseDown.call(e.target, e);
  }
}

function shortestPath(maze, k) {
  const rows = maze.length;
  const cols = maze[0].length;
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  let start = null;
  let end = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] === "S") {
        start = [r, c];
      } else if (maze[r][c] === "E") {
        end = [r, c];
      }
    }
  }

  // BFS queue: [current position, steps taken, remaining bypasses]
  const queue = [[start, 0, k]];
  const visited = new Set([`${start}-${k}`]);
  const parent = new Map();

  while (queue.length > 0) {
    const [[r, c], steps, bypasses] = queue.shift();

    if (r === end[0] && c === end[1]) {
      let path = [];
      let current = [r, c];

      while (current.toString() !== start.toString()) {
        path.push(current);
        current = parent.get(current.toString());
      }
      path.push(start);
      path.reverse();

      path.forEach(([pr, pc]) => {
        if (maze[pr][pc] !== "S" && maze[pr][pc] !== "E") {
          maze[pr][pc] = "*";
        }
      });

      return [steps, maze];
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (maze[nr][nc] === "#") {
          continue;
        } else if (maze[nr][nc] === "T" && bypasses > 0) {
          const state = `${[nr, nc]}-${bypasses - 1}`;
          if (!visited.has(state)) {
            visited.add(state);
            queue.push([[nr, nc], steps + 1, bypasses - 1]);
            parent.set([nr, nc].toString(), [r, c]);
          }
        } else if (maze[nr][nc] === "." || maze[nr][nc] === "E") {
          const state = `${[nr, nc]}-${bypasses}`;
          if (!visited.has(state)) {
            visited.add(state);
            queue.push([[nr, nc], steps + 1, bypasses]);
            parent.set([nr, nc].toString(), [r, c]);
          }
        }
      }
    }
  }

  return [-1, maze];
}

function solve() {
  let bypasses = 0; // disabled bc it doesnt work

  const getForCell = (num) => {
    if (num === 0) return ".";
    if (num === 1) return "#";
    if (num === 2) return "T";
  };

  let bMaze = [];
  for (let i = 0; i < cHeight; i++) {
    const row = Array.from(document.getElementsByClassName(`y-${i}`)).map(
      (cell) => getForCell(parseInt(cell.dataset.value, 10))
    );
    bMaze.push(row);
  }

  console.log("Current Maze State:", bMaze);

  const startX = parseInt(document.getElementById("start-x").value, 10);
  const startY = parseInt(document.getElementById("start-y").value, 10);
  const endX = parseInt(document.getElementById("end-x").value, 10);
  const endY = parseInt(document.getElementById("end-y").value, 10);

  // Mark start and end points on the maze
  bMaze[startY - 1][startX - 1] = "S";
  bMaze[endY - 1][endX - 1] = "E";

  const [steps, newMaze] = shortestPath(bMaze, bypasses);
  console.log("Steps taken:", steps);
  console.log("Maze after solving:", newMaze);
  document.getElementById("steps").textContent = `Steps taken: ${steps}`;

  for (let i = 0; i < cHeight; i++) {
    for (let ii = 0; ii < cWidth; ii++) {
      let tile = newMaze[i][ii];
      if (tile === "*" || tile === "S" || tile === "E") {
        cellAt(ii, i).classList.add("path");
      }
    }
  }
}
