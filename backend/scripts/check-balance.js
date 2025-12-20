require("dotenv").config();
const { createPublicClient, http, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");
const fs = require("fs");
const path = require("path");

async function main() {
    // Manually load key like deploy.js
    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        const envPath = path.resolve(__dirname, "../.env");
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf8");
            const lines = content.split(/\r?\n/);
            for (const line of lines) {
                if (line.trim().startsWith("PRIVATE_KEY=")) {
                    let key = line.split("=")[1].trim();
                    key = key.replace(/^["']|["']$/g, '');
                    if (!key.startsWith("0x")) key = "0x" + key;
                    privateKey = key;
                    break;
                }
            }
        }
    }

    if (!privateKey) {
        console.error("No private key found");
        return;
    }

    const account = privateKeyToAccount(privateKey);
    console.log("Account:", account.address);

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    const balance = await client.getBalance({ address: account.address });
    console.log("Balance:", formatEther(balance), "ETH");
}

main().catch(console.error);
