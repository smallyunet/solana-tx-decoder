import { PublicKey } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';
import { AnchorParser } from './anchor';

export class JupiterParser implements Parser {
    programId = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

    async parse(context: ParserContext): Promise<ParsedAction | null> {
        // Try Anchor parsing first (IDL based)
        const anchorParser = new AnchorParser();
        const anchorAction = await anchorParser.parse(context);
        if (anchorAction) {
            return anchorAction;
        }

        // Fallback: Manual hex matching
        const { instruction } = context;
        const data = instruction.data;

        if (data.length < 8) return null;

        // Anchor discriminator
        const discriminator = data.subarray(0, 8);

        // These are standard sighashes for Jupiter v6
        // route: e517cb977ae3ad2a
        // shared_accounts_route: c1209b3341d69c81

        const hexDisc = discriminator.toString('hex');

        if (hexDisc === 'e517cb977ae3ad2a') { // route
            return {
                protocol: 'Jupiter',
                type: 'Swap (Route)',
                summary: 'Jupiter Swap',
                details: {
                    instruction: 'route'
                },
                direction: 'UNKNOWN'
            };
        }

        if (hexDisc === 'c1209b3341d69c81') { // shared_accounts_route
            return {
                protocol: 'Jupiter',
                type: 'Swap (SharedAccounts)',
                summary: 'Jupiter Swap (Shared Accounts)',
                details: {
                    instruction: 'shared_accounts_route'
                },
                direction: 'UNKNOWN'
            };
        }

        // TODO: More detailed parsing (mints, amounts)
        // This requires knowing the exact layout which is complex for Jupiter (vector of instructions, etc.)
        // For v0.0.3, we identify the instruction type.

        return {
            protocol: 'Jupiter',
            type: 'Unknown',
            summary: 'Jupiter Instruction',
            details: {
                discriminator: hexDisc
            },
            direction: 'UNKNOWN'
        };
    }
}
