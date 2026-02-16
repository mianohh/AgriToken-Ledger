import { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';

export function VerifyTransaction() {
  const [txId, setTxId] = useState('');
  const [expectedHash, setExpectedHash] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { verifyHash } = useBlockchain();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const verification = await verifyHash(txId, expectedHash);
      setResult(verification);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-transaction">
      <form onSubmit={handleVerify}>
        <input
          placeholder="Transaction ID"
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
          required
        />
        <input
          placeholder="Expected Hash (0x...)"
          value={expectedHash}
          onChange={(e) => setExpectedHash(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '🔍 Verifying...' : '🔍 Verify on Blockchain'}
        </button>
      </form>
      
      {result && (
        <div className="result">
          <h3>{result.isVerified ? '✅ Verified' : '❌ Not Verified'}</h3>
          {result.record && (
            <>
              <p><strong>Farmer Address:</strong> {result.record.farmerAddress}</p>
              <p><strong>Timestamp:</strong> {new Date(Number(result.record.timestamp) * 1000).toLocaleString()}</p>
              <p><strong>Transaction Hash:</strong> {result.record.transactionHash}</p>
              <a 
                href={`${import.meta.env.VITE_ETHERSCAN_BASE_URL}/tx/${result.record.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Etherscan →
              </a>
            </>
          )}
          {!result.isVerified && (
            <p>Transaction not found on blockchain or hash mismatch.</p>
          )}
        </div>
      )}
    </div>
  );
}
