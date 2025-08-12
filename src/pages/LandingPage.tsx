import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/walletStore';
import { useGameStore } from '../stores/gameStore';
import { GameStartWithBalances } from '../components/GameStartWithBalances';
import { WalletConnect } from '../components/WalletConnect';
import { Coins, Gamepad2, AlertCircle, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isConnected, address } = useWalletStore();
  const { balances, canUserPlay, checkBalances } = useGameStore();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkBalances();
    }
  }, [isConnected, address, checkBalances]);

  const handleCheckBalances = async () => {
    if (!isConnected) return;

    setIsChecking(true);
    try {
      await checkBalances();
    } catch (error) {
      console.error('Failed to check balances:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const formatBalance = (balance: bigint) => {
    return Number(balance) / 1e18;
  };

  const canStartGame = canUserPlay();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow">
            Welcome to Sudoku XDC
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Play Sudoku, earn rewards, and connect your wallet on the XDC Network!
          </p>

          {/* Token Requirements */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🎮 Game Requirements</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                <Gamepad2 size={24} className="text-green-400" />
                <div>
                  <div className="text-white font-medium">SD Tokens</div>
                  <div className="text-gray-400 text-sm">1 SD token per game</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                <Coins size={24} className="text-yellow-400" />
                <div>
                  <div className="text-white font-medium">HNS Tokens</div>
                  <div className="text-gray-400 text-sm">Can purchase SD tokens</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20 text-center">
            <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-6">
              Connect your wallet to check your token balance and start playing
            </p>
            <WalletConnect />
          </div>
        ) : (
          /* Balance Display and Game Access */
          <div className="space-y-6">
            {/* Balance Checker */}
            <GameStartWithBalances />

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleCheckBalances}
                  disabled={isChecking}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {isChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <Coins size={20} />
                      Refresh Balances
                    </>
                  )}
                </button>

                {canStartGame ? (
                  <Link
                    to="/game"
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <CheckCircle size={20} />
                    Start Playing
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-gray-300 rounded-lg">
                    <AlertCircle size={20} />
                    Need 1 SD Token
                  </div>
                )}
              </div>
            </div>

            {/* Current Balances */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Your Current Balances</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <Gamepad2 size={20} className="text-green-400" />
                    <span className="text-gray-300">SD Tokens:</span>
                  </div>
                  <div className="text-white font-medium">
                    {formatBalance(balances.gameTokenBalance).toFixed(2)} SD
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <Coins size={20} className="text-yellow-400" />
                    <span className="text-gray-300">HNS Tokens:</span>
                  </div>
                  <div className="text-white font-medium">
                    {formatBalance(balances.hnsBalance).toFixed(4)} HNS
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Make sure you have sufficient tokens before starting a game
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
