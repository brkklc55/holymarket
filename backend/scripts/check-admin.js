require("dotenv").config();
const { createPublicClient, http, getContract } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Get Private Key & Account
    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        const envPath = path.resolve(__dirname, "../.env");
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf8");
            const lines = content.split(/\r?\n/);
            for (const line of lines) {
                if (line.trim().startsWith("PRIVATE_KEY=")) {
                    let key = line.split("=")[1].trim().replace(/['"]/g, '');
                    if (!key.startsWith("0x")) key = "0x" + key;
                    privateKey = key;
                    break;
                }
            }
        }
    }
    const account = privateKeyToAccount(privateKey);
    console.log("My Account:", account.address);

    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
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
        console.log("Match:", admin === account.address);
    } catch (e) {
        console.log("Error reading admin:", e.message);
    }
}

main().catch(console.error);
