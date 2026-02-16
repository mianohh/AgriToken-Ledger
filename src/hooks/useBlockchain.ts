import { useState } from 'react';
import { web3Service, VerificationRecord } from '../services/web3Service';

export interface VerificationResult {
  isVerified: boolean;
  record: VerificationRecord | null;
}

export interface UseBlockchainReturn {
  storeHash: (txId: string, hash: string) => Promise<string>;
  verifyHash: (txId: string, expectedHash: string) => Promise<VerificationResult>;
  isSubmitting: boolean;
  error: Error | null;
}

export function useBlockchain(): UseBlockchainReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const storeHash = async (txId: string, hash: string): Promise<string> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const txHash = await web3Service.storeTransactionHash(txId, hash);
      return txHash;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyHash = async (txId: string, expectedHash: string): Promise<VerificationResult> => {
    setError(null);
    try {
      const isVerified = await web3Service.verifyTransactionHash(txId, expectedHash);
      const record = isVerified ? await web3Service.getVerificationRecord(txId) : null;
      return { isVerified, record };
    } catch (err) {
      setError(err as Error);
      return { isVerified: false, record: null };
    }
  };

  return { storeHash, verifyHash, isSubmitting, error };
}
