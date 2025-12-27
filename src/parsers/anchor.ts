import { PublicKey } from '@solana/web3.js';
import { Program, Idl, AnchorProvider } from '@coral-xyz/anchor';
import { Parser, ParserContext, ParsedAction } from '../types';

// Dummy wallet for read-only provider
const READ_ONLY_WALLET = {
    publicKey: PublicKey.default,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
};

export class AnchorParser implements Parser {
    programId: PublicKey;
    static idlCache: Map<string, Idl> = new Map();

    constructor() {
        this.programId = PublicKey.default;
    }

    async parse(context: ParserContext): Promise<ParsedAction | null> {
        const { programId, instruction, connection } = context;
        const programIdString = programId.toBase58();

        try {
            let idl = AnchorParser.idlCache.get(programIdString);

            // Create a read-only provider
            const provider = new AnchorProvider(
                connection,
                READ_ONLY_WALLET,
                { commitment: 'confirmed' }
            );

            if (!idl) {
                // Fetch IDL
                const fetchedIdl = await Program.fetchIdl(programId, provider);
                if (fetchedIdl) {
                    idl = fetchedIdl;
                    AnchorParser.idlCache.set(programIdString, idl);
                }
            }

            if (!idl) {
                return null;
            }

            const program = new Program(idl, provider);
            const decoded = (program.coder.instruction as any).decode(instruction.data);

            if (decoded) {
                // helper to format data
                const formattedData: any = {};
                // @ts-ignore
                if (decoded.data) {
                    // @ts-ignore
                    for (const [key, value] of Object.entries(decoded.data)) {
                        formattedData[key] = value && value.toString ? value.toString() : value;
                    }
                }

                return {
                    protocol: idl.metadata?.name || 'Unknown Anchor Protocol',
                    type: decoded.name,
                    summary: `${idl.metadata?.name || 'Anchor'} Instruction: ${decoded.name}`,
                    details: {
                        name: decoded.name,
                        data: formattedData
                    },
                    direction: 'UNKNOWN'
                };
            }

            return null;
        } catch (e) {
            // console.error("Anchor parse error", e);
            // Silent fail to allow fallback or just return null
            return null;
        }
    }
}
