import { describe, it, expect } from 'vitest';
import { Connection } from '@solana/web3.js';
import { OrcaParser } from '../src/parsers/orca';
import { ParserContext } from '../src/types';

describe('OrcaParser', () => {
    const parser = new OrcaParser();
    const connection = new Connection('https://api.mainnet-beta.solana.com');

    // Helper to create swap instruction data
    const createSwapData = (amount: bigint, threshold: bigint, isInput: boolean, aToB: boolean): Buffer => {
        const data = Buffer.alloc(42);
        // Discriminator for swap (8 bytes)
        Buffer.from('f8c69e91e17587c8', 'hex').copy(data, 0);
        data.writeBigUInt64LE(amount, 8);
        data.writeBigUInt64LE(threshold, 16);
        // sqrtPriceLimit is 16 bytes (u128), we'll skip it
        data[40] = isInput ? 1 : 0;
        data[41] = aToB ? 1 : 0;
        return data;
    };

    it('should identify Orca Swap (input specified)', async () => {
        const data = createSwapData(BigInt(1000000), BigInt(900000), true, true);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Swap');
        expect(result?.summary).toContain('1000000');
        expect(result?.summary).toContain('(Input)');
    });

    it('should identify Orca Swap (output specified)', async () => {
        const data = createSwapData(BigInt(500000), BigInt(600000), false, false);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Swap');
        expect(result?.summary).toContain('(Output)');
    });

    it('should identify Orca Open Position', async () => {
        const data = Buffer.alloc(18);
        // Discriminator for openPosition
        Buffer.from('878dce4d50e0b7a9', 'hex').copy(data, 0);
        // Bumps (2 bytes)
        data[8] = 255;
        data[9] = 254;
        // tickLowerIndex (i32)
        data.writeInt32LE(-10000, 10);
        // tickUpperIndex (i32)
        data.writeInt32LE(10000, 14);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Open Position');
        expect(result?.direction).toBe('OUT');
        expect(result?.summary).toContain('-10000');
        expect(result?.summary).toContain('10000');
    });

    it('should identify Orca Close Position', async () => {
        const data = Buffer.alloc(8);
        // Discriminator for closePosition
        Buffer.from('7b86510031446262', 'hex').copy(data, 0);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Close Position');
        expect(result?.direction).toBe('IN');
    });

    it('should identify Orca Increase Liquidity', async () => {
        const data = Buffer.alloc(40);
        // Discriminator for increaseLiquidity
        Buffer.from('2e1c2e61476b31fe', 'hex').copy(data, 0);
        // liquidityAmount (u128) - 16 bytes at offset 8
        // tokenMaxA (u64) at offset 24
        data.writeBigUInt64LE(BigInt(1000000), 24);
        // tokenMaxB (u64) at offset 32
        data.writeBigUInt64LE(BigInt(2000000), 32);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Increase Liquidity');
        expect(result?.direction).toBe('OUT');
        expect(result?.summary).toContain('1000000');
    });

    it('should identify Orca Decrease Liquidity', async () => {
        const data = Buffer.alloc(40);
        // Discriminator for decreaseLiquidity
        Buffer.from('a026d06f4b06da76', 'hex').copy(data, 0);
        // Same layout as increase
        data.writeBigUInt64LE(BigInt(500000), 24);
        data.writeBigUInt64LE(BigInt(750000), 32);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Decrease Liquidity');
        expect(result?.direction).toBe('IN');
    });

    it('should identify Orca Collect Fees', async () => {
        const data = Buffer.alloc(8);
        // Discriminator for collectFees
        Buffer.from('a9f87c0fb7e9b5d2', 'hex').copy(data, 0);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Collect Fees');
        expect(result?.direction).toBe('IN');
    });

    it('should handle unknown instruction gracefully', async () => {
        const data = Buffer.alloc(8);
        // Unknown discriminator
        Buffer.from('0000000000000000', 'hex').copy(data, 0);

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Orca Whirlpool');
        expect(result?.type).toBe('Unknown');
    });
});
