require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Load Key
    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        const envPath = path.resolve(__dirname, "../.env");
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf8");
            const keyLine = content.split("\n").find(l => l.trim().startsWith("PRIVATE_KEY="));
            if (keyLine) {
                let key = keyLine.split("=")[1].trim().replace(/['"]/g, '');
                if (!key.startsWith("0x")) key = "0x" + key;
                privateKey = key;
            }
        }
    }

    const { createPublicClient, http } = require("viem");
    const { privateKeyToAccount } = require("viem/accounts");
    const { baseSepolia } = require("viem/chains");

    const account = privateKeyToAccount(privateKey);
    const client = createPublicClient({ chain: baseSepolia, transport: http() });

    const artifactPath = path.join(__dirname, "../../prediction-market-artifact.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8")); // compiled with paris

    console.log("Simulating deployment...");
    try {
        const result = await client.call({
            account,
            data: artifact.bytecode,
            gas: 3000000n
        });
        console.log("Simulation Result:", result);
    } catch (e) {
        console.error("SIMULATION ERROR:", e);
    }
}

main().catch(console.error);
