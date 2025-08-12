# 🎮 Game Start Functionality Implementation

This document describes the comprehensive game start system implemented for the Sudoku game, based on the Flappy Bird patterns.

## 🚀 Overview

The game start system provides a robust way to:

- Check user wallet connection
- Validate user balances (SUDOKU tokens and HNS)
- Handle token burning for game access
- Manage HNS to token conversion
- Provide comprehensive error handling
- Post transactions to backend API

## 📁 File Structure

```
src/
├── utils/
│   └── gameStart.ts          # Core game start utilities
├── hooks/
│   └── useGameStart.ts       # React hook for game start state
├── components/
│   ├── GameStartButton.tsx   # UI component for game start
│   └── BalanceChecker.tsx    # Balance checking component
└── config/
    └── environment.ts        # Configuration constants
```

## 🔧 Core Functions

### **1. HNS Token Balance Checking**

```typescript
export async function checkHNSTokenBalance(
  userAddress: string,
  provider: ethers.providers.Web3Provider
);
```

- Gets HNS token contract address via `contract.hnsToken()`
- Creates HNS token contract instance
- Calls `balanceOf(userAddress)` to get user's HNS balance
- Returns formatted balance data

### **2. Game Token Balance Checking**

```typescript
export async function checkGameTokenBalance(
  userAddress: string,
  provider: ethers.providers.Web3Provider
);
```

- Calls `contract.getTransactionLogs(GAME_ID = 2, userAddress)`
- Extracts `gameTokenBalance` from transaction logs
- Returns formatted balance data

### **3. Comprehensive Balance Checking**

```typescript
export async function checkUserBalances(
  userAddress: string,
  provider: ethers.providers.Web3Provider
);
```

- Checks both HNS and game token balances
- Gets additional info from `getTransactionLogs`
- Returns complete balance information

### **4. Game Start with Existing Tokens**

```typescript
export async function startGameWithExistingTokens(
  userAddress: string,
  signer: ethers.Signer
);
```

- Checks game token balance using `getTransactionLogs`
- Burns 1 SUDOKU token via `burnGameTokenForHNS(GAME_ID = 2, burnAmount = 1)`
- Posts transaction to backend API
- Returns success/failure status

### **5. Comprehensive Game Start**

```typescript
export async function startGame(userAddress: string, signer: ethers.Signer);
```

- Checks game token balance first
- If insufficient, checks HNS token balance
- Handles HNS approval and token purchase
- Burns tokens to start game
- Returns detailed status information

## 🎯 Balance Checking Flow

### **1. HNS Token Balance Check**

```typescript
// Get main contract instance
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  GameRewardABI.abi,
  provider
);

// Get HNS token contract address
const hnsTokenAddress = await contract.hnsToken();

// Create HNS token contract instance
const hnsTokenContract = new ethers.Contract(
  hnsTokenAddress,
  HNS_TOKEN_ABI,
  provider
);

// Get user's HNS token balance
const hnsBalance = await hnsTokenContract.balanceOf(userAddress);
```

### **2. Game Token Balance Check**

```typescript
// Call getTransactionLogs with Game ID = 2
const transactionLogs = await contract.getTransactionLogs(GAME_ID, userAddress);

// Extract game token balance
const gameTokenBalance = BigInt(transactionLogs.gameTokenBalance || 0);
```

### **3. Game Start Process**

```typescript
// Check if user has enough game tokens
if (gameTokenBalance >= requiredAmount) {
  // Burn 1 game token to start the game
  const burnTx = await contract.burnGameTokenForHNS(GAME_ID, requiredAmount);
  await burnTx.wait();
  return { success: true, action: "burned", txHash: burnTx.hash };
}
```

## 🎨 UI Components

### **GameStartButton Component**

- ✅ **Balance Display**: Shows HNS and SUDOKU token balances
- ✅ **Smart Logic**: Checks balances before allowing game start
- ✅ **Error Handling**: Clear error messages for insufficient balances
- ✅ **Loading States**: Spinner during balance checks and transactions

### **BalanceChecker Component**

- ✅ **Real-time Balance Display**: Shows current HNS and game token balances
- ✅ **Refresh Functionality**: Manual balance refresh button
- ✅ **Game Start Status**: Indicates if user can start game
- ✅ **Visual Indicators**: Icons and colors for different balance types

## ⚙️ Configuration

### **Contract Settings**

```typescript
const CONTRACT_ADDRESS = "0xD6825De8aeA833C92E54f7BAdb0Fc157e225845C";
const GAME_ID = 2; // Sudoku game ID
const REQUIRED_TOKENS = 1; // 1 SUDOKU token per game
```

### **HNS Token ABI**

```typescript
const HNS_TOKEN_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
```

## 🔄 Game Start Flow

### **1. Balance Verification**

