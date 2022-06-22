require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  solidity: "0.8.7",
  networks: {
    bsc: {
      url: BSCTESTNET_RPC_URL,
      accounts: [REACT_APP_PRIVATE_KEY],
    },
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/<key>",
        blockNumber: 20136080,
      },
    },
  },
  etherscan: {
    apiKey: BSCSCAN_KEY,
  },
};
