# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.8] - 2026-01-23

### Added

- **Visualizer UI Enhancements**
  - `TransactionSummary` is now embedded in `TransactionView` for a compact status, fee, and protocol overview.
  - `TokenFlow` is now rendered inside `ActionCard` to highlight token direction and USD value.
  - Unified protocol color mapping across UI components for consistent styling.
- **Community Guidelines**: Added a clear community guidelines document with contribution and conduct references.

### Changed

- Updated web demo banner to reflect v0.0.8.

## [0.0.7] - 2026-01-12

### Added

- **Plugin System Enhancement**: Dynamic loading of external parser plugins
  - `PluginLoader` class for loading plugins from JSON schemas or URLs
  - `PluginSchema` interface for defining parser configurations
  - `loadPlugin()` and `installFromUrl()` methods on `ParserRegistry`
- **Visualizer UI Components**:
  - `TransactionSummary` component for compact transaction overview
  - `TokenFlow` component for visual token movement display
  - Added Raydium (orange) and Orca (cyan) protocol colors to `ActionCard`

### Fixed

- Removed duplicate signature and fee display in `TransactionView`

## [0.0.5] - 2025-12-27

### Added

- **Raydium Parser**: Full support for AMM V4, CLMM, and CP-Swap
  - Add/Remove Liquidity operations
  - Initialize Pool detection
  - Multiple program ID support
- **Orca Parser**: Full Whirlpool protocol support
  - Position management (Open/Close Position)
  - Liquidity operations (Increase/Decrease Liquidity)
  - Fee and reward collection
  - Two-hop swap support
  - Native instruction parsing with Anchor fallback
- New test suite for Orca Whirlpool operations

### Changed

- Unified Raydium swap type to `Swap` with `swapType` in details
- Protocol name updated to `Orca Whirlpool` for clarity

## [0.0.4] - 2024-12-27

### Added

- Universal Anchor IDL resolver for automatic instruction decoding
- IDL fetching and caching in `AnchorParser`
- Connection object passed through `ParserContext`

### Changed

- Refactored `JupiterParser` to use Anchor decoding

## [0.0.3] - 2024-12-XX

### Added

- Jupiter Aggregator parser for swap transactions
- SPL Token parser for mints, burns, and transfers

## [0.0.2] - 2024-12-XX

### Added

- Simulation mode for parsing unsigned transactions
- Inner instruction handling for CPIs

## [0.0.1] - 2024-12-XX

### Added

- Initial release
- Core parser architecture with adapter pattern
- System Program parser
- Basic documentation and examples
