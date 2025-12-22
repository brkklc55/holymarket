const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying PredictionMarket...");

    const market = await hre.viem.deployContract("PredictionMarket");
    console.log("PredictionMarket deployed to:", market.address);

    // Update constants.ts
    const constantsPath = path.join(__dirname, "../../app/constants.ts");
    let content = fs.readFileSync(constantsPath, "utf-8");
    content = content.replace(/export const PREDICTION_MARKET_ADDRESS = "0x[a-fA-F0-9]{40}";/, `export const PREDICTION_MARKET_ADDRESS = "${market.address}";`);

    const artifact = await hre.artifacts.readArtifact("PredictionMarket");
    const abiString = JSON.stringify(artifact.abi, null, 2);
    content = content.replace(
        /export const PREDICTION_MARKET_ABI = \[[\s\S]*?\] as const;/,
        `export const PREDICTION_MARKET_ABI = ${abiString} as const;`
    );
    fs.writeFileSync(constantsPath, content);
    console.log("Updated app/constants.ts");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
