require('dotenv').config(); // Defaults to .env in CWD
const { createWalletClient, http, publicActions, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');

const PREDICTION_MARKET_ADDRESS = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
const PREDICTION_MARKET_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_question", "type": "string" },
            { "internalType": "uint256", "name": "_duration", "type": "uint256" }
        ],
        "name": "createMarket",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "marketCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

async function main() {
    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY not found in .env");
    }
    if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
    }

    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http()
    }).extend(publicActions);

    console.log("Creating market with account:", account.address);

    const question = "Will ETH hit $10k by 2025?";
    const duration = 86400 * 7; // 7 days

    try {
        const hash = await client.writeContract({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'createMarket',
            args: [question, duration]
        });

        console.log("Transaction sent:", hash);
        console.log("Waiting for confirmation...");

        const receipt = await client.waitForTransactionReceipt({ hash });
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        const count = await client.readContract({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'marketCount'
        });

        console.log("Total Markets:", count.toString());
        console.log("New Market ID:", (count - 1n).toString());

    } catch (error) {
        console.error("Error creating market:", error);
    }
}

main();
