import { PublicKey } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';
import { AnchorParser } from './anchor';

// Orca Whirlpool Program ID
const ORCA_WHIRLPOOL = new PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc");

// Known Whirlpool instruction discriminators (8-byte Anchor discriminators as hex)
const WHIRLPOOL_INSTRUCTIONS: Record<string, { type: string; action: string }> = {
    // Swap instructions
    'f8c69e91e17587c8': { type: 'Swap', action: 'swap' },
    '2e9cf3760dcdfbb2': { type: 'Swap', action: 'swapV2' },
    'c360d308ba95cf8d': { type: 'Two Hop Swap', action: 'twoHopSwap' },

    // Position management
    '878dce4d50e0b7a9': { type: 'Open Position', action: 'openPosition' },
    '46a89fba25a35498': { type: 'Open Position (Bundled)', action: 'openBundledPosition' },
    '7b86510031446262': { type: 'Close Position', action: 'closePosition' },
    '4640d293e02b1bd7': { type: 'Close Position (Bundled)', action: 'closeBundledPosition' },

    // Liquidity management
    '2e1c2e61476b31fe': { type: 'Increase Liquidity', action: 'increaseLiquidity' },
    '9f7a0c76e0bd93bc': { type: 'Increase Liquidity V2', action: 'increaseLiquidityV2' },
    'a026d06f4b06da76': { type: 'Decrease Liquidity', action: 'decreaseLiquidity' },
    'db0b0f5c68d5c1b6': { type: 'Decrease Liquidity V2', action: 'decreaseLiquidityV2' },

    // Rewards and fees
    'a9f87c0fb7e9b5d2': { type: 'Collect Fees', action: 'collectFees' },
    '4683cff98af6e5d4': { type: 'Collect Fees V2', action: 'collectFeesV2' },
    'f5b953bf0e5e6a9c': { type: 'Collect Reward', action: 'collectReward' },
    '8bf4e8c731cbbedf': { type: 'Collect Reward V2', action: 'collectRewardV2' },

    // Pool management
    '5fcdd4b0d9b9e785': { type: 'Initialize Pool', action: 'initializePool' },
    'd0bc6e4a69c5740c': { type: 'Initialize Config', action: 'initializeConfig' },
    '7b3a07ecb8b1c8e4': { type: 'Initialize Tick Array', action: 'initializeTickArray' },
    'efa2a1df9f2d5c7e': { type: 'Initialize Fee Tier', action: 'initializeFeeTier' },

    // Admin operations
    '4d2038c0c5d39f6c': { type: 'Set Fee Rate', action: 'setFeeRate' },
    'e35d4fc0e735fc8d': { type: 'Set Protocol Fee Rate', action: 'setProtocolFeeRate' },
    'c8dc4ba2d3a2c9d1': { type: 'Set Reward Emissions', action: 'setRewardEmissions' },
};

export class OrcaParser implements Parser {
    programId = ORCA_WHIRLPOOL;

    async parse(context: ParserContext): Promise<ParsedAction | null> {
        const { instruction } = context;
        const data = instruction.data;

        // Try native parsing first for known instructions
        const nativeResult = this.parseNative(data);
        if (nativeResult && nativeResult.type !== 'Unknown') {
            return nativeResult;
        }

        // Fall back to Anchor IDL parsing
        const anchorParser = new AnchorParser();
        const action = await anchorParser.parse(context);

        if (!action) {
            return nativeResult; // Return our Unknown parse result
        }

        // Enhance Anchor result with Orca-specific formatting
        return this.enhanceAnchorResult(action);
    }

