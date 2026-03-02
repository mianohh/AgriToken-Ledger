import { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Service';

const BASE_SEPOLIA_CHAIN_ID = 84532;

export function NetworkStatus() {
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    checkNetwork();
    web3Service.onNetworkChanged((newChainId) => {
      setChainId(newChainId);
      setIsCorrectNetwork(newChainId === BASE_SEPOLIA_CHAIN_ID);
    });
  }, []);

  const checkNetwork = async () => {
    try {
      if (!window.ethereum) return;
      const currentChainId = await web3Service.getCurrentNetwork();
      setChainId(currentChainId);
      setIsCorrectNetwork(currentChainId === BASE_SEPOLIA_CHAIN_ID);
    } catch (err) {
      // Wallet not connected yet, ignore
    }
  };

  const switchNetwork = async () => {
    try {
      await web3Service.switchToBaseSepolia();
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  if (!chainId) return null;

  return (
    <div className={`network-status ${isCorrectNetwork ? 'correct' : 'incorrect'}`}>
      <span>{isCorrectNetwork ? '🟢' : '🔴'}</span>
      <span>{isCorrectNetwork ? 'Base Sepolia' : `Wrong Network (${chainId})`}</span>
      {!isCorrectNetwork && (
        <button onClick={switchNetwork}>Switch to Base Sepolia</button>
      )}
    </div>
  );
}
