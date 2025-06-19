import { useWalletStore } from '../stores/walletStore';

export const WalletConnect = () => {
  const { address, isConnected, connect, disconnect } = useWalletStore();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      alert('Failed to connect wallet. Please make sure MetaMask is installed.');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {formatAddress(address!)}
          </span>
          <button
            onClick={disconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}; 