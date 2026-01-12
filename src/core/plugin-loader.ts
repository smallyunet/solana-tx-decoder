import { PublicKey } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';
import { ParserRegistry, Plugin } from './registry';

/**
 * JSON Schema for defining external parser plugins.
 * This allows dynamic loading of parsers without TypeScript compilation.
 */
export interface PluginSchema {
    /** Plugin identifier */
    name: string;
    /** Plugin version */
    version: string;
    /** List of parser definitions */
    parsers: ParserDefinition[];
}

export interface ParserDefinition {
    /** Program ID in base58 format */
    programId: string;
    /** Protocol name to display */
    protocol: string;
    /** Optional discriminator patterns for instruction matching */
    instructions?: InstructionPattern[];
}

export interface InstructionPattern {
    /** Instruction discriminator in hex */
    discriminator?: string;
    /** Human-readable action type */
    actionType: string;
    /** Summary template with placeholders like {0}, {1} for account indices */
    summaryTemplate: string;
}

/**
 * A parser created from a JSON schema definition.
 */
class SchemaParser implements Parser {
    programId: PublicKey;
    private definition: ParserDefinition;

    constructor(definition: ParserDefinition) {
        this.programId = new PublicKey(definition.programId);
        this.definition = definition;
    }

    parse(context: ParserContext): ParsedAction | null {
        const { instruction } = context;
        const instructionData = instruction.data;

        // Try to match instruction by discriminator
        if (this.definition.instructions && this.definition.instructions.length > 0) {
            for (const pattern of this.definition.instructions) {
                if (pattern.discriminator) {
                    const discBuffer = Buffer.from(pattern.discriminator, 'hex');
                    if (instructionData.subarray(0, discBuffer.length).equals(discBuffer)) {
                        return this.createAction(pattern, context);
                    }
                }
            }
            // If no discriminator matched, use first pattern as fallback
            return this.createAction(this.definition.instructions[0], context);
        }

        // Default action if no instruction patterns defined
        return {
            protocol: this.definition.protocol,
            type: 'Unknown',
            summary: `${this.definition.protocol} instruction`,
            details: {},
            direction: 'UNKNOWN'
        };
    }

    private createAction(pattern: InstructionPattern, context: ParserContext): ParsedAction {
        const accounts = context.instruction.keys.map((k) => k.pubkey.toBase58());

        // Replace placeholders in summary template
        let summary = pattern.summaryTemplate;
        accounts.forEach((addr, i) => {
            summary = summary.replace(`{${i}}`, addr.slice(0, 8) + '...');
        });

        return {
            protocol: this.definition.protocol,
            type: pattern.actionType,
            summary,
            details: { accounts },
            direction: 'UNKNOWN'
        };
    }
}

/**
 * A plugin created from a JSON schema.
 */
class SchemaPlugin implements Plugin {
    private schema: PluginSchema;

    constructor(schema: PluginSchema) {
        this.schema = schema;
    }

    install(registry: ParserRegistry): void {
        for (const parserDef of this.schema.parsers) {
            registry.register(new SchemaParser(parserDef));
        }
    }
}

/**
 * PluginLoader provides utilities for dynamically loading parser plugins
 * from JSON schemas or remote URLs.
 */
export class PluginLoader {
    /**
     * Validate a plugin schema for required fields.
     */
    static validate(schema: PluginSchema): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!schema.name || typeof schema.name !== 'string') {
            errors.push('Schema must have a valid "name" field');
        }
        if (!schema.version || typeof schema.version !== 'string') {
            errors.push('Schema must have a valid "version" field');
        }
        if (!Array.isArray(schema.parsers)) {
            errors.push('Schema must have a "parsers" array');
        } else {
            schema.parsers.forEach((parser, i) => {
                if (!parser.programId) {
                    errors.push(`Parser at index ${i} must have a "programId"`);
                }
                if (!parser.protocol) {
                    errors.push(`Parser at index ${i} must have a "protocol"`);
                }
                // Validate programId is valid base58
                try {
                    new PublicKey(parser.programId);
                } catch {
                    errors.push(`Parser at index ${i} has invalid programId: ${parser.programId}`);
                }
            });
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Load a plugin from a JSON schema object.
     */
    static loadFromJson(schema: PluginSchema): Plugin {
        const validation = this.validate(schema);
        if (!validation.valid) {
            throw new Error(`Invalid plugin schema: ${validation.errors.join(', ')}`);
        }
        return new SchemaPlugin(schema);
    }

    /**
     * Fetch and load a plugin from a remote URL.
     */
    static async loadFromUrl(url: string): Promise<Plugin> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch plugin from ${url}: ${response.statusText}`);
        }
        const schema = await response.json() as PluginSchema;
        return this.loadFromJson(schema);
    }
}
