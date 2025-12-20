const { createPublicClient, http } = require("viem");
const { bscTestnet } = require("viem/chains");

const PREDICTION_MARKET_ADDRESS = "0x018d244417345e440d6eb59fc81e42d0713826c7";
const PREDICTION_MARKET_ABI = [
    {
        "inputs": [],
        "name": "admin",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "markets",
        "outputs": [
            { "internalType": "string", "name": "question", "type": "string" },
            { "internalType": "uint256", "name": "endTime", "type": "uint256" },
            { "internalType": "uint256", "name": "yesPool", "type": "uint256" },
            { "internalType": "uint256", "name": "noPool", "type": "uint256" },
            { "internalType": "bool", "name": "resolved", "type": "bool" },
            { "internalType": "bool", "name": "outcome", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

async function checkStatus() {
    try {
        const admin = await publicClient.readContract({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: "admin",
        });
        console.log("Contract Admin:", admin);

        const marketId = 1n;
        const market = await publicClient.readContract({
            address: PREDICTION_MARKET_ADDRESS,
            abi: PREDICTION_MARKET_ABI,
            functionName: "markets",
            args: [marketId],
        });

        console.log(`Market ${marketId} Info:`);
        console.log("Question:", market[0]);
        console.log("End Time (sec):", market[1]);
        const currentTime = Math.floor(Date.now() / 1000);
        console.log("Current Time (sec):", currentTime);
        console.log("Difference (sec):", Number(market[1]) - currentTime);
        console.log("Is Resolved:", market[4]);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkStatus();
