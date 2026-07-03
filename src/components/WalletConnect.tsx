import { useWallet } from '../hooks/useWallet';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, ExternalLink } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected, balance, connect, disconnect, isLoading, error } = useWallet();
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    setHasMetaMask(typeof window.ethereum !== 'undefined');
  }, []);

  if (!hasMetaMask) {
    return (
      <Button variant="outline" asChild className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
          <Wallet className="w-4 h-4" />
          Install MetaMask
        </a>
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-agri-green/50 text-agri-green font-mono text-xs">
          {parseFloat(balance).toFixed(4)} ETH
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="border-agri-green/30 text-agri-green hover:bg-agri-green/10 gap-1.5"
        >
          <span className="font-mono text-xs">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={connect}
        disabled={isLoading}
        className="btn-agri gap-1.5"
      >
        <Wallet className="w-4 h-4" />
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      {error && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  );
}
