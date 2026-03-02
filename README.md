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

Deploy to Vercel or any static hosting platform. Set the required environment variables from `.env.example`.

## Usage

1. Connect wallet and create transactions with agricultural data
2. View transactions on dashboard with Transaction ID and Data Hash
3. Verify transactions publicly using the verification tab
4. Check blockchain records on BaseScan

## License

MIT

## Links

- [Live Demo](https://agritokenledger.vercel.app)
- [GitHub Repository](https://github.com/mianohh/AgriToken-Ledger)
- [Alchemy Dashboard](https://dashboard.alchemy.com)
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- [MetaMask](https://metamask.io)
- [BaseScan Explorer](https://sepolia.basescan.org)
