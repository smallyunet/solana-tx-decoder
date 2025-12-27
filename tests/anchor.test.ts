import { describe, it, expect, vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { AnchorParser } from '../src/parsers/anchor';
import { ParserContext } from '../src/types';

// Mock values
const validInstructionName = 'testInstruction';
const validInstructionData = { param: 'value' };

// Hoisted mocks to be available in vi.mock
const { fetchIdlMock, decodeMock } = vi.hoisted(() => {
    return {
        fetchIdlMock: vi.fn(),
        decodeMock: vi.fn()
    };
});

vi.mock('@coral-xyz/anchor', async () => {
    return {
        Program: class {
            static fetchIdl = fetchIdlMock;
            coder = {
                instruction: {
                    decode: decodeMock
                }
            };
            constructor(idl: any, provider: any) { }
        },
        AnchorProvider: class {
            constructor() { }
        },
        Idl: {}
    };
});

describe('AnchorParser', () => {
    const parser = new AnchorParser();
    const programId = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

    const createCtx = (data: Buffer): ParserContext => ({
        tx: {} as any,
        instruction: {
            programId,
            keys: [],
            data
        },
        accounts: [],
        programId,
        connection: {} as any
    });

    it('should fetch IDL and decode instruction on first run', async () => {
        const mockIdl = {
            version: "0.1.0",
            name: "test_program",
            metadata: { name: "test_program" }
        };

        fetchIdlMock.mockResolvedValue(mockIdl);
        decodeMock.mockReturnValue({
            name: validInstructionName,
            data: validInstructionData
        });

        const ctx = createCtx(Buffer.from([1, 2, 3]));
        const result = await parser.parse(ctx);

        expect(fetchIdlMock).toHaveBeenCalledWith(programId, expect.anything());
        expect(decodeMock).toHaveBeenCalled();
        expect(result).not.toBeNull();
        expect(result?.type).toBe(validInstructionName);
        expect(result?.protocol).toBe('test_program');
        expect(result?.details.data.param).toBe('value');
    });

    it('should use cached IDL on second run', async () => {
        // Clear mocks to verify fetchIdl is NOT called
        fetchIdlMock.mockClear();
        decodeMock.mockClear();

        // Re-setup returns for this run
        decodeMock.mockReturnValue({
            name: validInstructionName,
            data: validInstructionData
        });

        const ctx = createCtx(Buffer.from([1, 2, 3]));
        // The cache should be populated from the previous test if they share state (AnchorParser.idlCache is static)
        // Note: Vitest usually isolates test files but inside the same file, static state persists?
        // Yes, static properties persist within the same test file execution context.

        const result = await parser.parse(ctx);

        expect(fetchIdlMock).not.toHaveBeenCalled(); // Should assume cached
        expect(decodeMock).toHaveBeenCalled();
        expect(result?.type).toBe(validInstructionName);
    });
});
