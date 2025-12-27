// import { TranslationEnum } from './parsers/types';

import { TransactionResponse, VersionedTransactionResponse, TransactionInstruction, PublicKey, Connection } from '@solana/web3.js';

export type SupportedProtocol = 'System' | 'SPL Token' | 'Jupiter' | 'Raydium' | 'Orca' | 'Unknown' | string;

export type ActionType = 'Transfer' | 'Swap' | 'Add Liquidity' | 'Remove Liquidity' | 'Create Account' | 'Close Account' | 'Unknown' | string;

export type ActionDirection = 'IN' | 'OUT' | 'SELF' | 'UNKNOWN';

export interface ParsedAction {
    protocol: SupportedProtocol;
    type: ActionType;
    summary: string;
    details: any;
    direction?: ActionDirection;
}

export interface ParsedResult {
    timestamp?: number;
    fee: string; // in SOL
    actions: ParsedAction[];
    signature: string;
    success: boolean;
}

export interface ParserContext {
    tx: VersionedTransactionResponse | TransactionResponse;
    instruction: TransactionInstruction;
    accounts: PublicKey[];
    programId: PublicKey;
    connection: Connection;
}

export interface Parser {
    programId: PublicKey;
    parse(context: ParserContext): ParsedAction | Promise<ParsedAction | null> | null;
}
