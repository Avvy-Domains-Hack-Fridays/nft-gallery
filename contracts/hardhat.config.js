/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('@nomiclabs/hardhat-etherscan')

module.exports = {
  solidity: "0.8.18",
  mocha: {
    timeout: 60000,
  },
  namedAccounts: {
    deployer: 0
  },
  etherscan: {
    apiKey: {
      mainnet: "avascan",
    },
    customChains: [
      {
        network: "mainnet",
        chainId: 43114,
        urls: {
          apiURL: "https://api.avascan.info/v2/network/mainnet/evm/43114/etherscan",
          browserURL: "https://avascan.info/blockchain/c",
        }
      }
    ],
  },
  networks: {
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY
      ]
    },
    mainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY
      ]
    }
  }
};

