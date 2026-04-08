import { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useWallet } from '../hooks/useWallet';
import { useGasEstimation } from '../hooks/useGasEstimation';
import { generateTransactionHash } from '../utils/hash';
import { processAgriImage } from '../services/oxloOracle';

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
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target?.result as string;
      setSelectedImage(base64Image);
      setAiError(null);
      setExtractedData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setAiProcessing(true);
    setAiError(null);

    try {
      console.log('🔍 Starting AI extraction...');
      const extractedData = await processAgriImage(selectedImage);
      console.log('✅ AI extraction successful:', extractedData);
      
      setExtractedData(extractedData);
      
      // Auto-fill form with extracted data
      setFormData({
        farmer_id: extractedData.farmer_id || '',
        produce_type: extractedData.produce_type || '',
        weight_kg: extractedData.weight_kg || 0,
        buyer_name: extractedData.buyer_name || '',
        transaction_date: extractedData.transaction_date || new Date().toISOString().split('T')[0]
      });
      
      setAiProcessing(false);
    } catch (err) {
      console.error('❌ Oxlo AI error:', err);
      setAiError(`AI extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}. Please fill manually.`);
      setAiProcessing(false);
    }
  };

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
      <div className="ai-upload-section" style={{marginBottom: '20px', padding: '15px', border: '2px dashed #3498db', borderRadius: '8px', backgroundColor: 'rgba(52, 152, 219, 0.05)'}}>
        <label htmlFor="image-upload" style={{display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px'}}>
          🤖 AI-Powered Data Extraction (Oxlo.ai)
        </label>
        
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          disabled={aiProcessing}
          style={{marginBottom: '10px', display: 'block'}}
        />
        
        {selectedImage && !aiProcessing && !extractedData && (
          <button 
            type="button"
            onClick={handleAnalyzeImage}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🔍 Analyze Image with AI
          </button>
        )}
        
        {aiProcessing && (
          <div style={{padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px'}}>
            <p style={{color: '#1976d2', margin: 0, fontWeight: 'bold'}}>🔄 AI analyzing image...</p>
            <p style={{color: '#666', margin: '5px 0 0 0', fontSize: '12px'}}>Stage 1: Vision extraction → Stage 2: Validation</p>
          </div>
        )}
        
        {extractedData && (
          <div style={{padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '5px', marginTop: '10px'}}>
            <p style={{color: '#2e7d32', margin: 0, fontWeight: 'bold'}}>✅ Data extracted successfully!</p>
            <p style={{color: '#666', margin: '5px 0 0 0', fontSize: '12px'}}>Validity Score: {extractedData.validityScore}/100</p>
          </div>
        )}
        
        {aiError && (
          <div style={{padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', marginTop: '10px'}}>
            <p style={{color: '#c62828', margin: 0}}>⚠️ {aiError}</p>
          </div>
        )}
      </div>
      
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
