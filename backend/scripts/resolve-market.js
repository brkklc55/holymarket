require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");

async function main() {
    console.log("Step 1: Loading private key...");
    if (!process.env.PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY not found in .env");
    }

    console.log("Step 2: Creating account...");
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    console.log("Account:", account.address);

    console.log("Step 3: Creating wallet client...");
    const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http()
    });

    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    console.log("Step 4: Resolving market at:", address);

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

    console.log("Step 5: Sending transaction...");
    const hash = await client.writeContract({
        address,
        abi,
        functionName: "resolveMarket",
        args: [3n, true]
    });

    console.log("✅ Market resolved! Tx:", hash);

    console.log("Step 6: Waiting for confirmation...");
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Confirmed! Status:", receipt.status);
    console.log("Block:", receipt.blockNumber);
}

main().catch((error) => {
    console.error("❌ ERROR:", error.message);
    console.error(error);
    process.exit(1);
});
