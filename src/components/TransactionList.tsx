import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';

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
    return <p>Connect your wallet to view transactions</p>;
  }

  if (transactions.length === 0) {
    return <p>No transactions yet. Create your first transaction!</p>;
  }

  return (
    <div className="transaction-list">
      {transactions.map(tx => (
        <div key={tx.id} className="transaction-item">
          <div className="transaction-info">
            <strong>{tx.produce_type}</strong>
            <br />
            <small style={{ display: 'block', marginTop: '6px' }}>
              TX ID: <code style={{ userSelect: 'all', fontFamily: 'JetBrains Mono, monospace' }}>{tx.id}</code>
            </small>
            {tx.hash && (
              <small style={{ display: 'block', marginTop: '4px' }}>
                Data Hash: <code style={{ userSelect: 'all', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>{tx.hash}</code>
              </small>
            )}
            <small style={{ display: 'block', marginTop: '4px' }}>
              {new Date(tx.created_at).toLocaleString()}
            </small>
            <span className="status-badge status-confirmed" style={{ marginTop: '8px', display: 'inline-block' }}>
              confirmed
            </span>
          </div>
          <div className="transaction-actions">
            <a
              href={`${import.meta.env.VITE_EXPLORER_URL}/tx/${tx.blockchain_tx_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button>View on BaseScan</button>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
