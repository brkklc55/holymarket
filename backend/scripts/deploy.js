require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Logging
const logFile = path.resolve(__dirname, "../../deploy_debug_final.log");
fs.writeFileSync(logFile, `Deployment Run: ${new Date().toISOString()}\n`);
function log(msg) { console.log(msg); fs.appendFileSync(logFile, msg + "\n"); }

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
    if (!privateKey) throw new Error("No Private Key found");

    const { createWalletClient, http, createPublicClient } = require("viem");
    const { privateKeyToAccount } = require("viem/accounts");
    const { baseSepolia } = require("viem/chains");

    const account = privateKeyToAccount(privateKey);
    log(`Account: ${account.address}`);

    const client = createWalletClient({ account, chain: baseSepolia, transport: http() });
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });

    // 2. Load Artifact
    const artifactPath = path.join(__dirname, "../../prediction-market-artifact.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 3. Deploy
    log("Deploying contract with 3M gas limit...");
    const hash = await client.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        account,
        gas: 5000000n // Force gas limit higher
    });
    log(`Tx Hash: ${hash}`);

    // 4. Wait & Check
    log("Waiting for confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    log(`Block: ${receipt.blockNumber}`);
    log(`Status: ${receipt.status}`);

    if (receipt.status === "reverted") {
        log("CRITICAL: DEPLOYMENT REVERTED");
        process.exit(1);
    }

    log(`SUCCESS. Address: ${receipt.contractAddress}`);
    fs.writeFileSync(path.join(__dirname, "../../deployed-address.txt"), receipt.contractAddress);
}

main().catch(e => {
    log(`ERROR: ${e.message}`);
    process.exit(1);
});
