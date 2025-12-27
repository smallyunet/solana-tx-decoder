import { PublicKey } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';

// Raydium Program IDs
const RAYDIUM_AMM_V4 = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const RAYDIUM_CLMM = new PublicKey("CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK");
const RAYDIUM_CPMM = new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C");

// Raydium AMM V4 Instruction Discriminators
const enum RaydiumAmmV4Instruction {
    Initialize = 0,
    Initialize2 = 1,
    MonitorStep = 2,
    Deposit = 3,
    Withdraw = 4,
    MigrateToOpenBook = 5,
    SetParams = 6,
    WithdrawPnl = 7,
    WithdrawSrm = 8,
    SwapBaseIn = 9,
    PreInitialize = 10,
    SwapBaseOut = 11,
    SimulateInfo = 12,
    AdminCancelOrders = 13,
    CreateConfigAccount = 14,
    UpdateConfigAccount = 15,
}

export class RaydiumParser implements Parser {
    // Primary Program ID (AMM V4)
    programId = RAYDIUM_AMM_V4;

    // Check if this parser can handle the given program
    canHandle(programId: PublicKey): boolean {
        return programId.equals(RAYDIUM_AMM_V4) ||
            programId.equals(RAYDIUM_CLMM) ||
            programId.equals(RAYDIUM_CPMM);
    }

    async parse(context: ParserContext): Promise<ParsedAction | null> {
        const { instruction, programId } = context;
        const data = instruction.data;

        if (data.length < 1) return null;

        // Handle CLMM (Concentrated Liquidity) separately
        if (programId.equals(RAYDIUM_CLMM)) {
            return this.parseCLMM(data);
        }

        // Handle CP-Swap (Constant Product) separately
        if (programId.equals(RAYDIUM_CPMM)) {
            return this.parseCPMM(data);
        }

        // AMM V4 parsing
        return this.parseAmmV4(data);
    }

    private parseAmmV4(data: Buffer): ParsedAction | null {
        const discriminator = data[0];

        switch (discriminator) {
            case RaydiumAmmV4Instruction.Initialize:
            case RaydiumAmmV4Instruction.Initialize2:
                return {
                    protocol: 'Raydium',
                    type: 'Initialize Pool',
                    summary: 'Raydium: Initialize AMM Pool',
                    details: { instructionType: 'Initialize' },
                    direction: 'UNKNOWN'
                };

            case RaydiumAmmV4Instruction.Deposit:
                return this.parseDeposit(data);

            case RaydiumAmmV4Instruction.Withdraw:
                return this.parseWithdraw(data);

            case RaydiumAmmV4Instruction.SwapBaseIn:
                return this.parseSwapBaseIn(data);

            case RaydiumAmmV4Instruction.SwapBaseOut:
                return this.parseSwapBaseOut(data);

            case RaydiumAmmV4Instruction.WithdrawPnl:
                return {
                    protocol: 'Raydium',
                    type: 'Withdraw PnL',
                    summary: 'Raydium: Withdraw Protocol Fees',
                    details: { instructionType: 'WithdrawPnl' },
                    direction: 'OUT'
                };

            default:
                return {
                    protocol: 'Raydium',
                    type: 'Unknown',
                    summary: `Raydium AMM V4 Instruction (ID: ${discriminator})`,
                    details: { discriminator },
                    direction: 'UNKNOWN'
                };
        }
    }

    private parseDeposit(data: Buffer): ParsedAction | null {
        if (data.length < 25) {
            return {
                protocol: 'Raydium',
                type: 'Add Liquidity',
                summary: 'Raydium: Add Liquidity (insufficient data)',
                details: {},
                direction: 'OUT'
            };
        }

        const maxCoinAmount = data.readBigUInt64LE(1);
        const maxPcAmount = data.readBigUInt64LE(9);
        const baseSide = data.readBigUInt64LE(17);

        return {
            protocol: 'Raydium',
            type: 'Add Liquidity',
            summary: `Raydium: Add Liquidity (max ${maxCoinAmount.toString()} coin, ${maxPcAmount.toString()} pc)`,
            details: {
                maxCoinAmount: maxCoinAmount.toString(),
                maxPcAmount: maxPcAmount.toString(),
                baseSide: baseSide.toString(),
            },
            direction: 'OUT'
        };
    }

    private parseWithdraw(data: Buffer): ParsedAction | null {
        if (data.length < 9) {
            return {
                protocol: 'Raydium',
                type: 'Remove Liquidity',
                summary: 'Raydium: Remove Liquidity (insufficient data)',
                details: {},
                direction: 'IN'
            };
        }

        const lpAmount = data.readBigUInt64LE(1);

        return {
            protocol: 'Raydium',
            type: 'Remove Liquidity',
            summary: `Raydium: Remove Liquidity (${lpAmount.toString()} LP tokens)`,
            details: {
                lpAmount: lpAmount.toString(),
            },
            direction: 'IN'
        };
    }

