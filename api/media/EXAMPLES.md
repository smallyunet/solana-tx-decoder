# Examples & Results

This document showcases the parsing capabilities of `solana-tx-decoder` with real mainnet transaction examples.

## Supported Protocols

| Protocol | Features |
|----------|----------|
| **System Program** | Transfer, CreateAccount, Allocate |
| **SPL Token** | Transfer, Mint, Burn, Approve |
| **Jupiter** | Swap, Route |
| **Raydium** | AMM V4/CLMM/CP-Swap, Add/Remove Liquidity |
| **Orca Whirlpool** | Swap, Position Management, Liquidity, Fees |

---

## Example Transactions

### Jupiter Swap

```typescript
const result = await parser.parseTransaction(
  '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump'
);
```

**Expected Output:**
```json
{
  "protocol": "Jupiter",
  "type": "Swap",
  "summary": "Jupiter Swap",
  "details": { ... }
}
```

---

### Raydium AMM Swap

```typescript
const result = await parser.parseTransaction(
  '3oPfvbCztaNEpbtSib2DezyzjvSwxv7mZv8peCoAuiRijetvFM3TspWthxzETGkYYuxjVGa6HbdEKjiv9vZzd3Up'
);
```

**Expected Output:**
```json
{
  "protocol": "Raydium",
  "type": "Swap",
  "summary": "Raydium Swap: 1000000000 -> min 45000000",
  "details": {
    "swapType": "BaseIn",
    "amountIn": "1000000000",
    "minAmountOut": "45000000"
  }
}
```

---

### Orca Whirlpool Swap

```typescript
const result = await parser.parseTransaction(
  '3EWQN5tjCMMsxavQdJz9FD4ZSUbfFdyzmA9Ndf8Sa7NRmSJLq84PWi3BVTgE6wsk2G8xhhuMVT5Yq8GUWUeE6h34'
);
```

**Expected Output:**
```json
{
  "protocol": "Orca Whirlpool",
  "type": "Swap",
  "summary": "Orca Swap: 2000000000 (Input) -> min 89000000",
  "details": {
    "amount": "2000000000",
    "otherAmountThreshold": "89000000",
    "amountSpecifiedIsInput": true,
    "aToB": true
  }
}
```

---

## Running Examples

```bash
# Clone the repository
git clone https://github.com/smallyunet/solana-tx-decoder.git
cd solana-tx-decoder

# Install dependencies
pnpm install

# Run the basic example
npx ts-node examples/basic.ts

# Run E2E tests with real data
SOLANA_RPC_URL=https://your-rpc-url pnpm test:e2e
```

---

## Live Demo

Try the interactive demo at: https://smallyunet.github.io/solana-tx-decoder/

> **Note**: The demo requires a private RPC URL (Helius, Alchemy, or QuickNode) since public RPCs block browser requests.
