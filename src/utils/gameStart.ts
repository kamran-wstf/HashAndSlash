import { ethers } from 'ethers';
import GameRewardABI from '../contracts/GameReward.json';
import { CONFIG } from '../config/environment';

// Contract configuration
const CONTRACT_ADDRESS = '0xD6825De8aeA833C92E54f7BAdb0Fc157e225845C';
const GAME_ID = 2; // Sudoku game ID
const REQUIRED_TOKENS = 1;

// HNS Token ABI (minimal for balance checking)
const HNS_TOKEN_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Check HNS token balance using the HNS token contract
export async function checkHNSTokenBalance(userAddress: string, provider: ethers.providers.Provider) {
    try {
        // Get the main contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, provider);

        // Get HNS token contract address
        const hnsTokenAddress = await contract.hnsToken();

        // Create HNS token contract instance
        const hnsTokenContract = new ethers.Contract(hnsTokenAddress, HNS_TOKEN_ABI, provider);

        // Get user's HNS token balance
        const hnsBalance = await hnsTokenContract.balanceOf(userAddress);

        return BigInt(hnsBalance);
    } catch (error) {
        console.error('Failed to check HNS token balance:', error);
        return BigInt(0);
    }
}

// Check Game token balance using getTransactionLogs
export async function checkGameTokenBalance(userAddress: string, provider: ethers.providers.Provider) {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, provider);

        // Call getTransactionLogs with Game ID = 2
        const transactionLogs = await contract.getTransactionLogs(GAME_ID, userAddress);

        return BigInt(transactionLogs.gameTokenBalance || 0);
    } catch (error) {
        console.error('Failed to check game token balance:', error);
        return BigInt(0);
    }
}

// Comprehensive balance checking function
export async function checkUserBalances(userAddress: string, provider: ethers.providers.Provider) {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, provider);

        // Check HNS token balance
        const hnsBalance = await checkHNSTokenBalance(userAddress, provider);

        // Check game token balance
        const gameTokenBalance = await checkGameTokenBalance(userAddress, provider);

        // Get additional info from getTransactionLogs
        const transactionLogs = await contract.getTransactionLogs(GAME_ID, userAddress);

        // console.log("transactionLogs", transactionLogs);
        // console.log("gameTokenBalance", gameTokenBalance);
        // console.log("hnsBalance", hnsBalance);

        return {
            gameTokenBalance,
            hnsBalance,
            totalPoints: BigInt(transactionLogs.totalPoints || 0),
            availablePoints: BigInt(transactionLogs.availablePoints || 0)
        };
    } catch (error) {
        console.error('Failed to check user balances:', error);
        return {
            gameTokenBalance: BigInt(0),
            hnsBalance: BigInt(0),
            totalPoints: BigInt(0),
            availablePoints: BigInt(0)
        };
    }
}

// Start game with existing tokens
export async function startGameWithExistingTokens(userAddress: string, signer: ethers.Signer) {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, signer);
        const requiredAmount = ethers.utils.parseEther(REQUIRED_TOKENS.toString());

        // Check game token balance using getTransactionLogs
        const gameTokenBalance = await checkGameTokenBalance(userAddress, signer.provider!);

        if (gameTokenBalance < BigInt(requiredAmount.toString())) {
            return { success: false, error: 'Insufficient game tokens' };
        }

        // Burn 1 game token to start the game
        const burnTx = await contract.burnGameTokenForHNS(GAME_ID, requiredAmount, {
            gasLimit: 200000,
        });
        await burnTx.wait();

        // Post transaction to backend API (if available)
        try {
            await postBurnTransaction(userAddress, burnTx.hash, REQUIRED_TOKENS, 1, CONTRACT_ADDRESS, 'SD');
        } catch (apiError) {
            console.warn('Failed to post transaction to backend:', apiError);
        }

        console.log("burnTx", { success: true, action: 'burned', txHash: burnTx.hash });
        return { success: true, action: 'burned', txHash: burnTx.hash };
    } catch (error) {
        console.error('Failed to start game with existing tokens:', error);
        throw error;
    }
}

