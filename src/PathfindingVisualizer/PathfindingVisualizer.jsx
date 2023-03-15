import React from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css';
import { depthFirstSearch } from '../PathfindingAlgorithms/depthFirstSearch';
import { breadthFirstSearch } from '../PathfindingAlgorithms/breadthFirstSearch';
import { dijkstrasAlgo } from '../PathfindingAlgorithms/dijkstra';
import { aStarSearch } from '../PathfindingAlgorithms/astar';
import { bidirectionalSearch } from '../PathfindingAlgorithms/bidirectionalSearch';

// Constants defining initial grid dimensions and positions
var ROWS = 0;
var COLS = 53;
var NODE_STARTING_ROW = 9;
var NODE_STARTING_COLUMN = 9;
var NODE_FINISH_ROW = 9;
var NODE_FINISH_COL = 43;

export default class PathfindingVisualizer extends React.Component {
    constructor(props) {
        super(props);
        // Initialize state to manage grid, UI interactions, and dimensions
        this.state = {
            grid: [],
            mousePressed: false,
            crossingCorners: false,
            animationOngoing: false,
            width: 0,
            height: 0,
        };
    }

    componentDidMount() {
        // Set up initial grid and handle window resize events
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        const grid = getInitialGrid();
        this.setState({ grid });
    }

    updateWindowDimensions = () => {
        // Adjust grid and UI elements based on window size changes
        this.setState({ width: window.innerWidth, height: window.innerHeight });
        const grid = getInitialGrid();
        this.setState({ grid });
        calculateDimensions();
        this.resetDimension();

        // Update button labels based on window width for better UX
        if (window.innerWidth >= 740 && window.innerWidth < 1440) {
            document.getElementById('bfs-button').innerText = 'Breadth-first search';
            document.getElementById('dfs-button').innerText = 'Depth-first search';
        } else {
            document.getElementById('bfs-button').innerText = 'BFS';
            document.getElementById('dfs-button').innerText = 'DFS';
        }
    }

    resetDimension() {
        // Reset node classes to default unless they are start or finish nodes
        const { grid } = this.state;
        for (let row = 0; row < grid.length; ++row) {
            for (let col = 0; col < grid[0].length; ++col) {
                if (!grid[row][col].isStart && !grid[row][col].isFinish) {
                    document.getElementById(`node-${row}-${col}`).className = 'node';
                }
            }
        }
    }


    toggleButtons = () => {
        // Adjust button opacity based on whether an animation is ongoing
        let buttons = document.querySelectorAll('button');
        for (let i = 0; i < buttons.length; ++i) {
            if (this.state.animationOngoing) {
                buttons[i].style = 'opacity: 1';
            } else {
                buttons[i].style = 'opacity: 0.65';
            }
        }
        this.setState({ animationOngoing: !this.state.animationOngoing });
    }

    toggleCheckbox = () => {
        // Toggle the state to enable or disable corner crossing
        this.setState({ crossingCorners: !this.state.crossingCorners });
    }


    handleMouseEnter(row, col) {
        // Update the grid as the mouse is dragged over nodes to create or remove walls
        if (!this.state.mousePressed) return;
        if (this.state.grid[row][col].isStart || this.state.grid[row][col].isFinish) return;
        const oldNodeIsWall = this.state.grid[row][col].isWall;
        const newGrid = this.state.grid;
        newGrid[row][col] = createNode(row, col);
        newGrid[row][col].isWall = !oldNodeIsWall;
        this.setState({ grid: newGrid });
    }

    handleMouseDown(row, col) {
        // Update the grid when the mouse is pressed and dragged to create or remove walls
        if (this.state.grid[row][col].isStart || this.state.grid[row][col].isFinish) return;
        const oldNodeIsWall = this.state.grid[row][col].isWall;
        const newGrid = this.state.grid;
        newGrid[row][col] = createNode(row, col);
        newGrid[row][col].isWall = !oldNodeIsWall;
        this.setState({ grid: newGrid, mousePressed: true });
    }



    handleMouseUp() {
        // Stop grid updates when the mouse button is released
        this.setState({ mousePressed: false });
    }

    animateFoundPath(path) {
        // Visualize the path found by the algorithm
        for (let i = 1; i < path.length - 1; ++i) {
            const node = path[i];
            setTimeout(() => {
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-path';
            }, 25 * i);
        }
    }

    retrievePath(finishNode) {
        // Extract the path from the finish node to the start node
        const path = [];
        let node = finishNode;
        while (node !== null) {
            path.push(node);
            node = node.previousNode;
        }
        return path;
    }

