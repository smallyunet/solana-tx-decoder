import { Connection, AddressLookupTableAccount, MessageV0, PublicKey } from '@solana/web3.js';

export class AddressResolver {
    constructor(private connection: Connection) { }

    /**
     * Resolves all address lookup tables for a given Versioned Message.
     * @param message The versioned message containing lookup table indices.
     * @returns A map of loaded addresses (writable and readonly).
     */
    async resolve(message: MessageV0): Promise<{ writable: PublicKey[]; readonly: PublicKey[] }> {
        const lookups = message.addressTableLookups;
        const writable: PublicKey[] = [];
        const readonly: PublicKey[] = [];

        if (!lookups || lookups.length === 0) {
            return { writable, readonly };
        }

        // 1. Fetch all lookup table accounts
        const tableKeys = lookups.map(l => l.accountKey);
        const accountInfos = await this.connection.getMultipleAccountsInfo(tableKeys);

        for (let i = 0; i < lookups.length; i++) {
            const lookup = lookups[i];
            const info = accountInfos[i];

            if (!info) {
                console.warn(`Address Lookup Table not found: ${lookup.accountKey.toBase58()}`);
                continue;
            }

            const alt = new AddressLookupTableAccount({
                key: lookup.accountKey,
                state: AddressLookupTableAccount.deserialize(info.data)
            });

            // 2. Resolve Writable indices
            for (const idx of lookup.writableIndexes) {
                const key = alt.state.addresses[idx];
                if (key) writable.push(key);
            }

            // 3. Resolve Readonly indices
            for (const idx of lookup.readonlyIndexes) {
                const key = alt.state.addresses[idx];
                if (key) readonly.push(key);
            }
        }

        return { writable, readonly };
    }
}
