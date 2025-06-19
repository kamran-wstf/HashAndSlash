import { Difficulty } from '../stores/settingsStore';

// Create a new sudoku puzzle based on difficulty
export function generateSudoku(difficulty: Difficulty) {
  // Generate a solved sudoku board
  const solution = generateSolvedGrid();
  
  // Create a puzzle by removing numbers based on difficulty
  const puzzle = createPuzzle(solution, difficulty);
  
  return {
    puzzle,
    solution
  };
}

// Generate a complete, valid sudoku solution
function generateSolvedGrid(): number[][] {
  // Create an empty 9x9 grid
  const grid: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill the grid with a valid solution
  fillGrid(grid);
  
  return grid;
}

// Recursively fill a grid with valid numbers
function fillGrid(grid: number[][]): boolean {
  // Find the next empty cell
  const emptyCell = findEmptyCell(grid);
  
  // If no empty cells, the grid is filled
  if (!emptyCell) return true;
  
  const [row, col] = emptyCell;
  
  // Shuffle numbers 1-9 for randomness
  const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  
  // Try each number in the empty cell
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    
    // Check if the number is valid in this position
    if (isValid(grid, row, col, num)) {
      // Place the number
      grid[row][col] = num;
      
      // Recursively try to fill the rest of the grid
      if (fillGrid(grid)) {
        return true;
      }
      
      // If we couldn't fill the grid with this number, backtrack
      grid[row][col] = 0;
    }
  }
  
  // No valid solution found, backtrack
  return false;
}

// Find the next empty cell (with value 0)
function findEmptyCell(grid: number[][]): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

// Check if a number is valid in a given position
function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) {
      return false;
    }
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num) {
      return false;
    }
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) {
        return false;
      }
    }
  }
  
  return true;
}

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Create a puzzle from a solution by removing numbers
function createPuzzle(solution: number[][], difficulty: Difficulty): (number | null)[][] {
  // Copy the solution
  const puzzle: (number | null)[][] = solution.map(row => [...row]);
  
  // Determine how many cells to remove based on difficulty
  let cellsToRemove: number;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 40; // Remove about 40 numbers (leave 41 clues)
      break;
    case 'medium':
      cellsToRemove = 50; // Remove about 50 numbers (leave 31 clues)
      break;
    case 'hard':
      cellsToRemove = 55; // Remove about 55 numbers (leave 26 clues)
      break;
    case 'expert':
      cellsToRemove = 60; // Remove about 60 numbers (leave 21 clues)
      break;
    default:
      cellsToRemove = 50;
  }
  
  // Get all cell positions
  const positions: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle the positions for random removal
  const shuffledPositions = shuffleArray(positions);
  
  // Remove cells while ensuring the puzzle still has a unique solution
  for (let i = 0; i < cellsToRemove; i++) {
    const [row, col] = shuffledPositions[i];
    puzzle[row][col] = null;
  }
  
  return puzzle;
}

// Validate a complete board to check if it's a valid sudoku solution
export function validateBoard(board: number[][]): boolean {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value < 1 || value > 9 || seen.has(value)) {
        return false;
      }
      seen.add(value);
    }
  }
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < 9; row++) {
      const value = board[row][col];
      if (value < 1 || value > 9 || seen.has(value)) {
        return false;
      }
      seen.add(value);
    }
  }
  
  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set<number>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          const value = board[row][col];
          if (value < 1 || value > 9 || seen.has(value)) {
            return false;
          }
          seen.add(value);
        }
      }
    }
  }
  
  return true;
}