    createRandomGrid() {
        // Generate a grid with a random distribution of obstacles
        this.removePaths();
        const grid = getInitialGrid();
        const NUMBER_OF_OBSTACLES = Math.floor((ROWS * COLS) / 5);
        for (let i = 0; i < NUMBER_OF_OBSTACLES; ++i) {
            let x = Math.floor(Math.random() * ROWS);
            let y = Math.floor(Math.random() * COLS);
            if (!grid[x][y].isWall && !grid[x][y].isStart && !grid[x][y].isFinish) {
                grid[x][y] = createNode(x, y);
                grid[x][y].isWall = true;
            }
        }
        this.setState({ grid });
    }

    resetGrid() {
        // Reset the grid to its initial state except for start and finish nodes
        const grid = getInitialGrid();
        for (let row = 0; row < ROWS; ++row) {
            for (let col = 0; col < COLS; ++col) {
                if (!(row === NODE_STARTING_ROW && col === NODE_STARTING_COLUMN) && !(row === NODE_FINISH_ROW && col === NODE_FINISH_COL)) {
                    document.getElementById(`node-${row}-${col}`).className = 'node';
                }
            }
        }
        this.setState({ grid });
    }

    removePaths() {
        // Restore the grid to its initial state, preserving walls and resetting paths
        const initialGrid = getInitialGrid();
        const walls = this.retrieveWalls();
        for (let i = 0; i < walls.length; ++i) {
            const [row, col] = walls[i];
            initialGrid[row][col].isWall = true;
            document.getElementById(`node-${row}-${col}`).className = 'node node-wall';
        }
        this.setState({ grid: initialGrid });
    }

    retrieveWalls() {
        // Collect the coordinates of all wall nodes for pathfinding algorithms
        const { grid } = this.state;
        const walls = [];
        for (let row = 0; row < ROWS; ++row) {
            for (let col = 0; col < COLS; ++col) {
                if (grid[row][col].isWall) {
                    walls.push([row, col]);
                }
                if (!grid[row][col].isStart && !grid[row][col].isFinish) {
                    document.getElementById(`node-${row}-${col}`).className = 'node';
                }
            }
        }
        return walls;
    }



