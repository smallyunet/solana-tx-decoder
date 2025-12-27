import { Connection, PublicKey, TransactionResponse, VersionedTransactionResponse, Transaction, VersionedTransaction, Message, VersionedMessage, MessageV0 } from '@solana/web3.js';
import { AddressResolver } from './core/address-resolver';
import { ParserRegistry } from './core/registry';
import { SystemProgramParser } from './parsers/system';
import { SplTokenParser } from './parsers/spl-token';
import { JupiterParser } from './parsers/jupiter';
import { AnchorParser } from './parsers/anchor';
import { RaydiumParser, RAYDIUM_PROGRAM_IDS } from './parsers/raydium';
import { OrcaParser } from './parsers/orca';
import { ParsedResult, ParserContext, ParsedAction } from './types';
import { PriceService, JupiterPriceService } from './services/price-service';

// Re-export types for consumers
export * from './types';
export { ParserRegistry } from './core/registry';
export { TransactionView } from './ui/TransactionView';
export { ActionCard } from './ui/components/ActionCard';

export class SolanaParser {
    private connection: Connection;
    private registry: ParserRegistry;
    private anchorParser: AnchorParser;
    private priceService: PriceService;

    constructor(connection: Connection) {
        this.connection = connection;
        this.registry = new ParserRegistry();
        this.anchorParser = new AnchorParser();
        this.priceService = new JupiterPriceService();

        // Register default parsers
        this.registry.register(new SystemProgramParser());
        this.registry.register(new SplTokenParser());
        this.registry.register(new JupiterParser());

        const raydiumParser = new RaydiumParser();
        // Register for all Raydium program IDs
        RAYDIUM_PROGRAM_IDS.forEach(id => {
            this.registry.register(raydiumParser, id);
        });

        this.registry.register(new OrcaParser());
    }

    getRegistry(): ParserRegistry {
        return this.registry;
    }

    async parseTransaction(txId: string): Promise<ParsedResult | null> {
        try {
            const tx = await this.connection.getTransaction(txId, {
                maxSupportedTransactionVersion: 0,
            });

            if (!tx) return null;

            return this.parseTransactionResponse(tx, txId);
        } catch (_e) {
            console.error("Error parsing transaction", _e);
            throw _e;
        }
    }

    async parseTransactionResponse(tx: TransactionResponse | VersionedTransactionResponse, signature: string = ''): Promise<ParsedResult> {
        const message = tx.transaction.message;
        // Unified access to accountKeys
        let accountKeys: PublicKey[];
        const msgAny = message as any;

        if ('staticAccountKeys' in msgAny) {
            accountKeys = msgAny.staticAccountKeys;
            // Append loaded addresses if available (for Versioned Transactions)
            if (tx.meta && tx.meta.loadedAddresses) {
                accountKeys = [
                    ...accountKeys,
                    ...tx.meta.loadedAddresses.writable,
                    ...tx.meta.loadedAddresses.readonly
                ];
            }
        } else {
            accountKeys = msgAny.accountKeys;
        }

        // We pass the meta inner instructions if available
        const innerInstructions = tx.meta?.innerInstructions || undefined;

        const actions = await this.parseMessageInstructions(message, accountKeys, innerInstructions);

        // Enrich with prices (fire and forget or await?)
        // Better to await to return complete data
        await this.enrichActionsWithPrices(actions);

        // Calculate fee
        const fee = (tx.meta?.fee || 0) / 1e9;

        return {
            timestamp: tx.blockTime ? tx.blockTime : undefined,
            fee: fee.toFixed(9),
            actions,
            signature,
            success: tx.meta?.err === null
        };
    }

    async simulateAndParse(tx: Transaction | VersionedTransaction): Promise<ParsedResult | null> {
        try {
            const { value: simulated } = await this.connection.simulateTransaction(tx as any); // Type assertion for compatibility

            if (simulated.err) {
                return {
                    fee: "0",
                    actions: [],
                    signature: "SIMULATED_FAILURE",
                    success: false
                };
            }

            // Extract message and keys
            let message: Message | VersionedMessage;
            let accountKeys: PublicKey[];

            if ('version' in tx) {
                message = tx.message;
                // Resolve Address Lookup Tables if present
                if ('addressTableLookups' in message && message.addressTableLookups.length > 0) {
                    const resolver = new AddressResolver(this.connection);
                    const loadedAddresses = await resolver.resolve(message as MessageV0); // Safe cast after check
                    accountKeys = [
                        ...message.staticAccountKeys,
                        ...loadedAddresses.writable,
                        ...loadedAddresses.readonly
                    ];
                } else {
                    accountKeys = message.staticAccountKeys;
                }
            } else {
                message = tx.compileMessage();
                accountKeys = message.accountKeys;
            }

            // Simulation doesn't easily give inner instructions without special RPC config/support.
            // We will parse the top-level instructions.
            const actions = await this.parseMessageInstructions(message, accountKeys, undefined);

            await this.enrichActionsWithPrices(actions);

            return {
                fee: "0", // Estimated or from simulation if available (unitsConsumed * price)
                actions,
                signature: "SIMULATED",
                success: true
            };

        } catch (_e) {
            console.error("Simulation failed", _e);
            return null;
        }
    }

