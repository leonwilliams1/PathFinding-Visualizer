import React from 'react'; 
import './Node.css'; 


export default class Node extends React.Component {
    // Render method defines the node's visual representation
    render() {
        const {
            row, // Node's row position
            col, // Node's column position
            isStart, // Indicates if this is the start node
            isFinish, // Indicates if this is the finish node
            isWall, // Indicates if this is a wall
            onMouseDown, // Handles mouse press to update node
            onMouseEnter, // Handles mouse move to update node
            onMouseUp, // Completes node update on mouse release
        } = this.props;

        // Determine additional CSS class based on node type
        const extraClassName = isStart
            ? 'node-start'
            : isFinish
            ? 'node-finish'
            : isWall
            ? 'node-wall'
            : '';

        return (
            <div
                id={`node-${row}-${col}`} // Unique identifier for node
                className={`node ${extraClassName}`} // Apply base and conditional classes
                onMouseDown={() => onMouseDown(row, col)} // Start node update on mouse press
                onMouseEnter={() => onMouseEnter(row, col)} // Update node on mouse move
                onMouseUp={() => onMouseUp()} // Finalize update on mouse release
            >
            </div>
        );
    }
}
