import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { redeemPointsForGameToken } from '../utils/contract';
import { checkUserBalances } from '../utils/gameStart';
import { ethers } from 'ethers';

export const PointsRedeem = () => {
  const { address, isConnected } = useWalletStore();
  const [availablePoints, setAvailablePoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalances = async () => {
      if (address && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const balances = await checkUserBalances(address, provider);
          setAvailablePoints(Number(balances.availablePoints));
        } catch (error) {
          console.error('Error fetching balances:', error);
        }
      }
    };

    fetchBalances();
  }, [address]);

  const handleRedeem = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (availablePoints <= 0) {
      setError('No points available to redeem');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await redeemPointsForGameToken(2, availablePoints); // Game ID 2 for Sudoku
      setAvailablePoints(0); // Reset points after successful redemption
    } catch (error) {
      setError('Failed to redeem points. Please try again.');
      console.error('Redeem error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">Available Points: {availablePoints}</p>
          </div>
          <button
            onClick={handleRedeem}
            disabled={isLoading || availablePoints <= 0}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium
              ${isLoading || availablePoints <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isLoading ? 'Processing...' : 'Redeem All'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-600 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}; 