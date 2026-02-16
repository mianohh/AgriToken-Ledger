import { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Service';

export interface UseWalletReturn {
  address: string | null;
  isConnected: boolean;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  error: Error | null;
}

export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      connect();
    }

    web3Service.onAccountChanged((newAddress) => {
      setAddress(newAddress);
      localStorage.setItem('walletAddress', newAddress);
    });

    web3Service.onNetworkChanged(() => {
      if (address) {
        updateBalance();
      }
    });
  }, []);

  const updateBalance = async () => {
    try {
      const bal = await web3Service.getBalance();
      setBalance(bal);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const addr = await web3Service.connectWallet();
      setAddress(addr);
      localStorage.setItem('walletAddress', addr);
      await updateBalance();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    web3Service.disconnectWallet();
    setAddress(null);
    setBalance('0');
    localStorage.removeItem('walletAddress');
  };

  return {
    address,
    isConnected: !!address,
    balance,
    connect,
    disconnect,
    isLoading,
    error
  };
}
