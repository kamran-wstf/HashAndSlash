import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { checkHNSTokenBalance, checkGameTokenBalance, checkUserBalances } from '../utils/gameStart';
import { ethers } from 'ethers';
import { RefreshCw, Wallet, Coins, Gamepad2 } from 'lucide-react';

export const BalanceChecker: React.FC = () => {
    const { isConnected, address } = useWalletStore();
    const [balances, setBalances] = useState({
        hnsBalance: BigInt(0),
        gameTokenBalance: BigInt(0),
        totalPoints: BigInt(0),
        availablePoints: BigInt(0)
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkBalances = async () => {
        if (!isConnected || !address) {
            setError('Please connect your wallet first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const userBalances = await checkUserBalances(address, provider);
            setBalances(userBalances);
        } catch (err) {
            console.error('Error checking balances:', err);
            setError('Failed to check balances. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && address) {
            checkBalances();
        }
    }, [isConnected, address]);

    const formatBalance = (balance: bigint) => {
        return Number(balance) / 1e18;
    };

    if (!isConnected) {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <div className="flex items-center gap-2 text-gray-300 mb-4">
                    <Wallet size={20} />
                    <h3 className="text-lg font-semibold">Balance Checker</h3>
                </div>
                <p className="text-gray-400">Please connect your wallet to check balances</p>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white">
                    <Wallet size={20} />
                    <h3 className="text-lg font-semibold">Balance Checker</h3>
                </div>
                <button
                    onClick={checkBalances}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm text-white"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* HNS Token Balance */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div className="flex items-center gap-2">
                        <Coins size={18} className="text-yellow-400" />
                        <span className="text-gray-300">HNS Token Balance:</span>
                    </div>
                    <div className="text-white font-medium">
                        {loading ? 'Loading...' : `${formatBalance(balances.hnsBalance).toFixed(4)} HNS`}
                    </div>
                </div>

                {/* Game Token Balance */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div className="flex items-center gap-2">
                        <Gamepad2 size={18} className="text-green-400" />
                        <span className="text-gray-300">SUDOKU Game Tokens:</span>
                    </div>
                    <div className="text-white font-medium">
                        {loading ? 'Loading...' : `${formatBalance(balances.gameTokenBalance).toFixed(2)} SUDOKU`}
                    </div>
                </div>

                {/* Total Points */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <span className="text-gray-300">Total Points:</span>
                    <div className="text-white font-medium">
                        {loading ? 'Loading...' : formatBalance(balances.totalPoints).toFixed(0)}
                    </div>
                </div>

                {/* Available Points */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <span className="text-gray-300">Available Points:</span>
                    <div className="text-white font-medium">
                        {loading ? 'Loading...' : formatBalance(balances.availablePoints).toFixed(0)}
                    </div>
                </div>
            </div>

            {/* Game Start Status */}
            <div className="mt-4 p-3 bg-white/5 rounded">
                <div className="text-sm text-gray-300 mb-2">Game Start Status:</div>
                {balances.gameTokenBalance >= BigInt(ethers.utils.parseEther('1').toString()) ? (
                    <div className="text-green-400 text-sm">✅ Ready to start game (1 SUDOKU token available)</div>
                ) : balances.hnsBalance >= BigInt(ethers.utils.parseEther('1').toString()) ? (
                    <div className="text-yellow-400 text-sm">⚠️ Can purchase game token with HNS</div>
                ) : (
                    <div className="text-red-400 text-sm">❌ Insufficient balance to start game</div>
                )}
            </div>
        </div>
    );
};
