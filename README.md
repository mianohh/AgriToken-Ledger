# 🌾 AgriToken Ledger

Blockchain-powered agricultural transaction tracking on Ethereum Sepolia with React, TypeScript, and Solidity.

![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

## Features

- MetaMask wallet integration
- Smart contract verification on Sepolia
- Real-time gas estimation
- Transaction dashboard with Etherscan links
- Property-based testing (100+ iterations)
- Glassmorphism UI design

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
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

### Run

```bash
npm run dev
```

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, ethers.js v6  
**Blockchain:** Solidity 0.8.20, Hardhat, Sepolia  
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

### Sepolia Testnet

- Chain ID: `11155111`
- Faucet: https://sepoliafaucet.com
- Explorer: https://sepolia.etherscan.io

### MetaMask Setup

Add Sepolia via https://chainlist.org or manually with chain ID `11155111`.

## Smart Contract

Deployed at: `0x94485b644064cBa391E196881EfC7E159A2b63f3`

View on [Etherscan](https://sepolia.etherscan.io/address/0x94485b644064cBa391E196881EfC7E159A2b63f3)

## Usage

1. Connect MetaMask wallet
2. Create transaction with produce details
3. Approve blockchain submission
4. View on dashboard or verify publicly

## License

MIT

## Links

- [Alchemy](https://dashboard.alchemy.com)
- [Sepolia Faucet](https://sepoliafaucet.com)
- [MetaMask](https://metamask.io)
