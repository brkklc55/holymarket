// Simple resolve script - reads .env manually
const fs = require("fs");
const path = require("path");

// Read .env file
const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");
const privateKeyLine = envContent.split("\n").find(line => line.startsWith("PRIVATE_KEY="));

if (!privateKeyLine) {
    console.error("❌ PRIVATE_KEY not found in .env");
    process.exit(1);
}

const PRIVATE_KEY = privateKeyLine.split("=")[1].trim();
console.log("✅ Private key loaded");
console.log("Key starts with:", PRIVATE_KEY.substring(0, 10) + "...");

// Now import viem
const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");

async function main() {
    console.log("\n🔑 Creating account...");
    const account = privateKeyToAccount(PRIVATE_KEY);
    console.log("Account address:", account.address);

    console.log("\n📡 Creating wallet client...");
    const walletClient = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });

    const contractAddress = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";

    const abi = [{
        inputs: [
            { name: "_marketId", type: "uint256" },
            { name: "_outcome", type: "bool" }
        ],
        name: "resolveMarket",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }];

    console.log("\n🚀 Sending transaction...");
    console.log("Contract:", contractAddress);
    console.log("Market ID: 3");
    console.log("Outcome: YES (true)");

    try {
        const hash = await walletClient.writeContract({
            address: contractAddress,
            abi,
            functionName: "resolveMarket",
            args: [3n, true],
            gas: 500000n
        });

        console.log("\n✅ Transaction sent!");
        console.log("Hash:", hash);
        console.log("View:", `https://sepolia.basescan.org/tx/${hash}`);

        console.log("\n⏳ Waiting for confirmation...");
        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http("https://sepolia.base.org")
        });

        const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            timeout: 60000
        });

        if (receipt.status === "success") {
            console.log("\n🎉 SUCCESS! Market #3 resolved as YES!");
            console.log("Block:", receipt.blockNumber.toString());
        } else {
            console.log("\n❌ Transaction reverted");
        }
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        if (error.message.includes("dropped")) {
            console.log("\n💡 Tip: Base Sepolia is unstable. Try again or switch to mainnet.");
        }
    }
}

main().catch(console.error);
