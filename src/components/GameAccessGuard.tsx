import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useWalletStore } from '../stores/walletStore';
import { Loader2, AlertCircle } from 'lucide-react';

interface GameAccessGuardProps {
    children: React.ReactNode;
}

export const GameAccessGuard: React.FC<GameAccessGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const { isConnected, address } = useWalletStore();
    const { balances, canUserPlay, checkBalances } = useGameStore();
    const [isChecking, setIsChecking] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (!isConnected || !address) {
                // If not connected, redirect to landing
                navigate('/landing');
                return;
            }

            try {
                setIsChecking(true);
                await checkBalances();
                setHasChecked(true);
            } catch (error) {
                console.error('Failed to check balances:', error);
                navigate('/landing');
            } finally {
                setIsChecking(false);
            }
        };

        checkAccess();
    }, [isConnected, address, checkBalances, navigate]);

    useEffect(() => {
        if (hasChecked && !canUserPlay()) {
            // User doesn't have sufficient tokens, redirect to landing
            navigate('/landing');
        }
    }, [hasChecked, canUserPlay, navigate]);

    // Show loading while checking balances
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                    <Loader2 size={32} className="animate-spin text-white mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Checking Game Access</h3>
                    <p className="text-gray-400">Verifying your token balance...</p>
                </div>
            </div>
        );
    }

    // If user has sufficient tokens, show the game
    if (hasChecked && canUserPlay()) {
        return <>{children}</>;
    }

    // Fallback - should redirect to landing
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Insufficient Tokens</h3>
                <p className="text-gray-400 mb-4">You need at least 1 SD token to play</p>
                <button
                    onClick={() => navigate('/landing')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    Go to Landing Page
                </button>
            </div>
        </div>
    );
};
