import { RealIndexerClient } from "../dist/index.js";
const real = new RealIndexerClient({ network: "mainnet" });
const tickers = await real.marketTickers({ limit: 20 });
for (const ticker of tickers.data) console.log(ticker.symbol, ticker.perp_next_funding_rate);
