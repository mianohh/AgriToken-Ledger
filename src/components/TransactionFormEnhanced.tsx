import { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useWallet } from '../hooks/useWallet';
import { useGasEstimation } from '../hooks/useGasEstimation';
import { generateTransactionHash } from '../utils/hash';
import { processAgriImageWithSecurity, PipelineStatus, ExtractedAgriData } from '../services/oxloOracleEnhanced';

const verdictColors: Record<string, { bg: string; border: string; color: string }> = {
  SAFE_TO_HASH:    { bg: 'rgba(0,255,136,0.08)',  border: 'var(--ai-green-glow)',    color: 'var(--ai-green-glow)' },
  FRAUD_DETECTED:  { bg: 'rgba(239,68,68,0.08)',  border: 'var(--error-red)',        color: 'var(--error-red)' },
  REVIEW_REQUIRED: { bg: 'rgba(245,158,11,0.08)', border: 'var(--warning-amber)',    color: 'var(--warning-amber)' },
};

export function TransactionFormEnhanced() {
  const { isConnected, balance, address: walletAddress } = useWallet();
  const { storeHash, isSubmitting, error } = useBlockchain();
  const { estimatedCost, hasSufficientBalance } = useGasEstimation(balance);

  const [formData, setFormData] = useState({
    farmer_id: '',
    produce_type: '',
    weight_kg: 0,
    buyer_name: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedAgriData | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({ stage: 'idle', message: '', progress: 0 });
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target?.result as string;
      setSelectedImage(base64Image);
      setImagePreview(base64Image);
      setExtractedData(null);
      setPipelineStatus({ stage: 'idle', message: '', progress: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    try {
      const result = await processAgriImageWithSecurity(selectedImage, setPipelineStatus);
      setExtractedData(result);
      
      // Auto-fill only valid detected data, leave invalid fields empty for manual entry
      setFormData({
        farmer_id:        isValidFarmerId(result.farmer_id)    ? result.farmer_id        : '',
        produce_type:     isValidString(result.produce_type)   ? result.produce_type     : '',
        weight_kg:        isValidWeight(result.weight_kg)      ? result.weight_kg        : 0,
        buyer_name:       isValidString(result.buyer_name)     ? result.buyer_name       : '',
        transaction_date: isValidDate(result.transaction_date) ? result.transaction_date : '',
      });
    } catch (err) {
      setPipelineStatus({
        stage: 'error',
        message: `Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}. Fill manually.`,
        progress: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    if (!hasSufficientBalance) { alert('Insufficient balance for gas fees'); return; }
    if (extractedData?.security_audit.verdict === 'FRAUD_DETECTED') {
      alert('Fraud detected. This transaction cannot be submitted.');
      return;
    }
    const hash = await generateTransactionHash(formData);
    const txId = crypto.randomUUID();
    try {
      const blockchainTxHash = await storeHash(txId, hash);
      const transaction = {
        id: txId,
        ...formData,
        status: 'confirmed',
        blockchain_tx_id: blockchainTxHash,
        created_at: new Date().toISOString(),
        hash,
        security_audit: extractedData?.security_audit,
      };
      const stored = localStorage.getItem(`transactions_${walletAddress}`) || '[]';
      const transactions = JSON.parse(stored);
      transactions.unshift(transaction);
      localStorage.setItem(`transactions_${walletAddress}`, JSON.stringify(transactions));
      setSuccess(true);
      setFormData({ farmer_id: '', produce_type: '', weight_kg: 0, buyer_name: '', transaction_date: new Date().toISOString().split('T')[0] });
      setSelectedImage(null);
      setImagePreview(null);
      setExtractedData(null);
      setPipelineStatus({ stage: 'idle', message: '', progress: 0 });
    } catch (err) {
      console.error('Failed to store hash:', err);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Phase 1 — Web3 Handshake
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>Connect your wallet to Base Sepolia to begin</p>
      </div>
    );
  }

  const isValidFarmerId = (v: string) => !!v && v !== 'UNKNOWN' && v !== 'EXTRACTION_FAILED' && v !== 'Unknown';
  const isValidString = (v: string) => !!v && v !== 'Unknown' && v !== 'Unknown Crop' && v !== 'Unknown Buyer' && v !== 'UNKNOWN' && v !== 'EXTRACTION_FAILED';
  const isValidWeight = (v: number) => !!v && v > 0;
  const isValidDate = (v: string) => !!v && v.match(/^\d{4}-\d{2}-\d{2}$/) !== null;

  const verdict = extractedData?.security_audit?.verdict;
  const verdictStyle = verdict ? verdictColors[verdict] : null;

  return (
    <div>
      {/* Phase 2: Evidence Upload */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Phase 2 — Evidence Upload
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
          Upload an agricultural receipt, weighbridge ticket, or crop document
        </p>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `1px dashed ${dragActive ? 'var(--ai-green-glow)' : 'rgba(0,255,136,0.3)'}`,
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            background: dragActive ? 'rgba(0,255,136,0.05)' : 'rgba(15,23,42,0.4)',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: dragActive ? '0 0 30px rgba(0,255,136,0.2)' : 'none',
          }}
        >
          {imagePreview ? (
            <div>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '12px', border: '1px solid var(--border-glow)' }} />
              <p style={{ marginTop: '12px', color: 'var(--ai-green-glow)', fontWeight: 600, fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
                Document loaded
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                width: '64px', height: '64px', margin: '0 auto 16px',
                border: '2px solid var(--border-glow)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,255,136,0.05)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ai-green-glow)" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Drag and drop your document here
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>or</p>
              <label
                htmlFor="file-upload"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, var(--ai-green-glow) 0%, var(--agri-green) 100%)',
                  color: 'var(--space-black)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  boxShadow: '0 0 20px rgba(0,255,136,0.3)',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                Browse Files
              </label>
            </div>
          )}
        </div>

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {selectedImage && !extractedData && pipelineStatus.stage === 'idle' && (
          <button onClick={handleAnalyzeImage} style={{ width: '100%', marginTop: '16px', padding: '16px', fontSize: '15px' }}>
            Initiate AI Oracle Analysis
          </button>
        )}
      </div>

      {/* Phase 3: AI Oracle Pipeline */}
      {(pipelineStatus.stage !== 'idle' || extractedData) && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Phase 3 — Chained AI Oracle Processing
          </h3>

          {/* Pipeline stages */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {(['vision', 'reasoning', 'validation', 'complete'] as const).map((stage) => {
              const stageIndex = ['vision', 'reasoning', 'validation', 'complete'].indexOf(stage);
              const currentIndex = ['idle', 'vision', 'reasoning', 'validation', 'complete', 'error'].indexOf(pipelineStatus.stage);
              const isActive = currentIndex === stageIndex + 1;
              const isDone = currentIndex > stageIndex + 1;
              return (
                <div key={stage} style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${isDone ? 'var(--ai-green-glow)' : isActive ? 'var(--blockchain-blue)' : 'rgba(255,255,255,0.1)'}`,
                  background: isDone ? 'rgba(0,255,136,0.08)' : isActive ? 'rgba(74,144,226,0.08)' : 'transparent',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isDone ? 'var(--ai-green-glow)' : isActive ? 'var(--blockchain-blue)' : 'var(--text-secondary)',
                  transition: 'all 0.3s',
                }}>
                  {stage.toUpperCase()}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{
              width: `${pipelineStatus.progress}%`,
              height: '100%',
              background: pipelineStatus.stage === 'error'
                ? 'var(--error-red)'
                : 'linear-gradient(90deg, var(--ai-green-glow), var(--blockchain-blue))',
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '0 0 10px var(--ai-green-glow)',
            }} />
          </div>

          {pipelineStatus.message && (
            <div style={{
              padding: '12px 16px',
              background: pipelineStatus.stage === 'error' ? 'rgba(239,68,68,0.08)' : pipelineStatus.stage === 'complete' ? 'rgba(0,255,136,0.08)' : 'rgba(74,144,226,0.08)',
              border: `1px solid ${pipelineStatus.stage === 'error' ? 'var(--error-red)' : pipelineStatus.stage === 'complete' ? 'var(--ai-green-glow)' : 'var(--blockchain-blue)'}`,
              borderRadius: '10px',
              marginBottom: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}>
              {pipelineStatus.message}
            </div>
          )}

          {/* Oracle Output */}
          {extractedData?.security_audit && verdictStyle && (
            <div style={{ border: `1px solid ${verdictStyle.border}`, borderRadius: '16px', padding: '20px', background: verdictStyle.bg }}>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', fontSize: '15px' }}>
                Oracle Output
              </p>

              {/* Security Audit */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Security Audit
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Verdict', value: verdict },
                    { label: 'Confidence', value: `${extractedData.security_audit.confidence_score}/100` },
                    { label: 'Tamper Probability', value: `${(extractedData.security_audit.tamper_probability * 100).toFixed(1)}%` },
                    { label: 'Validity Score', value: `${extractedData.validityScore}/100` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '10px 14px', background: 'rgba(15,23,42,0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: verdictStyle.color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
                    </div>
                  ))}
                </div>
                {extractedData.security_audit.visual_anomalies?.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px' }}>VISUAL ANOMALIES</p>
                    {extractedData.security_audit.visual_anomalies.map((a, i) => (
                      <p key={i} style={{ fontSize: '13px', color: 'var(--error-red)', margin: '2px 0' }}>{a}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Data */}
              <div>
                <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Extracted Data
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Farmer ID', value: extractedData.farmer_id },
                    { label: 'Crop Type', value: extractedData.produce_type },
                    { label: 'Weight', value: `${extractedData.weight_kg} kg` },
                    { label: 'Buyer', value: extractedData.buyer_name },
                    { label: 'Date', value: extractedData.transaction_date },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '10px 14px', background: 'rgba(15,23,42,0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 4: Review & Confirm */}
      {extractedData && (
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Phase 4 — Review and Confirm
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            AI-extracted data is locked. Only manually fill empty fields.
          </p>

          <input
            placeholder="Farmer ID"
            value={formData.farmer_id}
            onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
            required
            disabled={isValidFarmerId(extractedData.farmer_id)}
          />
          <input
            placeholder="Produce Type (e.g. Maize, Wheat)"
            value={formData.produce_type}
            onChange={(e) => setFormData({ ...formData, produce_type: e.target.value })}
            required
            disabled={isValidString(extractedData.produce_type)}
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={formData.weight_kg || ''}
            onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
            required
            min="0.1"
            step="0.1"
            disabled={isValidWeight(extractedData.weight_kg)}
          />
          <input
            placeholder="Buyer Name"
            value={formData.buyer_name}
            onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
            required
            disabled={isValidString(extractedData.buyer_name)}
          />
          <input
            type="date"
            value={formData.transaction_date}
            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
            required
            disabled={isValidDate(extractedData.transaction_date)}
          />

          <div className="gas-info">
            Estimated gas: {estimatedCost} ETH
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasSufficientBalance || extractedData.security_audit.verdict === 'FRAUD_DETECTED'}
            style={{ opacity: extractedData.security_audit.verdict === 'FRAUD_DETECTED' ? 0.4 : 1 }}
          >
            {isSubmitting ? 'Submitting to Blockchain...' : 'Verify and Hash to Ledger'}
          </button>

          {extractedData.security_audit.verdict === 'FRAUD_DETECTED' && (
            <p style={{ color: 'var(--error-red)', fontWeight: 600, marginTop: '10px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
              Transaction blocked — fraud detected
            </p>
          )}

          {error && <p className="error">{error.message}</p>}

          {success && (
            <div style={{ padding: '16px', background: 'rgba(0,255,136,0.08)', border: '1px solid var(--ai-green-glow)', borderRadius: '12px', marginTop: '16px' }}>
              <p style={{ color: 'var(--ai-green-glow)', fontWeight: 600, margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>
                Phase 5 — Transaction verified and stored on blockchain
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
