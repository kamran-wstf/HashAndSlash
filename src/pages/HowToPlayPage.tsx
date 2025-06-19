import React from 'react';
import NavBar from '../components/NavBar';

const HowToPlayPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 max-w-4xl mx-auto py-8 px-4">
        <div className="paper-bg rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">How to Play</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-indigo-700">Sudoku Rules</h2>
            <p className="mb-4">Sudoku is played on a 9×9 grid divided into 3×3 boxes. The goal is to fill each cell with numbers from 1 to 9 following these rules:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Each row must contain the numbers 1-9 without repetition.</li>
              <li>Each column must contain the numbers 1-9 without repetition.</li>
              <li>Each 3×3 box must contain the numbers 1-9 without repetition.</li>
              <li>The puzzle starts with some cells already filled. These cannot be changed.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-indigo-700">Game Controls</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Using the Mouse or Touch</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Click or tap a cell to select it</li>
                  <li>Click or tap a number in the number selector to place it in the selected cell</li>
                  <li>Use the Erase button to clear a cell</li>
                  <li>Toggle Notes mode to add candidate numbers to cells</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Using the Keyboard</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Arrow keys to navigate between cells</li>
                  <li>Numbers 1-9 to place a digit in the selected cell</li>
                  <li>Delete or Backspace to erase a number from a cell</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-indigo-700">Tips and Strategies</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Scanning</h3>
                <p>Look for rows, columns, or boxes that have most numbers filled. These are good starting points.</p>
              </div>
              
              <div>
                <h3 className="font-medium">Candidate Numbers</h3>
                <p>Use Notes mode to mark possible values for each cell. This helps eliminate possibilities as you fill more cells.</p>
              </div>
              
              <div>
                <h3 className="font-medium">Elimination</h3>
                <p>If a number appears in a row, column, or box, it cannot appear again in that same row, column, or box.</p>
              </div>
              
              <div>
                <h3 className="font-medium">Unique Solution</h3>
                <p>Each puzzle has only one solution. If you find yourself guessing between multiple possibilities, there's usually a logical way to determine the correct value.</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-indigo-700">Difficulty Levels</h2>
            <ul className="space-y-2">
              <li><strong>Easy:</strong> Great for beginners with many initial clues. Uses basic solving techniques.</li>
              <li><strong>Medium:</strong> Requires some experience with Sudoku and basic strategies.</li>
              <li><strong>Hard:</strong> Fewer initial clues and requires advanced solving techniques.</li>
              <li><strong>Expert:</strong> Minimal clues and requires deep logical thinking and advanced techniques.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HowToPlayPage;