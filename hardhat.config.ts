import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import 'dotenv/config'
import "./task/index"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // default
      },
    },
  },
  gasReporter: {
    enabled: true,
  },
  mocha: {
    timeout: 200000,
    slow: 0,
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts:
        process.env.PRIVATE_KEY_PROD !== undefined ? [process.env.PRIVATE_KEY_PROD] : [],
    },
    testnet: {
      url: process.env.TESTNET_URL,
      accounts:
        process.env.PRIVATE_KEY_DEV !== undefined ? [process.env.PRIVATE_KEY_DEV] : [],
    },
    local: {
      url: "http://localhost:8545",
      accounts:
        process.env.PRIVATE_KEY_DEV !== undefined ? [process.env.PRIVATE_KEY_DEV] : [],
    },
  },
};

export default config;