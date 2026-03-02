# 🌾 AgriToken Ledger

**🏆 Winner - ETHNile Open Track Hackathon**

Blockchain-powered agricultural transaction tracking on Base Sepolia with React, TypeScript, and Solidity.

![Base](https://img.shields.io/badge/Base-Sepolia-0052FF?logo=base)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

## Features

- ✅ MetaMask wallet integration with Base Sepolia
- 🔒 Smart contract verification on blockchain
- ⛽ Real-time gas estimation
- 📊 Transaction dashboard with localStorage persistence
- 🔍 Public transaction verification
- 🔗 BaseScan explorer integration
- 🧪 Property-based testing (100+ iterations)
- 🎨 Glassmorphism UI design

## Quick Start

```bash
git clone https://github.com/mianohh/AgriToken-Ledger.git
cd AgriToken-Ledger
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Add your Alchemy API key and contract address
```

### Deploy Contract

```bash
# Add to .env.deployment
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key

# Deploy
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Run

```bash
npm run dev
```

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, ethers.js v6  
**Blockchain:** Solidity 0.8.20, Hardhat, Base Sepolia  
**Testing:** Vitest, fast-check, Chai

## Project Structure

```
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
├── src/
│   ├── components/         # React UI components
│   ├── hooks/              # Custom hooks (wallet, blockchain, gas)
│   ├── services/           # Web3 service layer
│   └── utils/              # Hash generation utilities
└── test/                   # Smart contract tests
```

## Testing

```bash
npm test                    # Property-based tests
npx hardhat test           # Smart contract tests
```

## Configuration

### Base Sepolia Testnet

- Chain ID: `84532`
- Faucets: 
  - https://www.alchemy.com/faucets/base-sepolia
  - https://docs.base.org/docs/tools/network-faucets
- Explorer: https://sepolia.basescan.org

### MetaMask Setup

Add Base Sepolia via https://chainlist.org or manually with chain ID `84532`.

## Smart Contract

**Deployed Contract Address**: `0x94485b644064cBa391E196881EfC7E159A2b63f3`

The AgriTokenVerification smart contract stores transaction verification hashes on Base Sepolia. It includes:
- `storeVerification()`: Store transaction hash on-chain
- `getVerification()`: Retrieve verification record
- `verifyHash()`: Verify transaction hash matches on-chain data
- Duplicate prevention and input validation

To deploy your own contract, update the address in `.env`

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_BASE_SEPOLIA_RPC_URL`
   - `VITE_CONTRACT_ADDRESS`
   - `VITE_CHAIN_ID`
   - `VITE_EXPLORER_URL`
4. Deploy

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Create Transaction**: Fill in agricultural transaction details (farmer ID, produce type, weight, buyer)
3. **Submit to Blockchain**: Approve the transaction in MetaMask
4. **View Dashboard**: See all your transactions with Transaction ID and Data Hash
5. **Verify Publicly**: Use the Verify Transaction tab with Transaction ID and Data Hash to verify on-chain
6. **View on BaseScan**: Click "View Blockchain TX" to see transaction on Base Sepolia explorer

### Important Notes

- **Data Hash vs Blockchain TX Hash**: The Data Hash is the hash of your agricultural transaction data stored in the smart contract. The Blockchain TX Hash is the hash of the blockchain transaction itself (visible on BaseScan).
- **Verification**: Use the Transaction ID and Data Hash from the dashboard to verify transactions publicly.
- **LocalStorage**: Transactions are stored locally in your browser for easy access. They remain verified on-chain.

## License

MIT

## Links

- [Live Demo](https://agritoken-ledger.vercel.app) (Coming soon)
- [GitHub Repository](https://github.com/mianohh/AgriToken-Ledger)
- [Alchemy Dashboard](https://dashboard.alchemy.com)
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- [MetaMask](https://metamask.io)
- [BaseScan Explorer](https://sepolia.basescan.org)
