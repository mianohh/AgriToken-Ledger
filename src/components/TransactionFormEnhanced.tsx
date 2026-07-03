import { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useWallet } from '../hooks/useWallet';
import { useGasEstimation } from '../hooks/useGasEstimation';
import { generateTransactionHash } from '../utils/hash';
import { processAgriImageWithSecurity, PipelineStatus, ExtractedAgriData } from '../services/oxloAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, CheckCircle, AlertTriangle, Shield, FileText, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const verdictConfig: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  SAFE_TO_HASH:    { bg: "bg-agri-green/5",  border: "border-agri-green/30",   text: "text-agri-green",  icon: <CheckCircle className="w-4 h-4" /> },
  FRAUD_DETECTED:  { bg: "bg-destructive/5", border: "border-destructive/30",  text: "text-destructive", icon: <AlertTriangle className="w-4 h-4" /> },
  REVIEW_REQUIRED: { bg: "bg-amber-500/5",   border: "border-amber-500/30",   text: "text-amber-400",   icon: <Shield className="w-4 h-4" /> },
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
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(objectUrl);
      setSelectedImage(compressed);
      setImagePreview(compressed);
      setExtractedData(null);
      setPipelineStatus({ stage: 'idle', message: '', progress: 0 });
    };
    img.src = objectUrl;
  };

  const isValidFarmerId = (v: string) => !!v && v !== 'UNKNOWN' && v !== 'EXTRACTION_FAILED' && v !== 'Unknown' && v !== 'null';
  const isValidString = (v: string) => !!v && !['Unknown', 'Unknown Crop', 'Unknown Buyer', 'UNKNOWN', 'EXTRACTION_FAILED', 'null', 'N/A', 'n/a'].includes(v);
  const isValidWeight = (v: number) => !!v && v > 0;
  const isValidDate = (v: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    try {
      const result = await processAgriImageWithSecurity(selectedImage, setPipelineStatus);
      setExtractedData(result);
      setFormData({
        farmer_id: isValidFarmerId(result.farmer_id) ? result.farmer_id : '',
        produce_type: isValidString(result.produce_type) ? result.produce_type : '',
        weight_kg: isValidWeight(result.weight_kg) ? result.weight_kg : 0,
        buyer_name: isValidString(result.buyer_name) ? result.buyer_name : '',
        transaction_date: isValidDate(result.transaction_date) ? result.transaction_date : '',
      });
    } catch (err) {
      setPipelineStatus({
        stage: 'error',
        message: `Connection to Oxlo AI failed. Please fill in the fields manually.`,
        progress: 0,
      });
      setExtractedData({
        farmer_id: '', produce_type: '', weight_kg: 0, buyer_name: '', transaction_date: '',
        validityScore: 0,
        security_audit: { metadata_match: false, tamper_probability: 0, visual_anomalies: [], verdict: 'REVIEW_REQUIRED', confidence_score: 0 },
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
        id: txId, ...formData, status: 'confirmed' as const,
        blockchain_tx_id: blockchainTxHash, created_at: new Date().toISOString(),
        hash, security_audit: extractedData?.security_audit,
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
      <div className="text-center py-10 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">Phase 1 — Web3 Handshake</h3>
        <p className="text-muted-foreground text-sm">Connect your wallet to Base Sepolia to begin</p>
      </div>
    );
  }

  const verdict = extractedData?.security_audit?.verdict;
  const verdictStyle = verdict ? verdictConfig[verdict] : null;

  const stages = ['vision', 'reasoning', 'validation', 'complete'] as const;
  const stageIndex = ['idle', 'vision', 'reasoning', 'validation', 'complete', 'error'].indexOf(pipelineStatus.stage);

  return (
    <div className="space-y-8">
      {/* Phase 2: Evidence Upload */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Phase 2 — Evidence Upload
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Upload an agricultural receipt, weighbridge ticket, or crop document
          </p>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer",
            dragActive
              ? "border-agri-green bg-agri-green/5 shadow-[0_0_30px_rgba(0,255,136,0.2)]"
              : "border-border hover:border-agri-green/30 bg-muted/30"
          )}
        >
          {imagePreview ? (
            <div className="space-y-3">
              <img src={imagePreview} alt="Preview" className="max-w-[300px] max-h-[200px] mx-auto rounded-xl border border-border" />
              <Badge variant="outline" className="border-agri-green/50 text-agri-green gap-1.5">
                <CheckCircle className="w-3 h-3" />
                Document loaded
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl border border-border bg-muted/50 flex items-center justify-center">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drag and drop your document here</p>
                <p className="text-muted-foreground text-sm mt-1">or</p>
              </div>
              <Label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 btn-agri rounded-xl px-6 py-2.5 cursor-pointer text-sm font-semibold"
              >
                <FileText className="w-4 h-4" />
                Browse Files
              </Label>
            </div>
          )}
        </div>

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {selectedImage && !extractedData && pipelineStatus.stage === 'idle' && (
          <Button onClick={handleAnalyzeImage} className="w-full btn-agri">
            <Zap className="w-4 h-4" />
            Initiate AI Analysis
          </Button>
        )}
      </div>

      {/* Phase 3: AI Pipeline */}
      {(pipelineStatus.stage !== 'idle' || extractedData) && (
        <div className="space-y-4">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Phase 3 — Chained AI Processing
          </h3>

          {/* Pipeline stages */}
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage, idx) => {
              const isDone = stageIndex > idx + 1;
              const isActive = stageIndex === idx + 1;
              return (
                <div
                  key={stage}
                  className={cn(
                    "p-2.5 rounded-xl border text-center text-xs font-mono transition-all",
                    isDone
                      ? "border-agri-green/50 bg-agri-green/5 text-agri-green"
                      : isActive
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {stage.toUpperCase()}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <Progress
            value={pipelineStatus.progress}
            className={cn(
              "h-1.5",
              pipelineStatus.stage === 'error' && "[&>div]:bg-destructive"
            )}
          />

          {pipelineStatus.message && (
            <div
              className={cn(
                "p-3 rounded-xl border font-mono text-xs",
                pipelineStatus.stage === 'error'
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : pipelineStatus.stage === 'complete'
                  ? "border-agri-green/30 bg-agri-green/5 text-agri-green"
                  : "border-primary/30 bg-primary/5 text-foreground"
              )}
            >
              {pipelineStatus.message}
            </div>
          )}

          {/* Analysis Output */}
          {extractedData?.security_audit && verdictStyle && (
            <Card className={cn("border", verdictStyle.bg, verdictStyle.border)}>
              <CardContent className="pt-6 space-y-5">
                <p className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Analysis Output
                </p>

                {/* Security Audit */}
                <div className="space-y-3">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Security Audit</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Verdict', value: verdict },
                      { label: 'Confidence', value: `${extractedData.security_audit.confidence_score}/100` },
                      { label: 'Tamper Probability', value: `${(extractedData.security_audit.tamper_probability * 100).toFixed(1)}%` },
                      { label: 'Validity Score', value: `${extractedData.validityScore}/100` },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                        <p className="text-[11px] text-muted-foreground font-mono mb-1">{label}</p>
                        <p className={cn("text-sm font-semibold font-mono", verdictStyle.text)}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {extractedData.security_audit.visual_anomalies?.length > 0 && (
                    <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                      <p className="text-[11px] text-muted-foreground font-mono mb-2">VISUAL ANOMALIES</p>
                      {extractedData.security_audit.visual_anomalies.map((a, i) => (
                        <p key={i} className="text-xs text-destructive">{a}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Extracted Data */}
                <div className="space-y-3">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Extracted Data</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Farmer ID', value: extractedData.farmer_id },
                      { label: 'Crop Type', value: extractedData.produce_type },
                      { label: 'Weight', value: `${extractedData.weight_kg} kg` },
                      { label: 'Buyer', value: extractedData.buyer_name },
                      { label: 'Date', value: extractedData.transaction_date },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                        <p className="text-[11px] text-muted-foreground font-mono mb-1">{label}</p>
                        <p className="text-sm font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Phase 4: Review & Confirm */}
      {extractedData && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Phase 4 — Review and Confirm
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              AI-extracted data is locked. Only manually fill empty fields.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmer_id">Farmer ID</Label>
              <Input
                id="farmer_id"
                placeholder="Farmer ID"
                value={formData.farmer_id}
                onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
                required
                disabled={isValidFarmerId(extractedData.farmer_id)}
                className="input-agri"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="produce_type">Produce Type</Label>
              <Input
                id="produce_type"
                placeholder="e.g. Maize, Wheat"
                value={formData.produce_type}
                onChange={(e) => setFormData({ ...formData, produce_type: e.target.value })}
                required
                disabled={isValidString(extractedData.produce_type)}
                className="input-agri"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  placeholder="Weight"
                  value={formData.weight_kg || ''}
                  onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
                  required
                  min="0.1"
                  step="0.1"
                  disabled={isValidWeight(extractedData.weight_kg)}
                  className="input-agri"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Date</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                  disabled={isValidDate(extractedData.transaction_date)}
                  className="input-agri"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer_name">Buyer Name</Label>
              <Input
                id="buyer_name"
                placeholder="Buyer Name"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                required
                disabled={isValidString(extractedData.buyer_name)}
                className="input-agri"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/50 border border-border font-mono text-sm text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Estimated gas: {estimatedCost} ETH
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !hasSufficientBalance || extractedData.security_audit.verdict === 'FRAUD_DETECTED'}
            className={cn(
              "w-full btn-agri",
              extractedData.security_audit.verdict === 'FRAUD_DETECTED' && "opacity-40 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting to Blockchain...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Verify and Hash to Ledger
              </>
            )}
          </Button>

          {extractedData.security_audit.verdict === 'FRAUD_DETECTED' && (
            <p className="text-destructive font-semibold font-mono text-xs text-center">
              Transaction blocked — fraud detected
            </p>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/30 text-destructive text-sm">
              {error.message}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-agri-green/5 border border-agri-green/30">
              <p className="text-agri-green font-semibold font-display flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Phase 5 — Transaction verified and stored on blockchain
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
