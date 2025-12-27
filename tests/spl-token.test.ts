import { describe, it, expect } from 'vitest';
import { PublicKey, Keypair } from '@solana/web3.js';
import { SplTokenParser } from '../src/parsers/spl-token';
import { ParserContext } from '../src/types';

describe('SplTokenParser', () => {
    const parser = new SplTokenParser();
    const tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

    // Helpers to create context
    const createCtx = (data: Buffer, keys: PublicKey[]): ParserContext => ({
        tx: {} as any,
        instruction: {
            programId: tokenProgramId,
            keys: keys.map(k => ({ pubkey: k, isSigner: false, isWritable: false })),
            data
        },
        accounts: [],
        programId: tokenProgramId,
        connection: {} as any
    });

    it('should parse Transfer', () => {
        const source = Keypair.generate().publicKey;
        const dest = Keypair.generate().publicKey;
        const owner = Keypair.generate().publicKey;

        // Transfer instruction: [3, amount(8 bytes)]
        // Amount = 1000 (0x3E8)
        const data = Buffer.alloc(9);
        data[0] = 3;
        data.writeBigUInt64LE(1000n, 1);

        const ctx = createCtx(data, [source, dest, owner]);
        const result = parser.parse(ctx);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('Transfer');
        expect(result?.details.amount).toBe('1000');
        expect(result?.details.source).toBe(source.toBase58());
    });

    it('should parse TransferChecked', () => {
        const source = Keypair.generate().publicKey;
        const mint = Keypair.generate().publicKey;
        const dest = Keypair.generate().publicKey;
        const owner = Keypair.generate().publicKey;

        // TransferChecked: [12, amount, decimals]
        const data = Buffer.alloc(10);
        data[0] = 12;
        data.writeBigUInt64LE(2000000n, 1); // 2.000000
        data[9] = 6; // 6 decimals

        const ctx = createCtx(data, [source, mint, dest, owner]);
        const result = parser.parse(ctx);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('TransferChecked');
        expect(result?.summary).toContain('2 tokens'); // 2000000 / 10^6
        expect(result?.details.mint).toBe(mint.toBase58());
    });

    it('should parse MintTo', () => {
        const mint = Keypair.generate().publicKey;
        const dest = Keypair.generate().publicKey;
        const auth = Keypair.generate().publicKey;

        // MintTo: [7, amount]
        const data = Buffer.alloc(9);
        data[0] = 7;
        data.writeBigUInt64LE(500n, 1);

        const ctx = createCtx(data, [mint, dest, auth]);
        const result = parser.parse(ctx);

        expect(result).not.toBeNull();
        expect(result?.type).toBe('MintTo');
        expect(result?.details.amount).toBe('500');
    });
});
