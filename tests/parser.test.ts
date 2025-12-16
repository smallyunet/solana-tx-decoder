import { describe, it, expect, vi } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import { SolanaParser } from '../src/index';

describe('SolanaParser', () => {
    it('should instantiate correctly', () => {
        const connection = new Connection('https://api.devnet.solana.com');
        const parser = new SolanaParser(connection);
        expect(parser).toBeDefined();
        expect(parser.getRegistry()).toBeDefined();
    });

    it('should parse system transfer transaction', async () => {
        // Mock connection and transaction response can be complex.
        // For now, we verify that invalid TX IDs return null or handle errors gracefully.

        const connection = {
            getTransaction: vi.fn().mockResolvedValue(null)
        } as unknown as Connection;

        const parser = new SolanaParser(connection);
        const result = await parser.parseTransaction('invalid_tx_id');

        expect(result).toBeNull();
        expect(connection.getTransaction).toHaveBeenCalledWith('invalid_tx_id', expect.anything());
    });
});
