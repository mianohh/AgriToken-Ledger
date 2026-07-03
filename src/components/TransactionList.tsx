import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Hash, Clock, CheckCircle, Sprout } from 'lucide-react';

interface Transaction {
  id: string;
  produce_type: string;
  weight_kg: number;
  buyer_name: string;
  status: 'confirmed';
  blockchain_tx_id: string;
  created_at: string;
  hash?: string;
}

export function TransactionList() {
  const { isConnected, address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      loadTransactions();
    }
  }, [isConnected, address]);

  const loadTransactions = () => {
    if (!address) return;
    const stored = localStorage.getItem(`transactions_${address}`);
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      setTransactions([]);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Sprout className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Connect your wallet to view transactions</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Sprout className="w-7 h-7 text-primary" />
        </div>
        <p className="text-muted-foreground">No transactions yet. Create your first transaction!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[600px]">
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="group p-4 rounded-xl border border-border bg-card hover:border-agri-green/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-agri-green to-agri-dark opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-semibold text-foreground">{tx.produce_type}</h4>
                  <Badge variant="outline" className="border-agri-green/50 text-agri-green text-[10px] gap-1">
                    <CheckCircle className="w-3 h-3" />
                    confirmed
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    TX: <span className="select-all text-foreground/80">{tx.id}</span>
                  </p>
                  {tx.hash && (
                    <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 break-all">
                      <Hash className="w-3 h-3 shrink-0" />
                      Hash: <span className="select-all text-foreground/80">{tx.hash}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5 border-border hover:border-primary/50">
                <a
                  href={`${import.meta.env.VITE_EXPLORER_URL}/tx/${tx.blockchain_tx_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BaseScan
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
