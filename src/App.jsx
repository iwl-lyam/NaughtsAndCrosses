import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ProbabilitySidebar from './ProbabilitySidebar';

const SERVER_URL = 'https://intelligence.itwithlyam.co.uk:1231';
const emptyBoard = Array(9).fill(null);

const Square = ({ value, onClick, highlight }) => (
  <button
    className={`w-20 h-20 text-4xl flex items-center justify-center border border-gray-500 ${
      highlight ? 'bg-red-600' : 'bg-gray-800'
    }`}
    onClick={onClick}
    disabled={value !== null}
  >
    {value}
  </button>
);

const TicTacToe = () => {
  const [board, setBoard] = useState([...emptyBoard]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [gameId, setGameId] = useState(uuidv4());
  const [status, setStatus] = useState('Your turn (X)');
  const [prevProbabilities, setPrevProbabilities] = useState(Array(9).fill(0));

  const checkWinner = (b) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
    for (let [a, b1, c] of lines)
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    return b.every(cell => cell!==null) ? 'draw' : null;
  };

  const handleClick = async (i) => {
    if (!isPlayerTurn || board[i] !== null) return;

    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    setHighlightIndex(null);

    const winner = checkWinner(newBoard);
    if (winner) return endGame(winner);

    try {
      const pRes = await fetch(`${SERVER_URL}/probabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: newBoard }),
      });
      const pData = await pRes.json();
      setPrevProbabilities(pData.probabilities);

      const evalRes = await fetch(`${SERVER_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldState: board, newMove: i, gameId }),
      });
      const data = await evalRes.json();
      setGameId(data.gameId);

      const updated = [...newBoard];
      updated[data.move] = 'O';
      setHighlightIndex(data.move);
      setTimeout(() => setHighlightIndex(null), 1000);
      setBoard(updated);

      const win = checkWinner(updated);
      if (win) return endGame(win);

      setIsPlayerTurn(true);
    } catch (error) {
      console.error('Error during MENACE turn:', error);
      setStatus('Server error – check console');
    }
  };

  const endGame = async (result) => {
    let msg = result==='X'? 'You win!' : result==='O'? 'MENACE wins!' : "It's a draw!";
    setStatus(msg);
    setIsPlayerTurn(false);

    try {
      await fetch(`${SERVER_URL}/gameover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          result: result==='X'? 'menace_loss' : result==='O'? 'menace_win' : 'draw'
        }),
      });
    } catch (e) {
      console.error('Error posting game result:', e);
    }

    setTimeout(resetGame, 100);
  };

  const resetGame = () => {
    setBoard([...emptyBoard]);
    setGameId(uuidv4());
    setIsPlayerTurn(true);
    setHighlightIndex(null);
    setStatus('Your turn (X)');
    setPrevProbabilities(Array(9).fill(0));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex gap-1">
      {/* Left: board */}
      <div className="w-2/3 flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-4">Naughts and Crosses</h1>
        <div className="grid grid-cols-3 gap-1">
          {board.map((val, idx) => (
            <Square
              key={idx}
              value={val}
              onClick={() => handleClick(idx)}
              highlight={highlightIndex===idx}
            />
          ))}
        </div>
        <p className="mt-4 text-xl">{status}</p>
        <button
          onClick={resetGame}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
        >
          Reset Game
        </button>
      </div>

      {/* Right: sidebar centered vertically */}
      <div className=" self-center">
        <ProbabilitySidebar probabilities={prevProbabilities} />
      </div>
    </div>
  );
};

export default TicTacToe;
