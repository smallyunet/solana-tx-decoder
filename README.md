# Solana Transaction Decoder

[![npm version](https://img.shields.io/npm/v/solana-tx-decoder.svg?style=flat-square)](https://www.npmjs.com/package/solana-tx-decoder)
[![License](https://img.shields.io/npm/l/solana-tx-decoder.svg?style=flat-square)](https://github.com/smallyunet/solana-tx-decoder/blob/main/LICENSE)
[![CI](https://github.com/smallyunet/solana-tx-decoder/actions/workflows/ci.yml/badge.svg)](https://github.com/smallyunet/solana-tx-decoder/actions/workflows/ci.yml)

A robust, extensible TypeScript library for parsing Solana transactions into structured, human-readable data.

## Features

- **Adapter Pattern**: Easily extensible parser registry
- **Universal IDL Resolver**: Auto-fetching and decoding via Anchor IDLs
- **Deep Protocol Parsing**: Jupiter, Raydium (AMM V4/CLMM/CP-Swap), Orca Whirlpool
- **Liquidity Operations**: Add/Remove Liquidity, Position Management, Fee Collection
- **Structured Output**: Strictly typed `ParsedResult`
- **Inner Instructions**: Handles nested CPIs

## Supported Protocols

| Protocol | Operations |
|----------|------------|
| System Program | Transfer, CreateAccount |
| SPL Token | Transfer, Mint, Burn |
| Jupiter | Swap, Route |
| Raydium | Swap, Add/Remove Liquidity, Initialize Pool |
| Orca Whirlpool | Swap, Open/Close Position, Increase/Decrease Liquidity, Collect Fees |

## Installation

```bash
pnpm add solana-tx-decoder @solana/web3.js @coral-xyz/anchor decimal.js
```

## Quick Start

```typescript
import { Connection } from '@solana/web3.js';
import { SolanaParser } from 'solana-tx-decoder';

const connection = new Connection("https://api.mainnet-beta.solana.com");
const parser = new SolanaParser(connection);

// Parse a real Raydium swap transaction
const result = await parser.parseTransaction(
  "3oPfvbCztaNEpbtSib2DezyzjvSwxv7mZv8peCoAuiRijetvFM3TspWthxzETGkYYuxjVGa6HbdEKjiv9vZzd3Up"
);

if (result) {
  console.log("Fee:", result.fee, "SOL");
  console.log("Actions:", result.actions);
}
```

## Extending Parsers

Implement the `Parser` interface and register it:

```typescript
import { Parser, ParserContext, ParsedAction } from 'solana-tx-decoder';
import { PublicKey } from '@solana/web3.js';

class MyProtocolParser implements Parser {
  programId = new PublicKey("MyProtocol11111111111111111111111111111111");

  parse(context: ParserContext): ParsedAction | null {
    return {
      protocol: "MyProtocol",
      type: "CustomAction",
      summary: "Did something cool",
      details: {},
      direction: "UNKNOWN"
    };
  }
}

parser.getRegistry().register(new MyProtocolParser());
```

## Examples

Check out the [examples](./examples) directory for usage scenarios, or see the [Examples & Results](./docs/EXAMPLES.md) document for parsed output samples.

## Links

- [Live Demo](https://smallyunet.github.io/solana-tx-decoder/) *(Requires private RPC)*
- [Examples and Results](./docs/EXAMPLES.md)
- [Changelog](./CHANGELOG.md)
- [Roadmap](./ROADMAP.md)
- [Community Guidelines](./COMMUNITY_GUIDELINES.md)

## E2E Testing

Run end-to-end tests with real mainnet transactions:

```bash
# Set your RPC URL
export SOLANA_RPC_URL=https://your-private-rpc-url

# Run E2E tests
pnpm test:e2e
```

Results are exported to `docs/e2e-results/RESULTS.md`.

## License

MIT
