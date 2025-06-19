import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { usePointsStore } from '../stores/pointsStore';
import { redeemPoints, getTokenAmount } from '../utils/contract';

export const PointsRedeem = () => {
  const { address, isConnected } = useWalletStore();
  const { getPoints, resetPoints } = usePointsStore();
  const [points, setPoints] = useState(0);
  const [tokenAmount, setTokenAmount] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (address) {
      setPoints(getPoints(address));
    }
  }, [address, getPoints]);

  useEffect(() => {
    const calculateTokenAmount = async () => {
      if (points > 0) {
        try {
          const amount = await getTokenAmount(points);
          setTokenAmount(amount);
        } catch (error) {
          console.error('Error calculating token amount:', error);
        }
      } else {
        setTokenAmount('0');
      }
    };

    calculateTokenAmount();
  }, [points]);

  const handleRedeem = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (points <= 0) {
      setError('No points available to redeem');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await redeemPoints(points);
      resetPoints(address);
      setPoints(0);
      setTokenAmount('0');
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
            <p className="text-sm text-gray-600">Points: {points}</p>
          </div>
          <button
            onClick={handleRedeem}
            disabled={isLoading || points <= 0}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium
              ${isLoading || points <= 0
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