    private parseNative(data: Buffer): ParsedAction | null {
        if (data.length < 8) {
            return {
                protocol: 'Orca Whirlpool',
                type: 'Unknown',
                summary: 'Orca: Unknown instruction (insufficient data)',
                details: {},
                direction: 'UNKNOWN'
            };
        }

        const discriminator = data.slice(0, 8).toString('hex');
        const instruction = WHIRLPOOL_INSTRUCTIONS[discriminator];

        if (!instruction) {
            return {
                protocol: 'Orca Whirlpool',
                type: 'Unknown',
                summary: `Orca Whirlpool: Unknown Instruction`,
                details: { discriminator },
                direction: 'UNKNOWN'
            };
        }

        // Parse specific instruction types for more details
        switch (instruction.action) {
            case 'swap':
            case 'swapV2':
                return this.parseSwap(data, instruction.type);

            case 'twoHopSwap':
                return this.parseTwoHopSwap(data);

            case 'openPosition':
            case 'openBundledPosition':
                return this.parseOpenPosition(data, instruction.type);

            case 'closePosition':
            case 'closeBundledPosition':
                return {
                    protocol: 'Orca Whirlpool',
                    type: instruction.type,
                    summary: `Orca: ${instruction.type}`,
                    details: {},
                    direction: 'IN'
                };

            case 'increaseLiquidity':
            case 'increaseLiquidityV2':
                return this.parseIncreaseLiquidity(data, instruction.type);

            case 'decreaseLiquidity':
            case 'decreaseLiquidityV2':
                return this.parseDecreaseLiquidity(data, instruction.type);

            case 'collectFees':
            case 'collectFeesV2':
            case 'collectReward':
            case 'collectRewardV2':
                return {
                    protocol: 'Orca Whirlpool',
                    type: instruction.type,
                    summary: `Orca: ${instruction.type}`,
                    details: {},
                    direction: 'IN'
                };

            default:
                return {
                    protocol: 'Orca Whirlpool',
                    type: instruction.type,
                    summary: `Orca: ${instruction.type}`,
                    details: {},
                    direction: 'UNKNOWN'
                };
        }
    }

    private parseSwap(data: Buffer, type: string): ParsedAction {
        // Swap instruction layout after 8-byte discriminator:
        // amount: u64 (8 bytes)
        // otherAmountThreshold: u64 (8 bytes)
        // sqrtPriceLimit: u128 (16 bytes)
        // amountSpecifiedIsInput: bool (1 byte)
        // aToB: bool (1 byte)

        if (data.length < 42) {
            return {
                protocol: 'Orca Whirlpool',
                type: type,
                summary: `Orca ${type}`,
                details: {},
                direction: 'UNKNOWN'
            };
        }

        const amount = data.readBigUInt64LE(8);
        const otherAmountThreshold = data.readBigUInt64LE(16);
        const amountSpecifiedIsInput = data[40] === 1;
        const aToB = data[41] === 1;

        let summary: string;
        if (amountSpecifiedIsInput) {
            summary = `Orca Swap: ${amount.toString()} (Input) -> min ${otherAmountThreshold.toString()}`;
        } else {
            summary = `Orca Swap: max ${otherAmountThreshold.toString()} -> ${amount.toString()} (Output)`;
        }

        return {
            protocol: 'Orca Whirlpool',
            type: type,
            summary,
            details: {
                amount: amount.toString(),
                otherAmountThreshold: otherAmountThreshold.toString(),
                amountSpecifiedIsInput,
                aToB,
                direction: aToB ? 'A -> B' : 'B -> A'
            },
            direction: 'UNKNOWN'
        };
    }

    private parseTwoHopSwap(data: Buffer): ParsedAction {
        // Two-hop swap has two amounts
        if (data.length < 26) {
            return {
                protocol: 'Orca Whirlpool',
                type: 'Two Hop Swap',
                summary: 'Orca: Two Hop Swap',
                details: {},
                direction: 'UNKNOWN'
            };
        }

        const amount = data.readBigUInt64LE(8);
        const otherAmountThreshold = data.readBigUInt64LE(16);

        return {
            protocol: 'Orca Whirlpool',
            type: 'Two Hop Swap',
            summary: `Orca Two Hop Swap: ${amount.toString()} -> ${otherAmountThreshold.toString()}`,
            details: {
                amount: amount.toString(),
                otherAmountThreshold: otherAmountThreshold.toString()
            },
            direction: 'UNKNOWN'
        };
    }

