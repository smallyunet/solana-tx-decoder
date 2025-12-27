# Plugin System

The Solana Transaction Decoder supports a plugin system that allows you to easily extend the parser's capabilities with custom protocols.

## Creating a Plugin

A plugin is simply an object that implements the `Plugin` interface:

```typescript
import { Plugin, ParserRegistry, Parser, ParserContext, ParsedAction } from 'solana-tx-decoder';
import { PublicKey } from '@solana/web3.js';

export class MyProtocolPlugin implements Plugin {
    install(registry: ParserRegistry) {
        registry.register(new MyProtocolParser());
    }
}

class MyProtocolParser implements Parser {
    programId = new PublicKey("MyProtocol11111111111111111111111111111111");

    parse(context: ParserContext): ParsedAction | null {
        // ... implementation
        return {
            protocol: 'MyProtocol',
            type: 'CustomAction',
            summary: 'Performed custom action',
            details: {},
            direction: 'UNKNOWN'
        };
    }
}
```

## Using a Plugin

To use a plugin, simply install it into the parser instance (which exposes its registry, or you can register directly).

```typescript
import { SolanaParser } from 'solana-tx-decoder';
import { MyProtocolPlugin } from './my-plugin';

const parser = new SolanaParser(connection);

// Access the registry and install the plugin
parser.getRegistry().install(new MyProtocolPlugin());
```

This modular approach allows you to bundle related parsers or handle complex registration logic (like multiple program IDs) within a single installable unit.
