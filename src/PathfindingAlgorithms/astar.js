// Calculate heuristic value using Manhattan distance
function calculateHValue(currentRow, currentCol, finishRow, finishCol) {
    return Math.abs(finishRow - currentRow) + Math.abs(finishCol - currentCol);
}

// Create a cell with initial values
function createCell() {
    return {
        parent_i: -1, // Parent cell index
        parent_j: -1,
        f: 0.0,      // Total cost
        g: 0.0,      // Cost from start
        h: 0.0       // Heuristic cost
    };
}

// A* search algorithm
export function aStarSearch(grid, startRow, startCol, finishRow, finishCol, checkboxVal) {
    let cellDetails = []; // Track cell details
    let nodesVisitedInOrder = []; // Track order of visited nodes

    // Initialize cell details
    for (let row = 0; row < grid.length; ++row) {
        let cellRowNumber = [];
        for (let col = 0; col < grid[0].length; ++col) {
            let newCell = createCell();
            newCell.f = Number.MAX_VALUE; // Set initial high values
            newCell.g = Number.MAX_VALUE;
            newCell.h = Number.MAX_VALUE;
            cellRowNumber.push(newCell);
        }
        cellDetails.push(cellRowNumber);
    }

    // Set start cell details
    cellDetails[startRow][startCol] = {
        f: 0.0,
        g: 0.0,
        h: 0.0,
        parent_i: startRow,
        parent_j: startCol
    };

    // Initialize open list with start cell
    let openList = [[0.0, startRow, startCol]];

    // Direction vectors for movement
    let directionX = [-1, 0, 0, 1];
    let directionY = [0, -1, 1, 0];
    if (checkboxVal) {
        directionX = [-1, 0, 0, 1, -1, -1, 1, 1];
        directionY = [0, -1, 1, 0, -1, 1, -1, 1];
    }

    // Process nodes in the open list
    while (openList.length) {
        // Extract node with lowest f value
        let [, currentRow, currentCol] = openList.shift();
        grid[currentRow][currentCol].isVisited = true;
        let newLevel = [];

        // Explore possible directions
        for (let idx = 0; idx < directionX.length; ++idx) {
            let nextRow = currentRow + directionX[idx];
            let nextCol = currentCol + directionY[idx];
            let withinCheckbox = (idx < 4 || (idx > 3 && checkboxVal));

            // Validate move and check if finish node is reached
            if (isValid(grid, nextRow, nextCol) && withinCheckbox) {
                if (grid[nextRow][nextCol].isFinish) {
                    cellDetails[nextRow][nextCol].parent_i = currentRow;
                    cellDetails[nextRow][nextCol].parent_j = currentCol;
                    grid[nextRow][nextCol].previousNode = grid[currentRow][currentCol];
                    if (newLevel.length) nodesVisitedInOrder.push(newLevel);
                    return nodesVisitedInOrder;
                } else if (!grid[nextRow][nextCol].isVisited) {
                    let gNew = cellDetails[currentRow][currentCol].g + 1.0;
                    if (idx > 3 && withinCheckbox) gNew += 0.4; // Extra cost for diagonal
                    let hNew = calculateHValue(nextRow, nextCol, finishRow, finishCol);
                    let fNew = gNew + hNew;

                    // Update cell details and add to open list if better path found
                    if (cellDetails[nextRow][nextCol].f === Number.MAX_VALUE || cellDetails[nextRow][nextCol].f > fNew) {
                        openList.push([fNew, nextRow, nextCol]);
                        openList.sort((a, b) => a[0] - b[0]);
                        newLevel.push([nextRow, nextCol]);
                        cellDetails[nextRow][nextCol] = {
                            f: fNew,
                            g: gNew,
                            h: hNew,
                            parent_i: currentRow,
                            parent_j: currentCol
                        };
                        grid[nextRow][nextCol].previousNode = grid[currentRow][currentCol];
                    }
                }
            }
        }

        nodesVisitedInOrder.push(newLevel);
    }

    return nodesVisitedInOrder;
}

// Validate if a cell is within grid boundaries and not a wall
function isValid(grid, row, col) {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length && !grid[row][col].isWall;
}
