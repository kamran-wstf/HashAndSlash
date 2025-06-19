import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  connect: async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }], // ChainId 97 in hex
      });

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      set({ address: accounts[0], isConnected: true });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  },
  disconnect: () => {
    set({ address: null, isConnected: false });
    // Redirect to home page
    window.location.href = '/';
  },
}));