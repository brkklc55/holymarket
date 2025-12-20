require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createWalletClient, http, createPublicClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");

async function main() {
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

    const account = privateKeyToAccount(privateKey);
    console.log("Deploying Raw with:", account.address);

    const client = createWalletClient({ account, chain: baseSepolia, transport: http() });
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });

    const artifactPath = path.join(__dirname, "../../prediction-market-artifact.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 1. Get Nonce
    const nonce = await publicClient.getTransactionCount({ address: account.address });
    console.log("Nonce:", nonce);

    // 2. Send Raw Tx
    console.log("Sending raw construction tx...");
    const hash = await client.sendTransaction({
        account,
        data: artifact.bytecode,
        nonce,
        gas: 5000000n,
        chain: baseSepolia
    });
    console.log("Tx Hash:", hash);

    // 3. Wait
    console.log("Waiting...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Status:", receipt.status);
    console.log("Contract:", receipt.contractAddress);

    if (receipt.status === "reverted") {
        console.error("REVERTED AGAIN.");
        process.exit(1);
    }

    fs.writeFileSync(path.join(__dirname, "../../deployed-address.txt"), receipt.contractAddress);
    fs.writeFileSync(path.join(__dirname, "../../deploy_debug_final.log"), `SUCCESS Raw: ${receipt.contractAddress}`);
}

main().catch(console.error);
