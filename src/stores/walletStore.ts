import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => {
  let provider: ethers.providers.Web3Provider | null = null;

  const connect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const xinfinParams = {
        chainId: '0x32', // Hexadecimal for 51
        chainName: 'XDC Network',
        nativeCurrency: { name: 'XDC', symbol: 'XDC', decimals: 18 },
        rpcUrls: ['https://rpc.xinfin.network'],  //https://rpc.apothem.network //https://rpc.ankr.com/xdc_testnet
        blockExplorerUrls: ['https://testnet.xdcscan.io/'],
      };

      // const xinfinParam = {
      //   id: 0,
      //   name: 'XDC Network',
      //   nativeCurrency: {
      //     decimals: 18,
      //     name: 'XDC',
      //     symbol: 'XDC',
      //   },
      //   rpcUrls: {
      //     default: { http: ['https://rpc.xinfin.network'] },
      //     public: { http: ['https://rpc.xinfin.network'] },
      //   },
      //   blockExplorers: {
      //     default: { name: 'XDCScan', url: 'https://explorer.xinfin.network' },
      //   },
      // }

      // Switch or add network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: xinfinParams.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [xinfinParams],
          });
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: xinfinParams.chainId }],
          });
        } else {
          throw switchError;
        }
      }

      // Force permission request every time
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      provider = new ethers.providers.Web3Provider(window.ethereum);

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect to MetaMask.');
      }

      set({ address: accounts[0], isConnected: true });

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };


  const disconnect = () => {
    set({ address: null, isConnected: false });
    window.location.href = '/';

    // Remove event listeners
    window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum?.removeListener('chainChanged', handleChainChanged);
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log('MetaMask disconnected.');
      disconnect();
    } else {
      // Always prompt MetaMask for account permissions
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask is not installed');
        }
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (err) {
        console.error('Permission request rejected or failed:', err);
        disconnect();
        return;
      }
      set({ address: accounts[0], isConnected: true });
    }
  };
  const handleChainChanged = () => {
    console.log('Chain changed. Reloading page.');
    window.location.reload();
  };

  return {
    address: null,
    isConnected: false,
    connect,
    disconnect,
  };
});
