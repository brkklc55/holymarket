const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Step 1: Loading .env file...");

    const envPath = path.join(__dirname, "../.env");
    if (!fs.existsSync(envPath)) {
        throw new Error(".env file not found at: " + envPath);
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    const privateKeyMatch = envContent.match(/PRIVATE_KEY=(.+)/);

    if (!privateKeyMatch) {
        throw new Error("PRIVATE_KEY not found in .env");
    }

    const privateKey = privateKeyMatch[1].trim();
    console.log("✅ Private key loaded");

    console.log("\n🔑 Step 2: Creating account...");
    const account = privateKeyToAccount(privateKey);
    console.log("Account:", account.address);

    console.log("\n📡 Step 3: Creating wallet client...");
    const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });

    const contractAddress = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    console.log("Contract:", contractAddress);

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

    console.log("\n🚀 Step 4: Sending transaction...");
    console.log("Market ID: 3");
    console.log("Outcome: YES (true)");

    const hash = await client.writeContract({
        address: contractAddress,
        abi,
        functionName: "resolveMarket",
        args: [3n, true],
        gas: 500000n
    });

    console.log("\n✅ Transaction sent!");
    console.log("Hash:", hash);
    console.log("View on BaseScan:", `https://sepolia.basescan.org/tx/${hash}`);

    console.log("\n⏳ Waiting for confirmation...");
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log("\n🎉 SUCCESS! Market resolved!");
        console.log("Block:", receipt.blockNumber);
    } else {
        console.log("\n❌ Transaction failed!");
        console.log("Receipt:", receipt);
    }
}

main().catch((error) => {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
    process.exit(1);
});
