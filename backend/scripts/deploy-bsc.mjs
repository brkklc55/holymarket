import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWalletClient, http, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';

// Simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
    console.log("🚀 Deploying SimplePredictionMarket to BSC Testnet (Standalone ESM)...\n");

    let PK = process.env.PRIVATE_KEY;
    if (!PK) {
        console.error("❌ PRIVATE_KEY environment variable not found!");
        process.exit(1);
    }
    if (!PK.startsWith("0x")) {
        PK = "0x" + PK;
    }

    const account = privateKeyToAccount(PK);
    const deployer = account.address;
    console.log("Deployer:", deployer);

    // Create client
    const walletClient = createWalletClient({
        account,
        chain: bscTestnet,
        transport: http("https://data-seed-prebsc-1-s1.binance.org:8545")
    });

    const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http("https://data-seed-prebsc-1-s1.binance.org:8545")
    });

    // Read artifact
    const artifactPath = path.resolve(__dirname, "../../simple-prediction-market-artifact.json");
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found! Run compile-simple.js first.");
        process.exit(1);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Deploy
    console.log("Deploying transaction...");
    // Fee collector = deployer
    const feeCollector = deployer;

    // Note: deploying raw bytecode requires prepending '0x' if not present
    let bytecode = artifact.bytecode;
    if (!bytecode.startsWith("0x")) bytecode = "0x" + bytecode;

    const hash = await walletClient.deployContract({
        abi: artifact.abi,
        bytecode: bytecode,
        args: [feeCollector]
    });

    console.log("Transaction Hash:", hash);
    console.log("Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const address = receipt.contractAddress;

    console.log("\n✅ SimplePredictionMarket deployed!");
    console.log("Address:", address);
    console.log("View on BscScan:", `https://testnet.bscscan.com/address/${address}`);

    // Update constants.ts
    const constantsPath = path.resolve(__dirname, "../../app/constants.ts");
    let constantsContent = fs.readFileSync(constantsPath, "utf8");

    // Regex to match existing address line
    const regex = /PREDICTION_MARKET_ADDRESS = "0x[0-9a-fA-F]{40}"/;

    if (regex.test(constantsContent)) {
        constantsContent = constantsContent.replace(
            regex,
            `PREDICTION_MARKET_ADDRESS = "${address}"`
        );
        fs.writeFileSync(constantsPath, constantsContent);
        console.log("\n✅ Updated app/constants.ts");
    } else {
        console.warn("\n⚠️  Could not update app/constants.ts automatically. Please check the file.");
    }
}

main().catch(console.error);
