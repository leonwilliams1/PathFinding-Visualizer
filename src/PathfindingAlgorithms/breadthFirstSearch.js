// Check if a cell is within grid boundaries and not a wall
function isCellValid(grid, row, col) {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length && !grid[row][col].isWall;
}

// Breadth-First Search (BFS) algorithm
export function breadthFirstSearch(grid, startRow, startCol, finishRow, finishCol, crossingCorners) {
    const nodesVisitedInOrder = []; // Track nodes in the order they are visited
    const queue = [[startRow, startCol]]; // Initialize BFS queue with the start cell

    // Direction vectors for movement
    let directionX = [-1, 1, 0, 0];
    let directionY = [0, 0, -1, 1];

    // Adjust directions for corner crossing if allowed
    if (crossingCorners) {
        directionX = [-1, -1, -1, 0, 0, 1, 1, 1];
        directionY = [-1, 0, 1, -1, 1, -1, 0, 1];
    }

    // Process nodes in the queue
    while (queue.length) {
        // Stop if finish node is found
        if (grid[finishRow][finishCol].isVisited) break;

        // Dequeue node and mark it as visited
        const [currentRow, currentCol] = queue.shift();
        grid[currentRow][currentCol].isVisited = true;

        const newLevel = []; // Track the current level of nodes

        // Explore all possible directions from the current node
        for (let i = 0; i < directionX.length; ++i) {
            const newRow = currentRow + directionX[i];
            const newCol = currentCol + directionY[i];

            // Validate the new cell
            if (isCellValid(grid, newRow, newCol) && !grid[newRow][newCol].isVisited) {
                // Enqueue valid neighbor
                queue.push([newRow, newCol]);

                // Record the cell and mark it as visited
                if (!(newRow === finishRow && newCol === finishCol)) {
                    newLevel.push([newRow, newCol]);
                }

                // Update cell's previous node reference
                grid[newRow][newCol].isVisited = true;
                grid[newRow][newCol].previousNode = grid[currentRow][currentCol];
            }
        }

        // Add the current level of nodes to the list if non-empty
        if (newLevel.length > 0) {
            nodesVisitedInOrder.push(newLevel);
        }
    }

    // Return the sequence of visited nodes
    return nodesVisitedInOrder;
}

