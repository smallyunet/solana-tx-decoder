import { PublicKey } from '@solana/web3.js';
import { Parser } from '../types';
import { PluginLoader, PluginSchema } from './plugin-loader';

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

    /**
     * Load and install a plugin from a JSON schema.
     */
    loadPlugin(schema: PluginSchema) {
        const plugin = PluginLoader.loadFromJson(schema);
        this.install(plugin);
    }

    /**
     * Fetch and install a plugin from a remote URL.
     */
    async installFromUrl(url: string): Promise<void> {
        const plugin = await PluginLoader.loadFromUrl(url);
        this.install(plugin);
    }

    get(programId: string | PublicKey): Parser | undefined {
        const key = typeof programId === 'string' ? programId : programId.toBase58();
        return this.parsers.get(key);
    }

    getAll(): Parser[] {
        return Array.from(this.parsers.values());
    }
}
