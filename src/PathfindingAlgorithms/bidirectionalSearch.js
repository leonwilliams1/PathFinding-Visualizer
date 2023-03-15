// Function to check if a cell is valid: within grid boundaries and not a wall
function isCellValid(grid, row, col) {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length && !grid[row][col].isWall;
}

// Main function for Bidirectional Search algorithm
export function bidirectionalSearch(grid, startRow, startCol, finishRow, finishCol, crossingCorners) {
    // List to track the order in which nodes are visited
    const nodesVisitedInOrder = [];

    // Queues for BFS from start and finish nodes
    let startQueue = [[startRow, startCol]];
    let finishQueue = [[finishRow, finishCol]];

    // Direction vectors for 4-way movement
    let directionX = [-1, 1, 0, 0];
    let directionY = [0, 0, -1, 1];

    // If corner crossing is allowed, use 8-way movement
    if (crossingCorners) {
        directionX = [-1, -1, -1, 0, 0, 1, 1, 1];
        directionY = [-1, 0, 1, -1, 1, -1, 0, 1];
    }

    // Table to track visited nodes from the finish node's perspective
    let visitedFromFinish = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(false));

    // Perform BFS from both start and finish nodes
    while (startQueue.length || finishQueue.length) {
        // Process nodes from the start queue
        const [currentRowStart, currentColStart] = startQueue.length ? startQueue.shift() : [-1, -1];
        // Process nodes from the finish queue
        const [currentRowFinish, currentColFinish] = finishQueue.length ? finishQueue.shift() : [-1, -1];

        if (isCellValid(grid, currentRowStart, currentColStart)) {
            grid[currentRowStart][currentColStart].isVisited = true;
        }
        if (isCellValid(grid, currentRowFinish, currentColFinish)) {
            visitedFromFinish[currentRowFinish][currentColFinish] = true;
        }

        // Array to hold the current level of nodes
        let newLevel = [];

        // Explore all possible directions
        for (let i = 0; i < directionX.length; ++i) {
            const newRowStart = currentRowStart + directionX[i];
            const newColStart = currentColStart + directionY[i];
            const newRowFinish = currentRowFinish + directionX[i];
            const newColFinish = currentColFinish + directionY[i];

            // Check intersection for the start queue
            if (isCellValid(grid, newRowStart, newColStart) && !grid[newRowStart][newColStart].isVisited && !grid[newRowStart][newColStart].isWall) {
                if (visitedFromFinish[newRowStart][newColStart]) {
                    if (newLevel.length) nodesVisitedInOrder.push(newLevel);
                    return [nodesVisitedInOrder, grid[currentRowStart][currentColStart], grid[newRowStart][newColStart]];
                }

                grid[newRowStart][newColStart].isVisited = true;
                grid[newRowStart][newColStart].previousNode = grid[currentRowStart][currentColStart];
                startQueue.push([newRowStart, newColStart]);
                newLevel.push([newRowStart, newColStart]);
            }

            // Check intersection for the finish queue
            if (isCellValid(grid, newRowFinish, newColFinish) && !visitedFromFinish[newRowFinish][newColFinish] && !grid[newRowFinish][newColFinish].isWall) {
                if (grid[newRowFinish][newColFinish].isVisited) {
                    if (newLevel.length) nodesVisitedInOrder.push(newLevel);
                    return [nodesVisitedInOrder, grid[newRowFinish][newColFinish], grid[currentRowFinish][currentColFinish]];
                }

                visitedFromFinish[newRowFinish][newColFinish] = true;
                grid[newRowFinish][newColFinish].previousNode = grid[currentRowFinish][currentColFinish];
                finishQueue.push([newRowFinish, newColFinish]);
                newLevel.push([newRowFinish, newColFinish]);
            }
        }

        // Add the current level to the visited nodes list if not empty
        if (newLevel.length) {
            nodesVisitedInOrder.push(newLevel);
        }
    }

    // Return the visited nodes and the start and finish nodes
    return [nodesVisitedInOrder, grid[startRow][startCol], grid[finishRow][finishCol]];
}
