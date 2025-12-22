require("dotenv").config();
const { createPublicClient, http, getContract } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
    const address = process.argv[2];
    if (!address) {
        throw new Error("Usage: node scripts/check-admin.js <contractAddress>");
    }
    console.log("Checking Admin of:", address);

    const client = createPublicClient({ chain: baseSepolia, transport: http() });

    const abi = [{
        inputs: [],
        name: "admin",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    }];

    const contract = getContract({ address, abi, client });
    try {
        const admin = await contract.read.admin();
        console.log("Contract Admin:", admin);
    } catch (e) {
        console.log("Error reading admin:", e.message);
    }
}

main().catch(console.error);
