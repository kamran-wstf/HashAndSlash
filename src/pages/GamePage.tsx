import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SudokuBoard from '../components/SudokuBoard';
import NumberSelector from '../components/NumberSelector';
import GameControls from '../components/GameControls';
import GameTimer from '../components/GameTimer';
import GameStats from '../components/GameStats';
import PauseOverlay from '../components/PauseOverlay';
import WinModal from '../components/WinModal';
import NavBar from '../components/NavBar';
import GameNotification from '../components/GameNotification';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useStatsStore } from '../stores/statsStore';
import { playSound } from '../utils/audio';
import { WalletConnect } from '../components/WalletConnect';
import { useWalletStore } from '../stores/walletStore';
import Loader from '../components/Loader';
import GameSidebar from '../components/GameSidebar';
import { submitGameBatch } from '../utils/contract';
import { ethers } from 'ethers';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWalletStore();

  const {
    board,
    status,
    elapsedTime,
    moves,
    errors,
    difficulty,
    initializeGame,
    resumeGame,
    activityLog,
    points
  } = useGameStore();

  const { recordGameCompletion } = useStatsStore();

  const [showWinModal, setShowWinModal] = useState(false);

  // Check if the game is initialized
  useEffect(() => {
    // If the game is in idle state, navigate back to home
    if (status === 'idle') {
      navigate('/');
    }
  }, [status, navigate]);

  // Check for game completion
  useEffect(() => {
    if (status === 'completed' && !showWinModal) {
      // Play completion sound
      playSound('complete');

      // Record game stats
      recordGameCompletion(difficulty, elapsedTime, moves, errors);

      // Show win modal after a short delay
      setTimeout(() => {
        setShowWinModal(true);
      }, 500);
    }
  }, [status, showWinModal, difficulty, elapsedTime, moves, errors, recordGameCompletion]);

  // Handle starting a new game
  const handleNewGame = () => {
    initializeGame(difficulty);
    setShowWinModal(false);
  };

  // Update document title
  useEffect(() => {
    document.title = status === 'paused'
      ? '⏸️ Game Paused - Sudoku'
      : 'Sudoku';

    return () => {
      document.title = 'Sudoku';
    };
  }, [status]);

  // Handle visibility change (auto-pause when tab is not visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === 'playing') {
        useGameStore.getState().pauseGame();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status]);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // End game handler
  const handleEndGame = async () => {
    console.log("activity logs", activityLog)
    const actions = activityLog.map(act => ({
      timestamp: act.timestamp,
      actionType: 1,
      value: act.value === null ? 0 : act.value,
      scoreChange: act.correct ? 5 : -2
    }));

    // Use a valid bytes32 value for finalStateHash
    const finalStateHash = ethers.utils.formatBytes32String("10"); // Replace "10" with your actual state hash if available

    await submitGameBatch(1, actions, points, finalStateHash, '0x');
    alert("endgame clicked 00");
  };

  return (
    <div className="min-h-screen flex flex-col">

      <NavBar />

      <main className="flex-1 max-w-6xl mx-auto py-6 px-4 flex gap-6">
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">
              <span className="capitalize">{difficulty}</span> Puzzle
            </h1>

            <div className="flex gap-4 items-center">
              <GameTimer />
              <div className="bg-paper-200 px-4 py-2 rounded-md shadow">
                <GameStats />
              </div>
            </div>
          </div>

          <SudokuBoard />
          <NumberSelector />
          <GameControls />
        </div>
        <GameSidebar onEndGame={handleEndGame} />
      </main>

      {status === 'paused' && <PauseOverlay />}

      {showWinModal && (
        <WinModal
          time={elapsedTime}
          moves={moves}
          errors={errors}
          difficulty={difficulty}
          onNewGame={handleNewGame}
        />
      )}

      <GameNotification />
    </div>
  );
};

export default GamePage;