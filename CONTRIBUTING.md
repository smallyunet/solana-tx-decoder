# Contributing to Solana Transaction Decoder

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `pnpm install`
3. **Run tests**: `pnpm test`
4. **Build the project**: `pnpm build`

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new parser for protocol X
fix: correct token amount parsing
docs: update README examples
refactor: simplify instruction parsing logic
```

## Adding a New Parser

1. Create a new file in `src/parsers/`
2. Implement the `Parser` interface from `src/types.ts`
3. Register your parser in `SolanaParser` constructor
4. Add tests in `tests/`

Example:

```typescript
import { Parser, ParserContext, ParsedAction } from '../types';
import { PublicKey } from '@solana/web3.js';

export class MyProtocolParser implements Parser {
  programId = new PublicKey('...');

  async parse(context: ParserContext): Promise<ParsedAction | null> {
    // Your parsing logic
    return null;
  }
}
```

## Testing

- Write tests for new parsers in `tests/`
- Run `pnpm test` to execute tests
- Ensure all tests pass before submitting a PR

## Pull Request Process

1. Ensure your code follows the existing style
2. Update documentation if needed
3. Add tests for new functionality
4. Run `pnpm test` and `pnpm build` successfully
5. Submit a PR with a clear description

## Questions?

Open an issue for any questions or concerns.