    aStar() {
        // Execute the A* pathfinding algorithm and animate its progress
        this.toggleButtons();
        this.removePaths();
        const { grid } = this.state;
        const checkboxVal = (document.getElementById('check').checked === true);
        const visitedNodesInOrder = aStarSearch(grid, NODE_STARTING_ROW, NODE_STARTING_COLUMN, NODE_FINISH_ROW, NODE_FINISH_COL, checkboxVal);
        const path = this.retrievePath(grid[NODE_FINISH_ROW][NODE_FINISH_COL]);
        for (let i = 0; i <= visitedNodesInOrder.length; ++i) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateFoundPath(path);
                }, 34 * i);
                setTimeout(() => {
                    this.toggleButtons();
                }, 34 * i + 25 * (path.length + 1));
                return;
            }
            setTimeout(() => {
                for (let j = 0; j < visitedNodesInOrder[i].length; ++j) {
                    const [row, col] = visitedNodesInOrder[i][j];
                    document.getElementById(`node-${row}-${col}`).className = 'node node-explore';
                }
            }, 34 * i);
        }
    }

    dijkstra() {
        // Execute Dijkstra's algorithm and animate its progress
        this.toggleButtons();
        this.removePaths();
        const { grid } = this.state;
        const checkboxVal = (document.getElementById('check').checked === true);
        const visitedNodesInOrder = dijkstrasAlgo(grid, NODE_STARTING_ROW, NODE_STARTING_COLUMN, checkboxVal);
        const path = this.retrievePath(grid[NODE_FINISH_ROW][NODE_FINISH_COL]);
        for (let i = 0; i <= visitedNodesInOrder.length; ++i) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateFoundPath(path);
                }, 20 * i);
                setTimeout(() => {
                    this.toggleButtons();
                }, 20 * i + 25 * (path.length + 1));
                return;
            }
            setTimeout(() => {
                for (let j = 0; j < visitedNodesInOrder[i].length; ++j) {
                    const node = visitedNodesInOrder[i][j];
                    const row = node.row;
                    const col = node.col;
                    if (!grid[row][col].isFinish)
                        document.getElementById(`node-${row}-${col}`).className = 'node node-explore';
                }
            }, 20 * i);
        }
    }



    bfs() {
        // Start the BFS algorithm visualization by preparing the UI and grid.
        this.toggleButtons(); // Disable buttons to prevent user interactions during animation.
        this.removePaths(); // Clear any existing paths to ensure a fresh visualization.
    
        const { grid } = this.state;
        const finishNode = grid[NODE_FINISH_ROW][NODE_FINISH_COL];
        const checkboxVal = (document.getElementById('check').checked === true); // Check the user setting for allowing corner crossing.
    
        // Run the BFS algorithm to get the order of nodes visited and the path from start to finish.
        const visitedNodesInOrder = breadthFirstSearch(grid, NODE_STARTING_ROW, NODE_STARTING_COLUMN, NODE_FINISH_ROW, NODE_FINISH_COL, checkboxVal);
        const path = this.retrievePath(finishNode); // Retrieve the shortest path found by BFS.
    
        // Animate the visualization of BFS exploration and path.
        for (let i = 0; i <= visitedNodesInOrder.length; ++i) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateFoundPath(path); // Highlight the final path after BFS completes.
                }, 15 * i);
    
                setTimeout(() => {
                    this.toggleButtons(); // Re-enable buttons after animation completes.
                }, 15 * i + 25 * (path.length + 1));
    
                return;
            }
    
            setTimeout(() => {
                for (let j = 0; j < visitedNodesInOrder[i].length; ++j) {
                    const [row, col] = visitedNodesInOrder[i][j];
                    document.getElementById(`node-${row}-${col}`).className = 'node node-explore'; // Visualize nodes being explored by BFS.
                }
            }, 15 * i);
        }
    }
    
    dfs() {
        // Start the DFS algorithm visualization by preparing the UI and grid.
        this.toggleButtons(); // Disable buttons to prevent user interactions during animation.
        this.removePaths(); // Clear any existing paths to ensure a fresh visualization.
    
        const { grid } = this.state;
        const checkboxVal = (document.getElementById('check').checked === true); // Check the user setting for allowing corner crossing.
    
        // Run the DFS algorithm to get the order of nodes visited and the path from start to finish.
        const visitedNodesInOrder = depthFirstSearch(grid, NODE_STARTING_ROW, NODE_STARTING_COLUMN, NODE_FINISH_ROW, NODE_FINISH_COL, checkboxVal);
        const path = this.retrievePath(grid[NODE_FINISH_ROW][NODE_FINISH_COL]); // Retrieve the path found by DFS.
    
        // Animate the visualization of DFS exploration and path.
        for (let i = 1; i <= visitedNodesInOrder.length; ++i) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateFoundPath(path); // Highlight the final path after DFS completes.
                }, 30 * i);
    
                setTimeout(() => {
                    this.toggleButtons(); // Re-enable buttons after animation completes.
                }, 30 * i + 25 * (path.length + 1));
    
                return;
            }
    
            const node = visitedNodesInOrder[i];
    
            setTimeout(() => {
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-explore'; // Visualize nodes being explored by DFS.
            }, 30 * i);
        }
    }
    
    bidirectionalSearch() {
        // Start the Bidirectional Search algorithm visualization by preparing the UI and grid.
        this.toggleButtons(); // Disable buttons to prevent user interactions during animation.
        this.removePaths(); // Clear any existing paths to ensure a fresh visualization.
    
        const { grid } = this.state;
        const checkboxVal = (document.getElementById('check').checked === true); // Check the user setting for allowing corner crossing.
    
        // Run the Bidirectional Search algorithm to get the visited nodes and start/end nodes from both directions.
        let [visitedNodesInOrder, leftNode, rightNode] = bidirectionalSearch(grid, NODE_STARTING_ROW, NODE_STARTING_COLUMN, NODE_FINISH_ROW, NODE_FINISH_COL, checkboxVal);
        let path = [];
    
        // Construct the path from the finish node back to the start node.
        while (!rightNode.isFinish) {
            path.push(rightNode);
            rightNode = rightNode.previousNode;
        }
        path.push(grid[NODE_FINISH_ROW][NODE_FINISH_COL]);
        path.reverse(); // Reverse the path to ensure it starts from the start node.
    
        // Continue constructing the path from the start node.
        while (!leftNode.isStart) {
            path.push(leftNode);
            leftNode = leftNode.previousNode;
        }
        path.push(grid[NODE_STARTING_ROW][NODE_STARTING_COLUMN]);
    
        // Animate the visualization of Bidirectional Search exploration and path.
        for (let i = 0; i <= visitedNodesInOrder.length; ++i) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateFoundPath(path); // Highlight the final path after Bidirectional Search completes.
                }, 25 * i);
    
                setTimeout(() => {
                    this.toggleButtons(); // Re-enable buttons after animation completes.
                }, 25 * i + 25 * (path.length + 1));
    
                return;
            }
    
            setTimeout(() => {
                for (let j = 0; j < visitedNodesInOrder[i].length; ++j) {
                    const [row, col] = visitedNodesInOrder[i][j];
                    document.getElementById(`node-${row}-${col}`).className = 'node node-explore'; // Visualize nodes being explored by Bidirectional Search.
                }
            }, 25 * i);
        }
    }
    


    render() {
         
        const {grid, mousePressed} = this.state;
    
        return (
            <>
                
                <div className='button-container'>
                    
                    <h2 id='bar-title'>Pathfinding Visualizer</h2>
    
                    {/* Provide interactive buttons for user control over the grid and algorithms */}
                    <button className='grid-buttons' disabled={this.state.animationOngoing} onClick={() => this.resetGrid()}>
                        RESET GRID
                    </button>
    
                    
                    <button className='grid-buttons' disabled={this.state.animationOngoing} onClick={() => this.removePaths()}>
                        CLEAR PATHS
                    </button>
    
                    
                    <label className='corner-label'>
                        Allow crossing corners
                        
                        <input type='checkbox' id='check' checked={this.state.crossingCorners} onChange={this.toggleCheckbox}/>
                    </label>
    
                    
                    <button className='algo-buttons' disabled={this.state.animationOngoing} onClick={() => this.dijkstra()}>
                        Dijkstra's algo
                    </button>
    
                    
                    <button className='algo-buttons' disabled={this.state.animationOngoing} onClick={() => this.aStar()}>
                        A* Search
                    </button>
    
                    
                    <button className='algo-buttons' disabled={this.state.animationOngoing} onClick={() => this.bidirectionalSearch()}>
                        Bidirectional Search
                    </button>
    
                    
                    <button className='algo-buttons' id='bfs-button' disabled={this.state.animationOngoing} onClick={() => this.bfs()}>
                        BFS
                    </button>
    
                    
                    <button className='algo-buttons' id='dfs-button' disabled={this.state.animationOngoing} onClick={() => this.dfs()}>
                        DFS
                    </button>
    
                    
                    <button className='additional-buttons' disabled={this.state.animationOngoing} onClick={() => this.createRandomGrid()}>
                        CREATE RANDOM GRID
                    </button>
                </div>
    
                
                <div className='grid'>
                    
                    {grid.map((row, rowIdx) => {
                        return (
                            <div className='rows-distinct' key={rowIdx}>
                                
                                {row.map((node, nodeIdx) => {
                                    const {row, col, isStart, isFinish, isWall} = node; 
                                    return (
                                        <Node
                                            key={nodeIdx} 
                                            row={row} 
                                            col={col} 
                                            isStart={isStart} 
                                            isFinish={isFinish} 
                                            isWall={isWall} 
                                            mousePressed={mousePressed} 
                                            onMouseDown={(row, col) => this.handleMouseDown(row, col)} 
                                            onMouseEnter={(row, col) => this.handleMouseEnter(row, col)} 
                                            onMouseUp={() => this.handleMouseUp()}> 
                                        </Node>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

            </>
        );
    }
}

// Helper functions for grid calculation and node creation

const calculateDimensions = () => {
    // Calculate grid dimensions based on the current window size to ensure responsive layout.

    ROWS = Math.floor((window.innerHeight - 200) / 28); 
    COLS = Math.floor((window.innerWidth - 50) / 28); 
    NODE_STARTING_ROW = Math.floor(ROWS / 2); 
    if (ROWS % 2 !== 1) --NODE_STARTING_ROW; 
    NODE_FINISH_ROW =  NODE_STARTING_ROW; 
    NODE_STARTING_COLUMN = Math.floor(COLS / 6); 
    NODE_FINISH_COL = COLS - NODE_STARTING_COLUMN - 1;
}

const getInitialGrid = () => {
    // Initialize the grid with nodes, each configured based on its position.
    const grid = []; 
    calculateDimensions(); 

    
    for (let row = 0; row < ROWS; ++row) {
        const curRow = []; 

        
        for (let col = 0; col < COLS; ++col) {
            curRow.push(createNode(row, col)); 
        }

        grid.push(curRow); 
    }

    return grid; 
}

const createNode = (row, col) => {
    // Create and return a node object with properties set based on its position in the grid.
    return {
        row, 
        col, 
        isStart: row === NODE_STARTING_ROW && col === NODE_STARTING_COLUMN, 
        isFinish: row === NODE_FINISH_ROW && col === NODE_FINISH_COL, 
        distance: Infinity, 
        isVisited: false, 
        isWall: false, 
        previousNode: null, 
    };
};