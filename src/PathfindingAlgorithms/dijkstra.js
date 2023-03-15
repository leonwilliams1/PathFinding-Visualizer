export function dijkstrasAlgo(grid, row, col, crossingCorners) {
    const visitedNodesInOrder = []; // Track nodes in the order they are visited
    grid[row][col].distance = 0; // Set the distance of the start node to 0
    const nodes = []; // List of all nodes to be processed

    // Populate nodes list with non-wall cells
    for (let i = 0; i < grid.length; ++i) {
        for (let j = 0; j < grid[0].length; ++j) {
            if (!grid[i][j].isWall) {
                nodes.push([i, j]);
            }
        }
    }

    // Sort nodes by distance in non-descending order
    nodes.sort((nodeA, nodeB) => grid[nodeA[0]][nodeA[1]].distance - grid[nodeB[0]][nodeB[1]].distance);
    
    // Direction vectors for 4-way movement
    let directionx = [0, 0, -1, 1];
    let directiony = [-1, 1, 0, 0];
    const n = nodes.length - 1;

    // Adjust directions for corner crossing if allowed
    if (crossingCorners) {
        directionx = [-1, -1, -1, 0, 0, 1, 1, 1];
        directiony = [-1, 0, 1, -1, 1, -1, 0, 1];
    }

    // Process nodes until the end is reached or all nodes are processed
    for (let i = 0; i < n; ++i) {
        const [currentRow, currentCol] = nodes.shift(); // Get the node with the smallest distance
        grid[currentRow][currentCol].isVisited = true; // Mark node as visited
        if (grid[currentRow][currentCol].isFinish) break; // Stop if finish node is reached

        const nodesExplored = []; // Track nodes explored in the current iteration

        // Explore all possible directions from the current node
        for (let j = 0; j < directionx.length; ++j) {
            const newRow = currentRow + directionx[j];
            const newCol = currentCol + directiony[j];

            // Skip invalid or visited cells, or walls
            if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) continue;
            if (grid[newRow][newCol].isVisited || grid[newRow][newCol].isWall) continue;

            // Update distance and previous node if a shorter path is found
            if (grid[currentRow][currentCol].distance + 1 < grid[newRow][newCol].distance) {
                grid[newRow][newCol].distance = grid[currentRow][currentCol].distance + 1;
                grid[newRow][newCol].previousNode = grid[currentRow][currentCol];
                nodesExplored.push(grid[newRow][newCol]); // Save newly added nodes
            }
        }

        if (nodesExplored.length) visitedNodesInOrder.push(nodesExplored); // Add explored nodes to the result
        // Re-sort nodes by distance
        nodes.sort((nodeA, nodeB) => grid[nodeA[0]][nodeA[1]].distance - grid[nodeB[0]][nodeB[1]].distance);
    }

    // Return the sequence of visited nodes
    return visitedNodesInOrder;
}
