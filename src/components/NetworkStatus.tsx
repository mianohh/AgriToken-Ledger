import { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      // Wallet not connected yet
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
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 font-mono text-xs",
          isCorrectNetwork
            ? "border-agri-green/50 text-agri-green"
            : "border-destructive/50 text-destructive"
        )}
      >
        <Globe className="w-3 h-3" />
        {isCorrectNetwork ? 'Base Sepolia' : `Chain ${chainId}`}
      </Badge>
      {!isCorrectNetwork && (
        <Button
          variant="outline"
          size="sm"
          onClick={switchNetwork}
          className="gap-1.5 text-xs h-7"
        >
          <RefreshCw className="w-3 h-3" />
          Switch
        </Button>
      )}
    </div>
  );
}
