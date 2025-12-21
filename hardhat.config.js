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
        baseSepolia: {
            url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 84532
        }
    }
};

export default config;
