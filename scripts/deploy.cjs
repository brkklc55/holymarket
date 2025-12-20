const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying SimplePredictionMarket...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Fee collector = deployer
    const feeCollector = deployer.address;
    console.log("Fee Collector:", feeCollector);

    const SimplePredictionMarket = await hre.ethers.getContractFactory("SimplePredictionMarket");
    const contract = await SimplePredictionMarket.deploy(feeCollector);

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log("\n✅ SimplePredictionMarket deployed!");
    console.log("Address:", address);
    console.log("View on BaseScan:", `https://sepolia.basescan.org/address/${address}`);

    // Update constants.ts
    const constantsPath = path.join(__dirname, "../app/constants.ts");
    let constantsContent = fs.readFileSync(constantsPath, "utf8");
    constantsContent = constantsContent.replace(
        /PREDICTION_MARKET_ADDRESS = "0x[0-9a-fA-F]{40}"/,
        `PREDICTION_MARKET_ADDRESS = "${address}"`
    );
    fs.writeFileSync(constantsPath, constantsContent);
    console.log("\n✅ Updated app/constants.ts");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
