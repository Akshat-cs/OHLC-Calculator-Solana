# Solana Token OHLC Calculator

This repository contains a Node.js script to interact with the Bitquery API for analyzing Solana DEX trades and then calculating OHLC / K-line data. It fetches trade percentiles and calculates OHLC (Open, High, Low, Close) data for a specified pair of tokens.

## Features

- Fetches 5th and 95th percentiles of trade prices in the last hour.
- Retrieves and computes OHLC data for trades within the percentile range.

## Prerequisites

- Node.js installed on your machine.
- A Bitquery Streaming API token. Get it using these [steps](https://docs.bitquery.io/docs/authorisation/how-to-generate/)
- `dotenv` package for environment variable management.
- `axios` package as HTTP client.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Akshat-cs/OHLC-Calculator-Solana.git
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. Create a .env file with `AUTH_TOKEN=<YOUR_OAUTH_TOKEN>`

4. **Run the script**:

   ```bash
   npm index.js
   ```

## Configuration

Replace MAIN_CURRENCY_ADDRESS, SIDE_CURRENCY_ADDRESS, and PAIR_ADDRESS in the script with the appropriate Solana token addresses.
