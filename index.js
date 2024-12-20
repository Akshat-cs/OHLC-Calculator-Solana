const axios = require("axios");
require("dotenv").config();

// Configuration Variables
const API_URL = "https://streaming.bitquery.io/eap";
const AUTH_TOKEN = process.env.AUTH_TOKEN; // Replace with your actual token
const MAIN_CURRENCY_ADDRESS = "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump";
const SIDE_CURRENCY_ADDRESS = "So11111111111111111111111111111111111111112";
const PAIR_ADDRESS = "Bzc9NZfMqkXR6fz1DBph7BDf9BroyEf6pnzESP7v5iiw";

// Helper function to calculate timestamp
function getTimestamp(minutesAgo) {
  const now = new Date();
  return new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
}

// Function to fetch percentiles
async function fetchPercentiles() {
  const timestamp1Hago = getTimestamp(60);

  const percentileData = JSON.stringify({
    query: `query ($mainCurrencyAddress: String , $sideCurrencyAddress: String, $pairAddress: String, $timestamp1Hago: DateTime ) {
      Solana {
        DEXTradeByTokens(
          where: {Trade: {Currency: {MintAddress: {is: $mainCurrencyAddress}}, Side: {Currency: {MintAddress: {is: $sideCurrencyAddress}}}, Market: {MarketAddress: {is: $pairAddress}}}, Transaction: {Result: {Success: true}}, Block: {Time: {since: $timestamp1Hago}}}
        ) {
          percentile5th: quantile(of: Trade_PriceInUSD, level: 0.05)
          percentile95th: quantile(of: Trade_PriceInUSD, level: 0.95)
        }
      }
    }`,
    variables: JSON.stringify({
      mainCurrencyAddress: MAIN_CURRENCY_ADDRESS,
      sideCurrencyAddress: SIDE_CURRENCY_ADDRESS,
      pairAddress: PAIR_ADDRESS,
      timestamp1Hago,
    }),
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    data: percentileData,
  };

  try {
    const response = await axios.request(config);
    return response.data.data.Solana.DEXTradeByTokens[0];
  } catch (error) {
    console.error("Error fetching percentiles:", error);
    throw error;
  }
}

// Function to fetch trades and compute OHLC
async function fetchTradesAndComputeOHLC(lowerBoundPrice, upperBoundPrice) {
  const timestamp1Hago = getTimestamp(60);

  const tradeData = JSON.stringify({
    query: `query ($mainCurrencyAddress: String , $sideCurrencyAddress: String, $pairAddress: String, $lowerBoundPrice: Float, $upperBoundPrice: Float, $timestamp1Hago: DateTime ) {
      Solana {
        DEXTradeByTokens(
          orderBy: {descending: Block_Time}
          where: {Trade: {Currency: {MintAddress: {is: $mainCurrencyAddress}}, Side: {Currency: {MintAddress: {is: $sideCurrencyAddress}}}, Market: {MarketAddress: {is: $pairAddress}}, PriceInUSD: {ge: $lowerBoundPrice, le: $upperBoundPrice}}, Transaction: {Result: {Success: true}}, Block: {Time: {since: $timestamp1Hago}}}
        ) {
          Block {
            Time
            Slot
          }
          Trade {
            Price
            PriceInUSD
          }
        }
      }
    }`,
    variables: JSON.stringify({
      mainCurrencyAddress: MAIN_CURRENCY_ADDRESS,
      sideCurrencyAddress: SIDE_CURRENCY_ADDRESS,
      pairAddress: PAIR_ADDRESS,
      lowerBoundPrice,
      upperBoundPrice,
      timestamp1Hago,
    }),
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    data: tradeData,
  };

  try {
    const response = await axios.request(config);
    const trades = response.data.data.Solana.DEXTradeByTokens;

    if (trades.length === 0) {
      console.log("No trades found.");
      return;
    }

    // Compute OHLC
    const ohlc = {
      open: trades[trades.length - 1].Trade.Price,
      high: Math.max(...trades.map((t) => t.Trade.Price)),
      low: Math.min(...trades.map((t) => t.Trade.Price)),
      close: trades[0].Trade.Price,
    };

    console.log("OHLC:", ohlc);
  } catch (error) {
    console.error("Error fetching trades:", error);
  }
}

// Main Function
(async function main() {
  try {
    const percentiles = await fetchPercentiles();
    await fetchTradesAndComputeOHLC(
      percentiles.percentile5th,
      percentiles.percentile95th
    );
  } catch (error) {
    console.error("Error in main function:", error);
  }
})();
