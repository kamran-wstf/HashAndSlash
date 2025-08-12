// Environment configuration
export const CONFIG = {
    // Contract settings
    CONTRACT_ADDRESS: '0xD6825De8aeA833C92E54f7BAdb0Fc157e225845C',
    GAME_ID: 2, // Sudoku game ID
    CHAIN_ID: 50, // XDC Network
    RPC_URL: 'https://rpc.xinfin.network',

    // Game settings
    TOKENS_PER_GAME: 1,
    TOKEN_SYMBOL: 'SUDOKU',

    // Network settings
    NETWORK_NAME: 'XDC Network',
    NETWORK_SYMBOL: 'XDC',
    NETWORK_DECIMALS: 18,
    BLOCK_EXPLORER: 'https://explorer.xinfin.network',

    // API settings
    BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://yourapi.com',

    // API endpoints
    API_ENDPOINTS: {
        SAVE_SCORE: '/api/save-score',
        LEADERBOARD: '/api/leaderboard',
        USER_PROFILE: '/api/user-profile',
        TRANSACTIONS: '/api/transactions',
    },
} as const;

// XDC Network configuration for MetaMask
export const XDC_NETWORK_CONFIG = {
    chainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
    chainName: CONFIG.NETWORK_NAME,
    nativeCurrency: {
        name: CONFIG.NETWORK_NAME,
        symbol: CONFIG.NETWORK_SYMBOL,
        decimals: CONFIG.NETWORK_DECIMALS,
    },
    rpcUrls: [CONFIG.RPC_URL],
    blockExplorerUrls: [CONFIG.BLOCK_EXPLORER],
};

// XDC Network configuration for Wagmi/Viem
export const xdcNetwork = {
    id: 50,
    name: 'XDC Network',
    nativeCurrency: {
        decimals: 18,
        name: 'XDC',
        symbol: 'XDC',
    },
    rpcUrls: {
        default: { http: ['https://rpc.xinfin.network'] },
        public: { http: ['https://rpc.xinfin.network'] },
    },
    blockExplorers: {
        default: { name: 'XDCScan', url: 'https://explorer.xinfin.network' },
    },
};

// Multiple RPC endpoints for fallback
export const XDC_RPC_URLS = [
    'https://rpc.xinfin.network',
    'https://erpc.xinfin.network',
    'https://xdc.blocksscan.io',
    'https://rpc.ankr.com/xdc',
];
