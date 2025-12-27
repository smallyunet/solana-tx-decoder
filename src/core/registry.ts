import { PublicKey } from '@solana/web3.js';
import { Parser } from '../types';

export interface Plugin {
    install(registry: ParserRegistry): void;
}

export class ParserRegistry {
    private parsers: Map<string, Parser> = new Map();

    constructor() { }

    register(parser: Parser, overrideProgramId?: PublicKey) {
        const id = overrideProgramId ? overrideProgramId.toBase58() : parser.programId.toBase58();
        this.parsers.set(id, parser);
    }

    install(plugin: Plugin) {
        plugin.install(this);
    }

    get(programId: string | PublicKey): Parser | undefined {
        const key = typeof programId === 'string' ? programId : programId.toBase58();
        return this.parsers.get(key);
    }

    getAll(): Parser[] {
        return Array.from(this.parsers.values());
    }
}
