import { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, ExternalLink, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-6">
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="txId">Transaction ID</Label>
          <Input
            id="txId"
            placeholder="Enter Transaction ID"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            required
            className="input-agri font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedHash">Expected Hash (0x...)</Label>
          <Input
            id="expectedHash"
            placeholder="Enter the data hash from the transaction dashboard"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            required
            title="Use the Data Hash from the transaction dashboard"
            className="input-agri font-mono text-sm"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full btn-agri">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Verify on Blockchain
            </>
          )}
        </Button>
      </form>

      {result && (
        <Card className={cn(
          "border",
          result.isVerified
            ? "border-agri-green/30 bg-agri-green/5"
            : "border-destructive/30 bg-destructive/5"
        )}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              {result.isVerified ? (
                <div className="w-10 h-10 rounded-full bg-agri-green/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-agri-green" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
              )}
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  {result.isVerified ? 'Verified' : 'Not Verified'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {result.isVerified
                    ? 'Transaction hash matches on-chain record'
                    : 'Transaction not found or hash mismatch'}
                </p>
              </div>
            </div>

            {result.record && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground font-mono uppercase">Farmer Address</p>
                    <p className="text-sm font-mono text-agri-green">{result.record.farmerAddress}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-mono uppercase">Timestamp</p>
                    <p className="text-sm text-foreground">{new Date(Number(result.record.timestamp) * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-mono uppercase">Transaction Hash</p>
                    <p className="text-sm font-mono text-foreground break-all">{result.record.transactionHash}</p>
                  </div>
                </div>

                <Button variant="outline" asChild className="w-full gap-1.5 border-agri-green/30 text-agri-green hover:bg-agri-green/10">
                  <a
                    href={`${import.meta.env.VITE_EXPLORER_URL}/tx/${result.record.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            )}

            {!result.isVerified && (
              <p className="text-sm text-muted-foreground text-center">
                Transaction not found on blockchain or hash mismatch.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
