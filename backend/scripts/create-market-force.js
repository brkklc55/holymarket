require("dotenv").config();
const { createWalletClient, http, createPublicClient, parseGwei } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");

async function main() {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });

    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    console.log("Creating market on:", address);

    const nonce = await publicClient.getTransactionCount({ address: account.address });
    console.log("Nonce:", nonce);

    const abi = [{
        inputs: [{ name: "_question", type: "string" }, { name: "_duration", type: "uint256" }],
        name: "createMarket",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }];

    const hash = await client.writeContract({
        address,
        abi,
        functionName: "createMarket",
        args: ["FLASH TEST: Rain?", 60n], // 60 seconds
        gas: 500000n,
        gasPrice: parseGwei("10"), // Legacy
        nonce
    });

    console.log("Tx:", hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Status:", receipt.status);
    console.log("Block:", receipt.blockNumber);
}

main().catch(console.error);
