import { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useWallet } from '../hooks/useWallet';
import { useGasEstimation } from '../hooks/useGasEstimation';
import { generateTransactionHash } from '../utils/hash';

export function TransactionForm() {
  const { isConnected, balance, address } = useWallet();
  const { storeHash, isSubmitting, error } = useBlockchain();
  const { estimatedCost, hasSufficientBalance } = useGasEstimation(balance);
  
  const [formData, setFormData] = useState({
    farmer_id: '',
    produce_type: '',
    weight_kg: 0,
    buyer_name: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    if (!hasSufficientBalance) {
      alert('Insufficient balance for gas fees');
      return;
    }

    const hash = await generateTransactionHash(formData);
    const txId = crypto.randomUUID();
    
    try {
      const blockchainTxHash = await storeHash(txId, hash);
      
      // Store transaction locally
      const transaction = {
        id: txId,
        ...formData,
        status: 'confirmed',
        blockchain_tx_id: blockchainTxHash,
        created_at: new Date().toISOString(),
        hash
      };
      
      const stored = localStorage.getItem(`transactions_${address}`) || '[]';
      const transactions = JSON.parse(stored);
      transactions.unshift(transaction);
      localStorage.setItem(`transactions_${address}`, JSON.stringify(transactions));
      
      setSuccess(true);
      setFormData({
        farmer_id: '',
        produce_type: '',
        weight_kg: 0,
        buyer_name: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to store hash:', err);
    }
  };

  if (!isConnected) {
    return <p>Connect your wallet to create transactions</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Farmer ID"
        value={formData.farmer_id}
        onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
        required
      />
      <input
        placeholder="Produce Type (e.g., Maize, Wheat)"
        value={formData.produce_type}
        onChange={(e) => setFormData({ ...formData, produce_type: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Weight (kg)"
        value={formData.weight_kg || ''}
        onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
        required
        min="0.1"
        step="0.1"
      />
      <input
        placeholder="Buyer Name"
        value={formData.buyer_name}
        onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
        required
      />
      <input
        type="date"
        value={formData.transaction_date}
        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
        required
      />
      
      <div className="gas-info">
        💰 Estimated gas: {estimatedCost} ETH
      </div>
      
      <button type="submit" disabled={isSubmitting || !hasSufficientBalance}>
        {isSubmitting ? '⏳ Submitting to Blockchain...' : '✅ Create & Verify on Blockchain'}
      </button>
      
      {error && <p className="error">❌ {error.message}</p>}
      {success && <p style={{color: '#27ae60'}}>✅ Transaction verified on blockchain!</p>}
    </form>
  );
}
