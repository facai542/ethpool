require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '.env.local' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // ETH 主网
    mainnet: {
      url: process.env.ETH_MAINNET_RPC_URL || "https://eth.llamarpc.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
      timeout: 60000,
    },
    // ETH 测试网 (Sepolia)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
    // 本地测试网络
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: "remote",
    },
    // Hardhat内置网络
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
      forking: process.env.ETH_MAINNET_RPC_URL ? {
        url: process.env.ETH_MAINNET_RPC_URL,
        // blockNumber: 18500000 // 可选：指定分叉区块
      } : undefined,
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 60000
  }
};