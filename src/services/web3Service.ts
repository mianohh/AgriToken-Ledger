import { ethers, BrowserProvider, Contract } from 'ethers';

const CONTRACT_ABI = [
  "function storeVerification(string memory transactionId, bytes32 transactionHash) external returns (bool)",
  "function getVerification(string memory transactionId) external view returns (tuple(bytes32 transactionHash, address farmerAddress, uint256 timestamp, string transactionId))",
  "function verifyHash(string memory transactionId, bytes32 expectedHash) external view returns (bool)",
  "event TransactionVerified(string indexed transactionId, bytes32 transactionHash, address indexed farmerAddress, uint256 timestamp)"
];

const SEPOLIA_CHAIN_ID = 11155111;

export interface VerificationRecord {
  transactionHash: string;
  farmerAddress: string;
  timestamp: bigint;
  transactionId: string;
}

class Web3Service {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;
  private currentAddress: string | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new BrowserProvider(window.ethereum);
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.currentAddress = accounts[0];
    
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const signer = await this.provider.getSigner();
    this.contract = new Contract(contractAddress, CONTRACT_ABI, signer);
    
    return this.currentAddress;
  }

  disconnectWallet(): void {
    this.currentAddress = null;
    this.provider = null;
    this.contract = null;
  }

  getConnectedAddress(): string | null {
    return this.currentAddress;
  }

  async getBalance(): Promise<string> {
    if (!this.provider || !this.currentAddress) {
      throw new Error('Wallet not connected');
    }
    const balance = await this.provider.getBalance(this.currentAddress);
    return ethers.formatEther(balance);
  }

  async storeTransactionHash(transactionId: string, hash: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.contract.storeVerification(transactionId, hash);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getVerificationRecord(transactionId: string): Promise<VerificationRecord> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    const record = await this.contract.getVerification(transactionId);
    return {
      transactionHash: record[0],
      farmerAddress: record[1],
      timestamp: record[2],
      transactionId: record[3]
    };
  }

  async verifyTransactionHash(transactionId: string, expectedHash: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.verifyHash(transactionId, expectedHash);
  }

  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Sepolia Testnet',
            rpcUrls: [import.meta.env.VITE_SEPOLIA_RPC_URL],
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: [import.meta.env.VITE_ETHERSCAN_BASE_URL]
          }]
        });
      } else {
        throw error;
      }
    }
  }

  async getCurrentNetwork(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  onAccountChanged(callback: (address: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          this.currentAddress = accounts[0];
          callback(accounts[0]);
        }
      });
    }
  }

  onNetworkChanged(callback: (chainId: number) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        callback(parseInt(chainId, 16));
      });
    }
  }
}

export const web3Service = new Web3Service();
