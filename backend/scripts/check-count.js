const { createPublicClient, http, getContract } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    const abi = [{
        inputs: [],
        name: "marketCount",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    }];

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    const contract = getContract({ address, abi, client });
    const count = await contract.read.marketCount();
    console.log("Total Markets:", count.toString());
}

main().catch(console.error);
