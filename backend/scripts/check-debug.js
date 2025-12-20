const { createPublicClient, http, getContract } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    console.log("Checking contract at:", address);

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org")
    });

    const abi = [{
        inputs: [], name: "marketCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function"
    }, {
        inputs: [{ name: "", type: "uint256" }], name: "markets", outputs: [
            { name: "question", type: "string" },
            { name: "endTime", type: "uint256" },
            { name: "yesPool", type: "uint256" },
            { name: "noPool", type: "uint256" },
            { name: "resolved", type: "bool" },
            { name: "outcome", type: "bool" }
        ], stateMutability: "view", type: "function"
    }];

    const contract = getContract({ address, abi, client });

    try {
        const count = await contract.read.marketCount();
        console.log("Market Count:", count);

        for (let i = 1; i <= Number(count); i++) {
            const m = await contract.read.markets([BigInt(i)]);
            console.log(`Market ${i}: Question="${m[0]}" End=${m[1]} Resolved=${m[4]}`);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
