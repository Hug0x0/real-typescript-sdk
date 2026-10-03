<div align="center">

# REAL TypeScript SDK

**Public REAL market data, accessible from TypeScript.**

[![CI](https://github.com/Hug0x0/real-typescript-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Hug0x0/real-typescript-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-ESM-3178C6?logo=typescript&logoColor=white)

[Quick start](#quick-start) · [API reference](docs/API.md) · [Usage guide](docs/USAGE.md) · [Contributing](CONTRIBUTING.md)

</div>

---

A community-maintained client for the public REAL indexer API. Query market data, inspect order-book depth, and retrieve trades, liquidations, and funding payments with a small API.

> **Scope:** Read-only indexer access. This SDK does not sign transactions, submit orders, or manage private keys. It is not affiliated with Real Markets.

## Why use it?

- TypeScript declarations and ESM output.
- A fetch-based client with no runtime package dependencies.
- Reusable async pagination helpers and an injectable fetch implementation.
- Mainnet, testnet, and custom indexer URLs.
- Configurable request timeouts and structured HTTP errors.

## Quick start

Requires Node.js 22.12+ on the Node.js 22 release line for the development workflow below (also used by CI). The client declares Node.js 20+ support.

### 1. Install from source

These instructions use the repository directly and do not depend on an npm or PyPI release. The npm package name in the manifest is `@real-community/indexer`. The examples below use the local build.

```sh
git clone https://github.com/Hug0x0/real-typescript-sdk.git
cd real-typescript-sdk
npm ci
npm run build
```

### 2. Read market tickers

Save this as `quickstart.mjs` in the repository root and run it with `node quickstart.mjs`:

```js
import { RealIndexerClient } from "./dist/index.js";

const client = new RealIndexerClient({ network: "mainnet" });
const page = await client.marketTickers({ limit: 20 });
for (const ticker of page.data) {
  console.log(ticker.symbol, ticker.mark_price);
}
```

This example makes a live request to mainnet. No API key is required by the client.

### 3. Try the included example

```sh
node --experimental-strip-types examples/market-tickers.ts
```

## Documentation

| Guide | What you will find |
| --- | --- |
| [API reference](docs/API.md) | Constructor options, methods, return types, and query mapping |
| [Usage guide](docs/USAGE.md) | Networks, pagination, error handling, and offline testing |
| [Contributing](CONTRIBUTING.md) | Local setup, validation, and pull request expectations |

## Development

After the installation steps above:

```sh
npm test
npm run build
npm pack --dry-run
```

Tests use mocked HTTP responses; they do not need network access or credentials. CI runs tests and builds on pushes and pull requests. Passing mocked tests does not guarantee compatibility with every live API response.

## Current scope

This is an early `0.1.0` client with a small test suite. Response types describe the expected API shape; they are not runtime schema validation. Decimal values such as prices and funding rates are represented as strings. See the API reference before converting them for calculations.

There is no built-in retry policy, rate limiter, WebSocket transport, or trading support.

## Contributing

Bug reports, documentation improvements, and focused pull requests are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), or [open an issue](https://github.com/Hug0x0/real-typescript-sdk/issues).

Use English for documentation, issues, pull requests, code comments, and user-facing messages so contributors can collaborate consistently.

## Related projects

- [REAL Python SDK](https://github.com/Hug0x0/real-python-sdk)
- [Original shared repository](https://github.com/Hug0x0/real-community-sdks)

The language-specific history was extracted from the original shared repository. Extraction preserved the relevant commits and changed their commit IDs.

## License

[MIT](LICENSE).
