import { ParsedResult } from '../../../src/types';

export const MOCK_DATA: Record<string, ParsedResult> = {
    // SOL Transfer Example
    '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj': {
        timestamp: 1735261200,
        fee: '0.000005000',
        signature: '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj',
        success: true,
        actions: [
            {
                protocol: 'System Program',
                type: 'Transfer',
                summary: 'Transfer 0.1 SOL',
                details: {
                    from: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    to: '9vQ1Sbh6fGh2L6sDpj6z3hG9Rz88y2K6F89rDpj6z3h',
                    amount: '0.1'
                },
                direction: 'OUT'
            }
        ]
    },

    // USDC Transfer Example
    '4vD3pSETPxuoMXrYhY3naJgfpEqyfqvv7xSfPvnTUXFp4y9FZv4v6vEpQPvHUfXmNLfVsVZHkZGkJWmz1xnfkPxL': {
        timestamp: 1735261300,
        fee: '0.000010000',
        signature: '4vD3pSETPxuoMXrYhY3naJgfpEqyfqvv7xSfPvnTUXFp4y9FZv4v6vEpQPvHUfXmNLfVsVZHkZGkJWmz1xnfkPxL',
        success: true,
        actions: [
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 50.00 USDC',
                details: {
                    from: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    to: '9vQ1Sbh6fGh2L6sDpj6z3hG9Rz88y2K6F89rDpj6z3h',
                    amount: '50.00',
                    token: 'USDC'
                },
                direction: 'OUT'
            }
        ]
    },

    // Jupiter Swap Example
    '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump': {
        timestamp: 1735261400,
        fee: '0.000015000',
        signature: '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump',
        success: true,
        actions: [
            {
                protocol: 'Jupiter',
                type: 'Swap',
                summary: 'Swap 1.5 SOL for 250.00 USDC',
                details: {
                    fromToken: 'SOL',
                    toToken: 'USDC',
                    fromAmount: '1.5',
                    toAmount: '250.00'
                },
                direction: 'IN'
            },
            {
                protocol: 'System Program',
                type: 'Transfer',
                summary: 'Transfer 1.5 SOL',
                details: {
                    from: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    to: 'Jupiter Aggregator v6',
                    amount: '1.5'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 250.00 USDC',
                details: {
                    from: 'Jupiter Aggregator v6',
                    to: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    amount: '250.00'
                },
                direction: 'IN'
            }
        ]
    },

    // Raydium Swap Example
    '2RaydiumSwapExampleTx123456789abcdefghijklmnopqrstuvwxyz': {
        timestamp: 1735261500,
        fee: '0.000012000',
        signature: '2RaydiumSwapExampleTx123456789abcdefghijklmnopqrstuvwxyz',
        success: true,
        actions: [
            {
                protocol: 'Raydium',
                type: 'Swap',
                summary: 'Raydium Swap: 1000000000 -> min 45000000',
                details: {
                    swapType: 'BaseIn',
                    amountIn: '1000000000',
                    minAmountOut: '45000000',
                    estimatedInput: '1.0 SOL',
                    estimatedOutput: '~45 USDC'
                },
                direction: 'UNKNOWN'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 1.0 SOL to AMM',
                details: {
                    from: 'User Wallet',
                    to: 'Raydium AMM V4 Pool',
                    amount: '1.0'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 45.23 USDC from AMM',
                details: {
                    from: 'Raydium AMM V4 Pool',
                    to: 'User Wallet',
                    amount: '45.23'
                },
                direction: 'IN'
            }
        ]
    },

    // Raydium Add Liquidity Example
    '3RaydiumLiquidityExampleTx123456789abcdefghijklmnopqrstu': {
        timestamp: 1735261600,
        fee: '0.000025000',
        signature: '3RaydiumLiquidityExampleTx123456789abcdefghijklmnopqrstu',
        success: true,
        actions: [
            {
                protocol: 'Raydium',
                type: 'Add Liquidity',
                summary: 'Raydium: Add Liquidity (max 500000000 coin, 22500000 pc)',
                details: {
                    maxCoinAmount: '500000000',
                    maxPcAmount: '22500000',
                    baseSide: '0',
                    estimatedCoin: '0.5 SOL',
                    estimatedPc: '22.5 USDC'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 0.5 SOL to Pool',
                details: {
                    from: 'User Wallet',
                    to: 'Raydium SOL-USDC Pool',
                    amount: '0.5'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 22.5 USDC to Pool',
                details: {
                    from: 'User Wallet',
                    to: 'Raydium SOL-USDC Pool',
                    amount: '22.5'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Receive LP Tokens',
                details: {
                    from: 'Raydium SOL-USDC Pool',
                    to: 'User Wallet',
                    amount: '3.35 LP'
                },
                direction: 'IN'
            }
        ]
    },

    // Orca Whirlpool Swap Example
    '4OrcaWhirlpoolSwapExampleTx123456789abcdefghijklmnopqr': {
        timestamp: 1735261700,
        fee: '0.000018000',
        signature: '4OrcaWhirlpoolSwapExampleTx123456789abcdefghijklmnopqr',
        success: true,
        actions: [
            {
                protocol: 'Orca Whirlpool',
                type: 'Swap',
                summary: 'Orca Swap: 2000000000 (Input) -> min 89000000',
                details: {
                    amount: '2000000000',
                    otherAmountThreshold: '89000000',
                    amountSpecifiedIsInput: true,
                    aToB: true,
                    direction: 'A -> B',
                    estimatedInput: '2.0 SOL',
                    estimatedOutput: '~89 USDC'
                },
                direction: 'UNKNOWN'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 2.0 SOL',
                details: {
                    from: 'User Wallet',
                    to: 'Orca Whirlpool',
                    amount: '2.0'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 89.45 USDC',
                details: {
                    from: 'Orca Whirlpool',
                    to: 'User Wallet',
                    amount: '89.45'
                },
                direction: 'IN'
            }
        ]
    },

    // Orca Whirlpool Open Position Example
    '5OrcaPositionExampleTx123456789abcdefghijklmnopqrstuvw': {
        timestamp: 1735261800,
        fee: '0.000035000',
        signature: '5OrcaPositionExampleTx123456789abcdefghijklmnopqrstuvw',
        success: true,
        actions: [
            {
                protocol: 'Orca Whirlpool',
                type: 'Open Position',
                summary: 'Orca: Open Position [-44280, -39960]',
                details: {
                    tickLowerIndex: -44280,
                    tickUpperIndex: -39960,
                    tickRange: '-44280 to -39960',
                    priceRange: '~40-50 USDC per SOL'
                },
                direction: 'OUT'
            },
            {
                protocol: 'Orca Whirlpool',
                type: 'Increase Liquidity',
                summary: 'Orca: Increase Liquidity (max 1000000000 A, 45000000 B)',
                details: {
                    tokenMaxA: '1000000000',
                    tokenMaxB: '45000000',
                    estimatedA: '1.0 SOL',
                    estimatedB: '~45 USDC'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 1.0 SOL to Position',
                details: {
                    from: 'User Wallet',
                    to: 'Orca Whirlpool Position',
                    amount: '1.0'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 44.8 USDC to Position',
                details: {
                    from: 'User Wallet',
                    to: 'Orca Whirlpool Position',
                    amount: '44.8'
                },
                direction: 'OUT'
            }
        ]
    },

    // Orca Collect Fees Example
    '6OrcaCollectFeesExampleTx123456789abcdefghijklmnopqrst': {
        timestamp: 1735261900,
        fee: '0.000008000',
        signature: '6OrcaCollectFeesExampleTx123456789abcdefghijklmnopqrst',
        success: true,
        actions: [
            {
                protocol: 'Orca Whirlpool',
                type: 'Collect Fees',
                summary: 'Orca: Collect Fees',
                details: {
                    positionId: 'Position #12345'
                },
                direction: 'IN'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Receive 0.0023 SOL fees',
                details: {
                    from: 'Orca Whirlpool Position',
                    to: 'User Wallet',
                    amount: '0.0023'
                },
                direction: 'IN'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Receive 0.105 USDC fees',
                details: {
                    from: 'Orca Whirlpool Position',
                    to: 'User Wallet',
                    amount: '0.105'
                },
                direction: 'IN'
            }
        ]
    }
};

