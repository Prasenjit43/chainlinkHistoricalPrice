//require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */

const MAINNET_URL = process.env.MAINNET_URL;
const GOERLI_URL = process.env.GOERLI_URL;

module.exports = {
  solidity: "0.8.19",

  networks: {
    hardhat: {
      forking: {
        url: GOERLI_URL
      }
    },
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    }
  }

};
