import { collect, paginate } from "./pagination.js";
import { describe, expect, it } from "vitest"; import { RealApiError } from "./errors.js"; import { RealIndexerClient } from "./client.js";
describe("RealIndexerClient", () => { it("unwraps single-resource responses", async () => { const client = new RealIndexerClient({ fetch: async () => new Response(JSON.stringify({ data: { market_id: "btc", buys: [], sells: [], updated_at_ms: 1 } })) }); expect((await client.marketDepth("btc")).market_id).toBe("btc"); }); it("throws a structured API error", async () => { const client = new RealIndexerClient({ fetch: async () => new Response("nope", { status: 429 }) }); await expect(client.health()).rejects.toBeInstanceOf(RealApiError); }); });
it("maps friendly pagination to REAL query fields", async () => { let requested = ""; const client = new RealIndexerClient({ fetch: async (input) => { requested = String(input); return new Response(JSON.stringify({ data: [] })); } }); await client.marketTickers({ limit: 25, cursor: "next" }); expect(requested).toContain("p%5Bs%5D=25"); expect(requested).toContain("p%5Bc%5D=next"); });


it.each(["markets", "marketTickers", "trades", "liquidations", "fundingPayments"] as const)(
  "%s exposes the API pagination cursor through Page.next_cursor",
  async (method) => {
    const client = new RealIndexerClient({
      fetch: async () => new Response(JSON.stringify({ data: [], pagination: { next_cursor: "page-2" } })),
    });
    expect((await client[method]()).next_cursor).toBe("page-2");
  },
);

it.each(["nested", "top-level"])("iterates %s cursors and stops at the final page", async (shape) => {
  const cursors: (string | null)[] = [];
  const client = new RealIndexerClient({
    fetch: async (input) => {
      const cursor = new URL(String(input)).searchParams.get("p[c]");
      cursors.push(cursor);
      if (cursors.length > 2) throw new Error("Requested beyond the final page");
      const next_cursor = cursor === null ? "page-2" : null;
      return new Response(JSON.stringify({
        data: [{ id: cursor === null ? "first" : "second" }],
        ...(shape === "nested" ? { pagination: { next_cursor } } : { next_cursor }),
      }));
    },
  });
  const trades = await collect(paginate((cursor) => client.trades({ limit: 1, cursor })));
  expect(trades.map((trade) => trade.id)).toEqual(["first", "second"]);
  expect(cursors).toEqual([null, "page-2"]);
});

it("exposes the ticker 24h statistics", async () => {
  const ticker = { market_id: "btc", symbol: "BTC-USDT", mark_price: "60122.3", index_price: "60122.3", volume_24h: "10.2988", turnover_24h: "624771.19", updated_at_ms: 1, last_traded_price: "60083.3", prev_price_24h: "62927.5", price_change_24h: "-0.0451980453696714", high_price_24h: "63624.4", low_price_24h: "59358.4", volume_change_24h: "-0.6287249", open_interest: "0.9623" };
  const client = new RealIndexerClient({ fetch: async () => new Response(JSON.stringify({ data: [ticker], pagination: { next_cursor: null } })) });
  const [first] = (await client.marketTickers()).data;
  expect(Number(first.last_traded_price) / Number(first.prev_price_24h) - 1).toBeCloseTo(Number(first.price_change_24h));
  expect([first.high_price_24h, first.low_price_24h, first.volume_change_24h, first.open_interest]).toEqual(["63624.4", "59358.4", "-0.6287249", "0.9623"]);
});