```typescript
// Check HNS token balance
const hnsBalance = await checkHNSTokenBalance(userAddress, provider);

// Check game token balance
const gameTokenBalance = await checkGameTokenBalance(userAddress, provider);
```

### **2. Game Start Decision**

```typescript
if (gameTokenBalance >= requiredAmount) {
  // User has enough game tokens - burn 1 token
  await burnGameTokenForHNS(GAME_ID, requiredAmount);
} else if (hnsBalance >= requiredAmount) {
  // User has HNS - purchase and burn game tokens
  await purchaseAndBurnTokens();
} else {
  // Insufficient balance
  throw new Error("Insufficient balance to start game");
}
```

### **3. Token Burning**

```typescript
// Burn 1 game token to start the game
const burnTx = await contract.burnGameTokenForHNS(GAME_ID, requiredAmount, {
  gasLimit: 200000,
});
await burnTx.wait();
```

## 🛡️ Error Handling

### **Common Error Scenarios**

1. **Wallet Not Connected**: Clear connection prompt
2. **Insufficient Game Tokens**: Show purchase options
3. **Insufficient HNS**: Display balance requirements
4. **Network Issues**: Retry with fallback RPC
5. **Contract Errors**: Detailed error messages
6. **Gas Estimation Failures**: Proper gas limits

### **Balance Check Errors**

- ✅ **HNS Token Contract Not Found**: Graceful fallback
- ✅ **getTransactionLogs Failure**: Error handling with defaults
- ✅ **Network Timeout**: Retry mechanism
- ✅ **Invalid Address**: Validation checks

## 🧪 Testing Scenarios

### **1. User with Sufficient Game Tokens**

- ✅ HNS balance check passes
- ✅ Game token balance check passes
- ✅ Token burning succeeds
- ✅ Game initializes correctly

### **2. User with Insufficient Game Tokens but Sufficient HNS**

- ✅ HNS approval succeeds
- ✅ Token purchase succeeds
- ✅ Token burning succeeds
- ✅ Game initializes correctly

### **3. User with Insufficient Balances**

- ✅ Clear error message displayed
- ✅ Purchase guidance provided
- ✅ No game initialization

### **4. Network Connection Issues**

- ✅ RPC fallback mechanism
- ✅ Graceful error handling
- ✅ User-friendly error messages

## 🚀 Integration Examples

### **Using Balance Checker Component**

```tsx
import { BalanceChecker } from "./components/BalanceChecker";

// In your component
<BalanceChecker />;
```

### **Using Game Start Hook**

```typescript
import { useGameStart } from "./hooks/useGameStart";

const { isSubmitting, balances, error, startGame } = useGameStart();
```

### **Direct Balance Checking**

```typescript
import { checkUserBalances } from "./utils/gameStart";

const balances = await checkUserBalances(userAddress, provider);
console.log("HNS Balance:", balances.hnsBalance);
console.log("Game Tokens:", balances.gameTokenBalance);
```

## 📊 Key Features

### **1. Accurate Balance Checking**

- ✅ **HNS Token Contract**: Direct balanceOf calls
- ✅ **Game Token Balance**: getTransactionLogs with Game ID 2
- ✅ **Real-time Updates**: Automatic balance refresh
- ✅ **Error Recovery**: Graceful handling of failures

### **2. Smart Game Start Logic**

- ✅ **Token Priority**: Check game tokens first, then HNS
- ✅ **Automatic Purchase**: HNS to game token conversion
- ✅ **Proper Burning**: 1 SUDOKU token per game start
- ✅ **Transaction Recording**: Backend API integration

### **3. User Experience**

- ✅ **Clear Feedback**: Loading states and error messages
- ✅ **Balance Display**: Real-time balance information
- ✅ **Game Status**: Ready/not ready indicators
- ✅ **Responsive Design**: Works on all screen sizes

## 🎯 Benefits

### **1. Production Ready**

- ✅ **Robust Error Handling**: Comprehensive error management
- ✅ **Network Resilience**: Multiple RPC endpoints
- ✅ **Gas Optimization**: Pre-calculated gas limits
- ✅ **Backend Integration**: Transaction posting

### **2. Developer Friendly**

- ✅ **Type Safety**: Full TypeScript support
- ✅ **Modular Design**: Easy to extend and customize
- ✅ **Clear Documentation**: Comprehensive examples
- ✅ **Testing Support**: Easy to test all scenarios

### **3. User Friendly**

- ✅ **Seamless Integration**: Works with existing wallet systems
- ✅ **Smart Logic**: Automatic balance checking and token management
- ✅ **Clear Feedback**: Loading states and error messages
- ✅ **Responsive Design**: Works on all screen sizes

---

**🎉 This implementation provides a robust, user-friendly game start system with accurate balance checking using the HNS token contract and getTransactionLogs!**
