import { useState, useCallback } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { useGameStore } from '../stores/gameStore';
import { handleGameStart, checkUserBalances } from '../utils/gameStart';
import { ethers } from 'ethers';

interface GameStartState {
    isSubmitting: boolean;
    balances: {
        gameTokenBalance: bigint;
        hnsBalance: bigint;
    };
    error: string | null;
}

export const useGameStart = () => {
    const [state, setState] = useState<GameStartState>({
        isSubmitting: false,
        balances: { gameTokenBalance: BigInt(0), hnsBalance: BigInt(0) },
        error: null,
    });

    const { isConnected, address } = useWalletStore();
    const { initializeGame } = useGameStore();

    const setIsSubmitting = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isSubmitting: loading }));
    }, []);

    const setBalances = useCallback((balances: any) => {
        setState(prev => ({ ...prev, balances }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const onSuccess = useCallback(() => {
        // Initialize game with current difficulty
        const { difficulty } = useGameStore.getState();
        initializeGame(difficulty);
        setError(null);
    }, [initializeGame]);

    const onError = useCallback((message: string) => {
        setError(message);
    }, [setError]);

    const startGame = useCallback(async () => {
        if (!isConnected || !address) {
            onError('Please connect your wallet to start the game');
            return;
        }

        try {
            // Create a mock wallet client for compatibility
            const walletClient = {
                account: { address },
                // Add other wallet client properties as needed
            };

            await handleGameStart(
                walletClient,
                setIsSubmitting,
                setBalances,
                onSuccess,
                onError
            );
        } catch (error) {
            console.error('Game start error:', error);
            onError('Failed to start game. Please try again.');
        }
    }, [isConnected, address, setIsSubmitting, setBalances, onSuccess, onError]);

    const checkBalances = useCallback(async () => {
        if (!isConnected || !address) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balances = await checkUserBalances(address, provider);
            setBalances({
                gameTokenBalance: balances.gameTokenBalance,
                hnsBalance: balances.hnsBalance,
            });
        } catch (error) {
            console.error('Error checking balances:', error);
        }
    }, [isConnected, address, setBalances]);

    const clearError = useCallback(() => {
        setError(null);
    }, [setError]);

    return {
        ...state,
        startGame,
        checkBalances,
        clearError,
        canStartGame: isConnected && address,
    };
};
