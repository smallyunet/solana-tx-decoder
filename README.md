# Solana Transaction Decoder

[![npm version](https://img.shields.io/npm/v/solana-tx-decoder.svg?style=flat-square)](https://www.npmjs.com/package/solana-tx-decoder)
[![License](https://img.shields.io/npm/l/solana-tx-decoder.svg?style=flat-square)](https://github.com/smallyunet/solana-tx-decoder/blob/main/LICENSE)
[![CI](https://github.com/smallyunet/solana-tx-decoder/actions/workflows/ci.yml/badge.svg)](https://github.com/smallyunet/solana-tx-decoder/actions/workflows/ci.yml)


A robust, extensible TypeScript library for parsing Solana transactions into structured, human-readable data.

## Features

- **Adapter Pattern**: Easily extensible parser registry.
- **Universal IDL Resolver**: Auto-fetching and decoding via Anchor IDLs.
- **Deep Protocol Parsing**: Enhanced details for Jupiter, Raydium, and Orca.
- **Structured Output**: Strictly typed `ParsedResult`.
- **Inner Instructions**: Handles nested CPIs.

## Examples

Check out the [examples](./examples) directory for usage scenarios, see the [Examples & Results](./docs/EXAMPLES.md) document for a showcase of parsed outputs, or visit the [Live Demo](https://smallyunet.github.io/solana-tx-decoder/demo/).

## Installation

```bash
pnpm add solana-tx-decoder @solana/web3.js @coral-xyz/anchor decimal.js
```

## Usage

```typescript
import { Connection } from '@solana/web3.js';
import { SolanaParser } from 'solana-tx-decoder';

async function main() {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const parser = new SolanaParser(connection);

  const txId = "YOUR_TRANSACTION_SIGNATURE";
  const result = await parser.parseTransaction(txId);

  if (result) {
    console.log("Success:", result.success);
    console.log("Fee:", result.fee);
    console.log("Actions:", JSON.stringify(result.actions, null, 2));
  }
}

main();
```

## Extending Parsers

Implement the `Parser` interface and register it:

```typescript
import { Parser, ParserContext, ParsedAction } from 'solana-tx-decoder/types';

class MyProtocolParser implements Parser {
  programId = new PublicKey("MyProtocol11111111111111111111111111111111");

  parse(context: ParserContext): ParsedAction | null {
    // Custom decoding logic
    return {
      protocol: "MyProtocol",
      type: "CustomAction",
      summary: "Did something cool",
      details: {}
    };
  }
}

parser.getRegistry().register(new MyProtocolParser());
```