// Comprehensive game start function
export async function startGame(userAddress: string, signer: ethers.Signer) {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GameRewardABI, signer);
        const requiredAmount = ethers.utils.parseEther(REQUIRED_TOKENS.toString());

        // Check game token balance first
        const gameTokenBalance = await checkGameTokenBalance(userAddress, signer.provider!);

        if (gameTokenBalance >= BigInt(requiredAmount.toString())) {
            // Burn existing tokens
            const burnTx = await contract.burnGameTokenForHNS(GAME_ID, requiredAmount, {
                gasLimit: 200000,
            });
            await burnTx.wait();
            return { success: true, action: 'burned', txHash: burnTx.hash };
        }

        // Check HNS token balance
        const hnsBalance = await checkHNSTokenBalance(userAddress, signer.provider!);

        if (hnsBalance >= BigInt(requiredAmount.toString())) {
            // Purchase and burn tokens
            const hnsTokenAddress = await contract.hnsToken();
            const hnsToken = new ethers.Contract(hnsTokenAddress, HNS_TOKEN_ABI, signer);

            // Approve HNS spending
            const approveTx = await hnsToken.approve(CONTRACT_ADDRESS, requiredAmount, {
                gasLimit: 100000,
            });
            await approveTx.wait();

            // Purchase game tokens
            const purchaseTx = await contract.redeemHNSForGameToken(GAME_ID, requiredAmount, {
                gasLimit: 200000,
            });
            await purchaseTx.wait();

            // Burn tokens to start game
            const burnTx = await contract.burnGameTokenForHNS(GAME_ID, requiredAmount, {
                gasLimit: 200000,
            });
            await burnTx.wait();

            return { success: true, action: 'purchased_and_burned', txHash: burnTx.hash };
        }

        console.log("gameTokenBalance", gameTokenBalance);
        console.log("hnsBalance", hnsBalance);
        console.log("requiredAmount", requiredAmount);

        return {
            success: false,
            error: 'Insufficient balance',
            details: {
                gameTokenBalance: ethers.utils.formatEther(gameTokenBalance),
                hnsBalance: ethers.utils.formatEther(hnsBalance),
                required: ethers.utils.formatEther(requiredAmount)
            }
        };
    } catch (error) {
        console.error('Failed to start game:', error);
        throw error;
    }
}

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

        // Post transaction to backend API
        try {
            await postRewardTransaction(
                userAddress,
                txHash.hash,
                activities.length,
                activities.reduce((sum, activity) => sum + activity.points, 0),
                CONTRACT_ADDRESS,
                'GAME_TOKEN'
            );
        } catch (apiError) {
            console.warn('Failed to post reward transaction to backend:', apiError);
        }

        return txHash;
    } catch (error) {
        console.error('Contract interaction failed:', error);
        throw error;
    }
}

// Backend transaction posting for rewards
async function postRewardTransaction(
    from: string,
    transactionHash: string,
    activityCount: number,
    totalPoints: number,
    toAddress: string,
    gameToken: string
): Promise<void> {
    try {
        console.log("Backend url", CONFIG.BACKEND_URL);
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                transactionType: 'Reward',
                transactionHash,
                gameToken,
                activityCount,
                totalPoints,
                toAddress
            })
        });

        if (!response.ok) {
            throw new Error('Failed to post reward transaction');
        }
    } catch (error) {
        console.error('Error posting reward transaction:', error);
        throw error;
    }
}

// Backend transaction posting
async function postBurnTransaction(
    from: string,
    transactionHash: string,
    fromAmount: number,
    toAmount: number,
    toAddress: string,
    gameToken: string
): Promise<void> {
    try {
        console.log("Backend url", CONFIG.BACKEND_URL)
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                transactionType: 'Burn',
                transactionHash,
                gameToken,
                fromAmount,
                toAmount,
                toAddress
            })
        });

        if (!response.ok) {
            throw new Error('Failed to post transaction');
        }
    } catch (error) {
        console.error('Error posting transaction:', error);
        throw error;
    }
}

// Game start handler with comprehensive error handling
export async function handleGameStart(
    walletClient: any,
    setIsSubmitting: (loading: boolean) => void,
    setBalances: (balances: any) => void,
    onSuccess: () => void,
    onError: (message: string) => void
) {
    // 1. Check wallet connection
    if (!walletClient) {
        onError('Please connect your wallet to start the game');
        return;
    }

    try {
        setIsSubmitting(true);

        // 2. Convert wallet client to ethers signer
        const provider = new ethers.providers.Web3Provider(walletClient);
        const signer = provider.getSigner();

        // 3. Check user balances
        const latest = await checkUserBalances(walletClient.account.address, provider);
        setBalances({
            gameTokenBalance: latest.gameTokenBalance,
            hnsBalance: latest.hnsBalance,
        });

        // 4. Start game with existing tokens
        const result = await startGameWithExistingTokens(walletClient.account.address, signer);

        if (result.success) {
            // 5. Initialize game state
            onSuccess();
            console.log('Game started successfully:', result);
        } else {
            onError('You do not have enough game tokens. Please buy a game token to start.');
        }
    } catch (error) {
        console.error('Error starting game:', error);
        onError('Failed to start game. Please check your wallet connection and try again.');
    } finally {
        setIsSubmitting(false);
    }
}
