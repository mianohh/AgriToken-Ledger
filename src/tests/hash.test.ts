import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateTransactionHash } from '../utils/hash';

// Feature: blockchain-integration, Property 10: Hash generation consistency
describe('Hash Generation Properties', () => {
  it('should generate identical hashes for identical transaction data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          farmer_id: fc.uuid(),
          produce_type: fc.string({ minLength: 1, maxLength: 50 }),
          weight_kg: fc.double({ min: 0.1, max: 10000 }),
          buyer_name: fc.string({ minLength: 1, maxLength: 100 }),
          transaction_date: fc.date().map(d => d.toISOString())
        }),
        async (data) => {
          const hash1 = await generateTransactionHash(data);
          const hash2 = await generateTransactionHash(data);
          expect(hash1).toBe(hash2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
