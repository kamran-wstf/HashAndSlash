import { ethers } from 'ethers';
import GameRewardABI from '../contracts/GameReward.json';

const CONTRACT_ADDRESS = '0x93D09FfCA6EF76792f19Fed7D12101cf45f6FC6E'; // Update as needed
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

// Submit a batch of actions at game completion
import { BigNumber } from "ethers";

export const submitGameBatch = async (
  gameId: number,
  actions: Array<{ timestamp: number; actionType: number; value: number; scoreChange: number }>,
  finalScore: number,
  finalStateHash: string,
  proof: string
) => {
  try {
    const contract = await getContract();

    // Estimate gas
    const estimatedGas = await contract.estimateGas.submitGameBatch(
      gameId,
      actions,
      finalScore,
      finalStateHash,
      proof
    );

    // Add a buffer to the estimated gas (e.g., 20% more)
    const gasLimit = estimatedGas.mul(120).div(100); // +20%

    // Optional: Manually set max fee / priority fee (for EIP-1559 chains)
    const overrides = {
      gasLimit,
      maxFeePerGas: BigNumber.from("30000000000"), // 30 Gwei
      maxPriorityFeePerGas: BigNumber.from("2000000000"), // 2 Gwei
    };

    const tx = await contract.submitGameBatch(
      gameId,
      actions,
      finalScore,
      finalStateHash,
      proof,
      overrides
    );

    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error submitting game batch:", error);
    throw error;
  }
};

export const getContract = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  console.log("WHy console is not working")
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, signer);
};

export const redeemPoints = async (points: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.redeemPoints(points);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error redeeming points:', error);
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