import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export interface UseGasEstimationReturn {
  estimatedGas: string;
  estimatedCost: string;
  hasSufficientBalance: boolean;
  isEstimating: boolean;
}

export function useGasEstimation(balance: string): UseGasEstimationReturn {
  const [estimatedGas, setEstimatedGas] = useState('60000');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [isEstimating, setIsEstimating] = useState(false);

  useEffect(() => {
    estimateGas();
  }, []);

  const estimateGas = async () => {
    setIsEstimating(true);
    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      const cost = (BigInt(estimatedGas) * gasPrice);
      setEstimatedCost(ethers.formatEther(cost));
    } catch (err) {
      console.error('Gas estimation failed:', err);
    } finally {
      setIsEstimating(false);
    }
  };

  const hasSufficientBalance = parseFloat(balance) >= parseFloat(estimatedCost);

  return { estimatedGas, estimatedCost, hasSufficientBalance, isEstimating };
}
