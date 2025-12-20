const fs = require("fs");
const path = require("path");

// Read .env manually
const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");
const privateKeyLine = envContent.split("\n").find(line => line.startsWith("PRIVATE_KEY="));
const PRIVATE_KEY = privateKeyLine.split("=")[1].trim();

const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");

async function main() {
    console.log("🚀 Deploying SimplePredictionMarket...\n");

    const account = privateKeyToAccount(PRIVATE_KEY);
    console.log("Deployer:", account.address);

    const artifactPath = path.join(__dirname, "../../simple-prediction-market-artifact.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const walletClient = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });

    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });

    // Fee collector = deployer address
    const feeCollector = account.address;

    console.log("Fee Collector:", feeCollector);
    console.log("\nDeploying contract...");

    const hash = await walletClient.deployContract({
        abi: artifact.abi,
        bytecode: `0x${artifact.bytecode}`,
        args: [feeCollector],
        gas: 3000000n
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...\n");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log("✅ SUCCESS!");
        console.log("Contract Address:", receipt.contractAddress);
        console.log("Block:", receipt.blockNumber.toString());
        console.log("\nView on BaseScan:");
        console.log(`https://sepolia.basescan.org/address/${receipt.contractAddress}`);

        // Save address
        const configPath = path.join(__dirname, "../../deployed-address.txt");
        fs.writeFileSync(configPath, receipt.contractAddress);
        console.log("\n✅ Address saved to deployed-address.txt");
    } else {
        console.log("❌ Deployment failed");
    }
}

main().catch(console.error);
