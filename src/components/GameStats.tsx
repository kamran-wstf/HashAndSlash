import React from 'react';
import { useGameStore } from '../stores/gameStore';

const GameStats: React.FC = () => {
  const { moves, errors } = useGameStore();

  return (
    <div className="flex justify-around">
      <div className="text-center">
        <p className="text-sm text-gray-600">Moves</p>
        <p className="text-xl font-semibold">{moves}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Errors</p>
        <p className="text-xl font-semibold">{errors}</p>
      </div>
    </div>
  );
};

export default GameStats;