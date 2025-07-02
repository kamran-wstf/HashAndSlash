import { ethers } from 'ethers';
import GameRewardABI from '../contracts/GameReward.json';

const CONTRACT_ADDRESS = '0xd7829c963Fc1FD9119D85Ee9a5300f3f2F36F865'; 

export const getContract = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI.abi, signer);
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