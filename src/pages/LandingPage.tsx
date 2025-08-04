import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
    <h1 className="text-5xl font-bold mb-6 text-indigo-800 drop-shadow">Welcome to Sudoku XDC</h1>
    <p className="mb-8 text-lg text-indigo-700">Play Sudoku, earn rewards, and connect your wallet on the XDC Apothem Network!</p>
    <Link
      to="/"
      className="px-8 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-xl font-semibold"
    >
      Enter Game
    </Link>
  </div>
);

export default LandingPage;
