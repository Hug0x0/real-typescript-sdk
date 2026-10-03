# TypeScript usage guide

[README](../README.md) · [API reference](API.md)

Build with `npm run build` first. Snippets below use the local `./dist/index.js` entry point from a JavaScript ES module in the repository root.

## Select a network

```js
import { RealIndexerClient } from "./dist/index.js";

const testnet = new RealIndexerClient({ network: "testnet" });
const custom = new RealIndexerClient({
  baseUrl: "http://localhost:8080",
  timeoutMs: 5_000,
});
```

The localhost address is an example; you must provide your own indexer there.

## Iterate through ticker pages

```js
import { RealIndexerClient, paginate } from "./dist/index.js";

const client = new RealIndexerClient();
for await (const ticker of paginate((cursor) =>
  client.marketTickers({ cursor, limit: 100 })
)) {
  console.log(ticker.symbol, ticker.mark_price);
}
```

Use `collect(paginate(...))` if you need an array and the full result fits in memory. A `break` stops requesting further pages. The client exposes the server's `pagination.next_cursor` as `Page.next_cursor`, which the helper uses to request subsequent pages.

## Filter funding payments

```js
const page = await client.fundingPayments({
  marketId: "your-market-id",
  accountId: "your-account-id",
  limit: 20,
});
console.log(page.data);
```

Replace placeholder IDs with actual indexer IDs. A filter does not authenticate the request.

## Handle failures

```js
import { RealApiError, RealIndexerClient } from "./dist/index.js";

const client = new RealIndexerClient();
try {
  console.log(await client.health());
} catch (error) {
  if (error instanceof RealApiError) {
    console.error(`Indexer returned HTTP ${error.status}`);
  } else {
    throw error;
  }
}
```

Inspect `error.body` when diagnosing an HTTP failure, but sanitize it before sharing logs. Implement application-specific backoff if needed; the SDK does not retry or rate-limit requests.

## Test without the network

```js
import { RealIndexerClient } from "./dist/index.js";

const client = new RealIndexerClient({
  fetch: async () => new Response(JSON.stringify({
    data: [{ market_id: "demo", symbol: "DEMO-PERP", mark_price: "1.25" }],
    pagination: { next_cursor: null },
  })),
});
const page = await client.marketTickers();
console.log(page.data[0].symbol); // DEMO-PERP
```

This intentionally minimal fixture shows that TypeScript types do not validate response fields at runtime. Production code should handle unexpected API data appropriately.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Missing `dist/index.js` | Run `npm run build` from the repository root. |
| Tooling engine warning | Use Node.js 22.12+ on the Node.js 22 release line. |
| Import syntax error | Use an ESM file such as `quickstart.mjs`. |
| HTTP 429 | Slow requests and implement bounded backoff in your application. |
| Unexpected response fields | Compare sanitized JSON with the types and envelope behavior in the API reference. |
| Browser request blocked | Check runtime support, CORS, and mixed-content rules. |
