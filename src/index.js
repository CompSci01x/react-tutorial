import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a,b,c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {symbol: squares[a], squares: [a,b,c]}
    }
  }
  return null;
}

function colLabel(i) {
  switch(i) {
    case 0:
      return 'A'
    case 1:
      return 'B'
    case 2:
      return 'C'
  }
}

// * --- Square Section ---
function Square(props) {
  return (
    <td 
      className={props.isWinningSquare ? "square-highlight" : "square"} 
      onClick={props.onClick}
      >
      {props.value}
    </td>
  );
}

// * --- Board Section ---
class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        isWinningSquare={this.props.winningSquares.includes(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(rowLabel, rowObj) {
    const row = [];
    // create row label
    row.push(
      <th key={`rowLabel-${rowLabel}`} className="row-label">{rowLabel}</th> 
    );

    for (let i = rowObj.start; i < rowObj.end; i++) {
      row.push(this.renderSquare(i))
    }
    return row;
  }

  createRows() {
    const rows = [];
    for (let i = 0; i < 9; i+=3) {
      rows.push(
        <tr key={i}>
          {this.renderRow(i/3, {start: i, end: i+3})}
        </tr>
      );
  }
  return rows;
}

  createColHeaders() {
    const colHeaders = [];

    // create a placeholder col label
    colHeaders.push(
      <th key={`colLabel-placeholder`}></th>
    );

    for (let i = 0; i < 3; i++) {
      colHeaders.push(
        <th key={`colLabel-${i}`}>
          {colLabel(i)}
        </th>
      );
    }
    return (
      <tr>{colHeaders}</tr>
    );
  }

  render() {
    return (
      <div>
        <div className="status"></div>
        <table>
          <tbody>
            {this.createColHeaders()}
            {this.createRows()}
          </tbody>
        </table>
      </div>
    );
  }
}

// * --- Game Section --- 
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        col: null,
        row: null
      }],
      stepNumber: 0,
      xIsNext: true,
      selectedMove: null,
      isDescendingSortOrder: false
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        col: Math.trunc(i % 3),
        row: Math.trunc(i / 3)
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      selectedMove: null
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      selectedMove: step
    });
  }

  changeSortOrder() {
    this.setState({
      isDescendingSortOrder: !this.state.isDescendingSortOrder
    });
  }

  listOrder(moves) {
    if (this.state.isDescendingSortOrder) {
      return(
        <ol start={moves.length - 1} reversed> {moves} </ol>
      );
    }
    return(
      <ol start={0}> {moves} </ol>
    );
  }

  render() {
    const historyCopy = this.state.isDescendingSortOrder ? 
    this.state.history.slice().reverse() : 
    this.state.history.slice();

    const moves = historyCopy.map((step, move) => {
      if (this.state.isDescendingSortOrder) {
        move = (historyCopy.length - 1) - move
      }
      
      const desc = move ?
      `Go to move #${move} (col: ${colLabel(step.col)}, row: ${step.row})` :
      'Go to game start';
      
      return (
        <li key={move}>
          <button
            className={this.state.selectedMove === move ? "highlight" : "no-highlight"}
            onClick={() => this.jumpTo(move)}
          >{desc}</button>
        </li>
      );
    });

    const current = this.state.history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    
    let status;
    if (winner) {
      status = 'Winner: ' + winner.symbol
    } else if (this.state.stepNumber < 9) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      status = 'Draw'
    }
    
    const sortOrder = this.state.isDescendingSortOrder ? "Sort in ascending order" : "Sort in descending order"

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winner ? winner.squares : []}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div className="status"> {status} </div>
          <div className="status">
            <button onClick={() => this.changeSortOrder()}>
              {sortOrder}
            </button>
          </div>
          {this.listOrder(moves)}
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
