require("dotenv").config();
const { createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");

async function main() {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http()
    });

    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    console.log("Creating market using:", account.address);

    const abi = [{
        inputs: [
            { name: "_question", type: "string" },
            { name: "_duration", type: "uint256" }
        ],
        name: "createMarket",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }];

    const hash = await client.writeContract({
        address,
        abi,
        functionName: "createMarket",
        args: ["Quick Test: Will it rain?", 120n], // 2 mins
        gas: 500000n
    });

    console.log("Market creation tx:", hash);

    // Receipt checking
    const { createPublicClient } = require("viem");
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Creation confirmed! Block:", receipt.blockNumber);
}

main().catch(console.error);
