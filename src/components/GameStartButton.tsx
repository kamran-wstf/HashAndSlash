import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2, AlertCircle } from 'lucide-react';
import { useGameStart } from '../hooks/useGameStart';
import { useWalletStore } from '../stores/walletStore';

interface GameStartButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    showBalances?: boolean;
}

export const GameStartButton: React.FC<GameStartButtonProps> = ({
    className = '',
    variant = 'default',
    size = 'md',
    showBalances = false,
}) => {
    const navigate = useNavigate();
    const { isConnected, address } = useWalletStore();
    const {
        isSubmitting,
        balances,
        error,
        startGame,
        checkBalances,
        clearError,
        canStartGame,
    } = useGameStart();

    // Check balances when component mounts or wallet connects
    useEffect(() => {
        if (isConnected && address) {
            checkBalances();
        }
    }, [isConnected, address, checkBalances]);

    const getButtonClasses = () => {
        const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const sizeClasses = {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 py-2',
            lg: 'h-12 px-6 text-lg',
        };

        const variantClasses = {
            default: 'bg-indigo-600 text-white hover:bg-indigo-700',
            outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
            ghost: 'hover:bg-gray-100 text-gray-700',
        };

        return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
    };

    const handleStartGame = async () => {
        clearError();
        await startGame();

        // Navigate to game page on success
        if (!error) {
            navigate('/game');
        }
    };

    const formatBalance = (balance: bigint) => {
        return Number(balance) / 1e18;
    };

    if (!isConnected) {
        return (
            <div className="text-center">
                <button
                    className={`${getButtonClasses()} bg-blue-600 hover:bg-blue-700`}
                    onClick={() => {/* Trigger wallet connection */ }}
                >
                    <Play size={20} />
                    Connect Wallet to Play
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Balance Display */}
            {showBalances && (
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                    <h3 className="text-sm font-semibold text-white mb-2">Your Balances</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-300">SUDOKU Tokens:</span>
                            <div className="font-medium text-white">
                                {formatBalance(balances.gameTokenBalance).toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-300">HNS Balance:</span>
                            <div className="font-medium text-white">
                                {formatBalance(balances.hnsBalance).toFixed(4)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle size={16} />
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
            )}

            {/* Start Game Button */}
            <button
                className={getButtonClasses()}
                onClick={handleStartGame}
                disabled={isSubmitting || !canStartGame}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Starting Game...
                    </>
                ) : (
                    <>
                        <Play size={20} />
                        {balances.gameTokenBalance > 0n ? 'Start Game' : 'Buy Token & Start'}
                    </>
                )}
            </button>

            {/* Insufficient Balance Warning */}
            {balances.gameTokenBalance === 0n && balances.hnsBalance === 0n && (
                <div className="text-center text-sm text-yellow-400">
                    <p>You need SUDOKU tokens or HNS to play</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Get tokens from the marketplace or earn them by playing
                    </p>
                </div>
            )}
        </div>
    );
};
