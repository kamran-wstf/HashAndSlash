import { ethers } from 'ethers';
import GameRewardABI from '../contracts/GameReward.json';
import { CONFIG } from '../config/environment';

const CONTRACT_ADDRESS = CONFIG.CONTRACT_ADDRESS; // Update as needed
const GAME_ID = 2; // Sudoku game ID
// Start a new game session
export const startGameSession = async (gameId: number, amount: string) => {
  try {
    const contract = await getContract();
    const tx = await contract.burnGameTokenForHNS(gameId, amount);
    await tx.wait();
    console.log("start session", tx)
    return true;
  } catch (error) {
    console.error('Error starting game session:', error);
    throw error;
  }
};

// Record game activities to contract
export async function recordGameActivity(activities: any[], signer: ethers.Signer, userAddress: string) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, signer);

    // Record batch of activities
    const txHash = await contract.recordActivityBatch(
      GAME_ID,
      userAddress,
      activities.map(activity => activity.action)
    );

    await txHash.wait();

    return txHash;
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw error;
  }
}

export const getContract = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  console.log("WHy console is not working")
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, signer);
};

export const redeemPointsForGameToken = async (gameId: number, points: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.redeemPointsForGameToken(gameId, points);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error redeeming points for game token:', error);
    throw error;
  }
};

export const getPointsBalance = async (address: string) => {
  try {
    const contract = await getContract();
    const balance = await contract.getPointsBalance(address);
    return ethers.utils.formatUnits(balance, 0); // Assuming points have no decimals
  } catch (error) {
    console.error('Error getting points balance:', error);
    throw error;
  }
};

export const getTokenAmount = async (points: number) => {
  try {
    const contract = await getContract();
    const amount = await contract.getTokenAmount(points);
    return ethers.utils.formatUnits(amount, 18); // Assuming token has 18 decimals
  } catch (error) {
    console.error('Error getting token amount:', error);
    throw error;
  }
}; 