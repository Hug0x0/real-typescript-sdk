# TypeScript API reference

[README](../README.md) · [Usage guide](USAGE.md)

This reference describes the current implementation. All client methods return promises and perform HTTP GET requests. Import public exports from `dist/index.js` after building.

## Client configuration

```ts
const client = new RealIndexerClient({
  network: "mainnet",
  timeoutMs: 15_000,
});
```

| Option | Default | Purpose |
| --- | --- | --- |
| `network` | `"mainnet"` | `"mainnet"` or `"testnet"` |
| `baseUrl` | Derived from network | Override the indexer URL |
| `timeoutMs` | `15000` | Per-request timeout in milliseconds |
| `fetch` | `globalThis.fetch` | Inject a fetch-compatible function |

Configured URLs are `https://indexer.api.real.xyz` for mainnet and `https://indexer.api.testnet.real.xyz` for testnet. `baseUrl` takes precedence over `network`.

The runtime must provide `fetch`, `Response`, `URL`, and `AbortSignal.timeout`. Builds are ESM. Browser use also depends on the indexer's CORS configuration; it is not verified by the Node.js test suite.

## Methods

`Pagination` is `{ cursor?: string; limit?: number }`. The TypeScript client does not set a default page size; omitted values are left to the server.

| Method | Return type | Path |
| --- | --- | --- |
| `health()` | `Promise<Record<string, unknown>>` | `/health` |
| `markets(page?)` | `Promise<Page<Market>>` | `/api/v1/markets` |
| `marketTickers(page?)` | `Promise<Page<MarketTicker>>` | `/api/v1/markets/tickers` |
| `marketDepth(marketId)` | `Promise<MarketDepth>` | `/api/v1/markets/{marketId}/depth` |
| `trades(page?)` | `Promise<Page<Trade>>` | `/api/v1/trades` |
| `liquidations(page?)` | `Promise<Page<Liquidation>>` | `/api/v1/liquidations` |
| `fundingPayments(filters?)` | `Promise<Page<FundingPayment>>` | `/api/v1/funding-payments` |

`fundingPayments` accepts pagination plus `marketId?: string` and `accountId?: string`. `marketDepth` URL-encodes the market ID.

### Query mapping

| SDK option | HTTP parameter |
| --- | --- |
| `cursor` | `p[c]` |
| `limit` | `p[s]` |
| `marketId` (funding payments) | `f[market_ids]` |
| `accountId` (funding payments) | `f[account_ids]` |

Undefined values are omitted. Page sizes and filters are not validated locally.

## Response types

```ts
type Page<T> = {
  data: T[];
  next_cursor?: string | null;
};

type PriceLevel = {
  price_level: string;
  volume: string;
};
```

`MarketDepth` contains `market_id`, `buys`, `sells`, and `updated_at_ms`. Each side is a `PriceLevel[]`.

The complete fields for `Market`, `MarketTicker`, `Trade`, `FundingPayment`, and `Liquidation` are defined in [src/types.ts](../src/types.ts). Price, quantity, payment, and rate fields use strings; time fields ending in `_ms` use numeric milliseconds.

Types are compile-time declarations, not runtime validators. The request layer unwraps an object-valued `data` envelope and preserves a response whose `data` field is an array. It does not normalize arbitrary response shapes.

## Pagination helpers

- `paginate<T>(fetchPage)` yields items from successive `Page<T>` responses. The callback receives an optional cursor. Iteration ends when `next_cursor` is absent, null, or empty.
- `collect<T>(source)` gathers an async iterable into an array. It keeps all collected items in memory.

Both helpers are exported from the package entry point. Pagination does not detect a server that repeatedly returns the same cursor; callers can stop iteration with `break`.

## Errors

Non-success HTTP responses throw `RealApiError`, which exposes `status: number` and `body: string`. Network failures, timeout errors, and JSON decoding errors propagate from the underlying runtime. There are no automatic retries.