    private parseOpenPosition(data: Buffer, type: string): ParsedAction {
        // Open position layout after discriminator:
        // bumps: { positionBump: u8, metadataBump: u8 } (2 bytes)
        // tickLowerIndex: i32 (4 bytes)
        // tickUpperIndex: i32 (4 bytes)

        if (data.length < 18) {
            return {
                protocol: 'Orca Whirlpool',
                type: type,
                summary: `Orca: ${type}`,
                details: {},
                direction: 'OUT'
            };
        }

        const tickLowerIndex = data.readInt32LE(10);
        const tickUpperIndex = data.readInt32LE(14);

        return {
            protocol: 'Orca Whirlpool',
            type: type,
            summary: `Orca: ${type} [${tickLowerIndex}, ${tickUpperIndex}]`,
            details: {
                tickLowerIndex,
                tickUpperIndex,
                tickRange: `${tickLowerIndex} to ${tickUpperIndex}`
            },
            direction: 'OUT'
        };
    }

    private parseIncreaseLiquidity(data: Buffer, type: string): ParsedAction {
        // Increase liquidity layout after discriminator:
        // liquidityAmount: u128 (16 bytes)
        // tokenMaxA: u64 (8 bytes)
        // tokenMaxB: u64 (8 bytes)

        if (data.length < 40) {
            return {
                protocol: 'Orca Whirlpool',
                type: type,
                summary: `Orca: ${type}`,
                details: {},
                direction: 'OUT'
            };
        }

        const tokenMaxA = data.readBigUInt64LE(24);
        const tokenMaxB = data.readBigUInt64LE(32);

        return {
            protocol: 'Orca Whirlpool',
            type: type,
            summary: `Orca: ${type} (max ${tokenMaxA.toString()} A, ${tokenMaxB.toString()} B)`,
            details: {
                tokenMaxA: tokenMaxA.toString(),
                tokenMaxB: tokenMaxB.toString()
            },
            direction: 'OUT'
        };
    }

    private parseDecreaseLiquidity(data: Buffer, type: string): ParsedAction {
        // Decrease liquidity layout after discriminator:
        // liquidityAmount: u128 (16 bytes)
        // tokenMinA: u64 (8 bytes)
        // tokenMinB: u64 (8 bytes)

        if (data.length < 40) {
            return {
                protocol: 'Orca Whirlpool',
                type: type,
                summary: `Orca: ${type}`,
                details: {},
                direction: 'IN'
            };
        }

        const tokenMinA = data.readBigUInt64LE(24);
        const tokenMinB = data.readBigUInt64LE(32);

        return {
            protocol: 'Orca Whirlpool',
            type: type,
            summary: `Orca: ${type} (min ${tokenMinA.toString()} A, ${tokenMinB.toString()} B)`,
            details: {
                tokenMinA: tokenMinA.toString(),
                tokenMinB: tokenMinB.toString()
            },
            direction: 'IN'
        };
    }

    private enhanceAnchorResult(action: ParsedAction): ParsedAction {
        // Override protocol name
        action.protocol = 'Orca Whirlpool';

        // Enhance swap formatting
        if (action.type === 'swap' || action.type === 'swapV2') {
            const data = action.details.data as any;
            if (data) {
                const amount = data.amount || '0';
                const otherAmountThreshold = data.otherAmountThreshold || '0';
                const amountSpecifiedIsInput = data.amountSpecifiedIsInput;

                if (amountSpecifiedIsInput) {
                    action.summary = `Orca Swap: ${amount} (Input) -> min ${otherAmountThreshold}`;
                } else {
                    action.summary = `Orca Swap: max ${otherAmountThreshold} -> ${amount} (Output)`;
                }

                action.details.extractedAmounts = {
                    amount,
                    otherAmountThreshold,
                    sqrtPriceLimit: data.sqrtPriceLimit || '0',
                    amountSpecifiedIsInput
                };
            }
        }

        // Enhance liquidity operations
        if (action.type.toLowerCase().includes('liquidity')) {
            const data = action.details.data as any;
            if (data) {
                if (action.type.toLowerCase().includes('increase')) {
                    action.direction = 'OUT';
                    action.summary = `Orca: Increase Liquidity`;
                } else if (action.type.toLowerCase().includes('decrease')) {
                    action.direction = 'IN';
                    action.summary = `Orca: Decrease Liquidity`;
                }
            }
        }

        // Enhance position operations
        if (action.type.toLowerCase().includes('position')) {
            if (action.type.toLowerCase().includes('open')) {
                action.direction = 'OUT';
            } else if (action.type.toLowerCase().includes('close')) {
                action.direction = 'IN';
            }
        }

        return action;
    }
}

