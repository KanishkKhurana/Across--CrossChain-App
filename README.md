# Cross-chain Uniswap V3 Liquidity Provider using Across+

A cross-chain DApp that allows users to provide liquidity to Uniswap V3 pools across different chains using Across+ embedded cross-chain actions. The app enables users to bridge USDC from Arbitrum Sepolia and automatically add liquidity to USDC/WETH pool on Optimism Sepolia in a single transaction.

## Architecture

The application consists of three main components:

1. **Message Generator Contract** (Source Chain - Arbitrum Sepolia)
   - Generates formatted instructions for the multicall handler
   - Handles message generation for cross-chain actions
   - Deployed on the source chain

2. **Multicall Handler** (Destination Chain - Optimism Sepolia)
   - Pre-deployed by Across
   - Executes instructions after bridging
   - Handles token approvals and liquidity addition

3. **Frontend Application**
   - User interface for amount input
   - Wallet connection handling
   - Contract interactions and API integrations

## Prerequisites

- Node.js v23+
- MetaMask or similar Web3 wallet
- Testnet ETH on Arbitrum Sepolia
- Testnet USDC on Arbitrum Sepolia
- Basic knowledge of Solidity and React

## Contract Addresses

```javascript
const ADDRESSES = {
    // Arbitrum Sepolia
    liquidityProvider: "0x75024f1ace6d642f9ebbf06e573d6ec199bd15a3",
    multicallHandler: "0x924a9f036260DdD5808007E1AA95f08eD08aA569",
    
    // Optimism Sepolia
    uniswapPositionManager: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    optimismChainId: 11155420,
    
    across: "0x4e8E101924eDE233C13e2D8622DC8aED2872d505"
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
npx shadcn@latest init -d
npm i ethers
```

3. Deploy Message Generator Contract (using Remix or Foundry):
```bash
# Using Foundry
forge create src/UniV3MessageGenerator.sol:liquidityProvider --broadcast --interactive --rpc-url https://arbitrum-sepolia-rpc.publicnode.com
```

4. Update contract addresses in your configuration.

## Features

- Wallet connection and USDC balance display
- Cross-chain liquidity provision
- Automatic bridging and pool position creation
- Real-time transaction status updates
- Error handling and user feedback
- Customizable liquidity ranges

## Usage

1. Connect your wallet
2. Enter USDC amount to provide as liquidity
3. Click "Add Liquidity"
4. Confirm the transaction in your wallet
5. Wait for cross-chain transaction completion

## Technical Flow

1. **Message Generation**
   - Creates approval instruction
   - Creates liquidity position instruction
   - Packages instructions for multicall handler

2. **Bridge Integration**
   - Gets quote from Across API
   - Initiates bridge transaction with embedded actions

3. **Destination Execution**
   - Multicall handler receives tokens
   - Executes approval and position creation
   - Completes liquidity provision

## Smart Contract Functions

### Main Function: generateLiquidityMessage
```solidity
function generateLiquidityMessage(
    address user,
    address positionManager,
    address token0,        
    address token1,        
    uint24 fee,           
    int24 tickLower,
    int24 tickUpper,
    uint256 amount0Desired,
    uint256 amount1Desired
) external view returns (bytes memory)
```

## Security Considerations

- Uses fallback recipient for safety
- Includes deadline checks
- Validates user inputs
- Handles transaction failures

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

Feel free to submit issues and enhancement requests.

## Resources

- [Across+ Documentation](https://docs.across.to)
- [Uniswap V3 Documentation](https://docs.uniswap.org/protocol/v3/overview)
- [Ethers Documentation](https://docs.ethers.org/v6/)

## License

MIT License