# Cross-chain Aave Deposit App using Across+

This application demonstrates how to use Across+ embedded cross-chain actions to bridge WETH from Optimism Sepolia and automatically deposit it into Aave on Arbitrum Sepolia in a single transaction.

## Overview

This dApp enables users to:
1. Start with WETH on Optimism Sepolia
2. Bridge to Arbitrum Sepolia
3. Automatically deposit into Aave pool
4. All in one seamless transaction

## Architecture

The application consists of three main components:

1. **Message Generator Contract** (Optimism Sepolia)
   - Generates formatted instructions for cross-chain actions
   - Handles message generation for Aave deposit
   - Creates approval and deposit calldata

2. **Multicall Handler** (Arbitrum Sepolia)
   - Pre-deployed by Across
   - Executes instructions after bridging
   - Handles token approvals and Aave deposits

3. **Frontend Application**
   - User interface for deposit amount
   - Wallet connection
   - Transaction handling

## Contract Addresses

```javascript
const ADDRESSES = {
  // Optimism Sepolia
  multicallHandler: "0x924a9f036260DdD5808007E1AA95f08eD08aA569",
  weth: "0x4200000000000000000000000000000000000006",
  acrossOP: "0x4e8E101924eDE233C13e2D8622DC8aED2872d505", //spokepool
  generateMessage: "0x88075d5312C85eD2d2D68d30bDBB51Cb92479Feb",

  // Arbitrum Sepolia
  aave: "0x82405D1a189bd6cE4667809C35B37fBE136A4c5B",
  arbitrumChainId: "421614",
  acrossArb: "0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75", //spokepool
  arbWeth: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
};
```

## Prerequisites

- Node.js v23+
- MetaMask or other Web3 wallet
- WETH on Optimism Sepolia
- Test ETH on both networks

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
npx shadcn@latest init -d
npm i ethers
```

3. Deploy Message Generator contract (using Remix or Foundry):
```bash
# Using Foundry
forge create src/GenerateMessageHelper.sol:GenerateMessageHelper --broadcast --interactive --rpc-url https://optimism-sepolia-rpc.publicnode.com
```

## Smart Contract Overview

The `GenerateMessageHelper` contract creates properly formatted messages for the Across+ multicall handler, containing:
- Token approval call
- Aave deposit call
- Fallback recipient for safety

Key function:
```solidity
function generateMessageForMulticallHandler(
    address userAddress,
    address aavePool,
    uint256 depositAmount,
    address depositCurrency,
    uint16 aaveReferralCode
) external pure returns (bytes memory)
```

## Usage

1. Connect wallet to Optimism Sepolia
2. Enter WETH amount to deposit
3. Click "Add Liquidity"
4. Confirm transaction
5. Wait for cross-chain execution

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Technical Flow

1. **Generate Message**
   - Creates approval instruction
   - Creates Aave deposit instruction
   - Packages for multicall handler

2. **Get Bridge Quote**
   ```javascript
   const quoteResponse = await fetch(
     'https://across-v2.api.across.to/suggested-fees?...'
   );
   ```

3. **Execute Bridge Transaction**
   ```javascript
   const tx = await acrossContract.depositV3(
     userAddress,
     ADDRESSES.multicallHandler,
     // ... other parameters
   );
   ```

## Security Features

- Fallback recipient for failed transactions
- Safe token approvals
- Transaction validation
- Balance checks

## Contributing

Feel free to submit issues and enhancement requests.

## Resources

- [Across+ Documentation](https://docs.across.to)
- [Aave Documentation](https://docs.aave.com)
- [Contract Deployments](https://docs.across.to/v/developer-docs/)

## Support

Join our [Discord](https://discord.gg/across) for support and discussions.

## License

MIT License
