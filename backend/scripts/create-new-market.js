const hre = require("hardhat");

async function main() {
    const contractAddress = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
    const predictionMarket = PredictionMarket.attach(contractAddress);

    console.log("Creating new market...");
    const question = "Will ETH hit $5000 by 2025?";
    const duration = 86400; // 24 hours

    const tx = await predictionMarket.createMarket(question, duration);
    await tx.wait();

    console.log("New Market Created!");

    const count = await predictionMarket.marketCount();
    console.log("Total Markets:", count.toString());
    console.log("New Market ID:", (count - 1n).toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
