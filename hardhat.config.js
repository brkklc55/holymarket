import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config = {
    solidity: {
        version: "0.8.20",
        settings: {
            evmVersion: "paris",
            optimizer: {
                enabled: false
            }
        }
    },
    networks: {
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 97
        }
    }
};

export default config;
