const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { bscTestnet } = require("viem/chains");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying PredictionMarket to BNB Testnet...");

    let PK = process.env.PRIVATE_KEY;
    if (!PK) {
        // Fallback to backend/.env if root .env doesn't have it
        const backendEnvPath = path.resolve(__dirname, "../backend/.env");
        if (fs.existsSync(backendEnvPath)) {
            const content = fs.readFileSync(backendEnvPath, "utf8");
            const match = content.match(/PRIVATE_KEY=(.*)/);
            if (match) PK = match[1].trim().replace(/['"]/g, '');
        }
    }

    if (!PK) {
        console.error("❌ PRIVATE_KEY not found in .env or backend/.env");
        process.exit(1);
    }

    if (!PK.startsWith("0x")) PK = "0x" + PK;

    const account = privateKeyToAccount(PK);
    console.log("Deployer:", account.address);

    const transport = http("https://data-seed-prebsc-1-s1.binance.org:8545");
    const walletClient = createWalletClient({
        account,
        chain: bscTestnet,
        transport
    });

    const publicClient = createPublicClient({
        chain: bscTestnet,
        transport
    });

    const artifactPath = path.resolve(__dirname, "../prediction-market-artifact.json");
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found at:", artifactPath);
        process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    let bytecode = artifact.bytecode;
    if (!bytecode.startsWith("0x")) bytecode = "0x" + bytecode;

    console.log("Sending deployment transaction...");
    const hash = await walletClient.deployContract({
        abi: artifact.abi,
        bytecode,
        account
    });

    console.log("Tx Hash:", hash);
    console.log("Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const address = receipt.contractAddress;

    console.log("\n✅ PredictionMarket deployed!");
    console.log("Address:", address);
    console.log("View on BscScan:", `https://testnet.bscscan.com/address/${address}`);

    // Update app/constants.ts
    const constantsPath = path.resolve(__dirname, "../app/constants.ts");
    if (fs.existsSync(constantsPath)) {
        let content = fs.readFileSync(constantsPath, "utf8");
        const regex = /PREDICTION_MARKET_ADDRESS = "0x[0-9a-fA-F]{40}"/;
        if (regex.test(content)) {
            content = content.replace(regex, `PREDICTION_MARKET_ADDRESS = "${address}"`);
            fs.writeFileSync(constantsPath, content);
            console.log("✅ Updated app/constants.ts");
        } else {
            console.warn("⚠️ Could not find PREDICTION_MARKET_ADDRESS regex in constants.ts");
        }
    }

    // Save to deployed-address.txt
    fs.writeFileSync(path.resolve(__dirname, "../deployed-address.txt"), address);
}

main().catch(console.error);
