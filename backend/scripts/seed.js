const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.viem.getWalletClients();
    console.log("Seeding with account:", deployer.account.address);

    const contractAddress = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    const predictionMarket = await hre.viem.getContractAt("PredictionMarket", contractAddress);

    console.log("Creating market...");
    const question = "Will ETH hit $10k by 2025?";
    const duration = 60 * 60 * 24 * 30; // 30 days

    const tx = await predictionMarket.write.createMarket([question, duration]);
    console.log("Market created! Tx:", tx);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
