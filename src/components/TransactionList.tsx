import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

interface Transaction {
  id: string;
  produce_type: string;
  weight_kg: number;
  buyer_name: string;
  status: 'pending' | 'blockchain_pending' | 'confirmed' | 'failed';
  blockchain_tx_id?: string;
  created_at: string;
}

export function TransactionList() {
  const { isConnected } = useWallet();
  const [transactions] = useState<Transaction[]>([]);

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
            <strong>{tx.produce_type}</strong> - {tx.weight_kg}kg
            <br />
            <small>Buyer: {tx.buyer_name}</small>
            <br />
            <span className={`status-badge status-${tx.status}`}>
              {tx.status.replace('_', ' ')}
            </span>
          </div>
          <div className="transaction-actions">
            {tx.status === 'confirmed' && tx.blockchain_tx_id && (
              <a
                href={`${import.meta.env.VITE_ETHERSCAN_BASE_URL}/tx/${tx.blockchain_tx_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button>View on Etherscan</button>
              </a>
            )}
            {tx.status === 'failed' && (
              <button>Retry</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
