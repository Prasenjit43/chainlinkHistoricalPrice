# Chainlink Historical Price

In the context of Chainlink, a historical price feed refers to the ability of the Chainlink oracle network to supply past price data from various data sources to smart contracts.

The decentralized model involves three entities: the consumer contract, proxy contract, and Aggregator contract.

Consumer contracts interact with the proxy contract, which serves as an abstraction layer over the underlying aggregator contract.

Oracles periodically update data to the aggregators, and these data updates occur in rounds. Each round is identified by a unique roundId, which increments with each new round. This enables smart contracts to access historical data by knowing the roundId of a previous round.

In this specific scenario, the goal is to obtain all roundIds between a given start date and end date and utilize these roundIds to generate day-wise OHLC (Open, High, Low, Close) data.

## Prerequisites

Make sure you have the following software installed before proceeding:

1. [Metamask](https://metamask.io/)
2. [Visual Studio Code (VS Code)](https://code.visualstudio.com/)
3. [Node.js](https://nodejs.org/)

## Installation

To get started, follow these steps:

1. Clone the repository using the following command:
   ```
   git clone https://github.com/Prasenjit43/chainlinkHistoricalPrice.git
   ```
   
2. Navigate to the project directory:
   ```
   cd chainlinkHistoricalPrice/
   ```

3. Install the required npm packages:
   ```
   npm install
   ```

## Running the Project

To run the project and obtain the historical price data, follow these steps:

1. Make sure you have the Metamask extension installed in your browser and connected to the desired network (e.g., Goerli).

2. Run the following command to execute the script that retrieves historical price data:
   ```
   npx hardhat run scripts/iterating.js --network goerli
   ```

The script will fetch the required historical price data using Chainlink's oracle network and display the results.

Feel free to explore the code in the `scripts/iterating.js` file to understand how the data is retrieved and processed.
