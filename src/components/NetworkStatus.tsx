import { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Service';

const SEPOLIA_CHAIN_ID = 11155111;

export function NetworkStatus() {
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    checkNetwork();
    web3Service.onNetworkChanged((newChainId) => {
      setChainId(newChainId);
      setIsCorrectNetwork(newChainId === SEPOLIA_CHAIN_ID);
    });
  }, []);

  const checkNetwork = async () => {
    try {
      const currentChainId = await web3Service.getCurrentNetwork();
      setChainId(currentChainId);
      setIsCorrectNetwork(currentChainId === SEPOLIA_CHAIN_ID);
    } catch (err) {
      console.error('Failed to check network:', err);
    }
  };

  const switchNetwork = async () => {
    try {
      await web3Service.switchToSepolia();
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  if (!chainId) return null;

  return (
    <div className={`network-status ${isCorrectNetwork ? 'correct' : 'incorrect'}`}>
      <span>{isCorrectNetwork ? '🟢' : '🔴'}</span>
      <span>{isCorrectNetwork ? 'Sepolia' : `Wrong Network (${chainId})`}</span>
      {!isCorrectNetwork && (
        <button onClick={switchNetwork}>Switch to Sepolia</button>
      )}
    </div>
  );
}
