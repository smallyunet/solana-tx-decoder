# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
