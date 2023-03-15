export function depthFirstSearch(grid, row, col, finRow, finCol, crossingCorners) {
    const nodesVisitedInOrder = [];
    dfs(grid, row, col, finRow, finCol, nodesVisitedInOrder, crossingCorners);
    return nodesVisitedInOrder;
}

function dfs(grid, row, col, finRow, finCol, nodesVisitedInOrder, crossingCorners) {
    let node = grid[row][col];
    node.isVisited = true;
    if (node.isFinish) return; // traverse until finish node is reached
    nodesVisitedInOrder.push(node);
    let directionx = [-1, 0, 1, 0];
    let directiony = [0, 1, 0, -1];

    if (crossingCorners) { // 8 neighbor-nodes
        directionx = [-1, -1, -1, 0, 0, 1, 1, 1];
        directiony = [-1, 0, 1, -1, 1, -1, 0, 1];
    }

    for (let i = 0; i < directionx.length && !grid[finRow][finCol].isVisited; ++i) {
        const newRow = row+directionx[i];
        const newCol = col+directiony[i];

        if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length && !grid[newRow][newCol].isVisited && !grid[newRow][newCol].isWall) {
            grid[newRow][newCol].previousNode = node;
            dfs(grid, newRow, newCol, finRow, finCol, nodesVisitedInOrder, crossingCorners);
        }
    }
}