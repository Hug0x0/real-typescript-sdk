# REAL TypeScript SDK

Community-maintained TypeScript client for the public REAL indexer API.

Read-only access to market tickers, market depth, trades, liquidations, funding payments, and health, with pagination helpers and configurable mainnet, testnet, or custom API URLs.

## Development

The client supports Node.js 20 or newer. Development requires Node.js 22.12 or newer on the Node.js 22 release line (used by CI), or another version supported by Vitest. Run from the repository root:

```sh
npm ci
npm test
npm run build
```

## Example

After completing the development setup:

```sh
node --experimental-strip-types examples/market-tickers.ts
```

See [the example](examples/market-tickers.ts), [supported operations](docs/API.md), and [contribution guidelines](CONTRIBUTING.md).

## Related projects

- [Python SDK](https://github.com/Hug0x0/real-python-sdk)
- [Original shared repository](https://github.com/Hug0x0/real-community-sdks)

This repository retains the TypeScript package history extracted from the original shared repository. Commit IDs changed during extraction.

Trading and key management remain the responsibility of the official Rust SDK. This project is community-built and is not affiliated with Real Markets.

## License

[MIT](LICENSE)