    private async parseMessageInstructions(
        message: Message | VersionedMessage,
        accountKeys: PublicKey[],
        innerInstructions?: any[]
    ): Promise<ParsedAction[]> {
        const actions: ParsedAction[] = [];
        const msgAny = message as any;
        const instructions = msgAny.compiledInstructions || msgAny.instructions; // Versioned vs Legacy might differ slightly in naming access

        for (const ix of instructions) {
            const programId = accountKeys[ix.programIdIndex];

            const ixAccounts = ix.accountKeyIndexes ?
                ix.accountKeyIndexes.map((idx: number) => accountKeys[idx]) :
                ix.accounts.map((idx: number) => accountKeys[idx]);

            const action = await this.parseInstruction(programId, Buffer.from(ix.data), accountKeys, ixAccounts);
            if (action) actions.push(action);
        }

        // Handle Inner Instructions
        if (innerInstructions) {
            for (const innerBlock of innerInstructions) {
                for (const ix of innerBlock.instructions) {
                    const programId = accountKeys[ix.programIdIndex];
                    const ixAccounts = ix.accounts.map((idx: number) => accountKeys[idx]);

                    const action = await this.parseInstruction(programId, Buffer.from(ix.data), accountKeys, ixAccounts);
                    if (action) actions.push(action);
                }
            }
        }

        return actions;
    }

    /**
     * Helper method to parse a single instruction using registered parsers or fallback to Anchor.
     * @param programId The program ID of the instruction
     * @param data The instruction data buffer
     * @param accountKeys All account keys involved in the transaction
     * @param instructionAccounts The specific accounts used in this instruction
     */
    private async parseInstruction(
        programId: PublicKey,
        data: Buffer,
        accountKeys: PublicKey[],
        instructionAccounts: PublicKey[]
    ): Promise<ParsedAction | null> {
        const parser = this.registry.get(programId);

        const context: ParserContext = {
            tx: {} as any, // Context tx is often not fully used by simple parsers, keeping strict backward compat
            instruction: {
                programId,
                keys: instructionAccounts.map((pubkey: PublicKey) => ({ pubkey, isSigner: false, isWritable: false })),
                data: data,
            },
            accounts: accountKeys,
            programId,
            connection: this.connection
        };

        if (parser) {
            return await parser.parse(context);
        } else {
            // Try Anchor Parser fallback
            const anchorAction = await this.anchorParser.parse(context);
            if (anchorAction) {
                return anchorAction;
            } else {
                return {
                    protocol: 'Unknown',
                    type: 'Unknown',
                    summary: `Instruction for program ${programId.toBase58()}`,
                    details: {
                        data: data.toString('hex')
                    },
                    direction: 'UNKNOWN'
                };
            }
        }
    }

    private async enrichActionsWithPrices(actions: ParsedAction[]) {
        const mintsToFetch = new Set<string>();
        const actionsToPrice: { action: ParsedAction, mint: string, amount: number, rawAmount: string }[] = [];

        // 1. Identify actions eligible for pricing
        for (const action of actions) {
            const details = action.details as any;

            // Check for explicit mint and amount
            if (details.mint && (details.amount || details.tokenAmount)) {
                const mint = details.mint;
                const rawAmount = details.amount || details.tokenAmount;
                let amount = 0;

                // Should have decimals for accurate pricing
                if (typeof details.decimals === 'number') {
                    amount = Number(rawAmount) / Math.pow(10, details.decimals);
                } else {
                    // If decimals missing, we might need to fetch them.
                    // For now, we only support if decimals are present or if we fetch them.
                    // Let's defer decimal fetching to a batch step if we want to be robust.
                    // For now, skip if no decimals? Or try to fetch?
                    // Let's add to fetch list and we will fetch info.
                }

                mintsToFetch.add(mint);
                actionsToPrice.push({ action, mint, amount, rawAmount });
            }
        }

        if (mintsToFetch.size === 0) return;

        // 2. Fetch Prices
        const prices = await this.priceService.getUsdPrices(Array.from(mintsToFetch));

        // 3. Fetch Decimals for missing ones (optimization: only if we have price)
        // This part requires checking which mints we have pricing for but no decimals in action.
        // To keep it simple for this iteration, we only calculate if we have decimals in action OR if we add a decimal fetcher.
        // Let's add a quick decimal fetcher for mints that have price but unknown decimals.

        const mintsNeedingDecimals = actionsToPrice.filter(a => a.amount === 0 && prices[a.mint]).map(a => a.mint);
        const decimalsMap: Record<string, number> = {};

        if (mintsNeedingDecimals.length > 0) {
            // Deduplicate
            const uniqueMints = [...new Set(mintsNeedingDecimals)];
            // Fetch in batches or one by one
            for (const mint of uniqueMints) {
                try {
                    const info = await this.connection.getParsedAccountInfo(new PublicKey(mint));
                    if (info.value && 'parsed' in info.value.data) {
                        decimalsMap[mint] = info.value.data.parsed.info.decimals;
                    }
                } catch (e) {
                    console.warn(`Failed to fetch decimals for ${mint}`, e);
                }
            }
        }

        // 4. Apply prices
        for (const item of actionsToPrice) {
            const price = prices[item.mint];
            if (price) {
                let finalAmount = item.amount;
                // If amount was 0 because of missing decimals, try to resolve
                if (finalAmount === 0 && decimalsMap[item.mint] !== undefined) {
                    finalAmount = Number(item.rawAmount) / Math.pow(10, decimalsMap[item.mint]);
                }

                if (finalAmount > 0) {
                    item.action.totalUsd = finalAmount * price;
                }
            }
        }
    }
}
