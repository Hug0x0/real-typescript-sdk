import { RealApiError } from "./errors.js";
import type { FundingPayment, Liquidation, Market, MarketDepth, MarketTicker, Network, Page, Pagination, Trade } from "./types.js";
const URLS: Record<Network, string> = { mainnet: "https://indexer.api.real.xyz", testnet: "https://indexer.api.testnet.real.xyz" };
const pageQuery = (page: Pagination) => ({ "p[c]": page.cursor, "p[s]": page.limit });
export type ClientOptions = { network?: Network; baseUrl?: string; fetch?: typeof globalThis.fetch; timeoutMs?: number };
export class RealIndexerClient {
  private readonly baseUrl: string; private readonly fetcher: typeof globalThis.fetch; private readonly timeoutMs: number;
  constructor(options: ClientOptions = {}) { this.baseUrl = (options.baseUrl ?? URLS[options.network ?? "mainnet"]).replace(/\/$/, ""); this.fetcher = options.fetch ?? globalThis.fetch; this.timeoutMs = options.timeoutMs ?? 15_000; }
  private async request<T>(path: string, query: Record<string, string | number | undefined> = {}): Promise<T> { const url = new URL(`${this.baseUrl}${path}`); for (const [key, value] of Object.entries(query)) if (value !== undefined) url.searchParams.set(key, String(value)); const response = await this.fetcher(url, { signal: AbortSignal.timeout(this.timeoutMs), headers: { accept: "application/json" } }); if (!response.ok) throw new RealApiError(response.status, await response.text()); const body = await response.json() as T | { data: T }; return body && typeof body === "object" && "data" in body && !Array.isArray((body as { data: unknown }).data) ? (body as { data: T }).data : body as T; }
  health() { return this.request<Record<string, unknown>>("/health"); }
  markets(page: Pagination = {}) { return this.request<Page<Market>>("/api/v1/markets", pageQuery(page)); }
  marketTickers(page: Pagination = {}) { return this.request<Page<MarketTicker>>("/api/v1/markets/tickers", pageQuery(page)); }
  marketDepth(marketId: string) { return this.request<MarketDepth>(`/api/v1/markets/${encodeURIComponent(marketId)}/depth`); }
  trades(page: Pagination = {}) { return this.request<Page<Trade>>("/api/v1/trades", pageQuery(page)); }
  liquidations(page: Pagination = {}) { return this.request<Page<Liquidation>>("/api/v1/liquidations", pageQuery(page)); }
  fundingPayments(filters: Pagination & { marketId?: string; accountId?: string } = {}) { const { marketId, accountId, ...page } = filters; return this.request<Page<FundingPayment>>("/api/v1/funding-payments", { ...pageQuery(page), "f[market_ids]": marketId, "f[account_ids]": accountId }); }
}
