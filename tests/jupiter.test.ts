import { describe, it, expect } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { JupiterParser } from '../src/parsers/jupiter';
import { ParserContext } from '../src/types';

describe('JupiterParser', () => {
    const parser = new JupiterParser();
    const programId = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

    const createCtx = (data: Buffer): ParserContext => ({
        tx: {} as any,
        instruction: {
            programId,
            keys: [],
            data
        },
        accounts: [],
        programId,
        connection: {} as any // mock connection
    });

    it('should identify Route instruction', async () => {
        // e517cb977ae3ad2a
        const data = Buffer.from('e517cb977ae3ad2a', 'hex');
        const ctx = createCtx(data);
        const result = await parser.parse(ctx);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('Swap (Route)');
        expect(result?.protocol).toBe('Jupiter');
    });

    it('should identify SharedAccountsRoute instruction', async () => {
        // c1209b3341d69c81
        const data = Buffer.from('c1209b3341d69c81', 'hex');
        const ctx = createCtx(data);
        const result = await parser.parse(ctx);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('Swap (SharedAccounts)');
    });

    it('should return Unknown for other instructions', async () => {
        const data = Buffer.from('0000000000000000', 'hex');
        const ctx = createCtx(data);
        const result = await parser.parse(ctx);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('Unknown');
        expect(result?.summary).toContain('Jupiter Instruction');
    });
});
