# AgriToken Ledger - OxBuild Omni-Oracle Edition

> **OxBuild Hackathon Evaluation Metadata**
> - **Registered Oxlo Email:** alexmiano101@gmail.com
> - **Live Demo:** https://agritokenledger.vercel.app
> - **GitHub Repository:** https://github.com/mianohh/AgriToken-Ledger
> - **Architecture:** Model Context Protocol (MCP) Chaining
> - **Premium Models Used:**
>   1. `kimi-k2.5` (Vision/Multimodal Extraction)
>   2. `deepseek-r1-0528` (Frontier-class Reasoning & JSON Structuring)

**Winner - ETHNile Open Track Hackathon**
**OxBuild Hackathon Participant - AI-Powered Agricultural Oracle**

Blockchain-powered agricultural transaction tracking on Base Sepolia with AI data extraction using Oxlo.ai.

![Base](https://img.shields.io/badge/Base-Sepolia-0052FF?logo=base)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Oxlo AI](https://img.shields.io/badge/Oxlo-AI%20Powered-FF6B35?logo=openai)

## Features

- AI-Powered Data Extraction with Oxlo.ai (kimi-k2.5 + deepseek-r1-0528)
- Upload receipt photos and auto-extract agricultural data
- MetaMask wallet integration with Base Sepolia
- Smart contract verification on blockchain
- Real-time gas estimation
- Transaction dashboard with localStorage persistence
- Public transaction verification
- BaseScan explorer integration

## Quick Start

```bash
git clone https://github.com/mianohh/AgriToken-Ledger.git
cd AgriToken-Ledger
npm install
```

### Environment Setup

Create a `.env` file with the following variables:

```bash
VITE_BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_CONTRACT_ADDRESS=0x94485b644064cBa391E196881EfC7E159A2b63f3
VITE_OXLO_API_KEY=your_oxlo_api_key
```

### Deploy Contract

```bash
# Set in your environment
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key

npx hardhat run scripts/deploy.js --network baseSepolia
```

### Run

```bash
npm run dev
```

## Tech Stack

**AI/ML:** Oxlo.ai (kimi-k2.5 vision, deepseek-r1-0528 reasoning)
**Frontend:** React 18, TypeScript, Vite, ethers.js v6
**Blockchain:** Solidity 0.8.20, Hardhat, Base Sepolia

## Project Structure

```
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
└── src/
    ├── components/         # React UI components
    ├── hooks/              # Custom hooks (wallet, blockchain, gas)
    ├── services/           # Web3 + Oxlo AI Oracle services
    └── utils/              # Hash generation utilities
```

## Oxlo AI Integration

The application uses a two-stage Agentic MCP (Model Context Protocol) pipeline:

**Stage 1 - kimi-k2.5 (Vision):**
- Reads and parses the uploaded agricultural document image
- Extracts raw text data: farmer ID, crop type, weight, buyer name, transaction date
- Performs forensic analysis for signs of digital tampering
- Outputs extracted text and a tamper probability score

**Stage 2 - deepseek-r1-0528 (Reasoning):**
- Receives the raw output from kimi-k2.5 directly as input (MCP chaining)
- Validates and structures the data into a typed JSON payload
- Calculates a validity score (0-100)
- Issues a security verdict: SAFE_TO_HASH, FRAUD_DETECTED, or REVIEW_REQUIRED

**Agentic MCP (Model Context Protocol) Architecture:** Output from kimi-k2.5 directly feeds into deepseek-r1-0528 for multi-stage verification.

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

**Deployed Contract Address:** `0x94485b644064cBa391E196881EfC7E159A2b63f3`

The AgriTokenVerification smart contract stores transaction verification hashes on Base Sepolia:

- `storeVerification()`: Store transaction hash on-chain
- `getVerification()`: Retrieve verification record
- `verifyHash()`: Verify transaction hash matches on-chain data
- Duplicate prevention and input validation

To deploy your own contract, update the address in `.env`.

## Usage

### AI-Powered Transaction Creation
1. Connect MetaMask wallet to Base Sepolia
2. Upload photo of agricultural receipt or weighbridge ticket
3. AI automatically extracts: farmer ID, crop type, weight, buyer, date
4. Valid detected fields are auto-filled and locked; empty fields require manual entry
5. Review data and submit to blockchain
6. Transaction verified and stored immutably on Base Sepolia

### Manual Transaction Creation
1. Connect wallet and manually enter agricultural data
2. View transactions on dashboard with Transaction ID and Data Hash
3. Verify transactions publicly using the verification tab
4. Check blockchain records on BaseScan

## Deployment

Deploy to Vercel or any static hosting platform. Set the required environment variables in your hosting dashboard.

## License

MIT

## Links

- [Live Demo](https://agritokenledger.vercel.app)
- [GitHub Repository](https://github.com/mianohh/AgriToken-Ledger)
- [Oxlo Portal](https://portal.oxlo.ai)
- [Alchemy Dashboard](https://dashboard.alchemy.com)
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- [MetaMask](https://metamask.io)
- [BaseScan Explorer](https://sepolia.basescan.org)
