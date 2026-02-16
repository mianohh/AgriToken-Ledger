# 🌾 AgriToken Ledger - Blockchain Agricultural Transaction Platform

A Web3 decentralized application for tracking agricultural transactions on the Ethereum blockchain with immutable verification.

## 🚀 Features

- **Blockchain Verification**: Store transaction hashes on Ethereum Sepolia testnet
- **MetaMask Integration**: Connect wallet for decentralized authentication
- **Smart Contract**: Immutable on-chain verification records
- **Transaction Dashboard**: View all transactions with blockchain status
- **Gas Estimation**: Real-time cost calculation before submission
- **Etherscan Integration**: Direct links to blockchain explorer
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📋 Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Alchemy or Infura account (free tier works)
- Sepolia testnet ETH (free from faucets)

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Agritoken_Ledger
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_ETHERSCAN_BASE_URL=https://sepolia.etherscan.io
```

**Get Alchemy Key:**
1. Sign up at https://dashboard.alchemy.com
2. Create new app → Select "Ethereum Sepolia"
3. Copy API key

### 3. Deploy Smart Contract

Create `.env.deployment` (never commit this!):

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_metamask_private_key
ETHERSCAN_API_KEY=your_etherscan_key_optional
```

**Get Private Key:**
- MetaMask → Account Details → Show Private Key
- ⚠️ **NEVER share or commit this!**

**Get Sepolia ETH:**
- Visit https://sepoliafaucet.com
- Enter your wallet address
- Request testnet ETH (~0.5 ETH)

**Deploy:**

```bash
# Create deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash
source .env.deployment
npx hardhat run scripts/deploy.js --network sepolia
EOF

chmod +x deploy.sh
bash deploy.sh
```

Copy the deployed contract address and update `VITE_CONTRACT_ADDRESS` in `.env`

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

## 📱 Usage

### For Farmers

1. **Connect Wallet**
   - Click "Connect Wallet" in header
   - Approve MetaMask connection
   - Ensure you're on Sepolia testnet

2. **Create Transaction**
   - Go to "Create Transaction" tab
   - Fill in:
     - Farmer ID
     - Produce Type (e.g., Maize, Wheat)
     - Weight in kg
     - Buyer Name
     - Transaction Date
   - Review gas estimate
   - Click "Create & Verify on Blockchain"
   - Approve in MetaMask
   - Wait for confirmation (~15 seconds)

3. **View Dashboard**
   - Switch to "Dashboard" tab
   - See all your transactions
   - Check status badges
   - Click "View on Etherscan" for confirmed transactions

### For Buyers/Auditors

1. **Verify Transaction**
   - Go to "Verify Transaction" tab
   - Enter Transaction ID
   - Enter Expected Hash
   - Click "Verify on Blockchain"
   - See verification results with:
     - Farmer's wallet address
     - Timestamp
     - Blockchain proof
     - Etherscan link

## 🧪 Testing

### Run Tests

```bash
# Property-based tests
npm test

# Smart contract tests
npx hardhat test
```

### Test Coverage

- Hash generation consistency (100 iterations)
- Wallet address validation (100 iterations)
- Gas estimation (100 iterations)
- Smart contract verification storage
- Duplicate prevention
- Input validation

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (Vite + TypeScript) │
│   - MetaMask Integration             │
│   - ethers.js v6                     │
│   - React Hooks                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Ethereum Sepolia Testnet           │
│   - Smart Contract                   │
│   - Verification Records             │
│   - Event Emission                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database (Optional)     │
│   - Transaction Metadata             │
│   - User Profiles                    │
│   - Relational Data                  │
└─────────────────────────────────────┘
```

## 📂 Project Structure

```
Agritoken_Ledger/
├── contracts/              # Solidity smart contracts
│   └── AgriTokenVerification.sol
├── scripts/                # Deployment scripts
│   └── deploy.js
├── src/
│   ├── components/         # React components
│   │   ├── WalletConnect.tsx
│   │   ├── NetworkStatus.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── VerifyTransaction.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useBlockchain.ts
│   │   └── useGasEstimation.ts
│   ├── services/           # Web3 services
│   │   └── web3Service.ts
│   ├── utils/              # Utility functions
│   │   └── hash.ts
│   └── App.tsx             # Main app component
├── test/                   # Smart contract tests
├── migrations/             # Database migrations
└── package.json
```

## 🔐 Security

- ✅ Private keys stored in `.env.deployment` (gitignored)
- ✅ Testnet only (no real money at risk)
- ✅ Input validation on smart contract
- ✅ Duplicate transaction prevention
- ✅ MetaMask transaction approval required
- ✅ Gas estimation before submission

## 🌐 Network Configuration

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC URL**: Via Alchemy/Infura
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com
  - https://www.alchemy.com/faucets/ethereum-sepolia
  - https://faucet.quicknode.com/ethereum/sepolia

### Add Sepolia to MetaMask

**Method 1: Automatic**
1. Visit https://chainlist.org
2. Search "Sepolia"
3. Click "Add to MetaMask"

**Method 2: Manual**
1. MetaMask → Networks → Add Network
2. Enter:
   - Network Name: Sepolia Testnet
   - RPC URL: Your Alchemy URL
   - Chain ID: 11155111
   - Currency: ETH
   - Explorer: https://sepolia.etherscan.io

## 🚀 Deployment

### Production Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Hosting**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy`
   - AWS S3: Upload `dist/` folder

3. **Environment Variables**
   - Set production environment variables in hosting platform
   - Use mainnet RPC URL for production
   - Deploy contract to Ethereum mainnet

### Database Setup (Optional)

Run migrations:

```bash
psql -d your_database -f migrations/001_add_wallet_address.sql
```

## 🐛 Troubleshooting

### MetaMask Not Detected
- Install MetaMask from https://metamask.io
- Refresh the page
- Check browser console for errors

### Wrong Network
- Click "Switch to Sepolia" button
- Or manually switch in MetaMask

### Insufficient Balance
- Get testnet ETH from faucets
- Wait 1-2 minutes for confirmation
- Check balance in MetaMask

### Transaction Failed
- Check you have enough ETH for gas
- Verify you're on Sepolia network
- Try increasing gas limit
- Check Etherscan for error details

### Contract Not Found
- Verify `VITE_CONTRACT_ADDRESS` in `.env`
- Ensure contract is deployed to Sepolia
- Check contract on Etherscan

## 📚 Documentation

- **Smart Contract**: `contracts/AgriTokenVerification.sol`
- **Design Specs**: `.kiro/specs/blockchain-integration/design.md`
- **Requirements**: `.kiro/specs/blockchain-integration/requirements.md`
- **Tasks**: `.kiro/specs/blockchain-integration/tasks.md`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Alchemy Dashboard**: https://dashboard.alchemy.com
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Etherscan**: https://sepolia.etherscan.io
- **MetaMask**: https://metamask.io
- **Hardhat**: https://hardhat.org

## 💡 Support

For issues and questions:
1. Check troubleshooting section above
2. Review documentation in `.kiro/specs/`
3. Open an issue on GitHub
4. Check Etherscan for transaction details

## 🎯 Roadmap

- [ ] Mainnet deployment
- [ ] Multi-chain support (Polygon, BSC)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Bulk transaction upload
- [ ] API for third-party integration
- [ ] NFT certificates for verified transactions

---

**Built with ❤️ for transparent agricultural supply chains**
