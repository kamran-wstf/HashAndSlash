import React, { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useWalletStore } from '../stores/walletStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Play, Loader2, AlertCircle, Coins, Gamepad2 } from 'lucide-react';
import { ethers } from 'ethers';

export const GameStartWithBalances: React.FC = () => {
    const { isConnected, address } = useWalletStore();
    const { difficulty } = useSettingsStore();
    const {
        balances,
        blockchainError,
        initializeGame,
        checkBalances,
        clearBlockchainError,
        status
    } = useGameStore();

    const [isStarting, setIsStarting] = React.useState(false);

    useEffect(() => {
        if (isConnected && address) {
            checkBalances();
        }
    }, [isConnected, address, checkBalances]);

    const handleStartGame = async () => {
        if (!isConnected || !address) {
            return;
        }

        setIsStarting(true);
        clearBlockchainError();

        try {
            const result = await initializeGame(difficulty);
            if (!result.success) {
                console.error('Failed to start game:', result.error);
            }
        } catch (error) {
            console.error('Error starting game:', error);
        } finally {
            setIsStarting(false);
        }
    };

    const formatBalance = (balance: bigint) => {
        return Number(balance) / 1e18;
    };

    const canStartGame = balances.gameTokenBalance >= BigInt(ethers.utils.parseEther('1').toString());

    if (!isConnected) {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <div className="text-center">
                    <AlertCircle size={24} className="text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
                    <p className="text-gray-400">Please connect your wallet to start playing</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Your Balances</h3>

            {/* Balance Display */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div className="flex items-center gap-2">
                        <Gamepad2 size={18} className="text-green-400" />
                        <span className="text-gray-300">SD Tokens:</span>
                    </div>
                    <div className="text-white font-medium">
                        {formatBalance(balances.gameTokenBalance).toFixed(2)} SD
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div className="flex items-center gap-2">
                        <Coins size={18} className="text-yellow-400" />
                        <span className="text-gray-300">HNS Tokens:</span>
                    </div>
                    <div className="text-white font-medium">
                        {formatBalance(balances.hnsBalance).toFixed(4)} HNS
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {blockchainError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle size={16} />
                        <span className="text-sm">{blockchainError}</span>
                    </div>
                </div>
            )}

            {/* Game Start Status */}
            <div className="mb-4 p-3 bg-white/5 rounded">
                <div className="text-sm text-gray-300 mb-2">Game Start Status:</div>
                {canStartGame ? (
                    <div className="text-green-400 text-sm">✅ Ready to start game (1 SD token available)</div>
                ) : balances.hnsBalance > BigInt(0) ? (
                    <div className="text-yellow-400 text-sm">⚠️ Can purchase SD tokens with HNS</div>
                ) : (
                    <div className="text-red-400 text-sm">❌ Insufficient balance to start game</div>
                )}
            </div>

            {/* Start Game Button */}
            <button
                onClick={handleStartGame}
                disabled={isStarting || !canStartGame || status === 'playing'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
                {isStarting ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Starting Game...
                    </>
                ) : (
                    <>
                        <Play size={20} />
                        Start Game
                    </>
                )}
            </button>

            {/* Insufficient Balance Warning */}
            {!canStartGame && balances.gameTokenBalance === BigInt(0) && balances.hnsBalance === BigInt(0) && (
                <div className="mt-3 text-center text-sm text-yellow-400">
                    <p>You need at least 1 SD token or HNS to play</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Get tokens from the marketplace or earn them by playing
                    </p>
                </div>
            )}
        </div>
    );
};
