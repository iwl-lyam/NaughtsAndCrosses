import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOXES_FILE = path.join(__dirname, 'matchboxes.json');
const INITIAL_BEADS = 3;
const WIN_REWARD = 3;
const DRAW_REWARD = 1;
const LOSS_PENALTY = 1;

// Load or initialize matchboxes
let matchboxes = {};
try {
  const data = await fs.readFile(BOXES_FILE, 'utf-8');
  matchboxes = JSON.parse(data);
} catch {
  console.log('No existing matchboxes.json found, starting fresh.');
}

// In-memory map: gameId → array of { stateKey, move }
const gameHistories = {};

const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

function keyFromBoard(board) {
  return board.map(cell => cell === null ? '-' : cell).join('');
}

async function saveBoxes() {
  await fs.writeFile(BOXES_FILE, JSON.stringify(matchboxes, null, 2));
}

function weightedChoice(moves, beads) {
  let total = moves.reduce((sum, idx) => sum + beads[idx], 0);
  let r = Math.random() * total;
  for (let idx of moves) {
    if (r < beads[idx]) return idx;
    r -= beads[idx];
  }
  return moves[0]; // fallback
}

app.post('/evaluate', async (req, res) => {
  const { oldState, newMove, gameId } = req.body;
  const board = [...oldState];
  board[newMove] = 'X';

  const stateKey = keyFromBoard(board);
  if (!matchboxes[stateKey]) {
    matchboxes[stateKey] = {
      beads: board.map((c, i) => c === null ? INITIAL_BEADS : 0)
    };
    await saveBoxes();
  }

  const box = matchboxes[stateKey];
  const moves = board
    .map((c, i) => c === null && box.beads[i] > 0 ? i : null)
    .filter(i => i !== null);

  if (moves.length === 0) {
    moves.push(...board.map((c, i) => c === null ? i : null).filter(i => i !== null));
  }

  const choice = weightedChoice(moves, box.beads);

  if (!gameHistories[gameId]) gameHistories[gameId] = [];
  gameHistories[gameId].push({ stateKey, move: choice });

  res.json({ move: choice, gameId });
});

app.post('/gameover', async (req, res) => {
  const { gameId, result } = req.body;
  const history = gameHistories[gameId] || [];
  delete gameHistories[gameId];

  for (const { stateKey, move } of history) {
    const box = matchboxes[stateKey];
    if (!box) continue;

    if (result === 'menace_win') {
      box.beads[move] += WIN_REWARD;
    } else if (result === 'draw') {
      box.beads[move] += DRAW_REWARD;
    } else if (result === 'menace_loss') {
      box.beads[move] = Math.max(1, box.beads[move] - LOSS_PENALTY);
    }
  }

  await saveBoxes();
  res.send(`Reinforced ${history.length} moves for game ${gameId}`);
});

// POST /probabilities
// { board: Array<null|'X'|'O'> }
// → { beads: number[9], probabilities: number[9] }
app.post('/probabilities', async (req, res) => {
    const { board } = req.body;
    const stateKey = keyFromBoard(board);
  
    // if we’ve never seen this position, create a fresh box
    if (!matchboxes[stateKey]) {
      matchboxes[stateKey] = {
        beads: board.map(c => c === null ? INITIAL_BEADS : 0)
      };
      await saveBoxes();
    }
  
    const beads = matchboxes[stateKey].beads;
    const total = beads.reduce((sum, b) => sum + b, 0) || 1;
    const probabilities = beads.map(b => +(b / total).toFixed(2));
    res.json({ beads, probabilities });
  });
  

const PORT = 3000;
app.listen(PORT, () => console.log(`MENACE server listening on port ${PORT}`));