    private parseSwapBaseIn(data: Buffer): ParsedAction | null {
        if (data.length < 17) return null;

        const amountIn = data.readBigUInt64LE(1);
        const minAmountOut = data.readBigUInt64LE(9);

        return {
            protocol: 'Raydium',
            type: 'Swap',
            summary: `Raydium Swap: ${amountIn.toString()} -> min ${minAmountOut.toString()}`,
            details: {
                swapType: 'BaseIn',
                amountIn: amountIn.toString(),
                minAmountOut: minAmountOut.toString(),
            },
            direction: 'UNKNOWN'
        };
    }

    private parseSwapBaseOut(data: Buffer): ParsedAction | null {
        if (data.length < 17) return null;

        const maxAmountIn = data.readBigUInt64LE(1);
        const amountOut = data.readBigUInt64LE(9);

        return {
            protocol: 'Raydium',
            type: 'Swap',
            summary: `Raydium Swap: max ${maxAmountIn.toString()} -> ${amountOut.toString()}`,
            details: {
                swapType: 'BaseOut',
                maxAmountIn: maxAmountIn.toString(),
                amountOut: amountOut.toString(),
            },
            direction: 'UNKNOWN'
        };
    }

    private parseCLMM(data: Buffer): ParsedAction | null {
        // CLMM uses 8-byte discriminators (Anchor style)
        if (data.length < 8) return null;

        // Common CLMM instruction discriminators (first 8 bytes as hex)
        const discriminator = data.slice(0, 8).toString('hex');

        // Mapping known CLMM instructions
        const clmmInstructions: Record<string, { type: string; summary: string }> = {
            'f8c69e91e17587c8': { type: 'Swap', summary: 'Raydium CLMM: Swap' },
            '2e9cf3760dcdfbb2': { type: 'Swap V2', summary: 'Raydium CLMM: Swap V2' },
            '878dce4d50e0b7a9': { type: 'Open Position', summary: 'Raydium CLMM: Open Position' },
            '7b86510031446262': { type: 'Close Position', summary: 'Raydium CLMM: Close Position' },
            '2e1c2e61476b31fe': { type: 'Increase Liquidity', summary: 'Raydium CLMM: Increase Liquidity' },
            'a026d06f4b06da76': { type: 'Decrease Liquidity', summary: 'Raydium CLMM: Decrease Liquidity' },
            'd0bc6e4a69c5740c': { type: 'Create Pool', summary: 'Raydium CLMM: Create Pool' },
        };

        const instruction = clmmInstructions[discriminator];
        if (instruction) {
            return {
                protocol: 'Raydium CLMM',
                type: instruction.type,
                summary: instruction.summary,
                details: { discriminator },
                direction: instruction.type.includes('Liquidity') ?
                    (instruction.type.includes('Increase') ? 'OUT' : 'IN') : 'UNKNOWN'
            };
        }

        return {
            protocol: 'Raydium CLMM',
            type: 'Unknown',
            summary: `Raydium CLMM Instruction`,
            details: { discriminator },
            direction: 'UNKNOWN'
        };
    }

    private parseCPMM(data: Buffer): ParsedAction | null {
        // CP-Swap also uses 8-byte Anchor discriminators
        if (data.length < 8) return null;

        const discriminator = data.slice(0, 8).toString('hex');

        const cpmmInstructions: Record<string, { type: string; summary: string }> = {
            '8f7b36c708b32d66': { type: 'Swap Base Input', summary: 'Raydium CP-Swap: Swap (Base Input)' },
            'e6e4b4e79f6c2c87': { type: 'Swap Base Output', summary: 'Raydium CP-Swap: Swap (Base Output)' },
            'c7f4cecd3b8b4a7c': { type: 'Deposit', summary: 'Raydium CP-Swap: Add Liquidity' },
            'd89b3c61f3e69787': { type: 'Withdraw', summary: 'Raydium CP-Swap: Remove Liquidity' },
            'afaf6d1f0d989bed': { type: 'Initialize', summary: 'Raydium CP-Swap: Initialize Pool' },
        };

        const instruction = cpmmInstructions[discriminator];
        if (instruction) {
            return {
                protocol: 'Raydium CP-Swap',
                type: instruction.type,
                summary: instruction.summary,
                details: { discriminator },
                direction: instruction.type === 'Deposit' ? 'OUT' :
                    instruction.type === 'Withdraw' ? 'IN' : 'UNKNOWN'
            };
        }

        return {
            protocol: 'Raydium CP-Swap',
            type: 'Unknown',
            summary: `Raydium CP-Swap Instruction`,
            details: { discriminator },
            direction: 'UNKNOWN'
        };
    }
}

// Export additional program IDs for registry
export const RAYDIUM_PROGRAM_IDS = [RAYDIUM_AMM_V4, RAYDIUM_CLMM, RAYDIUM_CPMM];

