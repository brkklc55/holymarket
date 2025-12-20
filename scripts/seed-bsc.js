const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { bscTestnet } = require("viem/chains");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("🌱 Seeding Market on BNB Testnet...");

    let PK = process.env.PRIVATE_KEY;
    if (!PK) {
        const backendEnvPath = path.resolve(__dirname, "../backend/.env");
        if (fs.existsSync(backendEnvPath)) {
            const content = fs.readFileSync(backendEnvPath, "utf8");
            const match = content.match(/PRIVATE_KEY=(.*)/);
            if (match) PK = match[1].trim().replace(/['"]/g, '');
        }
    }

    if (!PK) {
        console.error("❌ PRIVATE_KEY not found.");
        process.exit(1);
    }

    if (!PK.startsWith("0x")) PK = "0x" + PK;
    const account = privateKeyToAccount(PK);

    const transport = http("https://data-seed-prebsc-1-s1.binance.org:8545");
    const walletClient = createWalletClient({ account, chain: bscTestnet, transport });
    const publicClient = createPublicClient({ chain: bscTestnet, transport });

    const contractAddress = fs.readFileSync(path.resolve(__dirname, "../deployed-address.txt"), "utf8").trim();
    console.log("Contract:", contractAddress);

    if (!contractAddress.startsWith("0x")) {
        console.error("❌ Invalid contract address in deployed-address.txt");
        process.exit(1);
    }

    const artifactPath = path.resolve(__dirname, "../prediction-market-artifact.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    console.log("Creating market: 'Will BNB hit $1000 in 2025?'");
    const question = "Will BNB hit $1000 in 2025?";
    const duration = BigInt(60 * 60 * 24 * 30); // 30 days

    const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: "createMarket",
        args: [question, duration],
        account
    });

    console.log("Tx Hash:", hash);
    console.log("Waiting for confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Market created! Status:", receipt.status);
}

main().catch(console.error);
